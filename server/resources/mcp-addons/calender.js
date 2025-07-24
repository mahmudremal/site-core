const axios = require('axios');
const { z } = require('zod');

class CalendlyAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = 'calendly';
        this.apiKey = process.env.CALENDLY_API_KEY;
        this.baseUrl = 'https://api.calendly.com';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        this.currentUser = null;
    }

    async _getCurrentUser() {
        if (this.currentUser) return this.currentUser;
        
        try {
            const response = await axios.get(`${this.baseUrl}/users/me`, {
                headers: this.headers
            });
            this.currentUser = response.data.resource;
            return this.currentUser;
        } catch (error) {
            throw new Error(`Failed to get current user: ${error.message}`);
        }
    }

    async init() {
        if (!this.apiKey) {
            throw new Error('CALENDLY_API_KEY environment variable is required');
        }
        
        await this._getCurrentUser();
        return true;
    }

    getTools() {
        return [
            {
                title: 'List Calendly Events',
                name: 'cal_list_events',
                description: 'List scheduled Calendly events in descending order (newest first)',
                inputSchema: {
                    count: z.number().int().min(1).max(100).default(20).optional(),
                    inviteeEmail: z.string().email().optional(),
                    status: z.enum(['active', 'canceled']).optional(),
                    minStartTime: z.string().datetime().optional(),
                    maxStartTime: z.string().datetime().optional()
                },
                handler: async ({ count, inviteeEmail, status, minStartTime, maxStartTime }) => {
                    try {
                        const user = await this._getCurrentUser();
                        const params = {
                            user: user.uri,
                            count: count || 20,
                            sort: 'start_time:desc'  // Always descending
                        };

                        if (inviteeEmail) params.invitee_email = inviteeEmail;
                        if (status) params.status = status;
                        if (minStartTime) params.min_start_time = minStartTime;
                        if (maxStartTime) params.max_start_time = maxStartTime;

                        const response = await axios.get(`${this.baseUrl}/scheduled_events`, {
                            headers: this.headers,
                            params
                        });

                        return {
                            success: true,
                            events: response.data.collection,
                            pagination: response.data.pagination
                        };
                    } catch (error) {
                        return {
                            success: false,
                            error: error.response?.data || error.message
                        };
                    }
                }
            },
            {
                title: 'Get Calendly Event Details',
                name: 'cal_get_event',
                description: 'Get detailed information about a specific Calendly event including invitees',
                inputSchema: {
                    eventUuid: z.string().describe('UUID of the scheduled event'),
                    includeInvitees: z.boolean().default(true).optional()
                },
                handler: async ({ eventUuid, includeInvitees }) => {
                    try {
                        // Get event details
                        const eventResponse = await axios.get(`${this.baseUrl}/scheduled_events/${eventUuid}`, {
                            headers: this.headers
                        });

                        const result = {
                            success: true,
                            event: eventResponse.data.resource
                        };

                        // Get invitees if requested
                        if (includeInvitees) {
                            try {
                                const inviteesResponse = await axios.get(`${this.baseUrl}/scheduled_events/${eventUuid}/invitees`, {
                                    headers: this.headers
                                });
                                result.invitees = inviteesResponse.data.collection;
                            } catch (inviteesError) {
                                result.invitees_error = 'Could not fetch invitees';
                            }
                        }

                        return result;
                    } catch (error) {
                        return {
                            success: false,
                            error: error.response?.data || error.message
                        };
                    }
                }
            },
            {
                title: 'Cancel Calendly Event',
                name: 'cal_cancel_event',
                description: 'Cancel a scheduled Calendly event',
                inputSchema: {
                    eventUuid: z.string().describe('UUID of the event to cancel'),
                    reason: z.string().optional().describe('Reason for cancellation')
                },
                handler: async ({ eventUuid, reason }) => {
                    try {
                        const payload = {};
                        if (reason) payload.reason = reason;

                        const response = await axios.post(
                            `${this.baseUrl}/scheduled_events/${eventUuid}/cancellation`,
                            payload,
                            { headers: this.headers }
                        );

                        return {
                            success: true,
                            cancellation: response.data.resource
                        };
                    } catch (error) {
                        return {
                            success: false,
                            error: error.response?.data || error.message
                        };
                    }
                }
            },
            {
                title: 'List Calendly Event Types',
                name: 'cal_list_event_types',
                description: 'List all Calendly event types (scheduling templates)',
                inputSchema: {
                    active: z.boolean().optional().describe('Filter by active status'),
                    count: z.number().int().min(1).max(100).default(20).optional()
                },
                handler: async ({ active, count }) => {
                    try {
                        const user = await this._getCurrentUser();
                        const params = {
                            user: user.uri,
                            count: count || 20,
                            sort: 'name:asc'
                        };
                        
                        if (active !== undefined) params.active = active;

                        const response = await axios.get(`${this.baseUrl}/event_types`, {
                            headers: this.headers,
                            params
                        });

                        return {
                            success: true,
                            event_types: response.data.collection,
                            pagination: response.data.pagination
                        };
                    } catch (error) {
                        return {
                            success: false,
                            error: error.response?.data || error.message
                        };
                    }
                }
            },
            {
                title: 'Get Calendly Organization Info',
                name: 'cal_get_organization',
                description: 'Get Calendly organization details and optionally list members',
                inputSchema: {
                    includeMembers: z.boolean().default(false).optional().describe('Include organization members list'),
                    memberCount: z.number().int().min(1).max(100).default(20).optional()
                },
                handler: async ({ includeMembers, memberCount }) => {
                    try {
                        const user = await this._getCurrentUser();
                        const orgUri = user.current_organization;
                        
                        if (!orgUri) {
                            return {
                                success: false,
                                error: 'No organization found for current user'
                            };
                        }

                        // Get organization details
                        const orgUuid = orgUri.split('/').pop();
                        const orgResponse = await axios.get(`${this.baseUrl}/organizations/${orgUuid}`, {
                            headers: this.headers
                        });

                        const result = {
                            success: true,
                            organization: orgResponse.data.resource
                        };

                        // Get members if requested
                        if (includeMembers) {
                            try {
                                const membersResponse = await axios.get(`${this.baseUrl}/organization_memberships`, {
                                    headers: this.headers,
                                    params: {
                                        organization: orgUri,
                                        count: memberCount || 20
                                    }
                                });
                                result.members = membersResponse.data.collection;
                                result.members_pagination = membersResponse.data.pagination;
                            } catch (membersError) {
                                result.members_error = 'Could not fetch members';
                            }
                        }

                        return result;
                    } catch (error) {
                        return {
                            success: false,
                            error: error.response?.data || error.message
                        };
                    }
                }
            },
            {
                title: 'Get Calendly User Profile',
                name: 'cal_get_profile',
                description: 'Get current Calendly user profile information',
                inputSchema: {},
                handler: async () => {
                    try {
                        const user = await this._getCurrentUser();
                        return { 
                            success: true,
                            user: user
                        };
                    } catch (error) {
                        return { 
                            success: false,
                            error: error.message 
                        };
                    }
                }
            }
        ];
    }

    getResources() {
        return [
            {
                uri: 'calendly://dashboard',
                name: 'Calendly Dashboard',
                description: 'Overview of Calendly account, events, and settings',
                mimeType: 'application/json'
            }
        ];
    }

    getPrompts() {
        return [
            {
                title: 'Calendly Manager',
                name: 'calendly_manager',
                description: 'Manage Calendly events, view schedules, and handle bookings',
                arguments: [
                    {
                        name: 'action',
                        description: 'What you want to do (list events, check schedule, cancel booking, etc.)',
                        required: false
                    }
                ],
                handler: async ({ action }) => ({
                    description: 'Calendly Event Management Assistant',
                    messages: [
                        {
                            role: 'assistant',
                            content: {
                                type: 'text',
                                text: `# Calendly Manager\n\nI can help you manage your Calendly scheduling efficiently.\n\n## 🔧 Available Actions:\n- **📅 List Events** - View your scheduled events (newest first)\n- **🔍 Event Details** - Get full event info with attendees\n- **❌ Cancel Events** - Cancel bookings with optional reason\n- **📋 Event Types** - View your scheduling templates\n- **🏢 Organization** - Get org info and team members\n- **👤 Profile** - View your account details\n\n## 💡 Quick Commands:\n- "Show my events for this week"\n- "Cancel event [UUID] - client rescheduled"  \n- "List my active event types"\n- "Get organization members"\n\n${action ? `\nLet me help you with: ${action}` : '\nWhat would you like to do with your Calendly account?'}`
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = CalendlyAddon;