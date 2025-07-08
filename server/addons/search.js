const axios = require('axios');

class SearchAddon {
    constructor(app, dbConnection) {
        this.app = app;
        this.db = dbConnection;
        this.tables = {
            history: `${this.db.prefix}search_history`
        };
        this.peerServer = null;
        this.search_api = 'https://api.duckduckgo.com';
    }

    init() {
        this.createTables();
    }

    createTables() {
        const tables = {
            history: `CREATE TABLE IF NOT EXISTS ${this.tables.history} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                search_type VARCHAR(255) NOT NULL,
                keyword VARCHAR(255) NOT NULL,
                _time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
        };
        Object.keys(tables).forEach((table) => {
            this.db.query(tables[table], (err) => {
                if (err) {
                    console.error(`Error creating ${table} table: `, err);
                } else {
                    console.log(`${table} table created or exists already.`);
                }
            });
        });
    }

    register(router) {
        // 
        router.use('/search', (req, res, next) => {
            console.log('Search endpoint middleware');
            next();
        });

        // Autocomplete suggestions endpoint
        router.get('/search/autocomplete', async (req, res) => {
            const { s: searchKey } = req.query;

            const searchParams = new URLSearchParams({ q: searchKey });
            axios.get(`https://duckduckgo.com/ac?${searchParams.toString()}`)
            .then(res => res.data)
            // .then(data => {console.log(data);return data;})
            .then(data => data.map(suggestion => suggestion.phrase))
            .then(list => res.json(list.slice(0, 5)))
            .catch(err => res.status(500).json({ error: 'Failed to get suggestions', err: err }));
        });

        // Search results endpoint
        router.get('/search/result', async (req, res) => {
            const { s: query, userId = 1 } = req.query;

            try {
                this.logSearchHistory(userId, 'result', query);

                const response = await axios.get(this.search_api, {
                    params: {
                        q: query,
                        format: 'json',
                        no_html: 1,
                        no_redirect: 1,
                    },
                });

                const { data } = response;
                const { AbstractText, AbstractURL, RelatedTopics, Heading } = data;
                const formattedResults = RelatedTopics.filter(result => result.Result).map(i => ({
                    title: i.Text,
                    link: i.FirstURL,
                    description: i.Result,
                    icon: {...i.Icon, URL: i.Icon.URL ? `https://duckduckgo.com${i.Icon.URL}` : null}
                }));

                res.json({...data, result: formattedResults, RelatedTopics: []});
            } catch (error) {
                console.error('Error getting search results:', error);
                res.status(500).json({ error: 'Failed to get search results' });
            }
        });

        // Image search endpoint
        router.get('/search/images', async (req, res) => {
            const query = req.query.q;

            try {
                const response = await axios.get(this.search_api, {
                    params: {
                        q: query,
                        format: 'json',
                        ia: 'images', // Specifying images
                    },
                });

                const images = response.data.RelatedTopics.filter(result => result.Result).map(result => ({
                    title: result.Text,
                    link: result.FirstURL,
                    description: result.Result,
                }));

                res.json(images);
            } catch (error) {
                console.error('Error getting images:', error);
                res.status(500).json({ error: 'Failed to get images' });
            }
        });
    }

    logSearchHistory(userId, searchType, keyword) {
        const query = `INSERT INTO ${this.tables.history} (user_id, search_type, keyword) VALUES (?, ?, ?)`;
        this.db.query(query, [userId, searchType, keyword], (err) => {
            if (err) {
                console.error('Error logging search history:', err);
            } else {
                console.log('Search history logged for keyword:', keyword);
            }
        });
    }
}

module.exports = SearchAddon;