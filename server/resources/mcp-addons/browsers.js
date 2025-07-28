const { chromium, firefox, webkit } = require('playwright');
const { z } = require('zod');

class BrowsersAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = 'playwright';
    }

    async init() {
        return true;
    }

    async _launch(browser = 'chromium', headless = true) {
        const browsers = { chromium, firefox, webkit };
        return await browsers[browser].launch({ headless });
    }

    _compress(content, max = 6000) {
        if (!content) return '';
        content = content
            .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        return content.length > max ? content.substring(0, max) + '...[truncated]' : content;
    }

    async _execute(url, browserType, headless, timeout, callback) {
        const browser = await this._launch(browserType, headless);
        const page = await browser.newPage();
        try {
            await page.goto(url, { timeout, waitUntil: 'domcontentloaded' });
            const result = await callback(page);
            await browser.close();
            return result;
        } catch (error) {
            await browser.close();
            return { error: error.message, url };
        }
    }

    getTools() {
        return [
            {
                title: 'Navigate & Extract',
                name: 'brwsr_get',
                description: 'Go to URL, get page/element content with smart compression',
                inputSchema: {
                    url: z.string().url(),
                    sel: z.string().optional(),
                    mode: z.enum(['text', 'html', 'full']).optional().default('text'),
                    browser: z.enum(['chromium', 'firefox', 'webkit']).optional().default('chromium'),
                    headless: z.boolean().optional().default(true),
                    timeout: z.number().int().optional().default(20000)
                },
                handler: async ({ url, sel, mode, browser, headless, timeout }) => {
                    return this._execute(url, browser, headless, timeout, async (page) => {
                        let content;
                        if (sel) {
                            const el = await page.$(sel);
                            if (!el) return { error: 'Element not found', sel };
                            content = mode === 'html' ? await el.innerHTML() : await el.textContent();
                        } else {
                            content = mode === 'full' ? await page.content() : await page.textContent();
                        }
                        return { url, content: this._compress(content), sel };
                    });
                }
            },
            {
                title: 'Element Actions',
                name: 'brwsr_do',
                description: 'Click, fill, select elements or get element details',
                inputSchema: {
                    url: z.string().url(),
                    act: z.enum(['click', 'fill', 'select', 'info', 'wait']),
                    sel: z.string().optional(),
                    val: z.string().optional(),
                    ms: z.number().int().optional().default(1000),
                    browser: z.enum(['chromium', 'firefox', 'webkit']).optional().default('chromium'),
                    headless: z.boolean().optional().default(true),
                    timeout: z.number().int().optional().default(20000)
                },
                handler: async ({ url, act, sel, val, ms, browser, headless, timeout }) => {
                    return this._execute(url, browser, headless, timeout, async (page) => {
                        if (act === 'wait') {
                            await page.waitForTimeout(ms);
                            return { act, success: true };
                        }

                        const el = await page.$(sel);
                        if (!el) return { error: 'Element not found', sel };

                        const result = { url, act, sel };
                        switch (act) {
                            case 'click':
                                await el.click();
                                result.success = true;
                                break;
                            case 'fill':
                                await el.fill(val || '');
                                result.success = true;
                                break;
                            case 'select':
                                await el.selectOption(val);
                                result.success = true;
                                break;
                            case 'info':
                                const tag = await el.evaluate(e => e.tagName.toLowerCase());
                                const text = await el.textContent();
                                const attrs = await el.evaluate(e => Object.fromEntries([...e.attributes].map(a => [a.name, a.value])));
                                result.info = { tag, text: text?.trim(), attrs };
                                break;
                        }
                        return result;
                    });
                }
            },
            {
                title: 'Multi Actions',
                name: 'brwsr_chain',
                description: 'Execute multiple actions in sequence on same page session',
                inputSchema: {
                    url: z.string().url(),
                    steps: z.array(z.object({
                        act: z.enum(['click', 'fill', 'select', 'wait', 'get']),
                        sel: z.string().optional(),
                        val: z.string().optional(),
                        ms: z.number().int().optional()
                    })),
                    browser: z.enum(['chromium', 'firefox', 'webkit']).optional().default('chromium'),
                    headless: z.boolean().optional().default(true),
                    timeout: z.number().int().optional().default(30000)
                },
                handler: async ({ url, steps, browser, headless, timeout }) => {
                    return this._execute(url, browser, headless, timeout, async (page) => {
                        const results = [];
                        for (let i = 0; i < steps.length; i++) {
                            const step = steps[i];
                            const result = { i, act: step.act };
                            
                            try {
                                switch (step.act) {
                                    case 'click':
                                        await page.click(step.sel);
                                        result.ok = true;
                                        break;
                                    case 'fill':
                                        await page.fill(step.sel, step.val || '');
                                        result.ok = true;
                                        break;
                                    case 'select':
                                        await page.selectOption(step.sel, step.val);
                                        result.ok = true;
                                        break;
                                    case 'wait':
                                        await page.waitForTimeout(step.ms || 1000);
                                        result.ok = true;
                                        break;
                                    case 'get':
                                        const el = await page.$(step.sel);
                                        if (el) {
                                            result.data = this._compress(await el.textContent());
                                            result.ok = true;
                                        } else {
                                            result.error = 'not found';
                                        }
                                        break;
                                }
                            } catch (e) {
                                result.error = e.message;
                            }
                            
                            results.push(result);
                            if (result.error && step.act !== 'get') break;
                        }
                        return { url, results, completed: results.length };
                    });
                }
            },
            {
                title: 'Smart Scan',
                name: 'brwsr_scan',
                description: 'Intelligently scan page for interactive elements, forms, links',
                inputSchema: {
                    url: z.string().url(),
                    focus: z.enum(['forms', 'links', 'buttons', 'inputs', 'all']).optional().default('all'),
                    limit: z.number().int().optional().default(20),
                    browser: z.enum(['chromium', 'firefox', 'webkit']).optional().default('chromium'),
                    headless: z.boolean().optional().default(true),
                    timeout: z.number().int().optional().default(20000)
                },
                handler: async ({ url, focus, limit, browser, headless, timeout }) => {
                    return this._execute(url, browser, headless, timeout, async (page) => {
                        const selectors = {
                            forms: 'form',
                            links: 'a[href]',
                            buttons: 'button, input[type="button"], input[type="submit"]',
                            inputs: 'input, textarea, select',
                            all: 'a[href], button, input, textarea, select, form'
                        };

                        const elements = await page.$$(selectors[focus]);
                        const scanned = [];

                        for (let i = 0; i < Math.min(elements.length, limit); i++) {
                            const el = elements[i];
                            const tag = await el.evaluate(e => e.tagName.toLowerCase());
                            const text = await el.textContent();
                            const attrs = await el.evaluate(e => {
                                const a = {};
                                ['id', 'class', 'name', 'type', 'href', 'value', 'placeholder'].forEach(attr => {
                                    if (e.hasAttribute(attr)) a[attr] = e.getAttribute(attr);
                                });
                                return a;
                            });
                            
                            scanned.push({
                                tag,
                                text: text?.trim().substring(0, 100) || '',
                                attrs,
                                selector: await el.evaluate(e => {
                                    if (e.id) return `#${e.id}`;
                                    if (e.name) return `[name="${e.name}"]`;
                                    if (e.className) return `.${e.className.split(' ')[0]}`;
                                    return e.tagName.toLowerCase();
                                })
                            });
                        }

                        return { url, focus, found: scanned.length, elements: scanned };
                    });
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
                title: 'Browser Agent',
                name: 'browser_agent',
                description: 'Autonomous web browsing and interaction capabilities',
                arguments: [
                    {
                        name: 'objective',
                        description: 'What you want to accomplish on the web',
                        required: true
                    },
                    {
                        name: 'url',
                        description: 'Starting URL (optional)',
                        required: false
                    }
                ],
                handler: async ({ objective, url }) => ({
                    description: 'Advanced browser agent with intelligent scanning and chaining capabilities',
                    messages: [
                        {
                            role: 'system',
                            content: {
                                type: 'text',
                                text: `You are an advanced browser agent with these capabilities:\n\nTOOLS AVAILABLE:\n• brwsr_get - Navigate and extract content (compressed automatically)\n• brwsr_do - Single element actions (click, fill, select, info, wait)  \n• brwsr_chain - Execute multiple actions in sequence efficiently\n• brwsr_scan - Intelligently discover page elements and structure\n\nAGENT BEHAVIOR:\n• Always start with brwsr_scan to understand page structure\n• Use brwsr_chain for multi-step workflows (login, forms, navigation sequences)\n• Extract only relevant content using selectors to minimize tokens\n• Handle errors gracefully and adapt strategy\n• Think step-by-step: scan → plan → execute → verify\n• Use compressed content mode by default for efficiency\n\nBEST PRACTICES:\n• Prefer CSS selectors: #id, .class, [attribute="value"]\n• Chain related actions together to maintain page session  \n• Extract specific elements rather than full page content\n• Use wait actions between interactions when needed\n• Validate results before proceeding to next step\n\nOBJECTIVE: ${objective}\n${url ? `STARTING URL: ${url}` : 'STARTING: Will need URL to begin'}\n\nBegin by scanning the target page to understand its structure, then execute your plan efficiently.`
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = BrowsersAddon;