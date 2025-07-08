const express = require('express');
const { ExpressPeerServer } = require('peer');
const path = require('path');

class MeetsAddon {
    constructor(app, dbConnection) {
        this.app = app;
        this.db = dbConnection;
        this.tables = {
            rooms: `${this.db.prefix}meets_rooms`,
            members: `${this.db.prefix}meets_members`,
            messages: `${this.db.prefix}meets_messages`
        };
        this.peerServer = null;
    }

    init() {
        this.createTables();
    }

    createTables() {
        const tables = {
            rooms: `CREATE TABLE IF NOT EXISTS ${this.tables.rooms} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                room_id VARCHAR(255) NOT NULL,
                peer_id VARCHAR(255),
                name VARCHAR(255),
                type VARCHAR(50),
                config TEXT,
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            members: `CREATE TABLE IF NOT EXISTS ${this.tables.members} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                room_id VARCHAR(255) NOT NULL,
                peer_id VARCHAR(255) NOT NULL,
                _role VARCHAR(255) DEFAULT 'member',
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            messages: `CREATE TABLE IF NOT EXISTS ${this.tables.messages} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                room_id VARCHAR(255) NOT NULL,
                member_id VARCHAR(255) NOT NULL,
                _time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                _type VARCHAR(255) NOT NULL,
                content TEXT NOT NULL
            )`
        };
        Object.keys(tables).forEach(table => {
            this.db.query(tables[table], (err) => {
                if (err) {
                    console.error(`Error creating ${table} table: `, err);
                } else {
                    console.log(`${table} table created or exists already.`);
                }
            });
        })
    }

    register(router) {
        // PeerJS setup
        const server = this.app.get('server');
        this.peerServer = ExpressPeerServer(server, {
            debug: true,
            path: '/',
        });

        // Example middleware
        router.use('/meets', (req, res, next) => {
            console.log('Meets endpoint middleware');
            next();
        });

        // Attach PeerJS server to /peerjs
        this.app.use('/peerjs', this.peerServer);

        // Peer events
        this.peerServer.on('connection', async (client) => {
            console.log(`Peer connected: ${client.id}`);
            // You might want to pass room_id via query string or handshake for real use
            await this.add_member({room_id: 0, peer_id: client.id});
        });

        this.peerServer.on('disconnect', async (client) => {
            console.log(`Peer disconnected: ${client.id}`);
            await this.remove_member(client.id);
        });

        this.peerServer.on('error', (err, client) => {
            console.error(`Peer server error from client ${client?.id}:`, err);
        });

        // API endpoints
        router.get('/meets/rooms', this.list_rooms.bind(this));
        router.post('/meets/room', this.update_room.bind(this));
        router.get('/meets/room/:room_id/members', this.list_members.bind(this));

        router.get('/meets/room/:room_id/messages', this.list_messages.bind(this));
        router.post('/meets/message', this.update_message.bind(this));
    }

    // ==== ROOM CRUD ====
    async update_room(req, res) {
        const { id = 0, room_id, peer_id, name = '', type = '', config = '' } = req.body;
        if (!room_id) return res.status(400).json({ success: false, message: 'room_id required' });

        if (id > 0) {
            // Update
            const query = `UPDATE ${this.tables.rooms} SET room_id=?, peer_id=?, name=?, type=?, config=? WHERE id=?`;
            this.db.query(query, [room_id, peer_id, name, type, config, id], (err) => {
                if (err) return res.status(500).json({ success: false, message: 'Failed to update room', error: err });
                res.json({ success: true, updated: true, id });
            });
        } else {
            // Create
            const query = `INSERT INTO ${this.tables.rooms} (room_id, peer_id, name, type, config) VALUES (?, ?, ?, ?, ?)`;
            this.db.query(query, [room_id, peer_id, name, type, config], (err, results) => {
                if (err) return res.status(500).json({ success: false, message: 'Failed to create room', error: err });
                res.status(201).json({ success: true, id: results.insertId });
            });
        }
    }

    async list_rooms(req, res) {
        this.db.query(`SELECT * FROM ${this.tables.rooms} ORDER BY started_at DESC`, (err, rows) => {
            if (err) return res.status(500).json({ success: false, error: err });
            res.json({ success: true, rooms: rows });
        });
    }

    // ==== MEMBER CRUD ====
    async add_member({room_id = 0, peer_id, _role = 'member'}) {
        if (!peer_id) return;
        const query = `INSERT INTO ${this.tables.members} (room_id, peer_id, _role) VALUES (?, ?, ?)`;
        this.db.query(query, [room_id, peer_id, _role], (err) => {
            if (err) {
                console.error('Error inserting member into DB:', err);
            } else {
                console.log(`Member ${peer_id} added to room ${room_id}.`);
            }
        });
    }

    async remove_member(peer_id) {
        if (!peer_id) return;
        const query = `DELETE FROM ${this.tables.members} WHERE peer_id = ?`;
        this.db.query(query, [peer_id], (err) => {
            if (err) console.error('Error removing member:', err);
            else console.log(`Member ${peer_id} removed from members table.`);
        });
    }

    async list_members(req, res) {
        const { room_id } = req.params;
        if (!room_id) return res.status(400).json({ success: false, message: 'room_id required' });
        this.db.query(`SELECT * FROM ${this.tables.members} WHERE room_id = ?`, [room_id], (err, rows) => {
            if (err) return res.status(500).json({ success: false, error: err });
            res.json({ success: true, members: rows });
        });
    }

    // ==== MESSAGE CRUD ====
    async update_message(req, res) {
        const { id = 0, room_id, member_id, _type, content } = req.body;
        if (!room_id || !member_id || !_type || !content)
            return res.status(400).json({ success: false, message: 'Missing required fields' });

        if (id > 0) {
            // Update
            const query = `UPDATE ${this.tables.messages} SET room_id=?, member_id=?, _type=?, content=? WHERE id=?`;
            this.db.query(query, [room_id, member_id, _type, content, id], (err) => {
                if (err) return res.status(500).json({ success: false, message: 'Failed to update message', error: err });
                res.json({ success: true, updated: true, id });
            });
        } else {
            // Create
            const query = `INSERT INTO ${this.tables.messages} (room_id, member_id, _type, content) VALUES (?, ?, ?, ?)`;
            this.db.query(query, [room_id, member_id, _type, content], (err, results) => {
                if (err) return res.status(500).json({ success: false, message: 'Failed to create message', error: err });
                res.status(201).json({ success: true, id: results.insertId });
            });
        }
    }

    async list_messages(req, res) {
        const { room_id } = req.params;
        if (!room_id) return res.status(400).json({ success: false, message: 'room_id required' });
        this.db.query(`SELECT * FROM ${this.tables.messages} WHERE room_id = ? ORDER BY _time ASC`, [room_id], (err, rows) => {
            if (err) return res.status(500).json({ success: false, error: err });
            res.json({ success: true, messages: rows });
        });
    }
}

module.exports = MeetsAddon;