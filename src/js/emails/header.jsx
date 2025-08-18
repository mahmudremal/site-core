import { Eye, Monitor, Save, Smartphone, Tablet, Menu, ChevronDown, FileText, Download, Undo, Redo, Loader2, Plus, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useBuilder } from './context';

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, ms);
  })
}

export const Header = () => {
  const { template, previewMode, setPreviewMode, saveTemplate, sidebar, setSidebar } = useBuilder();
  const [saved, setSaved] = useState(null);
  const [saving, setSaving] = useState(null);
  const [previewTab, setPreviewTab] = useState(null);

  const launch_preview_tab = () => {
    setPreviewTab(prev => {
      if (prev && prev?.window?.close) {prev.window.close();}
      return window.open(`${location.origin}/email-templates/${template.id}/preview`);
    });
  }
  
  useEffect(() => {
    if (!previewTab || !previewTab?.window) return;

    const delay = setTimeout(() => {
      if (!previewTab?.window?.location?.reload) return;
      // previewTab.window.location.reload();
    }, 1500);
  
    return () => clearTimeout(delay);
  }, [template]);

  return (
    <div className="xpo_bg-white xpo_border-b xpo_border-gray-200 xpo_px-6 xpo_py-4">
      <div className="xpo_flex xpo_items-center xpo_justify-between">
        <div className="xpo_flex xpo_items-center xpo_gap-4">
          <button type="button" onClick={() => setSidebar(prev => ({...prev, visible: !prev.visible}))} className="xpo_p-2 xpo_hover:xpo_bg-gray-100 xpo_rounded-lg xpo_transition-colors">
            <Menu size={20} />
          </button>
        
          <div className="xpo_flex xpo_items-center xpo_gap-3">
            <div onClick={() => sidebar.element && setSidebar(prev => ({...prev, element: null}))} className="xpo_w-8 xpo_h-8 xpo_bg-blue-500 xpo_rounded-lg xpo_flex xpo_items-center xpo_justify-center">
              {sidebar.element ? <Plus size={16} role="button" className="xpo_text-white" /> : <FileText size={16} role="button" className="xpo_text-white" />}
            </div>
            <div>
              <h1 className="xpo_font-semibold xpo_text-lg xpo_text-gray-900">
                {template?.title || 'Email Template Builder'}
              </h1>
              <p className="xpo_text-sm xpo_text-gray-500">Draft • Last saved 2 minutes ago</p>
            </div>
          </div>
        </div>

        <div className="xpo_flex xpo_items-center xpo_gap-4">
          <div className="xpo_flex xpo_bg-gray-100 xpo_rounded-lg xpo_p-1">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`xpo_p-2 xpo_rounded-md xpo_transition-all ${
                previewMode === 'desktop' 
                  ? 'xpo_bg-white xpo_shadow-sm xpo_text-blue-600' 
                  : 'xpo_text-gray-600 hover:xpo_text-gray-800'
              }`}
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => setPreviewMode('tablet')}
              className={`xpo_p-2 xpo_rounded-md xpo_transition-all ${
                previewMode === 'tablet' 
                  ? 'xpo_bg-white xpo_shadow-sm xpo_text-blue-600' 
                  : 'xpo_text-gray-600 hover:xpo_text-gray-800'
              }`}
            >
              <Tablet size={16} />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`xpo_p-2 xpo_rounded-md xpo_transition-all ${
                previewMode === 'mobile' 
                  ? 'xpo_bg-white xpo_shadow-sm xpo_text-blue-600' 
                  : 'xpo_text-gray-600 hover:xpo_text-gray-800'
              }`}
            >
              <Smartphone size={16} />
            </button>
          </div>
        </div>

        <div className="xpo_flex xpo_items-center xpo_gap-4">
          {/* <div className="xpo_flex xpo_items-center xpo_gap-2">
            <button className="xpo_p-2 xpo_hover:xpo_bg-gray-100 xpo_rounded-lg xpo_transition-colors">
              <Undo size={18} />
            </button>
            <button className="xpo_p-2 xpo_hover:xpo_bg-gray-100 xpo_rounded-lg xpo_transition-colors">
              <Redo size={18} />
            </button>
          </div>

          <div className="xpo_w-px xpo_h-6 xpo_bg-gray-300"></div> */}

          <div className="xpo_w-px xpo_h-6 xpo_bg-gray-300"></div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              launch_preview_tab();
            }}
            disabled={!!!template?.id}
            className="xpo_flex xpo_items-center xpo_gap-2 xpo_px-4 xpo_py-2 xpo_text-gray-700 xpo_hover:xpo_bg-gray-100 xpo_rounded-lg xpo_transition-colors"
          >
            <Eye size={16} />
            Preview
          </button>

          {/* <button className="xpo_flex xpo_items-center xpo_gap-2 xpo_px-4 xpo_py-2 xpo_text-gray-700 xpo_hover:xpo_bg-gray-100 xpo_rounded-lg xpo_transition-colors">
            <Download size={16} />
            Export
          </button>

          <button
            onClick={saveTemplate}
            className="xpo_flex xpo_items-center xpo_gap-2 xpo_px-6 xpo_py-2 xpo_bg-blue-600 xpo_hover:xpo_bg-blue-700 xpo_text-white xpo_rounded-lg xpo_transition-colors xpo_font-medium"
          >
            <Save size={16} />
            Save
          </button> */}

          <button
            disabled={saving}
            onClick={() => Promise.resolve(1)
              .then(() => setSaving(true))
              .then(async () => await saveTemplate('publish'))
              .then(async () => await sleep(1000))
              .then(() => setSaved(true))
              .then(async () => await sleep(2000))
              .then(() => setSaved(false))
              .finally(() => setSaving(false))}
            className="xpo_flex xpo_items-center xpo_gap-2 xpo_px-4 xpo_py-2 xpo_bg-green-600 hover:xpo_bg-green-700 disabled:xpo_bg-gray-300 disabled:hover:xpo_bg-gray-400 xpo_text-white xpo_rounded-lg xpo_transition-colors xpo_font-medium"
          >
            {saved ? 'Saved' : saving ? 'Saving...' : 'Publish'}
            {saved ? <Check size={16} className="" /> : saving ? <Loader2 size={16} className="xpo_animate-spin" /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};