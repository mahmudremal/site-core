const axios = require('axios');
const cheerio = require('cheerio');

class SearchAddon {
    constructor(app, dbConnection) {
        this.app = app;
        this.db = dbConnection;
        this.tables = {
            history: `${this.db.prefix}search_history`
        };
        this.peerServer = null;
        
        // API configurations - set these in your environment variables
        this.apis = {
            // Google Custom Search (requires API key and Search Engine ID)
            google: {
                apiKey: process.env.GOOGLE_SEARCH_API_KEY,
                searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
                baseUrl: 'https://www.googleapis.com/customsearch/v1'
            },
            // Bing Search API (requires API key)
            bing: {
                apiKey: process.env.BING_SEARCH_API_KEY,
                baseUrl: 'https://api.bing.microsoft.com/v7.0/search'
            },
            // SerpAPI (requires API key) - provides Google, Bing, DuckDuckGo results
            serpapi: {
                apiKey: process.env.SERPAPI_KEY,
                baseUrl: 'https://serpapi.com/search'
            },
            // SearchAPI (requires API key)
            searchapi: {
                apiKey: process.env.SEARCHAPI_KEY,
                baseUrl: 'https://www.searchapi.io/api/v1/search'
            }
        };
        
        // Fallback to DuckDuckGo scraping (use as last resort)
        this.ddg_scrape_url = 'https://html.duckduckgo.com/html';
    }

    init() {
    }

