const axios = require('axios');

class LlmAddon {
    constructor(app, dbConnection, config = {}) {
        this.app = app;
        this.db = dbConnection;
        this.ollamaHost = config.ollamaHost || 'http://localhost:11434';
        this.defaultModel = config.model || 'gemma3';
        this.tables = {
            conversations: `${this.db.prefix}llm_conversations`,
            messages: `${this.db.prefix}llm_messages`,
            ratings: `${this.db.prefix}llm_ratings`
        };
    }

    init() {
    }

    get_tables_schemas() {
        return {
            conversations: `
                CREATE TABLE IF NOT EXISTS ${this.tables.conversations} (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  user_id VARCHAR(128),
                  conversation_id VARCHAR(255) NOT NULL UNIQUE,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `,
            messages: `
                CREATE TABLE IF NOT EXISTS ${this.tables.messages} (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  conversation_id VARCHAR(255) NOT NULL,
                  message_id VARCHAR(255) NOT NULL,
                  parent_id VARCHAR(255),
                  role VARCHAR(20) NOT NULL,
                  content TEXT NOT NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `,
            ratings: `
                CREATE TABLE IF NOT EXISTS ${this.tables.ratings} (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  message_id VARCHAR(255) NOT NULL,
                  rating INT,
                  comment TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `
        };
    }

    async ask({ message = '', token = null, cid = '', onChunk = (t) => {}, parent_message_id = '' }) {
        return new Promise(async (resolve, reject) => {
            if (! token) {reject(new Error('Invalid token provided!'));}
            const response = await fetch("https://api2.sider.ai/api/chat/v1/completions", {
                method: "POST",
                headers: {
                    "accept": "*/*",
                    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,bn;q=0.7",
                    "authorization": `Bearer ${token}`,
                    "cache-control": "no-cache",
                    "content-type": "application/json",
                    "pragma": "no-cache",
                    "priority": "u=1, i",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "none",
                    "sec-fetch-storage-access": "active",
                    "x-app-name": "ChitChat_Chrome_Ext",
                    "x-app-version": "5.7.1",
                    "x-time-zone": "Asia/Dhaka",
                    "x-trace-id": "1a9a18b1-e963-4e4b-b737-3a2ee2c729a6"
                },
                body: JSON.stringify({
                    "stream": !false,
                    "cid": cid,
                    "model": "sider",
                    "filter_search_history": false,
                    "from": "chat",
                    "chat_models": [],
                    "think_mode": {"enable": false},
                    "quote": null,
                    "multi_content": [{
                    "type": "text",
                    "text": message,
                    "user_input_text": message
                    }],
                    "prompt_templates": [{
                    "key": "artifacts",
                    "attributes": { "lang": "original" }
                    }],
                    "tools": {
                    "image": { "quality_level": "medium" },
                    "auto": ["search", "create_image", "data_analysis"]
                    },
                    "extra_info": {
                    "origin_url": "chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/standalone.html?from=sidebar",
                    "origin_title": "Sider"
                    },
                    "output_language": "en",
                    "parent_message_id": parent_message_id
                }),
                mode: "cors",
                credentials: "include"
            });

            // console.log(response)
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let _result = {resoning: '', content: ''};

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });

                // Streamed content may contain multiple SSE-style events
                chunk.split("\n").forEach(line => {
                    if (line.startsWith("data:")) {
                    const json = line.slice(5).trim();
                    if (json === "[DONE]") return;
                    try {
                        const parsed = JSON.parse(json);
                        // console.log("Received:", parsed);
                        if (parsed?.data?.reasoning_content?.text) {
                        _result.resoning += parsed.data.reasoning_content.text;
                        }
                        if (parsed?.data?.text && parsed?.data?.type == 'text') {
                        _result.content += parsed.data.text;
                        }
                        if (typeof onChunk === 'function') {
                        if (parsed?.data?.message_start) {onChunk({...parsed?.data?.message_start, _type: 'message_start'});}
                        // const rChunk = { resoning: parsed?.data?.reasoning_content?.text, content: parsed?.data?.text };onChunk(rChunk);
                        onChunk(_result);
                        }
                    } catch (e) {
                        console.error("Invalid JSON:", json);
                        // reject(e);
                    }
                    }
                });
            }

