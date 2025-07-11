const { z } = require('zod');
const axios = require('axios');

class GooglePageSpeedInsightsAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = 'pagespeed-insights';
        this.apiKey = process.env.GOOGLE_PAGESPEED_INSIGHT_API_KEY;
    }

    init() {
        return true;
    }
    getTools() {
        return [
            {
                title: 'Get PageSpeed Insights',
                name: 'get_pagespeed_insights',
                description: 'Retrieve PageSpeed Insights report for a specific URL',
                inputSchema: {
                    url: z.string().url(),
                    strategy: z.enum(['desktop', 'mobile']).optional().default('mobile'), // Optional parameter to select strategy
                },
                handler: async (args) => {
                    const { url, strategy } = args;
                    if (!url) {throw new Error('You must provide a valid url to analyze page speed insights.');}
                    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${this.apiKey}&strategy=${strategy}`;

                    try {
                        const response = await axios.get(apiUrl);
                        return {
                            result: response.data,
                        };
                    } catch (error) {
                        // Handle errors appropriately (e.g., logging)
                        console.error('Error fetching PageSpeed Insights:', error);
                        throw new Error('Failed to fetch PageSpeed Insights data');
                    }
                }
            }
        ];
    }

    getResources() {
        return [];
    }
    
    getPrompts() {
        return [
            {
                title: 'PageSpeed Insights Assistant',
                name: 'pagespeed_assistant',
                description: 'Get help with retrieving PageSpeed insights for your URLs',
                arguments: [
                    {
                        name: 'url',
                        description: 'The URL to analyze for PageSpeed insights',
                        required: true,
                    },
                    {
                        name: 'strategy',
                        description: 'Specify the analysis strategy: mobile or desktop',
                        required: false,
                    }
                ],
                handler: async (args) => {
                    return {
                        description: 'PageSpeed Insights Assistant',
                        messages: [
                            {
                                role: 'user',
                                content: {
                                    type: 'text',
                                    text: 'I can help retrieve PageSpeed insights for your URLs. Please provide a URL and optionally specify the strategy (desktop or mobile).'
                                }
                            }
                        ]
                    };
                }
            }
        ];
    }
}

module.exports = GooglePageSpeedInsightsAddon;