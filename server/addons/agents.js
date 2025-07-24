const express = require('express');
const OpenAI = require('openai');

class Agents {
    constructor(app, dbConnection) {
        this.app = app;
        this.db = dbConnection;
        this.tables = {
            workspaces: `${this.db.prefix}agents_workspaces`,
            users: `${this.db.prefix}agents_users`,
            rooms: `${this.db.prefix}agents_rooms`,
            assignments: `${this.db.prefix}agents_assignments`,
            communication: `${this.db.prefix}agents_communication`,
            logs: `${this.db.prefix}agents_logs`,
        };
    }

    init() {
        this.openai = new OpenAI({
            baseURL: 'http://localhost:11434/api',
            apiKey: process.env?.OPENAI_API_KEY??'asdadsad'
        });
    }

    get_tables_schemas() {
        return {
            workspaces: `
                CREATE TABLE IF NOT EXISTS ${this.tables.workspaces} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    _status ENUM('active', 'pending', 'denied', 'banned') DEFAULT 'active'
                )
            `,
            rooms: `
                CREATE TABLE IF NOT EXISTS ${this.tables.rooms} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    workspace_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    _status ENUM('active', 'pending', 'denied', 'banned') DEFAULT 'active'
                )
            `,
            users: `
                CREATE TABLE IF NOT EXISTS ${this.tables.users} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    full_name VARCHAR(255) NOT NULL,
                    nicename VARCHAR(255) NOT NULL,
                    agent_role VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    _status ENUM('active', 'pending', 'denied', 'banned') DEFAULT 'active'
                )
            `,
            assignments: `
                CREATE TABLE IF NOT EXISTS ${this.tables.assignments} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    assignment_type VARCHAR(255) NOT NULL,
                    tokens_cost INT NOT NULL,
                    budgets FLOAT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `,
            communication: `
                CREATE TABLE IF NOT EXISTS ${this.tables.communication} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    _time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    agent_id INT NOT NULL,
                    content TEXT NOT NULL,
                    _type ENUM('msg', 'prompt', 'alert', 'tool', 'approval') DEFAULT 'msg'
                )
            `,
            logs: `
                CREATE TABLE IF NOT EXISTS ${this.tables.logs} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    content TEXT NOT NULL
                )
            `,
        };
    }

    register(router) {
        router.post('/agentik/workspaces', this.createOrUpdateWorkspace.bind(this));
        router.post('/agentik/rooms', this.createOrUpdateRoom.bind(this));
        router.post('/agentik/users', this.createOrUpdateUser.bind(this));
        router.post('/agentik/assignments', this.createOrUpdateAssignment.bind(this));
        router.post('/agentik/communication', this.createOrUpdateCommunication.bind(this));
        router.post('/agentik/logs', this.createOrUpdateLog.bind(this)); 
      
        router.get('/agentik/workspaces', this.listWorkspaces.bind(this));
        router.get('/agentik/rooms', this.listRooms.bind(this));
        router.get('/agentik/users', this.listUsers.bind(this));
        router.get('/agentik/assignments', this.listAssignments.bind(this));
        router.get('/agentik/communication', this.listCommunication.bind(this));
        router.get('/agentik/logs', this.listLogs.bind(this));
    }

