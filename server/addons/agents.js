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
            room_members: `${this.db.prefix}agents_room_members`,
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
                    _status ENUM('active', 'pending', 'denied', 'banned') DEFAULT 'active',
                    FOREIGN KEY (workspace_id) REFERENCES ${this.tables.workspaces}(id) ON DELETE CASCADE
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
            room_members: `
                CREATE TABLE IF NOT EXISTS ${this.tables.room_members} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    room_id INT NOT NULL,
                    user_id INT NOT NULL,
                    role ENUM('member', 'admin', 'moderator') DEFAULT 'member',
                    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    _status ENUM('active', 'pending', 'denied', 'banned') DEFAULT 'active',
                    FOREIGN KEY (room_id) REFERENCES ${this.tables.rooms}(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES ${this.tables.users}(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_room_user (room_id, user_id)
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
                    room_id INT,
                    content TEXT NOT NULL,
                    _type ENUM('msg', 'prompt', 'alert', 'tool', 'approval') DEFAULT 'msg',
                    FOREIGN KEY (agent_id) REFERENCES ${this.tables.users}(id) ON DELETE CASCADE,
                    FOREIGN KEY (room_id) REFERENCES ${this.tables.rooms}(id) ON DELETE SET NULL
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
        // Existing routes
        router.post('/agentik/workspaces', this.createOrUpdateWorkspace.bind(this));
        router.post('/agentik/rooms', this.createOrUpdateRoom.bind(this));
        router.post('/agentik/:room_id/users', this.createOrUpdateUser.bind(this));
        router.post('/agentik/assignments', this.createOrUpdateAssignment.bind(this));
        router.post('/agentik/communication', this.createOrUpdateCommunication.bind(this));
        router.post('/agentik/logs', this.createOrUpdateLog.bind(this)); 
      
        router.get('/agentik/workspaces', this.listWorkspaces.bind(this));
        router.get('/agentik/rooms', this.listRooms.bind(this));
        router.get('/agentik/rooms/:room_id', this.getRoom.bind(this));
        router.get('/agentik/:room_id/users', this.listUsers.bind(this));
        router.get('/agentik/assignments', this.listAssignments.bind(this));
        router.get('/agentik/communication', this.listCommunication.bind(this));
        router.get('/agentik/logs', this.listLogs.bind(this));

        // New room_members routes
        router.post('/agentik/room-members', this.addUserToRoom.bind(this));
        router.delete('/agentik/room-members/:roomId/:userId', this.removeUserFromRoom.bind(this));
        router.put('/agentik/room-members/:roomId/:userId', this.updateRoomMember.bind(this));
        router.get('/agentik/room-members', this.listRoomMembers.bind(this));
        router.get('/agentik/rooms/:roomId/members', this.getRoomMembers.bind(this));
        router.get('/agentik/users/:userId/rooms', this.getUserRooms.bind(this));
    }

    // Existing CRUD methods remain the same...
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
        const { room_id } = req.params;
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
    
    if (id <= 0) {
        // First, insert the new member
        this.db.query(`INSERT INTO ${this.tables.room_members} SET ?`, [{ 
            room_id: parseInt(room_id), 
            user_id: parseInt(results.insertId),  // Use the newly inserted user's ID
            role: agent_role, 
            _status: 'active' 
        }], (err, roomRelRes) => {
            if (err) {
                // If insertion fails, delete the user from the users table
                this.db.query(`DELETE FROM ${this.tables.users} WHERE id = ?`, [results.insertId], (deleteErr) => {
                    if (deleteErr) {
                        return res.status(500).json({ success: false, message: 'Failed to remove user due to error', error: deleteErr });
                    }
                    return res.status(500).json({ success: false, message: 'Failed to add user to room', error: err });
                });
            } else {
                // Response for successful insertion
                return res.status(201).json({ success: true, id: roomRelRes.insertId });
            }
        });
    } else {
        // If id is > 0, return the existing user ID
        res.status(200).json({ success: true, id: id });
    }
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
        const { id = 0, agent_id, room_id, content, _type } = req.body;
        const data = { agent_id, room_id, content, _type };

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

    // NEW: Room Members Management Methods
    addUserToRoom(req, res) {
        const { room_id, user_id, role = 'member', _status = 'active' } = req.body;

        if (!room_id || !user_id) {
            return res.status(400).json({ success: false, message: 'room_id and user_id are required' });
        }

        const data = { room_id, user_id, role, _status };
        const query = `INSERT INTO ${this.tables.room_members} SET ? ON DUPLICATE KEY UPDATE role = VALUES(role), _status = VALUES(_status)`;

        this.db.query(query, [data], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed to add user to room', error: err });
            res.status(201).json({ success: true, id: results.insertId });
        });
    }

    removeUserFromRoom(req, res) {
        const { roomId, userId } = req.params;

        if (!roomId || !userId) {
            return res.status(400).json({ success: false, message: 'roomId and userId are required' });
        }

        const query = `DELETE FROM ${this.tables.room_members} WHERE room_id = ? AND user_id = ?`;

        this.db.query(query, [roomId, userId], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed to remove user from room', error: err });
            if (results.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Room member not found' });
            }
            res.json({ success: true, message: 'User removed from room successfully' });
        });
    }

    updateRoomMember(req, res) {
        const { roomId, userId } = req.params;
        const { role, _status } = req.body;

        if (!roomId || !userId) {
            return res.status(400).json({ success: false, message: 'roomId and userId are required' });
        }

        const data = {};
        if (role) data.role = role;
        if (_status) data._status = _status;

        if (Object.keys(data).length === 0) {
            return res.status(400).json({ success: false, message: 'No update data provided' });
        }

        const query = `UPDATE ${this.tables.room_members} SET ? WHERE room_id = ? AND user_id = ?`;

        this.db.query(query, [data, roomId, userId], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed to update room member', error: err });
            if (results.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Room member not found' });
            }
            res.json({ success: true, message: 'Room member updated successfully' });
        });
    }

    listRoomMembers(req, res) {
        const { page = 1, room_id, user_id, role, _status } = req.query;
        const limit = 20;
        const offset = (page - 1) * limit;

        let query = `
            SELECT rm.*, u.full_name, u.nicename, u.agent_role, r.title as room_title 
            FROM ${this.tables.room_members} rm 
            JOIN ${this.tables.users} u ON rm.user_id = u.id 
            JOIN ${this.tables.rooms} r ON rm.room_id = r.id 
            WHERE 1
        `;
        const params = [];

        if (room_id) {
            query += ` AND rm.room_id = ?`;
            params.push(room_id);
        }

        if (user_id) {
            query += ` AND rm.user_id = ?`;
            params.push(user_id);
        }

        if (role) {
            query += ` AND rm.role = ?`;
            params.push(role);
        }

        if (_status) {
            query += ` AND rm._status = ?`;
            params.push(_status);
        }

        query += ` ORDER BY rm.joined_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        this.db.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            res.json({ success: true, data: results });
        });
    }

    getRoomMembers(req, res) {
        const { roomId } = req.params;
        const { _status = 'active' } = req.query;

        const query = `
            SELECT rm.*, u.full_name, u.nicename, u.agent_role 
            FROM ${this.tables.room_members} rm 
            JOIN ${this.tables.users} u ON rm.user_id = u.id 
            WHERE rm.room_id = ? AND rm._status = ?
            ORDER BY rm.joined_at ASC
        `;

        this.db.query(query, [roomId, _status], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            res.json({ success: true, data: results });
        });
    }

    getUserRooms(req, res) {
        const { userId } = req.params;
        const { _status = 'active' } = req.query;

        const query = `
            SELECT rm.*, r.title, r.workspace_id, w.title as workspace_title 
            FROM ${this.tables.room_members} rm 
            JOIN ${this.tables.rooms} r ON rm.room_id = r.id 
            JOIN ${this.tables.workspaces} w ON r.workspace_id = w.id 
            WHERE rm.user_id = ? AND rm._status = ? AND r._status = 'active'
            ORDER BY rm.joined_at DESC
        `;

        this.db.query(query, [userId, _status], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            res.json({ success: true, data: results });
        });
    }

    // Updated list methods to use room_members relationship
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
    getRoom(req, res) {
        const { room_id } = req.params;
        if (!room_id) {
            return res.status(400).json({ success: false, message: 'room_id is required' });
        }
        const query = `SELECT * FROM ${this.tables.rooms} WHERE id = ?`;
        this.db.query(query, [room_id], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            if (results.length === 0) {
                return res.status(404).json({ success: false, message: 'Room not found' });
            }
            res.json({ success: true, data: results[0] });
        });
    }

    listUsers(req, res) {
        const { room_id } = req.params;
        const { page = 1, search = '', _status = '' } = req.query;
        const limit = 20;
        const offset = (page - 1) * limit;

        let query = `SELECT DISTINCT u.* FROM ${this.tables.users} u WHERE 1`;
        const params = [];

        if (room_id) {
            query = `
                SELECT DISTINCT u.* 
                FROM ${this.tables.users} u 
                JOIN ${this.tables.room_members} rm ON u.id = rm.user_id 
                WHERE rm.room_id = ? AND rm._status = 'active'
            `;
            params.push(room_id);
        }

        if (search) {
            query += ` AND (u.full_name LIKE ? OR u.nicename LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (_status) {
            query += ` AND u._status = ?`;
            params.push(_status);
        }

        query += ` ORDER BY u.id DESC LIMIT ? OFFSET ?`;
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
        const { page = 1, search = '', agent_id, room_id, _type } = req.query;
        const limit = 20;
        const offset = (page - 1) * limit;

        let query = `
            SELECT c.*, u.full_name, u.nicename, r.title as room_title 
            FROM ${this.tables.communication} c 
            JOIN ${this.tables.users} u ON c.agent_id = u.id 
            LEFT JOIN ${this.tables.rooms} r ON c.room_id = r.id 
            WHERE 1
        `;
        const params = [];

        if (agent_id) {
            query += ` AND c.agent_id = ?`;
            params.push(agent_id);
        }

        if (room_id) {
            query += ` AND c.room_id = ?`;
            params.push(room_id);
        }

        if (_type) {
            query += ` AND c._type = ?`;
            params.push(_type);
        }

        if (search) {
            query += ` AND c.content LIKE ?`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY c._time DESC LIMIT ? OFFSET ?`;
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