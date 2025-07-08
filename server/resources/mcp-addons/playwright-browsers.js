const { chromium, firefox, webkit } = require('playwright');
const { z } = require('zod');

class PlaywrightAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = 'playwright';
    }

    async init() {
        return true;
    }

    async _launchBrowser(browserName = 'chromium', headless = true) {
        switch (browserName) {
            case 'chromium': return await chromium.launch({ headless });
            case 'firefox': return await firefox.launch({ headless });
            case 'webkit': return await webkit.launch({ headless });
            default: throw new Error('Unsupported browser');
        }
    }

    getTools() {
        return [
            {
                title: 'Navigate and Get Page Content',
                name: 'navigate_get_content',
                description: 'Launch browser, navigate to URL, return full page HTML content',
                inputSchema: {
                    url: z.string().url(),
                    browser: z.enum(['chromium', 'firefox', 'webkit']).optional().default('chromium'),
                    headless: z.boolean().optional().default(true),
                    timeout: z.number().int().optional().default(30000)
                },
                handler: async ({ url, browser, headless, timeout }) => {
                    const browserInstance = await this._launchBrowser(browser, headless);
                    const context = await browserInstance.newContext();
                    const page = await context.newPage();
                    await page.goto(url, { timeout, waitUntil: 'load' });
                    const content = await page.content();
                    await browserInstance.close();
                    return { url, content };
                }
            },
            {
                title: 'Click Element',
                name: 'click_element',
                description: 'Click an element on a page specified by selector',
                inputSchema: {
                    url: z.string().url(),
                    selector: z.string(),
                    browser: z.enum(['chromium', 'firefox', 'webkit']).optional().default('chromium'),
                    headless: z.boolean().optional().default(true),
                    timeout: z.number().int().optional().default(30000)
                },
                handler: async ({ url, selector, browser, headless, timeout }) => {
                    const browserInstance = await this._launchBrowser(browser, headless);
                    const context = await browserInstance.newContext();
                    const page = await context.newPage();
                    await page.goto(url, { timeout, waitUntil: 'load' });
                    await page.click(selector, { timeout });
                    await browserInstance.close();
                    return { url, clickedSelector: selector, success: true };
                }
            },
            {
                title: 'Extract Text Content',
                name: 'extract_text',
                description: 'Extract text content of element by selector',
                inputSchema: {
                    url: z.string().url(),
                    selector: z.string(),
                    browser: z.enum(['chromium', 'firefox', 'webkit']).optional().default('chromium'),
                    headless: z.boolean().optional().default(true),
                    timeout: z.number().int().optional().default(30000)
                },
                handler: async ({ url, selector, browser, headless, timeout }) => {
                    const browserInstance = await this._launchBrowser(browser, headless);
                    const context = await browserInstance.newContext();
                    const page = await context.newPage();
                    await page.goto(url, { timeout, waitUntil: 'load' });
                    const element = await page.$(selector);
                    if (!element) {
                        await browserInstance.close();
                        return { error: 'Element not found' };
                    }
                    const text = await element.textContent();
                    await browserInstance.close();
                    return { url, selector, text: text?.trim() };
                }
            },
            {
                title: 'Fill Form Fields',
                name: 'fill_form',
                description: 'Fill multiple form fields and submit a form',
                inputSchema: {
                    url: z.string().url(),
                    fields: z.record(z.string()), // key = selector, value = string to fill
                    submitSelector: z.string().optional(),
                    browser: z.enum(['chromium', 'firefox', 'webkit']).optional().default('chromium'),
                    headless: z.boolean().optional().default(true),
                    timeout: z.number().int().optional().default(30000)
                },
                handler: async ({ url, fields, submitSelector, browser, headless, timeout }) => {
                    const browserInstance = await this._launchBrowser(browser, headless);
                    const context = await browserInstance.newContext();
                    const page = await context.newPage();
                    await page.goto(url, { timeout, waitUntil: 'load' });
                    for (const [selector, value] of Object.entries(fields)) {
                        await page.fill(selector, value);
                    }
                    if (submitSelector) {
                        await page.click(submitSelector);
                    }
                    await browserInstance.close();
                    return { url, filledFields: Object.keys(fields) };
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
                title: 'Playwright Automation Helper',
                name: 'playwright_helper',
                description: 'Assist with browser automation tasks using Playwright',
                arguments: [
                    {
                        name: 'task',
                        description: 'Describe the automation task',
                        required: false
                    }
                ],
                handler: async () => ({
                    description: 'I can help you navigate pages, click elements, extract text, and fill forms.',
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: 'Ask me to browse, scrape, or automate web tasks using Playwright.'
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = PlaywrightAddon;