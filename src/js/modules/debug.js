class Debug {
    constructor() {
        if (Debug.instance) {
            return Debug.instance;
        }
        Debug.instance = this;
        this.display = false;
        this.logs = [];
    }

    setDisplay(value) {
        this.display = Boolean(value);
    }

    log(...args) {
        this.handleMethod('log', ...args);
    }

    warn(...args) {
        this.handleMethod('warn', ...args);
    }

    error(...args) {
        this.handleMethod('error', ...args);
    }

    info(...args) {
        this.handleMethod('info', ...args);
    }

    debug(...args) {
        this.handleMethod('debug', ...args);
    }

    table(...args) {
        this.handleMethod('table', ...args);
    }

    trace(...args) {
        this.handleMethod('trace', ...args);
    }

    clear() {
        if (this.display) {
            console.clear();
        }
        this.logs = [];
    }

    handleMethod(method, ...args) {
        if (this.display) {
            console[method](...args);
        }
        this.logs.push({ method, args, timestamp: new Date() });
    }

    getLogs() {
        return this.logs;
    }
}

export const debug = new Debug();
