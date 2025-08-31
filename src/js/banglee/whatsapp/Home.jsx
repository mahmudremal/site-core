import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Users, Send, ChevronDown, Bot, User, Circle, CheckCircle, CheckCircle2, Phone, Search, MoreVertical, Settings, Eye, EyeOff, AlertCircle, Clock, Image, Video, FileText, Mic } from 'lucide-react';
import { io } from 'socket.io-client';

const WhatsappHome = () => {
  const [socket, setSocket] = useState(null);
  const [connectionState, setConnectionState] = useState('close');
  const [qrCode, setQrCode] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [humanInterventionEnabled, setHumanInterventionEnabled] = useState(false);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [aiProcessingLogs, setAiProcessingLogs] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [groupConfigs, setGroupConfigs] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isConnected = connectionState === 'open';

  useEffect(() => {
    const ws = io('http://localhost:3000/wa', {
      // transports: ['websocket', 'polling']
    });
    setSocket(ws);

    // Connection events
    ws.on('connect', () => {
      console.log('Socket connected');
      ws.emit('get_state');
      ws.emit('get_chats');
      ws.emit('get_group_configs');
    });

    ws.on('connect_error', (error) => {
      console.error('Connection Error:', error);
    });

    ws.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnectionState('close');
    });

    // WhatsApp connection events
    ws.on('state', (state) => {
      setConnectionState(state);
    });

    ws.on('qr', (qrCodeData) => {
      setQrCode(qrCodeData);
    });

    ws.on('ready', (data) => {
      console.log('WhatsApp ready:', data);
      setConnectionState('open');
      setQrCode(null);
      ws.emit('get_chats');
    });

    ws.on('disconnected', (reason) => {
      console.log('WhatsApp disconnected:', reason);
      setConnectionState('close');
    });

    // Data events
    ws.on('chats', (chatData) => {
      setChats(chatData || []);
    });

    ws.on('messages', (messageData) => {
      setMessages(messageData || []);
    });

    ws.on('group_configs', (configs) => {
      setGroupConfigs(configs || []);
    });

    // Message events
    ws.on('message_received', (message) => {
      if (selectedChat && message.key.remoteJid === selectedChat.id) {
        setMessages(prev => [...prev, message]);
      }
      // Update chat list with new message
      ws.emit('get_chats');
    });

    ws.on('message_sent', (message) => {
      setMessages(prev => [...prev, message]);
      ws.emit('get_chats');
    });

    // AI events
    ws.on('message_for_review', (data) => {
      setPendingMessages(prev => [...prev, data]);
    });

    ws.on('ai_processed', (data) => {
      console.log('AI processed message:', data);
      setAiProcessingLogs(prev => [...prev, data]);
      // Remove from pending if exists
      setPendingMessages(prev => 
        prev.filter(msg => msg.message.key.id !== data.messageId)
      );
    });

    ws.on('ai_error', (error) => {
      console.error('AI Error:', error);
    });

    // Human intervention events
    ws.on('human_intervention_toggled', (enabled) => {
      setHumanInterventionEnabled(enabled);
    });

    ws.on('human_replied', (messageId) => {
      setPendingMessages(prev => 
        prev.filter(msg => msg.message.key.id !== messageId)
      );
    });

    ws.on('ai_took_over', (messageId) => {
      setPendingMessages(prev => 
        prev.filter(msg => msg.message.key.id !== messageId)
      );
    });

    ws.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => ws.close();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    if (socket) {
      socket.emit('get_messages', { chatId: chat.id });
    }
  };

  const handleInputFocus = () => {
    setIsTyping(true);
    if (socket && selectedChat) {
      socket.emit('toggle_human_intervention', true);
      socket.emit('human_typing_start', selectedChat.id);
    }
  };

  const handleInputBlur = () => {
    if (!messageInput.trim()) {
      setIsTyping(false);
      if (socket && selectedChat) {
        socket.emit('human_typing_stop', selectedChat.id);
      }
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    if (!e.target.value.trim() && isTyping) {
      setIsTyping(false);
      if (socket && selectedChat) {
        socket.emit('human_typing_stop', selectedChat.id);
      }
    } else if (e.target.value.trim() && !isTyping) {
      setIsTyping(true);
      if (socket && selectedChat) {
        socket.emit('toggle_human_intervention', true);
        socket.emit('human_typing_start', selectedChat.id);
      }
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && socket && selectedChat) {
      socket.emit('send_message', {
        chatId: selectedChat.id,
        content: messageInput.trim()
      });
      setMessageInput('');
      setIsTyping(false);
      if (selectedChat) {
        socket.emit('human_typing_stop', selectedChat.id);
      }
    }
  };

  const handleLetAI = () => {
    if (socket && selectedChat) {
      socket.emit('toggle_human_intervention', false);
      setIsTyping(false);
      socket.emit('human_typing_stop', selectedChat.id);
    }
    setShowDropdown(false);
  };

  const handleLogin = () => {
    if (socket) {
      socket.emit('login');
    }
  };

  const handleLogout = () => {
    if (socket) {
      socket.emit('logout');
    }
  };

  const handleToggleHumanIntervention = () => {
    if (socket) {
      socket.emit('toggle_human_intervention', !humanInterventionEnabled);
    }
  };

  const handleRespondToPending = (pendingMessage, response) => {
    if (socket) {
      socket.emit('human_reply', {
        messageId: pendingMessage.message.key.id,
        chatId: pendingMessage.chat,
        content: response
      });
    }
  };

  const handleLetAIHandlePending = (pendingMessage) => {
    if (socket) {
      socket.emit('let_ai_handle', pendingMessage.message.key.id);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageIcon = (messageType) => {
    switch (messageType) {
      case 'imageMessage': return <Image className="xpo_w-3 xpo_h-3" />;
      case 'videoMessage': return <Video className="xpo_w-3 xpo_h-3" />;
      case 'audioMessage': return <Mic className="xpo_w-3 xpo_h-3" />;
      case 'documentMessage': return <FileText className="xpo_w-3 xpo_h-3" />;
      default: return null;
    }
  };

  const MessageItem = ({ message }) => {
    const isFromMe = message.key?.fromMe || message.fromMe;
    const isGroup = selectedChat?.is_group;
    const messageType = message.type || Object.keys(message.message || {})[0];
    const hasMedia = message.has_media;
    
    return (
      <div className={`xpo_flex xpo_mb-3 ${isFromMe ? 'xpo_justify-end' : 'xpo_justify-start'}`}>
        <div className={`xpo_max-w-xs xpo_lg:max-w-md xpo_px-3 xpo_py-2 xpo_rounded-lg xpo_relative ${
          isFromMe 
            ? 'xpo_bg-green-500 xpo_text-white' 
            : 'xpo_bg-white xpo_text-gray-800 xpo_shadow-sm'
        }`}>
          {isGroup && !isFromMe && (
            <div className="xpo_text-xs xpo_font-semibold xpo_text-blue-600 xpo_mb-1">
              {message.key?.participant?.split('@')[0] || 'Unknown'}
            </div>
          )}
          <div className="xpo_text-sm xpo_break-words xpo_flex xpo_items-start xpo_gap-2">
            {hasMedia && getMessageIcon(messageType)}
            <span>{message.body || messageType}</span>
          </div>
          <div className={`xpo_text-xs xpo_mt-1 xpo_flex xpo_items-center xpo_justify-end xpo_gap-1 ${
            isFromMe ? 'xpo_text-green-100' : 'xpo_text-gray-500'
          }`}>
            <span>{formatTime(message.timestamp || message.messageTimestamp * 1000)}</span>
            {isFromMe && (
              <CheckCircle2 className="xpo_w-3 xpo_h-3" />
            )}
          </div>
        </div>
      </div>
    );
  };

  const ChatItem = ({ chat }) => (
    <div
      onClick={() => handleChatSelect(chat)}
      className={`xpo_flex xpo_items-center xpo_p-3 xpo_cursor-pointer xpo_hover:bg-gray-50 xpo_transition-colors ${
        selectedChat?.id === chat.id ? 'xpo_bg-blue-50 xpo_border-r-2 xpo_border-blue-500' : ''
      }`}
    >
      <div className="xpo_w-10 xpo_h-10 xpo_bg-gray-300 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center xpo_mr-3">
        {chat.is_group ? (
          <Users className="xpo_w-5 xpo_h-5 xpo_text-gray-600" />
        ) : (
          <User className="xpo_w-5 xpo_h-5 xpo_text-gray-600" />
        )}
      </div>
      <div className="xpo_flex-1 xpo_min-w-0">
        <div className="xpo_font-medium xpo_text-sm xpo_text-gray-900 xpo_truncate">
          {chat.name || chat.id?.split('@')[0]}
        </div>
        <div className="xpo_text-xs xpo_text-gray-500 xpo_truncate">
          {chat.is_group ? `Group chat` : 'Direct message'}
        </div>
      </div>
      <div className="xpo_flex xpo_flex-col xpo_items-end">
        {chat.lastMessage && (
          <div className="xpo_text-xs xpo_text-gray-400 xpo_mb-1">
            {formatTime(chat.lastMessage.timestamp || chat.lastMessage.messageTimestamp * 1000)}
          </div>
        )}
        <Circle className={`xpo_w-2 xpo_h-2 ${isConnected ? 'xpo_text-green-500' : 'xpo_text-gray-400'}`} />
      </div>
    </div>
  );

  const PendingMessageItem = ({ pendingMessage }) => {
    const [response, setResponse] = useState('');
    
    return (
      <div className="xpo_bg-yellow-50 xpo_border xpo_border-yellow-200 xpo_rounded-lg xpo_p-3 xpo_mb-2">
        <div className="xpo_flex xpo_items-start xpo_justify-between xpo_mb-2">
          <div className="xpo_flex xpo_items-center xpo_gap-2">
            <AlertCircle className="xpo_w-4 xpo_h-4 xpo_text-yellow-600" />
            <span className="xpo_text-sm xpo_font-medium xpo_text-yellow-800">Pending Human Review</span>
          </div>
          <Clock className="xpo_w-4 xpo_h-4 xpo_text-yellow-600" />
        </div>
        <div className="xpo_text-sm xpo_text-gray-700 xpo_mb-3">
          <strong>From:</strong> {pendingMessage.contact?.split('@')[0] || 'Unknown'}<br />
          <strong>Message:</strong> {pendingMessage.message.message?.conversation || 'Media message'}
        </div>
        <div className="xpo_flex xpo_gap-2">
          <input
            type="text"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Type your response..."
            className="xpo_flex-1 xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-200 xpo_rounded-md xpo_text-sm"
          />
          <button
            onClick={() => {
              handleRespondToPending(pendingMessage, response);
              setResponse('');
            }}
            disabled={!response.trim()}
            className="xpo_px-3 xpo_py-2 xpo_bg-blue-500 xpo_text-white xpo_rounded-md xpo_text-sm xpo_disabled:opacity-50"
          >
            Reply
          </button>
          <button
            onClick={() => handleLetAIHandlePending(pendingMessage)}
            className="xpo_px-3 xpo_py-2 xpo_bg-gray-500 xpo_text-white xpo_rounded-md xpo_text-sm"
          >
            Let AI Handle
          </button>
        </div>
      </div>
    );
  };

  // Connection Status Component
  const ConnectionStatus = () => {
    const getStatusColor = () => {
      switch (connectionState) {
        case 'open': return 'xpo_text-green-500';
        case 'connecting': return 'xpo_text-yellow-500';
        case 'close': return 'xpo_text-red-500';
        default: return 'xpo_text-gray-500';
      }
    };

    const getStatusText = () => {
      switch (connectionState) {
        case 'open': return 'Connected';
        case 'connecting': return 'Connecting...';
        case 'close': return 'Disconnected';
        default: return 'Unknown';
      }
    };

    return (
      <div className="xpo_flex xpo_items-center xpo_gap-2">
        <Circle className={`xpo_w-2 xpo_h-2 ${getStatusColor()}`} />
        <span className={`xpo_text-xs ${getStatusColor()}`}>{getStatusText()}</span>
      </div>
    );
  };

  return (
    <div className="xpo_flex xpo_h-screen xpo_bg-gray-100">
      {/* Sidebar */}
      <div className="xpo_w-1/3 xpo_bg-white xpo_border-r xpo_border-gray-200 xpo_flex xpo_flex-col">
        <div className="xpo_p-4 xpo_border-b xpo_border-gray-200">
          <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-3">
            <h1 className="xpo_text-lg xpo_font-semibold xpo_text-gray-800">WhatsApp AI</h1>
            <div className="xpo_flex xpo_items-center xpo_gap-2">
              <ConnectionStatus />
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="xpo_p-1 xpo_hover:bg-gray-100 xpo_rounded"
              >
                <Settings className="xpo_w-4 xpo_h-4 xpo_text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Connection Controls */}
          {!isConnected && (
            <div className="xpo_mb-3 xpo_flex xpo_gap-2">
              <button
                onClick={handleLogin}
                className="xpo_flex-1 xpo_px-3 xpo_py-2 xpo_bg-green-500 xpo_text-white xpo_rounded-md xpo_text-sm"
              >
                Connect
              </button>
              {connectionState === 'connecting' && (
                <div className="xpo_flex xpo_items-center xpo_text-xs xpo_text-gray-500">
                  Connecting...
                </div>
              )}
            </div>
          )}

          {/* QR Code Display */}
          {qrCode && (
            <div className="xpo_mb-3 xpo_text-center">
              <img src={qrCode} alt="QR Code" className="xpo_mx-auto xpo_mb-2 xpo_max-w-32" />
              <p className="xpo_text-xs xpo_text-gray-600">Scan with WhatsApp</p>
            </div>
          )}

          {/* Search */}
          <div className="xpo_relative">
            <Search className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_w-4 xpo_h-4 xpo_text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="xpo_w-full xpo_pl-9 xpo_pr-3 xpo_py-2 xpo_border xpo_border-gray-200 xpo_rounded-md xpo_text-sm xpo_focus:outline-none xpo_focus:ring-2 xpo_focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="xpo_p-4 xpo_border-b xpo_border-gray-200 xpo_bg-gray-50">
            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_mb-2">
              <span className="xpo_text-sm xpo_font-medium">Human Intervention</span>
              <button
                onClick={handleToggleHumanIntervention}
                className={`xpo_p-1 xpo_rounded ${humanInterventionEnabled ? 'xpo_text-green-600' : 'xpo_text-gray-400'}`}
              >
                {humanInterventionEnabled ? <Eye className="xpo_w-4 xpo_h-4" /> : <EyeOff className="xpo_w-4 xpo_h-4" />}
              </button>
            </div>
            {isConnected && (
              <button
                onClick={handleLogout}
                className="xpo_w-full xpo_px-3 xpo_py-2 xpo_bg-red-500 xpo_text-white xpo_rounded-md xpo_text-sm"
              >
                Disconnect
              </button>
            )}
          </div>
        )}

        {/* Pending Messages */}
        {pendingMessages.length > 0 && (
          <div className="xpo_p-4 xpo_border-b xpo_border-gray-200 xpo_bg-yellow-50 xpo_max-h-64 xpo_overflow-y-auto">
            <h3 className="xpo_text-sm xpo_font-medium xpo_text-yellow-800 xpo_mb-2">
              Pending Reviews ({pendingMessages.length})
            </h3>
            {pendingMessages.map((pendingMessage, index) => (
              <PendingMessageItem key={index} pendingMessage={pendingMessage} />
            ))}
          </div>
        )}

        {/* Chat List */}
        <div className="xpo_flex-1 xpo_overflow-y-auto">
          {filteredChats.map((chat) => (
            <ChatItem key={chat.id} chat={chat} />
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="xpo_flex-1 xpo_flex xpo_flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="xpo_p-4 xpo_bg-white xpo_border-b xpo_border-gray-200 xpo_flex xpo_items-center xpo_justify-between">
              <div className="xpo_flex xpo_items-center">
                <div className="xpo_w-8 xpo_h-8 xpo_bg-gray-300 xpo_rounded-full xpo_flex xpo_items-center xpo_justify-center xpo_mr-3">
                  {selectedChat.is_group ? (
                    <Users className="xpo_w-4 xpo_h-4 xpo_text-gray-600" />
                  ) : (
                    <User className="xpo_w-4 xpo_h-4 xpo_text-gray-600" />
                  )}
                </div>
                <div>
                  <div className="xpo_font-medium xpo_text-sm xpo_text-gray-900">
                    {selectedChat.name || selectedChat.id?.split('@')[0]}
                  </div>
                  <div className="xpo_text-xs xpo_text-gray-500">
                    {selectedChat.is_group ? 'Group chat' : 'Direct message'}
                  </div>
                </div>
              </div>
              <div className="xpo_flex xpo_items-center xpo_gap-2">
                {isTyping && (
                  <div className="xpo_flex xpo_items-center xpo_gap-1 xpo_text-xs xpo_text-blue-600">
                    <User className="xpo_w-3 xpo_h-3" />
                    <span>Human mode</span>
                  </div>
                )}
                {humanInterventionEnabled && (
                  <div className="xpo_flex xpo_items-center xpo_gap-1 xpo_text-xs xpo_text-green-600">
                    <Eye className="xpo_w-3 xpo_h-3" />
                    <span>Monitoring</span>
                  </div>
                )}
                <MoreVertical className="xpo_w-5 xpo_h-5 xpo_text-gray-400 xpo_cursor-pointer" />
              </div>
            </div>

            {/* Messages */}
            <div className="xpo_flex-1 xpo_overflow-y-auto xpo_p-4 xpo_space-y-2 xpo_bg-gray-50">
              {messages.map((message, index) => (
                <MessageItem key={message.key?.id || message.id || index} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="xpo_p-4 xpo_bg-white xpo_border-t xpo_border-gray-200">
              <div className="xpo_flex xpo_items-end xpo_gap-2">
                <div className="xpo_flex-1">
                  <textarea
                    ref={inputRef}
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="Type a message..."
                    className="xpo_w-full xpo_p-3 xpo_border xpo_border-gray-200 xpo_rounded-lg xpo_resize-none xpo_text-sm xpo_focus:outline-none xpo_focus:ring-2 xpo_focus:ring-blue-500 xpo_max-h-20"
                    rows={1}
                    disabled={!isConnected}
                  />
                </div>
                <div className="xpo_relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    disabled={!isConnected}
                    className="xpo_flex xpo_items-center xpo_gap-1 xpo_px-3 xpo_py-2 xpo_bg-blue-500 xpo_text-white xpo_rounded-lg xpo_hover:bg-blue-600 xpo_transition-colors xpo_disabled:opacity-50"
                  >
                    <Send className="xpo_w-4 xpo_h-4" />
                    <ChevronDown className="xpo_w-3 xpo_h-3" />
                  </button>
                  
                  {showDropdown && (
                    <div className="xpo_absolute xpo_bottom-full xpo_right-0 xpo_mb-1 xpo_bg-white xpo_border xpo_border-gray-200 xpo_rounded-lg xpo_shadow-lg xpo_min-w-32">
                      <button
                        onClick={() => {
                          handleSendMessage();
                          setShowDropdown(false);
                        }}
                        className="xpo_w-full xpo_px-3 xpo_py-2 xpo_text-left xpo_text-sm xpo_hover:bg-gray-50 xpo_flex xpo_items-center xpo_gap-2"
                      >
                        <Send className="xpo_w-3 xpo_h-3" />
                        Send
                      </button>
                      <button
                        onClick={handleLetAI}
                        className="xpo_w-full xpo_px-3 xpo_py-2 xpo_text-left xpo_text-sm xpo_hover:bg-gray-50 xpo_flex xpo_items-center xpo_gap-2 xpo_border-t xpo_border-gray-100"
                      >
                        <Bot className="xpo_w-3 xpo_h-3" />
                        Let AI
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="xpo_flex xpo_items-center xpo_justify-center xpo_h-full xpo_text-gray-500">
            <div className="xpo_text-center">
              <MessageCircle className="xpo_w-16 xpo_h-16 xpo_mx-auto xpo_mb-4 xpo_text-gray-300" />
              <p className="xpo_text-lg xpo_font-medium xpo_mb-2">Welcome to WhatsApp AI</p>
              <p className="xpo_text-sm">
                {isConnected ? 'Select a chat to start messaging' : 'Connect to WhatsApp to begin'}
              </p>
              {!isConnected && !qrCode && connectionState !== 'connecting' && (
                <button
                  onClick={handleLogin}
                  className="xpo_mt-4 xpo_px-4 xpo_py-2 xpo_bg-green-500 xpo_text-white xpo_rounded-lg xpo_hover:bg-green-600"
                >
                  Connect WhatsApp
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsappHome;