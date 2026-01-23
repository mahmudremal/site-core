import React from 'react';
import { WandSparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { __ } from '../utils';

export default function PromptBlock({ data, onProcessAI, onOpenMedia }) {
    const isImage = data?.type === 'image';
    const isDone = !!data?.output;

    if (isDone) {
        return <div dangerouslySetInnerHTML={{ __html: data.output }} />;
    }

    const label = isImage ? __('Generating Image Concept...') : __('Writing Article Section...');
    const icon = isImage ? <ImageIcon className="text-blue-500" /> : <WandSparkles className="text-purple-500" />;

    return (
        <div className="my-6 p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-50 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-progress-infinite" />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner">
                        {icon}
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">
                            {label}
                        </div>
                        <p className="text-slate-700 font-semibold leading-tight max-w-md">
                            {data?.prompt}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onProcessAI(data)}
                        className="flex items-center gap-2 px-5 py-2.5 cursor-pointer bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all active:scale-95"
                    >
                        <WandSparkles size={16} />
                        {__('Process AI')}
                    </button>

                    {isImage && (
                        <button
                            onClick={() => onOpenMedia(data)}
                            className="flex items-center gap-2 px-5 py-2.5 cursor-pointer bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all active:scale-95"
                        >
                            <ImageIcon size={16} />
                            {__('Media Library')}
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-6 space-y-3 opacity-40">
                <div className="h-2.5 bg-slate-100 rounded w-full"></div>
                <div className="h-2.5 bg-slate-100 rounded w-11/12"></div>
            </div>
        </div>
    );
}
