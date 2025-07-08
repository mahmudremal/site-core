const { z } = require("zod");
const https = require("https");

class BraveSearchAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = "brave-search";
        this.apiEndpoint = "https://search.brave.com/api/ajax/search";
    }

    async init() {
        return true;
    }

    async _search(query, offset = 0) {
        const data = JSON.stringify({
            q: query,
            start: offset,
            count: 10
        });

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        };

        return new Promise((resolve, reject) => {
            const req = https.request(this.apiEndpoint, options, (res) => {
                let body = "";
                res.on("data", chunk => { body += chunk; });
                res.on("end", () => {
                    try {
                        const json = JSON.parse(body);
                        resolve(json);
                    } catch (e) {
                        reject(e);
                    }
                });
            });

            req.on("error", reject);
            req.write(data);
            req.end();
        });
    }

    getTools() {
        return [
            {
                title: "Brave Search",
                name: "brave_search",
                description: "Search using Brave Search",
                inputSchema: {
                    query: z.string(),
                    page: z.number().min(1).default(1)
                },
                handler: async ({ query, page }) => {
                    const offset = (page - 1) * 10;
                    const result = await this._search(query, offset);
                    const items = (result?.web_results || []).map(r => ({
                        title: r.title,
                        url: r.url,
                        description: r.description || r.snippet || ""
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

module.exports = BraveSearchAddon;