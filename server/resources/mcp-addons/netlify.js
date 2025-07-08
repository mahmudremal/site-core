const { z } = require('zod');
const axios = require('axios');

class NetlifyAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = 'netlify';
        this.apiBase = 'https://api.netlify.com/api/v1';
        this.accessToken = process.env.NETLIFY_API_KEY;
        this.authHeaders = {
            Authorization: `Bearer ${this.accessToken}`
        };
    }

    async init() {
        if (!this.accessToken) throw new Error("Missing Netlify access token");
        try {
            // Check token validity by fetching user info
            await axios.get(`${this.apiBase}/user`, { headers: this.authHeaders });
            return true;
        } catch {
            throw new Error("Invalid or expired Netlify access token");
        }
    }

    getTools() {
        return [
            {
                title: 'List Sites',
                name: 'list_sites',
                description: 'Get a list of sites under the Netlify account',
                inputSchema: {},
                handler: async () => {
                    const res = await axios.get(`${this.apiBase}/sites`, { headers: this.authHeaders });
                    return { sites: res.data };
                }
            },
            {
                title: 'Get Site Details',
                name: 'get_site',
                description: 'Get details of a specific site by site ID',
                inputSchema: {
                    siteId: z.string()
                },
                handler: async ({ siteId }) => {
                    const res = await axios.get(`${this.apiBase}/sites/${siteId}`, { headers: this.authHeaders });
                    return { site: res.data };
                }
            },
            {
                title: 'Create Site',
                name: 'create_site',
                description: 'Create a new site',
                inputSchema: {
                    name: z.string().optional(),
                    customDomain: z.string().optional()
                },
                handler: async ({ name, customDomain }) => {
                    const payload = {};
                    if (name) payload.name = name;
                    if (customDomain) payload['custom_domain'] = customDomain;
                    const res = await axios.post(`${this.apiBase}/sites`, payload, { headers: this.authHeaders });
                    return { site: res.data };
                }
            },
            {
                title: 'Delete Site',
                name: 'delete_site',
                description: 'Delete a site by site ID',
                inputSchema: {
                    siteId: z.string()
                },
                handler: async ({ siteId }) => {
                    await axios.delete(`${this.apiBase}/sites/${siteId}`, { headers: this.authHeaders });
                    return { success: true };
                }
            },
            {
                title: 'Deploy Site',
                name: 'deploy_site',
                description: 'Trigger a deploy for a site by site ID',
                inputSchema: {
                    siteId: z.string()
                },
                handler: async ({ siteId }) => {
                    const res = await axios.post(`${this.apiBase}/sites/${siteId}/deploys`, {}, { headers: this.authHeaders });
                    return { deploy: res.data };
                }
            },
            {
                title: 'Get Deploys',
                name: 'get_deploys',
                description: 'Get list of deploys for a specific site',
                inputSchema: {
                    siteId: z.string(),
                    perPage: z.number().int().min(1).max(100).optional().default(20)
                },
                handler: async ({ siteId, perPage }) => {
                    const res = await axios.get(`${this.apiBase}/sites/${siteId}/deploys?per_page=${perPage}`, { headers: this.authHeaders });
                    return { deploys: res.data };
                }
            },
            {
                title: 'Get Deploy Details',
                name: 'get_deploy',
                description: 'Get details of a deploy by deploy ID and site ID',
                inputSchema: {
                    siteId: z.string(),
                    deployId: z.string(),
                },
                handler: async ({ siteId, deployId }) => {
                    const res = await axios.get(`${this.apiBase}/sites/${siteId}/deploys/${deployId}`, { headers: this.authHeaders });
                    return { deploy: res.data };
                }
            },
            {
                title: 'Roll Back Deploy',
                name: 'rollback_deploy',
                description: 'Roll back a site to a specific deploy by deploy ID',
                inputSchema: {
                    siteId: z.string(),
                    deployId: z.string()
                },
                handler: async ({ siteId, deployId }) => {
                    const res = await axios.post(`${this.apiBase}/sites/${siteId}/deploys/${deployId}/restore`, {}, { headers: this.authHeaders });
                    return { deploy: res.data };
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
                title: 'Netlify Assistant',
                name: 'netlify_assistant',
                description: 'Manage your Netlify sites and deploys',
                arguments: [
                    {
                        name: 'task',
                        description: 'Describe what you want to do with Netlify',
                        required: false
                    }
                ],
                handler: async () => ({
                    description: 'I can help you create, list, deploy, delete, and rollback sites on Netlify.',
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: 'Ask me to manage your Netlify web projects.'
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = NetlifyAddon;