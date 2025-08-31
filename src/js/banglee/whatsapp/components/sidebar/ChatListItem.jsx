import { 
  Search, Phone, Video, Menu, MoreVertical, Settings, LogOut, 
  MessageSquarePlus, Archive, Star, Trash2, Reply, Forward, 
  Copy, Pin, VolumeX, UserPlus, Users, Bell, BellOff, 
  Camera, Mic, Send, Smile, Paperclip, Download, Play, 
  Pause, X, Check, CheckCheck, Clock, User, Crown,
  Shield, Heart, Edit3, Info, Volume2, Lock, Globe,
  Circle
} from 'lucide-react';
import Avatar from '../common/Avatar';
import { useChat } from '../../contexts/ChatContext';
import { __ } from '@js/utils';
import { useState } from 'react';
import ContextMenu from './ContextMenu';


// Enhanced Chat List Item
const ChatListItem = ({ chat }) => {
  const { activeChat, selectChat } = useChat();
  const [contextMenu, setContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 } });
  const isActive = activeChat?.id._serialized === chat.id._serialized;

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY }
    });
  };

  const contextMenuItems = [
    { label: 'Archive chat', icon: Archive, onClick: () => console.log('Archive') },
    { label: 'Mute notifications', icon: VolumeX, onClick: () => console.log('Mute') },
    { label: 'Pin chat', icon: Pin, onClick: () => console.log('Pin') },
    { label: 'Mark as unread', icon: Circle, onClick: () => console.log('Mark unread') },
    { label: 'Delete chat', icon: Trash2, destructive: true, onClick: () => console.log('Delete') }
  ];

  return (
    <>
      <div
        className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors relative
          ${isActive ? 'bg-gray-100' : ''}
          ${chat.pinned ? 'bg-blue-50' : ''}
        `}
        onClick={() => selectChat(chat)}
        onContextMenu={handleContextMenu}
      >
        {chat.pinned && <Pin className="absolute top-1 right-1 w-3 h-3 text-gray-400" />}
        
        <div className="relative">
          <Avatar 
            src={chat.profilePicUrl} 
            name={chat.name} 
            isGroup={chat.isGroup}
            status={!chat.isGroup && chat.lastSeen && (Date.now() - chat.lastSeen < 300000) ? 'online' : null}
          />
          {chat.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1">
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </div>
          )}
        </div>

        <div className="ml-3 flex-1 border-b border-gray-100 pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {chat.name || chat.id.user}
              </h3>
              {chat.isGroup && <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            </div>
            <div className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {new Date(chat.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-gray-600 truncate flex-1">
              {chat.lastMessage?.body || 'No messages yet'}
            </p>
            <div className="flex items-center space-x-1 ml-2">
              {chat.lastMessage?.ack === 3 && <CheckCheck className="w-4 h-4 text-blue-500" />}
              {chat.lastMessage?.ack === 2 && <CheckCheck className="w-4 h-4 text-gray-400" />}
              {chat.lastMessage?.ack === 1 && <Check className="w-4 h-4 text-gray-400" />}
            </div>
          </div>
        </div>
      </div>

      <ContextMenu
        isOpen={contextMenu.isOpen}
        onClose={() => setContextMenu({ isOpen: false, position: { x: 0, y: 0 } })}
        items={contextMenuItems}
        position={contextMenu.position}
      />
    </>
  );
};

export default ChatListItem;
