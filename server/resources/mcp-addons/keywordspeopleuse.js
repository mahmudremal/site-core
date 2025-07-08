const { z } = require("zod");
const axios = require("axios");

class KeywordsPeopleUseAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = "keywordspeopleuse";
        this.apiBase = "https://api.keywordspeopleuse.com/v1";
    }

    async init() {
        return true;
    }

    getTools() {
        return [
            {
                title: "Get Questions by Keyword",
                name: "get_questions",
                description: "Find questions people ask online related to a keyword",
                inputSchema: {
                    keyword: z.string(),
                    limit: z.number().int().min(1).max(50).optional().default(10),
                },
                handler: async ({ keyword, limit }) => {
                    // This is a hypothetical API call since no official public API docs are available.
                    // Adjust accordingly if actual API exists or require credentials.
                    try {
                        const response = await axios.get(`${this.apiBase}/questions`, {
                            params: { q: keyword, limit },
                        });
                        const questions = response.data.questions || [];
                        return { keyword, questions };
                    } catch (error) {
                        return { error: "Failed to fetch questions" };
                    }
                },
            },
            {
                title: "Get Related Keywords",
                name: "related_keywords",
                description: "Get related keywords to a given keyword",
                inputSchema: {
                    keyword: z.string(),
                    limit: z.number().int().min(1).max(50).optional().default(10),
                },
                handler: async ({ keyword, limit }) => {
                    try {
                        const response = await axios.get(`${this.apiBase}/related`, {
                            params: { q: keyword, limit },
                        });
                        const keywords = response.data.keywords || [];
                        return { keyword, relatedKeywords: keywords };
                    } catch (error) {
                        return { error: "Failed to fetch related keywords" };
                    }
                },
            }
        ];
    }

    getResources() {
        return [];
    }

    getPrompts() {
        return [
            {
                title: "Keyword Questions Helper",
                name: "keyword_questions_helper",
                description: "Help find popular questions and related keywords",
                arguments: [
                    {
                        name: "keyword",
                        description: "Keyword to search questions for",
                        required: true,
                    }
                ],
                handler: async () => ({
                    description: "I can find questions people ask online and related keywords.",
                    messages: [
                        {
                            role: "user",
                            content: { type: "text", text: "Ask me to find questions or related keywords." }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = KeywordsPeopleUseAddon;