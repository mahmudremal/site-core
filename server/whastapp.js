const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, downloadMediaMessage } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { Ollama } = require('ollama');
const cors = require('cors');
const qrcode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const path = require('path');
const pino = require('pino');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const ollama = new Ollama({ host: 'http://localhost:11434' });

app.use(cors());
app.use(express.json());

let sock;
let qrCodeData = null;
let isConnecting = false;
let botMode = 'auto'; // auto, manual, off

// In-memory store for chats and messages
const chats = new Map();
const messagesDB = new Map();
const conversationState = new Map();

const logger = pino({ level: 'silent' });

function getChatsWithLastMessage() {
    return Array.from(chats.values()).map(chat => {
        const chatMessages = messagesDB.get(chat.id);
        const lastMessage = chatMessages ? chatMessages[chatMessages.length - 1] : null;
        return { ...chat, lastMessage };
    });
}

async function processMessage(message) {
    if (!message.message) return message;

    const messageType = Object.keys(message.message)[0];
    const messageContent = message.message[messageType];
    const isMedia = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'].includes(messageType);

    // console.log('messageContent', message)
    
    if (isMedia && messageContent.mediaKey) {
        const mime = messageContent.mimetype;
        try {
            const buffer = await downloadMediaMessage( message, 'buffer', {}, { logger, reuploadRequest: sock.updateMediaMessage });
            if (buffer) {message.mediaData = `data:${mime};base64,${buffer.toString('base64')}`;}
        } catch (error) {
            console.log(`Skipping media download for message ${message.key.id} due to error:`, error.message, messageContent);
            message.mediaDownloadFailed = true;
        }
    }
    return message;
}

async function generateAIResponse(message, options = {}) {
  const { streamToClient = false, chatId = null } = options;
  let fullResponse = '';
  try {
    const stream = await ollama.generate({
      model: 'gemma3:1b',
      prompt: message,
      stream: true,
    });

    for await (const chunk of stream) {
      fullResponse += chunk.response;
      if (streamToClient && chatId) {
        io.emit('ai-response-chunk', { chatId, chunk: chunk.response });
      }
    }

    if (streamToClient && chatId) {
      io.emit('ai-response-end', { chatId });
    }
    
    return fullResponse;

  } catch (error) {
    console.error('Error generating AI response:', error);
    return 'Sorry, I am unable to process your request at the moment.';
  }
}

async function connectToWhatsApp() {
  try {
    if (isConnecting) return;
    isConnecting = true;

    console.log('Connecting to WhatsApp...');
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);
    
    sock = makeWASocket({
      version,
      logger,
      auth: state,
      printQRInTerminal: true,
      shouldSyncHistoryMessage: () => true,
      browser: ['WhatsApp Bot', 'Chrome', '120.0'],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        console.log('QR Code received');
        qrcodeTerminal.generate(qr, { small: true });
        qrCodeData = await qrcode.toDataURL(qr);
        io.emit('qr-code', { qr: qrCodeData });
      }

      if (connection === 'close') {
        handleConnectionClose(lastDisconnect);
      } else if (connection === 'open') {
        isConnecting = false;
        qrCodeData = null;
        console.log('WhatsApp connection opened successfully');
        io.emit('whatsapp-connected');
      }
    });

    sock.ev.on('messaging-history.set', async ({ chats: newChats, messages: newMessages }) => {
        console.log(`Received ${newMessages.length} history messages`);

        newChats.forEach(chat => {
            if (!chats.has(chat.id)) {
                chats.set(chat.id, { ...chat, unreadCount: chat.unreadCount || 0 });
            }
        });

        for (const msg of newMessages) {
            const processedMsg = await processMessage(msg);
            const chatId = processedMsg.key.remoteJid;
            if (!messagesDB.has(chatId)) {
                messagesDB.set(chatId, []);
            }
            messagesDB.get(chatId).unshift(processedMsg);
        }

        console.log('Finished processing history. Emitting updated chat-list.');
        io.emit('chat-list', getChatsWithLastMessage());
    });

    sock.ev.on('chats.set', ({ chats: newChats }) => {
        console.log('Received chats.set event with', newChats.length, 'chats.');
        newChats.forEach(chat => {
            chats.set(chat.id, { ...chat, unreadCount: chat.unreadCount || 0 });
        });
        console.log('Emitting chat-list to all clients with', chats.size, 'chats.');
        io.emit('chat-list', getChatsWithLastMessage());
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        const processedMessage = await processMessage(message);
        const chatId = processedMessage.key.remoteJid;

        if (!messagesDB.has(chatId)) {
            messagesDB.set(chatId, []);
        }
        messagesDB.get(chatId).push(processedMessage);

        if (chats.has(chatId)) {
            io.emit('new-message', { chatId, message: processedMessage });
        } else {
            const newChat = { id: processedMessage.pushName || chatId, name: processedMessage.pushName || chatId, unreadCount: 1 };
            chats.set(chatId, newChat);
            io.emit('chat-list', getChatsWithLastMessage());
        }

        if (!processedMessage.key.fromMe && botMode === 'auto') {
            startAICountdown(chatId, processedMessage);
        }
    });

  } catch (error) {
    isConnecting = false;
    console.error('Error connecting to WhatsApp:', error);
    setTimeout(() => connectToWhatsApp(), 10000);
  }
}

