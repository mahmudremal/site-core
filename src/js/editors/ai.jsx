import { Ollama } from 'ollama/browser';
import MCPClient from './mcp';
import { marked } from "marked";


export const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

export const get_models = async () => {
    const response = await ollama.list();
    return response.models;
}

const mcpClient = new MCPClient('http://localhost:3070');

async function loadTools() {
    return {};
    // skip these tools
    const toolsData = await mcpClient.getTools();

    const tools = {};
    for (const tool of toolsData) {
        tools[tool.name] = {
            description: tool.description ?? '',
            parameters: tool.parameters ?? tool.parameter ?? 'input'
        };
    }

    return tools;
}


export const chat = (messages = [], onChunk = null, args = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            args = {
                stream: true,
                model: 'gemma3:1b',
                messages: messages,
                ...args
            };

            const response = await ollama.chat(args); let fullResponse = '';
            if (!args?.stream) { return response?.message?.content; }
            for await (const chunk of response) {
                const message = chunk?.message?.content || "";
                fullResponse += message;
                if (message && typeof onChunk === 'function') { onChunk(message); }
            }
            resolve(fullResponse);
        } catch (error) {
            reject(error);
        }
    });
};


export const get_prompt_id = (id) => {
    return `@@PROMPT_${id}@@`;
}

class Prompts {
    constructor() {
        this.config = window._aieditor_config || {};
        this.tools = {
            mcp: {
                prompt: `You can use the following tools if needed:
{{mcp_tools}}
When you want to use a tool, reply EXACTLY in this format and NOTHING ELSE:
[TOOL_CALL: tool_name | { "arg1": "value" }]
Do NOT include any conversational filler, explanation, or text before/after the tool call.`,
                parse: (text) => {
                    const tools = [];
                    const matches = text.matchAll(/\[TOOL_CALL:\s*(.*?)\s*\|\s*(\{.*?\})\]/g);
                    for (const match of matches) {
                        tools.push({ func: match[1].trim(), params: [JSON.parse(match[2].trim())] });
                    }
                    return tools;
                },
                call: async (func, ...params) => {
                    if (!await mcpClient.has_tool(func)) { return `[TOOL_RESULT: ERROR] Tool ${func} not found.`; }
                    const toolResult = await mcpClient.callTool(func, params[0]);
                    return `[TOOL_RESULT: ${func}] ${JSON.stringify(toolResult)}`;
                }
            },
            inwebtools: {
                prompt: `You can search site content using these functions:
- search_posts(keyword, post_type): Search posts or pages. post_type can be 'post', 'page', or any CPT.
- search_terms(keyword, taxonomy): Search categories or tags. taxonomy can be 'category', 'post_tag', etc.`,
                parse: (text) => {
                    const tools = [];
                    const matches = text.matchAll(/\[TOOL_CALL:\s*(\w+).*?[\-\(\:\|]\s*(.*?)[\)\]]/gi);
                    for (const match of matches) {
                        const func = match[1].toLowerCase();
                        if (!['search_posts', 'search_terms'].includes(func)) continue;
                        let args = match[2].trim().split(/[\|:\-]/);
                        if (args.length === 1) {
                            args = match[2].trim().split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                        }
                        const params = args.map(p => p.trim().replace(/^["']|["']$/g, '').trim()).filter(i => i !== '');
                        tools.push({ func, params });
                    }
                    return tools;
                },
                call: async (func, ...params) => {
                    const keyword = params[0] || '';
                    const type = params[1] || (func === 'search_posts' ? 'post' : 'category');
                    const endpoint = func === 'search_posts' ? 'search/posts' : 'search/terms';
                    const paramKey = func === 'search_posts' ? 'post_type' : 'taxonomy';

                    try {
                        const response = await fetch(`${this.config._rest}/${endpoint}?s=${encodeURIComponent(keyword)}&${paramKey}=${encodeURIComponent(type)}`, {
                            // headers: { 'X-WP-Nonce': this.config._nonce }
                        });
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        const data = await response.json();
                        return `[TOOL_RESULT: ${func}] ${JSON.stringify(data)}`.slice(0, 10000);
                    } catch (error) {
                        return `[TOOL_RESULT: ERROR] ${error.message}`;
                    }
                }
            },
            browser: {
                prompt: `You can control the browser for research (e.g. Google Keyword Planner, Google Search) using these functions:
- google_search(query): Performs a Google search.
- open_website(url): Opens a specific URL.`,
                parse: (text) => {
                    const tools = [];
                    const matches = text.matchAll(/\[TOOL_CALL:\s*(\w+).*?[\-\(\:\|]\s*(.*?)[\)\]]/gi);
                    for (const match of matches) {
                        const func = match[1].toLowerCase();
                        if (!['google_search', 'open_website'].includes(func)) continue;
                        const params = match[2].trim().split(/[\|:\-]/).map(p => p.trim().replace(/^["']|["']$/g, '').trim()).filter(i => i !== '');
                        tools.push({ func, params });
                    }
                    return tools;
                },
                call: async (func, ...params) => {
                    return new Promise((resolve) => {
                        const id = Math.random().toString(36).substr(2, 9);
                        const event = new CustomEvent('ai_browser_tool', {
                            detail: { func, params, id }
                        });

                        const handler = (e) => {
                            if (e.detail.id === id) {
                                const { data = null } = e.detail.result
                                window.removeEventListener('ai_browser_tool_result', handler);
                                resolve(`[TOOL_RESULT: ${func}] ${data}`);
                            }
                        };

                        window.addEventListener('ai_browser_tool_result', handler);
                        window.dispatchEvent(event);

                        // Timeout if extension doesn't respond
                        setTimeout(() => {
                            window.removeEventListener('ai_browser_tool_result', handler);
                            resolve(`[TOOL_RESULT: ERROR] something went wrong or found nothing.`);
                        }, 10000);
                    });
                }
            }
        };

        this.article = {
            refine: (text, obj = {}) => {
                Object.keys(obj).forEach(key => {
                    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    text = text.replace(new RegExp(escapedKey, 'g'), obj[key]);
                });
                return text;
            },
            seo: {
                prompt: `You are an expert content writer and SEO specialist. Your mission is to generate the most effective SEO fields for a given topic.

### Research Phase:
Before finalizing the fields, you are ENCOURAGED to:
1. Use 'google_search' to research the current trends and high-ranking titles for the topic.
2. Use 'search_terms' (taxonomy: 'post_tag' or 'category') to see which tags and categories already exist on our site to maintain consistency.
3. Use 'search_posts' to see what related content we've already published.

### Final Output Requirements:
When you have completed your research, generate ONLY these three fields:
1. Title - A compelling and relevant headline.
2. Meta Description - A concise summary (max 121 chars).
3. SEO Keywords - Capitalized, comma-separated keywords.

⚠️ IMPORTANT: Respond ONLY with the final format below when ready. Do not explain your research in the final response.

Format:
**Title:** [Generated Title]
**Meta Description:** [Generated Meta Description]
**SEO Keywords:** [Keyword1, Keyword2, Keyword3]`,
                parse: (text) => {
                    const lines = text.split('\n').filter(line => line.trim() !== '');
                    const result = {
                        title: null,
                        meta_desc: null,
                        keywords: []
                    };
                    lines.forEach((line) => {
                        line = line.startsWith('- ') ? line.substring(2) : line;
                        if (line.startsWith('**Title:** ')) {
                            result.title = line.substring(11).trim();
                        } else if (line.startsWith('**Meta Description:** ')) {
                            result.meta_desc = line.substring(22).trim();
                        } else if (line.startsWith('**SEO Keywords:** ')) {
                            result.keywords = line.substring(18).trim().split(',').map(i => i.trim());
                        }
                    });

                    return result;
                }
            },
            planner: {
                prompt: `### Role: Master Content Architect & SEO Strategist
Your objective is to design a high-converting, award-winning article structure. 

### Research Phase:
You SHOULD use the available tools to research the topic deeply:
- Use 'google_search' to find top-ranking competitors and their structures.
- Use 'search_terms' to find relevant internal tags that should be mentioned or linked.
- Use 'search_posts' to find related content to link to.

### Architecture Guidelines:
1. **Psychological Flow**: Guide the reader from awareness to action (AIDA).
2. **Readability**: Break down complex ideas into segments.
3. **Narrative Continuity**: Plan each section to flow logically into the next. Each section must have a clear purpose that contributes to the overall narrative.
4. **Engagement**: Strategically place visual cues (IMAGE_PROMPT).

### Output Constraints:
- Use **PROMPT:** for content sections. Each prompt MUST be a detailed instruction explaining EXACTLY what to cover, the tone to use, and how it connects to the previous/next points.
- Use **IMAGE_PROMPT:** for visual assets (Format: Description || Search Keyword).
- Strictly No Conversational Filler in the final structure.

### Context:
User Intent: {{user_prompt}}
Target Title: {{title}}
Target Meta Description: {{meta_desc}}
Target Keywords: {{keywords}}
`,
                parse: (text) => {
                    const promptRegex = /^(?:[*-]*\s*(?:\*\*)?(PROMPT:|IMAGE_PROMPT:)(?:\*\*)?\s*(.*)|(.*:))$/gm;
                    const prompts = [];
                    let idCounter = 0;

                    const updatedText = text.replace(promptRegex, (match, type, promptText, title) => {
                        if (title && !type) return `### ${title.trim()}`;

                        const id = get_prompt_id(++idCounter);
                        let finalPrompt = promptText.trim();
                        let searchKeyword = '';

                        if (type === 'IMAGE_PROMPT:') {
                            const parts = finalPrompt.split('||');
                            if (parts.length > 1) {
                                finalPrompt = parts[0].trim();
                                searchKeyword = parts[1].trim();
                            }
                        }

                        prompts.push({
                            id: id,
                            prompt: finalPrompt,
                            search: searchKeyword,
                            type: type.slice(0, -1).split('_').at(0).trim().toLowerCase()
                        });
                        return id;
                    });

                    return { text: updatedText, prompts };
                }
            },
            replacer: {
                prompt: `### Role: Section Artisan & Specialized Expert
Act as a elite content writer. Your mission is to generate ONLY the specific section content requested. You are expanding a single component of a larger article.

### Project Context:
- **Article Title**: {{title}}
- **Target Keywords**: {{keywords}}
- **Full Article Blueprint**:
{{plan}}

### Current Focus:
- **Instruction**: {{current_section}}
- **Context (What was written before)**: {{previous_content}}

### Strict Scope:
- **Single Section Focus**: Do NOT write the entire article.
- **Narrative Continuity**: Ensure a smooth, logical transition from the previous content. Maintain the tone and style established.
- **No Overlap**: Do not repeat points already covered in the previous sections.
- **Flow**: Start naturally as if it's the next paragraph of the ongoing article.

### Style & Format:
- **Tone**: Authoritative, professional, and engaging.
- **Output**: Clean, professional **Markdown** ONLY.
- **Cleanliness**: No <html> tags, no conversational filler, no intro/outro ("Here is your section...", "I hope this helps...").
- **Immediacy**: Start directly with the content.`,
                parse: (text) => {
                    // Extract Markdown from within code blocks if present, or take full text
                    let cleanText = text.replace(/\[TOOL_CALL:.*?\]/gis, '').replace(/\[TOOL_RESULT:.*?\]/gis, '').trim();
                    const mdMatch = cleanText.match(/```(?:markdown)?\n?([\s\S]*?)```/i);
                    if (mdMatch) cleanText = mdMatch[1];
                    return cleanText.trim();
                }
            }
        };

        this.usual = {
            community: {
                qa: {
                    prompt: `Please provide a concise, professional, and well-articulated answer to the following question from a software developer's perspective. The tone should be friendly, helpful, and engaging. After answering, kindly invite the reader to visit my website www.mahmudremal.com for more information and resources. Use your expertise to craft an answer that is insightful and approachable.\n\nQuestion:\n\n`,
                    parse: (text) => text
                }
            }
        };
    }

    async getToolPrompt() {
        const mcpTools = await loadTools();
        const mcpToolsList = Object.entries(mcpTools).map(([name, tool]) => `- ${name}: ${tool.description}`).join('\n');

        let prompt = `### TOOL USAGE RULES:
1. When you need to gather information, research, or perform an action, use a tool.
2. Output ONLY the [TOOL_CALL: ...] block. NEVER add descriptions, headers, or dashes to the function name or format.
3. Once you receive the [TOOL_RESULT: ...], proceed with your task or call another tool.
4. If you have enough information, generate the final content directly.

` + this.tools.mcp.prompt.replace('{{mcp_tools}}', mcpToolsList);
        prompt += '\n\n' + this.tools.inwebtools.prompt;
        prompt += '\n\n' + this.tools.browser.prompt;
        return prompt;
    }

    async run(messages = [], onChunk = null, args = {}) {
        let currentMessages = [...messages];
        const toolPrompt = await this.getToolPrompt();
        const onStatus = args.onStatus || (() => { });

        let systemIdx = currentMessages.findIndex(m => m.role === 'system');
        if (systemIdx > -1) {
            currentMessages[systemIdx].content += `\n\n${toolPrompt}`;
        } else {
            currentMessages.unshift({ role: 'system', content: toolPrompt });
        }

        while (true) {
            let fullResponse = '';
            let buffer = '';
            const response = await chat(currentMessages, (chunk) => {
                fullResponse += chunk;
                buffer += chunk;

                // Stop UI update if we see the start of a tool call
                if (buffer.includes('[TOOL_CALL:')) {
                    const parts = buffer.split('[TOOL_CALL:');
                    if (parts[0] && onChunk) onChunk(parts[0]);
                    buffer = '[TOOL_CALL:' + parts.slice(1).join('[TOOL_CALL:');
                } else if (!buffer.startsWith('[TOOL_CALL:') && onChunk) {
                    onChunk(buffer);
                    buffer = '';
                }
            }, args);

            currentMessages.push({ role: 'assistant', content: fullResponse });

            let detectedTools = [];
            for (const toolKey in this.tools) {
                if (typeof this.tools[toolKey].parse !== 'function') continue;
                const parsed = this.tools[toolKey].parse(fullResponse);
                if (parsed && parsed.length > 0) {
                    detectedTools.push({ key: toolKey, tools: parsed });
                }
            }

            if (detectedTools.length === 0) {
                return fullResponse;
            }

            onStatus(`Executing research tools...`);
            for (const entry of detectedTools) {
                for (const tool of entry.tools) {
                    onStatus(`Calling ${tool.func}(${tool.params[0]})...`);
                    const result = await this.tools[entry.key].call(tool.func, ...tool.params);
                    currentMessages.push({ role: 'user', content: result });
                }
            }
        }
    }
}

export default new Prompts();

