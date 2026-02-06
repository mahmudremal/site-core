import { ShieldAlert } from 'lucide-react';
import { __ } from '@js/utils';
import TaskCard from './TaskCard';

export default function ModerationList({
    tasks,
    onEdit,
    onUpdate,
    onSubmit
}) {
    const pendingCount = tasks.filter(pt => !pt.submitted).length;

    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-50 rounded-lg">
                        <ShieldAlert className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                        {__('Moderation Queue', 'site-core')}
                    </h3>
                </div>
                <span className="px-3 py-1 bg-gray-900 text-white text-xs font-black rounded-full">
                    {pendingCount}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {pendingCount === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <ShieldAlert className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                            {__('No tasks awaiting moderation', 'site-core')}
                        </p>
                    </div>
                ) : (
                    tasks.map((pendingTask) => (
                        <TaskCard
                            key={pendingTask.id}
                            pendingTask={pendingTask}
                            onEdit={onEdit}
                            onUpdate={onUpdate}
                            onSubmit={onSubmit}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
