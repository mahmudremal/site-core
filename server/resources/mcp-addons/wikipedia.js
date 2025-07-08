const { z } = require('zod');
const axios = require('axios');

class WikipediaAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = 'wikipedia';
        this.apiBase = 'https://en.wikipedia.org/w/api.php';
    }

    async init() {
        return true;
    }

    getTools() {
        return [
            {
                title: 'Search Wikipedia',
                name: 'wikipedia_search',
                description: 'Search Wikipedia articles by keywords',
                inputSchema: {
                    query: z.string(),
                    limit: z.number().int().min(1).max(20).optional().default(10)
                },
                handler: async ({ query, limit }) => {
                    const params = {
                        action: 'query',
                        format: 'json',
                        list: 'search',
                        srsearch: query,
                        srlimit: limit
                    };
                    const { data } = await axios.get(this.apiBase, { params });
                    const results = data.query?.search || [];
                    return { results: results.map(r => ({ title: r.title, snippet: r.snippet, pageid: r.pageid })) };
                }
            },
            {
                title: 'Get Wikipedia Page Summary',
                name: 'get_wikipedia_summary',
                description: 'Get the summary/introduction of a Wikipedia page by title',
                inputSchema: {
                    title: z.string()
                },
                handler: async ({ title }) => {
                    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
                    const { data } = await axios.get(url);
                    return {
                        title: data.title,
                        extract: data.extract,
                        description: data.description,
                        url: data.content_urls?.desktop?.page
                    };
                }
            },
            {
                title: 'Get Wikipedia Page Content',
                name: 'get_wikipedia_page_content',
                description: 'Get the full Wikipedia page content in wikitext format',
                inputSchema: {
                    title: z.string()
                },
                handler: async ({ title }) => {
                    const params = {
                        action: 'query',
                        prop: 'revisions',
                        rvprop: 'content',
                        format: 'json',
                        titles: title,
                        formatversion: 2
                    };
                    const { data } = await axios.get(this.apiBase, { params });
                    const page = data.query?.pages?.[0];
                    if (!page || page.missing) {
                        return { error: 'Page not found' };
                    }
                    return { title: page.title, content: page.revisions?.[0].content || '' };
                }
            },
            {
                title: 'Get Wikipedia Categories',
                name: 'get_wikipedia_categories',
                description: 'Get categories of a Wikipedia page by title',
                inputSchema: {
                    title: z.string()
                },
                handler: async ({ title }) => {
                    const params = {
                        action: 'query',
                        prop: 'categories',
                        format: 'json',
                        titles: title,
                        cllimit: 'max'
                    };
                    const { data } = await axios.get(this.apiBase, { params });
                    const page = data.query?.pages?.[Object.keys(data.query.pages)[0]];
                    if (!page || page.missing) {
                        return { error: 'Page not found' };
                    }
                    const categories = (page.categories || []).map(cat => cat.title);
                    return { title, categories };
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
                title: 'Wikipedia Helper',
                name: 'wikipedia_helper',
                description: 'Assist with Wikipedia searches and information retrieval',
                arguments: [
                    {
                        name: 'topic',
                        description: 'Topic to search or retrieve info about',
                        required: false
                    }
                ],
                handler: async () => ({
                    description: 'I can search Wikipedia, get summaries, full page content, and categories.',
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: 'Ask me to search or get info about any Wikipedia topic.'
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = WikipediaAddon;