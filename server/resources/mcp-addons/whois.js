const { z } = require('zod');
const whois = require('whois');
const dns = require('dns').promises;

class WhoisAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = 'whois';
    }

    async init() {
        return true;
    }

    _parseWhoisData(data) {
        const lines = data.split('\n');
        const parsed = {};
        
        for (const line of lines) {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim().toLowerCase();
                const value = line.substring(colonIndex + 1).trim();
                if (value) {
                    parsed[key] = value;
                }
            }
        }
        return parsed;
    }

    _isIP(input) {
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return ipv4Regex.test(input) || ipv6Regex.test(input);
    }

    _isASN(input) {
        return /^AS\d+$/i.test(input) || /^\d+$/.test(input);
    }

    getTools() {
        return [
            {
                title: 'Domain Whois Lookup',
                name: 'whois_domain',
                description: 'Perform whois lookup for a domain name',
                inputSchema: {
                    domain: z.string()
                },
                handler: async ({ domain }) => {
                    return new Promise((resolve, reject) => {
                        whois.lookup(domain, (err, data) => {
                            if (err) {
                                resolve({ error: err.message, domain });
                            } else {
                                resolve({
                                    domain,
                                    raw: data,
                                    parsed: this._parseWhoisData(data)
                                });
                            }
                        });
                    });
                }
            },
            {
                title: 'IP Whois Lookup',
                name: 'whois_ip',
                description: 'Perform whois lookup for an IP address',
                inputSchema: {
                    ip: z.string()
                },
                handler: async ({ ip }) => {
                    if (!this._isIP(ip)) {
                        return { error: 'Invalid IP address format', ip };
                    }
                    return new Promise((resolve, reject) => {
                        whois.lookup(ip, (err, data) => {
                            if (err) {
                                resolve({ error: err.message, ip });
                            } else {
                                resolve({
                                    ip,
                                    raw: data,
                                    parsed: this._parseWhoisData(data)
                                });
                            }
                        });
                    });
                }
            },
            {
                title: 'ASN Whois Lookup',
                name: 'whois_asn',
                description: 'Perform whois lookup for an ASN (Autonomous System Number)',
                inputSchema: {
                    asn: z.string()
                },
                handler: async ({ asn }) => {
                    if (!this._isASN(asn)) {
                        return { error: 'Invalid ASN format', asn };
                    }
                    const formattedAsn = asn.toUpperCase().startsWith('AS') ? asn : `AS${asn}`;
                    return new Promise((resolve, reject) => {
                        whois.lookup(formattedAsn, (err, data) => {
                            if (err) {
                                resolve({ error: err.message, asn: formattedAsn });
                            } else {
                                resolve({
                                    asn: formattedAsn,
                                    raw: data,
                                    parsed: this._parseWhoisData(data)
                                });
                            }
                        });
                    });
                }
            },
            {
                title: 'TLD Whois Lookup',
                name: 'whois_tld',
                description: 'Perform whois lookup for a TLD (Top Level Domain)',
                inputSchema: {
                    tld: z.string()
                },
                handler: async ({ tld }) => {
                    const cleanTld = tld.startsWith('.') ? tld : `.${tld}`;
                    return new Promise((resolve, reject) => {
                        whois.lookup(cleanTld, (err, data) => {
                            if (err) {
                                resolve({ error: err.message, tld: cleanTld });
                            } else {
                                resolve({
                                    tld: cleanTld,
                                    raw: data,
                                    parsed: this._parseWhoisData(data)
                                });
                            }
                        });
                    });
                }
            },
            {
                title: 'DNS Lookup',
                name: 'dns_lookup',
                description: 'Perform DNS lookup for a domain',
                inputSchema: {
                    domain: z.string(),
                    type: z.enum(['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME']).optional().default('A')
                },
                handler: async ({ domain, type }) => {
                    try {
                        let result;
                        switch (type) {
                            case 'A':
                                result = await dns.resolve4(domain);
                                break;
                            case 'AAAA':
                                result = await dns.resolve6(domain);
                                break;
                            case 'MX':
                                result = await dns.resolveMx(domain);
                                break;
                            case 'TXT':
                                result = await dns.resolveTxt(domain);
                                break;
                            case 'NS':
                                result = await dns.resolveNs(domain);
                                break;
                            case 'CNAME':
                                result = await dns.resolveCname(domain);
                                break;
                        }
                        return { domain, type, records: result };
                    } catch (error) {
                        return { error: error.message, domain, type };
                    }
                }
            }
        ];
    }

    getResources() {
        return [
            {
                uri: 'whois://help',
                title: 'Whois Help',
                name: 'Help',
                description: 'Information about whois lookup types and formats',
                mimeType: 'application/json',
                handler: async () => ({
                    content: JSON.stringify({
                        supported_types: ['domain', 'ip', 'asn', 'tld'],
                        formats: {
                            domain: 'example.com',
                            ip: '8.8.8.8 or 2001:4860:4860::8888',
                            asn: 'AS15169 or 15169',
                            tld: '.com or com'
                        },
                        dns_types: ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME']
                    })
                })
            }
        ];
    }

    getPrompts() {
        return [
            {
                title: 'Whois Assistant',
                name: 'whois_assistant',
                description: 'Get help with whois lookups and DNS queries',
                arguments: [
                    {
                        name: 'query_type',
                        description: 'Type of lookup needed (domain, ip, asn, tld)',
                        required: false
                    }
                ],
                handler: async () => ({
                    description: 'I can perform whois lookups for domains, IPs, ASNs, TLDs and DNS queries.',
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: 'Ask me to lookup domain registration info, IP ownership, ASN details, or DNS records.'
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = WhoisAddon;