import { Layout, History, Sparkles, MessageSquare, Circle, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useAi } from '../context';
import ModelSelector from './ModelSelector';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const { createNewSession } = useAi();

    const handleNewThread = () => {
        createNewSession();
        setActiveTab('new');
    };

    return (
        <div className="w-64 bg-[#313439] border-r border-[#3f4448] p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-8 px-1">
                <Sparkles className="w-5 h-5 text-[#71d7f7]" />
                <h2 className="text-xs font-bold text-white uppercase tracking-widest">
                    Agent Core
                </h2>
            </div>

            <nav className="space-y-1 mb-6">
                <button
                    onClick={handleNewThread}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded mb-4 bg-[#71d7f7] text-[#313439] hover:bg-[#5bc0de] transition-all"
                >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase">New Thread</span>
                </button>

                <div className="text-[10px] text-[#6d7882] font-bold uppercase px-3 py-2">Menu</div>

                <button
                    onClick={() => setActiveTab('new')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-all ${activeTab === 'new' ? 'bg-[#26292c] text-[#71d7f7] border-l-2 border-[#71d7f7]' : 'text-[#a4afb7] hover:bg-[#26292c]'}`}
                >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase">Threaded Chat</span>
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-all ${activeTab === 'history' ? 'bg-[#26292c] text-[#71d7f7] border-l-2 border-[#71d7f7]' : 'text-[#a4afb7] hover:bg-[#26292c]'}`}
                >
                    <History className="w-4 h-4" />
                    <span className="text-[11px] font-bold uppercase">All History</span>
                </button>
            </nav>

            <div className="flex-1" />

            <div className="mt-6 pt-4 border-t border-[#3f4448]">
                <ModelSelector />
            </div>
        </div>
    );
};

export default Sidebar;
