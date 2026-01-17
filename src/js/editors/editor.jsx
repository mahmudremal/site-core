import { useEffect, useRef, useState } from "react";
import { sleep } from '@functions';
import { __, has_yoast } from "./utils";
import { chat, get_prompt_id, PROMPTS } from "./ai";
import { marked } from "marked";

import AiWizard from "./components/AiWizard";
import ArticleEditor from "./components/ArticleEditor";
import EditorSidebar from "./components/EditorSidebar";

export default function Editor({ trigger, config = {} }) {
  const [loading, setLoading] = useState(null);
  const [screenOpen, setScreenOpen] = useState(false);
  const [editorMode, setEditorMode] = useState(false);
  const [prompt, setPrompt] = useState('Write an article about Figma');
  const [selectedModel, setSelectedModel] = useState('gemma3:1b');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState({});

  const [submitting, setSubmitting] = useState(null);
  const promptInputRef = useRef(null);

  const open_screen = (e) => {
    e.preventDefault();
    setScreenOpen(true);
    document.querySelectorAll('#wpbody-content').forEach(wbc => wbc.style.position = 'relative');
  }
  const close_screen = (e = false) => {
    if (e) { e.preventDefault(); }
    setScreenOpen(false);
    document.querySelectorAll('#wpbody-content').forEach(wbc => wbc.style.position = 'unset');
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

  const handle_started_prompt = async (e) => {
    e.preventDefault();
    setLoading(true);
    await sleep(500);
    setEditorMode(true);

    const update_metadata = (data) => {
      if (data && data?.title) { setTitle(data.title); }
      if (data && data?.keywords) { setMetadata(prev => ({ ...prev, keywords: data.keywords })); }
      if (data && data?.meta_desc) { setMetadata(prev => ({ ...prev, description: data.meta_desc })); }
      return data;
    }

    try {
      let completions = '';
      const seoResponse = await chat(
        [{ role: 'system', content: PROMPTS.article.seo.prompt }, { role: 'user', content: `${prompt}` }],
        (chunk) => {
          completions += chunk;
          return update_metadata(PROMPTS.article.seo.parse(completions));
        },
        { model: selectedModel }
      );

      const seoData = update_metadata(PROMPTS.article.seo.parse(seoResponse));

      let plannerCompletions = '';

      const plannerResponse = await chat(
        [
          { role: 'system', content: PROMPTS.article.planner.prompt },
          {
            role: 'user',
            content: `${prompt}\n\n Content title: ${seoData?.title ?? 'Not decided'}\nContent meta description: "${seoData?.meta_desc ?? 'N/A'}"\nContent SEO Keywords: "${seoData.keywords.join(', ')}"`
          }
        ],
        (chunk) => {
          if (loading) { setLoading(false); }
          plannerCompletions += chunk;
          setContent(marked(plannerCompletions, { sanitize: true }));
        },
        { model: selectedModel }
      );

      setContent(marked(plannerResponse, { sanitize: true }));
      const trimmed = PROMPTS.article.planner.parse(plannerResponse);

      window.console.log(trimmed)


      const generated_part = (id, resText, done = false) => {
        trimmed.prompts = trimmed.prompts.map(i => i.id === id ? { ...i, output: resText } : i);
        setContent(
          marked(
            trimmed.text.replace(/@@PROMPT_(\d+)@@/g, (_, num) => {
              const data = trimmed.prompts.find(i => i.id === get_prompt_id(num));
              return !done ? `<div class="prompt-block xpo_animate-pulse xpo_min-h-12 xpo_bg-gray-200 xpo_rounded xpo_p-2">${data?.output ?? data?.prompt ?? __('Loading...')}</div>` : data?.output ?? '';
            }),
            { sanitize: true }
          )
        );
      };


      for (const { id, type, prompt: partPrompt } of trimmed.prompts) {
        if (type !== 'PROMPT:') { continue; }
        let partCompletions = '';
        await chat(
          [{ role: 'system', content: PROMPTS.article.replacer.prompt }, { role: 'user', content: partPrompt }],
          (chunk) => {
            partCompletions += chunk;
            generated_part(id, PROMPTS.article.replacer.parse(partCompletions));
          },
          { stream: true, model: selectedModel }
        ).then(res => generated_part(id, PROMPTS.article.replacer.parse(res), true));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (!config?._rest) { return; }
    sleep(1000)
      .then(() => {
        const _editor = tinymce.get('content');
        if (_editor) { _editor.setContent(content); }
        if (has_yoast()) {
          const get_field = (key) => {
            const id = YoastSEO.app.config.elementTarget.find(i => i.includes(key));
            if (!id) { return []; }
            return document.querySelectorAll('#' + id);
          }
          const _seo_metas = {
            content: content,
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
    <div className={`xpo_absolute xpo_flex-col xpo_gap-0 xpo_z-[1000] xpo_w-full xpo_h-full xpo_top-0 xpo_left-0 ${screenOpen ? 'xpo_flex' : 'xpo_hidden'}`}>
      <div className="xpo_w-full xpo_h-full xpo_top-0 xpo_left-0 xpo_bg-slate-600/40" onClick={close_screen}></div>
      <div className={`xpo_w-full xpo_h-full xpo_top-0 left-0 xpo_p-3 ${screenOpen ? 'xpo_absolute' : 'xpo_hidden'}`}>
        <div className={`xpo_bg-white xpo_p-3 xpo_rounded-lg xpo_shadow-md xpo_border-none xpo_relative xpo_w-full ${!editorMode ? 'xpo_flex xpo_flex-col xpo_justify-center xpo_items-center' : ''}`}>
          {!editorMode ? (
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
                setScreenOpen(false);
              }}
            />
          ) : (
            <div className="xpo_w-full xpo_h-full xpo_p-0 xpo_grid xpo_grid-cols-[1fr_auto] xpo_gap-3">
              <ArticleEditor
                title={title}
                setTitle={setTitle}
                content={content}
                setContent={setContent}
                metadata={metadata}
                setMetadata={setMetadata}
                loading={loading}
              />
              <EditorSidebar
                submitting={submitting}
                handleSubmit={handleSubmit}
                close_screen={close_screen}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}