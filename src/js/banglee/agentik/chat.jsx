import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';
import { home_route, NavMenu } from '@banglee/core';

const API_BASE_URL = 'http://localhost:3000/agentik';

const AgentChatPage = () => {
  const [agents, setAgents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');

  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setAgents(response.data.data);
      if (!selected && response.data.data.length) {
        setSelected(response.data.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const fetchMessages = async () => {
    if (!selected) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/communication`, {
        params: { agent_id: selected.id }
      });
      setMessages(response.data.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selected) return;

    setSending(true);

    try {
      const messageData = {
        agent_id: selected.id,
        content: input,
        _type: 'msg'
      };
  
      const response = await axios.post(`${API_BASE_URL}/communication`, messageData);
  
      const newMessage = {
        id: response.data.id,
        agent_id: null,
        content: input,
        _time: new Date().toISOString()
      };
  
      setMessages(prev => [...prev, newMessage]);
      setInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selected) {
      fetchMessages();
      const intervalId = setInterval(fetchMessages, 5000);
      return () => clearInterval(intervalId);
    }
  }, [selected]);

  return (
    <>
      <NavMenu />
      <div className="xpo_grid xpo_grid-cols-12 xpo_h-screen xpo_overflow-hidden xpo_bg-gray-50">
        {/* Agents Sidebar */}
        <div className="xpo_col-span-3 xpo_border-r xpo_border-gray-200 xpo_flex xpo_flex-col xpo_bg-white">
          <div className="xpo_p-4 xpo_text-lg xpo_font-semibold xpo_border-b xpo_border-gray-200 xpo_bg-white">
            Agents
          </div>
          <div className="xpo_flex-1 xpo_overflow-y-auto xpo_space-y-1 xpo_px-3 xpo_py-2">
            {agents.map((a) => (
              <div
                key={a.id}
                className={`xpo_p-3 xpo_rounded-md xpo_cursor-pointer xpo_transition-colors ${
                  selected?.id === a.id 
                    ? 'xpo_bg-blue-100 xpo_border-blue-200 xpo_border' 
                    : 'hover:xpo_bg-gray-100 xpo_border xpo_border-transparent'
                }`}
                onClick={() => setSelected(a)}
              >
                <p className="xpo_font-medium xpo_text-gray-900">{a.full_name}</p>
                <p className="xpo_text-xs xpo_text-gray-500 xpo_mt-1">{a.agent_role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="xpo_col-span-9 xpo_flex xpo_flex-col">
          <div className="xpo_flex-1 xpo_grid xpo_grid-cols-12">
            {/* Chat Section */}
            <div className="xpo_col-span-5 xpo_border-r xpo_border-gray-200 xpo_flex xpo_flex-col xpo_bg-white">
              <div className="xpo_p-4 xpo_border-b xpo_border-gray-200 xpo_font-semibold xpo_bg-white">
                {selected?.full_name || 'No Agent Selected'}
              </div>
          
              {/* Messages */}
              <div className="xpo_flex-1 xpo_overflow-y-auto xpo_p-4 xpo_bg-gray-50 xpo_space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`xpo_flex ${
                      msg.agent_id === selected?.id ? 'xpo_justify-start' : 'xpo_justify-end'
                    }`}
                  >
                    <div
                      className={`xpo_max-w-md xpo_px-4 xpo_py-2 xpo_rounded-lg xpo_shadow-sm ${
                        msg.agent_id === selected?.id
                          ? 'xpo_bg-blue-100 xpo_text-blue-900'
                          : 'xpo_bg-green-100 xpo_text-green-900'
                      }`}
                    >
                      <p className="xpo_text-sm">{msg.content}</p>
                      {msg.timestamp && (
                        <p className="xpo_text-xs xpo_opacity-70 xpo_mt-1">{msg.timestamp}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
          
              {/* Message Input */}
              <div className="xpo_p-4 xpo_border-t xpo_border-gray-200 xpo_bg-white xpo_flex xpo_gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="xpo_flex-1 xpo_px-3 xpo_py-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_text-sm xpo_placeholder-gray-500 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-blue-500"
                  disabled={sending}
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  className="xpo_flex xpo_items-center xpo_px-4 xpo_py-2 xpo_bg-blue-600 xpo_text-white xpo_text-sm xpo_font-medium xpo_rounded-md hover:xpo_bg-blue-700 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_ring-offset-2 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed xpo_transition-colors"
                >
                  <Send className="xpo_w-4 xpo_h-4 xpo_mr-1" />
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>

            {/* Right Panel with Tabs */}
            <div className="xpo_col-span-7 xpo_flex xpo_flex-col xpo_bg-white">
              {/* Tab Navigation */}
              <div className="xpo_border-b xpo_border-gray-200 xpo_bg-white">
                <div className="xpo_flex xpo_space-x-1 xpo_px-4">
                  {['editor', 'browser', 'files'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`xpo_px-4 xpo_py-2 xpo_text-sm xpo_font-medium xpo_border-b-2 xpo_transition-colors xpo_capitalize ${
                        activeTab === tab
                          ? 'xpo_border-blue-500 xpo_text-blue-600'
                          : 'xpo_border-transparent xpo_text-gray-500 hover:xpo_text-gray-700 hover:xpo_border-gray-300'
                      }`}
                    >
                      {tab === 'files' ? 'File Manager' : tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="xpo_flex-1 xpo_overflow-auto">
                {activeTab === 'editor' && (
                  <div className="xpo_p-4 xpo_h-full">
                    <div className="xpo_border xpo_border-gray-200 xpo_rounded-lg xpo_p-4 xpo_bg-gray-900 xpo_text-white xpo_h-full xpo_overflow-auto">
                      <div className="xpo_mb-2 xpo_text-xs xpo_text-gray-400">Code Editor</div>
                      <pre className="xpo_whitespace-pre-wrap xpo_font-mono xpo_text-sm">
  {`// Welcome to the code editor
  function greetUser(name) {
    return \`Hello, \${name}! Welcome to the agent chat platform.\`;
  }

  const user = "${selected?.full_name || 'User'}";
  console.log(greetUser(user));

  // Your code here...`}
                      </pre>
                    </div>
                  </div>
                )}

                {activeTab === 'browser' && (
                  <div className="xpo_p-4 xpo_h-full">
                    <div className="xpo_border xpo_border-gray-200 xpo_rounded-lg xpo_p-4 xpo_bg-white xpo_h-full">
                      <div className="xpo_mb-4 xpo_flex xpo_items-center xpo_gap-2">
                        <div className="xpo_flex xpo_gap-1">
                          <div className="xpo_w-3 xpo_h-3 xpo_rounded-full xpo_bg-red-500"></div>
                          <div className="xpo_w-3 xpo_h-3 xpo_rounded-full xpo_bg-yellow-500"></div>
                          <div className="xpo_w-3 xpo_h-3 xpo_rounded-full xpo_bg-green-500"></div>
                        </div>
                        <div className="xpo_flex-1 xpo_bg-gray-100 xpo_rounded xpo_px-3 xpo_py-1 xpo_text-sm xpo_text-gray-600">
                          https://example.com
                        </div>
                      </div>
                      <div className="xpo_space-y-4">
                        <div className="xpo_h-4 xpo_bg-gray-200 xpo_rounded xpo_w-3/4"></div>
                        <div className="xpo_h-4 xpo_bg-gray-200 xpo_rounded xpo_w-1/2"></div>
                        <div className="xpo_h-16 xpo_bg-gray-100 xpo_rounded xpo_flex xpo_items-center xpo_justify-center">
                          <p className="xpo_text-sm xpo_text-gray-500">Browser preview content</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'files' && (
                  <div className="xpo_p-4 xpo_h-full">
                    <div className="xpo_border xpo_border-gray-200 xpo_rounded-lg xpo_p-4 xpo_bg-white xpo_h-full">
                      <div className="xpo_mb-4 xpo_text-sm xpo_font-medium xpo_text-gray-700">File Manager</div>
                      <div className="xpo_space-y-2">
                        {['📁 Documents', '📁 Images', '📁 Projects', '📄 README.md', '📄 config.json'].map((file, index) => (
                          <div
                            key={index}
                            className="xpo_flex xpo_items-center xpo_gap-2 xpo_p-2 xpo_rounded xpo_hover:xpo_bg-gray-50 xpo_cursor-pointer"
                          >
                            <span className="xpo_text-sm">{file}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentChatPage;