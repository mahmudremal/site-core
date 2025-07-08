const { google } = require('googleapis');
const { z } = require('zod');

class GoogleCalendarAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = 'google-calendar';
        this.credentials = process.env.GOOGLE_CALENDAR_CREDENTIALS;
        this.token = '';
        this.calendar = null;
    }

    async _getCalendarClient() {
        if (this.calendar) return this.calendar;
        const { client_secret, client_id, redirect_uris } = this.credentials.installed || this.credentials.web;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        oAuth2Client.setCredentials(this.token);
        this.calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
        return this.calendar;
    }

    async init() {
        await this._getCalendarClient();
        return true;
    }

    getTools() {
        return [
            {
                title: 'List Calendar Events',
                name: 'list_events',
                description: 'List events on the calendar within a date range',
                inputSchema: {
                    calendarId: z.string().default('primary'),
                    timeMin: z.string().datetime().optional(),
                    timeMax: z.string().datetime().optional(),
                    maxResults: z.number().optional()
                },
                handler: async (args) => {
                    const calendar = await this._getCalendarClient();
                    const { calendarId = 'primary', timeMin, timeMax, maxResults } = args;
                    const params = { calendarId, singleEvents: true, orderBy: 'startTime' };
                    if (timeMin) params.timeMin = timeMin;
                    if (timeMax) params.timeMax = timeMax;
                    if (maxResults) params.maxResults = maxResults;
                    const res = await calendar.events.list(params);
                    return { events: res.data.items };
                }
            },
            {
                title: 'Create Calendar Event',
                name: 'create_event',
                description: 'Create a new calendar event',
                inputSchema: {
                    calendarId: z.string().default('primary'),
                    summary: z.string(),
                    description: z.string().optional(),
                    location: z.string().optional(),
                    start: z.object({
                        dateTime: z.string(),
                        timeZone: z.string()
                    }),
                    end: z.object({
                        dateTime: z.string(),
                        timeZone: z.string()
                    }),
                    attendees: z.array(z.object({ email: z.string() })).optional()
                },
                handler: async (args) => {
                    const calendar = await this._getCalendarClient();
                    const { calendarId = 'primary', ...event } = args;
                    const res = await calendar.events.insert({
                        calendarId,
                        resource: event
                    });
                    return { event: res.data };
                }
            },
            {
                title: 'Get Calendar Event',
                name: 'get_event',
                description: 'Get details of a specific calendar event by event ID',
                inputSchema: {
                    calendarId: z.string().default('primary'),
                    eventId: z.string()
                },
                handler: async (args) => {
                    const calendar = await this._getCalendarClient();
                    const { calendarId = 'primary', eventId } = args;
                    const res = await calendar.events.get({ calendarId, eventId });
                    return { event: res.data };
                }
            },
            {
                title: 'Update Calendar Event',
                name: 'update_event',
                description: 'Update a calendar event by event ID',
                inputSchema: {
                    calendarId: z.string().default('primary'),
                    eventId: z.string(),
                    update: z.object({
                        summary: z.string().optional(),
                        description: z.string().optional(),
                        location: z.string().optional(),
                        start: z.object({
                            dateTime: z.string().optional(),
                            timeZone: z.string().optional()
                        }).optional(),
                        end: z.object({
                            dateTime: z.string().optional(),
                            timeZone: z.string().optional()
                        }).optional(),
                        attendees: z.array(z.object({ email: z.string() })).optional()
                    })
                },
                handler: async (args) => {
                    const calendar = await this._getCalendarClient();
                    const { calendarId = 'primary', eventId, update } = args;
                    const current = await calendar.events.get({ calendarId, eventId });
                    const resource = { ...current.data, ...update };
                    const res = await calendar.events.update({
                        calendarId,
                        eventId,
                        resource
                    });
                    return { event: res.data };
                }
            },
            {
                title: 'Delete Calendar Event',
                name: 'delete_event',
                description: 'Delete a calendar event by event ID',
                inputSchema: {
                    calendarId: z.string().default('primary'),
                    eventId: z.string()
                },
                handler: async (args) => {
                    const calendar = await this._getCalendarClient();
                    const { calendarId = 'primary', eventId } = args;
                    await calendar.events.delete({ calendarId, eventId });
                    return { success: true };
                }
            }
        ];
    }

    getResources() {
        return [
            {
                uri: 'google-calendar://metadata',
                title: 'Google Calendar Metadata',
                name: 'Metadata',
                description: 'Information about calendars on this account',
                mimeType: 'application/json',
                handler: async () => {
                    const calendar = await this._getCalendarClient();
                    const res = await calendar.calendarList.list();
                    return { content: JSON.stringify(res.data.items) };
                }
            }
        ];
    }

    getPrompts() {
        return [
            {
                title: 'Calendar Assistant',
                name: 'calendar_assistant',
                description: 'Get help with scheduling and calendar management',
                arguments: [
                    {
                        name: 'task',
                        description: 'Describe what you need help with',
                        required: false
                    }
                ],
                handler: async (args) => ({
                    description: 'Google Calendar Assistant',
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: 'I can help schedule, update, list, or delete meetings and events.'
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = GoogleCalendarAddon;