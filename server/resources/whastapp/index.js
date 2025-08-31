const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const WhatsAppService = require('./WhatsAppService');
const pino = require('pino');

const logger = pino({level: 'silent'});


class AppServer extends WhatsAppService  {
  constructor() {
    super();
  }

  init() {
    super.init();
  }

  configureExpress() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));

    this.app.get('/wa/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

    // Serve stored media files
    this.app.get('/wa/media/:file', (req, res) => {
      const fp = path.join(MEDIA_DIR, path.basename(req.params.file));
      if (fs.existsSync(fp)) res.sendFile(fp);
      else res.status(404).send('Not found');
    });

    // API endpoints for chats/messages
    this.app.get('/wa/api/chats', async (req, res) => {
      try {
        const chats = await this.getChats();
        res.json({ success: true, chats });
      } catch (e) { res.status(500).json({ success: false, error: e.toString() }); }
    });

    this.app.get('/wa/api/chats/:jid/messages', async (req, res) => {
      try {
        const msgs = await this.getMessagesForChat(req.params.jid, 500);
        res.json({ success: true, messages: msgs });
      } catch (e) { res.status(500).json({ success: false, error: e.toString() }); }
    });

    this.app.get('/wa/api/groups', async (req, res) => {
      try {
        const groups = await this.getGroups();
        res.json({ success: true, groups });
      } catch (e) { res.status(500).json({ success: false, error: e.toString() }); }
    });

    this.app.get('/wa/api/groups/:jid/members', async (req, res) => {
      try {
        const members = await this.getGroupMembers(req.params.jid);
        res.json({ success: true, members });
      } catch (e) { res.status(500).json({ success: false, error: e.toString() }); }
    });

    // Create a new channel
    this.app.get('/wa/api/channels', async (req, res) => {
      try {
        // const { id, name } = req.body;
        const channels = await this.getChannels({  });
        res.json({ success: true, channels });
      } catch (e) {
        res.status(500).json({ success: false, error: e.toString() });
      }
    });
    this.app.post('/wa/api/channels', async (req, res) => {
      try {
        const { id, name } = req.body;
        await this.createChannel({ id, name });
        res.json({ success: true, channel: { id, name } });
      } catch (e) {
        res.status(500).json({ success: false, error: e.toString() });
      }
    });

    // Add member to channel
    this.app.post('/wa/api/channels/:channelId/members', async (req, res) => {
      try {
        const { contactId } = req.body;
        await this.addChannelMember(req.params.channelId, contactId);
        res.json({ success: true, channelId: req.params.channelId, contactId });
      } catch (e) {
        res.status(500).json({ success: false, error: e.toString() });
      }
    });

    // Get channel members
    this.app.get('/wa/api/channels/:channelId/members', async (req, res) => {
      try {
        const members = await this.getChannelMembers(req.params.channelId);
        res.json({ success: true, members });
      } catch (e) {
        res.status(500).json({ success: false, error: e.toString() });
      }
    });

    // Broadcast a message
    this.app.post('/wa/api/channels/:channelId/broadcast', async (req, res) => {
      try {
        const { text } = req.body;
        const result = await this.broadcastMessage(req.params.channelId, text);
        res.json({ success: true, result });
      } catch (e) {
        res.status(500).json({ success: false, error: e.toString() });
      }
    });

    // Get channel messages
    this.app.get('/wa/api/channels/:channelId/messages', async (req, res) => {
      try {
        const msgs = await this.getChannelMessages(req.params.channelId, 200);
        res.json({ success: true, messages: msgs });
      } catch (e) {
        res.status(500).json({ success: false, error: e.toString() });
      }
    });

  }

  configureSocket() {
    this.io.on('connection', (socket) => {
      logger.info('Socket client connected');
      const status = this.sock?.ws?.readyState === 1 ? 'connected' : 'disconnected';
      // socket.emit('status', { status });
      this.io.emit('status', { status: 'connected' });

      socket.on('disconnect', () => logger.info('Socket client disconnected'));

      socket.on('get_status', () => socket.emit('status', { status: this.sock?.ws?.readyState === 1 ? 'connected' : 'disconnected' }));

      socket.on('send_message', async ({ jid, text }) => {
        try {
          if (!this.sock) return socket.emit('error', { message: 'WhatsApp client not connected' });
          if (!text) return socket.emit('error', { message: 'Text is required' });
          const sent = await this.sendMessage(jid, text);
          socket.emit('message_sent', { id: sent.key.id, jid: jidNormalizedUser(jid), status: 'sent' });
        } catch (e) { logger.error(e); socket.emit('error', { message: e.toString() }); }
      });

      socket.on('get_chats', async () => {
        try { const chats = await this.getChats(); socket.emit('chats', chats); } catch (e) { socket.emit('error', { message: e.toString() }); }
      });

      socket.on('get_chat_messages', async ({ jid }) => {
        try { const msgs = await this.getMessagesForChat(jid); socket.emit('chat_messages', { jid, messages: msgs }); } catch (e) { socket.emit('error', { message: e.toString() }); }
      });

      socket.on('get_groups', async () => {
        try { const groups = await this.getGroups(); socket.emit('groups', groups); } catch (e) { socket.emit('error', { message: e.toString() }); }
      });

      socket.on('get_group_members', async ({ jid }) => {
        try {
          const result = await this.getGroupMembers(jid);
          socket.emit('group_members', result);
        } catch (e) { socket.emit('error', { message: e.toString() }); }
      });

      // Create channel
      socket.on('get_channels', async () => {
        try {
          const channels = await this.getChannels({  });
          socket.emit('channels_list', channels);
        } catch (e) {
          socket.emit('error', { message: e.toString() });
        }
      });

      // Create channel
      socket.on('create_channel', async ({ id, name }) => {
        try {
          await this.createChannel({ id, name });
          socket.emit('channel_created', { id, name });
        } catch (e) {
          socket.emit('error', { message: e.toString() });
        }
      });

      // Add member to channel
      socket.on('add_channel_member', async ({ channelId, contactId }) => {
        try {
          await this.addChannelMember(channelId, contactId);
          socket.emit('channel_member_added', { channelId, contactId });
        } catch (e) {
          socket.emit('error', { message: e.toString() });
        }
      });

      // Get members of a channel
      socket.on('get_channel_members', async ({ channelId }) => {
        try {
          const members = await this.getChannelMembers(channelId);
          socket.emit('channel_members', { channelId, members });
        } catch (e) {
          socket.emit('error', { message: e.toString() });
        }
      });

      // Broadcast message
      socket.on('broadcast_message', async ({ channelId, text }) => {
        try {
          const result = await this.broadcastMessage(channelId, text);
          socket.emit('broadcast_result', { channelId, result });
        } catch (e) {
          socket.emit('error', { message: e.toString() });
        }
      });

      // Get channel messages
      socket.on('get_channel_messages', async ({ channelId }) => {
        try {
          const msgs = await this.getChannelMessages(channelId);
          socket.emit('channel_messages', { channelId, messages: msgs });
        } catch (e) {
          socket.emit('error', { message: e.toString() });
        }
      });


    });
  }

  async start() {
    // await this.init();
    await this.connect();
    // this.httpServer.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  }
}

module.exports = AppServer;