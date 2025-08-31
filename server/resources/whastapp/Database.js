// --- Database class (SQLite) ---
class Database {
  constructor() {
  }

  init() {
    this.tables = {
      ...this.tables || {},
      contacts: `${this.db.prefix}_agi_whatsapp_contacts`,
      chats: `${this.db.prefix}_agi_whatsapp_chats`,
      groups: `${this.db.prefix}_agi_whatsapp_groups`,
      group_members: `${this.db.prefix}_agi_whatsapp_group_members`,
      media: `${this.db.prefix}_agi_whatsapp_media`,
      messages: `${this.db.prefix}_agi_whatsapp_messages`,
      channels: `${this.db.prefix}_agi_whatsapp_channels`,
      channel_members: `${this.db.prefix}_agi_whatsapp_channel_members`,
      channel_messages: `${this.db.prefix}_agi_whatsapp_channel_messages`
    };
    this.tableSchemas = {
      ...this.tableSchemas || {},
      contacts: `CREATE TABLE IF NOT EXISTS ${this.tables.contacts} (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        pushname VARCHAR(255),
        is_whatsapp_user BOOLEAN DEFAULT true,
        last_seen TIMESTAMP
      )`,
      chats: `CREATE TABLE IF NOT EXISTS ${this.tables.chats} (
        id VARCHAR(255) PRIMARY KEY,
        subject VARCHAR(255),
        is_group BOOLEAN DEFAULT false,
        unread_count INT DEFAULT 0,
        last_message_id VARCHAR(255),
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      groups: `CREATE TABLE IF NOT EXISTS ${this.tables.groups} (
        id VARCHAR(255) PRIMARY KEY,
        subject VARCHAR(255),
        created_by VARCHAR(255),
        created_at TIMESTAMP
      )`,
      group_members: `CREATE TABLE IF NOT EXISTS ${this.tables.group_members} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id VARCHAR(255),
        jid VARCHAR(255),
        is_admin BOOLEAN DEFAULT false,
        joined_at TIMESTAMP
      )`,
      media: `CREATE TABLE IF NOT EXISTS ${this.tables.media} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        file_name VARCHAR(255),
        file_path VARCHAR(255),
        mime_type VARCHAR(255),
        size INT,
        created_at TIMESTAMP
      )`,
      messages: `CREATE TABLE IF NOT EXISTS ${this.tables.messages} (
        id VARCHAR(255) PRIMARY KEY,
        chat_id VARCHAR(255),
        sender_jid VARCHAR(255),
        from_me BOOLEAN DEFAULT false,
        body TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
        msg_type VARCHAR(255),
        timestamp TIMESTAMP,
        status VARCHAR(255),
        media_id INT,
        links TEXT,
        quoted_msg_id VARCHAR(255)
      )`,
      channels: `CREATE TABLE IF NOT EXISTS ${this.tables.channels} (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP
      )`,
      channel_members: `CREATE TABLE IF NOT EXISTS ${this.tables.channel_members} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        channel_id VARCHAR(255),
        contact_id VARCHAR(255),
        joined_at TIMESTAMP
      )`,
      channel_messages: `CREATE TABLE IF NOT EXISTS ${this.tables.channel_messages} (
        id VARCHAR(255) PRIMARY KEY,
        channel_id VARCHAR(255),
        sender_jid VARCHAR(255),
        body TEXT,
        msg_type VARCHAR(255),
        timestamp TIMESTAMP,
        status VARCHAR(255)
      )`,
    };
  }

  async upsertContact(contact) {
    const sql = `INSERT INTO ${this.tables.contacts}(id, name, pushname, is_whatsapp_user, last_seen) VALUES(?, ?, ?, ?, FROM_UNIXTIME(?)) ON DUPLICATE KEY UPDATE name = ?, pushname = ?, last_seen = FROM_UNIXTIME(?)`;
    await this.db.execute(sql, [
      contact.id, contact.name || null, contact.pushname || null, true, contact.last_seen || null,
      contact.name || null, contact.pushname || null, contact.last_seen || null
    ]);
  }

  async upsertChat(chat) {
    await this.db.execute(`INSERT INTO ${this.tables.chats}(id, subject, is_group, unread_count, last_message_id, last_activity) VALUES(?, ?, ?, ?, ?, FROM_UNIXTIME(?)) ON DUPLICATE KEY UPDATE subject = ?, is_group = ?, unread_count = ?, last_message_id = ?, last_activity = FROM_UNIXTIME(?)`, [
      chat.id,
      chat.subject || null,
      chat.is_group ? true : false,
      chat.unread_count || 0,
      chat.last_message_id || null,
      chat.messageTimestamp,
      chat.subject || null,
      chat.is_group ? true : false,
      chat.unread_count || 0,
      chat.last_message_id || null,
      chat.messageTimestamp
    ]);
  }

  async upsertGroup(group) {
    const sql = `INSERT INTO ${this.tables.groups}(id, subject, created_by, created_at) VALUES(?, ?, ?, FROM_UNIXTIME(?)) ON DUPLICATE KEY UPDATE subject = ?`;
    await this.db.execute(sql, [
      group.id, group.subject || null, group.created_by || null, group.created_at || null,
      group.subject || null
    ]);
  }

  async setGroupMembers(groupId, members) {
    await this.db.execute(`DELETE FROM ${this.tables.group_members} WHERE group_id = ?`, [groupId]);
    const sql = `INSERT INTO ${this.tables.group_members}(group_id, jid, is_admin, joined_at) VALUES(?, ?, ?, FROM_UNIXTIME(?))`;
    const values = members.map(m => [groupId, m.jid, m.isAdmin ? true : false, m.joinedAt || new Date()]);
    await this.db.query(sql, values);
  }

  async saveMedia(args = {}) {
    Object.keys(args).forEach(key => {
      if (typeof args[key] === 'object') {
        args[key] = JSON.stringify(args[key]);
      }
    })
    const { fileName = '', filePath = '', mimeType = 'image/png', size = 0 } = args;
    const sql = `INSERT INTO ${this.tables.media}(file_name, file_path, mime_type, size, created_at)
      VALUES(?, ?, ?, ?, NOW())`;
    const [result] = await this.db.execute(sql, [fileName, filePath, mimeType, size]);
    return result.insertId;
  }

  async saveMessage(msg) {
    const sql = `INSERT INTO ${this.tables.messages}(id, chat_id, sender_jid, from_me, body, msg_type, timestamp, status, media_id, links, quoted_msg_id) VALUES(?, ?, ?, ?, ?, ?, FROM_UNIXTIME(?), ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?`;
    await this.db.execute(sql, [
      msg.id, msg.chat_id, msg.sender_jid, msg.from_me ? true : false, msg.body || null, msg.msg_type || 'text', new Date(msg.timestamp), msg.status || 'received', msg.media_id || null, Array.isArray(msg.links) ? msg.links.join(',') : (msg.links || null), msg.quoted_msg_id || null,
      msg.status || 'received'
    ]);
  }

  async getChats() {
    const [rows] = await this.db.execute(`SELECT * FROM ${this.tables.chats} ORDER BY last_activity DESC`);
    return rows;
  }

  async getMessagesForChat(chatId, limit = 100) {
    const [rows] = await this.db.execute(`SELECT * FROM ${this.tables.messages} WHERE chat_id = ? ORDER BY timestamp DESC LIMIT ?`, [chatId, limit]);
    return rows;
  }

  async getGroups() {
    const [rows] = await this.db.execute(`SELECT * FROM ${this.tables.groups}`);
    return rows;
  }

  async getGroupMembers(groupId) {
    const [rows] = await this.db.execute(`SELECT jid, is_admin, joined_at FROM ${this.tables.group_members} WHERE group_id = ?`, [groupId]);
    return rows;
  }

  async getChannels() {
    const [rows] = await this.db.execute(`SELECT * FROM ${this.tables.chats} WHERE id LIKE ?`, ['%@newsletter']);
    return rows;
  }

  async createChannel({ id, name }) {
    const sql = `INSERT INTO ${this.tables.channels}(id, name, created_at) VALUES(?, ?, FROM_UNIXTIME(?))`;
    await this.db.execute(sql, [id, name, new Date()]);
  }

  async addChannelMember(channelId, contactId) {
    const sql = `INSERT INTO ${this.tables.channel_members}(channel_id, contact_id, joined_at) VALUES(?, ?, FROM_UNIXTIME(?))`;
    await this.db.execute(sql, [channelId, contactId, new Date()]);
  }

  async getChannelMembers(channelId) {
    const [rows] = await this.db.execute(`SELECT c.* FROM ${this.tables.channel_members} cm JOIN ${this.tables.contacts} c ON cm.contact_id = c.id WHERE cm.channel_id = ?`, [channelId]);
    return rows;
  }

  async saveChannelMessage(msg) {
    const sql = `INSERT INTO ${this.tables.channel_messages}(id, channel_id, sender_jid, body, msg_type, timestamp, status) VALUES(?, ?, ?, ?, ?, FROM_UNIXTIME(?), ?)`;
    await this.db.execute(sql, [
      msg.id, msg.channel_id, msg.sender_jid, msg.body, msg.msg_type,
      new Date(msg.timestamp), msg.status || 'sent'
    ]);
  }

  async getChannelMessages(channelId, limit = 100) {
    const [rows] = await this.db.execute(`SELECT * FROM ${this.tables.channel_messages} WHERE channel_id = ? ORDER BY timestamp DESC LIMIT ?`, [channelId, limit]);
    return rows;
  }

  nowISO() {
    return new Date().toISOString();
  }

}


module.exports = Database;