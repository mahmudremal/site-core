const { z } = require("zod");
const axios = require("axios");

class TasksAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = "aitask";
        
        this.apiBase = "https://core.agency.local/wp-json/sitecore/v1/tasks";
    }

    async init() {
        return true;
    }

    getTools() {
        return [
            {
                title: "Get a Task",
                name: "tasks_get_a_task",
                description: "Fetch the next pending task from the system",
                inputSchema: {
                    status: z.string().optional().default("pending"),
                    task_type: z.string().optional().default("any"),
                    excluded_ids: z.array(z.number()).optional()
                },
                handler: async (args) => {
                    const { status = "pending", task_type = "any", excluded_ids = [] } = args;
                    try {
                        const params = new URLSearchParams();
                        if (status) params.append("status", status);
                        if (task_type) params.append("task_type", task_type);
                        if (excluded_ids.length > 0) {
                            excluded_ids.forEach(id => params.append("excluded_ids[]", id));
                        }
                        const resp = await axios.get(`${this.apiBase}/search?${params.toString()}`);
                        if (resp.status !== 200) {
                            return { success: false, error: `HTTP Error: ${resp.status}: ${resp.message}` };
                        }
                        if (resp.data && !resp.data?.success) {
                            return { success: false, error: "No tasks available" };
                        }
                        return { success: true, task: resp.data };
                    } catch (error) {
                        return { success: false, error: error.message || "Unknown error" };
                    }
                }
            },
            {
                title: "Submit Task Result",
                name: "tasks_submit",
                description: "Submit the result of a completed task",
                inputSchema: {
                    task_id: z.number(),
                    data: z.any() 
                },
                handler: async (args) => {
                    const { task_id, data } = args;
                    if (!task_id || !data) {
                        return { success: false, error: "Missing task_id or data" };
                    }
                    try {
                        const resp = await axios.post(`${this.apiBase}/${task_id}/submit`, { data });
                        if (resp.status === 200) {
                            return { success: true, message: "Task submitted successfully", response: resp.data };
                        } else {
                            return { success: false, error: `HTTP Error: ${resp.status}` };
                        }
                    } catch (error) {
                        return { success: false, error: error.message || "Unknown error" };
                    }
                }
            }
        ];
    }

    getResources() {
        return [
            {
                uri: 'tasks://instruction',
                name: "Task AI Instruction",
                description: `This resource provides detailed instructions for interacting with the WordPress automated tasks via the REST API, enabling task fetching, processing, and submission in an organized workflow.\n\n1. Collecting a Task:\n  - Use the 'get_a_task' tool to query the WordPress REST API endpoint "/tasks/search" to fetch the oldest pending task.\n  - You can filter by task status (default 'pending') and task type (e.g., 'post_seo', 'media_seo', 'comment_moderation', etc.).\n  - Optionally provide a list of task IDs to exclude if previously processed or skipped.\n  - The fetched task object contains 'task_type', 'task_desc', and a 'task_object' with detailed parameters specific to the task type.\n\n2. Processing a Task:\n  - When a task is received, analyze the 'task_type' to determine the appropriate processing logic.\n  - Typical operations include:\n     * SEO Analysis: Review titles, metadata, headings, and keywords against best practices.\n     * Media SEO: Check images for descriptive titles, captions, and alt text.\n     * Comment Moderation: Scan comments for spam, hate speech, or guideline violations.\n     * Onboarding: Send welcome emails or guide user actions.\n     * WooCommerce Orders: Verify order details, update statuses, and notify customers.\n  - Use any gathered data or external APIs necessary to perform the task objectives.\n  - Collect all findings, results, suggestions, or outcomes in a structured format to be submitted as the task result.\n\n3. Submitting a Task:\n  - Use the 'submit_task' tool to POST the task completion data to "/tasks/{task_id}/submit" endpoint.\n  - Include the task results and any notes or structured data explaining what was performed.\n  - Upon successful submission, the task status is updated as 'completed' in the backend database.\n\n4. Error Handling and State Management:\n  - If no tasks are available, wait or retry after some delay.\n  - If task submission fails, retry or log error for manual intervention.\n  - Maintain a state of processed task IDs to avoid duplication or conflicts.\n\nFollowing these instructions ensures consistent task lifecycle management from acquisition to completion within automated WordPress workflows.`,
                mimeType: 'application/json'
            }
        ];
    }

    getPrompts() {
        return [
            {
                title: "Task AI Assistant",
                name: "task_ai_assistant",
                description: "Assistant for interacting with automated tasks - fetch new tasks and submit results",
                arguments: [
                    {
                        name: "status",
                        description: "Task status filter, usually 'pending' to get tasks to work on",
                        required: false
                    },
                    {
                        name: "task_type",
                        description: "Type of task filter (e.g. post_seo, media_seo, comment_moderation), or any",
                        required: false
                    },
                    {
                        name: "excluded_ids",
                        description: "List of task IDs to exclude from fetching",
                        required: false
                    },
                    {
                        name: "task_id",
                        description: "The ID of the task to submit result for",
                        required: false
                    },
                    {
                        name: "data",
                        description: "Completion data or results for the submitted task",
                        required: false
                    }
                ],
                handler: async () => ({
                    description: "I can help you fetch pending tasks to automate common workflows on WordPress, and submit the completed task results back to the system.",
                    messages: [
                        {
                            role: "user",
                            content: {
                                type: "text",
                                text: "Ask me to fetch a pending task or submit a task result."
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = TasksAddon;