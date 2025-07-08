import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { sprintf } from "sprintf-js";

class LLM {
  constructor(options = {}) {
    this.endpoint = options.endpoint || 'http://localhost:11434';
    this.defaultModel = options.defaultModel || 'romi';
    this.model = options.model || this.defaultModel;
    this.system = options.system || null;
    this.format = options.format || null;
    this.temperature = options.temperature || 0.7;
    this.maxTokens = options.maxTokens || 4096;
    this.contextWindow = options.contextWindow || 32768;
    this.supportsToolCalling = options.supportsToolCalling || false;
    
    this.mcpUrl = options.mcpUrl || null;
    this.mcpClient = null;
    this.mcpTransport = null;
    this.mcpConnected = false;
    this.mcpTools = [];
    this.mcpResources = [];
    this.mcpPrompts = [];
    this.mcpInitialized = false;
    
    this.conversationHistory = [];
    this.tools = {};
    this.availableModels = [];
    
    this.onMcpConnect = options.onMcpConnect || (() => {});
    this.onMcpDisconnect = options.onMcpDisconnect || (() => {});
    this.onMcpError = options.onMcpError || (() => {});
    this.onToolCall = options.onToolCall || (() => {});
    this.onToolResult = options.onToolResult || (() => {});
    
    this.initPromise = this.initialize();
  }

  async initialize() {
    if (this.mcpUrl) {
      await this.initializeMCP();
    }
    this.mcpInitialized = true;
    return this;
  }

  async waitForInit() {
    await this.initPromise;
    return this;
  }

  async initializeMCP() {
    try {
      this.mcpTransport = new StreamableHTTPClientTransport(new URL(this.mcpUrl));
      this.mcpClient = new Client({
        name: "llm-mcp-agent",
        version: "1.0.0"
      });

      await this.mcpClient.connect(this.mcpTransport);
      this.mcpConnected = true;
      
      await this.loadMcpCapabilities();
      this.onMcpConnect();
      
    } catch (error) {
      this.mcpConnected = false;
      this.onMcpError(error);
      throw error;
    }
  }

  async loadMcpCapabilities() {
    if (!this.mcpClient) return;

    try {
      const toolsResponse = await this.mcpClient.listTools();
      this.mcpTools = toolsResponse.tools || [];
      
      this.mcpTools.forEach(tool => {
        this.tools[tool.name] = {
          name: tool.name,
          description: tool.description || '',
          parameters: tool.inputSchema || { type: 'object', properties: {} },
          handler: async (args) => await this.callMcpTool(tool.name, args),
          source: 'mcp'
        };
      });

      try {
        const resourcesResponse = await this.mcpClient.listResources();
        this.mcpResources = resourcesResponse.resources || [];
      } catch (error) {
        console.log('No resources available:', error.message);
      }

      try {
        const promptsResponse = await this.mcpClient.listPrompts();
        this.mcpPrompts = promptsResponse.prompts || [];
      } catch (error) {
        console.log('No prompts available:', error.message);
      }

    } catch (error) {
      console.error('Failed to load MCP capabilities:', error);
    }
  }

  async callMcpTool(toolName, args = {}) {
    if (!this.mcpClient || !this.mcpConnected) {
      throw new Error('MCP not connected');
    }

    try {
      this.onToolCall(toolName, args);
      
      const result = await this.mcpClient.callTool({
        name: toolName,
        arguments: args
      });
      
      const content = result.content?.[0]?.text || JSON.stringify(result);
      this.onToolResult(toolName, content);
      
      return content;
    } catch (error) {
      console.error(`MCP tool call failed for ${toolName}:`, error);
      throw error;
    }
  }

