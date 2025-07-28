const { z } = require("zod");
const axios = require("axios");

class ClarityAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = "clarity";
        this.apiKey = process.env.MS_CLARITY_APIKEY;
        this.baseUrl = process.env.MS_CLARITY_ENDPOINT || "https://www.clarity.ms/api/v1";
        this.headers = {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        };
    }

    async init() {
        if (!this.apiKey) {
            throw new Error("MS_CLARITY_APIKEY environment variable is required");
        }
        
        // Test the API connection
        try {
            await this.testConnection();
            return true;
        } catch (error) {
            throw new Error(`Failed to initialize Clarity API: ${error.message}`);
        }
    }

    async testConnection() {
        try {
            // Test with a simple API call to verify credentials
            const response = await axios.get(`${this.baseUrl}/projects`, {
                headers: this.headers,
                timeout: 10000
            });
            return response.status === 200;
        } catch (error) {
            throw new Error(`API connection test failed: ${error.response?.status || error.message}`);
        }
    }

    buildApiUrl(endpoint, projectId) {
        // Construct proper API URLs based on endpoint
        const endpoints = {
            insights: `${this.baseUrl}/projects/${projectId}/insights`,
            behavior: `${this.baseUrl}/projects/${projectId}/sessions`,
            performance: `${this.baseUrl}/projects/${projectId}/performance`,
            export: `${this.baseUrl}/projects/${projectId}/export`
        };
        
        return endpoints[endpoint] || `${this.baseUrl}/projects/${projectId}`;
    }

    getTools() {
        return [
            {
                title: "Get Clarity Analytics Data",
                name: "clarity_get_analytics",
                description: "Get comprehensive Clarity analytics including insights, behavior, and performance data",
                inputSchema: {
                    projectId: z.string().describe("The Clarity project ID"),
                    dataType: z.enum(['insights', 'behavior', 'performance', 'all']).default('insights').describe("Type of data to retrieve"),
                    dateRange: z.enum(['today', 'yesterday', 'last7days', 'last30days', 'custom']).default('last7days'),
                    startDate: z.string().optional().describe("Start date for custom range (YYYY-MM-DD)"),
                    endDate: z.string().optional().describe("End date for custom range (YYYY-MM-DD)"),
                    sessionId: z.string().optional().describe("Specific session ID for behavior analysis"),
                    behaviorType: z.enum(['clicks', 'scrolls', 'rage_clicks', 'dead_clicks', 'excessive_scrolling']).optional(),
                    metricType: z.enum(['page_load', 'javascript_errors', 'network_requests', 'core_vitals']).optional(),
                    limit: z.number().int().min(1).max(1000).default(100).optional()
                },
                handler: async ({ projectId, dataType, dateRange, startDate, endDate, sessionId, behaviorType, metricType, limit }) => {
                    try {
                        // Validate projectId format
                        if (!projectId || typeof projectId !== 'string') {
                            return {
                                success: false,
                                error: "Invalid project ID provided"
                            };
                        }

                        const params = this.buildDateParams(dateRange, startDate, endDate);
                        
                        // Add specific parameters based on data type
                        if (sessionId) params.sessionId = sessionId;
                        if (behaviorType) params.behaviorType = behaviorType;
                        if (metricType) params.metricType = metricType;
                        if (limit) params.limit = limit;

                        let apiUrl;
                        let responseData = {};

                        // Handle different data types with separate API calls
                        if (dataType === 'all') {
                            // Make multiple API calls for comprehensive data
                            const results = await Promise.allSettled([
                                this.fetchDataFromEndpoint('insights', projectId, params),
                                this.fetchDataFromEndpoint('behavior', projectId, params),
                                this.fetchDataFromEndpoint('performance', projectId, params)
                            ]);

                            responseData = {
                                insights: results[0].status === 'fulfilled' ? results[0].value : { error: results[0].reason?.message },
                                behavior: results[1].status === 'fulfilled' ? results[1].value : { error: results[1].reason?.message },
                                performance: results[2].status === 'fulfilled' ? results[2].value : { error: results[2].reason?.message }
                            };
                        } else {
                            responseData = await this.fetchDataFromEndpoint(dataType, projectId, params);
                        }
                        
                        this.logEvent?.("clarity_analytics_retrieved", { 
                            projectId, 
                            dataType,
                            dateRange,
                            dataSize: JSON.stringify(responseData).length 
                        });
                        
                        return { 
                            success: true,
                            data: responseData,
                            projectId,
                            dataType,
                            period: `${params.startDate} to ${params.endDate}`,
                            timestamp: new Date().toISOString()
                        };
                    } catch (error) {
                        this.logEvent?.("clarity_api_error", { 
                            error: error.message,
                            projectId,
                            dataType,
                            stack: error.stack
                        });
                        
                        return { 
                            success: false,
                            error: this.formatErrorMessage(error),
                            status: error.response?.status,
                            details: error.response?.data
                        };
                    }
                }
            },
            {
                title: "Export Clarity Session Data",
                name: "clarity_export_data",
                description: "Export detailed Clarity session data for analysis",
                inputSchema: {
                    projectId: z.string().describe("The Clarity project ID"),
                    format: z.enum(['json', 'csv']).default('json').describe("Export format"),
                    dateRange: z.enum(['today', 'yesterday', 'last7days', 'last30days', 'custom']).default('last7days'),
                    startDate: z.string().optional().describe("Start date for custom range (YYYY-MM-DD)"),
                    endDate: z.string().optional().describe("End date for custom range (YYYY-MM-DD)"),
                    includeRecordings: z.boolean().default(false).describe("Include session recording URLs"),
                    includePerformance: z.boolean().default(true).describe("Include performance metrics"),
                    includeBehavior: z.boolean().default(true).describe("Include user behavior data")
                },
                handler: async ({ projectId, format, dateRange, startDate, endDate, includeRecordings, includePerformance, includeBehavior }) => {
                    try {
                        const params = this.buildDateParams(dateRange, startDate, endDate);
                        
                        // Add export-specific parameters
                        params.format = format;
                        if (includeRecordings) params.includeRecordings = includeRecordings;
                        if (includePerformance) params.includePerformance = includePerformance;
                        if (includeBehavior) params.includeBehavior = includeBehavior;

                        const exportData = await this.fetchDataFromEndpoint('export', projectId, params);
                        
                        return { 
                            success: true,
                            exportData,
                            projectId,
                            format,
                            period: `${params.startDate} to ${params.endDate}`,
                            exportedAt: new Date().toISOString()
                        };
                    } catch (error) {
                        return { 
                            success: false,
                            error: this.formatErrorMessage(error),
                            status: error.response?.status,
                            details: error.response?.data
                        };
                    }
                }
            },
            {
                title: "Test Clarity Connection",
                name: "clarity_test_connection",
                description: "Test the connection to Microsoft Clarity API",
                inputSchema: {},
                handler: async () => {
                    try {
                        await this.testConnection();
                        return {
                            success: true,
                            message: "Successfully connected to Microsoft Clarity API",
                            timestamp: new Date().toISOString()
                        };
                    } catch (error) {
                        return {
                            success: false,
                            error: this.formatErrorMessage(error),
                            troubleshooting: [
                                "Verify your MS_CLARITY_APIKEY environment variable is set correctly",
                                "Check if your API key has the necessary permissions",
                                "Ensure your project ID is valid and accessible",
                                "Verify network connectivity to clarity.ms"
                            ]
                        };
                    }
                }
            }
        ];
    }

    buildDateParams(dateRange, startDate, endDate) {
        const params = {};
        const now = new Date();
        
        switch (dateRange) {
            case 'today':
                params.startDate = params.endDate = now.toISOString().split('T')[0];
                break;
            case 'yesterday':
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                params.startDate = params.endDate = yesterday.toISOString().split('T')[0];
                break;
            case 'last7days':
                const week = new Date(now);
                week.setDate(week.getDate() - 7);
                params.startDate = week.toISOString().split('T')[0];
                params.endDate = now.toISOString().split('T')[0];
                break;
            case 'last30days':
                const month = new Date(now);
                month.setDate(month.getDate() - 30);
                params.startDate = month.toISOString().split('T')[0];
                params.endDate = now.toISOString().split('T')[0];
                break;
            case 'custom':
                if (startDate) params.startDate = startDate;
                if (endDate) params.endDate = endDate;
                break;
        }
        
        return params;
    }

    async fetchDataFromEndpoint(endpoint, projectId, params) {
        const apiUrl = this.buildApiUrl(endpoint, projectId);
        
        const response = await axios.get(apiUrl, {
            headers: this.headers,
            params,
            timeout: 30000, // 30 second timeout
            validateStatus: (status) => status < 500 // Don't throw on 4xx errors
        });

        if (response.status >= 400) {
            throw new Error(`API returned ${response.status}: ${response.data?.message || 'Unknown error'}`);
        }

        return response.data;
    }

    formatErrorMessage(error) {
        if (error.code === 'ENOTFOUND') {
            return "Cannot connect to Microsoft Clarity API. Please check your internet connection.";
        }
        if (error.code === 'ETIMEDOUT') {
            return "Request timed out. The Clarity API may be temporarily unavailable.";
        }
        if (error.response?.status === 401) {
            return "Authentication failed. Please check your API key.";
        }
        if (error.response?.status === 403) {
            return "Access denied. Your API key may not have permission to access this project.";
        }
        if (error.response?.status === 404) {
            return "Project not found. Please verify the project ID is correct.";
        }
        
        return error.message || "An unknown error occurred";
    }

    getResources() {
        return [
            {
                uri: "clarity://dashboard",
                name: "Clarity Dashboard",
                description: "Microsoft Clarity project analytics and insights",
                mimeType: "application/json"
            },
            {
                uri: "clarity://projects",
                name: "Clarity Projects",
                description: "List of available Clarity projects",
                mimeType: "application/json"
            }
        ];
    }

    getPrompts() {
        return [
            {
                title: "Clarity Analytics Assistant",
                name: "clarity_analyst",
                description: "Analyze Microsoft Clarity data and provide user behavior insights",
                arguments: [
                    {
                        name: "project_id",
                        description: "Clarity project ID to analyze",
                        required: true
                    },
                    {
                        name: "focus",
                        description: "Analysis focus: user behavior, performance, insights, or comprehensive review",
                        required: false
                    }
                ],
                handler: async ({ project_id, focus }) => ({
                    description: "Microsoft Clarity Analytics Assistant",
                    messages: [
                        {
                            role: "assistant",
                            content: {
                                type: "text",
                                text: `# Clarity Analytics Assistant

I'll help you analyze Microsoft Clarity data for project: **${project_id}**

## 📊 What I Can Analyze:
- **User Behavior** - Clicks, scrolls, rage clicks, dead clicks
- **Performance Metrics** - Page load times, Core Web Vitals, errors
- **Session Insights** - User journeys, drop-off points, engagement
- **Trend Analysis** - Compare different time periods
- **Export Data** - Bulk data for external analysis

## 🎯 Quick Analysis Options:
- "Show last 7 days performance summary"
- "Analyze user behavior patterns this month"
- "Get comprehensive insights for last 30 days"
- "Export session data with recordings"
- "Test API connection"

## 🔧 Troubleshooting:
If you're getting connection errors, try:
1. Test the API connection first
2. Verify your project ID format
3. Check your API key permissions

${focus ? `\nStarting ${focus} analysis...` : '\nWhat type of analysis would you like me to perform?'}`
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = ClarityAddon;