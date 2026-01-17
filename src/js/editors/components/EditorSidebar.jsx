import React from 'react';
import { Loader } from 'lucide-react';
import { __ } from '../utils';

export default function EditorSidebar({
  submitting,
  handleSubmit,
  close_screen,
}) {
  return (
    <div className="xpo_p-5 xpo_shadow-sm xpo_w-[200px]">
      <div className="xpo_sticky xpo_top-10">
        <div className="xpo_flex xpo_flex-col xpo_gap-2">
          <div className="xpo_flex xpo_flex-col xpo_gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="xpo_w-full xpo_text-white xpo_flex xpo_justify-center xpo_items-center xpo_bg-blue-700 hover:xpo_bg-blue-800 focus:xpo_ring-4 focus:xpo_ring-blue-300 xpo_font-medium xpo_rounded-lg xpo_text-sm xpo_px-5 xpo_py-2.5 dark:xpo_bg-blue-600 dark:hover:xpo_bg-blue-700 focus:xpo_outline-none dark:focus:xpo_ring-blue-800"
            >
              {submitting ? <Loader className="xpo_animate-spin" /> : __('Proceed')}
            </button>
            <button
              type="button"
              onClick={(e) => close_screen(e)}
              className="xpo_w-full xpo_text-white xpo_flex xpo_justify-center xpo_items-center xpo_bg-gray-700 hover:xpo_bg-gray-800 focus:xpo_ring-4 focus:xpo_ring-gray-300 xpo_font-medium xpo_rounded-lg xpo_text-sm xpo_px-5 xpo_py-2.5 dark:xpo_bg-gray-600 dark:hover:xpo_bg-gray-700 focus:xpo_outline-none dark:focus:xpo_ring-gray-800"
            >
              {__('Cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
