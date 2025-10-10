const { Server: WSServer } = require('socket.io');
const AddonManager = require('./addonManager');
const { ExpressPeerServer } = require('peer');
const { createServer } = require('https');
const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const boxen = require('boxen');
const cors = require('cors');
const path = require('path');
const pino = require('pino');
const net = require('net');
const fs = require('fs');
dotenv.config();

class Server {
    constructor() {
        this.dbConfig = {
            charset: 'utf8mb4',
            database: 'local',
            host: 'localhost',
            password: 'root',
            user: 'root',
            port: 10006
        };
        this.app = express();
        this.app.use(cors({ origin: '*' }));
        this.ssl = {
            key: fs.readFileSync(path.join(__dirname, '..', 'storage', 'certificates',  'key.pem')),
            cert: fs.readFileSync(path.join(__dirname, '..', 'storage', 'certificates',  'cert.pem')),
        };
        this.server = createServer(this.ssl, this.app);
        this.ws = new WSServer(this.server, {
            path: '/socket.io',
            cors: {origin: "*", methods: ["GET", "POST"]}
        });
        this.server.__root = __dirname;
        this.logger = pino({level: 'silent'});
        this.app.set('server', this.server);
        this.app.set('logger', this.logger);
        this.app.set('ssl', this.ssl);
        this.app.set('ws', this.ws);
        this.port = 3000;
        this.init();
    }

    async init() {
        await this.waitForServer(this.dbConfig.host, this.dbConfig.port);
        this.initDatabase()
        .then(conn => {
            conn.prefix = 'banglee_';
            this.connection = conn;
            this.addonManager = new AddonManager(this.app, this.connection);
        })
        .then(async res => {
            this.initMiddleware();
            this.preRoutes();
            await this.loadAddons();
            this.postRoutes();
        })
        .catch(err => this.logger.error({ err }, 'Failed to start the application'))
        .finally(() => {
            this.logger.info('Successfully started the application');
            console.log(boxen(
                `Banglee Server is running on\nhttps://localhost:${this.port}`,
                {
                    margin: 2,
                    padding: 1,
                    title: 'Server Started',
                    titleAlignment: 'center',
                    textAlignment: 'center',
                    borderColor: 'green',
                    borderStyle: 'round',
                    fullscreen: (width, height) => [width, height - 1]
                }
            ));
        });
    }

    initDatabase() {
        return new Promise(async (resolve, reject) => {
            const conn = mysql.createConnection(this.dbConfig);

            conn.connect((err) => {
                if (err) {
                    this.logger.error({ err }, 'Database connection failed!');
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
        this.router.get(/^\/(?!api|ws|peerjs|stream|socket\.io)(.*)/, (req, res) => {
            res.sendFile(path.resolve(this.server.__root, 'public/index.html'));
        });
        this.app.use(this.router);
        // this.printRoutes(this.router);
    }

    async loadAddons() {
        await this.addonManager.loadAllAddons(this.connection, this.router);
    }

    async waitForServer(host, port, retryInterval = 5000) {
        let running;let shownToStart;
        while (!running) {
            running = await this.checkServerRunning(host, port);
            if (running) {
                // console.log('Database server is running. Proceeding to connect...');
                break;
            } else {
                if (!shownToStart) {
                    shownToStart = true;
                    console.log(boxen(
                        'Start your database server please.\nWaiting...',
                        {
                            margin: 2,
                            padding: 1,
                            title: 'Action Requires',
                            titleAlignment: 'center',
                            textAlignment: 'center',
                            borderColor: 'yellow',
                            borderStyle: 'round',
                            fullscreen: (width, height) => [width, height - 1]
                        }
                    ));
                }
                await new Promise(res => setTimeout(res, retryInterval));
            }
        }
    }

    checkServerRunning(host, port, timeout = 2000) {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            let isAvailable = false;
            socket.setTimeout(timeout);
            socket.on('connect', () => {
                isAvailable = true;
                socket.destroy();
            });
            socket.on('timeout', () => {
                socket.destroy();
            });
            socket.on('error', () => {
                // error means port is not open
            });
            socket.on('close', () => {
                resolve(isAvailable);
            });
            socket.connect(port, host);
        });
    }

    start() {
        this.server.listen(this.port, () => {
            this.logger.info(`Server is running on https://localhost:${this.port}`);
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
