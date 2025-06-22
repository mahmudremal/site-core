import { Ollama } from 'ollama/browser';
import MCPClient from './mcp';

export const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

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
                system: messages.find(i => i.role === 'system')?.content??'',
                prompt: messages.filter(i => i.role !== 'system').map(i => `${i.role.toUpperCase()}:\n${i.content.trim()}`).join('\n'),
                ...args
            };
            // const response = await ollama.chat({model: 'gemma3:1b', messages: messages, stream: true, ...args});
            const response = await ollama.generate(args);let fullResponse = '';
            if (!args?.stream) {return response?.message?.content??response?.response;}
            for await (const chunk of response) {
                const message = chunk?.message?.content??chunk?.response;fullResponse += message;
                if (message && typeof onChunk === 'function') {onChunk(message);}
                // 
            }
            // console.log('Streaming finished');
            resolve(fullResponse); // Resolve the promise with the full response
        } catch (error) {
            // console.error('Error during streaming:', error);
            reject(error); // Reject the promise if there's an error
        }
    });
};
// chat(newMessages, (chunk) => console.log('Received chunk:', chunk)).then(fullResponse => console.log('Final Response:', fullResponse)).catch(error => console.error('Error:', error));

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
                    tools.push({func: toolName, params: toolInput});
                }
                return tools;
            },
            call: async (func, ...params) => {
                if (!await mcpClient.has_tool(func)) {return null;}
                
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
                // console.log(text, result);
                return result;
            }
        },
        planner: {
            prompt: "You are a specialized AI for article planning. Your task is to generate a structured outline for an article body using only content-building prompts.\n\nYou will produce a **Markdown-formatted article structure**.\n\nfor suppose for\n## Main Heading\n**PROMPT:** a AI prompt instrcution in detailed (but in one line, no line break). this prompt should include a clear instruction what to write/do, including text length, context, way of talking.\n### SubHeading\n**PROMPT:** ...\n\n### RULES\n- Do **not** write content — generate only `PROMPT:` and `IMAGE_PROMPT:` placeholders. Detailed prompt. Regarding your prompt aother AI will write those part seperately. If you want to add a list in prompt, you must put them in line (comma seperated) but in any condition, never break line on prompt.\n- All section headers must follow proper Markdown hierarchy (`##`, `###`, etc.).\n- Use `PROMPT:` for text content and `IMAGE_PROMPT:` for visual suggestions.\n- Ensure modular, expandable output to support content generation in the next stage.\n- You are only responsible for the ARTICLE BODY. DON'T write ARTICLE TITLE or other things like metadata, tags, keywords as long as they are already decided and will provide you via user prompt.\n- You are not responsibe to write content but you'll write heading, prompt placeholder and if anywhere need to put even a list, you'll write a prompt.\n",
            parse: (text) => {
                const promptRegex = /^ *(?:\*\*)?(PROMPT:|IMAGE_PROMPT:)(?:\*\*)? *(.*)$/gm;
                const prompts = [];
                let idCounter = 0;

                const updatedText = text.replace(promptRegex, (match, type, promptText) => {
                    const id = get_prompt_id(++idCounter);
                    // promptText = promptText.substring(type == 'PROMPT:' ? 7 : 13);
                    prompts.push({
                        id: id,
                        type: type.trim(),
                        prompt: promptText.trim()
                    });
                    return `${id}`;
                });

                // console.log(prompts)

                return {
                    text: updatedText,
                    prompts: prompts
                };
            }
        },
        replacer: {
            prompt: "All future responses will follow this role and format strictly:\n\n* Act as a specialized AI assisting a professional article writer.\n* Respond only with the requested part of the article.\n* Maintain professional tone, smooth flow, and publication-ready clarity.\n* Output in clean Markdown.\n* No extra commentary, explanations, or conversational phrasing.\n\nReady for your detailed instructions. Provide only the core output without any introductory or conversational phrases or additional filler.\n",
            parse: (text) => text
        }
    }
}
// sleep(500).then(() => {
//     setEditorMode(true);
//     chat(newMessages, (chunk) => setContent(prev => prev + chunk))
//     .then(fullResponse => setContent(fullResponse))
//     .catch(error => console.error('Error:', error))
//     .finally(() => setMessages(prev => ([...prev, {role: 'user', content: prompt}, {role: 'assistant', content: content},])));
// });


