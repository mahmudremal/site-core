import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { X, Users, Bell, Trash2, Save, Bot } from 'lucide-react';
import Avatar from '../common/Avatar';
import { __ } from '@js/utils';

const GroupInfoPanel = () => {
  const { showGroupInfo, setShowGroupInfo, activeChat, groupConfigs, updateGroupConfig } = useChat();
  const [aiEnabled, setAiEnabled] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const config = activeChat ? groupConfigs[activeChat.id._serialized] : null;

  useEffect(() => {
    if (config) {
      setAiEnabled(config.ai_enabled || false);
      setCustomPrompt(config.custom_prompt || '');
    } else {
      setAiEnabled(false);
      setCustomPrompt('');
    }
  }, [config]);

  if (!showGroupInfo || !activeChat || !activeChat.isGroup) return null;

  const handleSave = () => {
    const newConfig = {
      group_id: activeChat.id._serialized,
      group_name: activeChat.name,
      ai_enabled: aiEnabled,
      custom_prompt: customPrompt,
      is_offer_channel: config?.is_offer_channel || false,
      auto_process_offers: config?.auto_process_offers || false,
    };
    updateGroupConfig(activeChat.id._serialized, newConfig);
  };

  return (
    <div className="xpo_w-96 xpo_bg-white xpo_border-l xpo_border-gray-200 xpo_flex xpo_flex-col">
      <div className="xpo_p-4 xpo_bg-green-600 xpo_text-white">
        <div className="xpo_flex xpo_items-center xpo_justify-between">
          <h3 className="xpo_text-lg xpo_font-medium">{__('Group info')}</h3>
          <button onClick={() => setShowGroupInfo(false)}>
            <X className="xpo_w-5 xpo_h-5" />
          </button>
        </div>
      </div>
      
      <div className="xpo_flex xpo_flex-col xpo_items-center xpo_p-6 xpo_border-b">
        <Avatar src={activeChat.profilePicUrl} name={activeChat.name} size="lg" isGroup={true} />
        <h2 className="xpo_text-xl xpo_font-medium xpo_mt-4">{activeChat.name}</h2>
        <p className="xpo_text-sm xpo_text-gray-500 xpo_mt-1">
          {__('Group')} • {activeChat.participants?.length || 0} {__('participants')}
        </p>
      </div>

      <div className="xpo_flex-1 xpo_overflow-y-auto xpo_p-4 xpo_space-y-4">
        {/* AI Configuration Section */}
        <div className="xpo_p-3 xpo_bg-gray-50 xpo_rounded-lg">
          <div className="xpo_flex xpo_items-center xpo_mb-3">
            <Bot className="xpo_w-5 xpo_h-5 xpo_text-gray-600 xpo_mr-3" />
            <h4 className="xpo_font-semibold xpo_text-gray-800">{__('AI Settings')}</h4>
          </div>
          
          <div className="xpo_space-y-4">
            <div className="xpo_flex xpo_items-center xpo_justify-between">
              <label htmlFor="ai-monitoring" className="xpo_text-sm xpo_font-medium xpo_text-gray-700">{__('Enable AI Monitoring')}</label>
              <div className="xpo_relative xpo_inline-block xpo_w-10 xpo_mr-2 xpo_align-middle xpo_select-none xpo_transition xpo_duration-200 xpo_ease-in">
                <input 
                  type="checkbox" 
                  name="ai-monitoring" 
                  id="ai-monitoring" 
                  checked={aiEnabled}
                  onChange={() => setAiEnabled(!aiEnabled)}
                  className="xpo_toggle-checkbox xpo_absolute xpo_block xpo_w-6 xpo_h-6 xpo_rounded-full xpo_bg-white xpo_border-4 xpo_appearance-none xpo_cursor-pointer"
                />
                <label htmlFor="ai-monitoring" className="xpo_toggle-label xpo_block xpo_overflow-hidden xpo_h-6 xpo_rounded-full xpo_bg-gray-300 xpo_cursor-pointer"></label>
              </div>
            </div>

            <div>
              <label htmlFor="custom-prompt" className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-1">{__('Custom Prompt')}</label>
              <textarea
                id="custom-prompt"
                rows="4"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="xpo_w-full xpo_p-2 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_focus:ring-green-500 xpo_focus:border-green-500 xpo_text-sm"
                placeholder={__('Enter instructions for the AI...')}
                disabled={!aiEnabled}
              ></textarea>
              <p className="xpo_text-xs xpo_text-gray-500 xpo_mt-1">{__('This prompt will guide the AI\'s behavior in this channel.')}</p>
            </div>

            <button 
              onClick={handleSave}
              className="xpo_w-full xpo_flex xpo_items-center xpo_justify-center xpo_px-4 xpo_py-2 xpo_bg-green-600 xpo_text-white xpo_rounded-md xpo_hover:bg-green-700 xpo_focus:outline-none xpo_focus:ring-2 xpo_focus:ring-offset-2 xpo_focus:ring-green-500"
            >
              <Save className="xpo_w-4 xpo_h-4 xpo_mr-2" />
              {__('Save AI Settings')}
            </button>
          </div>
        </div>

        {/* Other group info can go here */}
        <div className="xpo_pt-4 xpo_border-t xpo_space-y-1">
          <div className="xpo_p-3 xpo_hover:bg-gray-50 xpo_cursor-pointer">
            <div className="xpo_flex xpo_items-center">
              <Bell className="xpo_w-4 xpo_h-4 xpo_mr-3 xpo_text-gray-600" />
              <span className="xpo_text-sm">{__('Mute notifications')}</span>
            </div>
          </div>
          <div className="xpo_p-3 xpo_hover:bg-red-50 xpo_cursor-pointer xpo_text-red-600">
            <div className="xpo_flex xpo_items-center">
              <Trash2 className="xpo_w-4 xpo_h-4 xpo_mr-3" />
              <span className="xpo_text-sm">{__('Delete chat')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupInfoPanel;
