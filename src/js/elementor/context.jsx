import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getWidgetInfo, extractWidgetNamesFromText } from './schemas/widget-registry.js';
import { getCommonControlsSchema } from './schemas/common-controls.js';
import { expandElementorJson } from './utils.js';


const STORAGE_KEY_PREFIX = 'eai_chat_history_';
const STORAGE_KEY_INDEX = 'eai_chat_index';

const AiContext = createContext();

export const AiProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]); // List of { id, title, timestamp }
    const [selectedModel, setSelectedModel] = useState(null);
    const [availableModels, setAvailableModels] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);

    // Initialize history index from localStorage
    useEffect(() => {
        const savedIndex = localStorage.getItem(STORAGE_KEY_INDEX);
        if (savedIndex) {
            const parsedIndex = JSON.parse(savedIndex);
            setHistory(parsedIndex);

            // Auto-load last session if available
            if (parsedIndex.length > 0) {
                loadSession(parsedIndex[0].id);
            } else {
                createNewSession();
            }
        } else {
            createNewSession();
        }
    }, []);

    const saveHistoryIndex = (newHistory) => {
        setHistory(newHistory);
        localStorage.setItem(STORAGE_KEY_INDEX, JSON.stringify(newHistory));
    };

    const createNewSession = () => {
        const id = Date.now().toString();
        const newSession = { id, title: 'New Conversation', timestamp: Date.now() };
        const newHistory = [newSession, ...history];
        saveHistoryIndex(newHistory);
        setCurrentSessionId(id);
        setMessages([]);
        return id;
    };

    const loadSession = (id) => {
        const savedMessages = localStorage.getItem(STORAGE_KEY_PREFIX + id);
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
            setCurrentSessionId(id);
        } else {
            setMessages([]);
            setCurrentSessionId(id);
        }
    };

    const deleteSession = (id) => {
        const newHistory = history.filter(h => h.id !== id);
        saveHistoryIndex(newHistory);
        localStorage.removeItem(STORAGE_KEY_PREFIX + id);
        if (id === currentSessionId) {
            setCurrentSessionId(null);
            setMessages([]);
        }
    };

    const updateSessionTitle = (id, text) => {
        const title = text.length > 30 ? text.substring(0, 30) + '...' : text;
        const newHistory = history.map(h => h.id === id ? { ...h, title } : h);
        saveHistoryIndex(newHistory);
    };

    useEffect(() => {
        if (currentSessionId && messages.length > 0) {
            localStorage.setItem(STORAGE_KEY_PREFIX + currentSessionId, JSON.stringify(messages));
        }
    }, [messages, currentSessionId]);

    const getAvailableWidgets = () => {
        if (!window.elementor || !window.elementor.widgetsCache) return [];

        return Object.values(window.elementor.widgetsCache).map(widget => ({
            name: widget.name, title: widget.title,
            controls: Object.values(widget.controls).map(({ tab, type, name, label }) => ({ tab, type, name, label }))
        }));
    };

    useEffect(() => {
        const fetchOllamaModels = async () => {
            try {
                const response = await fetch('http://localhost:11434/api/tags');
                const data = await response.json();
                if (data.models) {
                    const models = data.models.map(m => ({ id: m.model, name: m.name }));
                    setAvailableModels(models);
                    if (!selectedModel) setSelectedModel(models.find(m => m.id)?.id || 'gemma3:270m');
                }
            } catch (error) {
                console.log('Ollama not found locally');
            }
        };
        fetchOllamaModels();
    }, []);

    const streamOllama = async (chatMessages, onChunk) => {
        try {
            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                body: JSON.stringify({
                    model: selectedModel,
                    messages: chatMessages,
                    stream: true
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();
                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const json = JSON.parse(line);
                        if (json.message?.content) onChunk(json.message.content);
                        if (json.done) return;
                    } catch (e) { }
                }
            }
        } catch (error) {
            throw error;
        }
    };

    const sendMessage = useCallback(async (userPrompt) => {
        if (!userPrompt.trim()) return;

        let sessionId = currentSessionId;
        if (!sessionId) sessionId = createNewSession();

        if (messages.length === 0) {
            updateSessionTitle(sessionId, userPrompt);
        }

        const newUserMsg = { role: 'user', content: userPrompt };
        const updatedMessages = [...messages, newUserMsg];
        setMessages(updatedMessages);
        setPrompt('');
        setLoading(true);

        const widgets = getAvailableWidgets();
        const assistantId = Date.now();
        setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', status: 'thinking' }]);

        const CORE_CONCEPT = `Elementor AI Assistant (Dynamic Layouts, Performance, UX).`;

        try {
            const fullThreadContext = updatedMessages.map(m => m.content).join(' ');
            const mentionedWidgets = extractWidgetNamesFromText(fullThreadContext);
            const lastUserMsg = updatedMessages[updatedMessages.length - 1].content;

            // Contextual Phase Detection (Smarter than word matching)
            const lastAssistantMsg = messages.filter(m => m.role === 'assistant').pop()?.content || '';
            const isPlanAlreadyDrawn = fullThreadContext.includes("## Widget Plan");
            const isUserAffirmative = /yes|ok|build|proceed|go|do it|looks good|correct|generate/i.test(lastUserMsg);

            // Smarter Intent Detection
            const designKeywords = ['create', 'build', 'design', 'add', 'section', 'hero', 'footer', 'header', 'page', 'layout'];
            const hasDesignIntent = designKeywords.some(kw => lastUserMsg.toLowerCase().includes(kw));

            let phase = 'CONVERSATION';

            if (isPlanAlreadyDrawn) {
                // We have a plan. We are either refining it (PLANNING) or building it (EXECUTION)
                if (isUserAffirmative && !lastUserMsg.toLowerCase().includes('wait') && !lastUserMsg.toLowerCase().includes('change')) phase = 'EXECUTION';
                else phase = 'PLANNING';
            } else if (hasDesignIntent) {
                // If it's a direct command, skip conversation and go to plan request via conversation trigger
                phase = 'CONVERSATION';
            }

            let systemMsg;
            const BASE_INSTRUCTIONS = `You are an Elementor AI. ${CORE_CONCEPT}`;

            if (phase === 'CONVERSATION') {
                systemMsg = {
                    role: 'system',
                    content: `${BASE_INSTRUCTIONS}
                    [MODE]: CONVERSATION
                    [TASK]: Acknowledge the user's request and provide immediate design value. 
                    [CRITICAL]: If the user wants to build/create something, you MUST end your message with exactly: "[ACTION:PLAN_REQ] Summary of task"
                    
                    Example: "Sure! I can design that hero section for you. [ACTION:PLAN_REQ] Modern Hero Section with title and button"`
                };
            } else if (phase === 'PLANNING') {
                const widgetList = getWidgetInfo('names');
                const widgetDesc = widgetList.map(w => `${w.name} - ${w.description}`).join('\n');
                systemMsg = {
                    role: 'system',
                    content: `${BASE_INSTRUCTIONS}
                    MODE: ARCHITECT (Technical Planning)
                    GOAL: Create a semantic Architectural Blueprint for the layout.

                    AVAILABLE WIDGETS:
                    ${widgetDesc}

                    OUTPUT REQUIREMENTS:
                    1. Start with "## Widget Plan".
                    2. Define structure using a numbered list: **widget-name** - Technical purpose & Content.
                    3. Explain the "Why" behind the layout (UX rationale).
                    4. Explicitly ask for confirmation to move to BUILDER mode.
                    
                    Do NOT generate JSON yet.`
                };
            } else {
                const selectiveWidgets = getWidgetInfo('selective', mentionedWidgets);
                const widgetControlsSummary = Object.entries(selectiveWidgets).map(([name, widget]) => {
                    const controls = Object.keys(widget.controls).length > 0
                        ? Object.entries(widget.controls).map(([k, c]) => `${k} (${c.type})`).join(', ')
                        : 'Standard Elementor Style & Advanced controls only';
                    return `**${name}**: ${controls}`;
                }).join('\n');

                const SIMPLIFIED_SCHEMA = `
                SIMPLIFIED ELEMENTOR JSON SCHEMA (TRAINING):
                You only need to output a simplified structure. I will expand it to full Elementor JSON.
                
                EXAMPLE:
                [JSON]
                {
                  "elType": "container",
                  "settings": { "background_color": "#f9f9f9", "padding": { "top": "50", "bottom": "50", "unit": "px" } },
                  "elements": [
                    {
                      "elType": "widget",
                      "widgetType": "heading",
                      "settings": { "title": "Section Title", "align": "center" }
                    },
                    {
                      "elType": "widget",
                      "widgetType": "text-editor",
                      "settings": { "editor": "<p>Description content here...</p>" }
                    }
                  ]
                }
                [/JSON]
                
                Nesting: Widgets go inside Container "elements" array. 
                Keep it slim. ONLY include properties that you want to set.
                `;

                systemMsg = {
                    role: 'system',
                    content: `${BASE_INSTRUCTIONS}
                    MODE: BUILDER (Code Execution)
                    GOAL: Transform the Blueprint into high-performance Elementor JSON.

                    VERIFIED CONTROLS FOR THIS TASK:
                    ${widgetControlsSummary}

                    ${SIMPLIFIED_SCHEMA}

                    STRICT PROTOCOLS:
                    1. ONLY output JSON wrapped in [JSON]...[/JSON].
                    2. Use property names from the controls listed above.
                    3. Structure: { "elType": "container", "elements": [...] }.
                    4. No conversational filler.
                    5. Ensure widgets are styled according to the Blueprint.`
                };
            }

            let fullResponse = '';
            const finalReminder = {
                role: 'user',
                content: `[MEMORY]: ${fullThreadContext.slice(-500)}\n[SYSTEM]: Continue as ${phase}.`
            };

            await streamOllama([systemMsg, ...updatedMessages, finalReminder], (chunk) => {
                fullResponse += chunk;
                setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullResponse } : m));
            });

            // HANDLE TRANSITIONS & STUCK AI FALLBACK
            const hasTrigger = fullResponse.includes('[ACTION:PLAN_REQ]');
            const isEchoing = fullResponse.includes('MODE: CONVERSATION') || fullResponse.includes('AGENT IDENTITY');

            if (hasTrigger || (hasDesignIntent && (fullResponse.length < 100 || isEchoing))) {
                let summary = hasTrigger ? fullResponse.split('[ACTION:PLAN_REQ]')[1].trim() : lastUserMsg;
                // If it was echoing or too short, we don't want that garbage in history
                const cleanContent = hasTrigger ? fullResponse.split('[ACTION:PLAN_REQ]')[0].trim() : 'Understood. Let me plan that hero section for you.';

                // Update history to remove trigger/echo before auto-triggering next phase
                setMessages(prev => {
                    const filtered = prev.map(m => m.id === assistantId ? {
                        ...m,
                        status: 'done',
                        content: cleanContent || 'Starting plan...'
                    } : m);
                    return filtered;
                });

                setTimeout(() => {
                    sendMessage(`[SYSTEM_AUTO]: Plan the requested layout for: ${summary}\n\nBe technical.`);
                }, 100);
                return;
            }

            const jsonMatch = fullResponse.match(/\[JSON\]([\s\S]*?)\[\/JSON\]/);
            if (jsonMatch) {
                try {
                    const simplified_json = JSON.parse(jsonMatch[1].trim());
                    // Expand the simplified JSON to full Elementor JSON
                    const elementor_json = expandElementorJson(simplified_json);

                    setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, status: 'done', elementor_json } : m));
                    insertToEditor(elementor_json);
                } catch (e) { console.error('JSON Expansion/Insertion Failed:', e); }
            }
            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, status: 'done' } : m));
        } catch (error) {
            alert(error?.message)
            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, status: 'error', content: 'Connection to Ollama failed. Make sure it is running.' } : m));
        } finally {
            setLoading(false);
        }
    }, [messages, currentSessionId, selectedModel]);

    const insertToEditor = useCallback((contentJson) => {
        if (!contentJson || !window.elementor) return;
        try {
            const preview = window.elementor.getPreviewView();
            if (!preview) return;
            const elements = Array.isArray(contentJson) ? contentJson : [contentJson];
            elements.forEach(el => preview.model.get('elements').add(el));
            preview.render();
        } catch (e) {
            console.error('Editor Insertion Error:', e);
        }
    }, []);

    const value = {
        messages,
        prompt,
        setPrompt,
        loading,
        history,
        currentSessionId,
        sendMessage,
        loadSession,
        createNewSession,
        deleteSession,
        selectedModel,
        setSelectedModel,
        availableModels,
        insertToEditor
    };

    return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
};

export const useAi = () => {
    const context = useContext(AiContext);
    if (!context) throw new Error('useAi must be used within an AiProvider');
    return context;
};
