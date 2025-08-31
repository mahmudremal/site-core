import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const socket = useSocket();
    const [authState, setAuthState] = useState('PENDING'); // PENDING, QR, AUTHENTICATED, FAILED
    const [qrCode, setQrCode] = useState('');
    const [chats, setChats] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [showProfile, setShowProfile] = useState(false);
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const [groupConfigs, setGroupConfigs] = useState({}); // New state

    useEffect(() => {
        if (!socket) return;

        socket.on('qr', (qr) => {
            setQrCode(qr);
            setAuthState('QR');
        });

        socket.on('ready', () => {
            setAuthState('AUTHENTICATED');
            socket.emit('get_chats');
            socket.emit('get_contacts');
            socket.emit('get_group_configs'); // Get configs on ready
        });

        socket.on('authenticated', () => {
            setAuthState('AUTHENTICATED');
            socket.emit('get_chats');
            socket.emit('get_contacts');
            socket.emit('get_group_configs'); // Get configs on auth
        });

        socket.on('auth_failure', () => {
            setAuthState('FAILED');
        });

        socket.on('disconnected', () => {
            setAuthState('PENDING');
            setQrCode('');
            setChats([]);
            setContacts([]);
            setActiveChat(null);
            setMessages([]);
            setGroupConfigs({});
        });

        socket.on('chats', (chats) => setChats(chats));
        socket.on('contacts', (contacts) => setContacts(contacts));
        socket.on('messages', (messages) => setMessages(messages));
        socket.on('message', (message) => {
            if (activeChat && message.from === activeChat.id._serialized) {
                setMessages(prev => [...prev, message]);
            }
        });

        // New listeners for group configs
        socket.on('group_configs', (configs) => {
            const configsMap = configs.reduce((acc, config) => {
                acc[config.group_id] = config;
                return acc;
            }, {});
            setGroupConfigs(configsMap);
        });

        socket.on('group_config_updated', ({ groupId, config }) => {
            setGroupConfigs(prev => ({
                ...prev,
                [groupId]: config
            }));
        });

        return () => {
            socket.off('qr');
            socket.off('ready');
            socket.off('authenticated');
            socket.off('auth_failure');
            socket.off('disconnected');
            socket.off('chats');
            socket.off('contacts');
            socket.off('messages');
            socket.off('message');
            socket.off('group_configs');
            socket.off('group_config_updated');
        };
    }, [socket, activeChat]);

    const selectChat = useCallback((chat) => {
        setActiveChat(chat);
        setMessages([]);
        setShowProfile(false); // Close panels on chat switch
        setShowGroupInfo(false); // Close panels on chat switch
        socket.emit('get_messages', { chatId: chat.id._serialized, options: { limit: 50 } });
    }, [socket]);

    const sendMessage = useCallback((content) => {
        if (activeChat) {
            socket.emit('send_message', { chatId: activeChat.id._serialized, content });
        }
    }, [socket, activeChat]);

    // New function to update group config
    const updateGroupConfig = useCallback((groupId, config) => {
        socket.emit('update_group_config', { groupId, config });
    }, [socket]);

    const value = {
        authState,
        qrCode,
        chats,
        contacts,
        activeChat,
        messages,
        selectChat,
        sendMessage,
        showProfile, setShowProfile,
        showGroupInfo, setShowGroupInfo,
        groupConfigs, // expose state
        updateGroupConfig // expose function
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
