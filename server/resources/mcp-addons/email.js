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
        authTimeout: 3000,
        tlsOptions: {
            rejectUnauthorized: false
        }
        };
        this.transporter = null;
        this.imapConnection = null;
    }

    async init() {
        this.transporter = nodemailer.createTransport(this.smtpConfig);
        this.imapConnection = await Imap.connect({ imap: this.imapConfig });
        await this.imapConnection.openBox('INBOX');
        return true;
    }

    async _searchMessages(criteria, box = 'INBOX') {
        await this.imapConnection.openBox(box);
        const searchCriteria = criteria || ['ALL'];
        const fetchOptions = { bodies: ['HEADER', 'TEXT'], struct: true };
        const results = await this.imapConnection.search(searchCriteria, fetchOptions);
        const parsed = await Promise.all(results.map(async msg => {
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
        }));
        return parsed;
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
                    const mailOptions = { ...args };
                    if (mailOptions.attachments) {
                        mailOptions.attachments = mailOptions.attachments.map(att => ({
                            filename: att.filename,
                            content: att.content,
                            encoding: att.encoding,
                            contentType: att.contentType
                        }));
                    }
                    const info = await this.transporter.sendMail(mailOptions);
                    return { success: true, messageId: info.messageId };
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
                    const criteria = unseenOnly ? ['UNSEEN'] : ['ALL'];
                    const allMails = await this._searchMessages(criteria, box);
                    const mails = allMails.slice(-limit).reverse();
                    return { mails };
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
                    await this.imapConnection.openBox(box);
                    await this.imapConnection.addFlags(seqNo, '\\Deleted');
                    await this.imapConnection.expunge();
                    return { success: true };
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
                    const spamBox = 'Spam';
                    await this.imapConnection.openBox('INBOX');
                    await this.imapConnection.moveMessage(seqNo, spamBox);
                    return { success: true };
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
                    const spamBox = 'Spam';
                    const inboxBox = 'INBOX';
                    await this.imapConnection.openBox(spamBox);
                    await this.imapConnection.moveMessage(seqNo, inboxBox);
                    return { success: true };
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
                    await this.imapConnection.openBox(box);
                    const criteria = [['SEQ', seqNo]];
                    const fetchOptions = { bodies: [''], struct: true };
                    const messages = await this.imapConnection.search(criteria, fetchOptions);
                    if (messages.length === 0) return { error: 'Email not found' };
                    const raw = messages[0].parts[0].body;
                    const parsedMail = await simpleParser(raw);
                    return { mail: parsedMail };
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
}

module.exports = EmailAddon;