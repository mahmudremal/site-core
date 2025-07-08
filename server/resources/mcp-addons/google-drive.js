const { google } = require('googleapis');
const { z } = require('zod');
const fs = require('fs');
const path = require('path');

class GoogleDriveAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        const token = null;
        this.name = 'google-drive';
        this.credentials = {};
        this.token = token;
        this.drive = null;
    }

    async _getDriveClient() {
        if (this.drive) return this.drive;
        const { client_secret, client_id, redirect_uris } = this.credentials.installed || this.credentials.web;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        oAuth2Client.setCredentials(this.token);
        this.drive = google.drive({ version: 'v3', auth: oAuth2Client });
        return this.drive;
    }

    async init() {
        await this._getDriveClient();
        return true;
    }

    getTools() {
        return [
            {
                title: 'List Files',
                name: 'list_files',
                description: 'List files with optional query',
                inputSchema: {
                    q: z.string().optional(),
                    pageSize: z.number().optional(),
                    fields: z.string().optional().default('files(id, name, mimeType, modifiedTime)')
                },
                handler: async ({ q, pageSize = 20, fields }) => {
                    const drive = await this._getDriveClient();
                    const res = await drive.files.list({
                        q,
                        pageSize,
                        fields: `nextPageToken, ${fields}`
                    });
                    return { files: res.data.files || [] };
                }
            },
            {
                title: 'Get File Metadata',
                name: 'get_file',
                description: 'Retrieve file metadata by ID',
                inputSchema: {
                    fileId: z.string()
                },
                handler: async ({ fileId }) => {
                    const drive = await this._getDriveClient();
                    const res = await drive.files.get({ fileId, fields: '*' });
                    return { file: res.data };
                }
            },
            {
                title: 'Delete File',
                name: 'delete_file',
                description: 'Delete file by ID',
                inputSchema: {
                    fileId: z.string()
                },
                handler: async ({ fileId }) => {
                    const drive = await this._getDriveClient();
                    await drive.files.delete({ fileId });
                    return { success: true };
                }
            },
            {
                title: 'Update File Metadata',
                name: 'update_file_metadata',
                description: 'Update file metadata fields',
                inputSchema: {
                    fileId: z.string(),
                    metadata: z.object({
                        name: z.string().optional(),
                        description: z.string().optional(),
                        mimeType: z.string().optional()
                    }).passthrough()
                },
                handler: async ({ fileId, metadata }) => {
                    const drive = await this._getDriveClient();
                    const res = await drive.files.update({ fileId, resource: metadata });
                    return { file: res.data };
                }
            },
            {
                title: 'Upload Local File',
                name: 'upload_file',
                description: 'Upload a local file to Google Drive',
                inputSchema: {
                    localPath: z.string(),
                    name: z.string().optional(),
                    mimeType: z.string().optional(),
                    parents: z.array(z.string()).optional()
                },
                handler: async ({ localPath, name, mimeType, parents }) => {
                    const drive = await this._getDriveClient();
                    const fullPath = path.resolve(localPath);
                    const fileName = name || path.basename(fullPath);
                    const fileSize = fs.statSync(fullPath).size;

                    const res = await drive.files.create({
                        requestBody: {
                            name: fileName,
                            mimeType,
                            parents
                        },
                        media: {
                            body: fs.createReadStream(fullPath)
                        },
                        fields: 'id, name, mimeType'
                    });

                    return { file: res.data };
                }
            },
            {
                title: 'Download File',
                name: 'download_file',
                description: 'Download a file from Google Drive to local path',
                inputSchema: {
                    fileId: z.string(),
                    localPath: z.string()
                },
                handler: async ({ fileId, localPath }) => {
                    const drive = await this._getDriveClient();
                    const destPath = path.resolve(localPath);
                    const destStream = fs.createWriteStream(destPath);

                    const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
                    await new Promise((resolve, reject) => {
                        res.data
                            .on('end', () => resolve())
                            .on('error', err => reject(err))
                            .pipe(destStream);
                    });

                    return { localPath: destPath, success: true };
                }
            },
            {
                title: 'Search Files',
                name: 'search_files',
                description: 'Search files using query string',
                inputSchema: {
                    query: z.string(),
                    pageSize: z.number().optional()
                },
                handler: async ({ query, pageSize = 20 }) => {
                    const drive = await this._getDriveClient();
                    const res = await drive.files.list({
                        q: query,
                        pageSize,
                        fields: 'files(id, name, mimeType, modifiedTime)'
                    });
                    return { files: res.data.files || [] };
                }
            }
        ];
    }

    getResources() {
        return [
            {
                uri: 'google-drive://about',
                title: 'Drive About Info',
                name: 'About',
                description: 'Google Drive account info and storage quota',
                mimeType: 'application/json',
                handler: async () => {
                    const drive = await this._getDriveClient();
                    const res = await drive.about.get({ fields: 'user, storageQuota' });
                    return { content: JSON.stringify(res.data) };
                }
            }
        ];
    }

    getPrompts() {
        return [
            {
                title: 'Drive Assistant',
                name: 'drive_assistant',
                description: 'Help with Google Drive file management',
                arguments: [{
                    name: 'task',
                    description: 'Describe the Drive related task',
                    required: false
                }],
                handler: async () => ({
                    description: 'I can assist with uploading, downloading, searching, and managing files on Google Drive.',
                    messages: [
                        {
                            role: 'user',
                            content: { type: 'text', text: 'I can help upload, download, edit, or delete Google Drive files.' }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = GoogleDriveAddon;