const baileys = require('@whiskeysockets/baileys');
const makeWASocket = baileys.default;
const {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    jidNormalizedUser
} = baileys;

const qrcodeTerminal = require('qrcode-terminal');
const axios = require('axios');

const Automation = require('./Automation');


// --- WhatsApp Service (wrap baileys) ---
class WhatsAppService extends Automation {
  constructor() {
    super();
    this.sock = null;
  }

  
  init() {
    super.init();
  }

  async connect() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const newSock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, this.logger)
      },
      logger: this.logger,
      // printQRInTerminal: true,
    });

    newSock.ev.on('creds.update', saveCreds);

    newSock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrcodeTerminal.generate(qr, { small: true });
        this.io.emit('qr', qr);
      }

      if (connection === 'open') {
        // console.log('WhatsApp connected');
        this.sock = newSock;
        this.io.emit('status', { status: 'connected' });
      } else if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
        // console.log('Connection closed. Reconnect?', shouldReconnect);
        this.io.emit('status', { status: 'disconnected' });
        if (shouldReconnect) this.connect().catch(console.error);
      }
    });

    newSock.ev.on('messages.upsert', async ({ messages }) => {
      for (const message of messages) {
        try {
          await this.handleIncomingMessage(message);
        } catch (e) {
          console.error('handleIncomingMessage error', e);
        }
      }
      this.io.emit('new_message', messages[0]);
    });

    // assign
    this.sock = newSock;
  }
  
  getFileExtensionFromMimeType(mimeType) {
    const mimeTypeMap = {
      'image/jpeg': 'jpeg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
      'image/webp': 'webp',
      'image/tiff': 'tiff',
      'image/bmp': 'bmp',
      'video/mp4': 'mp4',
      'video/mpeg': 'mpeg',
      'video/webm': 'webm',
      'video/quicktime': 'mov',
      'video/x-msvideo': 'avi',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/aac': 'aac',
      'audio/ogg': 'ogg',
      'audio/midi': 'midi',
      'audio/x-m4a': 'm4a',
      'text/plain': 'txt',
      'text/html': 'html',
      'text/css': 'css',
      'text/javascript': 'js',
      'application/json': 'json',
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.ms-powerpoint': 'ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'application/zip': 'zip',
      'application/x-rar-compressed': 'rar',
      'application/octet-stream': 'bin',
    };

    if (typeof mimeType !== 'string' || !mimeType.includes('/')) {
      return null;
    }
    
    const normalizedMimeType = mimeType.toLowerCase().trim();
    
    return mimeTypeMap[normalizedMimeType] || null;
  }

  extractLinks(text) {
    const urlRegex = /(?:https?|ftp|ws):\/\/[^\s]+|(?:www\.|[a-zA-Z0-9-]+\.)[a-zA-Z0-9-.]+\.[^\s]{2,}/gi;
    const links = text.match(urlRegex) || [];
    return links;
  }

  async handleIncomingMessage(message) {
    if (!message?.key || !message?.message) return;
    if (message?.key?.fromMe) return; // ignore our own outgoing (we handle sending elsewhere)
    const chatId = jidNormalizedUser(message.key.remoteJid || message.key.participant || message.key.remoteJid);
    const senderJid = message.key.participant || message.key.remoteJid;
    const fromMe = !!message.key.fromMe;
    const msgId = message.key.id;
    const timestamp = message.messageTimestamp ? new Date(message.messageTimestamp * 1000).toISOString() : this.nowISO();

    // Extract text
    let body = null;
    let msg_type = 'text';
    let mediaId = null;
    const links = [];

    // possible types
    const msgObj = message.message;
    if (msgObj.conversation) body = msgObj.conversation;
    else if (msgObj.extendedTextMessage) body = msgObj.extendedTextMessage?.text;
    else if (msgObj.imageMessage) {
      msg_type = 'image';
      body = msgObj.imageMessage?.caption || null;
      // attempt to save image if url present
      const url = msgObj.imageMessage?.url || null;
      if (url) {
        const saved = await this.saveFromUrl(url, `wa_${msgId}.${this.getFileExtensionFromMimeType(msgObj.imageMessage?.mimetype??'image/png')}`);
        if (saved) mediaId = await this.saveMedia(saved);
      }
    } else if (msgObj.videoMessage) {
      msg_type = 'video';
      body = msgObj.videoMessage?.caption || null;
      const url = msgObj.videoMessage?.url || null;
      if (url) {
        const saved = await this.saveFromUrl(url, `wa_${msgId}.${this.getFileExtensionFromMimeType(msgObj.videoMessage?.mimetype??'video/mp4')}`);
        if (saved) mediaId = await this.saveMedia(saved);
      }
    } else if (msgObj.documentMessage) {
      msg_type = 'document';
      body = msgObj.documentMessage?.title || null;
      const url = msgObj.documentMessage?.url || null;
      if (url) {
        const saved = await this.saveFromUrl(url, `wa_${msgId}.${this.getFileExtensionFromMimeType(msgObj.documentMessage?.mimetype??'application/msword')}`);
        if (saved) mediaId = await this.saveMedia(saved);
      }
    } else if (msgObj.stickerMessage) {
      msg_type = 'sticker';
      body = null;
    } else if (msgObj.contactMessage) {
      msg_type = 'contact';
      body = msgObj.contactMessage?.displayName || null;
    }

    if (body) links.push(...this.extractLinks(body));

    // Save contact & chat
    await this.upsertContact({ ...message, id: senderJid, name: message.pushName || null, pushname: message.pushName || null });
    await this.upsertChat({ ...message, id: chatId, subject: null, is_group: (chatId && chatId.endsWith('@g.us')), last_activity: timestamp });

    links?.length && axios.post('http://localhost:3000/crawler/update-links', {links: links.join(',')}).catch(err => console.log(err?.message));

    // Save message
    await this.saveMessage({
      id: msgId,
      chat_id: chatId,
      sender_jid: senderJid,
      from_me: fromMe,
      body,
      msg_type,
      timestamp,
      status: 'received',
      media_id: mediaId,
      links
    });
  }

  async sendMessage(jid, text) {
    if (!this.sock) throw new Error('WhatsApp client not connected');
    const normalized = jidNormalizedUser(jid);
    const sent = await this.sock.sendMessage(normalized, { text });
    // record chat & message
    const msgId = sent.key.id;
    const ts = this.nowISO();
    await this.upsertChat({ id: normalized, subject: null, is_group: normalized.endsWith('@g.us'), last_activity: ts, last_message_id: msgId });
    await this.upsertContact({ id: normalized, name: null });
    await this.saveMessage({ id: msgId, chat_id: normalized, sender_jid: this.sock.user?.id, from_me: 1, body: text, msg_type: 'text', timestamp: ts, status: 'sent' });
    return sent;
  }

  async getGroupMembers(jid) {
    if (!this.sock) throw new Error('WhatsApp client not connected');
    const normalized = jidNormalizedUser(jid);
    const metadata = await this.sock.groupMetadata(normalized);
    const members = metadata.participants.map(p => ({ jid: p.id, isAdmin: p.admin !== null, isSuperAdmin: p.admin === 'superadmin' }));
    // persist
    await this.upsertGroup({ id: normalized, subject: metadata.subject || null, created_by: metadata.creator || null, created_at: this.nowISO() });
    await this.setGroupMembers(normalized, members.map(m => ({ jid: m.jid, isAdmin: m.isAdmin, joinedAt: this.nowISO() })));
    return { jid: normalized, subject: metadata.subject, members };
  }

  async broadcastMessage(channelId, text) {
    const members = await this.getChannelMembers(channelId);
    if (!members.length) throw new Error('No members in channel');

    const results = [];
    for (const member of members) {
      try {
        const sent = await this.sendMessage(member.id, text);
        await this.saveChannelMessage({
          id: sent.key.id,
          channel_id: channelId,
          sender_jid: this.sock.user?.id,
          body: text,
          msg_type: 'text',
          status: 'sent'
        });
        results.push({ jid: member.id, status: 'sent' });
      } catch (e) {
        results.push({ jid: member.id, status: 'failed', error: e.toString() });
      }
    }
    return results;
  }

  nowISO() {
    return new Date().toISOString();
  }

}

module.exports = WhatsAppService;