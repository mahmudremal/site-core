import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Settings, 
  Trash2, 
  Check, 
  X, 
  Play, 
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  PenTool
} from 'lucide-react';
import LLM from './LLM';
import Client from './sider';

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [llm, setLlm] = useState(null);
  const [pendingToolCalls, setPendingToolCalls] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    mcpUrl: 'http://localhost:3000/mcp',
    endpoint: 'http://localhost:11434',
    model: 'romi',
    temperature: 0.7,
    maxTokens: 4096
  });
  const [isConnected, setIsConnected] = useState(false);
  const [expandedTools, setExpandedTools] = useState({});
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    initializeLLM();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    window.llmc = new Client();
    // return () => window.llmc = llmc;
  }, []);
  

  const initializeLLM = async () => {
    try {
      const llmInstance = new LLM({
        endpoint: settings.endpoint,
        model: settings.model,
        mcpUrl: settings.mcpUrl,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        supportsToolCalling: false,
        onMcpConnect: () => {
          setIsConnected(true);
          addSystemMessage('MCP connected successfully');
        },
        onMcpDisconnect: () => {
          setIsConnected(false);
          addSystemMessage('MCP disconnected');
        },
        onMcpError: (error) => {
          addSystemMessage(`MCP error: ${error.message}`, 'error');
        }
      });
      
      await llmInstance.waitForInit();
      setLlm(llmInstance);
    } catch (error) {
      addSystemMessage(`Failed to initialize LLM: ${error.message}`, 'error');
    }
  };

  const addSystemMessage = (content, type = 'info') => {
    const message = {
      id: Date.now(),
      type: 'system',
      content,
      timestamp: new Date(),
      severity: type
    };
    setMessages(prev => [...prev, message]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !llm) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await llm.oneShot(input, { useTools: true });
      
      if (response.message?.content) {
        const toolCalls = llm.parseToolCalls(response.message.content);
        
        if (toolCalls && toolCalls.length > 0) {
          const toolCallMessage = {
            id: Date.now(),
            type: 'tool_calls',
            content: response.message.content,
            toolCalls,
            timestamp: new Date(),
            pending: true
          };
          setMessages(prev => [...prev, toolCallMessage]);
          setPendingToolCalls(toolCalls.map(call => ({ ...call, approved: null })));
        } else {
          const assistantMessage = {
            id: Date.now(),
            type: 'assistant',
            content: response.message.content,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMessage]);
        }
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now(),
        type: 'error',
        content: `Error: ${error.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolApproval = (toolIndex, approved) => {
    setPendingToolCalls(prev => 
      prev.map((call, idx) => 
        idx === toolIndex ? { ...call, approved } : call
      )
    );
  };

  const executeApprovedTools = async () => {
    if (!llm) return;

    const approvedTools = pendingToolCalls.filter(call => call.approved === true);
    if (approvedTools.length === 0) return;

    setIsLoading(true);
    const toolResults = [];

    for (const toolCall of approvedTools) {
      try {
        const result = await llm.executeTool(toolCall.name, toolCall.arguments);
        toolResults.push(`${toolCall.name}: ${result}`);
      } catch (error) {
        toolResults.push(`${toolCall.name}: Error - ${error.message}`);
      }
    }

    const resultMessage = {
      id: Date.now(),
      type: 'tool_results',
      content: toolResults.join('\n\n'),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, resultMessage]);

    try {
      const finalPrompt = `Tool execution results:\n${toolResults.join('\n\n')}\n\nPlease provide a helpful response based on these results.`;
      const finalResponse = await llm.oneShot(finalPrompt, { useTools: false });
      
      const assistantMessage = {
        id: Date.now(),
        type: 'assistant',
        content: finalResponse.message.content,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now(),
        type: 'error',
        content: `Error generating final response: ${error.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setPendingToolCalls([]);
      setMessages(prev => 
        prev.map(msg => 
          msg.type === 'tool_calls' ? { ...msg, pending: false } : msg
        )
      );
    }
  };

  const clearChat = () => {
    setMessages([]);
    setPendingToolCalls([]);
    if (llm) {
      llm.clearHistory();
    }
  };

  const toggleToolExpansion = (toolIndex) => {
    setExpandedTools(prev => ({
      ...prev,
      [toolIndex]: !prev[toolIndex]
    }));
  };

  const renderMessage = (message) => {
    switch (message.type) {
      case 'user':
        return (
          <div className="xpo_flex xpo_justify-end xpo_mb-4">
            <div className="xpo_flex xpo_items-start xpo_space-x-2 xpo_max-w-[80%]">
              <div className="xpo_bg-blue-500 xpo_text-white xpo_rounded-lg xpo_px-4 xpo_py-2">
                <p className="xpo_text-sm">{message.content}</p>
              </div>
              <div className="xpo_w-8 xpo_h-8 xpo_bg-blue-100 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center xpo_flex-shrink-0">
                <User className="xpo_w-4 xpo_h-4 xpo_text-blue-600" />
              </div>
            </div>
          </div>
        );

      case 'assistant':
        return (
          <div className="xpo_flex xpo_justify-start xpo_mb-4">
            <div className="xpo_flex xpo_items-start xpo_space-x-2 xpo_max-w-[80%]">
              <div className="xpo_w-8 xpo_h-8 xpo_bg-green-100 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center xpo_flex-shrink-0">
                <Bot className="xpo_w-4 xpo_h-4 xpo_text-green-600" />
              </div>
              <div className="xpo_bg-gray-100 xpo_rounded-lg xpo_px-4 xpo_py-2">
                <p className="xpo_text-sm xpo_whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          </div>
        );

      case 'tool_calls':
        return (
          <div className="xpo_flex xpo_justify-start xpo_mb-4">
            <div className="xpo_flex xpo_items-start xpo_space-x-2 xpo_max-w-[90%]">
              <div className="xpo_w-8 xpo_h-8 xpo_bg-orange-100 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center xpo_flex-shrink-0">
                <PenTool className="xpo_w-4 xpo_h-4 xpo_text-orange-600" />
              </div>
              <div className="xpo_bg-orange-50 xpo_border xpo_border-orange-200 xpo_rounded-lg xpo_px-4 xpo_py-3 xpo_w-full">
                <p className="xpo_text-sm xpo_font-medium xpo_text-orange-800 xpo_mb-3">
                  Tool calls detected - Please approve or deny each function:
                </p>
                {message.toolCalls.map((toolCall, idx) => (
                  <div key={idx} className="xpo_border xpo_border-orange-200 xpo_rounded-md xpo_p-3 xpo_mb-2 xpo_bg-white">
                    <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-2">
                      <div className="xpo_flex xpo_items-center xpo_space-x-2">
                        <span className="xpo_font-medium xpo_text-gray-800">{toolCall.name}</span>
                        <button
                          onClick={() => toggleToolExpansion(idx)}
                          className="xpo_text-gray-500 hover:xpo_text-gray-700"
                        >
                          {expandedTools[idx] ? <ChevronUp className="xpo_w-4 xpo_h-4" /> : <ChevronDown className="xpo_w-4 xpo_h-4" />}
                        </button>
                      </div>
                      {message.pending && (
                        <div className="xpo_flex xpo_space-x-2">
                          <button
                            onClick={() => handleToolApproval(idx, true)}
                            className={`xpo_px-3 xpo_py-1 xpo_rounded-md xpo_text-xs xpo_flex xpo_items-center xpo_space-x-1 ${
                              pendingToolCalls[idx]?.approved === true 
                                ? 'xpo_bg-green-600 xpo_text-white' 
                                : 'xpo_bg-green-500 xpo_text-white hover:xpo_bg-green-600'
                            }`}
                          >
                            <Check className="xpo_w-3 xpo_h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleToolApproval(idx, false)}
                            className={`xpo_px-3 xpo_py-1 xpo_rounded-md xpo_text-xs xpo_flex xpo_items-center xpo_space-x-1 ${
                              pendingToolCalls[idx]?.approved === false 
                                ? 'xpo_bg-red-600 xpo_text-white' 
                                : 'xpo_bg-red-500 xpo_text-white hover:xpo_bg-red-600'
                            }`}
                          >
                            <X className="xpo_w-3 xpo_h-3" />
                            <span>Deny</span>
                          </button>
                        </div>
                      )}
                    </div>
                    {expandedTools[idx] && (
                      <div className="xpo_text-xs xpo_text-gray-600 xpo_bg-gray-50 xpo_p-2 xpo_rounded xpo_font-mono">
                        {JSON.stringify(toolCall.arguments, null, 2)}
                      </div>
                    )}
                    {!message.pending && (
                      <div className="xpo_text-xs xpo_text-gray-500">
                        {pendingToolCalls.find(call => call.name === toolCall.name)?.approved === true ? 
                          '✅ Approved' : pendingToolCalls.find(call => call.name === toolCall.name)?.approved === false ? 
                          '❌ Denied' : '⏳ Pending'}
                      </div>
                    )}
                  </div>
                ))}
                {message.pending && pendingToolCalls.some(call => call.approved === true) && (
                  <div className="xpo_mt-3 xpo_pt-3 xpo_border-t xpo_border-orange-200">
                    <button
                      onClick={executeApprovedTools}
                      disabled={isLoading}
                      className="xpo_bg-blue-500 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-md xpo_text-sm xpo_flex xpo_items-center xpo_space-x-2 hover:xpo_bg-blue-600 xpo_disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="xpo_w-4 xpo_h-4 xpo_animate-spin" /> : <Play className="xpo_w-4 xpo_h-4" />}
                      <span>Execute Approved Tools</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'tool_results':
        return (
          <div className="xpo_flex xpo_justify-start xpo_mb-4">
            <div className="xpo_flex xpo_items-start xpo_space-x-2 xpo_max-w-[80%]">
              <div className="xpo_w-8 xpo_h-8 xpo_bg-purple-100 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center xpo_flex-shrink-0">
                <Check className="xpo_w-4 xpo_h-4 xpo_text-purple-600" />
              </div>
              <div className="xpo_bg-purple-50 xpo_border xpo_border-purple-200 xpo_rounded-lg xpo_px-4 xpo_py-2">
                <p className="xpo_text-xs xpo_font-medium xpo_text-purple-800 xpo_mb-1">Tool Results:</p>
                <p className="xpo_text-sm xpo_whitespace-pre-wrap xpo_font-mono">{message.content}</p>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="xpo_flex xpo_justify-center xpo_mb-4">
            <div className="xpo_bg-gray-100 xpo_text-gray-600 xpo_text-xs xpo_px-3 xpo_py-1 xpo_rounded-full xpo_flex xpo_items-center xpo_space-x-1">
              <AlertCircle className="xpo_w-3 xpo_h-3" />
              <span>{message.content}</span>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="xpo_flex xpo_justify-start xpo_mb-4">
            <div className="xpo_flex xpo_items-start xpo_space-x-2 xpo_max-w-[80%]">
              <div className="xpo_w-8 xpo_h-8 xpo_bg-red-100 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center xpo_flex-shrink-0">
                <AlertCircle className="xpo_w-4 xpo_h-4 xpo_text-red-600" />
              </div>
              <div className="xpo_bg-red-50 xpo_border xpo_border-red-200 xpo_rounded-lg xpo_px-4 xpo_py-2">
                <p className="xpo_text-sm xpo_text-red-800">{message.content}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="xpo_flex xpo_flex-col xpo_h-screen xpo_bg-gray-50">
      {/* Header */}
      <div className="xpo_bg-white xpo_border-b xpo_border-gray-200 xpo_px-4 xpo_py-3">
        <div className="xpo_flex xpo_items-center xpo_justify-between">
          <div className="xpo_flex xpo_items-center xpo_space-x-3">
            <Bot className="xpo_w-6 xpo_h-6 xpo_text-blue-600" />
            <h1 className="xpo_text-lg xpo_font-semibold xpo_text-gray-800">MCP Chat</h1>
            <div className={`xpo_w-2 xpo_h-2 xpo_rounded-full ${isConnected ? 'xpo_bg-green-500' : 'xpo_bg-red-500'}`}></div>
          </div>
          <div className="xpo_flex xpo_items-center xpo_space-x-2">
            <button
              onClick={clearChat}
              className="xpo_p-2 xpo_text-gray-500 hover:xpo_text-gray-700 hover:xpo_bg-gray-100 xpo_rounded-md"
            >
              <Trash2 className="xpo_w-4 xpo_h-4" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="xpo_p-2 xpo_text-gray-500 hover:xpo_text-gray-700 hover:xpo_bg-gray-100 xpo_rounded-md"
            >
              <Settings className="xpo_w-4 xpo_h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="xpo_bg-white xpo_border-b xpo_border-gray-200 xpo_px-4 xpo_py-3">
          <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4 xpo_text-sm">
            <div>
              <label className="xpo_block xpo_text-gray-700 xpo_mb-1">Endpoint</label>
              <input
                type="text"
                value={settings.endpoint}
                onChange={(e) => setSettings(prev => ({ ...prev, endpoint: e.target.value }))}
                className="xpo_w-full xpo_px-3 xpo_py-1 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_text-sm"
              />
            </div>
            <div>
              <label className="xpo_block xpo_text-gray-700 xpo_mb-1">Model</label>
              <input
                type="text"
                value={settings.model}
                onChange={(e) => setSettings(prev => ({ ...prev, model: e.target.value }))}
                className="xpo_w-full xpo_px-3 xpo_py-1 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_text-sm"
              />
            </div>
            <div>
              <label className="xpo_block xpo_text-gray-700 xpo_mb-1">MCP URL</label>
              <input
                type="text"
                value={settings.mcpUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, mcpUrl: e.target.value }))}
                className="xpo_w-full xpo_px-3 xpo_py-1 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_text-sm"
              />
            </div>
            <div>
              <label className="xpo_block xpo_text-gray-700 xpo_mb-1">Temperature</label>
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="xpo_w-full xpo_px-3 xpo_py-1 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_text-sm"
              />
            </div>
          </div>
          <div className="xpo_mt-3">
            <button
              onClick={initializeLLM}
              className="xpo_bg-blue-500 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-md xpo_text-sm hover:xpo_bg-blue-600"
            >
              Reconnect
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="xpo_flex-1 xpo_overflow-y-auto xpo_px-4 xpo_py-4">
        {messages.length === 0 ? (
          <div className="xpo_flex xpo_flex-col xpo_items-center xpo_justify-center xpo_h-full xpo_text-gray-500">
            <Bot className="xpo_w-12 xpo_h-12 xpo_mb-4" />
            <p className="xpo_text-lg xpo_font-medium xpo_mb-2">Welcome to MCP Chat</p>
            <p className="xpo_text-sm xpo_text-center xpo_max-w-md">
              Start a conversation with the AI assistant. When tools are needed, you'll be asked to approve them before execution.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id}>
              {renderMessage(message)}
            </div>
          ))
        )}
        {isLoading && (
          <div className="xpo_flex xpo_justify-start xpo_mb-4">
            <div className="xpo_flex xpo_items-start xpo_space-x-2">
              <div className="xpo_w-8 xpo_h-8 xpo_bg-green-100 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center xpo_flex-shrink-0">
                <Loader2 className="xpo_w-4 xpo_h-4 xpo_text-green-600 xpo_animate-spin" />
              </div>
              <div className="xpo_bg-gray-100 xpo_rounded-lg xpo_px-4 xpo_py-2">
                <p className="xpo_text-sm xpo_text-gray-500">Thinking...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="xpo_bg-white xpo_border-t xpo_border-gray-200 xpo_px-4 xpo_py-3">
        <form onSubmit={handleSubmit} className="xpo_flex xpo_space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="xpo_flex-1 xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 xpo_disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="xpo_bg-blue-500 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-md hover:xpo_bg-blue-600 xpo_disabled:opacity-50 xpo_disabled:cursor-not-allowed xpo_flex xpo_items-center xpo_space-x-2"
          >
            {isLoading ? (
              <Loader2 className="xpo_w-4 xpo_h-4 xpo_animate-spin" />
            ) : (
              <Send className="xpo_w-4 xpo_h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatApp;