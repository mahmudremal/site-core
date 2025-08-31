
import { 
  Search, Phone, Video, Menu, MoreVertical, Settings, LogOut, 
  MessageSquarePlus, Archive, Star, Trash2, Reply, Forward, 
  Copy, Pin, VolumeX, UserPlus, Users, Bell, BellOff, 
  Camera, Mic, Send, Smile, Paperclip, Download, Play, 
  Pause, X, Check, CheckCheck, Clock, User, Crown,
  Shield, Heart, Edit3, Info, Volume2, Lock, Globe
} from 'lucide-react';
import { useEffect } from 'react';

// Context Menu Component
const ContextMenu = ({ isOpen, onClose, items, position }) => {
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = () => onClose();
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed bg-white rounded-lg shadow-xl border z-50 py-1 min-w-48"
      style={{ top: position.y, left: position.x }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm"
          onClick={() => {
            item.onClick();
            onClose();
          }}
        >
          {item.icon && <item.icon className="w-4 h-4 mr-3 text-gray-600" />}
          <span className={item.destructive ? 'text-red-600' : 'text-gray-800'}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};


export default ContextMenu;