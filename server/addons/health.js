const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const Sequelize = require('sequelize');
const { DataTypes, Op } = Sequelize;
const path = require('path');
const crypto = require('crypto');
const Redis = require('ioredis');
const fs = require('fs');

class HealthMonitoringAddon {
    constructor(app, dbConnection) {
        this.app = app;
        this.db = dbConnection;
        // Define tables with the prefix
        this.tables = {
            users: `${this.db.prefix}_health_users`,
            tokens: `${this.db.prefix}_health_tokens`,
            connectionData: `${this.db.prefix}_health_connection_data`,
            deviceData: `${this.db.prefix}_health_device_data`,
        };
        this.s2c_stream_types = ['health_insights', 'medication_reminder', 'diet_plan', 'exercise_plan'];
        this.c2s_stream_types = [
            {key: 'blood_pressure', level: 'Blood Pressure'},
            {key: 'body_heat', level: 'Body Temperature'},
            {key: 'heart_rate', level: 'Heart Rate'},
            {key: 'sugar_level', level: 'Sugar Level'},
            {key: 'sleep_record', level: 'Sleep Record'},
            {key: 'activity_record', level: 'Activity Record'},
        ];
        this.io = null;
        this.redis = new Redis();
        this.cachedIndex = null;
    }

    init() {
        this.createTables();
        this.setupSocketIO();
        this.loadCachedIndex();
    }

    register() {
        const server = this.app.get('server');

        const router = express.Router();
        router.use('/health', (req, res, next) => {
            console.log('Health endpoint middleware');
            next();
        });
        router.get('/health', (req, res) => {
            if (this.cachedIndex) {
                res.send(this.cachedIndex);
            } else {
                res.sendFile(path.join(server.__root, 'public/health/index.html'));
            }
        });
        router.get('/health/grid', (req, res) => {
            res.sendFile(path.join(server.__root, 'public/health/grid.html'));
        });

        // User Registration Route
        router.post('/health/register', (req, res) => {
            const { fn, ln, e, p } = req.body;
            
            this.db.query(`INSERT INTO ${this.tables.users} (fn, ln, e, p) VALUES (?, ?, ?, ?)`, [fn, ln, e, p], (error, results) => {
                if (error) {
                    console.error('Registration failed:', error);
                    return res.status(400).json({ error: 'Registration failed' });
                }
                res.json({ message: 'User registered' });
            });
        });

        // User Login Route
        router.post('/health/login', (req, res) => {
            const { e } = req.body; // Destructure request body
            
            this.db.query(`SELECT * FROM ${this.tables.users} WHERE e = ?`, [e], (error, results) => {
                if (error) {
                    console.error('Login failed:', error);
                    return res.status(500).json({ error: 'Login failed' });
                }
                if (results.length === 0) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                const token = crypto.randomBytes(16).toString('hex'); // Generate a token
                this.db.query(`INSERT INTO ${this.tables.tokens} (u, t, e) VALUES (?, ?, ?)`, [results[0].id, token, new Date(Date.now() + 10 * 60 * 60 * 1000)], (err) => {
                    if (err) {
                        console.error('Failed to create token:', err);
                        return res.status(500).json({ error: 'Failed to create token' });
                    }
                    res.json({ message: 'Login successful', token });
                });
            });
        });

        // Fetch Users Route
        router.get('/health/users', (req, res) => {
            this.db.query(`SELECT * FROM ${this.tables.users}`, (error, results) => {
                if (error) {
                    console.error('Failed to fetch users:', error);
                    return res.status(500).json({ error: 'Failed to fetch users' });
                }
                res.json(results);
            });
        });

        this.app.use(router);
    }

