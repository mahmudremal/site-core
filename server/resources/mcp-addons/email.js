const { z } = require('zod');
const nodemailer = require('nodemailer');
const Imap = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;

class EmailAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = 'email';
        this.smtpConfig = {
            host: 'mail.mahmudremal.com',
            port: 465,
            secure: true,
            auth: {
                user: 'hello@mahmudremal.com',
                pass: 'hhHQGa5BCA9F'
            }
        };
        this.imapConfig = {
            user: 'hello@mahmudremal.com',
            password: 'hhHQGa5BCA9F',
            host: 'mail.mahmudremal.com',
            port: 993,
            tls: true,
            authTimeout: 10000, // Increased timeout
            connTimeout: 10000,
            tlsOptions: {
                rejectUnauthorized: false
            }
        };
        this.transporter = null;
        this.imapConnection = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3;
    }

    async init() {
        try {
            // this.logEvent?.('info', 'Initializing email addon...');
            
            // Initialize SMTP transporter
            this.transporter = nodemailer.createTransport(this.smtpConfig);
            
            // Verify SMTP connection
            await this.transporter.verify();
            // this.logEvent?.('info', 'SMTP connection verified');
            
            // Initialize IMAP connection with retry logic
            await this._connectImap();
            
            // this.logEvent?.('info', 'Email addon initialized successfully');
            return true;
        } catch (error) {
            // this.logEvent?.('error', `Failed to initialize email addon: ${error.message}`);
            throw new Error(`Email addon initialization failed: ${error.message}`);
        }
    }

    async _connectImap() {
        let lastError;
        
        for (let attempt = 1; attempt <= this.maxReconnectAttempts; attempt++) {
            try {
                // this.logEvent?.('info', `IMAP connection attempt ${attempt}/${this.maxReconnectAttempts}`);
                
                if (this.imapConnection) {
                    try {
                        this.imapConnection.end();
                    } catch (e) {
                        // Ignore cleanup errors
                    }
                }
                
                this.imapConnection = await Imap.connect({ 
                    imap: this.imapConfig,
                    onReady: () => {
                        this.isConnected = true;
                        this.reconnectAttempts = 0;
                        // this.logEvent?.('info', 'IMAP connection established');
                    },
                    onClose: () => {
                        this.isConnected = false;
                        // this.logEvent?.('warn', 'IMAP connection closed');
                    },
                    onError: (error) => {
                        this.isConnected = false;
                        // this.logEvent?.('error', `IMAP connection error: ${error.message}`);
                    }
                });
                
                // Set up error handlers
                this.imapConnection.on('error', (error) => {
                    this.isConnected = false;
                    // this.logEvent?.('error', `IMAP error: ${error.message}`);
                });
                
                await this.imapConnection.openBox('INBOX');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                return;
                
            } catch (error) {
                lastError = error;
                this.isConnected = false;
                // this.logEvent?.('error', `IMAP connection attempt ${attempt} failed: ${error.message}`);
                
                if (attempt < this.maxReconnectAttempts) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff
                    // this.logEvent?.('info', `Retrying IMAP connection in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        throw new Error(`Failed to connect to IMAP after ${this.maxReconnectAttempts} attempts. Last error: ${lastError?.message}`);
    }

    async _ensureImapConnection() {
        if (!this.isConnected || !this.imapConnection) {
            // this.logEvent?.('info', 'IMAP connection lost, attempting to reconnect...');
            await this._connectImap();
        }
    }

    async _searchMessages(criteria, box = 'INBOX') {
        try {
            await this._ensureImapConnection();
            await this.imapConnection.openBox(box);
            
            const searchCriteria = criteria || ['ALL'];
            const fetchOptions = { bodies: ['HEADER', 'TEXT'], struct: true };
            const results = await this.imapConnection.search(searchCriteria, fetchOptions);
            
            const parsed = await Promise.all(results.map(async msg => {
                try {
                    const all = msg.parts.find(part => part.which === 'TEXT');
                    const headers = msg.parts.find(part => part.which === 'HEADER').body;
                    const parsedMail = await simpleParser(all.body);
                    
                    return {
                        seqNo: msg.seqNo,
                        attributes: msg.attributes,
                        subject: headers.subject ? headers.subject[0] : '',
                        from: headers.from ? headers.from[0] : '',
                        to: headers.to ? headers.to[0] : '',
                        date: headers.date ? headers.date[0] : '',
                        text: parsedMail.text || '',
                        html: parsedMail.html || '',
                        messageId: parsedMail.messageId,
                        flags: msg.attributes.flags
                    };
                } catch (parseError) {
                    // this.logEvent?.('error', `Failed to parse message ${msg.seqNo}: ${parseError.message}`);
                    return {
                        seqNo: msg.seqNo,
                        error: `Failed to parse message: ${parseError.message}`,
                        attributes: msg.attributes,
                        flags: msg.attributes.flags
                    };
                }
            }));
            
            return parsed;
        } catch (error) {
            // this.logEvent?.('error', `Failed to search messages: ${error.message}`);
            throw error;
        }
    }

    getTools() {
        return [
            {
                title: 'Send Email',
                name: 'send_email',
                description: 'Send an email with optional attachments',
                inputSchema: {
                    from: z.string().email(),
                    to: z.string(),
                    cc: z.string().optional(),
                    bcc: z.string().optional(),
                    subject: z.string(),
                    text: z.string().optional(),
                    html: z.string().optional(),
                    attachments: z.array(z.object({
                        filename: z.string(),
                        content: z.string(), // Base64 or text
                        encoding: z.enum(['base64', 'utf8']).optional().default('utf8'),
                        contentType: z.string().optional()
                    })).optional()
                },
                handler: async (args) => {
                    try {
                        const mailOptions = { ...args };
                        if (mailOptions.attachments) {
                            mailOptions.attachments = mailOptions.attachments.map(att => ({
                                filename: att.filename,
                                content: att.content,
                                encoding: att.encoding,
                                contentType: att.contentType
                            }));
                        }
                        
                        // Verify transporter is still working
                        if (!this.transporter) {
                            throw new Error('SMTP transporter not initialized');
                        }
                        
                        const info = await this.transporter.sendMail(mailOptions);
                        this.logEvent?.('info', `Email sent successfully: ${info.messageId}`);
                        return { success: true, messageId: info.messageId };
                    } catch (error) {
                        this.logEvent?.('error', `Failed to send email: ${error.message}`);
                        return { 
                            success: false, 
                            error: error.message,
                            details: 'Please check your SMTP configuration and network connection'
                        };
                    }
                }
            },
            {
                title: 'List Emails',
                name: 'list_emails',
                description: 'List emails from a mailbox with optional search criteria and limit',
                inputSchema: {
                    box: z.string().default('INBOX'),
                    limit: z.number().int().default(20),
                    unseenOnly: z.boolean().default(false)
                },
                handler: async ({ box = 'INBOX', limit = 20, unseenOnly = false }) => {
                    try {
                        const criteria = unseenOnly ? ['UNSEEN'] : ['ALL'];
                        const allMails = await this._searchMessages(criteria, box);
                        const mails = allMails.slice(-limit).reverse();
                        return { success: true, mails };
                    } catch (error) {
                        this.logEvent?.('error', `Failed to list emails: ${error.message}`);
                        return { 
                            success: false, 
                            error: error.message,
                            mails: [],
                            details: 'Please check your IMAP connection and try again'
                        };
                    }
                }
            },
            {
                title: 'Delete Email',
                name: 'delete_email',
                description: 'Delete an email by sequence number',
                inputSchema: {
                    box: z.string().default('INBOX'),
                    seqNo: z.number()
                },
                handler: async ({ box = 'INBOX', seqNo }) => {
                    try {
                        await this._ensureImapConnection();
                        await this.imapConnection.openBox(box);
                        await this.imapConnection.addFlags(seqNo, '\\Deleted');
                        await this.imapConnection.expunge();
                        this.logEvent?.('info', `Email ${seqNo} deleted successfully`);
                        return { success: true };
                    } catch (error) {
                        this.logEvent?.('error', `Failed to delete email ${seqNo}: ${error.message}`);
                        return { 
                            success: false, 
                            error: error.message,
                            details: 'Email may not exist or connection failed'
                        };
                    }
                }
            },
            {
                title: 'Mark Email as Spam',
                name: 'mark_spam',
                description: 'Move email to Spam/Junk folder',
                inputSchema: {
                    seqNo: z.number()
                },
                handler: async ({ seqNo }) => {
                    try {
                        const spamBox = 'Spam';
                        await this._ensureImapConnection();
                        await this.imapConnection.openBox('INBOX');
                        await this.imapConnection.moveMessage(seqNo, spamBox);
                        this.logEvent?.('info', `Email ${seqNo} moved to spam`);
                        return { success: true };
                    } catch (error) {
                        this.logEvent?.('error', `Failed to mark email ${seqNo} as spam: ${error.message}`);
                        return { 
                            success: false, 
                            error: error.message,
                            details: 'Email may not exist, already moved, or Spam folder may not exist'
                        };
                    }
                }
            },
            {
                title: 'Mark Email as Not Spam',
                name: 'mark_not_spam',
                description: 'Move email from Spam to Inbox',
                inputSchema: {
                    seqNo: z.number()
                },
                handler: async ({ seqNo }) => {
                    try {
                        const spamBox = 'Spam';
                        const inboxBox = 'INBOX';
                        await this._ensureImapConnection();
                        await this.imapConnection.openBox(spamBox);
                        await this.imapConnection.moveMessage(seqNo, inboxBox);
                        this.logEvent?.('info', `Email ${seqNo} moved from spam to inbox`);
                        return { success: true };
                    } catch (error) {
                        this.logEvent?.('error', `Failed to mark email ${seqNo} as not spam: ${error.message}`);
                        return { 
                            success: false, 
                            error: error.message,
                            details: 'Email may not exist in Spam folder or connection failed'
                        };
                    }
                }
            },
            {
                title: 'Get Email Details',
                name: 'get_email',
                description: 'Get full details of an email by sequence number',
                inputSchema: {
                    box: z.string().default('INBOX'),
                    seqNo: z.number()
                },
                handler: async ({ box = 'INBOX', seqNo }) => {
                    try {
                        await this._ensureImapConnection();
                        await this.imapConnection.openBox(box);
                        const criteria = [['SEQ', seqNo]];
                        const fetchOptions = { bodies: [''], struct: true };
                        const messages = await this.imapConnection.search(criteria, fetchOptions);
                        
                        if (messages.length === 0) {
                            return { 
                                success: false, 
                                error: 'Email not found',
                                details: `No email found with sequence number ${seqNo} in ${box}`
                            };
                        }
                        
                        const raw = messages[0].parts[0].body;
                        const parsedMail = await simpleParser(raw);
                        return { success: true, mail: parsedMail };
                    } catch (error) {
                        this.logEvent?.('error', `Failed to get email ${seqNo}: ${error.message}`);
                        return { 
                            success: false, 
                            error: error.message,
                            details: 'Email may not exist or connection failed'
                        };
                    }
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
                title: 'Email Assistant',
                name: 'email_assistant',
                description: 'Assist with sending, listing, deleting, and managing emails.',
                arguments: [
                    {
                        name: 'task',
                        description: 'Describe email related task',
                        required: false
                    }
                ],
                handler: async () => ({
                    description: 'I can send emails, list inbox, delete messages, move mails to spam or inbox.',
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: 'Ask me to send, read, delete, or organize your emails.'
                            }
                        }
                    ]
                })
            }
        ];
    }

    // Cleanup method to properly close connections
    async cleanup() {
        try {
            if (this.transporter) {
                this.transporter.close();
                this.transporter = null;
            }
            
            if (this.imapConnection) {
                this.imapConnection.end();
                this.imapConnection = null;
            }
            
            this.isConnected = false;
            // this.logEvent?.('info', 'Email addon cleanup completed');
        } catch (error) {
            // this.logEvent?.('error', `Error during cleanup: ${error.message}`);
        }
    }
}

module.exports = EmailAddon;