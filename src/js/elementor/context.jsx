import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY_PREFIX = 'eai_chat_history_';
const STORAGE_KEY_INDEX = 'eai_chat_index';

const AiContext = createContext();

export const AiProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]); // List of { id, title, timestamp }
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [selectedModel, setSelectedModel] = useState('gemma3:270m');
    const [availableModels, setAvailableModels] = useState([]);

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

        const CORE_CONCEPT = `
        ELEMENTOR CORE CONCEPTS:
        - Dynamic Page Composition
        - Advanced Recommendation Engine Integration
        - Content Management & Personalization
        - Scalable State Management & Contexts
        - Performance Optimization & Offline Support`;

        try {
            const { getWidgetInfo, extractWidgetNamesFromText } = await import('./schemas/widget-registry.js');
            const { getCommonControlsSchema } = await import('./schemas/common-controls.js');

            const fullThreadContext = updatedMessages.map(m => m.content).join(' ');
            const mentionedWidgets = extractWidgetNamesFromText(fullThreadContext);
            const lastUserMsg = updatedMessages[updatedMessages.length - 1].content;

            // Phase Logic
            const hasPlanInHistory = fullThreadContext.includes("## Widget Plan");
            const hasBuildCommand = /build|generate|apply|proceed|go|do it|final/i.test(lastUserMsg);

            let phase = 'CONVERSATION';
            if (hasPlanInHistory && (hasBuildCommand || mentionedWidgets.length > 0)) {
                phase = 'EXECUTION';
            } else if (hasPlanInHistory || /create|design|build|layout|section|page|pricing|hero|footer|header|table|grid/i.test(lastUserMsg)) {
                phase = 'PLANNING';
            }

            let systemMsg;
            if (phase === 'CONVERSATION') {
                systemMsg = {
                    role: 'system',
                    content: `${CORE_CONCEPT}
                    You are a friendly Elementor assistant. Chat normally.
                    If the user wants to build or design something, ALWAYS state: "[ACTION:PLAN_REQ] Task Summary" as the last line of your message.`
                };
            } else if (phase === 'PLANNING') {
                const widgetList = getWidgetInfo('names');
                const widgetDesc = widgetList.map(w => `${w.name} - ${w.description}`).join('\n');
                systemMsg = {
                    role: 'system',
                    content: `${CORE_CONCEPT}
                    You are in PLANNING mode. Create a detailed layout plan.
                    
                    AVAILABLE WIDGETS:
                    ${widgetDesc}

                    OUTPUT FORMAT:
                    ## Widget Plan
                    1. **widget-name** - Purpose
                    ...
                    Ask the user to "build" or "modify" the plan.`
                };
            } else {
                const selectiveWidgets = getWidgetInfo('selective', mentionedWidgets);
                const widgetControlsSummary = Object.entries(selectiveWidgets).map(([name, widget]) => {
                    const controls = Object.keys(widget.controls).length > 0
                        ? Object.entries(widget.controls).map(([k, c]) => `${k} (${c.type})`).join(', ')
                        : 'Common controls only';
                    return `**${name}**: ${controls}`;
                }).join('\n');

                systemMsg = {
                    role: 'system',
                    content: `${CORE_CONCEPT}
                    EXECUTION MODE. Generate valid Elementor JSON.
                    
                    WIDGETS:
                    ${widgetControlsSummary}

                    RULES:
                    1. ONLY output JSON wrapped in [JSON]...[/JSON].
                    2. Icons: Use 'icon' widget.
                    3. No conversational filler.`
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

            // HANDLE TRANSITIONS
            if (fullResponse.includes('[ACTION:PLAN_REQ]')) {
                const summary = fullResponse.split('[ACTION:PLAN_REQ]')[1].trim();
                // Clean up trigger and auto-trigger next phase
                setMessages(prev => prev.map(m => m.id === assistantId ? {
                    ...m,
                    status: 'thinking',
                    content: fullResponse.split('[ACTION:PLAN_REQ]')[0].trim()
                } : m));
                await sendMessage(`[SYSTEM_AUTO]: Plan the requested layout for: ${summary}`);
                return;
            }

            const jsonMatch = fullResponse.match(/\[JSON\]([\s\S]*?)\[\/JSON\]/);
            if (jsonMatch) {
                try {
                    const elementor_json = JSON.parse(jsonMatch[1].trim());
                    setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, status: 'done', elementor_json } : m));
                    insertToEditor(elementor_json);
                } catch (e) { console.error(e); }
            }
            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, status: 'done' } : m));
        } catch (error) {
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
