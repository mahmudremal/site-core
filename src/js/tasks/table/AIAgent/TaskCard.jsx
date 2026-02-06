import { Clock, Send, PenIcon, CheckCircle2 } from 'lucide-react';
import { JsonEditor } from 'json-edit-react';
import { __ } from '@js/utils';

export default function TaskCard({
    pendingTask,
    onEdit,
    onUpdate,
    onSubmit
}) {
    const isUrgent = pendingTask.countdown <= 5;

    return (
        <div className={`group relative bg-white border ${isUrgent ? 'border-red-200 shadow-red-50' : 'border-gray-200'} rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1`}>
            {/* Timer Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                <div
                    className={`h-full transition-all duration-1000 ease-linear ${isUrgent ? 'bg-red-500' : 'bg-scprimary'}`}
                    style={{ width: `${(pendingTask.countdown / 15) * 100}%` }}
                ></div>
            </div>

            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-scprimary"></span>
                        <h4 className="font-bold text-gray-900">Task {pendingTask.task.id}</h4>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${isUrgent ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-50 text-gray-600'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {pendingTask.countdown}s
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden relative">
                    {pendingTask.editing ? (
                        <div className="p-2">
                            <JsonEditor
                                data={pendingTask.result}
                                setData={(newValue) => onUpdate(pendingTask.id, newValue)}
                            />
                        </div>
                    ) : (
                        <div className="relative">
                            <pre className="text-[11px] font-mono leading-relaxed p-4 text-gray-700 max-h-48 overflow-auto">
                                {JSON.stringify(pendingTask.result, null, 2)}
                            </pre>
                            <div
                                className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer backdrop-blur-[1px]"
                                onClick={() => onEdit(pendingTask.id)}
                            >
                                <div className="bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 transform transition-transform group-hover:scale-110">
                                    <PenIcon className="w-4 h-4 text-scprimary" />
                                    <span className="text-sm font-bold text-gray-900">{__('Edit Result', 'site-core')}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <button
                        onClick={() => onSubmit(pendingTask.id)}
                        disabled={pendingTask.submitted}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${pendingTask.submitted
                            ? 'bg-green-500 text-white cursor-default'
                            : 'bg-gray-900 text-white hover:bg-scprimary hover:shadow-lg hover:shadow-scprimary/20 active:scale-95'
                            }`}
                    >
                        {pendingTask.submitted ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                {__('Submitted', 'site-core')}
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                {__('Approve & Submit', 'site-core')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
