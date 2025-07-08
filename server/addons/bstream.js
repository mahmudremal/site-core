const axios = require('axios');

class bStreamAddon {
    constructor(app, dbConnection) {
        this.app = app;
        this.db = dbConnection;
        this.tables = {
            videos: `${this.db.prefix}bstream_videos`,
            streams: `${this.db.prefix}bstream_streams`,
            comments: `${this.db.prefix}bstream_comments`,
            likes: `${this.db.prefix}bstream_likes`,
            reports: `${this.db.prefix}bstream_reports`,
            subscriptions: `${this.db.prefix}bstream_subscriptions`,
            watchHistory: `${this.db.prefix}bstream_watch_history`,
            searchHistory: `${this.db.prefix}bstream_search_history`,
        };
    }

    init() {
        this.createTables();
        // 
        axios.get('https://gist.githubusercontent.com/poudyalanil/ca84582cbeb4fc123a13290a586da925/raw/14a27bd0bcd0cd323b35ad79cf3b493dddf6216b/videos.json')
        .then(out => out.data)
        .then(data => 
            data.map(i => ({ id: i.id, title: i.title, description: i.description, thumbnail: i.thumbnailUrl, time: i.duration, uploadTime: i.uploadTime, views: i.views, channel: i.author, url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', subscriber: i.subscriber, isLive: i.isLive }))
        )
        .then(list => this.cachedVideos = list);
    }

    createTables() {
        const tables = {
            videos: `CREATE TABLE IF NOT EXISTS ${this.tables.videos} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255),
                description TEXT,
                video_url TEXT,
                thumbnail_url TEXT,
                tags TEXT,
                views INT DEFAULT 0,
                is_live BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            streams: `CREATE TABLE IF NOT EXISTS ${this.tables.streams} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255),
                stream_key VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            comments: `CREATE TABLE IF NOT EXISTS ${this.tables.comments} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                video_id INT,
                user_id INT,
                content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            likes: `CREATE TABLE IF NOT EXISTS ${this.tables.likes} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                video_id INT,
                user_id INT,
                type ENUM('like', 'dislike'),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            reports: `CREATE TABLE IF NOT EXISTS ${this.tables.reports} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                video_id INT,
                user_id INT,
                reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            subscriptions: `CREATE TABLE IF NOT EXISTS ${this.tables.subscriptions} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                subscriber_id INT,
                channel_id INT,
                subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            watchHistory: `CREATE TABLE IF NOT EXISTS ${this.tables.watchHistory} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                video_id INT,
                watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            searchHistory: `CREATE TABLE IF NOT EXISTS ${this.tables.searchHistory} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                keyword VARCHAR(255),
                search_type VARCHAR(255),
                _time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
        };

        Object.keys(tables).forEach(table => {
            this.db.query(tables[table], (err) => {
                if (err) console.error(`Error creating ${table} table:`, err);
                else console.log(`${table} table ready.`);
            });
        });
    }

    register(router) {
        router.get('/bstream/videos', (req, res) => {
            res.json(Array.from({ length: 4 }).flatMap(() => this.cachedVideos));
            return;
            this.db.query(`SELECT * FROM ${this.tables.videos} ORDER BY created_at DESC`, (err, results) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch videos' });
                res.json(results);
            });
        });

        router.post('/bstream/videos/upload', (req, res) => {
            const { user_id, title, description, video_url, thumbnail_url, tags } = req.body;
            const query = `INSERT INTO ${this.tables.videos} (user_id, title, description, video_url, thumbnail_url, tags) VALUES (?, ?, ?, ?, ?, ?)`;
            this.db.query(query, [user_id, title, description, video_url, thumbnail_url, tags], (err) => {
                if (err) return res.status(500).json({ error: 'Upload failed' });
                res.json({ message: 'Video uploaded successfully' });
            });
        });

        router.get('/bstream/videos/:id/comments', (req, res) => {
            const { id } = req.params;
            this.db.query(`SELECT * FROM ${this.tables.comments} WHERE video_id = ?`, [id], (err, results) => {
                if (err) return res.status(500).json({ error: 'Error fetching comments' });
                res.json(results);
            });
        });
        
        router.get('/bstream/videos/:id', (req, res) => {
            const { id } = req.params;
            if (this.cachedVideos && this.cachedVideos.find(i => i.id == id)) {
                res.json(this.cachedVideos.find(i => i.id == id));
            }
            return;
            this.db.query(`SELECT * FROM ${this.tables.videos} WHERE id = ?`, [id], (err, results) => {
                if (err) return res.status(500).json({ error: 'Video not found!' });
                res.json(results?.[0]??results);
            });
        });

        router.post('/bstream/videos/:id/comments', (req, res) => {
            const { id } = req.params;
            const { user_id, content } = req.body;
            const query = `INSERT INTO ${this.tables.comments} (video_id, user_id, content) VALUES (?, ?, ?)`;
            this.db.query(query, [id, user_id, content], (err) => {
                if (err) return res.status(500).json({ error: 'Comment failed' });
                res.json({ message: 'Comment added' });
            });
        });

        router.post('/bstream/videos/:id/like', (req, res) => {
            const { id } = req.params;
            const { user_id, type } = req.body;
            const query = `INSERT INTO ${this.tables.likes} (video_id, user_id, type) VALUES (?, ?, ?)`;
            this.db.query(query, [id, user_id, type], (err) => {
                if (err) return res.status(500).json({ error: 'Like failed' });
                res.json({ message: 'Like/Dislike recorded' });
            });
        });

        router.post('/bstream/videos/:id/report', (req, res) => {
            const { id } = req.params;
            const { user_id, reason } = req.body;
            const query = `INSERT INTO ${this.tables.reports} (video_id, user_id, reason) VALUES (?, ?, ?)`;
            this.db.query(query, [id, user_id, reason], (err) => {
                if (err) return res.status(500).json({ error: 'Report failed' });
                res.json({ message: 'Report submitted' });
            });
        });

        router.post('/bstream/subscribe', (req, res) => {
            const { subscriber_id, channel_id } = req.body;
            const query = `INSERT INTO ${this.tables.subscriptions} (subscriber_id, channel_id) VALUES (?, ?)`;
            this.db.query(query, [subscriber_id, channel_id], (err) => {
                if (err) return res.status(500).json({ error: 'Subscription failed' });
                res.json({ message: 'Subscribed successfully' });
            });
        });

        router.post('/bstream/watch', (req, res) => {
            const { user_id, video_id } = req.body;
            const query = `INSERT INTO ${this.tables.watchHistory} (user_id, video_id) VALUES (?, ?)`;
            this.db.query(query, [user_id, video_id], (err) => {
                if (err) return res.status(500).json({ error: 'Watch history failed' });
                res.json({ message: 'Watch history logged' });
            });
        });

        router.post('/bstream/search/history', (req, res) => {
            const { user_id, keyword, search_type } = req.body;
            const query = `INSERT INTO ${this.tables.searchHistory} (user_id, keyword, search_type) VALUES (?, ?, ?)`;
            this.db.query(query, [user_id, keyword, search_type], (err) => {
                if (err) return res.status(500).json({ error: 'Search history failed' });
                res.json({ message: 'Search history saved' });
            });
        });
    }
}

module.exports = bStreamAddon;
