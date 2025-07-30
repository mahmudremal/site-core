import axios from "axios";

class AIAgent {
    constructor() {
        this.baseUrl = 'https://core.agency.local/wp-json/sitecore/v1';
        this.ollamaUrl = 'http://localhost:11434/api/generate';
        this.isRunning = false;
        this.shouldStop = false;
        this.cache = {
            task: null,
            schemas: new Map()
        };
        this.moderationEnabled = false;
        this.moderationCallback = null;
    }

    setModeration(enabled, callback = null) {
        this.moderationEnabled = enabled;
        this.moderationCallback = callback;
    }

    async fetchTask(filters = {}) {
        return axios.get(`${this.baseUrl}/tasks/search`, {
            params: filters
        })
        .then(res => res.data)
        .catch(error => {
            console.error('Error fetching task:', error);
            throw error;
        });
    }

    async fetchSchema(taskType) {
        if (this.cache.schemas.has(taskType)) {
            return this.cache.schemas.get(taskType);
        }
        return fetch(`${this.baseUrl}/tasks/attachments/schemas/${taskType}`)
            .then(res => {
                if (!res.ok) {throw new Error(`HTTP error! status: ${res.status}`);}
                return res.json();
            })
            .then(data => {
                this.cache.schemas.set(taskType, data);
                return data;
            })
            .catch(error => {
                console.error('Error fetching schema:', error);
                throw error;
            });
    }

    async callOllama(prompt, args = {}) {
        const payload = {
            model: 'romi',
            prompt,
            stream: !!args?.stream,
            format: 'json',
        };

        return new Promise((resolve, reject) => {
            if (args.stream) {
                // Use fetch for streaming instead of axios
                fetch(this.ollamaUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let fullResult = '';
                    let buffer = '';

                    const readStream = () => {
                        reader.read().then(({ done, value }) => {
                            if (done) {
                                if (args.onFinish) args.onFinish(fullResult);
                                resolve(fullResult);
                                return;
                            }

                            // Decode the chunk and add to buffer
                            const chunk = decoder.decode(value, { stream: true });
                            buffer += chunk;

                            // Process complete lines from buffer
                            const lines = buffer.split('\n');
                            buffer = lines.pop() || ''; // Keep incomplete line in buffer

                            for (const line of lines) {
                                if (line.trim()) {
                                    try {
                                        const data = JSON.parse(line);
                                        if (data.response) {
                                            fullResult += data.response;
                                            if (args.onChunk) args.onChunk(data.response);
                                            if (args.onProgress) {
                                                // Calculate progress based on done status or estimated length
                                                const progress = data.done ? 100 : Math.min(95, fullResult.length / 5);
                                                args.onProgress(Math.round(progress));
                                            }
                                        }
                                        if (data.done) {
                                            if (args.onFinish) args.onFinish(fullResult);
                                            resolve(fullResult);
                                            return;
                                        }
                                    } catch (e) {
                                        // Handle non-JSON lines
                                        console.warn('Failed to parse JSON line:', line);
                                    }
                                }
                            }

                            readStream(); // Continue reading
                        }).catch(reject);
                    };

                    readStream();
                })
                .catch(error => {
                    console.error('Error calling Ollama (streaming):', error);
                    reject(error);
                });
            } else {
                // Handle non-streaming response with fetch
                fetch(this.ollamaUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    let parsed;
                    try {
                        parsed = typeof data.response === 'string' ? JSON.parse(data.response) : data.response;
                    } catch (e) {
                        parsed = { result: data.response };
                    }
                    if (args.onFinish) args.onFinish(parsed);
                    resolve(parsed);
                })
                .catch(error => {
                    console.error('Error calling Ollama (non-streaming):', error);
                    reject(error);
                });
            }
        });
    }

    async submitTask(taskId, submissionData) {
        return fetch(`${this.baseUrl}/tasks/${taskId}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({data: typeof submissionData === 'string' ? JSON.parse(submissionData) : submissionData})
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error submitting task:', error);
            throw error;
        });
    }

    async processTask(task, args = {}) {
        const schema = await this.fetchSchema(task.task_type);
        const prompt = `Task Type: ${task.task_type}\nTask Description: ${task.task_desc}\nTask Object: ${JSON.stringify(task.task_object)}\nRequired Schema: ${JSON.stringify(schema)}\n\nInstructions:\nUsing the task description, task object, and the required schema:\n- Generate a single valid JSON object that strictly conforms to the provided schema.\n- Do NOT return the schema or include any explanatory text.\n- All required fields in the schema must be filled with appropriate, meaningful, and context-aware values.\n- Do NOT provide any fake or fabricated data; use only the information available from the inputs.\n- Output only the final populated JSON object—nothing else.`;
        
        const aiResponse = await this.callOllama(prompt, args);
        return aiResponse;
    }

    async handleTaskCompletion(task, result) {
        if (this.moderationEnabled && this.moderationCallback) {
            // Send to moderation
            return this.moderationCallback(task, result);
        } else {
            // Submit directly
            return await this.submitTask(task.id, result);
        }
    }

    async runSingleTask(args = {}) {
        try {
            if (args.onLog) args.onLog('Fetching task...', 'info');
            const task = await this.fetchTask(args?.filters??{status: 'pending'});
            
            if (!task || !task.id) {
                if (args.onLog) args.onLog('No task available', 'warning');
                return null;
            }

            if (args.onLog) args.onLog(`Processing task ${task.id} of type ${task.task_type}`, 'info');
            if (args.onTaskStart) args.onTaskStart(task);
            
            const result = await this.processTask(task, args);
            const response = result?.response??result;
            
            if (args.onLog) args.onLog(`Task ${task.id} processing completed`, 'success');
            
            // Handle moderation vs direct submission
            const submission = await this.handleTaskCompletion(task, response);
            
            if (args.onTaskComplete) args.onTaskComplete(task, response, submission);
            
            return { task, result: response, submission };
            
        } catch (error) {
            if (args.onLog) args.onLog(`Error in runSingleTask: ${error.message}`, 'error');
            throw error;
        }
    }

    async startContinuousMode(args = {}) {
        if (this.isRunning) {
            if (args.onLog) args.onLog('Agent is already running', 'warning');
            return;
        }

        this.isRunning = true;
        this.shouldStop = false;
        
        if (args.onLog) args.onLog('AI Agent started - continuous mode', 'success');
        
        while (this.isRunning && !this.shouldStop) {
            try {
                const result = await this.runSingleTask(args);
                
                if (!result) {
                    // No task available, wait before trying again
                    await this.sleep(5000);
                    continue;
                }
                
                // Brief pause between tasks
                await this.sleep(2000);
                
            } catch (error) {
                if (args.onLog) args.onLog(`Error in agent loop: ${error.message}`, 'error');
                // Wait longer on error
                await this.sleep(10000);
            }
        }
        
        this.isRunning = false;
        if (args.onLog) args.onLog('AI Agent stopped', 'warning');
    }

    stopAgent() {
        this.shouldStop = true;
        this.isRunning = false;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Utility methods
    isAgentRunning() {
        return this.isRunning;
    }

    clearCache() {
        this.cache.task = null;
        this.cache.schemas.clear();
    }
}

export default AIAgent;