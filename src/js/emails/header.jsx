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
      if (prev && prev?.window?.close) { prev.window.close(); }
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
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setSidebar(prev => ({ ...prev, visible: !prev.visible }))} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div onClick={() => sidebar.element && setSidebar(prev => ({ ...prev, element: null }))} className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              {sidebar.element ? <Plus size={16} role="button" className="text-white" /> : <FileText size={16} role="button" className="text-white" />}
            </div>
            <div>
              <h1 className="font-semibold text-lg text-gray-900">
                {template?.title || 'Email Template Builder'}
              </h1>
              <p className="text-sm text-gray-500">Draft • Last saved 2 minutes ago</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 rounded-md transition-all ${previewMode === 'desktop'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => setPreviewMode('tablet')}
              className={`p-2 rounded-md transition-all ${previewMode === 'tablet'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <Tablet size={16} />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 rounded-md transition-all ${previewMode === 'mobile'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <Smartphone size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Undo size={18} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Redo size={18} />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300"></div> */}

          <div className="w-px h-6 bg-gray-300"></div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              launch_preview_tab();
            }}
            disabled={!!!template?.id}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Eye size={16} />
            Preview
          </button>

          {/* <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Download size={16} />
            Export
          </button>

          <button
            onClick={saveTemplate}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
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
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:hover:bg-gray-400 text-white rounded-lg transition-colors font-medium"
          >
            {saved ? 'Saved' : saving ? 'Saving...' : 'Publish'}
            {saved ? <Check size={16} className="" /> : saving ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};