class MCPClient {
    constructor(baseURL) {
        this.tools = null;
        this.sessionId = null;
        this.baseURL = baseURL;
    }

    async initSession() {
        const res = await fetch(`${this.baseURL}/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'initialize',
                params: {},
                id: 1
            })
        });

        if (!res.ok) throw new Error(`Failed to initialize MCP session: ${res.statusText}`);

        const sessionId = res.headers.get('mcp-session-id');
        if (!sessionId) throw new Error('No MCP session ID returned');

        this.sessionId = sessionId;
    }

    async getTools() {
        if (!this.sessionId) await this.initSession();
        if (this?.tools) {return this.tools;}

        const res = await fetch(`${this.baseURL}/mcp`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'mcp-session-id': this.sessionId
            }
        });

        if (!res.ok) throw new Error(`Failed to load tools: ${res.statusText}`);
        this.tools = await res.json();
        return this.tools;
    }

    async callTool(toolName, input) {
        if (!this.sessionId) await this.initSession();

        const res = await fetch(`${this.baseURL}/mcp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'mcp-session-id': this.sessionId
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'callTool',
                params: {
                    tool: toolName,
                    input: input
                },
                id: 1
            })
        });

        if (!res.ok) throw new Error(`Tool call failed: ${res.statusText}`);
        return await res.json();
    }

    async has_tool(name) {
        await this.getTools();
        return this.tools.some(t => t?.name === name);
    }

    async get_tool(name) {
        await this.getTools();
        return this.tools.find(t => t?.name === name);
    }

}

export default MCPClient;