const axios = require('axios');
const { z } = require('zod');

class FacebookAdsAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = 'facebook-ads';
        this.accessToken = process.env.META_ADS_API_KEY;
        this.graphApiBase = 'https://graph.facebook.com/v16.0';
    }

    async init() {
        if (!this.accessToken) {
            throw new Error('Facebook Access Token is required');
        }
        return true;
    }

    async _apiGet(endpoint, params = {}) {
        params['access_token'] = this.accessToken;
        const url = `${this.graphApiBase}/${endpoint}`;
        const response = await axios.get(url, { params });
        if (response.data.error) {
            throw new Error(response.data.error.message);
        }
        return response.data;
    }

    async _apiPost(endpoint, data = {}) {
        data['access_token'] = this.accessToken;
        const url = `${this.graphApiBase}/${endpoint}`;
        const response = await axios.post(url, null, { params: data });
        if (response.data.error) {
            throw new Error(response.data.error.message);
        }
        return response.data;
    }

    async _apiDelete(endpoint) {
        const url = `${this.graphApiBase}/${endpoint}`;
        const response = await axios.delete(url, { params: { access_token: this.accessToken } });
        if (response.data.error) {
            throw new Error(response.data.error.message);
        }
        return response.data;
    }

    getTools() {
        return [
            {
                title: 'Get Ad Accounts',
                name: 'get_ad_accounts',
                description: 'Get Facebook ad accounts for the authenticated user',
                inputSchema: {},
                handler: async () => {
                    const data = await this._apiGet('me/adaccounts');
                    return { accounts: data.data };
                }
            },
            {
                title: 'List Campaigns',
                name: 'list_campaigns',
                description: 'List campaigns in an ad account',
                inputSchema: {
                    accountId: z.string()
                },
                handler: async ({ accountId }) => {
                    const adAccountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
                    const data = await this._apiGet(`${adAccountId}/campaigns`);
                    return { campaigns: data.data };
                }
            },
            {
                title: 'Create Campaign',
                name: 'create_campaign',
                description: 'Create a new campaign',
                inputSchema: {
                    accountId: z.string(),
                    name: z.string(),
                    objective: z.string(),
                    status: z.string().optional().default('PAUSED')
                },
                handler: async ({ accountId, name, objective, status }) => {
                    const adAccountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
                    const data = await this._apiPost(`${adAccountId}/campaigns`, { name, objective, status });
                    return { campaign: data };
                }
            },
            {
                title: 'Get Campaign',
                name: 'get_campaign',
                description: 'Get details of a campaign by ID',
                inputSchema: {
                    campaignId: z.string()
                },
                handler: async ({ campaignId }) => {
                    const data = await this._apiGet(campaignId);
                    return { campaign: data };
                }
            },
            {
                title: 'Update Campaign',
                name: 'update_campaign',
                description: 'Update a campaign by ID',
                inputSchema: {
                    campaignId: z.string(),
                    name: z.string().optional(),
                    status: z.string().optional()
                },
                handler: async ({ campaignId, ...updates }) => {
                    const data = await this._apiPost(campaignId, updates);
                    return { campaign: data };
                }
            },
            {
                title: 'Delete Campaign',
                name: 'delete_campaign',
                description: 'Delete a campaign by ID',
                inputSchema: {
                    campaignId: z.string()
                },
                handler: async ({ campaignId }) => {
                    const data = await this._apiDelete(campaignId);
                    return { success: data.success };
                }
            },
            {
                title: 'List Ad Sets',
                name: 'list_ad_sets',
                description: 'List ad sets in a campaign',
                inputSchema: {
                    campaignId: z.string()
                },
                handler: async ({ campaignId }) => {
                    const data = await this._apiGet(`${campaignId}/adsets`);
                    return { adsets: data.data };
                }
            },
            {
                title: 'Create Ad Set',
                name: 'create_ad_set',
                description: 'Create an ad set in a campaign',
                inputSchema: {
                    campaignId: z.string(),
                    name: z.string(),
                    daily_budget: z.string(),
                    start_time: z.string(),
                    end_time: z.string(),
                    billing_event: z.string(),
                    optimization_goal: z.string(),
                    campaign_id: z.string().optional(),
                    targeting: z.object({}).optional()
                },
                handler: async ({ campaignId, name, daily_budget, start_time, end_time, billing_event, optimization_goal, targeting }) => {
                    const params = {
                        campaign_id: campaignId,
                        name,
                        daily_budget,
                        start_time,
                        end_time,
                        billing_event,
                        optimization_goal,
                        targeting: targeting ? JSON.stringify(targeting) : undefined,
                        status: 'PAUSED'
                    };
                    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
                    const data = await this._apiPost(`act_${campaignId.split('_')[1]}/adsets`, params);
                    return { adset: data };
                }
            },
            {
                title: 'List Ads',
                name: 'list_ads',
                description: 'List ads in an ad set',
                inputSchema: {
                    adSetId: z.string()
                },
                handler: async ({ adSetId }) => {
                    const data = await this._apiGet(`${adSetId}/ads`);
                    return { ads: data.data };
                }
            },
            {
                title: 'Create Ad',
                name: 'create_ad',
                description: 'Create an ad within an ad set',
                inputSchema: {
                    adSetId: z.string(),
                    name: z.string(),
                    creative: z.object({
                        creative_id: z.string()
                    })
                },
                handler: async ({ adSetId, name, creative }) => {
                    const params = {
                        name,
                        adset_id: adSetId,
                        creative: JSON.stringify(creative),
                        status: 'PAUSED'
                    };
                    const data = await this._apiPost(`act_${adSetId.split('_')[1]}/ads`, params);
                    return { ad: data };
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
                title: 'Facebook Ads Assistant',
                name: 'fbads_assistant',
                description: 'Assist with Facebook Ads management and reporting',
                arguments: [
                    {
                        name: 'task',
                        description: 'Specify Facebook Ads related task',
                        required: false
                    }
                ],
                handler: async () => ({
                    description: 'I can help you retrieve ad accounts, manage campaigns, ad sets, and ads.',
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: 'Ask me to manage or retrieve Facebook Ads data.'
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = FacebookAdsAddon;