    get_tables_schemas() {
        return {
            history: `CREATE TABLE IF NOT EXISTS ${this.tables.history} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                search_type VARCHAR(255) NOT NULL,
                keyword VARCHAR(255) NOT NULL,
                api_used VARCHAR(50),
                _time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
        };
    }

    register(router) {
        router.use('/search', (req, res, next) => {
            console.log('Search endpoint middleware');
            next();
        });

        // Autocomplete suggestions endpoint (keeping DuckDuckGo for this)
        router.get('/search/autocomplete', async (req, res) => {
            const { s: searchKey } = req.query;

            try {
                const searchParams = new URLSearchParams({ q: searchKey });
                const response = await axios.get(`https://duckduckgo.com/ac?${searchParams.toString()}`);
                const suggestions = response.data.map(suggestion => suggestion.phrase);
                res.json(suggestions.slice(0, 5));
            } catch (err) {
                res.status(500).json({ error: 'Failed to get suggestions', err: err.message });
            }
        });

        // Enhanced search results endpoint with multiple API options
        router.get('/search/result', async (req, res) => {
            const { s: query, userId = 1, api = 'auto' } = req.query;

            try {
                let searchResults;
                let apiUsed = 'unknown';

                // Try different APIs based on availability and preference
                if (api === 'google' || (api === 'auto' && this.apis.google.apiKey)) {
                    searchResults = await this.searchWithGoogle(query);
                    apiUsed = 'google';
                } else if (api === 'bing' || (api === 'auto' && this.apis.bing.apiKey)) {
                    searchResults = await this.searchWithBing(query);
                    apiUsed = 'bing';
                } else if (api === 'serpapi' || (api === 'auto' && this.apis.serpapi.apiKey)) {
                    searchResults = await this.searchWithSerpAPI(query);
                    apiUsed = 'serpapi';
                } else if (api === 'searchapi' || (api === 'auto' && this.apis.searchapi.apiKey)) {
                    searchResults = await this.searchWithSearchAPI(query);
                    apiUsed = 'searchapi';
                } else {
                    // Fallback to DuckDuckGo scraping (least reliable)
                    searchResults = await this.searchWithDDGScraping(query);
                    apiUsed = 'ddg_scrape';
                }

                this.logSearchHistory(userId, 'result', query, apiUsed);
                res.json(searchResults);
            } catch (error) {
                console.error('Error getting search results:', error);
                res.status(500).json({ error: 'Failed to get search results', message: error.message });
            }
        });

        // Image search endpoint
        router.get('/search/images', async (req, res) => {
            const { q: query, userId = 1, api = 'auto' } = req.query;

            try {
                let imageResults;
                let apiUsed = 'unknown';

                if (api === 'google' || (api === 'auto' && this.apis.google.apiKey)) {
                    imageResults = await this.searchImagesWithGoogle(query);
                    apiUsed = 'google';
                } else if (api === 'bing' || (api === 'auto' && this.apis.bing.apiKey)) {
                    imageResults = await this.searchImagesWithBing(query);
                    apiUsed = 'bing';
                } else {
                    // Fallback to basic method
                    imageResults = await this.searchImagesBasic(query);
                    apiUsed = 'basic';
                }

                this.logSearchHistory(userId, 'images', query, apiUsed);
                res.json(imageResults);
            } catch (error) {
                console.error('Error getting images:', error);
                res.status(500).json({ error: 'Failed to get images' });
            }
        });
    }

    // Google Custom Search implementation
    async searchWithGoogle(query) {
        if (!this.apis.google.apiKey || !this.apis.google.searchEngineId) {
            throw new Error('Google API key or Search Engine ID not configured');
        }

        const response = await axios.get(this.apis.google.baseUrl, {
            params: {
                key: this.apis.google.apiKey,
                cx: this.apis.google.searchEngineId,
                q: query,
                num: 10
            }
        });

        const results = response.data.items || [];
        return {
            query,
            api: 'google',
            totalResults: response.data.searchInformation?.totalResults || 0,
            results: results.map(item => ({
                title: item.title,
                link: item.link,
                description: item.snippet,
                displayLink: item.displayLink
            }))
        };
    }

    // Bing Search API implementation
    async searchWithBing(query) {
        if (!this.apis.bing.apiKey) {
            throw new Error('Bing API key not configured');
        }

        const response = await axios.get(this.apis.bing.baseUrl, {
            headers: {
                'Ocp-Apim-Subscription-Key': this.apis.bing.apiKey
            },
            params: {
                q: query,
                count: 10
            }
        });

        const results = response.data.webPages?.value || [];
        return {
            query,
            api: 'bing',
            totalResults: response.data.webPages?.totalEstimatedMatches || 0,
            results: results.map(item => ({
                title: item.name,
                link: item.url,
                description: item.snippet,
                displayLink: item.displayUrl
            }))
        };
    }

    // SerpAPI implementation (provides Google, Bing, DuckDuckGo results)
    async searchWithSerpAPI(query) {
        if (!this.apis.serpapi.apiKey) {
            throw new Error('SerpAPI key not configured');
        }

        const response = await axios.get(this.apis.serpapi.baseUrl, {
            params: {
                api_key: this.apis.serpapi.apiKey,
                q: query,
                engine: 'duckduckgo', // or 'google', 'bing'
                num: 10
            }
        });

        const results = response.data.organic_results || [];
        return {
            query,
            api: 'serpapi',
            results: results.map(item => ({
                title: item.title,
                link: item.link,
                description: item.snippet,
                displayLink: item.displayed_link || item.link
            }))
        };
    }

    // SearchAPI implementation
    async searchWithSearchAPI(query) {
        if (!this.apis.searchapi.apiKey) {
            throw new Error('SearchAPI key not configured');
        }

        const response = await axios.get(this.apis.searchapi.baseUrl, {
            params: {
                api_key: this.apis.searchapi.apiKey,
                q: query,
                engine: 'google' // or other engines
            }
        });

        const results = response.data.organic_results || [];
        return {
            query,
            api: 'searchapi',
            results: results.map(item => ({
                title: item.title,
                link: item.link,
                description: item.snippet,
                displayLink: item.displayed_link || item.link
            }))
        };
    }

    // Fallback: DuckDuckGo HTML scraping (use as last resort)
    async searchWithDDGScraping(query) {
        try {
            const response = await axios.post(this.ddg_scrape_url, 
                new URLSearchParams({
                    q: query,
                    b: ''
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            );

            const $ = cheerio.load(response.data);
            const results = [];

            $('.result').each((index, element) => {
                const $el = $(element);
                const title = $el.find('.result__title a').text().trim();
                const link = $el.find('.result__title a').attr('href');
                const description = $el.find('.result__snippet').text().trim();
                
                if (title && link) {
                    results.push({
                        title,
                        link: link.startsWith('http') ? link : `https:${link}`,
                        description,
                        displayLink: link
                    });
                }
            });

            return {
                query,
                api: 'ddg_scrape',
                results: results.slice(0, 10)
            };
        } catch (error) {
            throw new Error(`DuckDuckGo scraping failed: ${error.message}`);
        }
    }

    // Google Images search
    async searchImagesWithGoogle(query) {
        const response = await axios.get(this.apis.google.baseUrl, {
            params: {
                key: this.apis.google.apiKey,
                cx: this.apis.google.searchEngineId,
                q: query,
                searchType: 'image',
                num: 10
            }
        });

        const results = response.data.items || [];
        return results.map(item => ({
            title: item.title,
            link: item.link,
            thumbnail: item.image?.thumbnailLink,
            contextLink: item.image?.contextLink,
            description: item.snippet
        }));
    }

    // Bing Images search
    async searchImagesWithBing(query) {
        const response = await axios.get('https://api.bing.microsoft.com/v7.0/images/search', {
            headers: {
                'Ocp-Apim-Subscription-Key': this.apis.bing.apiKey
            },
            params: {
                q: query,
                count: 10
            }
        });

        const results = response.data.value || [];
        return results.map(item => ({
            title: item.name,
            link: item.contentUrl,
            thumbnail: item.thumbnailUrl,
            contextLink: item.hostPageUrl,
            description: item.name
        }));
    }

    // Basic image search fallback
    async searchImagesBasic(query) {
        // This is a very basic implementation - consider using a proper API
        return {
            query,
            message: 'Image search requires API key configuration',
            results: []
        };
    }

    logSearchHistory(userId, searchType, keyword, apiUsed = null) {
        const query = `INSERT INTO ${this.tables.history} (user_id, search_type, keyword, api_used) VALUES (?, ?, ?, ?)`;
        this.db.query(query, [userId, searchType, keyword, apiUsed], (err) => {
            if (err) {
                console.error('Error logging search history:', err);
            } else {
                console.log(`Search history logged for keyword: ${keyword} using ${apiUsed}`);
            }
        });
    }
}

module.exports = SearchAddon;