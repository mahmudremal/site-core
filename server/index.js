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
        .then(async res => {
            this.initMiddleware();
            this.preRoutes();
            await this.loadAddons();
            this.postRoutes();
        })
        .catch(err => console.error("Failed to start the application", err))
        .finally(() => console.log('Successfully started the application'));
        
    }

    initDatabase() {
        return new Promise((resolve, reject) => {
            const conn = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'root',
                database: 'local',
                charset: 'utf8mb4',
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

    preRoutes() {
        this.router = express.Router();
        // this.router.use('/', (req, res, next) => {
        //     console.log('Base endpoint middleware');
        //     next();
        // });
        this.app.use(express.static(path.join(this.server.__root, 'public')));
        this.app.use(express.static(path.join(this.server.__root, '..', 'dist')));
        this.router.get('/styling.css', (req, res) => {
            res.sendFile(path.join(this.server.__root, '..', '/styling.css'));
        });

    }

    postRoutes() {
        this.router.get(/^\/(?!api|ws|peerjs|stream)(.*)/, (req, res) => {
            res.sendFile(path.resolve(this.server.__root, 'public/index.html'));
        });
        this.app.use(this.router);
        // this.printRoutes(this.router);
    }

    async loadAddons() {
        await this.addonManager.loadAllAddons(this.connection, this.router);
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`Server is running on http://localhost:${this.port}`);
        });
    }

    printRoutes(router) {
        router.stack.forEach((middleware) => {
            if (middleware.route) {
                const methods = Object.keys(middleware.route.methods).join(', ');
                console.log(`Path: ${middleware.route.path} | Methods: ${methods}`);
            } else if (middleware.handle && middleware.handle.stack) {
                middleware.handle.stack.forEach((subMiddleware) => {
                    const methods = Object.keys(subMiddleware.route.methods).join(', ');
                    console.log(`Path: ${middleware.route.path}${subMiddleware.route.path} | Methods: ${methods}`);
                });
            }
        });
    }
}

module.exports = Server;
