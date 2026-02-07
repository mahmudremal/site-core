import { useAi } from '../context';
import { Send, Sparkles, Loader2, ChevronRight, User, Bot, Cpu, MessageSquare } from 'lucide-react';
import ModelSelector from './ModelSelector';
import { useEffect, useRef } from 'react';

const ChatPanel = () => {
    const { messages, prompt, setPrompt, loading, sendMessage, insertToEditor } = useAi();
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!prompt.trim() || loading) return;
        sendMessage(prompt);
    };

    return (
        <div className="sc-flex-1 sc-flex sc-flex-col sc-bg-[#f1f3f5] sc-h-full">
            <main ref={scrollRef} className="sc-flex-1 sc-overflow-y-auto sc-p-4 sc-space-y-6 sc-scrollbar-thin">
                {messages.length === 0 && (
                    <div className="sc-h-full sc-flex sc-flex-col sc-items-center sc-justify-center sc-text-center sc-px-4 sc-space-y-4">
                        <div className="sc-w-16 sc-h-16 sc-bg-white sc-rounded-full sc-shadow-sm sc-flex sc-items-center sc-justify-center sc-mb-2">
                            <MessageSquare className="sc-w-8 sc-h-8 sc-text-[#d5dadf]" />
                        </div>
                        <h3 className="sc-text-[15px] sc-font-bold sc-text-[#6d7882] sc-m-0">
                            Build your page with AI
                        </h3>
                        <p className="sc-text-[#a4afb7] sc-text-[13px] sc-leading-normal sc-m-0 sc-max-w-[220px]">
                            Describe a section or feature, and I'll generate the Elementor elements for you.
                        </p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`sc-flex sc-gap-3 ${msg.role === 'user' ? 'sc-flex-row-reverse' : ''}`}>
                        <div className={`sc-w-7 sc-h-7 sc-rounded-full sc-flex sc-items-center sc-justify-center sc-shrink-0 ${msg.role === 'user' ? 'sc-bg-[#5bc0de] sc-text-white' : 'sc-bg-white sc-text-[#a4afb7] sc-shadow-sm'}`}>
                            {msg.role === 'user' ? <User className="sc-w-3.5 sc-h-3.5" /> : <Bot className="sc-w-3.5 sc-h-3.5" />}
                        </div>

                        <div className={`sc-max-w-[85%] sc-space-y-2 ${msg.role === 'user' ? 'sc-text-right' : ''}`}>
                            <div className={`sc-p-3 sc-rounded-lg sc-text-[12px] sc-leading-relaxed sc-shadow-sm ${msg.role === 'user' ? 'sc-bg-white sc-text-[#495157]' : 'sc-bg-white sc-text-[#495157] sc-border sc-border-[#e9ecef]'}`}>
                                <div className="sc-whitespace-pre-wrap">{msg.content.replace(/\[JSON\][\s\S]*?\[\/JSON\]/g, '')}</div>

                                {msg.thinking && (
                                    <div className="sc-mt-3 sc-space-y-2 sc-border-t sc-border-[#f1f3f5] sc-pt-3">
                                        <div className="sc-flex sc-items-center sc-gap-2 sc-text-[9px] sc-font-bold sc-text-[#a4afb7] sc-uppercase">
                                            <Cpu className={`sc-w-3 sc-h-3 ${msg.status === 'thinking' ? 'sc-animate-pulse' : ''}`} />
                                            Reasoning
                                        </div>
                                        <pre className="sc-bg-[#f8f9fa] sc-p-2 sc-rounded sc-text-[10px] sc-text-[#6d7882] sc-whitespace-pre-wrap sc-font-mono sc-border sc-border-[#e9ecef] sc-max-h-[120px] sc-overflow-y-auto">
                                            {msg.thinking}
                                        </pre>
                                    </div>
                                )}

                                {msg.status === 'thinking' && !msg.content && (
                                    <div className="sc-flex sc-items-center sc-gap-2 sc-text-[#5bc0de] sc-animate-pulse sc-mt-2">
                                        <Loader2 className="sc-w-3 sc-h-3 sc-animate-spin" />
                                        <span className="sc-text-[10px] sc-font-bold sc-uppercase">Thinking...</span>
                                    </div>
                                )}
                            </div>

                            {msg.elementor_json && (
                                <div className="sc-flex sc-justify-start">
                                    <button
                                        onClick={() => insertToEditor(msg.elementor_json)}
                                        className="sc-text-[9px] sc-font-bold sc-bg-[#39b54a] sc-text-white sc-px-3 sc-py-1.5 sc-rounded sc-shadow-sm hover:sc-bg-[#2e913b] sc-transition-all sc-flex sc-items-center sc-gap-1.5 sc-uppercase"
                                    >
                                        Apply elements
                                        <ChevronRight className="sc-w-3 sc-h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </main>

            <footer className="sc-p-3 sc-bg-white sc-border-t sc-border-[#d5dadf] sc-relative sc-z-[1001]">
                <form onSubmit={handleSubmit} className="sc-relative sc-flex sc-items-center sc-gap-2">
                    <ModelSelector />

                    <div className="sc-flex-1 sc-relative">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            placeholder="Describe your design..."
                            className="sc-w-full sc-bg-[#f1f3f5] sc-border sc-border-transparent sc-rounded sc-py-2 sc-pl-3 sc-pr-10 sc-text-[12px] sc-text-[#495157] sc-placeholder-[#a4afb7] focus:sc-outline-none focus:sc-bg-white focus:sc-border-[#5bc0de] sc-resize-none sc-transition-all"
                            rows="1"
                        />
                        <button
                            type="submit"
                            disabled={!prompt.trim() || loading}
                            className="sc-absolute sc-right-1 sc-bottom-1 sc-p-1.5 sc-text-[#5bc0de] disabled:sc-text-[#d5dadf] hover:sc-text-[#45a4bf] sc-transition-all"
                        >
                            {loading ? <Loader2 className="sc-w-4 sc-h-4 sc-animate-spin" /> : <Send className="sc-w-4 sc-h-4" />}
                        </button>
                    </div>
                </form>
            </footer>
        </div>
    );
};

export default ChatPanel;
