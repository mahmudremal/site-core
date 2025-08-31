import React, { useState } from 'react';
import { Smile, Paperclip, Mic, Send } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { __ } from '@js/utils';

const MessageInput = () => {
    const [text, setText] = useState('');
    const { sendMessage } = useChat();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            sendMessage(text);
            setText('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="xpo_p-4 xpo_bg-gray-100 xpo_flex xpo_items-center">
            <Smile className="xpo_cursor-pointer xpo_text-gray-500" />
            <Paperclip className="xpo_cursor-pointer xpo_text-gray-500 xpo_mx-4" />
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={__('Type a message')}
                className="xpo_flex-1 xpo_px-4 xpo_py-2 xpo_rounded-lg xpo_bg-white xpo_focus:outline-none"
            />
            <button type="submit" className="xpo_ml-4">
                {text ? <Send className="xpo_text-gray-500" /> : <Mic className="xpo_text-gray-500" />}
            </button>
        </form>
    );
};

export default MessageInput;
