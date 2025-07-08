const express = require('express');
const { CronJob } = require('cron');

class N8nAddon {
    constructor(app, dbConnection) {
        this.app = app;
        this.db = dbConnection;
        this.tables = {
            workflows: `${this.db.prefix}n8n_workflows`,
            triggers: `${this.db.prefix}n8n_triggers`,
            events: `${this.db.prefix}n8n_events`,
            tasks: `${this.db.prefix}n8n_tasks`,
        };
    }

    init() {
        this.createTables();
        this.startScheduledJobs();
    }

    createTables() {
        const tables = {
            workflows: `
                CREATE TABLE IF NOT EXISTS ${this.tables.workflows} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    active TINYINT(1) DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `,
            triggers: `
                CREATE TABLE IF NOT EXISTS ${this.tables.triggers} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    workflow_id INT NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    type VARCHAR(255) NOT NULL,
                    config JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `,
            events: `
                CREATE TABLE IF NOT EXISTS ${this.tables.events} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    workflow_id INT NOT NULL,
                    event_type VARCHAR(255) NOT NULL,
                    payload JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `,
            tasks: `
                CREATE TABLE IF NOT EXISTS ${this.tables.tasks} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    workflow_id INT NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    type VARCHAR(255) NOT NULL,
                    config JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `,
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
        router.post('/n8n/workflows', this.createOrUpdateWorkflow.bind(this));
        router.get('/n8n/workflows', this.listWorkflows.bind(this));
        router.get('/n8n/workflows/:id', this.getWorkflow.bind(this));
        router.delete('/n8n/workflows/:id', this.deleteWorkflow.bind(this));

        router.post('/n8n/triggers', this.createOrUpdateTrigger.bind(this));
        router.get('/n8n/triggers', this.listTriggers.bind(this));
        router.get('/n8n/triggers/:id', this.getTrigger.bind(this));
        router.delete('/n8n/triggers/:id', this.deleteTrigger.bind(this));

        router.post('/n8n/tasks', this.createOrUpdateTask.bind(this));
        router.get('/n8n/tasks', this.listTasks.bind(this));
        router.get('/n8n/tasks/:id', this.getTask.bind(this));
        router.delete('/n8n/tasks/:id', this.deleteTask.bind(this));

        router.post('/n8n/events', this.createOrUpdateEvent.bind(this));
        router.get('/n8n/events', this.listEvents.bind(this));
        router.get('/n8n/events/:id', this.getEvent.bind(this));
        router.delete('/n8n/events/:id', this.deleteEvent.bind(this));
    }

    createOrUpdateWorkflow(req, res) {
        const { id = 0, name, active } = req.body;
        const query = id > 0 
            ? `UPDATE ${this.tables.workflows} SET name = ?, active = ? WHERE id = ?` 
            : `INSERT INTO ${this.tables.workflows} (name, active) VALUES (?, ?)`;
        const params = id > 0 ? [name, active, id] : [name, active];
        this.db.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            res.status(id > 0 ? 200 : 201).json({ success: true, id: id > 0 ? id : results.insertId });
        });
    }

    listWorkflows(req, res) {
        const query = `
            SELECT 
                w.*,
                COUNT(DISTINCT t.id) AS trigger_count,
                COUNT(DISTINCT e.id) AS event_count,
                COUNT(DISTINCT ta.id) AS task_count
            FROM ${this.tables.workflows} w
            LEFT JOIN ${this.tables.triggers} t ON t.workflow_id = w.id
            LEFT JOIN ${this.tables.events} e ON e.workflow_id = w.id
            LEFT JOIN ${this.tables.tasks} ta ON ta.workflow_id = w.id
            WHERE 1
            GROUP BY w.id
        `;
        // const query = `SELECT * FROM ${this.tables.workflows}`;
        this.db.query(query, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed to retrieve', error: err });
            res.status(200).json({ success: true, workflows: results });
        });
    }

    getWorkflow(req, res) {
        const query = `SELECT * FROM ${this.tables.workflows} WHERE id = ?`;
        this.db.query(query, [req.params.id], (err, results) => {
            if (err || results.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
            res.status(200).json({ success: true, workflow: results[0] });
        });
    }

    deleteWorkflow(req, res) {
        const query = `DELETE FROM ${this.tables.workflows} WHERE id = ?`;
        this.db.query(query, [req.params.id], (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed to delete', error: err });
            res.status(200).json({ success: true, message: 'Deleted successfully' });
        });
    }

    createOrUpdateTrigger(req, res) {
        const { id = 0, workflow_id, name, type, config } = req.body;
        
        const query = id > 0 
            ? `UPDATE ${this.tables.triggers} SET workflow_id = ?, name = ?, type = ?, config = ? WHERE id = ?` 
            : `INSERT INTO ${this.tables.triggers} (workflow_id, name, type, config) VALUES (?, ?, ?, ?)`;
        const params = id > 0 ? [workflow_id, name, type, JSON.stringify(config), id] : [workflow_id, name, type, JSON.stringify(config)];
        this.db.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            res.status(id > 0 ? 200 : 201).json({ success: true, id: id > 0 ? id : results.insertId });
        });
    }

    listTriggers(req, res) {
        const query = `SELECT * FROM ${this.tables.triggers}`;
        this.db.query(query, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed to retrieve', error: err });
            res.status(200).json({ success: true, triggers: results });
        });
    }

    getTrigger(req, res) {
        const query = `SELECT * FROM ${this.tables.triggers} WHERE id = ?`;
        this.db.query(query, [req.params.id], (err, results) => {
            if (err || results.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
            res.status(200).json({ success: true, trigger: results[0] });
        });
    }

    deleteTrigger(req, res) {
        const query = `DELETE FROM ${this.tables.triggers} WHERE id = ?`;
        this.db.query(query, [req.params.id], (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed to delete', error: err });
            res.status(200).json({ success: true, message: 'Deleted successfully' });
        });
    }

    createOrUpdateTask(req, res) {
        const { id = 0, workflow_id, name, type, config } = req.body;
        
        const query = id > 0 
            ? `UPDATE ${this.tables.tasks} SET workflow_id = ?, name = ?, type = ?, config = ? WHERE id = ?` 
            : `INSERT INTO ${this.tables.tasks} (workflow_id, name, type, config) VALUES (?, ?, ?, ?)`;
        const params = id > 0 ? [workflow_id, name, type, JSON.stringify(config), id] : [workflow_id, name, type, JSON.stringify(config)];
        this.db.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            res.status(id > 0 ? 200 : 201).json({ success: true, id: id > 0 ? id : results.insertId });
        });
    }

    listTasks(req, res) {
        const query = `SELECT * FROM ${this.tables.tasks}`;
        this.db.query(query, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed to retrieve', error: err });
            res.status(200).json({ success: true, tasks: results });
        });
    }

    getTask(req, res) {
        const query = `SELECT * FROM ${this.tables.tasks} WHERE id = ?`;
        this.db.query(query, [req.params.id], (err, results) => {
            if (err || results.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
            res.status(200).json({ success: true, task: results[0] });
        });
    }

    deleteTask(req, res) {
        const query = `DELETE FROM ${this.tables.tasks} WHERE id = ?`;
        this.db.query(query, [req.params.id], (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed to delete', error: err });
            res.status(200).json({ success: true, message: 'Deleted successfully' });
        });
    }

    createOrUpdateEvent(req, res) {
        const { id = 0, workflow_id, event_name = '', event_type, payload } = req.body;
        const query = id > 0 
            ? `UPDATE ${this.tables.events} SET workflow_id = ?, name = ?, event_type = ?, payload = ? WHERE id = ?` 
            : `INSERT INTO ${this.tables.events} (workflow_id, name, event_type, payload) VALUES (?, ?, ?, ?)`;
        const params = id > 0 ? [workflow_id, event_name, event_type, JSON.stringify(payload), id] : [workflow_id, event_name, event_type, JSON.stringify(payload)];
        this.db.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed', error: err });
            res.status(id > 0 ? 200 : 201).json({ success: true, id: id > 0 ? id : results.insertId });
        });
    }

    listEvents(req, res) {
        const query = `SELECT * FROM ${this.tables.events}`;
        this.db.query(query, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed to retrieve', error: err });
            res.status(200).json({ success: true, events: results });
        });
    }

    getEvent(req, res) {
        const query = `SELECT * FROM ${this.tables.events} WHERE id = ?`;
        this.db.query(query, [req.params.id], (err, results) => {
            if (err || results.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
            res.status(200).json({ success: true, event: results[0] });
        });
    }

    deleteEvent(req, res) {
        const query = `DELETE FROM ${this.tables.events} WHERE id = ?`;
        this.db.query(query, [req.params.id], (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed to delete', error: err });
            res.status(200).json({ success: true, message: 'Deleted successfully' });
        });
    }

    startScheduledJobs() {
        const query = `SELECT * FROM ${this.tables.triggers} WHERE type = 'cron'`;
        this.db.query(query, (err, triggers) => {
            if (err) return console.error('Failed to fetch triggers:', err);
            triggers.forEach(trigger => {
                const { config } = trigger;
                const job = new CronJob(config.schedule, () => {
                    const event = {
                        workflow_id: trigger.workflow_id,
                        event_type: trigger.type,
                        payload: config.payload || {},
                    };
                    this.createOrUpdateEventWorkflow(event);
                });
                job.start();
            });
        });
    }

    createOrUpdateEventWorkflow(event) {
        const { workflow_id, event_type, payload } = event;
        const query = `INSERT INTO ${this.tables.events} (workflow_id, event_type, payload) VALUES (?, ?, ?)`;
        this.db.query(query, [workflow_id, event_type, JSON.stringify(payload)], (err) => {
            if (err) console.error('Failed to trigger event:', err);
        });
    }
}

module.exports = N8nAddon;