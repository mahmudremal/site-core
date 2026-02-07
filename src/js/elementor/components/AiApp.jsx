import { useState } from 'react';
import ChatPanel from './ChatPanel';
import HistoryPanel from './HistoryPanel';
import { AiProvider } from '../context';
import { History, MessageSquare, MoreHorizontal, X } from 'lucide-react';

const AiApp = ({ closeModal }) => {
    const [activeTab, setActiveTab] = useState('new');
    const isModal = !!closeModal;

    return (
        <div className="sc-flex sc-flex-col sc-bg-white sc-text-[#495157] sc-overflow-hidden sc-h-full sc-w-full sc-rounded-lg sc-shadow-2xl sc-border sc-border-[#d5dadf]">
            <header className="sc-flex sc-justify-between sc-items-center sc-px-4 sc-py-3 sc-bg-white sc-border-b sc-border-[#f1f3f5] sc-cursor-move modal-drag-handle">
                <div className="sc-flex sc-gap-1">
                    <MoreHorizontal className="sc-w-4 sc-h-4 sc-text-[#a4afb7]" />
                </div>

                <h2 className="sc-text-[13px] sc-font-bold sc-text-[#495157] sc-m-0">AI Agent</h2>

                <div className="sc-flex sc-items-center sc-gap-3">
                    <button
                        onClick={() => setActiveTab(activeTab === 'new' ? 'history' : 'new')}
                        className="sc-text-[#a4afb7] hover:sc-text-[#495157] sc-transition-colors"
                        title={activeTab === 'new' ? 'History' : 'Back to Builder'}
                    >
                        {activeTab === 'new' ? <History className="sc-w-4 sc-h-4" /> : <MessageSquare className="sc-w-4 sc-h-4" />}
                    </button>
                    {isModal && (
                        <button onClick={closeModal} className="sc-text-[#a4afb7] hover:sc-text-[#b01b1b] sc-transition-colors">
                            <X className="sc-w-4 sc-h-4" />
                        </button>
                    )}
                </div>
            </header>

            <div className="sc-flex-1 sc-overflow-hidden sc-flex sc-flex-col sc-bg-[#f1f3f5]">
                {activeTab === 'new' && <ChatPanel isSidebar={false} />}
                {activeTab === 'history' && <HistoryPanel isSidebar={false} />}
            </div>

            {/* <div className="sc-bg-white sc-py-2 sc-flex sc-justify-center sc-border-t sc-border-[#f1f3f5]">
                <MoreHorizontal className="sc-w-4 sc-h-4 sc-text-[#d5dadf]" />
            </div> */}
        </div>
    );
};

const Application = ({ modal }) => {
    return (
        <AiProvider>
            <AiApp closeModal={() => modal?.hide?.()} />
        </AiProvider>
    );
};

export default Application;
