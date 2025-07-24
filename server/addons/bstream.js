const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = file.fieldname === 'video' ? 'uploads/videos/' : 'uploads/thumbnails/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'video') {
            if (file.mimetype.startsWith('video/')) {
                cb(null, true);
            } else {
                cb(new Error('Only video files allowed'), false);
            }
        } else if (file.fieldname === 'thumbnail') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files allowed'), false);
            }
        }
    }
});

class bStreamAddon {
    constructor(app, dbConnection) {
        this.app = app;
        this.db = dbConnection;
        this.activeStreams = new Map(); // Store active live streams
        this.tables = {
            videos: `${this.db.prefix}bstream_videos`,
            streams: `${this.db.prefix}bstream_streams`,
            comments: `${this.db.prefix}bstream_comments`,
            likes: `${this.db.prefix}bstream_likes`,
            reports: `${this.db.prefix}bstream_reports`,
            subscriptions: `${this.db.prefix}bstream_subscriptions`,
            watchHistory: `${this.db.prefix}bstream_watch_history`,
            searchHistory: `${this.db.prefix}bstream_search_history`,
            users: `${this.db.prefix}bstream_users`,
            channels: `${this.db.prefix}bstream_channels`,
            playlists: `${this.db.prefix}bstream_playlists`,
            playlistVideos: `${this.db.prefix}bstream_playlist_videos`,
            notifications: `${this.db.prefix}bstream_notifications`
        };
    }

