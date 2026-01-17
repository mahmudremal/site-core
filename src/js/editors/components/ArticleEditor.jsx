import React from 'react';
import InlineEditor from '../inlineeditor';
import { __ } from '../utils';

export default function ArticleEditor({
  title,
  setTitle,
  content,
  setContent,
  metadata,
  setMetadata,
  loading,
}) {
  return (
    <div className="xpo_relative xpo_w-full xpo_h-full xpo_p-5 xpo_shadow-sm">
      <div className="xpo_py-3 xpo_w-full">
        {!title && loading ? (
          <div role="status" className="xpo_animate-pulse">
            <div className="xpo_h-8 xpo_bg-gray-200 xpo_rounded-full dark:xpo_bg-gray-700 xpo_w-full xpo_mb-4"></div>
            <span className="xpo_sr-only">Loading...</span>
          </div>
        ) : (
          <div>
            <h1
              onChange={(e) => setTitle(e.target.value)}
              className="xpo_w-full xpo_mb-4 xpo_text-xl xpo_font-extrabold xpo_leading-none xpo_tracking-tight xpo_text-gray-900 md:xpo_text-2xl lg:xpo_text-3xl dark:xpo_text-white"
              dangerouslySetInnerHTML={{ __html: title }}
            ></h1>
          </div>
        )}
      </div>
      <div className="xpo_flex xpo_flex-col xpo_gap-10 xpo_w-full xpo_pt-6 xpo_pb-0 xpo_mb-0 xpo_min-h-screen">
        {loading && !content?.length ? (
          <div role="status" className="xpo_animate-pulse">
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
          </div>
        )}
        {!metadata?.description || !metadata?.keywords ? (
          <div role="status" className="xpo_animate-pulse">
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
                  onChange={(e) => setMetadata((prev) => ({ ...prev, description: e.target.value }))}
                  className="xpo_block xpo_py-2.5 xpo_px-0 xpo_w-full xpo_text-sm xpo_text-gray-900 xpo_bg-transparent xpo_border-0 xpo_border-b-2 xpo_border-gray-300 xpo_appearance-none dark:xpo_text-white dark:xpo_border-gray-600 dark:focus:xpo_xpo_border-blue-500 focus:xpo_outline-none focus:xpo_ring-0 focus:xpo_border-blue-600 peer"
                ></textarea>
                <label
                  htmlFor="seo_meta_description"
                  className="peer-focus:xpo_font-medium xpo_absolute xpo_text-sm xpo_text-gray-500 dark:xpo_text-gray-400 xpo_duration-300 xpo_transform xpo_-translate-y-6 xpo_scale-75 xpo_top-3 xpo_-z-10 xpo_origin-[0] peer-focus:xpo_start-0 rtl:peer-focus:xpo_translate-x-1/4 rtl:peer-focus:xpo_left-auto peer-focus:xpo_text-blue-600 peer-focus:dark:xpo_text-blue-500 peer-placeholder-shown:xpo_scale-100 peer-placeholder-shown:xpo_translate-y-0 peer-focus:xpo_scale-75 peer-focus:xpo_-translate-y-6"
                >
                  {__('Meta Description')}
                </label>
              </div>

              <div className="xpo_relative xpo_z-0 xpo_w-full xpo_mb-5 group">
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
                  className="xpo_block xpo_py-2.5 xpo_px-0 xpo_w-full xpo_text-sm xpo_text-gray-900 xpo_bg-transparent xpo_border-0 xpo_border-b-2 xpo_border-gray-300 xpo_appearance-none dark:xpo_text-white dark:xpo_border-gray-600 dark:focus:xpo_xpo_border-blue-500 focus:xpo_outline-none focus:xpo_ring-0 focus:xpo_border-blue-600 peer"
                ></textarea>
                <label
                  htmlFor="seo_meta_keywords"
                  className="peer-focus:xpo_font-medium xpo_absolute xpo_text-sm xpo_text-gray-500 dark:xpo_text-gray-400 xpo_duration-300 xpo_transform xpo_-translate-y-6 xpo_scale-75 xpo_top-3 xpo_-z-10 xpo_origin-[0] peer-focus:xpo_start-0 rtl:peer-focus:xpo_translate-x-1/4 rtl:peer-focus:xpo_left-auto peer-focus:xpo_text-blue-600 peer-focus:dark:xpo_text-blue-500 peer-placeholder-shown:xpo_scale-100 peer-placeholder-shown:xpo_translate-y-0 peer-focus:xpo_scale-75 peer-focus:xpo_-translate-y-6"
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
