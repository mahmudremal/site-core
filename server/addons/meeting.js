const express = require('express');
const { ExpressPeerServer } = require('peer');
const path = require('path');

class MeetingAddon {
    constructor(app, dbConnection) {
        this.app = app;
        this.db = dbConnection;
        this.tables = {
            users: `${this.db.prefix}_meeting_users`,
            meetings: `${this.db.prefix}_meeting_meetings`,
        };
        this.peerServer = null;
    }

    init() {
        this.createTables();
    }

    createTables() {
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS ${this.tables.users} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                peer_id VARCHAR(255) NOT NULL,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        this.db.query(createUsersTable, (err) => {
            if (err) {
                console.error('Error creating users table: ', err);
            } else {
                console.log('Users table created or exists already.');
            }
        });

        const createMeetingsTable = `
            CREATE TABLE IF NOT EXISTS ${this.tables.meetings} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                meeting_id VARCHAR(255) NOT NULL,
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                duration INT DEFAULT 0
            )
        `;

        this.db.query(createMeetingsTable, (err) => {
            if (err) {
                console.error('Error creating meetings table: ', err);
            } else {
                console.log('Meetings table created or exists already.');
            }
        });
    }

    register() {
        const server = this.app.get('server');
        this.peerServer = ExpressPeerServer(server, {
            debug: true,
            path: '/',
        });

        const router = express.Router();
        router.use('/meeting', (req, res, next) => {
            console.log('Meeting endpoint middleware');
            next();
        });
        router.get('/meeting', (req, res) => {
            res.sendFile(path.join(server.__root, 'public/meeting/index.html'));
        });
        router.get('/styling.css', (req, res) => {
            res.sendFile(path.join(server.__root, '..', '/styling.css'));
        });
        this.app.use(router);

        this.app.use('/peerjs', this.peerServer);

        this.peerServer.on('connection', async (client) => {
            console.log(`Peer connected: ${client.id}`);
            await this.addUser(client.id);
        });

        this.peerServer.on('disconnect', (client) => {
            console.log(`Peer disconnected: ${client.id}`);
        });

        this.peerServer.on('error', (err, client) => {
            console.error(`Peer server error from client ${client?.id}:`, err);
        });
    }

    async addUser(peerId) {
        const query = `INSERT INTO ${this.tables.users} (peer_id) VALUES (?)`;
        this.db.query(query, [peerId], (err, results) => {
            if (err) {
                console.error('Error inserting user into DB:', err);
            } else {
                console.log(`User with peer_id ${peerId} added to database.`);
            }
        });
    }
}

module.exports = MeetingAddon;