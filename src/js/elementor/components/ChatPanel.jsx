import { useAi } from '../context';
import { Send, Sparkles, Loader2, ChevronRight, User, Bot, Cpu, MessageSquare, RotateCcw, RotateCw } from 'lucide-react';
import ModelSelector from './ModelSelector';
import { useEffect, useRef } from 'react';
import { marked } from 'marked';
import './ChatPanel.css';

const SUGGESTIONS = [
    { label: 'Hero Section', prompt: 'Create a modern hero section with a title, description, and primary button.' },
    { label: 'Feature Grid', prompt: 'Design a 3-column feature grid with icons and text.' },
    { label: 'Contact Form', prompt: 'Build a contact section with a heading and a simple form.' },
    { label: 'Pricing Table', prompt: 'Create a professional 3-tier pricing table.' },
];

const ChatPanel = () => {
    const { messages, prompt, setPrompt, loading, sendMessage, insertToEditor } = useAi();
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSubmit = (e = null) => {
        if (e) e.preventDefault();
        if (!prompt.trim() || loading) return;
        sendMessage(prompt);
    };

    const handleUndo = () => {
        if (window.elementor && window.elementor.history) {
            window.elementor.history?.undo?.();
        }
    };

    const handleRedo = () => {
        if (window.elementor && window.elementor.history) {
            window.elementor.history?.redo?.();
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#f1f3f5] h-full">
            <header className="px-4 py-2 bg-white border-b border-[#d5dadf] flex justify-between items-center">
                <span className="text-[10px] font-bold text-[#a4afb7] uppercase">Live Session</span>
                <div className="flex gap-2">
                    <button onClick={handleUndo} className="p-1 text-[#a4afb7] hover:text-[#5bc0de]" title="Undo"><RotateCcw className="w-3.5 h-3.5" /></button>
                    <button onClick={handleRedo} className="p-1 text-[#a4afb7] hover:text-[#5bc0de]" title="Redo"><RotateCw className="w-3.5 h-3.5" /></button>
                </div>
            </header>

            <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-6">
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto">
                                <MessageSquare className="w-8 h-8 text-[#d5dadf]" />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-bold text-[#6d7882] m-0">Build your page with AI</h3>
                                <p className="text-[#a4afb7] text-[13px] leading-normal m-0 max-w-[220px]">
                                    Describe what you want to build or use a template.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 w-full max-w-[280px]">
                            {SUGGESTIONS.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setPrompt(s.prompt); }}
                                    className="p-2 bg-white border border-[#d5dadf] rounded text-[10px] font-bold text-[#6d7882] hover:border-[#5bc0de] hover:text-[#5bc0de] transition-all text-left"
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[#5bc0de] text-white' : 'bg-white text-[#a4afb7] shadow-sm'}`}>
                            {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                        </div>

                        <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                            <div className={`p-3 rounded-lg text-[12px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-white text-[#495157]' : 'bg-white text-[#495157] border border-[#e9ecef]'}`}>
                                {msg.role === 'assistant' ? (
                                    <div
                                        className="prose prose-sm max-w-none prose-headings:text-[#495157] prose-p:text-[#495157] prose-strong:text-[#495157]"
                                        dangerouslySetInnerHTML={{
                                            __html: marked(msg.content.replace(/\[JSON\][\s\S]*?\[\/JSON\]/g, ''))
                                        }}
                                    />
                                ) : (
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                )}

                                {msg.status === 'thinking' && (
                                    <div className="mt-3 space-y-2 animate-pulse">
                                        <div className="h-2 bg-[#f1f3f5] rounded-full w-3/4"></div>
                                        <div className="h-2 bg-[#f1f3f5] rounded-full w-full"></div>
                                        <div className="h-2 bg-[#f1f3f5] rounded-full w-1/2"></div>
                                    </div>
                                )}
                            </div>

                            {msg.elementor_json && (
                                <div className="flex justify-start">
                                    <button
                                        onClick={() => insertToEditor(msg.elementor_json)}
                                        className="text-[9px] font-bold bg-[#39b54a] text-white px-3 py-1.5 rounded shadow-sm hover:bg-[#2e913b] transition-all flex items-center gap-1.5 uppercase"
                                    >
                                        Apply elements
                                        <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                    <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-white text-[#a4afb7] shadow-sm flex items-center justify-center">
                            <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-[#e9ecef] w-2/3 animate-pulse">
                            <div className="flex items-center gap-2 mb-3">
                                <Loader2 className="w-3 h-3 animate-spin text-[#5bc0de]" />
                                <div className="h-2 bg-[#f1f3f5] rounded w-16"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 bg-[#f1f3f5] rounded w-full"></div>
                                <div className="h-2 bg-[#f1f3f5] rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="p-3 bg-white border-t border-[#d5dadf] relative z-[1001]">
                <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                    <ModelSelector />

                    <div className="flex-1 relative">
                        <textarea
                            rows="1"
                            value={prompt}
                            placeholder="Describe your design..."
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => (e.key === 'Enter' && !e.shiftKey) && handleSubmit(e)}
                            className="w-full bg-[#f1f3f5] border border-transparent rounded py-2 pl-3 pr-10 text-[12px] text-[#495157] placeholder-[#a4afb7] focus:outline-none focus:bg-white focus:border-[#5bc0de] resize-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!prompt.trim() || loading}
                            className="absolute right-1 bottom-1 p-1.5 text-[#5bc0de] disabled:text-[#d5dadf] hover:text-[#45a4bf] transition-all"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </form>
            </footer>
        </div>
    );
};

export default ChatPanel;
