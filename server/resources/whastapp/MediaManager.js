const fs = require('fs');
const path = require('path');
const axios = require('axios');

const Database = require('./Database');


// --- Media Manager ---
class MediaManager extends Database {
  constructor() {
    super();
  }

  init() {
    super.init();
    this.mediaDir = path.join(this.storage, 'medias');
    fs.mkdirSync(this.storage, { recursive: true });
    fs.mkdirSync(this.mediaDir, { recursive: true });
  }

  async saveFromUrl(url, suggestedName = null) {
    try {
      const res = await axios.get(url, { responseType: 'arraybuffer' });
      const contentType = res.headers['content-type'] || 'application/octet-stream';
      const ext = contentType.split('/').pop().split(";")[0] || 'bin';
      const fileName = suggestedName || `media_${Date.now()}.${ext}`;
      const filePath = path.join(this.mediaDir, fileName);
      fs.writeFileSync(filePath, Buffer.from(res.data));
      const stats = fs.statSync(filePath);
      return { fileName, filePath, mimeType: contentType, size: stats.size };
    } catch (e) {
      console.warn('Failed to fetch media from URL', e?.message || e);
      return null;
    }
  }

  async saveBuffer(buffer, suggestedName, mimeType) {
    const ext = (mimeType && mimeType.split('/').pop()) || 'bin';
    const fileName = suggestedName || `media_${Date.now()}.${ext}`;
    const filePath = path.join(this.mediaDir, fileName);
    fs.writeFileSync(filePath, buffer);
    const stats = fs.statSync(filePath);
    return { fileName, filePath, mimeType: mimeType || 'application/octet-stream', size: stats.size };
  }
}

module.exports = MediaManager;