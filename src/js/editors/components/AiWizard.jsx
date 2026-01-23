import { WandSparkles, Loader, X } from 'lucide-react';
import { __ } from '../utils';
import ModelSelector from './ModelSelector';

export default function AiWizard({
  prompt,
  setPrompt,
  loading,
  handle_started_prompt,
  promptInputRef,
  selectedModel,
  setSelectedModel,
  onClose = () => { }
}) {
  return (
    <>
      <div className="absolute inset-0">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      </div>
      <div className="flex flex-col justify-center text-center m-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 cursor-pointer hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-300"
        >
          <X />
        </button>
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-center mb-4">{__('Write with AI')}</h1>
          <h2 className="text-lg text-center mb-8">{__('Get help drafting, editing, and adding visuals - all in one place.')}</h2>
          <div className="relative">
            <textarea
              rows={4}
              value={prompt}
              ref={promptInputRef}
              placeholder={__('Enter a topic to get started')}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  if (e.ctrlKey || e.key === 'Enter') {
                    handle_started_prompt(e);
                  }
                }
              }}
            ></textarea>
            <button
              disabled={loading}
              onClick={(e) => handle_started_prompt(e)}
              className="absolute right-0 bottom-0 font-semibold rounded-lg flex items-center bg-transparent border-none text-gray-300 p-3 hover:text-gray-600"
            >
              {loading ? <Loader size={20} className="animate-spin" /> : <WandSparkles size={20} />}
            </button>
          </div>
          <div className="mt-4">
            <ModelSelector selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
          </div>
        </div>
      </div>
    </>
  );
}