export const chata = (index = 0) => {
    return Promise.resolve([
        `**Title:** Figma: Design Revolutionizing Collaboration\n\n**Meta Description:** Figma is the leading UI design tool, simplifying design workflows and collaboration. Discover its key features and benefits.\n\n**SEO Keywords:** Figma, UI Design, Design Tool, Collaboration, Prototyping, Design Software, User Interface Design, Vector Graphics, Digital Design`,

        `Okay, let's start building this Figma article outline.\n\n---\n\n## 1. Introduction\n\n**PROMPT:** Begin with a captivating hook – perhaps a statistic about design trends or a relatable problem that Figma solves. Briefly introduce Figma as a collaborative design tool and highlight its growing importance in the modern design landscape.  State the article’s purpose – to provide a beginner-friendly overview of Figma and its key features. Conclude with a statement about how Figma can significantly improve design workflows.\n\n---\n\n## 2. Body Structure\n\n### 2.1 Understanding Figma Basics\n\n**PROMPT:** Explain what Figma *is* in simple terms. Focus on its core functionalities: vector graphics, prototyping, design collaboration, and file management. Use analogies to help readers grasp the concepts (e.g., “Think of Figma as a digital whiteboard” or "It’s like having a collaborative design cloud"). Include a brief explanation of its core strengths - its intuitive interface.\n\n(Repeat this structure for 2-3 sections focused on core functionalities.)\n\n### 2.2 Key Features – Vector Graphics\n\n**PROMPT:** Detail the importance of vector graphics within Figma. Explain how they’re used for scalable designs (logos, icons, illustrations) and why they're superior to raster images for many design needs. Provide real-world examples: how companies use scalable vector graphics.\n\n(Repeat this structure for 2-3 sections, delving into features like:  Auto Layout, Variants, Component Libraries, etc.)\n\n### 2.3 Prototyping with Figma\n\n**PROMPT:** Describe how Figma’s prototyping capabilities work. Explain the different prototyping modes (static, basic, advanced) and how they’re utilized.  Mention the benefits of using Figma for creating interactive prototypes.  Showcase how Figma facilitates user testing.\n\n(Repeat this structure for 2-3 sections, focusing on:  Interactive Prototyping, Storyboarding, User Testing, etc.)\n\n---\n\n## 3. Conclusion\n\n**PROMPT:** Summarize the key benefits of using Figma – improved collaboration, efficiency, scalability, and visual consistency.  Reiterate Figma’s versatility across different design disciplines (web, mobile, UX/UI).  End with a call to action – encouraging readers to explore Figma and start their design journey.\n\n---\n\n## 4. Visual Components\n\n(Note: This will be a placeholder for visual elements. We'll populate this section in the next stage.)\n\n---\n\n**IMAGE_PROMPT:**  Create a visually appealing infographic demonstrating Figma's key features – a flow chart highlighting core functionalities, a comparison chart showcasing Figma's advantages over other design tools (e.g., Adobe XD), and a mockup of a collaborative design workflow. The infographic should use icons and a clear layout.  Consider a background image of a digital design board.\n`,

        `Figma offers a compelling suite of benefits that dramatically enhance the design process. At its core, it fosters **improved collaboration** through real-time, shared design experiences, allowing teams to seamlessly work together regardless of location. This results in reduced misunderstandings and faster iteration cycles.  Furthermore, Figma significantly boosts **efficiency** by providing powerful tools for prototyping, design exploration, and rapid feedback.  Its architecture encourages a streamlined workflow, minimizing wasted time.  Finally, Figma’s unparalleled **scalability** makes it ideal for both individual projects and large, complex design efforts.  Beyond the core design disciplines – web, mobile, UX/UI – Figma’s intuitive interface and robust feature set offer exceptional versatility, enabling designers to tackle any visual challenge with ease.  It's a powerful tool that adapts to your design needs, supporting a wide range of creative workflows.`
    ][index]);
}
