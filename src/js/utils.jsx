import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export const Popup = ({ onClose = null, showCross = true, backdrop = true, backdropClose = true, className = null, bodyClassName = null, children }) => {
  if (!className) {className = "xpo_fixed xpo_inset-0 xpo_z-50 xpo_flex xpo_items-center xpo_justify-center";}
  if (!bodyClassName) {bodyClassName = "xpo_relative xpo_z-10 xpo_bg-white xpo_rounded-xl xpo_shadow-lg xpo_p-6 xpo_max-w-full xpo_min-w-[90vw] md:xpo_min-w-[28rem]";}
  return (
    <div className={className} aria-modal="true" role="dialog">
      {backdrop ? <div className="xpo_absolute xpo_inset-0 xpo_bg-black/40 xpo_bg-opacity-30" onClick={e => backdropClose && onClose && onClose(e)} aria-label={__('Close popup')}></div> : null}
      <div className={bodyClassName}>
        {/* xpo_-translate-x-1 xpo_-translate-y-1 */}
        {typeof onClose === 'function' && showCross ? (
          <div className="xpo_absolute xpo_top-1 xpo_right-1">
            <button type="button" className="xpo_p-0 xpo_border-none xpo_bg-transparent" onClick={(e) => onClose()}>
              <X size={16} />
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export const __ = (t) => t;

export const ClipboardInput = ({ text }) => {
  const [copySuccess, setCopySuccess] = useState('');
  const inputRef = useRef(null);

  return (
    <section className="xpo_bg-white dark:xpo_bg-primary">
      <div className="xpo_w-full">
        <div className="xpo_mx-auto xpo_w-full">
          <div className="xpo_relative">
            <input
              disabled
              type="text"
              value={text}
              ref={inputRef}
              className="xpo_h-12 xpo_w-full xpo_rounded-lg xpo_border xpo_border-stroke xpo_bg-gray-1 xpo_py-3 xpo_pl-5 xpo_pr-14 xpo_text-primary xpo_outline-none xpo_duration-200 selection:xpo_bg-transparent focus:xpo_border-primary dark:xpo_border-primary-3 dark:xpo_bg-primary-2 dark:xpo_text-white"
            />
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                if (inputRef.current) {
                  // inputRef.current.select();
                  // document.execCommand("copy");
                  const clipboardItem = new ClipboardItem({'text/plain': text});
                  await navigator.clipboard.write([clipboardItem]);
                  setCopySuccess("Copied!");
                  setTimeout(() => setCopySuccess(''), 2000);
                }
              }}
              className="xpo_absolute xpo_right-2 xpo_top-1/2 xpo_inline-flex xpo_h-8 xpo_-translate-y-1/2 xpo_items-center xpo_justify-center xpo_gap-1 xpo_rounded-md xpo_bg-primary xpo_px-2.5 xpo_py-1.5 xpo_text-sm xpo_font-medium xpo_text-white xpo_duration-200 hover:xpo_bg-primary/90"
            >
              <span>
                {copySuccess ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 21 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17.0394 6.0293L8.03936 15.0293L3.68359 10.6736"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17.6875 4.125L14.4062 0.875C14.1875 0.65625 13.875 0.53125 13.5625 0.53125H7.875C6.96875 0.53125 6.21875 1.28125 6.21875 2.1875V13.5937C6.21875 14.5 6.96875 15.25 7.875 15.25H16.375C17.2812 15.25 18.0312 14.5 18.0312 13.5937V4.96875C18.0312 4.65625 17.9062 4.34375 17.6875 4.125ZM14.4687 2.9375L15.6562 4.125H14.4687V2.9375ZM16.375 13.8437H7.875C7.75 13.8437 7.625 13.7187 7.625 13.5937V2.1875C7.625 2.0625 7.75 1.9375 7.875 1.9375H13.0625V4.8125C13.0625 5.1875 13.375 5.53125 13.7812 5.53125H16.625V13.625C16.625 13.75 16.5 13.8437 16.375 13.8437Z"
                      fill="currentColor"
                    />
                    <path
                      d="M13.7812 7.03125H9.65625C9.28125 7.03125 8.9375 7.34375 8.9375 7.75C8.9375 8.15625 9.25 8.46875 9.65625 8.46875H13.7812C14.1562 8.46875 14.5 8.15625 14.5 7.75C14.5 7.34375 14.1562 7.03125 13.7812 7.03125Z"
                      fill="currentColor"
                    />
                    <path
                      d="M13.7812 9.65625H9.65625C9.28125 9.65625 8.9375 9.96875 8.9375 10.375C8.9375 10.75 9.25 11.0937 9.65625 11.0937H13.7812C14.1562 11.0937 14.5 10.7813 14.5 10.375C14.4687 9.96875 14.1562 9.65625 13.7812 9.65625Z"
                      fill="currentColor"
                    />
                    <path
                      d="M13.0625 16.25C12.6875 16.25 12.3437 16.5625 12.3437 16.9687V17.8125C12.3437 17.9375 12.2187 18.0625 12.0937 18.0625H3.625C3.5 18.0625 3.375 17.9375 3.375 17.8125V6.375C3.375 6.25 3.5 6.125 3.625 6.125H4.6875C5.0625 6.125 5.40625 5.8125 5.40625 5.40625C5.40625 5 5.09375 4.6875 4.6875 4.6875H3.625C2.71875 4.6875 1.96875 5.4375 1.96875 6.34375V17.8125C1.96875 18.7188 2.71875 19.4687 3.625 19.4687H12.125C13.0312 19.4687 13.7812 18.7188 13.7812 17.8125V16.9687C13.7812 16.5625 13.4687 16.25 13.0625 16.25Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </span>
              {copySuccess ? __('Copied') : __('Copy')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export const ellipsis = (text, start = 0, end = 30) => {
  if (typeof text !== 'string') {return text;}
  if (text?.length >= start + end) {
    return text.substring(start, end);
  }
  return text;
}

export const tailwind_install = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = 'https://cdn.tailwindcss.com';
    script.onload = () => {
      window.tailwind = window.tailwind || {};
      window.tailwind.config = {
        prefix: 'xpo_',
        theme: {
          extend: {
            colors: {
              primary: {
                100: '#FDECEA',
                200: '#F9D1D4',
                300: '#F4B7BD',
                400: '#EF9DA6',
                DEFAULT: '#E03C33',
                500: '#E03C33',
                600: '#B82E27',
                700: '#90201B',
                800: '#68120F',
                900: '#400403',
              },
              secondary: {
                100: '#E5E7EB',
                200: '#D1D5DB',
                300: '#B0B6C1',
                400: '#9CA3AF',
                DEFAULT: '#6B7280',
                500: '#6B7280',
                600: '#4B5563',
                700: '#374151',
                800: '#1F2937',
                900: '#111827',
              },
              accent: {
                100: '#F0F9FF',
                200: '#DBEFFE',
                300: '#BEE3F8',
                400: '#9ECEF4',
                DEFAULT: '#67B8EF',
                500: '#67B8EF',
                600: '#4F9DDA',
                700: '#3D83C1',
                800: '#2B69A2',
                900: '#1A4D82',
              },
              'brand-dark': '#1D2327'
            },
          },
        },
      };
      resolve(true);
    }
    script.onerror = (e) => {
      resolve(true);
      // reject(e);
    }
    document.head.appendChild(script);
  });
}

export const home_route = (p) => p;
