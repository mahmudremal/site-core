import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AiContext = createContext();

export const AiProvider = ({ children }) => {
    const [messages, setMessages] = useState([]); // { role: 'user'|'assistant', content: string, status?: 'thinking'|'building'|'done', plan?: string }
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [selectedModel, setSelectedModel] = useState('gemma3:270m');
    const [availableModels, setAvailableModels] = useState([]);

    const getAvailableWidgets = () => {
        if (!window.elementor || !window.elementor.widgetsCache) return [];
        return Object.values(window.elementor.widgetsCache).map(widget => ({
            name: widget.name,
            title: widget.title
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
                    if (!selectedModel) setSelectedModel(models.find(m => m.id));
                }
            } catch (error) {
                console.log('Ollama not found locally');
            }
        };
        fetchOllamaModels();
    }, []);

    const streamOllama = async (chatMessages, onChunk) => {
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
    };

    const sendMessage = useCallback(async (userPrompt) => {
        const newMessages = [...messages, { role: 'user', content: userPrompt }];
        setMessages(newMessages);
        setPrompt('');
        setLoading(true);

        const widgets = getAvailableWidgets();
        const assistantId = Date.now();
        setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', status: 'thinking' }]);

        try {
            // 1. Planning/Thinking
            let plan = '';
            const systemMsg = {
                role: 'system',
                content: `You are an AI Agent for Elementor. Context: Available widgets: ${JSON.stringify(widgets)}. 
                First, explain your plan and what widgets you will use. 
                Keep it concise. At the end of your thinking, provide a valid Elementor JSON result wrapped in [JSON]...[/JSON] tags.`
            };

            await streamOllama([systemMsg, ...newMessages], (chunk) => {
                plan += chunk;
                setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: plan } : m));
            });

            // Extract JSON from response
            const jsonMatch = plan.match(/\[JSON\]([\s\S]*?)\[\/JSON\]/);
            if (jsonMatch) {
                try {
                    const elementor_json = JSON.parse(jsonMatch[1]);
                    setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, status: 'done', elementor_json } : m));
                    setHistory(prev => [{ content: userPrompt, elementor_json, timestamp: Date.now() }, ...prev]);
                    insertToEditor(elementor_json);
                } catch (e) {
                    setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, status: 'done' } : m));
                }
            } else {
                setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, status: 'done' } : m));
            }
        } catch (error) {
            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, status: 'error', content: 'Connection failed.' } : m));
        } finally {
            setLoading(false);
        }
    }, [messages, selectedModel]);

    const insertToEditor = useCallback((contentJson) => {
        if (!contentJson || !window.elementor) return;
        const preview = window.elementor.getPreviewView();
        if (!preview) return;
        const elements = Array.isArray(contentJson) ? contentJson : [contentJson];
        elements.forEach(el => preview.model.get('elements').add(el));
        preview.render();
    }, []);

    const value = {
        messages,
        prompt,
        setPrompt,
        loading,
        history,
        sendMessage,
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
