import { useState, useEffect, useRef } from 'react';
import { Bot, MessageCircle, Send, Search, User, Smartphone, Wifi, WifiOff, CornerDownLeft } from 'lucide-react';
import { io } from 'socket.io-client';
import { createRoot } from 'react-dom/client';

const socket = io('http://localhost:3001');

function getMessageText(message) {
    if (!message || !message.message) return '';
    const m = message.message;
    if (m.conversation) return m.conversation;
    if (m.extendedTextMessage) return m.extendedTextMessage.text;
    if (m.imageMessage) return m.imageMessage.caption || '[Image]';
    if (m.videoMessage) return m.videoMessage.caption || '[Video]';
    if (m.audioMessage) return '[Audio]';
    if (m.documentMessage) return m.documentMessage.fileName || '[Document]';
    if (m.stickerMessage) return '[Sticker]';
    return 'Unsupported message type';
}

function ChatListItem({ chat, onSelect, isSelected }) {
    const lastMessage = chat.lastMessage ? getMessageText(chat.lastMessage) : 'No messages yet';
    return (
        <div 
            className={`xpo_p-3 xpo_flex xpo_items-center xpo_space-x-3 xpo_cursor-pointer hover:xpo_bg-gray-100 ${isSelected ? 'xpo_bg-gray-200' : ''}`}
            onClick={() => onSelect(chat.id)}
        >
            <div className="xpo_w-10 xpo_h-10 xpo_rounded-full xpo_bg-gray-300 xpo_flex-shrink-0"></div>
            <div className="xpo_flex-1 xpo_min-w-0">
                <div className="xpo_flex xpo_justify-between xpo_items-center">
                    <p className="xpo_font-semibold xpo_truncate">{chat.name || chat.id}</p>
                    {chat.lastMessage && <p className="xpo_text-xs xpo_text-gray-500">{new Date(chat.lastMessage.messageTimestamp * 1000).toLocaleTimeString()}</p>}
                </div>
                <p className="xpo_text-sm xpo_text-gray-600 xpo_truncate">{lastMessage}</p>
            </div>
        </div>
    );
}

function Message({ message }) {
    const isFromMe = message.key.fromMe;
    const messageContent = message.message;

    const renderMessageContent = () => {
        if (message.mediaDownloadFailed) {
            return <p className="xpo_text-red-500 italic">[Media expired or unavailable]</p>;
        }

        const mediaData = message.mediaData;
        const caption = messageContent.imageMessage?.caption || messageContent.videoMessage?.caption;

        if (mediaData) {
            if (messageContent.imageMessage) {
                return (
                    <div>
                        <img src={mediaData} alt={caption || 'Image'} className="xpo_max-w-full xpo_rounded-lg" />
                        {caption && <p className="xpo_mt-1">{caption}</p>}
                    </div>
                );
            }
            if (messageContent.videoMessage) {
                return (
                    <div>
                        <video src={mediaData} controls className="xpo_max-w-full xpo_rounded-lg" />
                        {caption && <p className="xpo_mt-1">{caption}</p>}
                    </div>
                );
            }
            if (messageContent.audioMessage) {
                return <audio src={mediaData} controls className="xpo_w-full" />;
            }
            if (messageContent.documentMessage) {
                return (
                    <div className="xpo_flex xpo_items-center xpo_space-x-2">
                        <CornerDownLeft className="xpo_w-5 xpo_h-5" />
                        <a href={mediaData} download={messageContent.documentMessage.fileName || 'document'} className="xpo_text-blue-600 hover:xpo_underline">
                            {messageContent.documentMessage.fileName || 'Download Document'}
                        </a>
                    </div>
                );
            }
            if (messageContent.stickerMessage) {
                return <img src={mediaData} alt="Sticker" className="xpo_w-32 xpo_h-32" />;
            }
        }

        if (messageContent.conversation || messageContent.extendedTextMessage) {
            return <p>{messageContent.conversation || messageContent.extendedTextMessage.text}</p>;
        }

        return <p className="xpo_text-gray-500 italic">Unsupported message type</p>;
    };

    return (
        <div className={`xpo_flex ${isFromMe ? 'xpo_justify-end' : 'xpo_justify-start'}`}>
            <div className={`xpo_max-w-lg xpo_px-4 xpo_py-2 xpo_rounded-lg ${isFromMe ? 'xpo_bg-green-200' : 'xpo_bg-white'}`}>
                {renderMessageContent()}
                <p className="xpo_text-xs xpo_text-gray-500 xpo_text-right xpo_mt-1">{new Date(message.messageTimestamp * 1000).toLocaleTimeString()}</p>
            </div>
        </div>
    );
}

