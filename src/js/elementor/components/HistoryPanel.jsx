import { useAi } from '../context';
import { History, ChevronRight, Sparkles } from 'lucide-react';

const HistoryPanel = () => {
    const { history, insertToEditor } = useAi();

    return (
        <div className="sc-flex-1 sc-flex sc-flex-col sc-bg-[#f1f3f5] sc-h-full">
            <main className="sc-flex-1 sc-overflow-y-auto sc-p-4 sc-space-y-4">
                {history.length === 0 ? (
                    <div className="sc-h-full sc-flex sc-flex-col sc-items-center sc-justify-center sc-text-[#a4afb7] sc-space-y-3">
                        <History className="sc-w-10 sc-h-10 sc-text-[#d5dadf]" />
                        <p className="sc-text-[11px] sc-uppercase sc-font-bold sc-tracking-wider">No history records</p>
                    </div>
                ) : (
                    <div className="sc-grid sc-gap-3">
                        {history.map((item, index) => (
                            <div
                                key={item.id || index}
                                className="sc-bg-white sc-border sc-border-[#d5dadf] sc-rounded sc-p-3 hover:sc-border-[#5bc0de] sc-transition-all sc-shadow-sm"
                            >
                                <div className="sc-prose sc-prose-sm sc-max-w-none sc-max-h-20 sc-overflow-hidden sc-relative">
                                    <p className="sc-text-[11px] sc-text-[#6d7882] sc-leading-relaxed sc-m-0">"{item.content}"</p>
                                    <div className="sc-absolute sc-bottom-0 sc-left-0 sc-right-0 sc-h-6 sc-bg-gradient-to-t sc-from-white sc-to-transparent" />
                                </div>
                                <div className="sc-mt-3 sc-flex sc-justify-end sc-border-t sc-border-[#f1f3f5] sc-pt-2">
                                    <button
                                        onClick={() => insertToEditor(item.elementor_json)}
                                        className="sc-text-[10px] sc-font-bold sc-text-[#5bc0de] hover:sc-text-[#45a4bf] sc-flex sc-items-center sc-gap-1 sc-uppercase"
                                    >
                                        Re-apply
                                        <ChevronRight className="sc-w-3 sc-h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default HistoryPanel;
