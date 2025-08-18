import { FileText } from 'lucide-react';
import React from 'react';

export const EmptyState = ({
  Icon=null,
  show_buttons = true,
  title = 'Start Building Your Email',
  subtitle='Select elements from the sidebar to start creating your email template. Drag and drop to arrange your content exactly how you want it.'
}) => {
  if (!Icon) Icon = FileText;
  return (
    <div className="xpo_flex-1 xpo_flex xpo_items-center xpo_justify-center">
      <div className="xpo_text-center xpo_max-w-md">
        <div className="xpo_w-24 xpo_h-24 xpo_border-2 xpo_border-dashed xpo_border-gray-200 xpo_rounded-2xl xpo_flex xpo_items-center xpo_justify-center xpo_mx-auto xpo_mb-6">
          <Icon size={32} className="xpo_text-gray-400" />
        </div>
        <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">{title}</h2>
        <p className="xpo_text-gray-600 xpo_mb-6">{subtitle}</p>
        {show_buttons && <div className="xpo_flex xpo_items-center xpo_justify-center xpo_gap-4">
          <button className="xpo_px-6 xpo_py-3 xpo_bg-blue-600 hover:xpo_xpo_bg-blue-700 xpo_text-white xpo_rounded-lg xpo_font-medium xpo_transition-colors">
            Choose Template
          </button>
          <button className="xpo_px-6 xpo_py-3 xpo_border xpo_border-gray-300 hover:xpo_xpo_bg-gray-50 xpo_text-gray-700 xpo_rounded-lg xpo_font-medium xpo_transition-colors">
            Start from Scratch
          </button>
        </div>}
      </div>
    </div>
  );
}

export default EmptyState;