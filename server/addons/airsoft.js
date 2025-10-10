const fs = require('fs');
const path = require("path");
const { ExpressPeerServer } = require("peer");
const multer = require('multer');
const upload = multer();

class Airsoft {
    constructor(app, dbConnection) {
        this.app = app;
        this.db = dbConnection;
        this.tables = {
            users: `${this.db.prefix}airsoft_users`,
        };
        this.personsfaces = new Set();
        this.broadcasters = new Set();
        this.receivers = new Set();
    }

    init() {
    }

    register(router) {
        const ssl = this.app.get('ssl');
        const server = this.app.get('server');
        this.peerServer = ExpressPeerServer(server, {ssl});
        this.app.use('/airsoft', this.peerServer);
        router.use('/airsoft', (req, res, next) => {
            console.log('Airsoft endpoint middleware');
            next();
        });

        // this.app.get('/airsoft', (req, res) => {
        //     res.json({
        //         message: 'PeerJS Signaling Server',
        //         broadcasters: Array.from(this.broadcasters),
        //         receivers: Array.from(this.receivers)
        //     });
        // });

        this.app.post('/airsoft/register/broadcaster', (req, res) => {
            const { peerId } = req.body;
            this.broadcasters.add(peerId);
            // console.log(`Broadcaster registered: ${peerId}`);
            res.json({ success: true, peerId, message: 'Broadcaster registered' });
        });

        this.app.post('/airsoft/register/receiver', (req, res) => {
            const { peerId } = req.body;
            this.receivers.add(peerId);
            // console.log(`Receiver registered: ${peerId}`);
            res.json({ success: true, peerId, broadcasters: Array.from(this.broadcasters) });
        });

        this.app.get('/airsoft/broadcasters', (req, res) => {
            res.json({ broadcasters: Array.from(this.broadcasters) });
        });

        this.app.post('/airsoft/unregister', (req, res) => {
            const { peerId } = req.body;
            this.broadcasters.delete(peerId);
            this.receivers.delete(peerId);
            // console.log(`Peer unregistered: ${peerId}`);
            res.json({ success: true });
        });

        this.app.post('/airsoft/update/face', upload.single('embeddings'), (req, res) => {
            try {
                const { id, name } = req.body;
                const embeddingsBuffer = req.file.buffer;
                const embeddings = JSON.parse(embeddingsBuffer.toString());
                const target_path = path.join(server.__root, '..', 'storage', 'facedata', `${id}-${name}.json`);
                fs.writeFileSync(target_path, JSON.stringify({ id, name, embeddings }, null, 2));
                this.personsfaces.add({ id, name, embeddings });
                res.json({ success: true });
            } catch (error) {
                console.error('Error saving face data:', error);
                res.status(500).json({ success: false, error: 'Failed to save face data' });
            }
        });
        this.app.get('/airsoft/list/face', (req, res) => {
            this.loadPersonsFaces()
            .then(persons => res.status(200).json({persons}))
            .catch(err => res.status(500).json({ success: false, error: 'Failed to get face data', errorMessage: err?.message }))
        });


        this.peerServer.on('connection', (client) => {
            // console.log(`Peer connected: ${client.getId()}`);
        });

        this.peerServer.on('disconnect', (client) => {
            const peerId = client.getId();
            // console.log(`Peer disconnected: ${peerId}`);
            this.broadcasters.delete(peerId);
            this.receivers.delete(peerId);
        });
        
    }

    get_tables_schemas() {
        return {
            users: `CREATE TABLE IF NOT EXISTS ${this.tables.users} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fn VARCHAR(50) NOT NULL,
                ln VARCHAR(50) NOT NULL,
                e VARCHAR(255) NOT NULL UNIQUE,
                p VARCHAR(255) NOT NULL,
                r TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
        }
    }

    loadPersonsFaces() {
        const server = this.app.get('server');
        return new Promise((resolve, reject) => {
            try {
                const dir = path.join(server.__root, '..', 'storage', 'facedata');
                if (!fs.existsSync(dir)) return;
                const personsfaces = new Set();

                const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
                for (const file of files) {
                    const content = fs.readFileSync(path.join(dir, file), 'utf8');
                    const data = JSON.parse(content);
                    personsfaces.add(data);
                }

                resolve(Array.from(personsfaces));

                // console.log(`Loaded ${personsfaces.size} face data entries.`);
            } catch (error) {
                reject('Error loading face data.');
            }
        })
    };


}

module.exports = Airsoft;