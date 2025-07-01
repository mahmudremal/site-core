const express = require('express');
const http = require('http');
const mysql = require('mysql2');
const AddonManager = require('./addonManager');
const path = require('path');

class Server {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.server.__root = __dirname;
        this.app.set('server', this.server);
        this.port = 3000;
        this.initDatabase()
        .then(conn => {
            conn.prefix = 'npm_';
            this.connection = conn;
            this.addonManager = new AddonManager(this.app, this.connection);
        })
        .then(res => {
            this.initMiddleware();
            this.initRoutes();
            this.loadAddons();
        })
        .catch(err => console.error("Failed ti start the application", err))
        .finally(() => console.log('Successfully started the application'));
        
    }

    initDatabase() {
        return new Promise((resolve, reject) => {
            const conn = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'root',
                database: 'local',
                port: 10005
            });

            conn.connect((err) => {
                if (err) {
                    console.error('Database connection failed: ', err);
                    reject('Database connection failed');
                    return;
                }
                resolve(conn);
            });
        })
    }

    initMiddleware() {
        this.app.use(express.json());
    }

    initRoutes() {
        const router = express.Router();
        router.use('/', (req, res, next) => {
            console.log('Base endpoint middleware');
            next();
        });
        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.use(express.static(path.join(__dirname, '..', 'dist')));
        router.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public/index.html'));
        });
        this.app.use(router);
    }

    loadAddons() {
        this.addonManager.loadAllAddons(this.connection);
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`Server is running on http://localhost:${this.port}`);
        });
    }
}

module.exports = Server;
