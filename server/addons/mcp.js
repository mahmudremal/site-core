const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const path = require('path');
const fs = require('fs');
const { z } = require('zod');
const { sprintf } = require('sprintf-js');

class McpAddon {
    constructor(app, dbConnection) {
        this.app = app;
        this.db = dbConnection;
        const server = app.get('server');
        this.tables = {
            events: `${this.db.prefix}mcp_events`,
            addons: `${this.db.prefix}mcp_addons`,
            elements: `${this.db.prefix}mcp_elements`
        };
        this.mcpsPath = path.join(server.__root, 'resources',  'mcp-addons');
        this.loadedAddons = new Map();
        this.registeredElements = new Map();
    }

    async init() {
        this.server = new McpServer(
            {
                name: 'banglee-mcp',
                version: '1.0.0',
                description: 'Banglee MCP Server'
            },
            {
                capabilities: {
                    tools: {},
                    resources: {},
                    prompts: {},
                    sampling: {},
                    roots: {
                        listChanged: true,
                    },
                }
            }
        );
        // await this.loadMcpAddons();
        return true;
    }

    get_tables_schemas() {
        return {
            events: `CREATE TABLE IF NOT EXISTS ${this.tables.events} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                event_type VARCHAR(50) NOT NULL,
                element_name VARCHAR(100),
                element_type ENUM('tool', 'resource', 'prompt') DEFAULT NULL,
                request_data LONGTEXT,
                response_data LONGTEXT,
                status VARCHAR(20) DEFAULT 'success',
                error_message TEXT DEFAULT NULL,
                execution_time_ms INT DEFAULT 0,
                addon_name VARCHAR(100) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            addons: `CREATE TABLE IF NOT EXISTS ${this.tables.addons} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                enabled BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`,
            
            elements: `CREATE TABLE IF NOT EXISTS ${this.tables.elements} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                addon_name VARCHAR(100) NOT NULL,
                element_name VARCHAR(100) NOT NULL,
                element_type ENUM('tool', 'resource', 'prompt') NOT NULL,
                enabled BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_element (addon_name, element_name, element_type)
            )`
        };
    }

    async loadMcpAddons() {
        if (!fs.existsSync(this.mcpsPath)) {
            fs.mkdirSync(this.mcpsPath, { recursive: true });
            return;
        }

        const addonFiles = fs.readdirSync(this.mcpsPath).filter(file => file.endsWith('.js'));

        for (const file of addonFiles) {
            try {
                const addonPath = path.join(this.mcpsPath, file);
                const AddonClass = require(addonPath);
                const addonName = file.replace('.js', '');

                const logEvent = (...args) => this.logEvent(...args, addonName);
                const addonInstance = new AddonClass(this.db, logEvent);
                
                await addonInstance.init();
                this.loadedAddons.set(addonName, addonInstance);
                
                await this.syncAddonToDatabase(addonName, addonInstance);
            } catch (error) {
                console.error(`Error loading addon ${file}:`, error.message);
            }
        }
    }

    async syncAddonToDatabase(addonName, addonInstance) {
        await this.insertOrUpdateAddon(addonName);
        
        const elements = [];
        
        if (addonInstance.getTools) {
            const tools = addonInstance.getTools();
            tools.forEach(tool => elements.push({ name: tool.name, type: 'tool' }));
        }
        
        if (addonInstance.getResources) {
            const resources = addonInstance.getResources();
            resources.forEach(resource => elements.push({ name: resource.uri, type: 'resource' }));
        }
        
        if (addonInstance.getPrompts) {
            const prompts = addonInstance.getPrompts();
            prompts.forEach(prompt => elements.push({ name: prompt.name, type: 'prompt' }));
        }
        
        for (const element of elements) {
            await this.insertOrUpdateElement(addonName, element.name, element.type);
        }
    }

    async insertOrUpdateAddon(addonName) {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO ${this.tables.addons} (name) VALUES (?) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`;
            this.db.query(query, [addonName], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    async insertOrUpdateElement(addonName, elementName, elementType) {
        elementName = elementName || 'n/a';
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO ${this.tables.elements} (addon_name, element_name, element_type) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`;
            this.db.query(query, [addonName, elementName, elementType], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    async isElementEnabled(addonName, elementName, elementType) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT a.enabled as addon_enabled, e.enabled as element_enabled 
                FROM ${this.tables.addons} a 
                LEFT JOIN ${this.tables.elements} e ON a.name = e.addon_name 
                WHERE a.name = ? AND e.element_name = ? AND e.element_type = ?
            `;
            this.db.query(query, [addonName, elementName, elementType], (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0 && results[0].addon_enabled && results[0].element_enabled);
            });
        });
    }

    async isAddonEnabled(addonName) {
        return new Promise((resolve, reject) => {
            const query = `SELECT enabled FROM ${this.tables.addons} WHERE name = ?`;
            this.db.query(query, [addonName], (err, results) => {
                if (err) reject(err);
                else resolve(results.length > 0 ? results[0].enabled : false);
            });
        });
    }

    async rebuildMcpRegistrations() {
        if (this.server) {
            try {
                await this.server.close();
                // console.log('Old MCP Server closed');
            } catch (error) {
                // console.error('Error closing old MCP server:', error);
            }
        }

        const newServer = new McpServer(
            {
                name: 'banglee-mcp',
                version: '1.0.0',
                description: 'Banglee MCP Server'
            },
            {
                capabilities: {
                    tools: {},
                    resources: {},
                    prompts: {},
                    sampling: {},
                    roots: {
                        listChanged: true,
                    },
                }
            }
        );

        // Re-register all enabled elements
        for (const [addonName, addonInstance] of this.loadedAddons) {
            const addonEnabled = await this.isAddonEnabled(addonName);
            if (!addonEnabled) continue;
            
            // Register tools
            if (addonInstance.getTools) {
                const tools = addonInstance.getTools();
                for (const tool of tools) {
                    const enabled = await this.isElementEnabled(addonName, tool.name, 'tool');
                    if (enabled) {
                        newServer.registerTool(
                            tool.name,
                            {...tool},
                            async (args) => {
                                const startTime = Date.now();
                                try {
                                    const result = await tool.handler(args);
                                    const executionTime = Date.now() - startTime;
                                    await this.logEvent('tool_call', tool.name, 'tool', args, result, 'success', null, executionTime, addonName);
                                    return {
                                        content: [{
                                            type: 'text',
                                            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                                        }]
                                    };
                                } catch (error) {
                                    const executionTime = Date.now() - startTime;
                                    await this.logEvent('tool_call', tool.name, 'tool', args, null, 'error', error.message, executionTime, addonName);
                                    throw error;
                                }
                            }
                        );
                    }
                }
            }
            
            // Register resources
            if (addonInstance.getResources) {
                const resources = addonInstance.getResources();
                for (const resource of resources) {
                    const enabled = await this.isElementEnabled(addonName, resource.uri, 'resource');
                    if (enabled) {
                        newServer.registerResource(
                            resource.uri,
                            {
                                name: resource.name,
                                description: resource.description,
                                mimeType: resource.mimeType
                            },
                            async () => {
                                const startTime = Date.now();
                                try {
                                    const result = await resource.handler();
                                    const executionTime = Date.now() - startTime;
                                    await this.logEvent('resource_read', resource.uri, 'resource', {}, result, 'success', null, executionTime, addonName);
                                    return result;
                                } catch (error) {
                                    const executionTime = Date.now() - startTime;
                                    await this.logEvent('resource_read', resource.uri, 'resource', {}, null, 'error', error.message, executionTime, addonName);
                                    throw error;
                                }
                            }
                        );
                    }
                }
            }
            
            // Register prompts
            if (addonInstance.getPrompts) {
                const prompts = addonInstance.getPrompts();
                for (const prompt of prompts) {
                    const enabled = await this.isElementEnabled(addonName, prompt.name, 'prompt');
                    if (enabled) {
                        newServer.registerPrompt(
                            prompt.name,
                            {
                                description: prompt.description,
                                arguments: prompt.arguments
                            },
                            async (args) => {
                                const startTime = Date.now();
                                try {
                                    const result = await prompt.handler(args);
                                    const executionTime = Date.now() - startTime;
                                    await this.logEvent('prompt_get', prompt.name, 'prompt', args, result, 'success', null, executionTime, addonName);
                                    return result;
                                } catch (error) {
                                    const executionTime = Date.now() - startTime;
                                    await this.logEvent('prompt_get', prompt.name, 'prompt', args, null, 'error', error.message, executionTime, addonName);
                                    throw error;
                                }
                            }
                        );
                    }
                }
            }
        }

        // Replace the old server with the new one
        this.server = newServer;
    }

    async register(router) {
        await this.registerMcpElements();
        
        this.registerRoutes(router);
        
        process.on('SIGINT', () => this.stop());
        process.on('SIGTERM', () => this.stop());
    }

    async registerMcpElements() {
        // Initial registration - register all enabled elements
        await this.rebuildMcpRegistrations();
    }

    registerRoutes(router) {
        
        router.post("/mcp", async (req, res) => {
          const transport = new StreamableHTTPServerTransport({});
          res.on("close", () => transport.close());
          await this.server.connect(transport);
          await transport.handleRequest(req, res, req.body);
        });
        
        router.get('/mcp/addons', async (req, res) => {
            try {
                const query = `SELECT * FROM ${this.tables.addons}`;
                this.db.query(query, (err, results) => {
                    if (err) {
                        res.status(500).json({ success: false, error: err.message });
                    } else {
                        res.json({ success: true, addons: results });
                    }
                });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        router.put('/mcp/addons/:name/toggle', async (req, res) => {
            try {
                const { name } = req.params;
                const query = `UPDATE ${this.tables.addons} SET enabled = NOT enabled WHERE name = ?`;
                this.db.query(query, [name], async (err, result) => {
                    if (err) {
                        res.status(500).json({ success: false, error: err.message });
                    } else {
                        // Rebuild MCP registrations after toggling addon
                        await this.rebuildMcpRegistrations();
                        res.json({ success: true, affected: result.affectedRows, message: 'MCP registrations updated' });
                    }
                });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        router.get('/mcp/elements', async (req, res) => {
            try {
                const query = `SELECT * FROM ${this.tables.elements}`;
                this.db.query(query, (err, results) => {
                    if (err) {
                        res.status(500).json({ success: false, error: err.message });
                    } else {
                        res.json({ success: true, elements: results });
                    }
                });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        router.put('/mcp/elements/:id/toggle', async (req, res) => {
            try {
                const { id } = req.params;
                const query = `UPDATE ${this.tables.elements} SET enabled = NOT enabled WHERE id = ?`;
                this.db.query(query, [id], async (err, result) => {
                    if (err) {
                        res.status(500).json({ success: false, error: err.message });
                    } else {
                        // Rebuild MCP registrations after toggling element
                        await this.rebuildMcpRegistrations();
                        res.json({ success: true, affected: result.affectedRows, message: 'MCP registrations updated' });
                    }
                });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        router.get('/mcp/logs', async (req, res) => {
            try {
                const { limit = 50, event_type, addon_name } = req.query;
                let query = `SELECT * FROM ${this.tables.events}`;
                const conditions = [];
                const params = [];

                if (event_type) {
                    conditions.push('event_type = ?');
                    params.push(event_type);
                }

                if (addon_name) {
                    conditions.push('addon_name = ?');
                    params.push(addon_name);
                }

                if (conditions.length > 0) {
                    query += ' WHERE ' + conditions.join(' AND ');
                }

                query += ' ORDER BY created_at DESC LIMIT ?';
                params.push(parseInt(limit));

                this.db.query(query, params, (err, results) => {
                    if (err) {
                        res.status(500).json({ success: false, error: err.message });
                    } else {
                        res.json({ success: true, logs: results });
                    }
                });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        router.get('/mcp/status', async (req, res) => {
            try {
                const stats = await this.getStats();
                res.json({
                    success: true,
                    server: 'banglee-mcp',
                    addons: Array.from(this.loadedAddons.keys()),
                    stats
                });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        router.post('/mcp/test-tool', async (req, res) => {
            try {
                const { tool_name, arguments: args } = req.body;
                
                for (const [addonName, addonInstance] of this.loadedAddons) {
                    if (addonInstance.getTools) {
                        const tools = addonInstance.getTools();
                        const tool = tools.find(t => t.name === tool_name);
                        if (tool) {
                            const enabled = await this.isElementEnabled(addonName, tool_name, 'tool');
                            if (enabled) {
                                const startTime = Date.now();
                                const result = await tool.handler(args);
                                const executionTime = Date.now() - startTime;
                                await this.logEvent('test_call', tool_name, 'tool', args, result, 'success', null, executionTime, addonName);
                                return res.json({ success: true, result });
                            }
                        }
                    }
                }
                
                res.status(404).json({ success: false, error: 'Tool not found or disabled' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // New endpoint to manually refresh MCP registrations
        router.post('/mcp/refresh', async (req, res) => {
            try {
                await this.rebuildMcpRegistrations();
                res.json({ success: true, message: 'MCP registrations refreshed successfully' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }

    async getStats() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    COUNT(*) as total_events,
                    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_events,
                    COUNT(CASE WHEN status = 'error' THEN 1 END) as failed_events,
                    AVG(execution_time_ms) as avg_execution_time
                FROM ${this.tables.events}
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            `;
            this.db.query(query, (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });
    }

    async logEvent(eventType, elementName, elementType, requestData, responseData, status = 'success', errorMessage = null, executionTime = 0, addonName) {
        const query = `INSERT INTO ${this.tables.events} ( event_type, element_name, element_type, request_data,  response_data, status, error_message, execution_time_ms, addon_name ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;

        const params = [
            eventType,
            elementName,
            elementType,
            JSON.stringify(requestData),
            JSON.stringify(responseData),
            status,
            errorMessage,
            executionTime,
            addonName
        ];

        this.db.query(query, params, (err) => {
            if (err) console.error('Error logging event:', err);
        });
    }

    async stop() {
        if (this.server) {
            await this.server.close();
            // console.log('MCP Server stopped');
        }
    }
}

module.exports = McpAddon;