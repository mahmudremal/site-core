const TOKEN_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNTYzNjY3NSwicmVnaXN0ZXJfdHlwZSI6Im9hdXRoMiIsImFwcF9uYW1lIjoiQ2hpdENoYXRfV2ViIiwidG9rZW5faWQiOiI4NzE0YTIwYy0yOWZkLTQyMDctOTY3ZC1hNDg0NjIzNjM0ZjAiLCJpc3MiOiJzaWRlci5haSIsImF1ZCI6WyIiXSwiZXhwIjoxNzgxMDE5MTg1LCJuYmYiOjE3NDk5MTUxODUsImlhdCI6MTc0OTkxNTE4NX0.cWsqJBXBGN0o-sQA30Dgg8tWjtPuTAwLgObfwZrjiUI';

class Client {
    constructor() {
        this.cache = [];
        this.tokenMap = {};
        this.setup_hooks();
    }

    setup_hooks() {
        this.event_listener();
    }

    event_listener() {
        window.addEventListener('message', (event) => {
            if (event.source !== window || !event.data || event.data.type !== 'AI_ASK_RESPONSE') return;

            const { token_id, response, error } = event.data;
            if (!token_id) return;

            // Cache response
            this.cache.push({ token_id, response, error });
        });
    }

    send_message({ message = null, token = null, onChunk = t => t }) {
        const token_id = crypto.randomUUID(); // Unique request ID

        window.postMessage({
            type: 'AI_ASK_REQUEST',
            payload: {
                message: message || '',
                token: token || TOKEN_KEY,
                token_id
            }
        }, '*');

        return new Promise((resolve, reject) => {
            let timed = 0;
            const _loop = setInterval(() => {
                const item = this.cache.find(i => i.token_id === token_id);

                if (item) {
                    if (item.error) {
                        reject(item.error);
                    } else if (item.response?.error) {
                        reject(item.response.error);
                    } else {
                        if (item.response?.chunk) onChunk(item.response.chunk);
                        if (item.response?.result) {
                            resolve(item.response.result);
                        }
                    }
                    clearInterval(_loop);
                }

                timed += 500;
                if (timed >= 1000 * 60 * 5) {
                    clearInterval(_loop);
                    reject('Timed out');
                }
            }, 500);
        });
    }
}
export default Client;