    createTables() {
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS ${this.tables.users} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fn VARCHAR(50) NOT NULL,
                ln VARCHAR(50) NOT NULL,
                e VARCHAR(255) NOT NULL UNIQUE,
                p VARCHAR(255) NOT NULL,
                r TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        this.db.query(createUsersTable, (err) => {
            if (err) {
                console.error('Error creating users table: ', err);
            } else {
                console.log('Users table created or exists already.');
            }
        });

        const createTokensTable = `
            CREATE TABLE IF NOT EXISTS ${this.tables.tokens} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                u INT NOT NULL,
                t VARCHAR(255) NOT NULL,
                e DATETIME NOT NULL
            )
        `;

        this.db.query(createTokensTable, (err) => {
            if (err) {
                console.error('Error creating tokens table: ', err);
            } else {
                console.log('Tokens table created or exists already.');
            }
        });

        const createConnectionDataTable = `
            CREATE TABLE IF NOT EXISTS ${this.tables.connectionData} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                dt VARCHAR(100) NOT NULL,
                u INT NOT NULL,
                st TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                et TIMESTAMP NULL,
                a BOOLEAN DEFAULT TRUE
            )
        `;

        this.db.query(createConnectionDataTable, (err) => {
            if (err) {
                console.error('Error creating connection data table: ', err);
            } else {
                console.log('Connection data table created or exists already.');
            }
        });

        const createDeviceDataTable = `
            CREATE TABLE IF NOT EXISTS ${this.tables.deviceData} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cd INT NOT NULL,
                r FLOAT NOT NULL,
                t TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        this.db.query(createDeviceDataTable, (err) => {
            if (err) {
                console.error('Error creating device data table: ', err);
            } else {
                console.log('Device data table created or exists already.');
            }
        });
    }

    setupSocketIO() {
        this.io = socketIo(this.app.get('server')); // Use server instance
        this.io.on('connection', this.handleSocketConnection.bind(this));
    }

    async handleSocketConnection(socket) {
        console.log('User connected!');

        socket.on('authenticate', (token) => {
            // Check for valid token
            this.db.query(`SELECT * FROM ${this.tables.tokens} WHERE t = ? AND e > NOW()`, [token], (err, results) => {
                if (err) {
                    console.error('Error fetching token:', err);
                    return socket.emit('error', 'Authentication failed');
                }
                
                if (results.length > 0) {
                    const validToken = results[0];
                    socket.userId = validToken.u;

                    // Check for active connection in Redis
                    this.redis.get(`user:${socket.userId}`, (err, cachedConnectionId) => {
                        if (err) {
                            console.error('Error fetching from Redis:', err);
                            return socket.emit('error', 'Authentication failed');
                        }

                        if (cachedConnectionId) {
                            socket.connectionId = parseInt(cachedConnectionId);
                            console.log(`Reconnected to existing session: ${socket.connectionId}`);
                        }

                        socket.emit('authenticated', { message: 'Reconnected' });
                    });
                } else {
                    socket.emit('error', 'Authentication failed');
                }
            });
        });

        socket.on('start_connection', (data) => {
            if (!socket.userId) return socket.emit('error', 'User not authenticated');

            // Check if the user already has an active session
            this.db.query(`SELECT * FROM ${this.tables.connectionData} WHERE u = ? AND a = TRUE`, [socket.userId], (err, results) => {
                if (err) {
                    console.error('Error checking existing connection:', err);
                    return socket.emit('error', 'Error checking connection');
                }

                if (results.length > 0) {
                    socket.connectionId = results[0].id;
                    console.log(`Resumed previous connection: ${socket.connectionId}`);
                } else {
                    this.db.query(`INSERT INTO ${this.tables.connectionData} (dt, u) VALUES (?, ?)`, [data.deviceType, socket.userId], (insertErr, insertResults) => {
                        if (insertErr) {
                            console.error('Error starting new connection:', insertErr);
                            return socket.emit('error', 'Error starting connection');
                        }

                        socket.connectionId = insertResults.insertId;
                        console.log('New connection started:', insertResults.insertId);
                    });
                }

                // Cache the connection ID in Redis
                this.redis.set(`user:${socket.userId}`, socket.connectionId);
            });
        });

        socket.on('device_stream', (data) => {
            if (socket.connectionId) {
                // console.log('Data received:', data);
                if (data?.offline_data?.length) {
                    const promises = data.offline_data.map(offlineData => {
                        return new Promise((resolve, reject) => {
                            this.db.query(`INSERT INTO ${this.tables.deviceData} (cd, r, t) VALUES (?, ?, ?)`, [socket.connectionId, offlineData.value, offlineData.time], (err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                        });
                    });
                    
                    Promise.all(promises)
                        .then(() => {
                            console.log('Offline data processed');
                        })
                        .catch(err => {
                            console.error('Error processing offline data:', err);
                        });
                }

                this.db.query(`INSERT INTO ${this.tables.deviceData} (cd, r) VALUES (?, ?)`, [socket.connectionId, data.value], (err) => {
                    if (err) {
                        console.error('Error inserting device data:', err);
                    }
                });
            } else {
                socket.emit('error', 'No active connection');
            }
        });

        socket.on('s2c_stream', (data) => {
            if (!socket.connectionId) return socket.emit('error', 'No active connection');
            if (!this.s2c_stream_types.includes(data.stream_type)) return socket.emit('error', 'Invalid stream type');

            const streamKey = `stream:${socket.connectionId}:${data.stream_type}`;
            
            this.redis.get(streamKey, (err, existingStream) => {
                if (existingStream) return;

                const interval = setInterval(() => {
                    this.getHealthInsights(socket.connectionId, (err, insights) => {
                        if (err) {
                            console.error(`Error fetching ${data.stream_type}:`, err);
                            return;
                        }
                        socket.emit('c2s_stream', { stream_type: data.stream_type, data: insights });
                    });
                }, 10 * 1000);

                this.redis.set(streamKey, interval);
            });
        });

        socket.on('s2c_close', (data) => {
            if (!socket.connectionId) return;

            const streamKey = `stream:${socket.connectionId}:${data.stream_type}`;

            this.redis.get(streamKey, (err, interval) => {
                if (interval) {
                    clearInterval(interval);
                    this.redis.del(streamKey, (delErr) => {
                        if (delErr) {
                            console.error(`Error deleting stream key: ${delErr}`);
                        } else {
                            console.log(`Stream closed: ${data.stream_type} for connection ${socket.connectionId}`);
                        }
                    });
                }
            });
        });

        socket.on('disconnect', () => {
            if (socket.connectionId) {
                this.redis.keys(`stream:${socket.connectionId}:*`, (err, keys) => {
                    keys.forEach(key => {
                        this.redis.del(key, (delErr) => {
                            if (delErr) {
                                console.error(`Error deleting stream key on disconnect: ${delErr}`);
                            } else {
                                console.log(`Stream key deleted: ${key}`);
                            }
                        });
                    });

                    this.db.query(`UPDATE ${this.tables.connectionData} SET et = NOW(), a = FALSE WHERE id = ?`, [socket.connectionId], (updateErr) => {
                        if (updateErr) {
                            console.error('Error updating connection data on disconnect:', updateErr);
                        }
                    });
                    this.redis.del(`user:${socket.userId}`);
                    console.log('Connection closed:', socket.connectionId);
                });
            }
            console.log('User disconnected');
        });


    }

    loadCachedIndex() {
        const server = this.app.get('server');
        fs.readFile(path.join(server.__root, 'public', 'health', 'index.html'), 'utf8', (err, data) => {
            if (!err) this.cachedIndex = data;
        });
    }
}

module.exports = HealthMonitoringAddon;