    createOrUpdateWorkspace(req, res) {
        const { id = 0, title, _status } = req.body;
        const data = { title, _status };

        let query, params;
        if (id > 0) {
            query = `UPDATE ${this.tables.workspaces} SET ? WHERE id = ?`;
            params = [data, id];
        } else {
            query = `INSERT INTO ${this.tables.workspaces} SET ?`;
            params = [data];
        }

        this.db.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            res.status(id > 0 ? 200 : 201).json({ success: true, id: id > 0 ? id : results.insertId });
        });
    }

    createOrUpdateRoom(req, res) {
        const { id = 0, title, workspace_id, _status } = req.body;
        const data = { title, workspace_id, _status };

        let query, params;
        if (id > 0) {
            query = `UPDATE ${this.tables.rooms} SET ? WHERE id = ?`;
            params = [data, id];
        } else {
            query = `INSERT INTO ${this.tables.rooms} SET ?`;
            params = [data];
        }

        this.db.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            res.status(id > 0 ? 200 : 201).json({ success: true, id: id > 0 ? id : results.insertId });
        });
    }

    createOrUpdateUser(req, res) {
        const { id = 0, full_name, nicename, agent_role, _status } = req.body;
        const data = { full_name, nicename, agent_role, _status };

        let query, params;
        if (id > 0) {
            query = `UPDATE ${this.tables.users} SET ? WHERE id = ?`;
            params = [data, id];
        } else {
            query = `INSERT INTO ${this.tables.users} SET ?`;
            params = [data];
        }

        this.db.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            res.status(id > 0 ? 200 : 201).json({ success: true, id: id > 0 ? id : results.insertId });
        });
    }

    createOrUpdateAssignment(req, res) {
        const { id = 0, assignment_type, tokens_cost, budgets } = req.body;
        const data = { assignment_type, tokens_cost, budgets };

        let query, params;
        if (id > 0) {
            query = `UPDATE ${this.tables.assignments} SET ? WHERE id = ?`;
            params = [data, id];
        } else {
            query = `INSERT INTO ${this.tables.assignments} SET ?`;
            params = [data];
        }

        this.db.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            res.status(id > 0 ? 200 : 201).json({ success: true, id: id > 0 ? id : results.insertId });
        });
    }

    createOrUpdateCommunication(req, res) {
        const { id = 0, agent_id, content, _type } = req.body;
        const data = { agent_id, content, _type };

        let query, params;
        if (id > 0) {
            query = `UPDATE ${this.tables.communication} SET ? WHERE id = ?`;
            params = [data, id];
        } else {
            query = `INSERT INTO ${this.tables.communication} SET ?`;
            params = [data];
        }

        this.db.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            res.status(id > 0 ? 200 : 201).json({ success: true, id: id > 0 ? id : results.insertId });
        });
    }

    createOrUpdateLog(req, res) {
        const { id = 0, content } = req.body;
        const data = { content };

        let query, params;
        if (id > 0) {
            query = `UPDATE ${this.tables.logs} SET ? WHERE id = ?`;
            params = [data, id];
        } else {
            query = `INSERT INTO ${this.tables.logs} SET ?`;
            params = [data];
        }
        this.db.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            res.status(id > 0 ? 200 : 201).json({ success: true, id: id > 0 ? id : results.insertId });
        });
    }


    // List
    listWorkspaces(req, res) {
        const { page = 1, search = '', _status = '', id = null } = req.query;
        const limit = 20;
        const offset = (page - 1) * limit;

        let query = `SELECT * FROM ${this.tables.workspaces} WHERE 1`;
        const params = [];

        if (id) {
            query += ` AND id = ?`;
            params.push(id);
        }
        
        if (search) {
            query += ` AND title LIKE ?`;
            params.push(`%${search}%`);
        }

        if (_status) {
            query += ` AND _status = ?`;
            params.push(_status);
        }

        query += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        this.db.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            res.json({ success: true, data: results });
        });
    }

    listRooms(req, res) {
        const { page = 1, search = '', _status = '', workspace_id = null } = req.query;
        const limit = 20;
        const offset = (page - 1) * limit;

        let query = `SELECT * FROM ${this.tables.rooms} WHERE 1`;
        const params = [];

        if (workspace_id) {
            query += ` AND workspace_id = ?`;
            params.push(workspace_id);
        }

        if (search) {
            query += ` AND title LIKE ?`;
            params.push(`%${search}%`);
        }

        if (_status) {
            query += ` AND _status = ?`;
            params.push(_status);
        }

        query += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        this.db.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            res.json({ success: true, data: results });
        });
    }

    listUsers(req, res) {
        const { page = 1, search = '', _status = '', room_id } = req.query;
        const limit = 20;
        const offset = (page - 1) * limit;

        let query = `SELECT * FROM ${this.tables.users} WHERE 1`;
        const params = [];

        if (room_id) {
            query += ` AND id IN (SELECT agent_id FROM ${this.tables.communication} WHERE id IN (SELECT id FROM ${this.tables.communication} WHERE agent_id IN (SELECT id FROM ${this.tables.users})) AND room_id = ?)`;
            params.push(room_id);
        }

        if (search) {
            query += ` AND (full_name LIKE ? OR nicename LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (_status) {
            query += ` AND _status = ?`;
            params.push(_status);
        }

        query += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        this.db.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            res.json({ success: true, data: results });
        });
    }

    listAssignments(req, res) {
        const { page = 1, search = '' } = req.query;
        const limit = 20;
        const offset = (page - 1) * limit;

        let query = `SELECT * FROM ${this.tables.assignments} WHERE 1`;
        const params = [];

        if (search) {
            query += ` AND assignment_type LIKE ?`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        this.db.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            res.json({ success: true, data: results });
        });
    }

    listCommunication(req, res) {
        const { page = 1, search = '', _status = '', agent_id, room_id, _type } = req.query;
        const limit = 20;
        const offset = (page - 1) * limit;

        let query = `SELECT * FROM ${this.tables.communication} WHERE 1`;
        const params = [];

        if (agent_id) {
            query += ` AND agent_id = ?`;
            params.push(agent_id);
        }

        if (room_id) {
            query += ` AND agent_id IN (SELECT id FROM ${this.tables.users} WHERE id IN (SELECT agent_id FROM ${this.tables.communication}) AND room_id = ?)`;
            params.push(room_id);
        }

        if (_type) {
            query += ` AND _type = ?`;
            params.push(_type);
        }

        if (search) {
            query += ` AND content LIKE ?`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        this.db.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            res.json({ success: true, data: results });
        });
    }

    listLogs(req, res) {
        const { page = 1, search = '' } = req.query;
        const limit = 50;
        const offset = (page - 1) * limit;

        let query = `SELECT * FROM ${this.tables.logs} WHERE 1`;
        const params = [];

        if (search) {
            query += ` AND content LIKE ?`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        this.db.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            res.json({ success: true, data: results });
        });
    }

  
}

module.exports = Agents;