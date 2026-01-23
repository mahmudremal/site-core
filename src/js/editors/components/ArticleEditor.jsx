import React from 'react';
import InlineEditor from '../inlineeditor';
import PromptBlock from './PromptBlock';
import { __ } from '../utils';

export default function ArticleEditor({
  title,
  setTitle,
  content,
  setContent,
  metadata,
  setMetadata,
  loading,
  planner,
  onProcessAI,
  onOpenMedia
}) {
  const renderLiveContent = () => {
    const hasPending = planner?.prompts?.some((p) => !p.output);

    if (!planner || !planner.text || !hasPending) {
      return <InlineEditor content={[content, setContent]} />;
    }

    const parts = planner.text.split(/(@@PROMPT_\d+@@)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@@PROMPT_')) {
        const data = planner.prompts?.find((p) => p.id === part);
        if (data?.output) {
          return <div key={i} className="block" dangerouslySetInnerHTML={{ __html: data.output }} />;
        }
        return (
          <PromptBlock
            key={i}
            data={data}
            onProcessAI={() => onProcessAI(data.id)}
            onOpenMedia={() => onOpenMedia(data.id)}
          />
        );
      }
      return <div key={i} className="block" dangerouslySetInnerHTML={{ __html: part }} />;
    });
  };

  return (
    <div className="relative w-full h-full p-5 shadow-sm">
      <div className="py-3 w-full">
        {!title && loading ? (
          <div role="status" className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-full dark:bg-gray-700 w-full mb-4"></div>
            <span className="sr-only">Loading...</span>
          </div>
        ) : (
          <div>
            <h1
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-4 text-xl font-extrabold leading-none tracking-tight text-gray-900 md:text-2xl lg:text-3xl dark:text-white"
              dangerouslySetInnerHTML={{ __html: title }}
            ></h1>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 w-full pt-6 pb-0 mb-0 min-h-screen">
        {loading && !content?.length ? (
          <div role="status" className="animate-pulse">
            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
            <span className="sr-only">Loading...</span>
          </div>
        ) : (
          <div className="block markdown-preview space-y-4">
            {renderLiveContent()}
          </div>
        )}
        {!metadata?.description || !metadata?.keywords ? (
          <div role="status" className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-none dark:bg-gray-700 w-full mb-4"></div>
            <span className="sr-only">Loading...</span>
          </div>
        ) : (
          <div className="w-full border-none border-t-2 p-3 pt-4">
            <div className="flex flex-col w-full">
              <div className="relative z-0 w-full mb-5 group">
                <textarea
                  required
                  placeholder=" "
                  id="seo_meta_description"
                  value={metadata?.description}
                  onChange={(e) => setMetadata((prev) => ({ ...prev, description: e.target.value }))}
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                ></textarea>
                <label
                  htmlFor="seo_meta_description"
                  className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  {__('Meta Description')}
                </label>
              </div>

              <div className="relative z-0 w-full mb-5 group">
                <textarea
                  required
                  placeholder=" "
                  id="seo_meta_keywords"
                  value={metadata?.keywords.join(', ')}
                  onChange={(e) =>
                    setMetadata((prev) => ({
                      ...prev,
                      keywords: e.target.value.split(',').map((i) => i.trim()),
                    }))
                  }
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                ></textarea>
                <label
                  htmlFor="seo_meta_keywords"
                  className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  {__('Meta Keywords')}
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
