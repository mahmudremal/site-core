import { FileText } from 'lucide-react';
import React from 'react';

export const EmptyState = ({
  Icon = null,
  show_buttons = true,
  title = 'Start Building Your Email',
  subtitle = 'Select elements from the sidebar to start creating your email template. Drag and drop to arrange your content exactly how you want it.'
}) => {
  if (!Icon) Icon = FileText;
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icon size={32} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        {show_buttons && <div className="flex items-center justify-center gap-4">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Choose Template
          </button>
          <button className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
            Start from Scratch
          </button>
        </div>}
      </div>
    </div>
  );
}

export default EmptyState;