import { Terminal, Trash2, CheckCircle2, AlertCircle, Clock, Info } from 'lucide-react';
import { __ } from '@js/utils';

export default function ActivityLogs({ logs, onClear }) {
    const getLogStyles = (type) => {
        switch (type) {
            case 'success': return { icon: CheckCircle2, iconColor: 'text-green-500', bgColor: 'bg-green-500/5', textColor: 'text-gray-900' };
            case 'error': return { icon: AlertCircle, iconColor: 'text-red-500', bgColor: 'bg-red-500/5', textColor: 'text-red-700' };
            case 'warning': return { icon: Clock, iconColor: 'text-yellow-500', bgColor: 'bg-yellow-500/5', textColor: 'text-yellow-700' };
            default: return { icon: Info, iconColor: 'text-scaccent', bgColor: 'bg-scaccent/5', textColor: 'text-gray-700' };
        }
    };

    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-scaccent/10 rounded-lg">
                        <Terminal className="w-5 h-5 text-scaccent" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                        {__('Execution Logs', 'site-core')}
                    </h3>
                </div>
                <button
                    onClick={onClear}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title={__('Clear Logs', 'site-core')}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar min-h-[400px]">
                {logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 py-20">
                        <Terminal className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 font-medium">
                            {__('System standby. No logs to display.', 'site-core')}
                        </p>
                    </div>
                ) : (
                    logs.map((log) => {
                        const styles = getLogStyles(log.type);
                        const Icon = styles.icon;
                        return (
                            <div
                                key={log.id}
                                className={`group flex items-start gap-4 p-3 rounded-xl transition-all border border-transparent hover:border-gray-100 ${styles.bgColor} animate-in fade-in slide-in-from-left-2 duration-300`}
                            >
                                <div className={`mt-0.5 ${styles.iconColor}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                                            {log.timestamp}
                                        </span>
                                    </div>
                                    <p className={`text-sm font-medium leading-relaxed ${styles.textColor}`}>
                                        {log.message}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
