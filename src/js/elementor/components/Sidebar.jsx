import { Layout, History, Sparkles, MessageSquare, Circle, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useAi } from '../context';
import ModelSelector from './ModelSelector';

const Sidebar = ({ activeTab, setActiveTab }) => {
    return (
        <div className="sc-w-64 sc-bg-[#313439] sc-border-r sc-border-[#3f4448] sc-p-4 sc-flex sc-flex-col">
            <div className="sc-flex sc-items-center sc-gap-2 sc-mb-8 sc-px-1">
                <Sparkles className="sc-w-5 sc-h-5 sc-text-[#71d7f7]" />
                <h2 className="sc-text-xs sc-font-bold sc-text-white sc-uppercase sc-tracking-widest">
                    Agent Core
                </h2>
            </div>

            <nav className="sc-space-y-1 sc-mb-8">
                <button
                    onClick={() => setActiveTab('new')}
                    className={`sc-w-full sc-flex sc-items-center sc-gap-3 sc-px-3 sc-py-2 sc-rounded sc-transition-all ${activeTab === 'new' ? 'sc-bg-[#26292c] sc-text-[#71d7f7] sc-border-l-2 sc-border-[#71d7f7]' : 'sc-text-[#a4afb7] hover:sc-bg-[#26292c]'}`}
                >
                    <MessageSquare className="sc-w-4 sc-h-4" />
                    <span className="sc-text-[11px] sc-font-bold sc-uppercase">Threaded Chat</span>
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`sc-w-full sc-flex sc-items-center sc-gap-3 sc-px-3 sc-py-2 sc-rounded sc-transition-all ${activeTab === 'history' ? 'sc-bg-[#26292c] sc-text-[#71d7f7] sc-border-l-2 sc-border-[#71d7f7]' : 'sc-text-[#a4afb7] hover:sc-bg-[#26292c]'}`}
                >
                    <History className="sc-w-4 sc-h-4" />
                    <span className="sc-text-[11px] sc-font-bold sc-uppercase">History</span>
                </button>
            </nav>

            <div className="sc-flex-1" />

            <div className="sc-mt-6 sc-pt-4 sc-border-t sc-border-[#3f4448]">
                <ModelSelector />
            </div>
        </div>
    );
};

export default Sidebar;
