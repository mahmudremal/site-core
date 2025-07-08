import React, { useState, useEffect, useRef } from 'react';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Settings, 
  Trash2, 
  Send, 
  PenTool, 
  FileText, 
  AlertCircle, 
  Clock, 
  Zap,
  Database
} from 'lucide-react';

const MCPClient = () => {
  const [client, setClient] = useState(null);
  const [transport, setTransport] = useState(null);
  const [connected, setConnected] = useState(false);
  const [tools, setTools] = useState([]);
  const [resources, setResources] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastError, setLastError] = useState(null);
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [toolsLastUpdated, setToolsLastUpdated] = useState(null);
  const [resourcesLastUpdated, setResourcesLastUpdated] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolArgs, setToolArgs] = useState('{}');

  const messagesEndRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const toolsPollingRef = useRef(null);
  const resourcesPollingRef = useRef(null);

  const maxReconnectAttempts = 10;
  const reconnectDelays = [1000, 2000, 5000, 10000, 20000, 30000];
  const toolsPollingInterval = 30000;
  const resourcesPollingInterval = 30000;

  useEffect(() => {
    initializeMCP();
    return () => cleanup();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cleanup = () => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (toolsPollingRef.current) clearInterval(toolsPollingRef.current);
    if (resourcesPollingRef.current) clearInterval(resourcesPollingRef.current);
    
    if (client) {
      client.close().catch(console.error);
    }
  };

  const initializeMCP = async () => {
    try {
      const mcpTransport = new StreamableHTTPClientTransport(
        new URL("http://localhost:3000/mcp")
      );
      
      const mcpClient = new Client({
        name: "banglee-mcp-client",
        version: "1.0.0"
      });

      await mcpClient.connect(mcpTransport);
      
      setClient(mcpClient);
      setTransport(mcpTransport);
      setConnected(true);
      setConnectionAttempts(0);
      setLastError(null);
      setReconnecting(false);
      
      await loadInitialData(mcpClient);
      startPeriodicUpdates(mcpClient);
      
      addMessage('system', 'Connected to Banglee MCP server');
    } catch (error) {
      console.error('MCP connection failed:', error);
      setLastError(error.message);
      setConnected(false);
      addMessage('system', `Connection failed: ${error.message}`);
      
      if (autoReconnect) {
        scheduleReconnect();
      }
    }
  };

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, {
      role,
      content,
      timestamp: new Date()
    }]);
  };

  const loadInitialData = async (mcpClient) => {
    try {
      // Load tools
      try {
        const toolsResponse = await mcpClient.listTools();
        console.log(toolsResponse)
        const toolsData = toolsResponse.tools || [];
        setTools(toolsData);
        setToolsLastUpdated(new Date());
      } catch (error) {
        console.log('No tools available or error loading tools:', error.message);
        setTools([]);
      }

      // Load resources
      try {
        const resourcesResponse = await mcpClient.listResources();
        const resourcesData = resourcesResponse.resources || [];
        setResources(resourcesData);
        setResourcesLastUpdated(new Date());
      } catch (error) {
        console.log('No resources available or error loading resources:', error.message);
        setResources([]);
      }

      // Load prompts
      try {
        const promptsResponse = await mcpClient.listPrompts();
        const promptsData = promptsResponse.prompts || [];
        setPrompts(promptsData);
      } catch (error) {
        console.log('No prompts available or error loading prompts:', error.message);
        setPrompts([]);
      }
      
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setLastError(error.message);
    }
  };

  const scheduleReconnect = () => {
    if (connectionAttempts >= maxReconnectAttempts) {
      setReconnecting(false);
      addMessage('system', 'Maximum reconnection attempts reached');
      return;
    }

    setReconnecting(true);
    const delay = reconnectDelays[Math.min(connectionAttempts, reconnectDelays.length - 1)];
    
    addMessage('system', `Reconnecting in ${delay}ms... (attempt ${connectionAttempts + 1}/${maxReconnectAttempts})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      setConnectionAttempts(prev => prev + 1);
      initializeMCP();
    }, delay);
  };

  const startPeriodicUpdates = (mcpClient) => {
    toolsPollingRef.current = setInterval(async () => {
      try {
        const toolsResponse = await mcpClient.listTools();
        const newTools = toolsResponse.tools || [];
        
        if (JSON.stringify(newTools) !== JSON.stringify(tools)) {
          setTools(newTools);
          setToolsLastUpdated(new Date());
          addMessage('system', 'Tools list updated');
        }
      } catch (error) {
        console.log('Tools polling error:', error.message);
      }
    }, toolsPollingInterval);

    resourcesPollingRef.current = setInterval(async () => {
      try {
        const resourcesResponse = await mcpClient.listResources();
        const newResources = resourcesResponse.resources || [];
        
        if (JSON.stringify(newResources) !== JSON.stringify(resources)) {
          setResources(newResources);
          setResourcesLastUpdated(new Date());
          addMessage('system', 'Resources list updated');
        }
      } catch (error) {
        console.log('Resources polling error:', error.message);
      }
    }, resourcesPollingInterval);
  };

  const handleConnectionError = (error) => {
    console.error('Connection error:', error);
    setConnected(false);
    setLastError(error.message);
    cleanup();
    addMessage('system', `Connection lost: ${error.message}`);
    
    if (autoReconnect) {
      scheduleReconnect();
    }
  };

  const forceReconnect = () => {
    setConnectionAttempts(0);
    cleanup();
    addMessage('system', 'Manual reconnection initiated');
    initializeMCP();
  };

  const refreshTools = async () => {
    if (!client) return;
    
    try {
      const toolsResponse = await client.listTools();
      const newTools = toolsResponse.tools || [];
      setTools(newTools);
      setToolsLastUpdated(new Date());
      addMessage('system', 'Tools refreshed');
    } catch (error) {
      handleConnectionError(error);
    }
  };

  const refreshResources = async () => {
    if (!client) return;
    
    try {
      const resourcesResponse = await client.listResources();
      const newResources = resourcesResponse.resources || [];
      setResources(newResources);
      setResourcesLastUpdated(new Date());
      addMessage('system', 'Resources refreshed');
    } catch (error) {
      console.log('Resources refresh error:', error.message);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !client || tools.length === 0) return;
    
    setLoading(true);
    addMessage('user', input);
    
    try {
      // Try to call the first available tool as a test
      const firstTool = tools[0];
      if (firstTool) {
        const result = await client.callTool({
          name: firstTool.name,
          arguments: { text: input }
        });
        
        const content = result.content?.[0]?.text || JSON.stringify(result);
        addMessage('assistant', content);
      } else {
        addMessage('assistant', 'No tools available to process your message');
      }
    } catch (error) {
      addMessage('assistant', `Error: ${error.message}`);
      handleConnectionError(error);
    }
    
    setInput('');
    setLoading(false);
  };

  const callTool = async (toolName, args = {}) => {
    if (!client) return;
    
    setLoading(true);
    addMessage('tool-call', `Calling ${toolName} with args: ${JSON.stringify(args)}`);
    
    try {
      const result = await client.callTool({
        name: toolName,
        arguments: args
      });
      
      const content = result.content?.[0]?.text || JSON.stringify(result);
      addMessage('tool', content);
    } catch (error) {
      addMessage('tool', `Tool error: ${error.message}`);
      handleConnectionError(error);
    }
    setLoading(false);
  };

  const callToolWithArgs = async () => {
    if (!selectedTool) return;
    
    try {
      const args = JSON.parse(toolArgs);
      await callTool(selectedTool.name, args);
      setSelectedTool(null);
      setToolArgs('{}');
    } catch (error) {
      setLastError('Invalid JSON in tool arguments');
      addMessage('system', 'Invalid JSON in tool arguments');
    }
  };

  const readResource = async (uri) => {
    if (!client) return;
    
    setLoading(true);
    addMessage('resource-call', `Reading resource: ${uri}`);
    
    try {
      const result = await client.readResource({ uri });
      const content = result.contents?.[0]?.text || JSON.stringify(result);
      addMessage('resource', content);
    } catch (error) {
      addMessage('resource', `Resource error: ${error.message}`);
      handleConnectionError(error);
    }
    setLoading(false);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const getConnectionStatus = () => {
    if (connected) return 'Connected';
    if (reconnecting) return `Reconnecting (${connectionAttempts}/${maxReconnectAttempts})`;
    return 'Disconnected';
  };

  const getMessageIcon = (role) => {
    switch (role) {
      case 'user': return <Send className="xpo_w-4 xpo_h-4 xpo_text-blue-500" />;
      case 'assistant': return <Zap className="xpo_w-4 xpo_h-4 xpo_text-green-500" />;
      case 'tool': return <PenTool className="xpo_w-4 xpo_h-4 xpo_text-purple-500" />;
      case 'tool-call': return <RefreshCw className="xpo_w-4 xpo_h-4 xpo_text-orange-500" />;
      case 'resource': return <Database className="xpo_w-4 xpo_h-4 xpo_text-cyan-500" />;
      case 'resource-call': return <FileText className="xpo_w-4 xpo_h-4 xpo_text-indigo-500" />;
      case 'system': return <Settings className="xpo_w-4 xpo_h-4 xpo_text-gray-500" />;
      default: return <AlertCircle className="xpo_w-4 xpo_h-4 xpo_text-gray-500" />;
    }
  };

  return (
    <div className="xpo_min-h-screen xpo_bg-gray-50 xpo_flex xpo_flex-col">
      <div className="xpo_bg-white xpo_border-b xpo_border-gray-200 xpo_p-4">
        <div className="xpo_flex xpo_items-center xpo_justify-between">
          <div className="xpo_flex xpo_items-center xpo_space-x-4">
            <div className="xpo_flex xpo_items-center xpo_space-x-2">
              {connected ? (
                <Wifi className="xpo_w-5 xpo_h-5 xpo_text-green-500" />
              ) : (
                <WifiOff className="xpo_w-5 xpo_h-5 xpo_text-red-500" />
              )}
              <span className={`xpo_text-sm xpo_font-medium ${connected ? 'xpo_text-green-700' : 'xpo_text-red-700'}`}>
                {getConnectionStatus()}
              </span>
            </div>
            
            {lastError && (
              <div className="xpo_flex xpo_items-center xpo_space-x-2 xpo_text-sm xpo_text-red-600">
                <AlertCircle className="xpo_w-4 xpo_h-4" />
                <span className="xpo_truncate xpo_max-w-xs">{lastError}</span>
              </div>
            )}
          </div>
          
          <div className="xpo_flex xpo_items-center xpo_space-x-2">
            <button
              onClick={forceReconnect}
              disabled={loading}
              className="xpo_flex xpo_items-center xpo_space-x-2 xpo_px-3 xpo_py-1 xpo_text-sm xpo_bg-blue-500 xpo_text-white xpo_rounded-md hover:xpo_bg-blue-600 disabled:xpo_opacity-50"
            >
              <RefreshCw className="xpo_w-4 xpo_h-4" />
              <span>Reconnect</span>
            </button>
            
            <button
              onClick={() => setAutoReconnect(!autoReconnect)}
              className={`xpo_flex xpo_items-center xpo_space-x-2 xpo_px-3 xpo_py-1 xpo_text-sm xpo_rounded-md ${
                autoReconnect ? 'xpo_bg-green-500 hover:xpo_bg-green-600 xpo_text-white' : 'xpo_bg-gray-200 xpo_text-gray-700'
              }`}
            >
              <Settings className="xpo_w-4 xpo_h-4" />
              <span>Auto-reconnect</span>
            </button>
            
            <button
              onClick={clearMessages}
              className="xpo_flex xpo_items-center xpo_space-x-2 xpo_px-3 xpo_py-1 xpo_text-sm xpo_bg-red-500 xpo_text-white xpo_rounded-md hover:xpo_bg-red-600"
            >
              <Trash2 className="xpo_w-4 xpo_h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      <div className="xpo_flex xpo_flex-1 xpo_overflow-hidden">
        <div className="xpo_w-1/3 xpo_bg-white xpo_border-r xpo_border-gray-200 xpo_flex xpo_flex-col">
          <div className="xpo_p-4 xpo_border-b xpo_border-gray-200">
            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-3">
              <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900 xpo_flex xpo_items-center xpo_space-x-2">
                <PenTool className="xpo_w-5 xpo_h-5" />
                <span>Tools ({tools.length})</span>
              </h3>
              <button
                onClick={refreshTools}
                disabled={loading}
                className="xpo_p-1 xpo_text-gray-500 hover:xpo_text-gray-700 disabled:xpo_opacity-50"
              >
                <RefreshCw className="xpo_w-4 xpo_h-4" />
              </button>
            </div>
            
            {toolsLastUpdated && (
              <div className="xpo_flex xpo_items-center xpo_space-x-1 xpo_text-xs xpo_text-gray-500">
                <Clock className="xpo_w-3 xpo_h-3" />
                <span>Updated: {toolsLastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
          
          <div className="xpo_flex-1 xpo_overflow-y-auto xpo_p-4 xpo_space-y-2">
            {tools.map(tool => (
              <div key={tool.name} className="xpo_border xpo_border-gray-200 xpo_rounded-lg xpo_p-3 hover:xpo_bg-gray-50">
                <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-2">
                  <h4 className="xpo_font-medium xpo_text-gray-900">{tool.name}</h4>
                  <button
                    onClick={() => setSelectedTool(tool)}
                    className="xpo_text-xs xpo_px-2 xpo_py-1 xpo_bg-blue-100 xpo_text-blue-700 xpo_rounded"
                  >
                    Configure
                  </button>
                </div>
                {tool.description && (
                  <p className="xpo_text-sm xpo_text-gray-600 xpo_mb-2">{tool.description}</p>
                )}
                <button
                  onClick={() => callTool(tool.name)}
                  disabled={loading || !connected}
                  className="xpo_w-full xpo_py-2 xpo_px-3 xpo_text-sm xpo_bg-blue-500 xpo_text-white xpo_rounded-md hover:xpo_bg-blue-600 disabled:xpo_opacity-50"
                >
                  Execute
                </button>
              </div>
            ))}
          </div>
          
          <div className="xpo_p-4 xpo_border-t xpo_border-gray-200">
            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-3">
              <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900 xpo_flex xpo_items-center xpo_space-x-2">
                <FileText className="xpo_w-5 xpo_h-5" />
                <span>Resources ({resources.length})</span>
              </h3>
              <button
                onClick={refreshResources}
                disabled={loading}
                className="xpo_p-1 xpo_text-gray-500 hover:xpo_text-gray-700 disabled:xpo_opacity-50"
              >
                <RefreshCw className="xpo_w-4 xpo_h-4" />
              </button>
            </div>
            
            {resourcesLastUpdated && (
              <div className="xpo_flex xpo_items-center xpo_space-x-1 xpo_text-xs xpo_text-gray-500 xpo_mb-3">
                <Clock className="xpo_w-3 xpo_h-3" />
                <span>Updated: {resourcesLastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
            
            <div className="xpo_max-h-32 xpo_overflow-y-auto xpo_space-y-1">
              {resources.map(resource => (
                <button
                  key={resource.uri}
                  onClick={() => readResource(resource.uri)}
                  disabled={loading || !connected}
                  className="xpo_w-full xpo_p-2 xpo_text-left xpo_text-sm xpo_bg-gray-100 xpo_text-gray-700 xpo_rounded hover:xpo_bg-gray-200 disabled:xpo_opacity-50"
                >
                  {resource.name || resource.uri}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="xpo_flex-1 xpo_flex xpo_flex-col">
          <div className="xpo_flex-1 xpo_overflow-y-auto xpo_p-4 xpo_space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="xpo_flex xpo_space-x-3">
                <div className="xpo_flex-shrink-0">
                  {getMessageIcon(msg.role)}
                </div>
                <div className="xpo_flex-1 xpo_min-w-0">
                  <div className="xpo_flex xpo_items-center xpo_space-x-2 xpo_mb-1">
                    <span className="xpo_text-sm xpo_font-medium xpo_text-gray-900 xpo_capitalize">
                      {msg.role.replace('-', ' ')}
                    </span>
                    <span className="xpo_text-xs xpo_text-gray-500">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="xpo_text-sm xpo_text-gray-700 xpo_bg-gray-50 xpo_rounded-lg xpo_p-3">
                    <pre className="xpo_whitespace-pre-wrap xpo_break-words">{msg.content}</pre>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="xpo_border-t xpo_border-gray-200 xpo_p-4">
            <div className="xpo_flex xpo_space-x-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                disabled={loading || !connected}
                className="xpo_flex-1 xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 disabled:xpo_opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim() || !connected}
                className="xpo_flex xpo_items-center xpo_space-x-2 xpo_px-4 xpo_py-2 xpo_bg-blue-500 xpo_text-white xpo_rounded-lg hover:xpo_bg-blue-600 disabled:xpo_opacity-50"
              >
                <Send className="xpo_w-4 xpo_h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedTool && (
        <div className="xpo_fixed xpo_inset-0 xpo_bg-black xpo_bg-opacity-50 xpo_flex xpo_items-center xpo_justify-center xpo_p-4">
          <div className="xpo_bg-white xpo_rounded-lg xpo_p-6 xpo_max-w-md xpo_w-full">
            <h3 className="xpo_text-lg xpo_font-semibold xpo_text-gray-900 xpo_mb-4">
              Configure Tool: {selectedTool.name}
            </h3>
            
            {selectedTool.description && (
              <p className="xpo_text-sm xpo_text-gray-600 xpo_mb-4">{selectedTool.description}</p>
            )}
            
            <div className="xpo_mb-4">
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                Arguments (JSON)
              </label>
              <textarea
                value={toolArgs}
                onChange={(e) => setToolArgs(e.target.value)}
                className="xpo_w-full xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500"
                rows="4"
                placeholder='{"arg1": "value1", "arg2": "value2"}'
              />
            </div>
            
            <div className="xpo_flex xpo_space-x-3">
              <button
                onClick={() => setSelectedTool(null)}
                className="xpo_flex-1 xpo_px-4 xpo_py-2 xpo_text-gray-700 xpo_bg-gray-200 xpo_rounded-lg hover:xpo_bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={callToolWithArgs}
                disabled={loading}
                className="xpo_flex-1 xpo_px-4 xpo_py-2 xpo_bg-blue-500 xpo_text-white xpo_rounded-lg hover:xpo_bg-blue-600 disabled:xpo_opacity-50"
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCPClient;