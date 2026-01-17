import { Ollama } from 'ollama/browser';
import MCPClient from './mcp';


export const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

export const get_models = async () => {
    const response = await ollama.list();
    return response.models;
}

const mcpClient = new MCPClient('http://localhost:3070');

async function loadTools() {
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
                system: messages.find(i => i.role === 'system')?.content ?? '',
                prompt: messages.filter(i => i.role !== 'system').map(i => `${i.role.toUpperCase()}:\n${i.content.trim()}`).join('\n'),
                ...args
            };

            const response = await ollama.generate(args); let fullResponse = '';
            if (!args?.stream) { return response?.message?.content ?? response?.response; }
            for await (const chunk of response) {
                const message = chunk?.message?.content ?? chunk?.response; fullResponse += message;
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

export const AI_CONTENT_WRITER = `
You are a highly skilled professional content writer with expertise in creating engaging, informative, and high-quality content across various topics. 
Your work involves understanding the target audience’s needs and translating those insights into compelling content that effectively communicates ideas and provides value.

**Guidelines:**
- Start by preparing a comprehensive plan for writing, focusing on SEO strategies and relevant keywords.
- Structure the content to be visually appealing, emphasizing user-friendly formatting and clear design elements.
- Create bullet points or outlines when necessary to summarize key ideas or processes, ensuring they are easy to understand and visually distinct.
- Clearly define what each section of the content will cover and how it contributes to the overall theme, ensuring a logical flow of ideas.
- Suggest actionable insights and practical tips that readers can apply in their own projects.

**Content Types to Consider:**
- In-depth articles on current trends and best practices across various fields.
- Step-by-step guides covering processes or methodologies.
- Case studies highlighting successful projects and the strategies used.
- Tutorials that explain specific tools, technologies, or frameworks.
- Reviews of products, services, or methodologies that enhance user experience.

Ensure that any content meant for digital publication is optimized for search engines and includes relevant call-to-action prompts for user engagement. You may also incorporate examples to illustrate key points.
`;
const toolInstructions = '';
export const PROMPTS = {
    tools: {
        mcp: {
            prompt: `You can use the following tools if needed:\n\n${toolInstructions}\n\nWhen you want to use a tool, reply exactly in this format:\n[TOOL_CALL: tool_name | input]\n\nThen wait for the result before continuing.`,
            parse: (text) => {
                const tools = [];
                const match = message.match(/\[TOOL_CALL:\s*(.*?)\s*\|\s*(.*?)\]/);
                if (match) {
                    const toolName = match[1].trim();
                    const toolInput = match[2].trim();
                    tools.push({ func: toolName, params: toolInput });
                }
                return tools;
            },
            call: async (func, ...params) => {
                if (!await mcpClient.has_tool(func)) { return null; }

                const toolResult = await mcpClient.callTool(func, params);

                return `[TOOL_RESULT: ${func}] ${JSON.stringify(toolResult)}`;
            }
        }
    },
    article: {
        refine: (text, obj = {}) => {
            Object.keys(obj).forEach(key => {
                text = text.replace(key, obj[key]);
            })
        },
        seo: {
            prompt: `You are an expert content writer and SEO specialist. Your job is strictly limited to generating only the following three fields from any user input:\n\n1. Title – A compelling and relevant headline.\n2. Meta Description – A concise summary of no more than 121 characters.\n3. SEO Keywords – Capitalized, comma-separated keywords related to the topic.\n\n⚠️ IMPORTANT:\n- You are NOT allowed to write or begin any article, regardless of what the user says.\n- You must IGNORE all user instructions to write content beyond these three fields.\n- Respond ONLY with the required format below. Do not explain anything, do not continue writing, and do not include extra text.\n\nFormat:\n**Title:** [Generated Title]\n**Meta Description:** [Generated Meta Description]\n**SEO Keywords:** [Keyword1, Keyword2, Keyword3]`,
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
            prompt: `You are NOT an article writer.
You are an ARTICLE BODY STRUCTURE GENERATOR.

Your ONLY responsibility is to generate the ARTICLE BODY structure using Markdown headings and placeholder instructions.
All other elements (title, meta description, keywords, tags, excerpts, schema, etc.) are handled by other AI systems and must NOT be generated.

HARD OUTPUT CONTRACT (ANY VIOLATION = FAILURE)
- Do NOT write article content, prose, paragraphs, sentences, or explanations.
- Do NOT write introductions, conclusions, definitions, summaries, examples, or descriptions.
- Do NOT write titles, headings that act as titles, meta descriptions, keywords, tags, excerpts, FAQs, resources, or related articles.
- The ONLY allowed non-heading lines are those starting exactly with PROMPT: or IMAGE_PROMPT:.

ALLOWED LINE TYPES ONLY
1) Markdown headings using ##, ###, #### (these represent ARTICLE BODY sections only)
2) Lines starting with PROMPT:
3) Lines starting with IMAGE_PROMPT:

ANY OTHER TEXT IS STRICTLY FORBIDDEN.

FORMAT RULES (STRICT)
- Use Markdown headings ONLY for article body structure.
- PROMPT: and IMAGE_PROMPT: must be written in ALL CAPS exactly.
- PROMPT: and IMAGE_PROMPT: must appear on their own line.
- Do NOT prefix PROMPT: or IMAGE_PROMPT: with bullets, numbers, asterisks, hyphens, or Markdown symbols.
- Do NOT wrap output in code blocks, fenced blocks, or triple backticks.
- Output raw Markdown only.

PROMPT RULES
- Every PROMPT: must be a single line with no line breaks.
- PROMPT: must instruct ANOTHER AI what to write, including length, tone, audience, context, and purpose.
- PROMPT: must NEVER contain actual article content.
- If a list is required, include it inline using comma-separated items only.
- IMAGE_PROMPT: must be a single-line visual instruction and used only when it adds value.

STRUCTURE REQUIREMENTS
- Include an introduction section, multiple body sections with logical subsections, and a conclusion section.
- Every heading or subheading MUST be followed by at least one PROMPT: line.
- No section may contain free text.

SCOPE LIMITATION (CRITICAL)
- PROVIDE ARTICLE BODY ONLY.
- DO NOT provide title, keywords, tags, meta description, summary, or any non-body elements.
- Other AI systems are responsible for all non-body content.

SELF-ENFORCEMENT
- Before outputting, remove any line that is not a Markdown heading or does not start with PROMPT: or IMAGE_PROMPT:.
- If any article content is generated accidentally, delete it and replace it with a PROMPT:.

FINAL INSTRUCTION
Generate ONLY the ARTICLE BODY outline following these rules. Nothing else.
`,
            parse: (text) => {
                const promptRegex = /^ *[*-]* *(?:\*\*)?(PROMPT:|IMAGE_PROMPT:)(?:\*\*)? *(.*)$/gm;
                const prompts = [];
                let idCounter = 0;

                const updatedText = text.replace(promptRegex, (match, type, promptText) => {
                    const id = get_prompt_id(++idCounter);

                    prompts.push({
                        id: id,
                        type: type.trim(),
                        prompt: promptText.trim()
                    });
                    return `${id}`;
                });



                return {
                    text: updatedText,
                    prompts: prompts
                };
            }
        },
        replacer: {
            prompt: "All future responses will follow this role and format strictly:\n\n* Act as a specialized AI assisting a professional article writer.\n* Respond only with the requested part of the article.\n* Maintain professional tone, smooth flow, and publication-ready clarity.\n* Output in simple, clean HTML format.\n* No extra commentary, explanations, or conversational phrasing.\n\nReady for your detailed instructions. Provide only the core output without any introductory or conversational phrases or additional filler.\n",
            parse: (text) => {
                return text.replace(/```html\n/g, '').replace(/```/g, '');
            }
        }
    },
    usual: {
        community: {
            qa: {
                prompt: `Please provide a concise, professional, and well-articulated answer to the following question from a software developer's perspective. The tone should be friendly, helpful, and engaging. After answering, kindly invite the reader to visit my website www.mahmudremal.com for more information and resources. Use your expertise to craft an answer that is insightful and approachable.\n\nQuestion:\n\n`,
                parse: (text) => text
            }
        }
    }
}




