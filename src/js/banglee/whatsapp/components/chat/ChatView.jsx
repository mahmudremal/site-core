import React from 'react';
import { 
  Search, Phone, Video, Menu, MoreVertical, Settings, LogOut, 
  MessageSquarePlus, Archive, Star, Trash2, Reply, Forward, 
  Copy, Pin, VolumeX, UserPlus, Users, Bell, BellOff, 
  Camera, Mic, Send, Smile, Paperclip, Download, Play, 
  Pause, X, Check, CheckCheck, Clock, User, Crown,
  Shield, Heart, Edit3, Info, Volume2, Lock, Globe
} from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import Avatar from '../common/Avatar';
import Message from './Message';
import MessageInput from './MessageInput';
import Welcome from './Welcome';

// Enhanced Chat View
const ChatView = () => {
  const { activeChat, messages, setShowProfile, setShowGroupInfo } = useChat();

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-80 h-80 mx-auto mb-8 opacity-20">
            <svg viewBox="0 0 303 172" className="w-full h-full">
              <defs>
                <linearGradient id="a" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#f0f0f0"/>
                  <stop offset="100%" stopColor="#e0e0e0"/>
                </linearGradient>
              </defs>
              <path fill="url(#a)" d="M229.1 142.1c-1.3-1.3-2.6-2.6-4-3.8l-46.8-46.8c-2.7-2.7-7.1-2.7-9.8 0s-2.7 7.1 0 9.8l46.8 46.8c1.4 1.4 2.7 2.7 4 4l-46.8 46.8c-2.7 2.7-2.7 7.1 0 9.8 1.4 1.4 3.1 2.1 4.9 2.1s3.5-.7 4.9-2.1l46.8-46.8c2.7-2.7 2.7-7.1 0-9.8z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-light text-gray-700 mb-4">WhatsApp Web</h1>
          <p className="text-gray-500 mb-8">Send and receive messages without keeping your phone online.</p>
          <div className="flex items-center justify-center text-sm text-gray-400">
            <Lock className="w-4 h-4 mr-2" />
            <span>End-to-end encrypted</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <header className="p-4 bg-gray-50 flex justify-between items-center border-b">
        <div 
          className="flex items-center cursor-pointer hover:bg-gray-100 rounded-lg p-2 -ml-2"
          onClick={() => activeChat.isGroup ? setShowGroupInfo(true) : setShowProfile(true)}
        >
          <Avatar 
            src={activeChat.profilePicUrl} 
            name={activeChat.name} 
            size="md"
            isGroup={activeChat.isGroup}
            status={!activeChat.isGroup ? 'online' : null}
          />
          <div className="ml-3">
            <h2 className="font-medium text-gray-900">{activeChat.name}</h2>
            <p className="text-sm text-gray-500">
              {activeChat.isGroup 
                ? `${activeChat.participants?.length || 0} participants`
                : 'last seen today at 6:12 PM'
              }
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        className="flex-1 p-4 overflow-y-auto space-y-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.3'%3E%3Cpath d='m0 40l40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#efeae2'
        }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <MessageSquarePlus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No messages here yet...</p>
            <p className="text-sm mt-2">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map(msg => (
            <Message key={msg.id.id} message={msg} />
          ))
        )}
      </div>

      {/* Message Input */}
      <MessageInput />
    </div>
  );
};

export default ChatView;