  compressToolSchema(schema) {
    const clean = (obj) => {
      if (Array.isArray(obj)) return obj.map(clean);
      if (typeof obj !== 'object' || obj === null) return obj;
      
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === '$schema' || key === 'additionalProperties') continue;
        if (key === 'type' && value === 'object' && Object.keys(obj).length === 1) continue;
        if (key === 'default') continue;
        cleaned[key] = clean(value);
      }
      return cleaned;
    };
    return clean(schema);
  }

  generateToolCallingPrompt(tools) {
    const compressedTools = tools.map(tool => {
      const compressed = {
        name: tool.name,
        desc: tool.description
      };
      
      const params = this.compressToolSchema(tool.parameters);
      if (params.properties && Object.keys(params.properties).length > 0) {
        compressed.params = params.properties;
        if (params.required) compressed.req = params.required;
      }
      
      return compressed;
    });

    // return `\n\nIMPORTANT: When using tools, respond ONLY with JSON format:\n{"tool_calls":[{"name":"tool_name","arguments":{"param":"value"}}]}\n\nExample: {"tool_calls":[{"name":"take_screenshot","arguments":{"url":"https://example.com","full_page":true}}]}\n\nDo NOT add any other text or explanation when using tools.`;
    return sprintf(`You're an AI assistant with tool capabilities. Access tools from Tools array only when tasks require them.\n\nTools: %s\n\nFirst: Can you answer with existing knowledge? If yes, respond normally.\nIf no: Use tools via JSON only:\n{"tool_calls":[{"name":"tool_name","arguments":{"param":"value", ...}}]}\n\nRules: exact names, required params, relevant tools only.`, JSON.stringify(compressedTools));
    }

  parseToolCalls(response) {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      
      const toolCallPattern = /\{[\s\S]*?"tool_calls"[\s\S]*?\[[\s\S]*?\][\s\S]*?\}/;
      const match = cleanResponse.match(toolCallPattern);
      
      if (!match) return null;
      
      console.log(match[0])

      try {
        const parsed = JSON.parse(match[0]);
        return parsed.tool_calls || null;
      } catch (error) {
        try {
          const startIndex = cleanResponse.indexOf('{"tool_calls"');
          if (startIndex === -1) return null;
          
          let braceCount = 0;
          let endIndex = startIndex;
          
          for (let i = startIndex; i < cleanResponse.length; i++) {
            if (cleanResponse[i] === '{') braceCount++;
            if (cleanResponse[i] === '}') braceCount--;
            if (braceCount === 0) {
              endIndex = i;
              break;
            }
          }
          
          const jsonStr = cleanResponse.substring(startIndex, endIndex + 1);
          const parsed = JSON.parse(jsonStr);
          return parsed.tool_calls || null;
        } catch (e) {
          return null;
        }
      }
  }

  async ask(input, options = {}) {
    if (!this.mcpInitialized) {
      await this.waitForInit();
    }

    const messages = Array.isArray(input) ? input : [{ role: 'user', content: input }];
    const stream = options.stream || false;
    const model = options.model || this.model;
    const includeHistory = options.includeHistory !== false;
    const useTools = options.useTools !== false;

    try {
      let conversationMessages = [];
      
      if (includeHistory && this.conversationHistory.length > 0) {
        conversationMessages.push(...this.conversationHistory);
      }
      
      conversationMessages.push(...messages);
      
      if (this.system) {
        conversationMessages.unshift({ role: 'system', content: this.system });
      }
      
      conversationMessages = this.trimMessages(conversationMessages, this.contextWindow);

      const result = await this.generateResponse(conversationMessages, {
        model,
        stream,
        useTools,
        ...options
      });

      if (stream) {
        return result;
      }

      if (this.supportsToolCalling) {
        if (result.message?.function_call || result.message?.tool_calls) {
          const toolCalls = result.message.tool_calls || [result.message.function_call];
          
          for (const toolCall of toolCalls) {
            try {
              const toolName = toolCall.function?.name || toolCall.name;
              const toolArgs = typeof toolCall.function?.arguments === 'string' 
                ? JSON.parse(toolCall.function.arguments) 
                : toolCall.function?.arguments || toolCall.arguments || {};
              
              const toolResult = await this.executeTool(toolName, toolArgs);
              
              conversationMessages.push(result.message);
              conversationMessages.push({
                role: 'tool',
                name: toolName,
                content: toolResult
              });
              
              const finalResult = await this.generateResponse(conversationMessages, {
                model,
                stream: false,
                useTools: false,
                ...options
              });
              
              if (includeHistory) {
                this.conversationHistory.push(...messages);
                this.conversationHistory.push(result.message);
                this.conversationHistory.push({ role: 'tool', name: toolName, content: toolResult });
                this.conversationHistory.push(finalResult.message);
              }
              
              return finalResult;
            } catch (error) {
              console.error('Tool execution error:', error);
            }
          }
        }
      } else {
        const toolCalls = this.parseToolCalls(result.message.content);
        
        if (toolCalls && toolCalls.length > 0) {
          let toolResults = [];
          
          for (const toolCall of toolCalls) {
            try {
              const toolResult = await this.executeTool(toolCall.name, toolCall.arguments);
              toolResults.push(`${toolCall.name}: ${toolResult}`);
            } catch (error) {
              toolResults.push(`${toolCall.name}: Error - ${error.message}`);
            }
          }
          
          conversationMessages.push({ role: 'assistant', content: result.message.content });
          conversationMessages.push({ 
            role: 'user', 
            content: `Results: ${toolResults.join('; ')}. Provide a helpful response based on these results.` 
          });
          
          const finalResult = await this.generateResponse(conversationMessages, {
            model,
            stream: false,
            useTools: false,
            ...options
          });
          
          if (includeHistory) {
            this.conversationHistory.push(...messages);
            this.conversationHistory.push(result.message);
            this.conversationHistory.push({ role: 'user', content: `Results: ${toolResults.join('; ')}` });
            this.conversationHistory.push(finalResult.message);
          }
          
          return finalResult;
        }
      }

      if (includeHistory) {
        this.conversationHistory.push(...messages);
        this.conversationHistory.push(result.message);
      }

      return result;
    } catch (error) {
      console.error('LLM ask error:', error);
      throw error;
    }
  }

  async generateResponse(messages, options = {}) {
    // return {message: {content: '{"tool_calls":[{"name":"wa_get_chat_members","arguments":{"chatId":{"type":"string","content":"1234567890"}}}]}'}};
    
    const {
      model = this.model,
      stream = false,
      useTools = true,
      temperature = this.temperature,
      maxTokens = this.maxTokens
    } = options;

    let finalMessages = [...messages];

    const requestBody = {
      model,
      messages: finalMessages,
      stream,
      options: {
        temperature,
        num_predict: maxTokens
      }
    };

    if (this.supportsToolCalling) {
      if (useTools && Object.keys(this.tools).length > 0) {
        requestBody.tools = Object.values(this.tools).map(tool => ({
          type: "function",
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          }
        }));
      }
    } else {
      if (useTools && Object.keys(this.tools).length > 0) {
        const toolsForPrompt = Object.values(this.tools).map(tool => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        }));
        
        const toolPrompt = this.generateToolCallingPrompt(toolsForPrompt);
        
        const systemIndex = finalMessages.findIndex(msg => msg.role === 'system');
        if (systemIndex !== -1) {
          finalMessages[systemIndex] = {
            role: 'system',
            content: finalMessages[systemIndex].content + '\n\n' + toolPrompt
          };
        } else {
          finalMessages.unshift({role: 'system', content: toolPrompt});
        }
        
        requestBody.messages = finalMessages;
      }
    }

    if (this.format) {
      requestBody.format = this.format;
    }

    return await fetch('/v1/completions', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        message: requestBody.messages.map(i => `ROLE: ${i.role.toUpperCase()}\n\n${i.content}`).join('\n\n\n')
      }),
    }).then(res => res.json());
    // const response = await fetch(`${this.endpoint}/api/chat`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(requestBody),
    // });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    if (stream) {
      return this.handleStreamResponse(response);
    }

    const data = await response.json();
    return data;
  }

  async *handleStreamResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              yield data;
            } catch (error) {
              console.warn('Failed to parse streaming response:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async executeTool(toolName, args = {}) {
    if (!this.tools[toolName]) {
      throw new Error(`Tool ${toolName} not found`);
    }

    const tool = this.tools[toolName];
    return await tool.handler(args);
  }

  trimMessages(messages, maxTokens) {
    const estimateTokens = (text) => Math.ceil(text.length / 4);
    
    let totalTokens = 0;
    const trimmed = [];
    
    if (messages[0]?.role === 'system') {
      trimmed.push(messages[0]);
      totalTokens += estimateTokens(messages[0].content);
    }
    
    for (let i = messages.length - 1; i >= (messages[0]?.role === 'system' ? 1 : 0); i--) {
      const message = messages[i];
      const tokens = estimateTokens(JSON.stringify(message));
      
      if (totalTokens + tokens > maxTokens) break;
      
      trimmed.unshift(message);
      totalTokens += tokens;
    }
    
    return trimmed;
  }

  addTool(name, description, parameters, handler) {
    this.tools[name] = {
      name,
      description,
      parameters,
      handler,
      source: 'manual'
    };
  }

  removeTool(name) {
    delete this.tools[name];
  }

  setSystem(systemPrompt) {
    this.system = systemPrompt;
  }

  setModel(model) {
    this.model = model;
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getHistory() {
    return [...this.conversationHistory];
  }

  isMcpConnected() {
    return this.mcpConnected;
  }

  getMcpTools() {
    return this.mcpTools;
  }

  getMcpResources() {
    return this.mcpResources;
  }

  async chat(message, options = {}) {
    return await this.ask(message, { includeHistory: true, ...options });
  }

  async oneShot(message, options = {}) {
    return await this.ask(message, { includeHistory: false, ...options });
  }

  async disconnect() {
    if (this.mcpClient) {
      try {
        await this.mcpClient.close();
        this.mcpConnected = false;
        this.onMcpDisconnect();
      } catch (error) {
        console.warn('Error disconnecting MCP:', error);
      }
    }
  }
}

export default LLM;

// now give me a react component using lucid icons and tailwindcss (xpo_ prefix) for this and make a chat application with tool calling implemented. I meant when tools calling identified so below the tool calling block will show  [approve][deny] buttons for each function so allow calling finction. after allowing will execute the function and after all executing will submit llm for result. ah it very common right? like cursor and vscode copilot or claude desktop application. i want similar chat application using this llm