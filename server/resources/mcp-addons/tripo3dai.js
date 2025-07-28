const { z } = require("zod");
const axios = require("axios");

class Tripo3DAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = "tripo3d";
        
        this.apiBase = "https://api.tripo3d.ai/v2/openapi";
        this.apiKey = process.env.TRIPO3D_API_KEY;
        
        if (!this.apiKey) {
            console.warn("TRIPO3D_API_KEY environment variable not set");
        }
    }

    async init() {
        return true;
    }

    getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    getTools() {
        return [
            {
                title: "Generate 3D Model from Text",
                name: "tripo3d_generate_3d_from_text",
                description: "Generate a 3D model from a text prompt",
                inputSchema: {
                    prompt: z.string().min(1).max(1000),
                    model_version: z.enum(["v2.0-20240919", "v1.4-20240625"]).optional().default("v2.0-20240919"),
                    face_limit: z.number().min(1000).max(100000).optional().default(10000),
                    texture: z.boolean().optional().default(true),
                    pbr: z.boolean().optional().default(false)
                },
                handler: async (args) => {
                    const { prompt, model_version, face_limit, texture, pbr } = args;
                    
                    if (!this.apiKey) {
                        return { success: false, error: "TRIPO3D_API_KEY not configured" };
                    }

                    try {
                        const payload = {
                            type: "text_to_model",
                            prompt,
                            model_version,
                            face_limit,
                            texture,
                            pbr
                        };

                        const resp = await axios.post(`${this.apiBase}/task`, payload, {
                            headers: this.getHeaders()
                        });

                        if (resp.status === 200) {
                            this.logEvent && this.logEvent('tripo3d_task_created', { task_id: resp.data.data.task_id, type: 'text_to_model' });
                            return { 
                                success: true, 
                                task_id: resp.data.data.task_id,
                                message: "3D model generation task created successfully"
                            };
                        } else {
                            return { success: false, error: `HTTP Error: ${resp.status}` };
                        }
                    } catch (error) {
                        return { success: false, error: error.response?.data?.message || error.message || "Unknown error" };
                    }
                }
            },
            {
                title: "Generate 3D Model from Image",
                name: "tripo3d_generate_3d_from_image",
                description: "Generate a 3D model from an image URL",
                inputSchema: {
                    image_url: z.string().url(),
                    model_version: z.enum(["v2.0-20240919", "v1.4-20240625"]).optional().default("v2.0-20240919"),
                    face_limit: z.number().min(1000).max(100000).optional().default(10000),
                    texture: z.boolean().optional().default(true),
                    pbr: z.boolean().optional().default(false),
                    remove_background: z.boolean().optional().default(true)
                },
                handler: async (args) => {
                    const { image_url, model_version, face_limit, texture, pbr, remove_background } = args;
                    
                    if (!this.apiKey) {
                        return { success: false, error: "TRIPO3D_API_KEY not configured" };
                    }

                    try {
                        const payload = {
                            type: "image_to_model",
                            file: {
                                type: "url",
                                url: image_url
                            },
                            model_version,
                            face_limit,
                            texture,
                            pbr,
                            remove_background
                        };

                        const resp = await axios.post(`${this.apiBase}/task`, payload, {
                            headers: this.getHeaders()
                        });

                        if (resp.status === 200) {
                            this.logEvent && this.logEvent('tripo3d_task_created', { task_id: resp.data.data.task_id, type: 'image_to_model' });
                            return { 
                                success: true, 
                                task_id: resp.data.data.task_id,
                                message: "3D model generation task created successfully"
                            };
                        } else {
                            return { success: false, error: `HTTP Error: ${resp.status}` };
                        }
                    } catch (error) {
                        return { success: false, error: error.response?.data?.message || error.message || "Unknown error" };
                    }
                }
            },
            {
                title: "Refine 3D Model",
                name: "tripo3d_refine_3d_model",
                description: "Refine an existing 3D model with higher quality",
                inputSchema: {
                    original_task_id: z.string(),
                    face_limit: z.number().min(1000).max(500000).optional().default(50000),
                    texture: z.boolean().optional().default(true),
                    pbr: z.boolean().optional().default(false)
                },
                handler: async (args) => {
                    const { original_task_id, face_limit, texture, pbr } = args;
                    
                    if (!this.apiKey) {
                        return { success: false, error: "TRIPO3D_API_KEY not configured" };
                    }

                    try {
                        const payload = {
                            type: "refine_model",
                            original_task_id,
                            face_limit,
                            texture,
                            pbr
                        };

                        const resp = await axios.post(`${this.apiBase}/task`, payload, {
                            headers: this.getHeaders()
                        });

                        if (resp.status === 200) {
                            this.logEvent && this.logEvent('tripo3d_task_created', { task_id: resp.data.data.task_id, type: 'refine_model' });
                            return { 
                                success: true, 
                                task_id: resp.data.data.task_id,
                                message: "3D model refinement task created successfully"
                            };
                        } else {
                            return { success: false, error: `HTTP Error: ${resp.status}` };
                        }
                    } catch (error) {
                        return { success: false, error: error.response?.data?.message || error.message || "Unknown error" };
                    }
                }
            },
            {
                title: "Generate Multi-view Images",
                name: "tripo3d_generate_multiview_images",
                description: "Generate multi-view images from text or single image",
                inputSchema: {
                    prompt: z.string().optional(),
                    image_url: z.string().url().optional(),
                    model_version: z.enum(["v1.3-20240522"]).optional().default("v1.3-20240522"),
                    remove_background: z.boolean().optional().default(true)
                },
                handler: async (args) => {
                    const { prompt, image_url, model_version, remove_background } = args;
                    
                    if (!this.apiKey) {
                        return { success: false, error: "TRIPO3D_API_KEY not configured" };
                    }

                    if (!prompt && !image_url) {
                        return { success: false, error: "Either prompt or image_url must be provided" };
                    }

                    try {
                        let payload = {
                            type: "multiview_generation",
                            model_version
                        };

                        if (prompt && !image_url) {
                            payload.prompt = prompt;
                        } else if (image_url) {
                            payload.file = {
                                type: "url",
                                url: image_url
                            };
                            payload.remove_background = remove_background;
                        }

                        const resp = await axios.post(`${this.apiBase}/task`, payload, {
                            headers: this.getHeaders()
                        });

                        if (resp.status === 200) {
                            this.logEvent && this.logEvent('tripo3d_task_created', { task_id: resp.data.data.task_id, type: 'multiview_generation' });
                            return { 
                                success: true, 
                                task_id: resp.data.data.task_id,
                                message: "Multi-view image generation task created successfully"
                            };
                        } else {
                            return { success: false, error: `HTTP Error: ${resp.status}` };
                        }
                    } catch (error) {
                        return { success: false, error: error.response?.data?.message || error.message || "Unknown error" };
                    }
                }
            },
            {
                title: "Check Task Status",
                name: "tripo3d_check_task_status",
                description: "Check the status of a Tripo3D generation task",
                inputSchema: {
                    task_id: z.string()
                },
                handler: async (args) => {
                    const { task_id } = args;
                    
                    if (!this.apiKey) {
                        return { success: false, error: "TRIPO3D_API_KEY not configured" };
                    }

                    try {
                        const resp = await axios.get(`${this.apiBase}/task/${task_id}`, {
                            headers: this.getHeaders()
                        });

                        if (resp.status === 200) {
                            const taskData = resp.data.data;
                            this.logEvent && this.logEvent('tripo3d_task_checked', { task_id, status: taskData.status });
                            
                            return { 
                                success: true, 
                                task: taskData,
                                status: taskData.status,
                                progress: taskData.progress || 0,
                                result: taskData.result || null
                            };
                        } else {
                            return { success: false, error: `HTTP Error: ${resp.status}` };
                        }
                    } catch (error) {
                        return { success: false, error: error.response?.data?.message || error.message || "Unknown error" };
                    }
                }
            },
            {
                title: "Download Model",
                name: "tripo3d_download_model",
                description: "Get download URLs for a completed 3D model",
                inputSchema: {
                    task_id: z.string(),
                    format: z.enum(["glb", "fbx", "obj", "usd"]).optional().default("glb")
                },
                handler: async (args) => {
                    const { task_id, format } = args;
                    
                    if (!this.apiKey) {
                        return { success: false, error: "TRIPO3D_API_KEY not configured" };
                    }

                    try {
                        const resp = await axios.get(`${this.apiBase}/task/${task_id}`, {
                            headers: this.getHeaders()
                        });

                        if (resp.status === 200) {
                            const taskData = resp.data.data;
                            
                            if (taskData.status !== "success") {
                                return { success: false, error: `Task not completed. Current status: ${taskData.status}` };
                            }

                            const result = taskData.result;
                            if (!result || !result.model) {
                                return { success: false, error: "No model data available" };
                            }

                            const downloadUrl = result.model[format];
                            if (!downloadUrl) {
                                return { success: false, error: `Format ${format} not available. Available formats: ${Object.keys(result.model).join(', ')}` };
                            }

                            return { 
                                success: true, 
                                download_url: downloadUrl,
                                format: format,
                                available_formats: Object.keys(result.model),
                                model_info: result.model
                            };
                        } else {
                            return { success: false, error: `HTTP Error: ${resp.status}` };
                        }
                    } catch (error) {
                        return { success: false, error: error.response?.data?.message || error.message || "Unknown error" };
                    }
                }
            }
        ];
    }

    getResources() {
        return [
            {
                uri: 'tripo3d://instruction',
                name: "Tripo3D AI Instruction",
                description: `This resource provides detailed instructions for using the Tripo3D.ai API to generate 3D models and multi-view images through automated workflows.

Setup Requirements:
- Set TRIPO3D_API_KEY environment variable with your Tripo3D API key
- Ensure you have sufficient credits in your Tripo3D account

Available Generation Types:

1. Text-to-3D Model Generation:
   - Use 'generate_3d_from_text' with a descriptive text prompt
   - Options: model version, face limit (1K-100K), texture, PBR materials
   - Returns a task_id for tracking progress

2. Image-to-3D Model Generation:
   - Use 'generate_3d_from_image' with an image URL
   - Supports background removal and various quality settings
   - Best with clear, single-object images

3. Model Refinement:
   - Use 'refine_3d_model' to enhance existing models
   - Higher face limits available (up to 500K)
   - Improves geometry and texture quality

4. Multi-view Image Generation:
   - Use 'generate_multiview_images' for orthographic views
   - Can work from text prompts or single images
   - Useful for creating reference images or 2D assets

Workflow Process:
1. Create generation task using appropriate tool
2. Monitor progress with 'check_task_status'
3. Download completed models using 'download_model'
4. Available formats: GLB, FBX, OBJ, USD

Task Status Values:
- 'queued': Task is waiting to be processed
- 'running': Generation in progress
- 'success': Generation completed successfully
- 'failed': Generation failed (check error message)

Best Practices:
- Use descriptive, specific prompts for better results
- Start with lower face limits for faster generation
- Use refinement for production-quality models
- Check task status periodically during generation
- Consider PBR materials for realistic rendering`,
                mimeType: 'application/json'
            }
        ];
    }

    getPrompts() {
        return [
            {
                title: "Tripo3D Assistant",
                name: "tripo3d_assistant",
                description: "Assistant for generating 3D models and images using Tripo3D.ai",
                arguments: [
                    {
                        name: "prompt",
                        description: "Text description for generating 3D models or images",
                        required: false
                    },
                    {
                        name: "image_url",
                        description: "URL of image to convert to 3D model",
                        required: false
                    },
                    {
                        name: "task_id",
                        description: "Task ID to check status or download results",
                        required: false
                    },
                    {
                        name: "face_limit",
                        description: "Polygon count limit for 3D models (1000-100000)",
                        required: false
                    },
                    {
                        name: "format",
                        description: "Download format for 3D models (glb, fbx, obj, usd)",
                        required: false
                    }
                ],
                handler: async () => ({
                    description: "I can help you generate 3D models from text prompts or images, create multi-view images, refine existing models, and manage your Tripo3D tasks.",
                    messages: [
                        {
                            role: "user",
                            content: {
                                type: "text",
                                text: "Ask me to generate a 3D model from text or image, check task status, or download completed models."
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = Tripo3DAddon;