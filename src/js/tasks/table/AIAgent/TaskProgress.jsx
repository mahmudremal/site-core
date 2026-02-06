import { Bot } from 'lucide-react';
import { __ } from '@js/utils';

export default function TaskProgress({ currentTask, progress }) {
    if (!currentTask) return null;

    return (
        <div className="bg-scprimary/5 border border-scprimary/10 rounded-2xl p-5 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-scprimary text-white flex items-center justify-center shadow-lg shadow-scprimary/20">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-scprimary uppercase tracking-wider">
                            {__('Active Processing', 'site-core')}
                        </span>
                        <h3 className="text-sm font-semibold text-gray-900">
                            {currentTask.id} • <span className="text-gray-500 uppercase">{currentTask.task_type?.replace(/_/g, ' ')}</span>
                        </h3>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-xl font-black text-scprimary tabular-nums">
                        {progress}%
                    </span>
                </div>
            </div>

            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-scprimary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                >
                    <div className="w-full h-full animate-progress-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent bg-[length:200%_100%]"></div>
                </div>
            </div>
        </div>
    );
}
