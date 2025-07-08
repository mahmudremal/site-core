const { z } = require('zod');
const axios = require('axios');

class TranslationAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = 'translation';
        this.platforms = {
            google: this._translateGoogle,
            yandex: this._translateYandex,
            lara: this._translateLara,
        };
    }

    async init() {
        return true;
    }

    async _translateGoogle({ text, target, source }) {
        const url = 'https://translation.googleapis.com/language/translate/v2';
        const key = process.env.GOOGLE_API_KEY;
        if (!key) throw new Error('Google API key not set in environment variables');
        const params = {
            q: text,
            target,
            format: 'text',
            key,
        };
        if (source) params.source = source;
        const { data } = await axios.post(url, null, { params });
        return data.data.translations[0].translatedText;
    }

    async _translateYandex({ text, target, source }) {
        const apiKey = process.env.YANDEX_API_KEY;
        if (!apiKey) throw new Error('Yandex API key not set in environment variables');
        const lang = source ? `${source}-${target}` : target;
        const url = 'https://translate.yandex.net/api/v1.5/tr.json/translate';
        const params = {
            key: apiKey,
            text,
            lang,
            format: 'plain'
        };
        const { data } = await axios.post(url, null, { params });
        return data.text[0];
    }

    async _translateLara({ text, target, source }) {
        const apiUrl = 'https://api.lara.translate/v1/translate';
        const apiKey = process.env.LARA_API_KEY;
        if (!apiKey) throw new Error('Lara API key not set in environment variables');

        const payload = {
            q: text,
            target_lang: target,
        };
        if (source) payload.source_lang = source;

        try {
            const response = await axios.post(apiUrl, payload, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.data && response.data.translatedText) {
                return response.data.translatedText;
            } else {
                throw new Error('Invalid response from Lara API');
            }
        } catch (error) {
            throw new Error(`Lara translation failed: ${error.message}`);
        }
    }

    getTools() {
        return [
            {
                title: 'Translate Text',
                name: 'translate',
                description: 'Translate given text into target language using specified platform',
                inputSchema: {
                    text: z.string(),
                    target: z.string(),
                    source: z.string().optional(),
                    platform: z.enum(['google', 'yandex', 'lara']).optional()
                },
                handler: async ({ text, target, source, platform }) => {
                    const selected = platform ? platform.toLowerCase() : 'yandex';
                    if (!this.platforms[selected]) {
                        return { success: false, error: `Unsupported platform: ${selected}` };
                    }
                    try {
                        const translated = await this.platforms[selected].call(this, { text, target, source });
                        return { success: true, translatedText: translated, platform: selected };
                    } catch (e) {
                        return { success: false, error: e.message || 'Translation error' };
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
                title: 'Translation Assistant',
                name: 'translation_assistant',
                description: 'Assist in translating text using different platforms',
                arguments: [
                    {
                        name: 'text',
                        description: 'Text to translate',
                        required: true
                    },
                    {
                        name: 'target',
                        description: 'Target language ISO code',
                        required: true
                    },
                    {
                        name: 'source',
                        description: 'Source language ISO code (optional)',
                        required: false
                    },
                    {
                        name: 'platform',
                        description: 'Translation platform: google, yandex, lara (default yandex)',
                        required: false
                    }
                ],
                handler: async () => ({
                    description: 'Translate text between languages using Google, Yandex or Lara platforms.',
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: 'Provide text, target language, (optional) source language and platform to translate.'
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = TranslationAddon;