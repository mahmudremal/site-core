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
        <div className="sc-relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`sc-p-2 sc-rounded-md sc-transition-all ${isOpen ? 'sc-bg-[#e9ecef] sc-text-[#5bc0de]' : 'sc-text-[#a4afb7] hover:sc-bg-[#e9ecef] hover:sc-text-[#6d7882]'}`}
                title={currentModel?.name || 'Select Model'}
            >
                <Cpu className="sc-w-4 sc-h-4" />
            </button>

            {isOpen && (
                <div className="sc-absolute sc-bottom-full sc-left-0 sc-mb-2 sc-w-48 sc-bg-white sc-border sc-border-[#d5dadf] sc-rounded-md sc-shadow-lg sc-z-[1000] sc-max-h-60 sc-overflow-y-auto sc-p-1 sc-animate-in sc-fade-in sc-slide-in-from-bottom-2">
                    <div className="sc-px-2 sc-py-1.5 sc-text-[10px] sc-font-bold sc-text-[#a4afb7] sc-uppercase sc-tracking-wider">
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
                            className={`sc-w-full sc-flex sc-items-center sc-justify-between sc-px-3 sc-py-2 sc-rounded sc-text-[11px] sc-transition-all ${selectedModel === model.id ? 'sc-bg-[#f1f3f5] sc-text-[#5bc0de] sc-font-bold' : 'sc-text-[#6d7882] hover:sc-bg-[#f8f9fa] hover:sc-text-[#495157]'}`}
                        >
                            <span className="sc-truncate">{model.name}</span>
                            {selectedModel === model.id && <Check className="sc-w-3 sc-h-3" />}
                        </button>
                    ))}
                    {availableModels.length === 0 && (
                        <p className="sc-text-[10px] sc-text-[#a4afb7] sc-p-2 sc-text-center">No models found</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ModelSelector;
