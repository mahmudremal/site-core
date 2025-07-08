const { z } = require("zod");
const axios = require("axios");

class MicrosoftClarityAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = "microsoft-clarity";
        this.apiKey = process.env.MS_CLARITY_APIKEY;
        this.baseUrl = "https://api.clarity.microsoft.com/v1";
        this.headers = {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
        };
    }

    async init() {
        if (!this.apiKey) throw new Error("API key required");
        return true;
    }

    getTools() {
        return [
            {
                title: "Get Projects",
                name: "get_projects",
                description: "List all Clarity projects accessible by the API key",
                inputSchema: {},
                handler: async () => {
                    const url = `${this.baseUrl}/projects`;
                    const res = await axios.get(url, { headers: this.headers });
                    return { projects: res.data.projects || [] };
                }
            },
            {
                title: "Get Project Summary",
                name: "project_summary",
                description: "Get summary analytics for a Clarity project",
                inputSchema: {
                    projectId: z.string()
                },
                handler: async ({ projectId }) => {
                    const url = `${this.baseUrl}/projects/${encodeURIComponent(projectId)}/summary`;
                    const res = await axios.get(url, { headers: this.headers });
                    return { summary: res.data };
                }
            },
            {
                title: "Get Project Sessions",
                name: "get_sessions",
                description: "Get user sessions for a specified project",
                inputSchema: {
                    projectId: z.string(),
                    limit: z.number().int().min(1).max(100).optional().default(20),
                    from: z.string().optional(),
                    to: z.string().optional()
                },
                handler: async ({ projectId, limit, from, to }) => {
                    const params = { limit };
                    if (from) params.from = from;
                    if (to) params.to = to;
                    const url = `${this.baseUrl}/projects/${encodeURIComponent(projectId)}/sessions`;
                    const res = await axios.get(url, { headers: this.headers, params });
                    return { sessions: res.data.sessions || [] };
                }
            },
            {
                title: "Get Session Details",
                name: "get_session_details",
                description: "Get detailed data about a single user session",
                inputSchema: {
                    projectId: z.string(),
                    sessionId: z.string()
                },
                handler: async ({ projectId, sessionId }) => {
                    const url = `${this.baseUrl}/projects/${encodeURIComponent(projectId)}/sessions/${encodeURIComponent(sessionId)}`;
                    const res = await axios.get(url, { headers: this.headers });
                    return { session: res.data };
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
                title: "Clarity Analytics Assistant",
                name: "clarity_assistant",
                description: "Assist with retrieving Microsoft Clarity behavioral analytics data",
                arguments: [
                    {
                        name: "task",
                        description: "Describe what analytics or data you want",
                        required: false
                    }
                ],
                handler: async () => ({
                    description: "I can help retrieve your Clarity projects, summaries, sessions, and session details.",
                    messages: [
                        {
                            role: "user",
                            content: {
                                type: "text",
                                text: "Ask me for project summaries, session lists, or specific session details."
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = MicrosoftClarityAddon;