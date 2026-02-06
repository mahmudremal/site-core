import { useEffect, useRef, useState } from "react";
import promptsService, { get_prompt_id } from "./ai";
import { __, has_yoast } from "./utils";
import { sleep } from '@functions';
import request from '@common/request';
import axios from 'axios';
import { marked } from "marked";

import { Save, X, RotateCcw, LayoutGrid } from 'lucide-react';

import AiWizard from "./components/AiWizard";
import ArticleEditor from "./components/ArticleEditor";

const get_post_title = () => {
  let title;
  const editor = wp?.data?.select?.("core/editor")
  if (editor) {
    title = editor.getCurrentPostAttribute("title")
  }
  const inputTitleElm = document.querySelector("[name='post_title']");
  if (!title && inputTitleElm) {
    title = inputTitleElm.value;
  }
  return title;
}

window.promptsService = promptsService;

export default function Editor({ trigger, config = {} }) {
  const [loading, setLoading] = useState(null);
  const [screenOpen, setScreenOpen] = useState(false);
  const [editorMode, setEditorMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemma3:1b');
  const [prompt, setPrompt] = useState(() => `Write an article about ${get_post_title() || '[]'}`);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState({});

  const [submitting, setSubmitting] = useState(null);
  const [logMessage, setLogMessage] = useState('');
  const [fabOpen, setFabOpen] = useState(false);
  const promptInputRef = useRef(null);

  const handleCancel = () => {
    setEditorMode(false);
    setPlanner(null);
    setContent('');
    setTitle('');
    setMetadata({});
    setLoading(false);
    setFabOpen(false);
  };

  const open_screen = (e) => {
    e.preventDefault();
    setScreenOpen(true);
    document.querySelectorAll('#wpbody-content').forEach(wbc => wbc.style.position = 'relative');
    document.querySelectorAll('body').forEach(wbc => wbc.style.overflow = 'hidden');
  }
  const close_screen = (e = false) => {
    if (e) { e.preventDefault(); }
    setScreenOpen(false);
    document.querySelectorAll('#wpbody-content').forEach(wbc => wbc.style.position = 'unset');
    document.querySelectorAll('body').forEach(wbc => wbc.style.overflow = 'auto');
  }

  useEffect(() => {
    trigger.addEventListener('click', open_screen);
    return () => {
      trigger.removeEventListener('click', open_screen);
    }
  }, []);

  useEffect(() => {
    if (!editorMode && promptInputRef.current) {
      promptInputRef.current.focus();
    }
  }, [promptInputRef, editorMode]);

  const [planner, setPlanner] = useState(null);
  const [automationSettings, setAutomationSettings] = useState({ image: false, text: true });
  const isProcessing = useRef(false);

  useEffect(() => {
    if (config.onprocessai) {
      setAutomationSettings(prev => ({ ...prev, ...config.onprocessai }));
    }
  }, [config.onprocessai]);

  useEffect(() => {
    if (planner && !planner.prompts.some(p => !p.output)) {
      setContent(getFullContent());
    }
  }, [planner]);

  const onProcessMediaAI = async (id, overridePrompts = null) => {
    const targetPrompts = overridePrompts || planner?.prompts;
    const item = targetPrompts?.find(p => p.id === id);
    if (!item) return;

    const searchTerm = item.search || item.prompt;
    if (!searchTerm) return;

    try {
      // 1. Fetch from proxy
      const request_url = `https://proxy.getinstantimages.com/api/unsplash?term=${encodeURIComponent(searchTerm)}&page=1&version=7.0.2`;
      const response = await request(request_url);
      const photos = response.photos || response.results || [];
      if (!photos.length) return;

      const img = photos[0];
      const image_url = img.urls?.full || img.urls?.download_url || img.urls?.img;
      if (!image_url) return;

      // 2. Prepare Upload
      const args = {
        id: img.id,
        url: image_url,
        filename: (img.alt || img.title || searchTerm).replaceAll(/[^a-zA-Z0-9]/g, '-').toLowerCase(),
        title: img.title || searchTerm,
        alt: img.alt || searchTerm,
        extension: img.extension || 'jpg'
      };
      const formData = new FormData();
      Object.keys(args).forEach(key => formData.append(key, args[key]));

      // Fetch blob
      const blobRes = await axios.get(image_url, { responseType: 'blob' });
      formData.append('media_file', blobRes.data, `${args.title.toLowerCase().replaceAll(' ', '-')}.${args.extension}`);

      // 3. Upload to WordPress
      const uploadRes = await axios.post(`https://${location.host}/wp-json/sitecore/v1/instantimage/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data = uploadRes.data;
      if (data && data.attachment_id) {
        const attachment = await new Promise((resolve) => {
          const item = wp.media.model.Attachment.get(data.attachment_id);
          item.fetch().then(() => resolve(item.toJSON()));
        });

        const imgHtml = `<img src="${attachment.url}" alt="${args.alt}" class="w-full rounded-xl my-4" />`;
        setPlanner(prev => ({
          ...prev,
          prompts: prev.prompts.map(p => p.id === id ? { ...p, output: imgHtml } : p)
        }));
      }
    } catch (error) {
      console.error('Auto-media error:', error);
    }
  };

  const onProcessAI = async (id, overridePrompts = null) => {
    const targetPrompts = overridePrompts || planner?.prompts;
    const item = targetPrompts?.find(p => p.id === id);
    if (!item) return;

    if (item.type === 'image') {
      return await onProcessMediaAI(id, overridePrompts);
    }

    const currentIndex = targetPrompts.indexOf(item);
    const previousContent = targetPrompts
      .slice(0, currentIndex)
      .filter(p => p.type === 'prompt' && p.markdown)
      .map(p => p.markdown)
      .join('\n\n')
      .slice(-4000);

    const replacerPrompt = promptsService.article.refine(await promptsService.tools.margePrompt(promptsService.article.replacer.prompt), {
      '{{title}}': title,
      '{{plan}}': planner.text,
      '{{current_section}}': item.prompt,
      '{{keywords}}': metadata.keywords?.join(', ') || '',
      '{{previous_content}}': previousContent || 'This is the first section. Start with a captivating and relevant introduction.'
    });

    let partCompletions = '';
    const result = await promptsService.run(
      [{ role: 'system', content: replacerPrompt }, { role: 'user', content: `Please write this section: ${item.prompt}` }],
      (chunk) => {
        partCompletions += chunk;
        const markdown = promptsService.article.replacer.parse(partCompletions);
        setPlanner(prev => ({
          ...prev,
          prompts: prev.prompts.map(p => p.id === id ? { ...p, markdown, output: marked.parse(markdown, { sanitize: false }) } : p)
        }));
      },
      { stream: false, model: selectedModel, onStatus: (msg) => setLogMessage(msg) }
    );

    setLogMessage('');

    const finalMarkdown = promptsService.article.replacer.parse(result);
    setPlanner(prev => ({
      ...prev,
      prompts: prev.prompts.map(p => (p.id === id ? { ...p, markdown: finalMarkdown, output: marked.parse(finalMarkdown, { sanitize: false }) } : p))
    }));

    return marked.parse(finalMarkdown, { sanitize: false });
  };

  const onOpenMedia = (id) => {
    const item = planner?.prompts?.find(p => p.id === id);
    if (!item) return;
    window.media_config = { term: item.search || item.prompt };
    const frame = wp.media({
      frame: 'select',
      state: 'free_images'
    });
    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();
      const imgHtml = `<img src="${attachment.url}" alt="${attachment.alt || ''}" class="w-full rounded-xl my-4" />`;
      setPlanner(prev => ({
        ...prev,
        prompts: prev.prompts.map(p => p.id === id ? { ...p, output: imgHtml } : p)
      }));
    });
    frame.open();
  };

  const handle_started_prompt = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEditorMode(true);

    const update_metadata = (data) => {
      if (!data) return;
      if (data.title) setTitle(data.title.replace(/^#\s*/, ''));
      if (data.keywords) setMetadata(prev => ({ ...prev, keywords: data.keywords }));
      if (data.meta_desc) setMetadata(prev => ({ ...prev, description: data.meta_desc }));
      return data;
    }

    try {
      // 1. SEO Generation
      let seoCompletions = '';
      const seoResponse = await promptsService.run(
        [{ role: 'system', content: await promptsService.tools.margePrompt(promptsService.article.seo.prompt) }, { role: 'user', content: prompt }],
        (chunk) => {
          seoCompletions += chunk;
          update_metadata(promptsService.article.seo.parse(seoCompletions));
        },
        { stream: false, model: selectedModel, onStatus: (msg) => setLogMessage(msg) }
      );
      const seoData = update_metadata(promptsService.article.seo.parse(seoResponse));

      // 2. Article Planning
      let plannerCompletions = '';
      const plannerPrompt = promptsService.article.refine(await promptsService.tools.margePrompt(promptsService.article.planner.prompt), {
        '{{user_prompt}}': prompt,
        '{{title}}': seoData?.title || 'TBD',
        '{{meta_desc}}': seoData?.meta_desc || 'TBD',
        '{{keywords}}': seoData?.keywords?.join(', ') || 'TBD'
      });

      const plannerResponse = await promptsService.run(
        [{ role: 'system', content: plannerPrompt }, { role: 'user', content: `Start planning for: ${prompt}` }],
        (chunk) => {
          if (loading) setLoading(false);
          plannerCompletions += chunk;
          setContent(`<div class="flex items-center gap-3 p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse text-slate-500"><div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div> ${__('Drafting article blueprint...')}</div>`);
        },
        { stream: false, model: selectedModel, onStatus: (msg) => setLogMessage(msg) }
      );

      setLogMessage('');

      const trimmed = promptsService.article.planner.parse(plannerResponse);
      setPlanner(trimmed);

      // Recursive sequential processing to ensure state consistency
      const processSequentially = async (prompts, index = 0) => {
        if (index >= prompts.length) {
          isProcessing.current = false;
          return;
        }

        const p = prompts[index];
        const shouldProcess = (p.type === 'prompt' && automationSettings.text) ||
          (p.type === 'image' && automationSettings.image);

        if (shouldProcess) {
          console.info(`Auto-processing ${p.type} (${p.prompt}): ${p.id}`);
          await onProcessAI(p.id, prompts);
        }

        await processSequentially(prompts, index + 1);
      };

      if (!isProcessing.current) {
        isProcessing.current = true;
        processSequentially(trimmed.prompts);
      }

    } catch (error) {
      console.error('Generation Error:', error);
      isProcessing.current = false;
    } finally {
      setLoading(false);
    }
  }

  const getFullContent = () => {
    if (!planner || !planner.text) return content;
    return planner.text.replace(/@@PROMPT_(\d+)@@/g, (_, num) => {
      const id = get_prompt_id(num);
      const data = planner.prompts.find(p => p.id === id);
      return data?.output || '';
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (!config?._rest) { return; }

    const finalContent = getFullContent();

    sleep(1000)
      .then(() => {
        const _editor = tinymce.get('content');
        if (_editor) { _editor.setContent(finalContent); }
        if (has_yoast()) {
          const get_field = (key) => {
            const id = YoastSEO.app.config.elementTarget.find(i => i.includes(key));
            if (!id) { return []; }
            return document.querySelectorAll('#' + id);
          }
          const _seo_metas = {
            content: finalContent,
            excerpt: metadata.description,
            metadesc: metadata.description,
          }
          Object.keys(_seo_metas).forEach(metaKey => {
            get_field(metaKey).forEach(elem => {
              if (!elem || !elem?.nodeType || !_seo_metas?.[metaKey]) { return; }
              elem.value = _seo_metas[metaKey];
            });
          });
          document.querySelectorAll('#new-tag-post_tag').forEach(elem => {
            elem.value = metadata.keywords.join(',');
          });
          document.querySelectorAll('#title[name="post_title"]').forEach(elem => {
            elem.value = title;
          });
        }
      })
      .then(async () => await sleep(500))
      .then(() => setSubmitting(false))
      .then(async () => await sleep(500))
      .then(() => close_screen())
      .catch(err => console.error(err))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className={`absolute top-0 left-0 w-full h-full z-[1000] flex items-center justify-center transition-all duration-300 ${screenOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={() => !loading && close_screen()}
      />

      <div className={`absolute top-0 left-0 w-full max-w-[calc(100%-20px)] h-[95vh] mx-5 my-2 px-4 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col transform transition-all duration-500 ${screenOpen ? 'scale-100 translate-y-0' : ''}`}>

        {/* Subtle Decorative Gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div className="flex-1 overflow-y-auto p-2 md:p-6">
          {!editorMode ? (
            <div className="h-full flex items-center justify-center">
              <AiWizard
                prompt={prompt}
                setPrompt={setPrompt}
                loading={loading}
                handle_started_prompt={handle_started_prompt}
                promptInputRef={promptInputRef}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                onClose={() => {
                  setEditorMode(false);
                  setLoading(false);
                  close_screen();
                }}
              />
            </div>
          ) : (
            <div className="relative h-full flex flex-col">
              {logMessage && (
                <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-blue-50/50 border border-blue-100/50 rounded-xl text-blue-600 animate-in fade-in slide-in-from-top-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium uppercase tracking-wider">{logMessage}</span>
                </div>
              )}
              <div className="flex-1 bg-slate-50/50 rounded-[2.5rem] p-4 md:p-8 overflow-y-auto mb-4">
                <ArticleEditor
                  title={title}
                  setTitle={setTitle}
                  content={content}
                  setContent={setContent}
                  metadata={metadata}
                  setMetadata={setMetadata}
                  loading={loading}
                  planner={planner}
                  onProcessAI={onProcessAI}
                  onOpenMedia={onOpenMedia}
                />
              </div>

              {/* Floating Action Menu */}
              <div className="absolute bottom-4 right-4 flex flex-col items-end gap-3 z-[60]">
                {fabOpen && (
                  <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <button
                      type="button"
                      onClick={handleCancel}
                      title={__('Reset Content')}
                      className="flex items-center justify-center cursor-pointer w-12 h-12 bg-white text-slate-600 rounded-full shadow-lg border border-slate-100 hover:bg-slate-50 transition-all active:scale-95 group"
                    >
                      <RotateCcw size={20} className="group-hover:rotate-[-45deg] transition-transform" />
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSubmit}
                      title={__('Save to WordPress')}
                      className="flex items-center justify-center cursor-pointer w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? <Save size={20} className="animate-pulse" /> : <Save size={20} />}
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setFabOpen(prev => !prev)}
                  className={`flex items-center justify-center cursor-pointer w-14 h-14 rounded-full shadow-2xl transition-all duration-300 active:scale-90 ${fabOpen ? 'bg-slate-900 text-white rotate-90' : 'bg-white text-slate-900 rotate-0 border border-slate-100'}`}
                >
                  {fabOpen ? <X size={24} /> : <LayoutGrid size={24} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}