function ChatWindow({ chatId, onSendMessage }) {
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (chatId) {
            socket.emit('get-chat-history', chatId);
            socket.on('chat-history', ({ chatId: receivedChatId, history: newHistory }) => {
                if (receivedChatId === chatId) {
                    setHistory(newHistory);
                }
            });

            const handleNewMessage = ({ chatId: receivedChatId, message: newMessage }) => {
                if (receivedChatId === chatId) {
                    setHistory(prev => [...prev, newMessage]);
                }
            };
            socket.on('new-message', handleNewMessage);

            return () => {
                socket.off('chat-history');
                socket.off('new-message', handleNewMessage);
            }
        }
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(chatId, message.trim());
            setMessage('');
        }
    };

    if (!chatId) {
        return <div className="xpo_flex xpo_items-center xpo_justify-center xpo_h-full xpo_text-gray-500">Select a chat to start messaging</div>;
    }

    return (
        <div className="xpo_flex xpo_flex-col xpo_h-full">
            <div className="xpo_flex-1 xpo_overflow-y-auto xpo_p-4 xpo_space-y-4">
                {history.map(msg => <Message key={msg.key.id} message={msg} />)}
                <div ref={messagesEndRef} />
            </div>
            <div className="xpo_p-4 xpo_bg-gray-100">
                <div className="xpo_flex xpo_items-center xpo_space-x-2">
                    <input 
                        type="text" 
                        className="xpo_flex-1 xpo_p-2 xpo_border xpo_rounded-full focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-green-500"
                        placeholder="Type a message..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={handleSend} className="xpo_p-2 xpo_bg-green-600 xpo_text-white xpo_rounded-full">
                        <Send className="xpo_w-5 xpo_h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function WABotApp() {
    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [botMode, setBotMode] = useState('auto');

    useEffect(() => {
        socket.on('messaging-history', (message) => {
            console.log(message);
        });
        socket.on('chat-list', (newChats) => {
            setChats(newChats);
        });

        socket.on('new-message', ({ chatId, message }) => {
            setChats(prevChats => prevChats.map(c => c.id === chatId ? { ...c, lastMessage: message } : c));
        });

        socket.on('bot-mode-updated', setBotMode);

        return () => {
            socket.off('chat-list');
            socket.off('new-message');
            socket.off('bot-mode-updated');
        }
    }, []);

    const handleSendMessage = (chatId, text) => {
        socket.emit('send-manual-message', { chatId, text });
    };

    const filteredChats = chats.filter(chat => 
        (chat.name || chat.id).toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => (b.lastMessage?.messageTimestamp || 0) - (a.lastMessage?.messageTimestamp || 0));

    return (
        <div className="xpo_h-screen xpo_bg-gray-100 xpo_flex xpo_flex-col">
            <header className="xpo_bg-green-600 xpo_text-white xpo_p-3 xpo_flex xpo_items-center xpo_justify-between xpo_flex-shrink-0">
                <div className="xpo_flex xpo_items-center xpo_space-x-3">
                    <Bot className="xpo_w-7 xpo_h-7" />
                    <h1 className="xpo_text-lg xpo_font-bold">WhatsApp AI Bot</h1>
                </div>
                <div className="xpo_flex xpo_items-center xpo_space-x-4">
                    <div className="xpo_flex xpo_items-center xpo_space-x-2">
                        <button onClick={() => socket.emit('set-bot-mode', 'auto')} className={`xpo_px-3 xpo_py-1 xpo_rounded-full xpo_text-xs ${botMode === 'auto' ? 'xpo_bg-blue-500' : 'xpo_bg-gray-700'}`}>Auto</button>
                        <button onClick={() => socket.emit('set-bot-mode', 'manual')} className={`xpo_px-3 xpo_py-1 xpo_rounded-full xpo_text-xs ${botMode === 'manual' ? 'xpo_bg-blue-500' : 'xpo_bg-gray-700'}`}>Manual</button>
                        <button onClick={() => socket.emit('set-bot-mode', 'off')} className={`xpo_px-3 xpo_py-1 xpo_rounded-full xpo_text-xs ${botMode === 'off' ? 'xpo_bg-blue-500' : 'xpo_bg-gray-700'}`}>Off</button>
                    </div>
                </div>
            </header>
            <div className="xpo_flex-1 xpo_flex xpo_overflow-hidden">
                <div className="xpo_w-1/3 xpo_border-r xpo_border-gray-200 xpo_flex xpo_flex-col">
                    <div className="xpo_p-3 xpo_border-b">
                        <div className="xpo_relative">
                            <Search className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_-translate-y-1/2 xpo_w-5 xpo_h-5 xpo_text-gray-400" />
                            <input 
                                type="text" 
                                className="xpo_w-full xpo_pl-10 xpo_pr-4 xpo_py-2 xpo_border xpo_rounded-full focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-green-500"
                                placeholder="Search chats..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="xpo_flex-1 xpo_overflow-y-auto">
                        {filteredChats.map(chat => (
                            <ChatListItem 
                                key={chat.id} 
                                chat={chat} 
                                onSelect={setSelectedChatId} 
                                isSelected={selectedChatId === chat.id}
                            />
                        ))}
                    </div>
                </div>
                <main className="xpo_w-2/3 xpo_flex xpo_flex-col">
                    <ChatWindow chatId={selectedChatId} onSendMessage={handleSendMessage} />
                </main>
            </div>
        </div>
    );
}

document.querySelectorAll('#root').forEach(async container => {
    const root = createRoot(container);
    root.render(<WABotApp />);
});