function handleConnectionClose(lastDisconnect) {
  isConnecting = false;
  const shouldReconnect = (lastDisconnect?.error instanceof Boom) 
    ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
    : true;
  
  console.log('Connection closed:', lastDisconnect?.error?.output?.statusCode);
  
  if (shouldReconnect) {
    console.log('Reconnecting...');
    connectToWhatsApp();
  } else {
    qrCodeData = null;
    io.emit('connection-lost');
  }
}

function startAICountdown(chatId, message) {
    if (conversationState.has(chatId) && conversationState.get(chatId).timer) {
        clearTimeout(conversationState.get(chatId).timer);
    }

    const timer = setTimeout(async () => {
        const messageText = message?.message?.conversation || message?.message?.extendedTextMessage?.text || '';
        if (messageText) {
            const aiResponse = await generateAIResponse(messageText);
            await sock.sendMessage(chatId, { text: aiResponse });
        }
        conversationState.delete(chatId);
    }, 15000); // 15s countdown

    conversationState.set(chatId, { timer });
}

io.on('connection', (socket) => {
  console.log('Client connected. Emitting initial chat list with', chats.size, 'chats.');
  socket.emit('bot-mode-updated', botMode);
  socket.emit('chat-list', getChatsWithLastMessage());

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('get-chat-history', (chatId) => {
    socket.emit('chat-history', { chatId, history: messagesDB.get(chatId) || [] });
  });

  socket.on('send-manual-message', async ({ chatId, text }) => {
    if (conversationState.has(chatId) && conversationState.get(chatId).timer) {
        clearTimeout(conversationState.get(chatId).timer);
        conversationState.delete(chatId);
    }
    await sock.sendMessage(chatId, { text });
  });

  socket.on('user-typing-in-chat', ({ chatId }) => {
    if (conversationState.has(chatId) && conversationState.get(chatId).timer) {
        clearTimeout(conversationState.get(chatId).timer);
        conversationState.delete(chatId);
        console.log(`AI response cancelled for ${chatId} due to user typing.`);
    }
  });

  socket.on('set-bot-mode', (mode) => {
    botMode = mode;
    console.log(`Bot mode set to: ${botMode}`);
    io.emit('bot-mode-updated', botMode);
  });

  socket.on('let-ai-respond', async ({ chatId, messageText }) => {
    const aiResponse = await generateAIResponse(messageText, { streamToClient: true, chatId });
    if (aiResponse) {
      await sock.sendMessage(chatId, { text: aiResponse });
    }
  });
});

// don't remove these 3 route. must necessery
app.get('/styling.css', (req, res) => {
  res.sendFile(path.join(__dirname, '../styling.css'));
});
app.get('/dist/js/wa.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/js/wa.js'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/admin.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectToWhatsApp();
});

module.exports = { app, server };