    init() {
        // Initialize with sample data
        // axios.get('https://gist.githubusercontent.com/poudyalanil/ca84582cbeb4fc123a13290a586da925/raw/14a27bd0bcd0cd323b35ad79cf3b493dddf6216b/videos.json')
        // .then(out => out.data)
        // .then(data => 
        //     data.map(i => ({ 
        //         id: i.id, 
        //         title: i.title, 
        //         description: i.description, 
        //         thumbnail: i.thumbnailUrl, 
        //         time: i.duration, 
        //         uploadTime: i.uploadTime, 
        //         views: i.views, 
        //         channel: i.author, 
        //         url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 
        //         subscriber: i.subscriber, 
        //         isLive: i.isLive 
        //     }))
        // )
        // .then(list => this.cachedVideos = list)
        // .catch(err => console.log('Failed to load sample data:', err));

        // Create uploads directory
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads', { recursive: true });
        }
    }

    get_tables_schemas() {
        return {
            videos: `CREATE TABLE IF NOT EXISTS ${this.tables.videos} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                video_url TEXT NOT NULL,
                thumbnail_url TEXT,
                tags TEXT,
                duration INT DEFAULT 0,
                views INT DEFAULT 0,
                likes_count INT DEFAULT 0,
                dislikes_count INT DEFAULT 0,
                comments_count INT DEFAULT 0,
                is_live BOOLEAN DEFAULT FALSE,
                is_published BOOLEAN DEFAULT TRUE,
                category VARCHAR(100),
                privacy ENUM('public', 'unlisted', 'private') DEFAULT 'public',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`,

            channels: `CREATE TABLE IF NOT EXISTS ${this.tables.channels} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                channel_name VARCHAR(255) NOT NULL,
                channel_description TEXT,
                channel_avatar TEXT,
                channel_banner TEXT,
                subscribers_count INT DEFAULT 0,
                videos_count INT DEFAULT 0,
                total_views INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`,

            streams: `CREATE TABLE IF NOT EXISTS ${this.tables.streams} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                stream_key VARCHAR(255) NOT NULL,
                stream_url TEXT,
                thumbnail_url TEXT,
                is_active BOOLEAN DEFAULT FALSE,
                viewers_count INT DEFAULT 0,
                max_viewers INT DEFAULT 0,
                category VARCHAR(100),
                started_at TIMESTAMP NULL,
                ended_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            comments: `CREATE TABLE IF NOT EXISTS ${this.tables.comments} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                video_id INT NOT NULL,
                user_id INT NOT NULL,
                parent_id INT NULL,
                content TEXT NOT NULL,
                likes_count INT DEFAULT 0,
                replies_count INT DEFAULT 0,
                is_pinned BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`,

            likes: `CREATE TABLE IF NOT EXISTS ${this.tables.likes} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                video_id INT,
                comment_id INT,
                user_id INT NOT NULL,
                type ENUM('like', 'dislike') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            reports: `CREATE TABLE IF NOT EXISTS ${this.tables.reports} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                video_id INT,
                comment_id INT,
                user_id INT NOT NULL,
                reason VARCHAR(255) NOT NULL,
                description TEXT,
                status ENUM('pending', 'reviewed', 'resolved') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            subscriptions: `CREATE TABLE IF NOT EXISTS ${this.tables.subscriptions} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                subscriber_id INT NOT NULL,
                channel_id INT NOT NULL,
                notifications BOOLEAN DEFAULT TRUE,
                subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            watchHistory: `CREATE TABLE IF NOT EXISTS ${this.tables.watchHistory} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                video_id INT NOT NULL,
                watch_duration INT DEFAULT 0,
                completed BOOLEAN DEFAULT FALSE,
                watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            searchHistory: `CREATE TABLE IF NOT EXISTS ${this.tables.searchHistory} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                keyword VARCHAR(255) NOT NULL,
                search_type VARCHAR(255) DEFAULT 'video',
                results_count INT DEFAULT 0,
                search_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            users: `CREATE TABLE IF NOT EXISTS ${this.tables.users} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                avatar TEXT,
                banner TEXT,
                bio TEXT,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                privacy ENUM('public', 'unlisted', 'private') DEFAULT 'public',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`,

            playlists: `CREATE TABLE IF NOT EXISTS ${this.tables.playlists} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                thumbnail_url TEXT,
                privacy ENUM('public', 'unlisted', 'private') DEFAULT 'public',
                videos_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`,

            playlistVideos: `CREATE TABLE IF NOT EXISTS ${this.tables.playlistVideos} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                playlist_id INT NOT NULL,
                video_id INT NOT NULL,
                position INT NOT NULL,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,

            notifications: `CREATE TABLE IF NOT EXISTS ${this.tables.notifications} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT,
                data JSON,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        };

    }

    register(router) {
        // Serve uploaded files
        router.use('/uploads', require('express').static('uploads'));

        // ============= VIDEO MANAGEMENT =============
        
        // Get all videos with pagination and filtering
        router.get('/bstream/videos', (req, res) => {
            const { page = 1, limit = 20, category, search, user_id, sort = 'created_at', order = 'DESC' } = req.query;
            const offset = (page - 1) * limit;
            
            let query = `
                SELECT v.*, u.username, c.channel_name, c.channel_avatar,
                       (SELECT COUNT(*) FROM ${this.tables.likes} WHERE video_id = v.id AND type = 'like') as likes,
                       (SELECT COUNT(*) FROM ${this.tables.likes} WHERE video_id = v.id AND type = 'dislike') as dislikes
                FROM ${this.tables.videos} v 
                LEFT JOIN ${this.tables.users} u ON v.user_id = u.id 
                LEFT JOIN ${this.tables.channels} c ON v.user_id = c.user_id
                WHERE v.is_published = 1 AND v.privacy = 'public'
            `;
            // query = `SELECT v.* from ${this.tables.videos} v`
            const params = [];

            if (category) {
                query += ' AND v.category = ?';
                params.push(category);
            }
            if (search) {
                query += ' AND (v.title LIKE ? OR v.description LIKE ? OR v.tags LIKE ?)';
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }
            if (user_id) {
                query += ' AND v.user_id = ?';
                params.push(user_id);
            }

            query += ` ORDER BY v.${sort} ${order} LIMIT ? OFFSET ?`;
            params.push(parseInt(limit), parseInt(offset));

            this.db.query(query, params, (err, results) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch videos', details: err.message });
                res.json({
                    videos: results,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: results.length
                });
            });
        });

        // Upload video with metadata
        router.post('/bstream/videos/upload', upload.fields([
            { name: 'video', maxCount: 1 },
            { name: 'thumbnail', maxCount: 1 }
        ]), (req, res) => {
            const { user_id, title, description, tags, category, privacy = 'public' } = req.body;
            
            if (!req.files || !req.files.video) {
                return res.status(400).json({ error: 'Video file is required' });
            }

            const videoFile = req.files.video[0];
            const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;
            
            const videoUrl = `/uploads/videos/${videoFile.filename}`;
            const thumbnailUrl = thumbnailFile ? `/uploads/thumbnails/${thumbnailFile.filename}` : null;

            const query = `
                INSERT INTO ${this.tables.videos} 
                (user_id, title, description, video_url, thumbnail_url, tags, category, privacy) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            this.db.query(query, [user_id, title, description, videoUrl, thumbnailUrl, tags, category, privacy], (err, result) => {
                if (err) return res.status(500).json({ error: 'Upload failed', details: err.message });
                
                // Update user's video count
                this.db.query(`UPDATE ${this.tables.channels} SET videos_count = videos_count + 1 WHERE user_id = ?`, [user_id]);
                
                res.json({ 
                    message: 'Video uploaded successfully', 
                    videoId: result.insertId,
                    videoUrl: videoUrl,
                    thumbnailUrl: thumbnailUrl
                });
            });
        });

        // Get single video with detailed info
        router.get('/bstream/videos/:id', (req, res) => {
            const { id } = req.params;
            const { user_id } = req.query;
            
            const query = `
                SELECT v.*, u.username, c.channel_name, c.channel_avatar, c.subscribers_count,
                       (SELECT COUNT(*) FROM ${this.tables.likes} WHERE video_id = v.id AND type = 'like') as likes,
                       (SELECT COUNT(*) FROM ${this.tables.likes} WHERE video_id = v.id AND type = 'dislike') as dislikes,
                       (SELECT COUNT(*) FROM ${this.tables.comments} WHERE video_id = v.id) as comments_count
                FROM ${this.tables.videos} v 
                LEFT JOIN ${this.tables.users} u ON v.user_id = u.id 
                LEFT JOIN ${this.tables.channels} c ON v.user_id = c.user_id
                WHERE v.id = ?
            `;
            
            this.db.query(query, [id], (err, results) => {
                if (err || !results.length) {
                    return res.status(404).json({ error: 'Video not found' });
                }
                
                const video = results[0];
                
                // Increment views
                this.db.query(`UPDATE ${this.tables.videos} SET views = views + 1 WHERE id = ?`, [id]);
                
                // Check if user liked/disliked
                if (user_id) {
                    this.db.query(`SELECT type FROM ${this.tables.likes} WHERE video_id = ? AND user_id = ?`, [id, user_id], (err, likeResults) => {
                        video.userLikeStatus = likeResults.length ? likeResults[0].type : null;
                        res.json(video);
                    });
                } else {
                    res.json(video);
                }
            });
        });

        // Update video information
        router.put('/bstream/videos/:id', (req, res) => {
            const { id } = req.params;
            const { user_id, title, description, tags, category, privacy } = req.body;
            
            // Verify ownership
            this.db.query(`SELECT user_id FROM ${this.tables.videos} WHERE id = ?`, [id], (err, results) => {
                if (err || !results.length) {
                    return res.status(404).json({ error: 'Video not found' });
                }
                
                if (results[0].user_id !== parseInt(user_id)) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }
                
                const query = `
                    UPDATE ${this.tables.videos} 
                    SET title = ?, description = ?, tags = ?, category = ?, privacy = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `;
                
                this.db.query(query, [title, description, tags, category, privacy, id], (err) => {
                    if (err) return res.status(500).json({ error: 'Update failed', details: err.message });
                    res.json({ message: 'Video updated successfully' });
                });
            });
        });

        // Delete video
        router.delete('/bstream/videos/:id', (req, res) => {
            const { id } = req.params;
            const { user_id } = req.body;
            
            // Verify ownership and get file paths
            this.db.query(`SELECT user_id, video_url, thumbnail_url FROM ${this.tables.videos} WHERE id = ?`, [id], (err, results) => {
                if (err || !results.length) {
                    return res.status(404).json({ error: 'Video not found' });
                }
                
                if (results[0].user_id !== parseInt(user_id)) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }
                
                const video = results[0];
                
                // Delete from database
                this.db.query(`DELETE FROM ${this.tables.videos} WHERE id = ?`, [id], (err) => {
                    if (err) return res.status(500).json({ error: 'Delete failed', details: err.message });
                    
                    // Delete files
                    if (video.video_url && !video.video_url.startsWith('http')) {
                        const videoPath = path.join(__dirname, '..', video.video_url);
                        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
                    }
                    if (video.thumbnail_url && !video.thumbnail_url.startsWith('http')) {
                        const thumbnailPath = path.join(__dirname, '..', video.thumbnail_url);
                        if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);
                    }
                    
                    // Update user's video count
                    this.db.query(`UPDATE ${this.tables.channels} SET videos_count = videos_count - 1 WHERE user_id = ?`, [user_id]);
                    
                    res.json({ message: 'Video deleted successfully' });
                });
            });
        });

        // ============= COMMENTS SYSTEM =============
        
        // Get comments for a video
        router.get('/bstream/videos/:id/comments', (req, res) => {
            const { id } = req.params;
            const { page = 1, limit = 20, sort = 'created_at', order = 'DESC' } = req.query;
            const offset = (page - 1) * limit;
            
            const query = `
                SELECT c.*, u.username, u.avatar,
                       (SELECT COUNT(*) FROM ${this.tables.likes} WHERE comment_id = c.id AND type = 'like') as likes,
                       (SELECT COUNT(*) FROM ${this.tables.comments} WHERE parent_id = c.id) as replies_count
                FROM ${this.tables.comments} c 
                LEFT JOIN ${this.tables.users} u ON c.user_id = u.id
                WHERE c.video_id = ? AND c.parent_id IS NULL
                ORDER BY c.is_pinned DESC, c.${sort} ${order}
                LIMIT ? OFFSET ?
            `;
            
            this.db.query(query, [id, parseInt(limit), parseInt(offset)], (err, results) => {
                if (err) return res.status(500).json({ error: 'Error fetching comments', details: err.message });
                res.json({
                    comments: results,
                    page: parseInt(page),
                    limit: parseInt(limit)
                });
            });
        });

        // Add comment
        router.post('/bstream/videos/:id/comments', (req, res) => {
            const { id } = req.params;
            const { user_id, content, parent_id } = req.body;
            
            if (!content || !content.trim()) {
                return res.status(400).json({ error: 'Comment content is required' });
            }
            
            const query = `INSERT INTO ${this.tables.comments} (video_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)`;
            
            this.db.query(query, [id, user_id, content.trim(), parent_id || null], (err, result) => {
                if (err) return res.status(500).json({ error: 'Comment failed', details: err.message });
                
                // Update replies count for parent comment
                if (parent_id) {
                    this.db.query(`UPDATE ${this.tables.comments} SET replies_count = replies_count + 1 WHERE id = ?`, [parent_id]);
                }
                
                res.json({ 
                    message: 'Comment added successfully',
                    commentId: result.insertId
                });
            });
        });

        // Get replies for a comment
        router.get('/bstream/comments/:id/replies', (req, res) => {
            const { id } = req.params;
            
            const query = `
                SELECT c.*, u.username, u.avatar,
                       (SELECT COUNT(*) FROM ${this.tables.likes} WHERE comment_id = c.id AND type = 'like') as likes
                FROM ${this.tables.comments} c 
                LEFT JOIN ${this.tables.users} u ON c.user_id = u.id
                WHERE c.parent_id = ?
                ORDER BY c.created_at ASC
            `;
            
            this.db.query(query, [id], (err, results) => {
                if (err) return res.status(500).json({ error: 'Error fetching replies', details: err.message });
                res.json(results);
            });
        });

        // Delete comment
        router.delete('/bstream/comments/:id', (req, res) => {
            const { id } = req.params;
            const { user_id } = req.body;
            
            // Verify ownership
            this.db.query(`SELECT user_id, parent_id FROM ${this.tables.comments} WHERE id = ?`, [id], (err, results) => {
                if (err || !results.length) {
                    return res.status(404).json({ error: 'Comment not found' });
                }
                
                if (results[0].user_id !== parseInt(user_id)) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }
                
                const comment = results[0];
                
                this.db.query(`DELETE FROM ${this.tables.comments} WHERE id = ?`, [id], (err) => {
                    if (err) return res.status(500).json({ error: 'Delete failed', details: err.message });
                    
                    // Update parent replies count if this was a reply
                    if (comment.parent_id) {
                        this.db.query(`UPDATE ${this.tables.comments} SET replies_count = replies_count - 1 WHERE id = ?`, [comment.parent_id]);
                    }
                    
                    res.json({ message: 'Comment deleted successfully' });
                });
            });
        });

        // ============= LIKES/DISLIKES =============
        
        // Like/dislike video
        router.post('/bstream/videos/:id/like', (req, res) => {
            const { id } = req.params;
            const { user_id, type } = req.body; // 'like' or 'dislike'
            
            if (!['like', 'dislike'].includes(type)) {
                return res.status(400).json({ error: 'Invalid like type' });
            }
            
            // Check existing like
            this.db.query(`SELECT type FROM ${this.tables.likes} WHERE video_id = ? AND user_id = ?`, [id, user_id], (err, results) => {
                if (err) return res.status(500).json({ error: 'Database error', details: err.message });
                
                if (results.length) {
                    if (results[0].type === type) {
                        // Remove like/dislike
                        this.db.query(`DELETE FROM ${this.tables.likes} WHERE video_id = ? AND user_id = ?`, [id, user_id], (err) => {
                            if (err) return res.status(500).json({ error: 'Unlike failed', details: err.message });
                            res.json({ message: `${type} removed`, action: 'removed' });
                        });
                    } else {
                        // Update like/dislike
                        this.db.query(`UPDATE ${this.tables.likes} SET type = ? WHERE video_id = ? AND user_id = ?`, [type, id, user_id], (err) => {
                            if (err) return res.status(500).json({ error: 'Like update failed', details: err.message });
                            res.json({ message: `Changed to ${type}`, action: 'updated' });
                        });
                    }
                } else {
                    // Add new like/dislike
                    this.db.query(`INSERT INTO ${this.tables.likes} (video_id, user_id, type) VALUES (?, ?, ?)`, [id, user_id, type], (err) => {
                        if (err) return res.status(500).json({ error: 'Like failed', details: err.message });
                        res.json({ message: `${type} recorded`, action: 'added' });
                    });
                }
            });
        });

        // Like/dislike comment
        router.post('/bstream/comments/:id/like', (req, res) => {
            const { id } = req.params;
            const { user_id } = req.body;
            
            // Check existing like
            this.db.query(`SELECT id FROM ${this.tables.likes} WHERE comment_id = ? AND user_id = ?`, [id, user_id], (err, results) => {
                if (err) return res.status(500).json({ error: 'Database error', details: err.message });
                
                if (results.length) {
                    // Remove like
                    this.db.query(`DELETE FROM ${this.tables.likes} WHERE comment_id = ? AND user_id = ?`, [id, user_id], (err) => {
                        if (err) return res.status(500).json({ error: 'Unlike failed', details: err.message });
                        res.json({ message: 'Like removed', action: 'removed' });
                    });
                } else {
                    // Add like
                    this.db.query(`INSERT INTO ${this.tables.likes} (comment_id, user_id, type) VALUES (?, ?, 'like')`, [id, user_id], (err) => {
                        if (err) return res.status(500).json({ error: 'Like failed', details: err.message });
                        res.json({ message: 'Like recorded', action: 'added' });
                    });
                }
            });
        });

        // ============= LIVE STREAMING =============
        
        // Create live stream
        router.post('/bstream/streams/create', (req, res) => {
            const { user_id, title, description, category } = req.body;
            const streamKey = this.generateStreamKey();
            
            const query = `
                INSERT INTO ${this.tables.streams} 
                (user_id, title, description, stream_key, category) 
                VALUES (?, ?, ?, ?, ?)
            `;
            
            this.db.query(query, [user_id, title, description, streamKey, category], (err, result) => {
                if (err) return res.status(500).json({ error: 'Stream creation failed', details: err.message });
                
                res.json({
                    message: 'Stream created successfully',
                    streamId: result.insertId,
                    streamKey: streamKey,
                    streamUrl: `/bstream/streams/watch/${result.insertId}`
                });
            });
        });

        // Start live stream
        router.post('/bstream/streams/:id/start', (req, res) => {
            const { id } = req.params;
            const { user_id } = req.body;
            
            // Verify ownership
            this.db.query(`SELECT user_id, stream_key FROM ${this.tables.streams} WHERE id = ?`, [id], (err, results) => {
                if (err || !results.length) {
                    return res.status(404).json({ error: 'Stream not found' });
                }
                
                if (results[0].user_id !== parseInt(user_id)) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }
                
                // Update stream status
                this.db.query(`UPDATE ${this.tables.streams} SET is_active = 1, started_at = CURRENT_TIMESTAMP WHERE id = ?`, [id], (err) => {
                    if (err) return res.status(500).json({ error: 'Failed to start stream', details: err.message });
                    
                    // Add to active streams
                    this.activeStreams.set(id, {
                        streamId: id,
                        userId: user_id,
                        streamKey: results[0].stream_key,
                        viewers: new Set(),
                        startTime: new Date()
                    });
                    
                    res.json({ message: 'Stream started successfully' });
                });
            });
        });

        // End live stream
        router.post('/bstream/streams/:id/end', (req, res) => {
            const { id } = req.params;
            const { user_id } = req.body;
            
            // Verify ownership
            this.db.query(`SELECT user_id FROM ${this.tables.streams} WHERE id = ?`, [id], (err, results) => {
                if (err || !results.length) {
                    return res.status(404).json({ error: 'Stream not found' });
                }
                
                if (results[0].user_id !== parseInt(user_id)) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }
                
                // Update stream status
                this.db.query(`UPDATE ${this.tables.streams} SET is_active = 0, ended_at = CURRENT_TIMESTAMP WHERE id = ?`, [id], (err) => {
                    if (err) return res.status(500).json({ error: 'Failed to end stream', details: err.message });
                    
                    // Remove from active streams
                    this.activeStreams.delete(id);
                    
                    res.json({ message: 'Stream ended successfully' });
                });
            });
        });

        // Get live streams
        router.get('/bstream/streams/live', (req, res) => {
            const { page = 1, limit = 20, category } = req.query;
            const offset = (page - 1) * limit;
            
            let query = `
                SELECT s.*, u.username, c.channel_name, c.channel_avatar
                FROM ${this.tables.streams} s 
                LEFT JOIN ${this.tables.users} u ON s.user_id = u.id 
                LEFT JOIN ${this.tables.channels} c ON s.user_id = c.user_id
                WHERE s.is_active = 1
            `;
            const params = [];

            if (category) {
                query += ' AND s.category = ?';
                params.push(category);
            }

            query += ' ORDER BY s.started_at DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), parseInt(offset));

            this.db.query(query, params, (err, results) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch live streams', details: err.message });
                
                // Add current viewer counts
                results.forEach(stream => {
                    const activeStream = this.activeStreams.get(stream.id);
                    stream.current_viewers = activeStream ? activeStream.viewers.size : 0;
                });
                
                res.json({
                    streams: results,
                    page: parseInt(page),
                    limit: parseInt(limit)
                });
            });
        });

        // Watch live stream
        router.get('/bstream/streams/watch/:id', (req, res) => {
            const { id } = req.params;
            const { user_id } = req.query;
            
            this.db.query(`
                SELECT s.*, u.username, c.channel_name, c.channel_avatar, c.subscribers_count
                FROM ${this.tables.streams} s 
                LEFT JOIN ${this.tables.users} u ON s.user_id = u.id 
                LEFT JOIN ${this.tables.channels} c ON s.user_id = c.user_id
                WHERE s.id = ?
            `, [id], (err, results) => {
                if (err || !results.length) {
                    return res.status(404).json({ error: 'Stream not found' });
                }
                
                const stream = results[0];
                const activeStream = this.activeStreams.get(parseInt(id));
                
                if (activeStream && user_id) {
                    // Add viewer
                    activeStream.viewers.add(user_id);
                    
                    // Update viewer count in database
                    const viewerCount = activeStream.viewers.size;
                    this.db.query(`UPDATE ${this.tables.streams} SET viewers_count = ?, max_viewers = GREATEST(max_viewers, ?) WHERE id = ?`, 
                        [viewerCount, viewerCount, id]);
                }
                
                stream.current_viewers = activeStream ? activeStream.viewers.size : 0;
                res.json(stream);
            });
        });

        // ============= SUBSCRIPTIONS =============
        
        // Subscribe to channel
        router.post('/bstream/subscribe', (req, res) => {
            const { subscriber_id, channel_id, notifications = true } = req.body;
            
            // Check if already subscribed
            this.db.query(`SELECT id FROM ${this.tables.subscriptions} WHERE subscriber_id = ? AND channel_id = ?`, 
                [subscriber_id, channel_id], (err, results) => {
                if (err) return res.status(500).json({ error: 'Database error', details: err.message });
                
                if (results.length) {
                    return res.status(400).json({ error: 'Already subscribed' });
                }
                
                // Add subscription
                this.db.query(`INSERT INTO ${this.tables.subscriptions} (subscriber_id, channel_id, notifications) VALUES (?, ?, ?)`, 
                    [subscriber_id, channel_id, notifications], (err) => {
                    if (err) return res.status(500).json({ error: 'Subscription failed', details: err.message });
                    
                    // Update subscriber count
                    this.db.query(`UPDATE ${this.tables.channels} SET subscribers_count = subscribers_count + 1 WHERE user_id = ?`, [channel_id]);
                    
                    res.json({ message: 'Subscribed successfully' });
                });
            });
        });

        // Unsubscribe from channel
        router.post('/bstream/unsubscribe', (req, res) => {
            const { subscriber_id, channel_id } = req.body;
            
            this.db.query(`DELETE FROM ${this.tables.subscriptions} WHERE subscriber_id = ? AND channel_id = ?`, 
                [subscriber_id, channel_id], (err, result) => {
                if (err) return res.status(500).json({ error: 'Unsubscribe failed', details: err.message });
                
                if (result.affectedRows === 0) {
                    return res.status(400).json({ error: 'Not subscribed' });
                }
                
                // Update subscriber count
                this.db.query(`UPDATE ${this.tables.channels} SET subscribers_count = subscribers_count - 1 WHERE user_id = ?`, [channel_id]);
                
                res.json({ message: 'Unsubscribed successfully' });
            });
        });

        // Get user subscriptions
        router.get('/bstream/subscriptions/:userId', (req, res) => {
            const { userId } = req.params;
            
            const query = `
                SELECT c.*, s.subscribed_at, s.notifications
                FROM ${this.tables.subscriptions} s
                LEFT JOIN ${this.tables.channels} c ON s.channel_id = c.user_id
                WHERE s.subscriber_id = ?
                ORDER BY s.subscribed_at DESC
            `;
            
            this.db.query(query, [userId], (err, results) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch subscriptions', details: err.message });
                res.json(results);
            });
        });

        // Get subscription feed
        router.get('/bstream/feed/:userId', (req, res) => {
            const { userId } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;
            
            const query = `
                SELECT v.*, u.username, c.channel_name, c.channel_avatar
                FROM ${this.tables.videos} v
                INNER JOIN ${this.tables.subscriptions} s ON v.user_id = s.channel_id
                LEFT JOIN ${this.tables.users} u ON v.user_id = u.id
                LEFT JOIN ${this.tables.channels} c ON v.user_id = c.user_id
                WHERE s.subscriber_id = ? AND v.is_published = 1 AND v.privacy = 'public'
                ORDER BY v.created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            this.db.query(query, [userId, parseInt(limit), parseInt(offset)], (err, results) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch feed', details: err.message });
                res.json({
                    videos: results,
                    page: parseInt(page),
                    limit: parseInt(limit)
                });
            });
        });

        // ============= PLAYLISTS =============
        
        // Create playlist
        router.post('/bstream/playlists', (req, res) => {
            const { user_id, title, description, privacy = 'public' } = req.body;
            
            const query = `INSERT INTO ${this.tables.playlists} (user_id, title, description, privacy) VALUES (?, ?, ?, ?)`;
            
            this.db.query(query, [user_id, title, description, privacy], (err, result) => {
                if (err) return res.status(500).json({ error: 'Playlist creation failed', details: err.message });
                res.json({ 
                    message: 'Playlist created successfully',
                    playlistId: result.insertId
                });
            });
        });

        // Get user playlists
        router.get('/bstream/playlists/user/:userId', (req, res) => {
            const { userId } = req.params;
            const { includePrivate = false } = req.query;
            
            let query = `SELECT * FROM ${this.tables.playlists} WHERE user_id = ?`;
            const params = [userId];
            
            if (!includePrivate) {
                query += ' AND privacy != "private"';
            }
            
            query += ' ORDER BY updated_at DESC';
            
            this.db.query(query, params, (err, results) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch playlists', details: err.message });
                res.json(results);
            });
        });

        // Get playlist with videos
        router.get('/bstream/playlists/:id', (req, res) => {
            const { id } = req.params;
            
            // Get playlist info
            this.db.query(`SELECT * FROM ${this.tables.playlists} WHERE id = ?`, [id], (err, playlistResults) => {
                if (err || !playlistResults.length) {
                    return res.status(404).json({ error: 'Playlist not found' });
                }
                
                const playlist = playlistResults[0];
                
                // Get playlist videos
                const videosQuery = `
                    SELECT v.*, pv.position, u.username, c.channel_name
                    FROM ${this.tables.playlistVideos} pv
                    INNER JOIN ${this.tables.videos} v ON pv.video_id = v.id
                    LEFT JOIN ${this.tables.users} u ON v.user_id = u.id
                    LEFT JOIN ${this.tables.channels} c ON v.user_id = c.user_id
                    WHERE pv.playlist_id = ?
                    ORDER BY pv.position ASC
                `;
                
                this.db.query(videosQuery, [id], (err, videoResults) => {
                    if (err) return res.status(500).json({ error: 'Failed to fetch playlist videos', details: err.message });
                    
                    playlist.videos = videoResults;
                    res.json(playlist);
                });
            });
        });

        // Add video to playlist
        router.post('/bstream/playlists/:id/videos', (req, res) => {
            const { id } = req.params;
            const { user_id, video_id } = req.body;
            
            // Verify playlist ownership
            this.db.query(`SELECT user_id FROM ${this.tables.playlists} WHERE id = ?`, [id], (err, results) => {
                if (err || !results.length) {
                    return res.status(404).json({ error: 'Playlist not found' });
                }
                
                if (results[0].user_id !== parseInt(user_id)) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }
                
                // Get next position
                this.db.query(`SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM ${this.tables.playlistVideos} WHERE playlist_id = ?`, 
                    [id], (err, posResults) => {
                    if (err) return res.status(500).json({ error: 'Database error', details: err.message });
                    
                    const position = posResults[0].next_position;
                    
                    // Add video to playlist
                    this.db.query(`INSERT INTO ${this.tables.playlistVideos} (playlist_id, video_id, position) VALUES (?, ?, ?)`, 
                        [id, video_id, position], (err) => {
                        if (err) {
                            if (err.code === 'ER_DUP_ENTRY') {
                                return res.status(400).json({ error: 'Video already in playlist' });
                            }
                            return res.status(500).json({ error: 'Failed to add video', details: err.message });
                        }
                        
                        // Update playlist video count
                        this.db.query(`UPDATE ${this.tables.playlists} SET videos_count = videos_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [id]);
                        
                        res.json({ message: 'Video added to playlist successfully' });
                    });
                });
            });
        });

        // Remove video from playlist
        router.delete('/bstream/playlists/:id/videos/:videoId', (req, res) => {
            const { id, videoId } = req.params;
            const { user_id } = req.body;
            
            // Verify playlist ownership
            this.db.query(`SELECT user_id FROM ${this.tables.playlists} WHERE id = ?`, [id], (err, results) => {
                if (err || !results.length) {
                    return res.status(404).json({ error: 'Playlist not found' });
                }
                
                if (results[0].user_id !== parseInt(user_id)) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }
                
                // Remove video
                this.db.query(`DELETE FROM ${this.tables.playlistVideos} WHERE playlist_id = ? AND video_id = ?`, 
                    [id, videoId], (err, result) => {
                    if (err) return res.status(500).json({ error: 'Failed to remove video', details: err.message });
                    
                    if (result.affectedRows === 0) {
                        return res.status(404).json({ error: 'Video not found in playlist' });
                    }
                    
                    // Update playlist video count
                    this.db.query(`UPDATE ${this.tables.playlists} SET videos_count = videos_count - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [id]);
                    
                    res.json({ message: 'Video removed from playlist successfully' });
                });
            });
        });

        // ============= WATCH HISTORY =============
        
        // Record watch history
        router.post('/bstream/watch', (req, res) => {
            const { user_id, video_id, watch_duration, completed = false } = req.body;
            
            // Check if already watched
            this.db.query(`SELECT id FROM ${this.tables.watchHistory} WHERE user_id = ? AND video_id = ?`, 
                [user_id, video_id], (err, results) => {
                if (err) return res.status(500).json({ error: 'Database error', details: err.message });
                
                if (results.length) {
                    // Update existing record
                    this.db.query(`UPDATE ${this.tables.watchHistory} SET watch_duration = ?, completed = ?, watched_at = CURRENT_TIMESTAMP WHERE user_id = ? AND video_id = ?`, 
                        [watch_duration, completed, user_id, video_id], (err) => {
                        if (err) return res.status(500).json({ error: 'Watch history update failed', details: err.message });
                        res.json({ message: 'Watch history updated' });
                    });
                } else {
                    // Create new record
                    this.db.query(`INSERT INTO ${this.tables.watchHistory} (user_id, video_id, watch_duration, completed) VALUES (?, ?, ?, ?)`, 
                        [user_id, video_id, watch_duration, completed], (err) => {
                        if (err) return res.status(500).json({ error: 'Watch history failed', details: err.message });
                        res.json({ message: 'Watch history logged' });
                    });
                }
            });
        });

        // Get watch history
        router.get('/bstream/history/:userId', (req, res) => {
            const { userId } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;
            
            const query = `
                SELECT wh.*, v.title, v.thumbnail_url, v.duration, u.username, c.channel_name
                FROM ${this.tables.watchHistory} wh
                INNER JOIN ${this.tables.videos} v ON wh.video_id = v.id
                LEFT JOIN ${this.tables.users} u ON v.user_id = u.id
                LEFT JOIN ${this.tables.channels} c ON v.user_id = c.user_id
                WHERE wh.user_id = ? AND v.is_published = 1 AND v.privacy != 'private'
                ORDER BY wh.watched_at DESC
                LIMIT ? OFFSET ?
            `;
            
            this.db.query(query, [userId, parseInt(limit), parseInt(offset)], (err, results) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch watch history', details: err.message });
                res.json({
                    history: results,
                    page: parseInt(page),
                    limit: parseInt(limit)
                });
            });
        });

        // ============= SEARCH =============
        
        // Search videos
        router.get('/bstream/search', (req, res) => {
            const { q, type = 'video', category, duration, upload_date, sort = 'relevance', page = 1, limit = 20, user_id } = req.query;
            const offset = (page - 1) * limit;
            
            if (!q || !q.trim()) {
                return res.status(400).json({ error: 'Search query is required' });
            }
            
            // Log search if user is logged in
            if (user_id) {
                this.db.query(`INSERT INTO ${this.tables.searchHistory} (user_id, keyword, search_type) VALUES (?, ?, ?)`, 
                    [user_id, q.trim(), type]);
            }
            
            let query, params;
            
            if (type === 'video') {
                query = `
                    SELECT v.*, u.username, c.channel_name, c.channel_avatar,
                           MATCH(v.title, v.description, v.tags) AGAINST (? IN NATURAL LANGUAGE MODE) as relevance_score
                    FROM ${this.tables.videos} v
                    LEFT JOIN ${this.tables.users} u ON v.user_id = u.id
                    LEFT JOIN ${this.tables.channels} c ON v.user_id = c.user_id
                    WHERE v.is_published = 1 AND v.privacy = 'public'
                    AND (v.title LIKE ? OR v.description LIKE ? OR v.tags LIKE ?)
                `;
                
                params = [q, `%${q}%`, `%${q}%`, `%${q}%`];
                
                if (category) {
                    query += ' AND v.category = ?';
                    params.push(category);
                }
                
                if (duration) {
                    switch (duration) {
                        case 'short':
                            query += ' AND v.duration < 240'; // Under 4 minutes
                            break;
                        case 'medium':
                            query += ' AND v.duration BETWEEN 240 AND 1200'; // 4-20 minutes
                            break;
                        case 'long':
                            query += ' AND v.duration > 1200'; // Over 20 minutes
                            break;
                    }
                }
                
                if (upload_date) {
                    switch (upload_date) {
                        case 'hour':
                            query += ' AND v.created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)';
                            break;
                        case 'day':
                            query += ' AND v.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)';
                            break;
                        case 'week':
                            query += ' AND v.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
                            break;
                        case 'month':
                            query += ' AND v.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
                            break;
                        case 'year':
                            query += ' AND v.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
                            break;
                    }
                }
                
                // Add sorting
                switch (sort) {
                    case 'date':
                        query += ' ORDER BY v.created_at DESC';
                        break;
                    case 'views':
                        query += ' ORDER BY v.views DESC';
                        break;
                    case 'rating':
                        query += ' ORDER BY v.likes_count DESC';
                        break;
                    default:
                        query += ' ORDER BY relevance_score DESC, v.views DESC';
                        break;
                }
                
            } else if (type === 'channel') {
                query = `
                    SELECT c.*, u.username
                    FROM ${this.tables.channels} c
                    LEFT JOIN ${this.tables.users} u ON c.user_id = u.id
                    WHERE c.channel_name LIKE ? OR c.channel_description LIKE ?
                    ORDER BY c.subscribers_count DESC
                `;
                params = [`%${q}%`, `%${q}%`];
            }
            
            query += ' LIMIT ? OFFSET ?';
            params.push(parseInt(limit), parseInt(offset));
            
            this.db.query(query, params, (err, results) => {
                if (err) return res.status(500).json({ error: 'Search failed', details: err.message });
                
                // Update search results count
                if (user_id) {
                    this.db.query(`UPDATE ${this.tables.searchHistory} SET results_count = ? WHERE user_id = ? AND keyword = ? ORDER BY search_time DESC LIMIT 1`, 
                        [results.length, user_id, q.trim()]);
                }
                
                res.json({
                    results: results,
                    query: q,
                    type: type,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: results.length
                });
            });
        });

        // Get search suggestions
        router.get('/bstream/search/suggestions', (req, res) => {
            const { q } = req.query;
            
            if (!q || q.length < 2) {
                return res.json({ suggestions: [] });
            }
            
            const query = `
                SELECT DISTINCT keyword, COUNT(*) as frequency
                FROM ${this.tables.searchHistory}
                WHERE keyword LIKE ?
                GROUP BY keyword
                ORDER BY frequency DESC, keyword ASC
                LIMIT 10
            `;
            
            this.db.query(query, [`%${q}%`], (err, results) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch suggestions', details: err.message });
                
                const suggestions = results.map(r => r.keyword);
                res.json({ suggestions });
            });
        });

        // ============= REPORTS =============
        
        // Report video/comment
        router.post('/bstream/report', (req, res) => {
            const { user_id, video_id, comment_id, reason, description } = req.body;
            
            if (!video_id && !comment_id) {
                return res.status(400).json({ error: 'Either video_id or comment_id is required' });
            }
            
            const query = `INSERT INTO ${this.tables.reports} (video_id, comment_id, user_id, reason, description) VALUES (?, ?, ?, ?, ?)`;
            
            this.db.query(query, [video_id || null, comment_id || null, user_id, reason, description], (err) => {
                if (err) return res.status(500).json({ error: 'Report failed', details: err.message });
                res.json({ message: 'Report submitted successfully' });
            });
        });

        // ============= CHANNEL MANAGEMENT =============
        
        // Create/update channel
        router.post('/bstream/channels', upload.fields([
            { name: 'avatar', maxCount: 1 },
            { name: 'banner', maxCount: 1 }
        ]), (req, res) => {
            const { user_id, channel_name, channel_description } = req.body;
            
            const avatarFile = req.files && req.files.avatar ? req.files.avatar[0] : null;
            const bannerFile = req.files && req.files.banner ? req.files.banner[0] : null;
            
            const avatarUrl = avatarFile ? `/uploads/avatars/${avatarFile.filename}` : null;
            const bannerUrl = bannerFile ? `/uploads/banners/${bannerFile.filename}` : null;
            
            // Check if channel exists
            this.db.query(`SELECT id FROM ${this.tables.channels} WHERE user_id = ?`, [user_id], (err, results) => {
                if (err) return res.status(500).json({ error: 'Database error', details: err.message });
                
                let query, params;
                
                if (results.length) {
                    // Update existing channel
                    query = `UPDATE ${this.tables.channels} SET channel_name = ?, channel_description = ?`;
                    params = [channel_name, channel_description];
                    
                    if (avatarUrl) {
                        query += ', channel_avatar = ?';
                        params.push(avatarUrl);
                    }
                    if (bannerUrl) {
                        query += ', channel_banner = ?';
                        params.push(bannerUrl);
                    }
                    
                    query += ', updated_at = CURRENT_TIMESTAMP WHERE user_id = ?';
                    params.push(user_id);
                    
                } else {
                    // Create new channel
                    query = `INSERT INTO ${this.tables.channels} (user_id, channel_name, channel_description, channel_avatar, channel_banner) VALUES (?, ?, ?, ?, ?)`;
                    params = [user_id, channel_name, channel_description, avatarUrl, bannerUrl];
                }
                
                this.db.query(query, params, (err, result) => {
                    if (err) return res.status(500).json({ error: 'Channel operation failed', details: err.message });
                    
                    res.json({
                        message: results.length ? 'Channel updated successfully' : 'Channel created successfully',
                        channelId: results.length ? results[0].id : result.insertId
                    });
                });
            });
        });

        // Get channel info
        router.get('/bstream/channels/:userId', (req, res) => {
            const { userId } = req.params;
            
            const query = `
                SELECT c.*, u.username,
                       (SELECT COUNT(*) FROM ${this.tables.videos} WHERE user_id = c.user_id AND is_published = 1) as videos_count,
                       (SELECT SUM(views) FROM ${this.tables.videos} WHERE user_id = c.user_id AND is_published = 1) as total_views
                FROM ${this.tables.channels} c
                LEFT JOIN ${this.tables.users} u ON c.user_id = u.id
                WHERE c.user_id = ?
            `;
            
            this.db.query(query, [userId], (err, results) => {
                if (err || !results.length) {
                    return res.status(404).json({ error: 'Channel not found' });
                }
                
                res.json(results[0]);
            });
        });

        // ============= ANALYTICS =============
        
        // Get video analytics
        router.get('/bstream/analytics/video/:id', (req, res) => {
            const { id } = req.params;
            const { user_id } = req.query;
            
            // Verify ownership
            this.db.query(`SELECT user_id FROM ${this.tables.videos} WHERE id = ?`, [id], (err, results) => {
                if (err || !results.length) {
                    return res.status(404).json({ error: 'Video not found' });
                }
                
                if (results[0].user_id !== parseInt(user_id)) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }
                
                const analyticsQuery = `
                    SELECT 
                        v.*,
                        (SELECT COUNT(*) FROM ${this.tables.likes} WHERE video_id = v.id AND type = 'like') as likes,
                        (SELECT COUNT(*) FROM ${this.tables.likes} WHERE video_id = v.id AND type = 'dislike') as dislikes,
                        (SELECT COUNT(*) FROM ${this.tables.comments} WHERE video_id = v.id) as comments,
                        (SELECT COUNT(*) FROM ${this.tables.watchHistory} WHERE video_id = v.id) as unique_views,
                        (SELECT AVG(watch_duration) FROM ${this.tables.watchHistory} WHERE video_id = v.id) as avg_watch_duration
                    FROM ${this.tables.videos} v
                    WHERE v.id = ?
                `;
                
                this.db.query(analyticsQuery, [id], (err, analyticsResults) => {
                    if (err) return res.status(500).json({ error: 'Failed to fetch analytics', details: err.message });
                    res.json(analyticsResults[0]);
                });
            });
        });
        router.get('/bstream/analytics/channel/:userId', (req, res) => {
            const { userId } = req.params;
            const { user_id } = req.query;
            
            // Verify ownership
            if (parseInt(userId) !== parseInt(user_id)) {
                return res.status(403).json({ error: 'Unauthorized' });
            }
            
            const analyticsQuery = `
                SELECT 
                    c.*,
                    (SELECT COUNT(*) FROM ${this.tables.videos} WHERE user_id = c.user_id AND is_published = 1) as total_videos,
                    (SELECT SUM(views) FROM ${this.tables.videos} WHERE user_id = c.user_id AND is_published = 1) as total_views,
                    (SELECT COUNT(*) FROM ${this.tables.subscriptions} WHERE channel_id = c.id) as subscribers_count,
                    (SELECT COUNT(*) FROM ${this.tables.likes} l JOIN ${this.tables.videos} v ON l.video_id = v.id WHERE v.user_id = c.user_id AND l.type = 'like') as total_likes,
                    (SELECT COUNT(*) FROM ${this.tables.comments} cm JOIN ${this.tables.videos} v ON cm.video_id = v.id WHERE v.user_id = c.user_id) as total_comments,
                    (SELECT AVG(watch_duration) FROM ${this.tables.watchHistory} wh JOIN ${this.tables.videos} v ON wh.video_id = v.id WHERE v.user_id = c.user_id) as avg_watch_duration
                FROM ${this.tables.channels} c
                WHERE c.user_id = ?
            `;
            
            this.db.query(analyticsQuery, [userId], (err, results) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch channel analytics', details: err.message });
                if (!results.length) return res.status(404).json({ error: 'Channel not found' });
                
                res.json(results[0]);
            });
        });

        // Get detailed analytics with date range
        router.get('/bstream/analytics/detailed/:userId', (req, res) => {
            const { userId } = req.params;
            const { user_id, days = 30 } = req.query;
            
            // Verify ownership
            if (parseInt(userId) !== parseInt(user_id)) {
                return res.status(403).json({ error: 'Unauthorized' });
            }
            
            const dateRange = `DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL ${parseInt(days)} DAY)`;
            
            const queries = {
                viewsOverTime: `
                    SELECT DATE(wh.watched_at) as date, COUNT(*) as views
                    FROM ${this.tables.watchHistory} wh
                    JOIN ${this.tables.videos} v ON wh.video_id = v.id
                    WHERE v.user_id = ? AND ${dateRange.replace('created_at', 'wh.watched_at')}
                    GROUP BY DATE(wh.watched_at)
                    ORDER BY date
                `,
                topVideos: `
                    SELECT v.id, v.title, v.views, v.likes_count, v.comments_count
                    FROM ${this.tables.videos} v
                    WHERE v.user_id = ? AND v.is_published = 1
                    ORDER BY v.views DESC
                    LIMIT 10
                `,
                subscribersOverTime: `
                    SELECT DATE(s.subscribed_at) as date, COUNT(*) as new_subscribers
                    FROM ${this.tables.subscriptions} s
                    JOIN ${this.tables.channels} c ON s.channel_id = c.id
                    WHERE c.user_id = ? AND ${dateRange.replace('created_at', 's.subscribed_at')}
                    GROUP BY DATE(s.subscribed_at)
                    ORDER BY date
                `,
                demographics: `
                    SELECT 
                        HOUR(wh.watched_at) as hour,
                        COUNT(*) as views
                    FROM ${this.tables.watchHistory} wh
                    JOIN ${this.tables.videos} v ON wh.video_id = v.id
                    WHERE v.user_id = ? AND ${dateRange.replace('created_at', 'wh.watched_at')}
                    GROUP BY HOUR(wh.watched_at)
                    ORDER BY hour
                `
            };
            
            const results = {};
            let completedQueries = 0;
            const totalQueries = Object.keys(queries).length;
            
            Object.entries(queries).forEach(([key, query]) => {
                this.db.query(query, [userId], (err, queryResults) => {
                    if (err) {
                        results[key] = [];
                    } else {
                        results[key] = queryResults;
                    }
                    
                    completedQueries++;
                    if (completedQueries === totalQueries) {
                        res.json(results);
                    }
                });
            });
        });

        // ============= NOTIFICATIONS =============
        
        // Get user notifications
        router.get('/bstream/notifications/:userId', (req, res) => {
            const { userId } = req.params;
            const { limit = 20, offset = 0, unread_only = 'false' } = req.query;
            
            let query = `
                SELECT * FROM ${this.tables.notifications}
                WHERE user_id = ?
            `;
            
            if (unread_only === 'true') {
                query += ' AND is_read = FALSE';
            }
            
            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            
            this.db.query(query, [userId, parseInt(limit), parseInt(offset)], (err, results) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
                res.json(results);
            });
        });

        // Mark notification as read
        router.put('/bstream/notifications/:id/read', (req, res) => {
            const { id } = req.params;
            const { user_id } = req.body;
            
            // Verify ownership
            this.db.query(`SELECT user_id FROM ${this.tables.notifications} WHERE id = ?`, [id], (err, results) => {
                if (err || !results.length) {
                    return res.status(404).json({ error: 'Notification not found' });
                }
                
                if (results[0].user_id !== parseInt(user_id)) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }
                
                this.db.query(
                    `UPDATE ${this.tables.notifications} SET is_read = TRUE WHERE id = ?`,
                    [id],
                    (err, result) => {
                        if (err) return res.status(500).json({ error: 'Failed to mark notification as read', details: err.message });
                        res.json({ success: true, message: 'Notification marked as read' });
                    }
                );
            });
        });

        // Mark all notifications as read
        router.put('/bstream/notifications/:userId/read-all', (req, res) => {
            const { userId } = req.params;
            
            this.db.query(
                `UPDATE ${this.tables.notifications} SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE`,
                [userId],
                (err, result) => {
                    if (err) return res.status(500).json({ error: 'Failed to mark notifications as read', details: err.message });
                    res.json({ success: true, message: 'All notifications marked as read', affected: result.affectedRows });
                }
            );
        });

        // Delete notification
        router.delete('/bstream/notifications/:id', (req, res) => {
            const { id } = req.params;
            const { user_id } = req.query;
            
            // Verify ownership
            this.db.query(`SELECT user_id FROM ${this.tables.notifications} WHERE id = ?`, [id], (err, results) => {
                if (err || !results.length) {
                    return res.status(404).json({ error: 'Notification not found' });
                }
                
                if (results[0].user_id !== parseInt(user_id)) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }
                
                this.db.query(`DELETE FROM ${this.tables.notifications} WHERE id = ?`, [id], (err, result) => {
                    if (err) return res.status(500).json({ error: 'Failed to delete notification', details: err.message });
                    res.json({ success: true, message: 'Notification deleted' });
                });
            });
        });

        // ============= ADMIN ROUTES =============
        
        // Get all reports (admin only)
        router.get('/bstream/admin/reports', (req, res) => {
            const { status = 'pending', limit = 50, offset = 0 } = req.query;
            
            let query = `
                SELECT r.*, 
                       u.username as reporter_username,
                       v.title as video_title,
                       c.content as comment_content
                FROM ${this.tables.reports} r
                LEFT JOIN ${this.tables.users} u ON r.user_id = u.id
                LEFT JOIN ${this.tables.videos} v ON r.video_id = v.id
                LEFT JOIN ${this.tables.comments} c ON r.comment_id = c.id
            `;
            
            const params = [];
            if (status !== 'all') {
                query += ' WHERE r.status = ?';
                params.push(status);
            }
            
            query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), parseInt(offset));
            
            this.db.query(query, params, (err, results) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch reports', details: err.message });
                res.json(results);
            });
        });

        // Update report status (admin only)
        router.put('/bstream/admin/reports/:id', (req, res) => {
            const { id } = req.params;
            const { status } = req.body;
            
            if (!['pending', 'reviewed', 'resolved'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }
            
            this.db.query(
                `UPDATE ${this.tables.reports} SET status = ? WHERE id = ?`,
                [status, id],
                (err, result) => {
                    if (err) return res.status(500).json({ error: 'Failed to update report status', details: err.message });
                    if (result.affectedRows === 0) {
                        return res.status(404).json({ error: 'Report not found' });
                    }
                    res.json({ success: true, message: 'Report status updated' });
                }
            );
        });

        // Get platform statistics (admin only)
        router.get('/bstream/admin/stats', (req, res) => {
            const statsQueries = {
                totalVideos: `SELECT COUNT(*) as count FROM ${this.tables.videos}`,
                totalChannels: `SELECT COUNT(*) as count FROM ${this.tables.channels}`,
                totalUsers: `SELECT COUNT(*) as count FROM ${this.tables.users}`,
                totalViews: `SELECT SUM(views) as total FROM ${this.tables.videos}`,
                totalComments: `SELECT COUNT(*) as count FROM ${this.tables.comments}`,
                totalSubscriptions: `SELECT COUNT(*) as count FROM ${this.tables.subscriptions}`,
                activeStreams: `SELECT COUNT(*) as count FROM ${this.tables.streams} WHERE is_active = TRUE`,
                pendingReports: `SELECT COUNT(*) as count FROM ${this.tables.reports} WHERE status = 'pending'`
            };
            
            const results = {};
            let completedQueries = 0;
            const totalQueries = Object.keys(statsQueries).length;
            
            Object.entries(statsQueries).forEach(([key, query]) => {
                this.db.query(query, (err, queryResults) => {
                    if (err) {
                        results[key] = 0;
                    } else {
                        results[key] = queryResults[0].count || queryResults[0].total || 0;
                    }
                    
                    completedQueries++;
                    if (completedQueries === totalQueries) {
                        res.json(results);
                    }
                });
            });
        });

        // ============= TRENDING & RECOMMENDATIONS =============
        
        // Get trending videos
        router.get('/bstream/trending', (req, res) => {
            const { category, limit = 20, time_range = '7' } = req.query;
            
            let query = `
                SELECT v.*, u.username, c.channel_name,
                       (v.views * 0.4 + v.likes_count * 0.3 + v.comments_count * 0.3) as trending_score
                FROM ${this.tables.videos} v
                LEFT JOIN ${this.tables.users} u ON v.user_id = u.id
                LEFT JOIN ${this.tables.channels} c ON v.user_id = c.user_id
                WHERE v.is_published = TRUE 
                AND v.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            `;
            
            const params = [parseInt(time_range)];
            
            if (category) {
                query += ' AND v.category = ?';
                params.push(category);
            }
            
            query += ' ORDER BY trending_score DESC, v.created_at DESC LIMIT ?';
            params.push(parseInt(limit));
            
            this.db.query(query, params, (err, results) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch trending videos', details: err.message });
                res.json(results);
            });
        });

        // Get recommended videos for user
        router.get('/bstream/recommendations/:userId', (req, res) => {
            const { userId } = req.params;
            const { limit = 20 } = req.query;
            
            // Get user's watch history and preferences
            const recommendationQuery = `
                SELECT DISTINCT v.*, u.username, c.channel_name,
                       CASE 
                           WHEN wh.user_id IS NOT NULL THEN 3
                           WHEN s.subscriber_id IS NOT NULL THEN 2
                           ELSE 1
                       END as relevance_score
                FROM ${this.tables.videos} v
                LEFT JOIN ${this.tables.users} u ON v.user_id = u.id
                LEFT JOIN ${this.tables.channels} c ON v.user_id = c.user_id
                LEFT JOIN ${this.tables.watchHistory} wh ON v.category IN (
                    SELECT DISTINCT v2.category 
                    FROM ${this.tables.watchHistory} wh2 
                    JOIN ${this.tables.videos} v2 ON wh2.video_id = v2.id 
                    WHERE wh2.user_id = ?
                    LIMIT 5
                ) AND wh.user_id = ?
                LEFT JOIN ${this.tables.subscriptions} s ON v.user_id = s.channel_id AND s.subscriber_id = ?
                WHERE v.is_published = TRUE 
                AND v.user_id != ?
                AND v.id NOT IN (
                    SELECT video_id FROM ${this.tables.watchHistory} WHERE user_id = ?
                )
                ORDER BY relevance_score DESC, v.views DESC, v.created_at DESC
                LIMIT ?
            `;
            
            this.db.query(recommendationQuery, [userId, userId, userId, userId, userId, parseInt(limit)], (err, results) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch recommendations', details: err.message });
                res.json(results);
            });
        });

        // ============= UTILITY ROUTES =============
        
        // Get categories
        router.get('/bstream/categories', (req, res) => {
            const query = `
                SELECT category, COUNT(*) as video_count
                FROM ${this.tables.videos}
                WHERE category IS NOT NULL AND category != '' AND is_published = TRUE
                GROUP BY category
                ORDER BY video_count DESC
            `;
            
            this.db.query(query, (err, results) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
                res.json(results);
            });
        });

        // Health check
        router.get('/bstream/health', (req, res) => {
            res.json({ 
                status: 'healthy', 
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            });
        });

        return router;

    }
}
module.exports = bStreamAddon;
