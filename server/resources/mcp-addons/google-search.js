const { z } = require("zod");
const { google } = require("googleapis");

class GoogleSearchAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        const cx = null;
        this.name = "google-search";
        this.apiKey = process.env.GOOGLE_SEARCH_API_KEY;
        this.cx = cx;
        this.customsearch = google.customsearch('v1');
    }

    async init() {
        if (!this.apiKey || !this.cx) throw new Error("API key and CX (search engine ID) required");
        return true;
    }

    getTools() {
        return [
            {
                title: "Google Custom Search",
                name: "google_search",
                description: "Search using Google Custom Search API",
                inputSchema: {
                    query: z.string(),
                    num: z.number().min(1).max(10).optional()
                },
                handler: async ({ query, num = 5 }) => {
                    const res = await this.customsearch.cse.list({
                        auth: this.apiKey,
                        cx: this.cx,
                        q: query,
                        num
                    });
                    const items = (res.data.items || []).map(item => ({
                        title: item.title,
                        link: item.link,
                        snippet: item.snippet
                    }));
                    return { results: items };
                }
            }
        ];
    }

    getResources() {
        return [];
    }

    getPrompts() {
        return [];
    }
}

module.exports = GoogleSearchAddon;