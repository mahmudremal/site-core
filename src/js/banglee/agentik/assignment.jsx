import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Clock, User, DollarSign, Tags } from 'lucide-react';

const AssignmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState({
    assignment: true,
    messages: false,
    sending: false
  });
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);

  const fetchAssignment = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, assignment: true }));
      const res = await axios.get('/agentik/assignments', { 
        params: { page: 1, detailed: true } 
      });
      const found = res.data.data.find((a) => a.id == id);
      
      if (!found) {
        setError('Assignment not found');
        return;
      }
      
      setAssignment(found);
    } catch (error) {
      setError('Failed to fetch assignment details');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, assignment: false }));
    }
  }, [id]);

  const fetchMessages = useCallback(async () => {
    if (!assignment?.agent_id) return;

    try {
      setLoading(prev => ({ ...prev, messages: true }));
      const res = await axios.get('/agentik/communication', {
        params: { 
          agent_id: assignment.agent_id, 
          _type: 'msg', 
          page: 1,
          limit: 50 
        },
      });
      setMessages(res.data.data.reverse());
    } catch (error) {
      setError('Failed to load messages');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  }, [assignment]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    try {
      setLoading(prev => ({ ...prev, sending: true }));
      await axios.post('/agentik/communication', {
        agent_id: assignment.agent_id,
        content: input,
        _type: 'msg',
      });
      
      setInput('');
      await fetchMessages();
    } catch (error) {
      setError('Message send failed');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, sending: false }));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  useEffect(() => {
    if (assignment) {
      fetchMessages();
    }
  }, [assignment, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (error) {
    return (
      <div className="xpo_flex xpo_justify-center xpo_items-center xpo_h-screen xpo_bg-red-50">
        <div className="xpo_text-center xpo_p-8 xpo_bg-white xpo_rounded-lg xpo_shadow-md">
          <p className="xpo_text-red-600 xpo_mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="xpo_bg-blue-500 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="xpo_grid xpo_grid-cols-1 lg:xpo_grid-cols-3 xpo_h-screen">
      {/* Chat Section */}
      <div className="xpo_col-span-2 xpo_border-r xpo_flex xpo_flex-col">
        <div className="xpo_p-4 xpo_border-b xpo_flex xpo_items-center xpo_justify-between">
          <div className="xpo_flex xpo_items-center xpo_gap-2">
            <ArrowLeft 
              onClick={() => navigate(-1)} 
              className="xpo_cursor-pointer xpo_text-gray-600 hover:xpo_text-blue-500" 
            />
            <h2 className="xpo_font-semibold xpo_text-lg">Agent Chat</h2>
          </div>
          {loading.messages && (
            <div className="xpo_text-sm xpo_text-gray-500">Loading messages...</div>
          )}
        </div>

        <div className="xpo_flex-1 xpo_overflow-y-auto xpo_p-4 xpo_space-y-4 xpo_bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`xpo_max-w-xl xpo_px-4 xpo_py-2 xpo_rounded-xl ${
                msg.agent_id === assignment?.agent_id
                  ? 'xpo_bg-blue-100 xpo_self-start'
                  : 'xpo_bg-green-100 xpo_self-end'
              }`}
            >
              <p className="xpo_text-sm">{msg.content}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="xpo_p-4 xpo_border-t xpo_bg-white xpo_flex xpo_gap-2">
          <textarea
            placeholder="Type message..."
            value={input}
            onKeyDown={handleKeyDown}
            onChange={(e) => setInput(e.target.value)}
            className="xpo_flex-1 xpo_px-3 xpo_py-2 xpo_border xpo_rounded-md xpo_resize-none xpo_h-20"
          />
          <button 
            onClick={sendMessage} 
            disabled={loading.sending || !input.trim()}
            className="xpo_bg-blue-500 xpo_text-white xpo_px-4 xpo_py-2 xpo_rounded-md xpo_flex xpo_items-center xpo_gap-2 disabled:xpo_opacity-50"
          >
            <Send className="xpo_w-4 xpo_h-4" />
            Send
          </button>
        </div>
      </div>

      {/* Assignment Info Section */}
      <div className="xpo_p-6 xpo_bg-white xpo_h-full xpo_overflow-y-auto">
        <h2 className="xpo_text-xl xpo_font-semibold xpo_mb-4 xpo_flex xpo_items-center xpo_gap-2">
          <Tags className="xpo_w-5 xpo_h-5 xpo_text-blue-500" />
          Assignment Details
        </h2>
        
        {loading.assignment ? (
          <div className="xpo_text-center xpo_text-gray-500">Loading...</div>
        ) : assignment ? (
          <div className="xpo_space-y-4">
            <div className="xpo_flex xpo_items-center xpo_gap-3">
              <User className="xpo_w-5 xpo_h-5 xpo_text-blue-500" />
              <p>
                <span className="xpo_font-medium">Type:</span>{' '}
                {assignment.assignment_type}
              </p>
            </div>
            <div className="xpo_flex xpo_items-center xpo_gap-3">
              <DollarSign className="xpo_w-5 xpo_h-5 xpo_text-green-500" />
              <p>
                <span className="xpo_font-medium">Token Cost:</span>{' '}
                {assignment.tokens_cost}
              </p>
            </div>
            <div className="xpo_flex xpo_items-center xpo_gap-3">
              <Clock className="xpo_w-5 xpo_h-5 xpo_text-orange-500" />
              <p>
                <span className="xpo_font-medium">Budget:</span>{' '}
                {assignment.budgets}
              </p>
            </div>
          </div>
        ) : (
          <div className="xpo_text-center xpo_text-red-500">No Assignment Found</div>
        )}
      </div>
    </div>
  );
};

export default AssignmentDetailPage;