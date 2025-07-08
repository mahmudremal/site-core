import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Edit, Trash2, Plus, WandSparkles, Loader } from "lucide-react";
import { sleep } from '@functions';
import { __, Popup, ClipboardInput, has_yoast } from "./utils";
import { AI_CONTENT_WRITER, chat, chata, get_prompt_id, PROMPTS } from "./ai";
import InlineEditor from "./inlineeditor";
import { marked } from "marked";

export default function Editor({ trigger, config = {} }) {
  const [loading, setLoading] = useState(null);
  const [messages, setMessages] = useState([]);
  const [screenOpen, setScreenOpen] = useState(false);
  const [editorMode, setEditorMode] = useState(false);
  const [prompt, setPrompt] = useState('Write an article about Figma');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState({});
  // const [updatedContent, setUpdatedContent] = useState('');

  const [submitting, setSubmitting] = useState(null);
  const promptInputRef = useRef(null);
  
  const open_screen = (e) => {
    e.preventDefault();setScreenOpen(true);
    document.querySelectorAll('#wpbody-content').forEach(wbc => wbc.style.position = 'relative');
  }
  const close_screen = (e = false) => {
    if (e) {e.preventDefault();}
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
  }, [promptInputRef]);
  

  const handle_started_prompt = async (e) => {
    e.preventDefault();
    setLoading(true);
    sleep(500).then(() => {
      setEditorMode(true);
      // 
      const update_metadata = (data) => {
        if (data && data?.title) {setTitle(data.title);}
        if (data && data?.keywords) {setMetadata(prev => ({...prev, keywords: data.keywords}));}
        if (data && data?.meta_desc) {setMetadata(prev => ({...prev, description: data.meta_desc}));}
        return data;
      }
      // 
      let completions = '';
      chat([{role: 'system', content: PROMPTS.article.seo.prompt}, {role: 'user', content: `${prompt}`}], (chunk) => {
        completions = completions + chunk;
        return update_metadata(PROMPTS.article.seo.parse(completions));
      })
      // chata(0)
      .then(fullResponse => {
        console.log(fullResponse);
        return update_metadata(PROMPTS.article.seo.parse(fullResponse));
      })
      .then(async (data) => {
        let completions = '';
        // await sleep(1000);
        chat([{role: 'system', content: PROMPTS.article.planner.prompt}, {role: 'user', content: 
          `${prompt}\n\n Content title: ${data?.title??'Not decided'}\nContent meta description: "${data?.meta_desc??'N/A'}"\nContent SEO Keywords: "${data.keywords.join(', ')}"`
        }], (chunk) => {
          if (loading) {setLoading(false);}
          completions = completions + chunk;
          setContent(marked(completions, {sanitize: true}));
        })
        // chata(1)
        .then(fullResponse => {
          console.log(fullResponse);
          setContent(marked(fullResponse, {sanitize: true}));
          return PROMPTS.article.planner.parse(fullResponse);
        })
        .then(async trimmed => {
          const generated_part = (id, resText, done = false) => {
            trimmed.prompts = trimmed.prompts.map(i => i.id == id ? {...i, output: resText} : i);
            setContent(
              marked(
                trimmed.text.replace(/@@PROMPT_(\d+)@@/g, (_, num) => {
                  const data = trimmed.prompts.find(i => i.id === get_prompt_id(num));
                  return !done ? `<div class="prompt-block xpo_animate-pulse xpo_min-h-12 xpo_bg-gray-200 xpo_rounded xpo_p-2">${data?.output??data?.prompt??__('Loading...')}</div>` : data?.output??'';
                }),
                {sanitize: true}
              )
            );
            window.trimmed = trimmed;
            // if (done) {
            //   console.log(
            //     id, resText, 
            //     trimmed.text.replace(/@@PROMPT_(\d+)@@/g, (_, num) => {
            //       const data = trimmed.prompts.find(i => i.id === get_prompt_id(num));
            //       return data?.output || data?.prompt;
            //     })
            //   );
            // }
          }
          // 
          for (const { id, type, prompt } of trimmed.prompts) {
            if (type !== 'PROMPT:') {continue;}
            let completions = '';
            await chat([
              {role: 'system', content: PROMPTS.article.replacer.prompt}, {role: 'user', content: prompt}
            ], (chunk) => {
              completions = completions + chunk;
              generated_part(id, PROMPTS.article.replacer.parse(completions));
            }, {stream: true})
            // chata(2)
            .then(res => generated_part(id, PROMPTS.article.replacer.parse(res), true))
            .catch(error => console.error('Partially Error:', error));
          }
        })
        .catch(error => console.error('Error:', error))
        .finally(() => {
          setLoading(false);
          // setMessages(prev => ([...prev, {role: 'user', content: prompt}, {role: 'assistant', content: content}]));
        });
      })
      .catch(error => console.error('Error:', error));
    });
  }

  
  return (
    <div className={`xpo_absolute xpo_flex-col xpo_gap-0 xpo_z-[1000] xpo_w-full xpo_h-full xpo_top-0 xpo_left-0 ${screenOpen ? 'xpo_flex' : 'xpo_hidden'}`}>
      <div className={ `xpo_w-full xpo_h-full xpo_top-0 xpo_left-0 xpo_bg-slate-600/40` }></div>
      <div className={ `xpo_w-full xpo_h-full xpo_top-0 left-0 xpo_p-3 ${screenOpen ? 'xpo_absolute' : 'xpo_hidden'}` }>
        <div className={`xpo_bg-white xpo_p-3 xpo_rounded-lg xpo_shadow-md xpo_border-none xpo_relative xpo_w-full ${!editorMode ? 'xpo_flex xpo_flex-col xpo_justify-center xpo_items-center' : ''}`}>
          {/* Write with AI */}
          {!editorMode ? (
            <>
              <div className="xpo_absolute xpo_inset-0">
                <div className="xpo_absolute xpo_inset-0 xpo_-z-10 xpo_h-full xpo_w-full xpo_bg-white xpo_bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] xpo_bg-[size:14px_24px]"></div>
              </div>
              <div className={`xpo_flex xpo_flex-col xpo_justify-center xpo_max-w-[600px] xpo_text-center xpo_m-auto ${!editorMode ? 'xpo_h-screen' : 'xpo_h-full'}`}>
                <div className="xpo_flex xpo_flex-col xpo_gap-3">
                  <h1 className="xpo_text-3xl xpo_font-bold xpo_text-center xpo_mb-4">{__('Write with AI')}</h1>
                  <h2 className="xpo_text-lg xpo_text-center xpo_mb-8">{__('Get help drafting, editing, and adding visuals - all in one place.')}</h2>
                  <div className="xpo_relative">
                    <textarea 
                      rows={4}
                      value={prompt}
                      ref={promptInputRef}
                      placeholder={__('Enter a topic to get started')}
                      onChange={(e) => setPrompt(prev => e.target.value)}
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
                      {loading ? <Loader size={20} /> : <WandSparkles size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="xpo_w-full xpo_h-full xpo_p-0 xpo_grid xpo_grid-cols-[1fr_150px] xpo_gap-3">
              <div className="xpo_relative xpo_w-full xpo_h-full xpo_p-5 xpo_shadow-sm">
                {/* {bullets && false ? (
                  <div className="xpo_absolute xpo_top-2 xpo_right-2 xpo_bg-slate-100 xpo_rounded-sm">
                    <ul className="xpo_list-none xpo_p-2 xpo_rounded-md xpo_shadow-sm">
                      {bullets.map(({title, description, children}, i) => (
                        <li key={i} className="">
                          <div className="">{title}</div>
                          {children?.length ? (
                            <ul>
                              {children.map(({title, description, children}, i) => (
                                <li key={i} className="">
                                  <div className="">{title}</div>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null} */}
                <div className="xpo_py-3 xpo_w-full">
                  {!title && loading ? (
                    <div role="status" className=" xpo_animate-pulse">
                      <div className="xpo_h-8 xpo_bg-gray-200 xpo_rounded-full dark:xpo_bg-gray-700 xpo_w-full xpo_mb-4"></div>
                      <span className="xpo_sr-only">Loading...</span>
                    </div>
                  ) : (
                    <div>
                      <h1
                        // contentEditable={true}
                        onChange={(e) => setTitle(e.target.value)}
                        className="xpo_w-full xpo_mb-4 xpo_text-xl xpo_font-extrabold xpo_leading-none xpo_tracking-tight xpo_text-gray-900 md:xpo_text-2xl lg:xpo_text-3xl dark:xpo_text-white" dangerouslySetInnerHTML={{__html: title}}></h1>
                    </div>
                  )}
                </div>
                <div className="xpo_flex xpo_flex-col xpo_gap-10 xpo_w-full xpo_pt-6 xpo_pb-0 xpo_mb-0 xpo_min-h-screen">
                  {loading && !content?.length ? (
                    <div role="status" className=" xpo_animate-pulse">
                      <div className="xpo_h-2.5 xpo_bg-gray-200 xpo_rounded-full dark:xpo_bg-gray-700 xpo_w-48 xpo_mb-4"></div>
                      <div className="xpo_h-2 xpo_bg-gray-200 xpo_rounded-full dark:xpo_bg-gray-700 xpo_max-w-[360px] xpo_mb-2.5"></div>
                      <div className="xpo_h-2 xpo_bg-gray-200 xpo_rounded-full dark:xpo_bg-gray-700 xpo_mb-2.5"></div>
                      <div className="xpo_h-2 xpo_bg-gray-200 xpo_rounded-full dark:xpo_bg-gray-700 xpo_max-w-[330px] xpo_mb-2.5"></div>
                      <div className="xpo_h-2 xpo_bg-gray-200 xpo_rounded-full dark:xpo_bg-gray-700 xpo_max-w-[300px] xpo_mb-2.5"></div>
                      <div className="xpo_h-2 xpo_bg-gray-200 xpo_rounded-full dark:xpo_bg-gray-700 xpo_max-w-[360px]"></div>
                      <span className="xpo_sr-only">Loading...</span>
                    </div>
                  ) : (
                    <div className="xpo_block markdown-preview">
                      <InlineEditor content={[content, setContent]} />
                      {/* <div
                        contentEditable={true}
                        className="xpo_w-full xpo_block markdown-preview"
                        onChange={(e) => setContent(prev => e.target.value)}
                        dangerouslySetInnerHTML={{ __html: marked(content, {sanitize: true}) }}
                      ></div> */}
                    </div>
                  )}
                  {!metadata?.description || !metadata?.keywords ? (
                    <div role="status" className=" xpo_animate-pulse">
                      <div className="xpo_h-16 xpo_bg-gray-200 xpo_rounded-none dark:xpo_bg-gray-700 xpo_w-full xpo_mb-4"></div>
                      <span className="xpo_sr-only">Loading...</span>
                    </div>
                  ) : (
                    <div className="xpo_w-full xpo_border-none xpo_border-t-2 xpo_p-3 xpo_pt-4">
                      <div className="xpo_flex xpo_flex-col xpo_w-full">
                        <div className="xpo_relative xpo_z-0 xpo_w-full xpo_mb-5 group">
                          <textarea
                            required
                            placeholder=" "
                            id="seo_meta_description"
                            value={metadata?.description}
                            onChange={(e) => setMetadata(prev => ({...prev, description: e.target.value}))}
                            className="xpo_block xpo_py-2.5 xpo_px-0 xpo_w-full xpo_text-sm xpo_text-gray-900 xpo_bg-transparent xpo_border-0 xpo_border-b-2 xpo_border-gray-300 xpo_appearance-none dark:xpo_text-white dark:xpo_border-gray-600 dark:focus:xpo_xpo_border-blue-500 focus:xpo_outline-none focus:xpo_ring-0 focus:xpo_border-blue-600 peer"
                          ></textarea>
                          <label htmlFor="seo_meta_description" className="peer-focus:xpo_font-medium xpo_absolute xpo_text-sm xpo_text-gray-500 dark:xpo_text-gray-400 xpo_duration-300 xpo_transform xpo_-translate-y-6 xpo_scale-75 xpo_top-3 xpo_-z-10 xpo_origin-[0] peer-focus:xpo_start-0 rtl:peer-focus:xpo_translate-x-1/4 rtl:peer-focus:xpo_left-auto peer-focus:xpo_text-blue-600 peer-focus:dark:xpo_text-blue-500 peer-placeholder-shown:xpo_scale-100 peer-placeholder-shown:xpo_translate-y-0 peer-focus:xpo_scale-75 peer-focus:xpo_-translate-y-6">{__('Meta Description')}</label>
                        </div>
                        
                        <div className="xpo_relative xpo_z-0 xpo_w-full xpo_mb-5 group">
                          <textarea
                            required
                            placeholder=" "
                            id="seo_meta_keywords"
                            value={metadata?.keywords.join(', ')}
                            onChange={(e) => setMetadata(prev => ({...prev, keywords: e.target.value.split(',').map(i => i.trim())}))}
                            className="xpo_block xpo_py-2.5 xpo_px-0 xpo_w-full xpo_text-sm xpo_text-gray-900 xpo_bg-transparent xpo_border-0 xpo_border-b-2 xpo_border-gray-300 xpo_appearance-none dark:xpo_text-white dark:xpo_border-gray-600 dark:focus:xpo_xpo_border-blue-500 focus:xpo_outline-none focus:xpo_ring-0 focus:xpo_border-blue-600 peer"
                          ></textarea>
                          <label htmlFor="seo_meta_keywords" className="peer-focus:xpo_font-medium xpo_absolute xpo_text-sm xpo_text-gray-500 dark:xpo_text-gray-400 xpo_duration-300 xpo_transform xpo_-translate-y-6 xpo_scale-75 xpo_top-3 xpo_-z-10 xpo_origin-[0] peer-focus:xpo_start-0 rtl:peer-focus:xpo_translate-x-1/4 rtl:peer-focus:xpo_left-auto peer-focus:xpo_text-blue-600 peer-focus:dark:xpo_text-blue-500 peer-placeholder-shown:xpo_scale-100 peer-placeholder-shown:xpo_translate-y-0 peer-focus:xpo_scale-75 peer-focus:xpo_-translate-y-6">{__('Meta Keywords')}</label>
                        </div>
                        
                      </div>
                    </div>
                  )}
                </div>
                
              </div>
              <div className="xpo_p-5 xpo_shadow-sm">
                <div className="xpo_sticky xpo_top-10">
                  <div className="xpo_flex xpo_flex-col xpo_gap-2">
                    <div className="xpo_flex xpo_flex-col xpo_gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setSubmitting(true);
                          if (!config?._rest) {return;}
                          // axios.post(`${config._rest}/ai/content/put`, {post_id: parseInt(config?._id), area: 'cpt', post_title: title, post_content: content, metadata}).then(res => res.data)
                          // 
                          sleep(3000)
                          .then(res => {
                            const _editor = tinymce.get('content');
                            if (_editor) {_editor.setContent(content);}
                            if (has_yoast()) {
                              const get_field = (key) => {
                                const id = YoastSEO.app.config.elementTarget.find(i => i.includes(key));
                                if (!id) {return [];}
                                return document.querySelectorAll('#'+ id);
                              }
                              const _seo_metas = {
                                content: content,
                                excerpt: metadata.description,
                                metadesc: metadata.description,
                              }
                              Object.keys(_seo_metas).forEach(metaKey => {
                                get_field(metaKey).forEach(elem => {
                                  if (!elem || !elem?.nodeType || !_seo_metas?.[metaKey]) {return;}
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
                          .then(async () => await sleep(1000))
                          .then(() => setSubmitting(false))
                          .then(async () => await sleep(1500))
                          .then(() => close_screen())
                          .catch(err => console.error(err))
                          .finally(() => setSubmitting(false));
                        }}
                        className="xpo_w-full xpo_text-white xpo_flex xpo_justify-center xpo_items-center xpo_bg-blue-700 hover:xpo_bg-blue-800 focus:xpo_ring-4 focus:xpo_ring-blue-300 xpo_font-medium xpo_rounded-lg xpo_text-sm xpo_px-5 xpo_py-2.5 xpo_me-2 xpo_mb-2 dark:xpo_bg-blue-600 dark:hover:xpo_bg-blue-700 focus:xpo_outline-none dark:focus:xpo_ring-blue-800"
                      >{submitting ? <Loader className="xpo_animate-spin" /> : __('Proceed')}</button>
                      <button type="button" onClick={(e) => close_screen(e)} className="xpo_w-full xpo_text-white xpo_flex xpo_justify-center xpo_items-center xpo_bg-gray-700 hover:xpo_bg-gray-800 focus:xpo_ring-4 focus:xpo_ring-gray-300 xpo_font-medium xpo_rounded-lg xpo_text-sm xpo_px-5 xpo_py-2.5 xpo_me-2 xpo_mb-2 dark:xpo_bg-gray-600 dark:hover:xpo_bg-gray-700 focus:xpo_outline-none dark:focus:xpo_ring-gray-800">{__('Cancel')}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) }
          {/* Editor area */}
        </div>
      </div>
    </div>
  )
}


