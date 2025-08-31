import { useState } from 'react';
import { 
  Search, Phone, Video, Menu, MoreVertical, Settings, LogOut, 
  MessageSquarePlus, Archive, Star, Trash2, Reply, Forward, 
  Copy, Pin, VolumeX, UserPlus, Users, Bell, BellOff, 
  Camera, Mic, Send, Smile, Paperclip, Download, Play, 
  Pause, X, Check, CheckCheck, Clock, User, Crown,
  Shield, Heart, Edit3, Info, Volume2, Lock, Globe
} from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import ChatListItem from './ChatListItem';
import Avatar from '../common/Avatar';
import { __ } from '@js/utils';

// Enhanced Sidebar
const Sidebar = () => {
  const { chats, setShowProfile } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const filteredChats = chats.filter(chat =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
      {/* Header */}
      <header className="p-4 bg-gray-50 flex justify-between items-center border-b">
        <div className="relative">
          <Avatar name="You" size="md" />
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
          >
            <MoreVertical className="w-3 h-3 text-white" />
          </button>
          
          {showUserMenu && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border z-50 py-1 min-w-48">
              <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm flex items-center">
                <User className="w-4 h-4 mr-3 text-gray-600" />
                Profile
              </div>
              <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm flex items-center">
                <Settings className="w-4 h-4 mr-3 text-gray-600" />
                Settings
              </div>
              <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm flex items-center text-red-600">
                <LogOut className="w-4 h-4 mr-3" />
                Log out
              </div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <Users className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <MessageSquarePlus className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="p-3 bg-white border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white border"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex p-2 space-x-2 border-b">
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">All</span>
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">Unread</span>
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">Groups</span>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No chats found</p>
          </div>
        ) : (
          filteredChats.map(chat => (
            <ChatListItem key={chat.id._serialized} chat={chat} />
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
