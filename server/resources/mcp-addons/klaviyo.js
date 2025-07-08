const { z } = require('zod');
const axios = require('axios');

class KlaviyoAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = 'klaviyo';
        this.apiKey = process.env.KLAVIYO_API_KEY;
        this.apiBase = 'https://a.klaviyo.com/api/v1';
        this.headers = {
            Authorization: `Klaviyo-API-Key ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    async init() {
        if (!this.apiKey) throw new Error('API key required');
        return true;
    }

    getTools() {
        return [
            {
                title: 'Get Lists',
                name: 'get_lists',
                description: 'Retrieve all Klaviyo lists',
                inputSchema: {},
                handler: async () => {
                    const res = await axios.get(`${this.apiBase}/lists`, { headers: this.headers });
                    return { lists: res.data.data || [] };
                }
            },
            {
                title: 'Get List Members',
                name: 'get_list_members',
                description: 'Get members of a Klaviyo list',
                inputSchema: {
                    listId: z.string()
                },
                handler: async ({ listId }) => {
                    const res = await axios.get(`${this.apiBase}/lists/${listId}/members`, { headers: this.headers });
                    return { members: res.data.data || [] };
                }
            },
            {
                title: 'Add Member to List',
                name: 'add_member',
                description: 'Add or update a member to a Klaviyo list',
                inputSchema: {
                    listId: z.string(),
                    email: z.string().email(),
                    properties: z.record(z.any()).optional()
                },
                handler: async ({ listId, email, properties = {} }) => {
                    const url = `${this.apiBase}/list/${listId}/subscribe`;
                    const payload = {
                        profiles: [{ email, ...properties }]
                    };
                    const res = await axios.post(url, payload, { headers: this.headers });
                    return { success: res.status === 200 };
                }
            },
            {
                title: 'Remove Member from List',
                name: 'remove_member',
                description: 'Remove a member from a Klaviyo list',
                inputSchema: {
                    listId: z.string(),
                    email: z.string().email()
                },
                handler: async ({ listId, email }) => {
                    const url = `${this.apiBase}/list/${listId}/unsubscribe`;
                    const payload = { email };
                    const res = await axios.post(url, payload, { headers: this.headers });
                    return { success: res.status === 200 };
                }
            },
            {
                title: 'Get Metrics',
                name: 'get_metrics',
                description: 'Fetch Klaviyo metrics data',
                inputSchema: {
                    count: z.number().int().min(1).max(100).optional().default(20)
                },
                handler: async ({ count }) => {
                    const params = { count };
                    const res = await axios.get(`${this.apiBase}/metrics`, { headers: this.headers, params });
                    return { metrics: res.data.data || [] };
                }
            },
            {
                title: 'Get Metric Timeline',
                name: 'get_metric_timeline',
                description: 'Retrieve timeline events for a specific metric',
                inputSchema: {
                    metricId: z.string(),
                    count: z.number().int().min(1).max(100).optional().default(20)
                },
                handler: async ({ metricId, count }) => {
                    const params = { count };
                    const res = await axios.get(`${this.apiBase}/metrics/${metricId}/timeline`, { headers: this.headers, params });
                    return { timeline: res.data.data || [] };
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
                title: 'Klaviyo Marketing Helper',
                name: 'klaviyo_helper',
                description: 'Assist with Klaviyo marketing data and list management',
                arguments: [
                    {
                        name: 'task',
                        description: 'Describe your marketing data task',
                        required: false
                    }
                ],
                handler: async () => ({
                    description: 'I can help you manage Klaviyo lists, members, and fetch marketing metrics.',
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: 'Ask me to retrieve lists, add or remove members, or get metrics.'
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = KlaviyoAddon;