import { Play, StopCircle, RotateCcw } from 'lucide-react';
import { __ } from '@js/utils';

export default function AgentHeader({
    isRunning,
    loading,
    models,
    currentModel,
    onStart,
    onStop,
    onRunSingle,
    onModelChange,
    moderate,
    onModerateToggle
}) {
    return (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className={`relative flex h-3 w-3`}>
                            {isRunning && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${isRunning ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        </div>
                        {__('AI Agent Control Panel', 'site-core')}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {isRunning ? __('Agent is actively processing tasks...', 'site-core') : __('Agent is currently idle', 'site-core')}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
                        {!isRunning && (
                            <select
                                value={currentModel}
                                onChange={e => onModelChange(e.target.value)}
                                className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer px-3 py-2"
                            >
                                {models.map(({ name, model, details: { parameter_size: size = null } }, mIndex) => (
                                    <option key={mIndex} value={model}>
                                        {name}{size && ` (${size})`}
                                    </option>
                                ))}
                            </select>
                        )}

                        <label className="flex items-center gap-2 px-3 py-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                            <input
                                type="checkbox"
                                checked={moderate}
                                disabled={isRunning || loading}
                                onChange={(e) => onModerateToggle(e.target.checked)}
                                className="w-4 h-4 text-scaccent border-gray-300 rounded focus:ring-scaccent"
                            />
                            <span className="text-sm font-medium text-gray-700">{__('Moderation', 'site-core')}</span>
                        </label>
                    </div>

                    <div className="flex items-center gap-2">
                        {!isRunning ? (
                            <button
                                onClick={onStart}
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2.5 rounded-xl bg-scaccent text-white hover:bg-scaccent/90 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                            >
                                <Play className="w-4 h-4 mr-2" />
                                {__('Start Agent', 'site-core')}
                            </button>
                        ) : (
                            <button
                                onClick={onStop}
                                className="inline-flex items-center px-4 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all shadow-sm active:scale-95"
                            >
                                <StopCircle className="w-4 h-4 mr-2" />
                                {__('Stop Agent', 'site-core')}
                            </button>
                        )}

                        <button
                            onClick={onRunSingle}
                            disabled={loading || isRunning}
                            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition-all shadow-sm active:scale-95 text-sm"
                        >
                            <RotateCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            {__('Single Task', 'site-core')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
