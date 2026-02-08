import { useAi } from '../context';
import { Cpu, Check, ChevronUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const ModelSelector = () => {
    const { availableModels, selectedModel, setSelectedModel } = useAi();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentModel = availableModels.find(m => m.id === selectedModel);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-md transition-all ${isOpen ? 'bg-[#e9ecef] text-[#5bc0de]' : 'text-[#a4afb7] hover:bg-[#e9ecef] hover:text-[#6d7882]'}`}
                title={currentModel?.name || 'Select Model'}
            >
                <Cpu className="w-4 h-4" />
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-[#d5dadf] rounded-md shadow-lg z-[1000] max-h-60 overflow-y-auto p-1 animate-in fade-in slide-in-from-bottom-2">
                    <div className="px-2 py-1.5 text-[10px] font-bold text-[#a4afb7] uppercase tracking-wider">
                        Ollama Engine
                    </div>
                    {availableModels.map((model) => (
                        <button
                            key={model.id}
                            type="button"
                            onClick={() => {
                                setSelectedModel(model.id);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded text-[11px] transition-all ${selectedModel === model.id ? 'bg-[#f1f3f5] text-[#5bc0de] font-bold' : 'text-[#6d7882] hover:bg-[#f8f9fa] hover:text-[#495157]'}`}
                        >
                            <span className="truncate">{model.name}</span>
                            {selectedModel === model.id && <Check className="w-3 h-3" />}
                        </button>
                    ))}
                    {availableModels.length === 0 && (
                        <p className="text-[10px] text-[#a4afb7] p-2 text-center">No models found</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ModelSelector;
