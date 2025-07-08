const { z } = require("zod");
const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

class ScreenshotOneAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = "screenshotone";
        this.downloadDir = path.resolve('./screenshots');
    }

    async init() {
        await fs.mkdir(this.downloadDir, { recursive: true });
        return true;
    }

    getTools() {
        return [
            {
                title: "Take Screenshot",
                name: "take_screenshot",
                description: "Capture a screenshot of a URL with optional parameters and download it",
                inputSchema: {
                    url: z.string().url(),
                    block_cookie_banners: z.boolean().optional().default(false),
                    viewport_device: z.string().optional(),
                    dark_mode: z.boolean().optional().default(false),
                    full_page: z.boolean().optional().default(false)
                },
                handler: async (args) => {
                    const {
                        url,
                        block_cookie_banners = false,
                        viewport_device,
                        dark_mode = false,
                        full_page = false
                    } = args;

                    const params = new URLSearchParams({
                        url,
                        block_cookie_banners: block_cookie_banners.toString(),
                        dark_mode: dark_mode.toString(),
                        full_page: full_page.toString()
                    });
                    if (viewport_device) params.set("viewport_device", viewport_device);

                    const requestUrl = `https://api.screenshotone.com/take?${params.toString()}`;

                    try {
                        const response = await axios.get(requestUrl, { responseType: "arraybuffer" });
                        if (response.status !== 200) {
                            return { success: false, error: `HTTP Error: ${response.status}` };
                        }

                        const contentType = response.headers["content-type"] || "";
                        let ext = "png";
                        if (contentType.includes("jpeg") || contentType.includes("jpg")) ext = "jpg";
                        else if (contentType.includes("webp")) ext = "webp";

                        const fileName = `screenshot_${Date.now()}.${ext}`;
                        const filePath = path.join(this.downloadDir, fileName);
                        await fs.writeFile(filePath, response.data);

                        return {
                            success: true,
                            fileName,
                            filePath,
                            message: "Screenshot captured and saved successfully."
                        };
                    } catch (error) {
                        return { success: false, error: error.message || "Unknown error" };
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
                title: "ScreenshotOne Assistant",
                name: "screenshotone_assistant",
                description: "Helper for taking webpage screenshots",
                arguments: [
                    {
                        name: "url",
                        description: "URL of the webpage to capture",
                        required: true
                    },
                    {
                        name: "viewport_device",
                        description: "Device viewport to simulate (e.g. iphone_x)",
                        required: false
                    },
                    {
                        name: "block_cookie_banners",
                        description: "Option to block cookie banners",
                        required: false
                    },
                    {
                        name: "dark_mode",
                        description: "Capture screenshot in dark mode",
                        required: false
                    },
                    {
                        name: "full_page",
                        description: "Capture the full page",
                        required: false
                    }
                ],
                handler: async () => ({
                    description: "I can capture screenshots of webpages with customization options.",
                    messages: [
                        {
                            role: "user",
                            content: {
                                type: "text",
                                text: "Provide URL and optional settings to capture a screenshot."
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = ScreenshotOneAddon;