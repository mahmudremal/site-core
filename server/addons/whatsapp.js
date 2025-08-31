const AppServer = require('../resources/whastapp');
const pino = require('pino');
const path = require('path');


class WhatsappAddon extends AppServer {
    constructor(app, dbConnection) {
        super();
        this.app = app;
        this.sock = null;
        this.db = dbConnection;
        const server = this.app.get('server');
        this.io = this.app.get('ws').of('/wa');
        this.logger = pino({ level: 'silent' });
        this.storage = path.join(server.__root, '..', 'storage');
        this.tables = {};this.tableSchemas = {};
    }

    get_tables_schemas() {
        return this.tableSchemas;
    }

    async init() {
        super.init();
        if (this.isConnecting || this.sock) return;
        this.isConnecting = true;
        // console.log('Connecting to WhatsApp...');
        // 
    }

    register(router) {
        this.connect();
        // this.configureExpress();
        this.configureSocket();
    }

}

module.exports = WhatsappAddon;
