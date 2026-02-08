import { useAi } from '../context';
import { History, ChevronRight, Trash2, MessageSquare, Clock, Plus } from 'lucide-react';

const HistoryPanel = ({ setActiveTab }) => {
    const { history, loadSession, deleteSession, currentSessionId, createNewSession } = useAi();

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const handleNewChat = () => {
        createNewSession();
        if (setActiveTab) setActiveTab('new');
    };

    const handleLoadSession = (id) => {
        loadSession(id);
        if (setActiveTab) setActiveTab('new');
    };

    return (
        <div className="flex-1 flex flex-col bg-[#f1f3f5] h-full">
            <header className="p-4 bg-white border-b border-[#d5dadf]">
                <h3 className="text-[12px] font-bold text-[#6d7882] uppercase flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Chat History
                </h3>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-3">
                {history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-[#a4afb7] space-y-4">
                        <History className="w-10 h-10 text-[#d5dadf]" />
                        <p className="text-[11px] uppercase font-bold tracking-wider">No history records</p>
                        <button
                            onClick={handleNewChat}
                            className="flex items-center gap-2 px-4 py-2 bg-[#5bc0de] text-white rounded text-[11px] font-bold hover:bg-[#46b8da] transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            New Chat
                        </button>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={handleNewChat}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#5bc0de] text-white rounded text-[11px] font-bold hover:bg-[#46b8da] transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            New Chat
                        </button>
                        <div className="grid gap-2">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleLoadSession(item.id)}
                                    className={`group relative bg-white border rounded p-3 cursor-pointer transition-all shadow-sm flex flex-col gap-1 ${item.id === currentSessionId ? 'border-[#5bc0de] bg-blue-50/10' : 'border-[#d5dadf] hover:border-[#ced4da]'}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex gap-2 items-start">
                                            <MessageSquare className={`w-3.5 h-3.5 mt-0.5 ${item.id === currentSessionId ? 'text-[#5bc0de]' : 'text-[#a4afb7]'}`} />
                                            <h4 className={`text-[12px] font-bold m-0 leading-tight ${item.id === currentSessionId ? 'text-[#5bc0de]' : 'text-[#495157]'}`}>
                                                {item.title || 'Untitled Session'}
                                            </h4>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteSession(item.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-[#a4afb7] hover:text-[#ff4d4d] transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#a4afb7]">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(item.timestamp)}
                                    </div>

                                    {item.id === currentSessionId && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5bc0de] rounded-l" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default HistoryPanel;
