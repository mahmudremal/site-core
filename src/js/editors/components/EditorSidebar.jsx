import React from 'react';
import { Loader } from 'lucide-react';
import { __ } from '../utils';

export default function EditorSidebar({
  submitting,
  handleSubmit,
  close_screen,
}) {
  return (
    <div className="p-5 shadow-sm w-[200px]">
      <div className="sticky top-10">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full text-white flex justify-center items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              {submitting ? <Loader className="animate-spin" /> : __('Proceed')}
            </button>
            <button
              type="button"
              onClick={(e) => close_screen(e)}
              className="w-full text-white flex justify-center items-center bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800"
            >
              {__('Cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