            resolve(_result)
        });
    }

    
    register(router) {

        router.post('/v1/completions', (req, res) => {
            this.ask({
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNTYzNjY3NSwicmVnaXN0ZXJfdHlwZSI6Im9hdXRoMiIsImFwcF9uYW1lIjoiQ2hpdENoYXRfV2ViIiwidG9rZW5faWQiOiI4NzE0YTIwYy0yOWZkLTQyMDctOTY3ZC1hNDg0NjIzNjM0ZjAiLCJpc3MiOiJzaWRlci5haSIsImF1ZCI6WyIiXSwiZXhwIjoxNzgxMDE5MTg1LCJuYmYiOjE3NDk5MTUxODUsImlhdCI6MTc0OTkxNTE4NX0.cWsqJBXBGN0o-sQA30Dgg8tWjtPuTAwLgObfwZrjiUI',
                ...req.body
            })
            .then(data => res.status(200).json(data))
            .catch(err => 
                res.status(500).json({error: err.message, body: {...req.body}})
            )
        })
        
        
        // Models endpoints
        router.get('/v1/models', this.listModels.bind(this));
        router.get('/v1/models/:model', this.getModel.bind(this));

        // Chat/completions endpoints
        router.post('/v1/chat/completions', this.completions.bind(this));
        router.post('/v1/completions', this.completions.bind(this));

        // Embeddings
        router.post('/v1/embeddings', this.embeddings.bind(this));

        // Moderations
        router.post('/v1/moderations', this.moderations.bind(this));

        // Images (DALL·E, mocked)
        router.post('/v1/images/generations', this.imageGenerations.bind(this));
        router.post('/v1/images/edits', this.notSupported('Image edits (DALL·E edit)').bind(this));
        router.post('/v1/images/variations', this.notSupported('Image variations (DALL·E variation)').bind(this));

        // Audio/Speech
        router.post('/v1/audio/transcriptions', this.notSupported('Audio transcription (Whisper)').bind(this));
        router.post('/v1/audio/translations', this.notSupported('Audio translation (Whisper)').bind(this));
        router.post('/v1/audio/speech', this.notSupported('Text-to-speech (tts)').bind(this));

        // Fine-tunes (mock)
        router.get('/v1/fine-tunes', this.notSupported('Fine-tunes listing').bind(this));
        router.post('/v1/fine-tunes', this.notSupported('Fine-tunes start').bind(this));
        router.get('/v1/fine-tunes/:fine_tune_id', this.notSupported('Fine-tune status').bind(this));
        router.post('/v1/fine-tunes/:fine_tune_id/cancel', this.notSupported('Fine-tune cancel').bind(this));
        router.get('/v1/fine-tunes/:fine_tune_id/events', this.notSupported('Fine-tune events').bind(this));
        router.delete('/v1/models/:model', this.notSupported('Delete fine-tuned model').bind(this));

        // Files (mock)
        router.get('/v1/files', this.notSupported('File listing').bind(this));
        router.post('/v1/files', this.notSupported('File upload').bind(this));
        router.delete('/v1/files/:file_id', this.notSupported('File delete').bind(this));
        router.get('/v1/files/:file_id', this.notSupported('File info').bind(this));
        router.get('/v1/files/:file_id/content', this.notSupported('File content').bind(this));

        // Conversation and ratings
        router.get('/v1/conversations/:conversation_id', this.getConversation.bind(this));
        router.post('/v1/messages/:message_id/rating', this.rateMessage.bind(this));
    }

    // ========== MODELS ==========
    async listModels(req, res) {
        try {
            // Query Ollama for models list
            const ollamaResp = await axios.get(`${this.ollamaHost}/api/tags`);
            // Ollama returns { models: [{name:'llama3', ...}, ...] }
            const models = (
                ollamaResp.data?.models?.map((m) => ({
                    id: m.name,
                    object: 'model',
                    created: Math.floor(Date.now() / 1000),
                    owned_by: 'ollama',
                    root: m.name,
                    parent: null
                })) || []
            );
            res.json({ object: 'list', data: models });
        } catch (err) {
            // If Ollama not running, return some statics
            res.json({ object: 'list', data: [
                { id: 'llama3', object: 'model', created: 0, owned_by: 'ollama', root: 'llama3', parent: null }
            ]});
        }
    }

    async getModel(req, res) {
        const { model } = req.params;
        // Try to get info from ollama (not standard, so we mock)
        res.json({
            id: model,
            object: 'model',
            created: Math.floor(Date.now() / 1000),
            owned_by: 'ollama',
            root: model,
            parent: null,
            permission: []
        });
    }

    // ========== CHAT COMPLETIONS / COMPLETIONS ==========
    async completions(req, res) {
        try {
            const isChat = !!req.body.messages;
            const {
                model = this.defaultModel,
                messages = [],
                prompt = "",
                stream = false,
                max_tokens,
                temperature,
                user,
                conversation_id,
                ...params
            } = req.body;

            let convId = conversation_id;
            if (!convId) {
                convId = this.generateConversationId();
                await this.saveConversation(convId, user || null);
            }

            // if (isChat) await this.saveMessages(convId, messages);
            // else await this.saveMessage(convId, "user", prompt, null);

            if (stream) {
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                const ollamaStreamResp = await axios.post(
                    `${this.ollamaHost}/api/chat`, 
                    isChat
                        ? { model, messages, stream: true, ...params }
                        : { model, prompt, stream: true, ...params },
                    { responseType: 'stream', timeout: 0 }
                );
                let content = '';
                ollamaStreamResp.data.on('data', chunk => {
                    const chunkStr = chunk.toString().trim();
                    if (chunkStr && chunkStr !== '[DONE]') {
                        let parsed;
                        try { parsed = JSON.parse(chunkStr); } catch {}
                        if (parsed && parsed.message?.content) {
                            content += parsed.message.content;
                            res.write(`data: ${JSON.stringify({
                                id: this.generateMessageId(),
                                object: isChat ? 'chat.completion.chunk' : 'text_completion.chunk',
                                model,
                                choices: [{
                                    delta: { content: parsed.message.content },
                                    finish_reason: null,
                                    index: 0
                                }]
                            })}\n\n`);
                        }
                    }
                });
                ollamaStreamResp.data.on('end', async () => {
                    if (content) await this.saveResponseMessage(convId, content);
                    res.write(`data: [DONE]\n\n`);
                    res.end();
                });
                ollamaStreamResp.data.on('error', err => res.end());
                return;
            }
            // Non-streaming
            const ollamaResp = await axios.post(
                isChat
                    ? `${this.ollamaHost}/api/chat`
                    : `${this.ollamaHost}/api/generate`,
                isChat
                    ? { model, messages, stream, ...params }
                    : { model, prompt, stream, ...params }
            ).then(res => res.data);

            // Ollama chat: {message: {role, content, ...}}
            // Ollama generate: {response: '...', ...}
            if (isChat && ollamaResp.message) {
                const { message } = ollamaResp;
                const msgId = await this.saveResponseMessage(convId, message.content);
                res.json(this.makeOpenAIResponse(model, message.content, convId, msgId, isChat));
            } else if (!isChat && ollamaResp.response) {
                const msgId = await this.saveResponseMessage(convId, ollamaResp.response);
                res.json(this.makeOpenAIResponse(model, ollamaResp.response, convId, msgId, false));
            } else {
                res.status(500).json({ error: { message: "LLM failed to respond", ollamaResp } });
            }
        } catch (err) {
            res.status(500).json({ error: { message: err?.response?.data?.error || err.message } });
        }
    }

    // ========== EMBEDDINGS ==========
    async embeddings(req, res) {
        // Ollama doesn't support embeddings; dummy static
        const { input = [], model = this.defaultModel } = req.body;
        const makeVector = (inp) => Array(1536).fill(0.007); // Fake
        const data = (Array.isArray(input) ? input : [input]).map((inp, idx) => ({
            index: idx,
            object: 'embedding',
            embedding: makeVector(inp)
        }));
        res.json({
            object: 'list',
            data,
            model,
            usage: {
                prompt_tokens: null,
                total_tokens: null
            }
        });
    }

    // ========== MODERATIONS ==========
    async moderations(req, res) {
        // No moderations; always safe
        res.json({
            id: `modr-${this.generateMessageId()}`,
            model: "text-moderation-001",
            results: [
                {
                    flagged: false,
                    categories: {
                        hate: false,
                        hate_threatening: false,
                        self_harm: false,
                        sexual: false,
                        sexual_minors: false,
                        violence: false,
                        violence_graphic: false
                    },
                    category_scores: {
                        hate: 0.0,
                        hate_threatening: 0.0,
                        self_harm: 0.0,
                        sexual: 0.0,
                        sexual_minors: 0.0,
                        violence: 0.0,
                        violence_graphic: 0.0
                    }
                }
            ]
        });
    }

    // ========== IMAGES (STATIC) ==========
    async imageGenerations(req, res) {
        const { prompt = "", n = 1, size = "1024x1024", response_format = "url" } = req.body;
        // Return n dummy DALL-E results
        res.json({
            created: Math.floor(Date.now() / 1000),
            data: Array.from({ length: n }).map((_, i) => ({
                url: "https://placehold.co/512x512?text=DALL-E+Mock",
                b64_json: null
            }))
        });
    }

    // ========== STATIC/FIXED ENDPOINTS ==========
    notSupported(msg) {
        return (req, res) => {
            res.status(501).json({ error: { message: `[Not supported] ${msg}` } });
        };
    }

    // ========== CONVERSATIONS ==========
    async getConversation(req, res) {
        const { conversation_id } = req.params;
        if (!conversation_id) return res.status(400).json({ error: 'Missing conversation_id' });

        this.db.query(
            `SELECT * FROM ${this.tables.messages} WHERE conversation_id=? ORDER BY created_at`,
            [conversation_id],
            (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({
                    id: conversation_id,
                    object: 'conversation',
                    messages: rows.map(row => ({
                        id: row.message_id,
                        role: row.role,
                        content: row.content,
                        created_at: row.created_at
                    }))
                });
            }
        );
    }

    async rateMessage(req, res) {
        const { message_id } = req.params;
        const { rating, comment } = req.body;
        if (typeof rating !== 'number' || !message_id)
            return res.status(400).json({ error: 'Invalid message_id or rating' });

        const sql = `
            INSERT INTO ${this.tables.ratings} (message_id, rating, comment)
            VALUES (?, ?, ?)
        `;
        this.db.query(sql, [message_id, rating, comment || null], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ok: true });
        });
    }


    // ========== STORAGE HELPERS ==========

    async saveMessages(conversation_id, messages) {
        if (!Array.isArray(messages)) return;
        for (const m of messages) {
            await this.saveMessage(conversation_id, m.role, m.content, null);
        }
    }

    async saveResponseMessage(conversation_id, content) {
        return this.saveMessage(conversation_id, 'assistant', content.trim().replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|\uFE0F|\u200D)/g, ''), null);
    }

    async saveMessage(conversation_id, role, content, parent_id) {
        const message_id = this.generateMessageId();
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO ${this.tables.messages}
                (conversation_id, message_id, parent_id, role, content)
                VALUES (?, ?, ?, ?, ?)
            `;
            this.db.query(sql, [conversation_id, message_id, parent_id, role, content], (err, result) => {
                if (err) {
                    console.error('Save message error:', err);
                    return reject(err);
                }
                resolve(message_id);
            });
        });
    }

    async saveConversation(conversation_id, user_id) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT IGNORE INTO ${this.tables.conversations}
                (conversation_id, user_id)
                VALUES (?, ?)
            `;
            this.db.query(sql, [conversation_id, user_id], (err, result) => {
                if (err) {
                    console.error('Save conversation error:', err);
                    return reject(err);
                }
                resolve(result?.insertId);
            });
        });
    }

    makeOpenAIResponse(model, content, conversation_id, message_id, isChat = true) {
        if (isChat) {
            return {
                id: `chatcmpl-${message_id}`,
                object: "chat.completion",
                created: Math.floor(Date.now() / 1000),
                model,
                conversation_id,
                choices: [
                    {
                        index: 0,
                        finish_reason: "stop",
                        message: {
                            role: "assistant",
                            content
                        }
                    }
                ],
                usage: {
                    prompt_tokens: null,
                    completion_tokens: null,
                    total_tokens: null
                }
            };
        } else {
            // Classic completions
            return {
                id: `cmpl-${message_id}`,
                object: 'text_completion',
                created: Math.floor(Date.now() / 1000),
                model,
                choices: [{
                    text: content,
                    index: 0,
                    logprobs: null,
                    finish_reason: "stop"
                }],
                usage: {
                    prompt_tokens: null,
                    completion_tokens: null,
                    total_tokens: null
                }
            };
        }
    }

    generateConversationId() {
        return `conv_${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}`;
    }
    generateMessageId() {
        return Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
    }
}

module.exports = LlmAddon;