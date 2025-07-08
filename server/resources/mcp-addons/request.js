const { z } = require('zod');
const axios = require('axios');

class RequestAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = 'http_request';
        this.defaultHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        };
    }

    async init() {
        return true;
    }

    getTools() {
        return [
            {
                title: 'HTTP Request',
                name: 'http_request',
                description: 'Send any HTTP request with full customization support',
                inputSchema: {
                    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']).default('GET'),
                    url: z.string().url(),
                    data: z.any().optional(),
                    headers: z.record(z.string()).optional(),
                    params: z.record(z.string()).optional(),
                    timeout: z.number().optional().default(30000),
                    followRedirects: z.boolean().optional().default(true),
                    maxRedirects: z.number().optional().default(5),
                    responseType: z.enum(['json', 'text', 'arraybuffer', 'blob', 'document', 'stream']).optional().default('json'),
                    auth: z.object({
                        username: z.string(),
                        password: z.string()
                    }).optional(),
                    proxy: z.object({
                        host: z.string(),
                        port: z.number(),
                        username: z.string().optional(),
                        password: z.string().optional()
                    }).optional(),
                    validateStatus: z.boolean().optional().default(false) // false means accept all status codes
                },
                handler: async ({ 
                    method, 
                    url, 
                    data, 
                    headers = {}, 
                    params = {}, 
                    timeout, 
                    followRedirects, 
                    maxRedirects, 
                    responseType,
                    auth,
                    proxy,
                    validateStatus
                }) => {
                    try {
                        const config = {
                            method,
                            url,
                            headers: { ...this.defaultHeaders, ...headers },
                            params,
                            timeout,
                            maxRedirects: followRedirects ? maxRedirects : 0,
                            responseType,
                            validateStatus: validateStatus ? undefined : (() => true)
                        };

                        // Add data for methods that support it
                        if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && data) {
                            config.data = data;
                        }

                        // Add auth if provided
                        if (auth) {
                            config.auth = auth;
                        }

                        // Add proxy if provided
                        if (proxy) {
                            config.proxy = proxy;
                        }

                        const response = await axios(config);
                        
                        return {
                            success: response.status >= 200 && response.status < 300,
                            status: response.status,
                            statusText: response.statusText,
                            headers: response.headers,
                            data: response.data,
                            url: response.config.url,
                            redirected: response.request.res?.responseUrl !== url,
                            size: response.headers['content-length'] || null,
                            contentType: response.headers['content-type'] || null
                        };
                    } catch (error) {
                        if (error.response) {
                            // Server responded with error status
                            return {
                                success: false,
                                status: error.response.status,
                                statusText: error.response.statusText,
                                headers: error.response.headers,
                                data: error.response.data,
                                error: error.message
                            };
                        } else if (error.request) {
                            // Request made but no response received
                            return {
                                success: false,
                                error: 'No response received',
                                details: error.message
                            };
                        } else {
                            // Something else happened
                            return {
                                success: false,
                                error: error.message
                            };
                        }
                    }
                }
            }
        ];
    }

    getResources() {
        return [
            {
                uri: 'request://examples',
                title: 'Request Examples',
                name: 'HTTP Request Examples',
                description: 'Common HTTP request patterns and examples',
                mimeType: 'application/json',
                handler: async () => ({
                    content: JSON.stringify({
                        "simple_get": {
                            "method": "GET",
                            "url": "https://api.example.com/users"
                        },
                        "post_with_json": {
                            "method": "POST",
                            "url": "https://api.example.com/users",
                            "data": { "name": "John", "email": "john@example.com" },
                            "headers": { "Content-Type": "application/json" }
                        },
                        "with_auth": {
                            "method": "GET",
                            "url": "https://api.example.com/protected",
                            "headers": { "Authorization": "Bearer your-token" }
                        },
                        "with_basic_auth": {
                            "method": "GET",
                            "url": "https://api.example.com/protected",
                            "auth": { "username": "user", "password": "pass" }
                        },
                        "form_data": {
                            "method": "POST",
                            "url": "https://api.example.com/upload",
                            "data": "key1=value1&key2=value2",
                            "headers": { "Content-Type": "application/x-www-form-urlencoded" }
                        },
                        "with_proxy": {
                            "method": "GET",
                            "url": "https://api.example.com/data",
                            "proxy": { "host": "proxy.example.com", "port": 8080 }
                        }
                    })
                })
            },
            {
                uri: 'request://headers',
                title: 'Common Headers',
                name: 'Browser Headers',
                description: 'Common browser headers for different scenarios',
                mimeType: 'application/json',
                handler: async () => ({
                    content: JSON.stringify({
                        "chrome_desktop": {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
                        },
                        "firefox_desktop": {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
                        },
                        "mobile_safari": {
                            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1"
                        },
                        "api_json": {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        "api_form": {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "Accept": "application/json"
                        }
                    })
                })
            }
        ];
    }

    getPrompts() {
        return [
            {
                title: 'HTTP Request Helper',
                name: 'http_helper',
                description: 'Get help with making HTTP requests and API calls',
                arguments: [
                    {
                        name: 'request_type',
                        description: 'Type of HTTP request needed (GET, POST, API, scraping, etc.)',
                        required: false
                    }
                ],
                handler: async () => ({
                    description: 'Universal HTTP Request Tool - supports all methods, authentication, proxies, and more',
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: 'I can help you make any HTTP request with full customization support including headers, authentication, proxies, and error handling.'
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = RequestAddon;