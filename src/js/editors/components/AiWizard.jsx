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
      <div className="xpo_absolute xpo_inset-0">
        <div className="xpo_absolute xpo_inset-0 xpo_-z-10 xpo_h-full xpo_w-full xpo_bg-white xpo_bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] xpo_bg-[size:14px_24px]"></div>
      </div>
      <div className="xpo_flex xpo_flex-col xpo_justify-center xpo_max-w-[600px] xpo_text-center xpo_m-auto xpo_h-screen">
        <button
          type="button"
          className="xpo_absolute xpo_top-3 xpo_right-3"
          onClick={onClose}
        >
          <X />
        </button>
        <div className="xpo_flex xpo_flex-col xpo_gap-3">
          <h1 className="xpo_text-3xl xpo_font-bold xpo_text-center xpo_mb-4">{__('Write with AI')}</h1>
          <h2 className="xpo_text-lg xpo_text-center xpo_mb-8">{__('Get help drafting, editing, and adding visuals - all in one place.')}</h2>
          <div className="xpo_relative">
            <textarea
              rows={4}
              value={prompt}
              ref={promptInputRef}
              placeholder={__('Enter a topic to get started')}
              onChange={(e) => setPrompt(e.target.value)}
              className="xpo_w-full xpo_border xpo_border-gray-300 xpo_rounded-lg xpo_px-4 xpo_py-2 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-blue-500"
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
              className="xpo_absolute xpo_right-0 xpo_bottom-0 xpo_font-semibold xpo_rounded-lg xpo_flex xpo_items-center xpo_bg-transparent xpo_border-none xpo_text-gray-300 xpo_p-3 hover:xpo_text-gray-600"
            >
              {loading ? <Loader size={20} className="xpo_animate-spin" /> : <WandSparkles size={20} />}
            </button>
          </div>
          <div className="xpo_mt-4">
            <ModelSelector selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
          </div>
        </div>
      </div>
    </>
  );
}
