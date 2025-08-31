const { z } = require("zod");
const qrcode = require('qrcode-terminal');
// const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");

class WhatsAppAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = "whatsapp";
        this.client = null;
        this.ready = false;
        this._messageListeners = [];
    }

    async init() {
        return;
        this.client = new Client({
            authStrategy: new LocalAuth()
        });

        this.client.on("ready", () => {
            this.ready = true;
        });

        this.client.on("message", msg => {
            for (const listener of this._messageListeners) {
                listener(msg);
            }
        });

        this.client.on('qr', (qr) => {
            console.log('🔗 Scan this QR code with your phone:');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('authenticated', () => {
            console.log('✅ WhatsApp authenticated successfully!');
        });

        this.client.on('auth_failure', msg => {
            console.error('❌ Authentication failed:', msg);
        });

        await this.client.initialize();
        return true;
    }

    _assertReady() {
        if (!this.ready) throw new Error("WhatsApp client not ready");
    }

    async _findChatById(chatId) {
        const chat = await this.client.getChatById(chatId);
        if (!chat) throw new Error("Chat not found");
        return chat;
    }

    getTools() {
        return [
            {
                title: "Send Message",
                name: "wa_send_message",
                description: "Send a text message to a chat",
                inputSchema: {
                    chatId: z.string(),
                    message: z.string()
                },
                handler: async ({ chatId, message }) => {
                    this._assertReady();
                    const chat = await this._findChatById(chatId);
                    const sentMsg = await chat.sendMessage(message);
                    return { id: sentMsg.id._serialized };
                }
            },
            {
                title: "Reply to Message",
                name: "wa_reply_message",
                description: "Reply to an existing message",
                inputSchema: {
                    chatId: z.string(),
                    messageId: z.string(),
                    message: z.string()
                },
                handler: async ({ chatId, messageId, message }) => {
                    this._assertReady();
                    const msg = await this.client.getMessageById(messageId);
                    if (!msg) throw new Error("Message to reply not found");
                    const sentMsg = await msg.reply(message);
                    return { id: sentMsg.id._serialized };
                }
            },
            {
                title: "Get Chat Info",
                name: "wa_get_chat_info",
                description: "Get info about a chat by ID",
                inputSchema: {
                    chatId: z.string()
                },
                handler: async ({ chatId }) => {
                    this._assertReady();
                    const chat = await this._findChatById(chatId);
                    return {
                        id: chat.id._serialized,
                        name: chat.name || null,
                        isGroup: chat.isGroup,
                        participants: chat.participants?.map(p => p.id._serialized) || []
                    };
                }
            },
            {
                title: "List Chats",
                name: "wa_list_chats",
                description: "List all chats",
                inputSchema: {},
                handler: async () => {
                    this._assertReady();
                    const chats = await this.client.getChats();
                    return {
                        chats: chats.map(c => ({
                            id: c.id._serialized,
                            name: c.name || null,
                            isGroup: c.isGroup,
                            unreadCount: c.unreadCount || 0
                        }))
                    };
                }
            },
            {
                title: "Delete Message",
                name: "wa_delete_message",
                description: "Delete a message by ID",
                inputSchema: {
                    messageId: z.string(),
                    forEveryone: z.boolean().optional().default(false)
                },
                handler: async ({ messageId, forEveryone }) => {
                    this._assertReady();
                    const msg = await this.client.getMessageById(messageId);
                    if (!msg) throw new Error("Message not found");
                    await msg.delete(forEveryone);
                    return { success: true };
                }
            },
            {
                title: "Mark Chat as Read",
                name: "wa_mark_chat_read",
                description: "Mark all messages in a chat as read",
                inputSchema: {
                    chatId: z.string()
                },
                handler: async ({ chatId }) => {
                    this._assertReady();
                    const chat = await this._findChatById(chatId);
                    await chat.sendSeen();
                    return { success: true };
                }
            },
            {
                title: "Send Media",
                name: "wa_send_media",
                description: "Send media file to chat (image, video, audio, document)",
                inputSchema: {
                    chatId: z.string(),
                    mediaBase64: z.string(),
                    mimetype: z.string(),
                    filename: z.string().optional(),
                    caption: z.string().optional()
                },
                handler: async ({ chatId, mediaBase64, mimetype, filename, caption }) => {
                    this._assertReady();
                    const chat = await this._findChatById(chatId);
                    const buffer = Buffer.from(mediaBase64, "base64");
                    const media = new MessageMedia(mimetype, buffer.toString("base64"), filename);
                    const msg = await chat.sendMessage(media, { caption });
                    return { id: msg.id._serialized };
                }
            },
            {
                title: "Get Chat History",
                name: "wa_get_chat_history",
                description: "Get message history from a chat with optional limit and search",
                inputSchema: {
                    chatId: z.string(),
                    limit: z.number().optional().default(50),
                    searchText: z.string().optional()
                },
                handler: async ({ chatId, limit, searchText }) => {
                    this._assertReady();
                    const chat = await this._findChatById(chatId);
                    const messages = await chat.fetchMessages({ limit });
                    
                    let filteredMessages = messages;
                    if (searchText) {
                        filteredMessages = messages.filter(msg => 
                            msg.body && msg.body.toLowerCase().includes(searchText.toLowerCase())
                        );
                    }
                    
                    return {
                        chatId: chat.id._serialized,
                        chatName: chat.name || null,
                        messages: filteredMessages.map(msg => ({
                            id: msg.id._serialized,
                            body: msg.body || null,
                            timestamp: msg.timestamp,
                            from: msg.from,
                            to: msg.to,
                            author: msg.author || null,
                            isFromMe: msg.fromMe,
                            type: msg.type,
                            hasMedia: msg.hasMedia,
                            isForwarded: msg.isForwarded,
                            isStatus: msg.isStatus,
                            isStarred: msg.isStarred,
                            deviceType: msg.deviceType
                        }))
                    };
                }
            },
            {
                title: "Search Messages",
                name: "wa_search_messages",
                description: "Search for messages across all chats or specific chat",
                inputSchema: {
                    query: z.string(),
                    chatId: z.string().optional(),
                    limit: z.number().optional().default(100)
                },
                handler: async ({ query, chatId, limit }) => {
                    this._assertReady();
                    const results = [];
                    
                    if (chatId) {
                        // Search in specific chat
                        const chat = await this._findChatById(chatId);
                        const messages = await chat.fetchMessages({ limit });
                        const matches = messages.filter(msg => 
                            msg.body && msg.body.toLowerCase().includes(query.toLowerCase())
                        );
                        
                        results.push({
                            chatId: chat.id._serialized,
                            chatName: chat.name || null,
                            matches: matches.map(msg => ({
                                id: msg.id._serialized,
                                body: msg.body,
                                timestamp: msg.timestamp,
                                from: msg.from,
                                isFromMe: msg.fromMe,
                                type: msg.type
                            }))
                        });
                    } else {
                        // Search across all chats
                        const chats = await this.client.getChats();
                        const searchLimit = Math.min(limit / chats.length, 20); // Distribute limit across chats
                        
                        for (const chat of chats.slice(0, 10)) { // Limit to first 10 chats to avoid timeout
                            try {
                                const messages = await chat.fetchMessages({ limit: searchLimit });
                                const matches = messages.filter(msg => 
                                    msg.body && msg.body.toLowerCase().includes(query.toLowerCase())
                                );
                                
                                if (matches.length > 0) {
                                    results.push({
                                        chatId: chat.id._serialized,
                                        chatName: chat.name || null,
                                        matches: matches.map(msg => ({
                                            id: msg.id._serialized,
                                            body: msg.body,
                                            timestamp: msg.timestamp,
                                            from: msg.from,
                                            isFromMe: msg.fromMe,
                                            type: msg.type
                                        }))
                                    });
                                }
                            } catch (error) {
                                // Skip chats that can't be accessed
                                continue;
                            }
                        }
                    }
                    
                    return {
                        query,
                        totalResults: results.reduce((sum, chat) => sum + chat.matches.length, 0),
                        results
                    };
                }
            },
            {
                title: "Get Message Details",
                name: "wa_get_message_details",
                description: "Get detailed information about a specific message",
                inputSchema: {
                    messageId: z.string()
                },
                handler: async ({ messageId }) => {
                    this._assertReady();
                    const msg = await this.client.getMessageById(messageId);
                    if (!msg) throw new Error("Message not found");
                    
                    let mediaData = null;
                    if (msg.hasMedia) {
                        try {
                            const media = await msg.downloadMedia();
                            mediaData = {
                                mimetype: media.mimetype,
                                filename: media.filename,
                                filesize: media.filesize,
                                data: media.data // Base64 encoded
                            };
                        } catch (error) {
                            mediaData = { error: "Failed to download media" };
                        }
                    }
                    
                    return {
                        id: msg.id._serialized,
                        body: msg.body || null,
                        timestamp: msg.timestamp,
                        from: msg.from,
                        to: msg.to,
                        author: msg.author || null,
                        isFromMe: msg.fromMe,
                        type: msg.type,
                        hasMedia: msg.hasMedia,
                        mediaData,
                        isForwarded: msg.isForwarded,
                        isStatus: msg.isStatus,
                        isStarred: msg.isStarred,
                        deviceType: msg.deviceType,
                        links: msg.links || [],
                        mentionedIds: msg.mentionedIds || [],
                        isGif: msg.isGif || false,
                        duration: msg.duration || null,
                        location: msg.location || null
                    };
                }
            },
            {
                title: "Get Chat Members",
                name: "wa_get_chat_members",
                description: "Get list of members in a group chat",
                inputSchema: {
                    chatId: z.string()
                },
                handler: async ({ chatId }) => {
                    this._assertReady();
                    const chat = await this._findChatById(chatId);
                    
                    if (!chat.isGroup) {
                        throw new Error("This is not a group chat");
                    }
                    
                    return {
                        chatId: chat.id._serialized,
                        chatName: chat.name,
                        participants: chat.participants.map(participant => ({
                            id: participant.id._serialized,
                            isAdmin: participant.isAdmin,
                            isSuperAdmin: participant.isSuperAdmin
                        })),
                        totalParticipants: chat.participants.length
                    };
                }
            },
            {
                title: "Search Chat by Name",
                name: "wa_search_chat_by_name",
                description: "Search for chats by name or contact name",
                inputSchema: {
                    query: z.string()
                },
                handler: async ({ query }) => {
                    this._assertReady();
                    const chats = await this.client.getChats();
                    
                    const matches = chats.filter(chat => {
                        const name = chat.name || chat.id.user || '';
                        return name.toLowerCase().includes(query.toLowerCase());
                    });
                    
                    return {
                        query,
                        matches: matches.map(chat => ({
                            id: chat.id._serialized,
                            name: chat.name || null,
                            isGroup: chat.isGroup,
                            unreadCount: chat.unreadCount || 0,
                            timestamp: chat.timestamp || null
                        }))
                    };
                }
            }
        ];
    }

    getResources() {
        return [];
    }

    getPrompts() {
        return [
            {
                title: "WhatsApp Assistant",
                name: "whatsapp_assistant",
                description: "Assist with WhatsApp messaging and chat management",
                arguments: [
                    {
                        name: "task",
                        description: "Describe the WhatsApp task you want help with",
                        required: false
                    }
                ],
                handler: async () => ({
                    description: "I can send, receive, reply, delete messages, list chats, and send media via WhatsApp.",
                    messages: [
                        {
                            role: "user",
                            content: {
                                type: "text",
                                text: "I can help manage your WhatsApp chats and messages."
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = WhatsAppAddon;