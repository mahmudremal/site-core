import { useState } from 'react';
import ChatPanel from './ChatPanel';
import HistoryPanel from './HistoryPanel';
import { AiProvider } from '../context';
import { History, MessageSquare, MoreHorizontal, X } from 'lucide-react';

const AiApp = ({ closeModal }) => {
    const [activeTab, setActiveTab] = useState('new');
    const isModal = !!closeModal;

    return (
        <div className="flex flex-col bg-white text-[#495157] overflow-hidden h-full w-full rounded-lg shadow-2xl border border-[#d5dadf]">
            <header className="flex justify-between items-center px-4 py-3 bg-white border-b border-[#f1f3f5] cursor-move modal-drag-handle">
                <div className="flex gap-1">
                    <MoreHorizontal className="w-4 h-4 text-[#a4afb7]" />
                </div>

                <h2 className="text-[13px] font-bold text-[#495157] m-0">AI Agent</h2>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setActiveTab(activeTab === 'new' ? 'history' : 'new')}
                        className="text-[#a4afb7] hover:text-[#495157] transition-colors"
                        title={activeTab === 'new' ? 'History' : 'Back to Builder'}
                    >
                        {activeTab === 'new' ? <History className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                    </button>
                    {isModal && (
                        <button onClick={closeModal} className="text-[#a4afb7] hover:text-[#b01b1b] transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex flex-col bg-[#f1f3f5]">
                {activeTab === 'new' && <ChatPanel isSidebar={false} />}
                {activeTab === 'history' && <HistoryPanel setActiveTab={setActiveTab} isSidebar={false} />}
            </div>

            {/* <div className="bg-white py-2 flex justify-center border-t border-[#f1f3f5]">
                <MoreHorizontal className="w-4 h-4 text-[#d5dadf]" />
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
