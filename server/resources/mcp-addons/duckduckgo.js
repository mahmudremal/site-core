const { z } = require("zod");
const https = require("https");

class DuckDuckGoSearchAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = "duckduckgo-search";
        this.apiEndpoint = "https://api.duckduckgo.com/";
    }

    async init() {
        return true;
    }

    async _search(query) {
        const url = `${this.apiEndpoint}?q=${encodeURIComponent(query)}&format=json&no_redirect=1&skip_disambig=1`;
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = "";
                res.on("data", chunk => { data += chunk; });
                res.on("end", () => {
                    try {
                        const json = JSON.parse(data);
                        resolve(json);
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on("error", reject);
        });
    }

    getTools() {
        return [
            {
                title: "DuckDuckGo Search",
                name: "ddg_search",
                description: "Search using DuckDuckGo",
                inputSchema: {
                    query: z.string()
                },
                handler: async ({ query }) => {
                    const result = await this._search(query);
                    const abstractText = result.AbstractText || "";
                    const relatedTopics = result.RelatedTopics || [];
                    const results = relatedTopics.map(topic => ({
                        text: topic.Text || "",
                        url: topic.FirstURL || ""
                    })).filter(r => r.text && r.url);
                    if (abstractText && results.length === 0) {
                        results.push({ text: abstractText, url: result.AbstractURL || "" });
                    }
                    return { results };
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

module.exports = DuckDuckGoSearchAddon;