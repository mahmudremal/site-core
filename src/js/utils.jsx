import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Popup = ({ onClose = null, showCross = true, backdrop = true, backdropClose = true, className = null, crossClassName = null, bodyClassName = null, backdropClassName = null, children }) => {
  if (!className) { className = "fixed inset-0 z-50 flex items-center justify-center"; }
  if (!bodyClassName) { bodyClassName = "relative z-10 bg-white rounded-xl shadow-lg p-6 max-w-full min-w-[90vw] md:min-w-[28rem] max-h-[90vh] overflow-auto"; }
  if (!crossClassName) { crossClassName = "p-2 hover:bg-gray-100 rounded-lg"; }
  if (!backdropClassName) { backdropClassName = "absolute inset-0 bg-black/40 bg-opacity-30"; }
  // 
  return (
    <div className={className} aria-modal="true" role="dialog">
      {backdrop ? <div className={backdropClassName} onClick={e => backdropClose && onClose && onClose(e)} aria-label={__('Close popup')}></div> : null}
      <div className={bodyClassName}>
        {/* -translate-x-1 -translate-y-1 */}
        {typeof onClose === 'function' && showCross ? (
          <div className="absolute top-1 right-1">
            {/* <button type="button" className="p-0 border-none bg-transparent" onClick={(e) => onClose()}>
              <X size={16} />
            </button> */}
            <button
              onClick={() => onClose()}
              className={crossClassName}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export const __ = (text, domain) => text;

export const ClipboardInput = ({ text }) => {
  const [copySuccess, setCopySuccess] = useState('');
  const inputRef = useRef(null);

  return (
    <section className="bg-white dark:bg-primary">
      <div className="w-full">
        <div className="mx-auto w-full">
          <div className="relative">
            <input
              disabled
              type="text"
              value={text}
              ref={inputRef}
              className="h-12 w-full rounded-lg border border-stroke bg-gray-1 py-3 pl-5 pr-14 text-primary outline-none duration-200 selection:bg-transparent focus:border-primary dark:border-primary-3 dark:bg-primary-2 dark:text-white"
            />
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                if (inputRef.current) {
                  // inputRef.current.select();
                  // document.execCommand("copy");
                  const clipboardItem = new ClipboardItem({ 'text/plain': text });
                  await navigator.clipboard.write([clipboardItem]);
                  setCopySuccess("Copied!");
                  setTimeout(() => setCopySuccess(''), 2000);
                }
              }}
              className="absolute right-2 top-1/2 inline-flex h-8 -translate-y-1/2 items-center justify-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-sm font-medium text-white duration-200 hover:bg-primary/90"
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
  if (typeof text !== 'string') { return text; }
  if (text?.length >= start + end) {
    return text.substring(start, end);
  }
  return text;
}

export const tailwind_install = ({ config = {} }) => {
  return new Promise((resolve, reject) => {
    // return resolve(true);
    const script = document.createElement("script");
    script.src = 'https://cdn.tailwindcss.com';
    script.onload = () => {
      window.tailwind = window.tailwind || {};
      window.tailwind.config = {
        darkMode: 'class', // '[data-theme="dark"]',
        prefix: '',
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
              // agreements: { // markethia
              //   DEFAULT: "#02424F",
              //   50:  "#E6F1F3",
              //   100: "#CCE3E6",
              //   200: "#99C6CC",
              //   300: "#66A9B3",
              //   400: "#338C99",
              //   500: "#007080",
              //   600: "#005966",
              //   700: "#00434D",
              //   800: "#022D33",
              //   900: "#01171A",
              // },
              agreements: {
                50: "#FFFBEA",
                100: "#FFF3C4",
                200: "#FCE588",
                300: "#FADB5F",
                400: "#F7C948",
                500: "#FFD957", // base
                600: "#F0B429",
                700: "#DE911D",
                800: "#CB6E17",
                900: "#B44D12",
                DEFAULT: "#FFD957",
              },
              scprimary: {
                DEFAULT: "#0A1D37",
                50: "#e1e5ec",
                100: "#bcc7d8",
                200: "#8ba1b9",
                300: "#597b9a",
                400: "#37567f",
                500: "#0a1d37",
                600: "#091931",
                700: "#061225",
                800: "#040d1a",
                900: "#02090f"
              },
              scwhite: {
                DEFAULT: "#F5F7FA",
                50: "#FFFFFF",
                100: "#FDFEFF",
                200: "#F9FAFC",
                300: "#F5F7FA",
                400: "#E9EDF3",
                500: "#DCE2EB",
                600: "#C3CBD6",
                700: "#9FA8B4",
                800: "#7A8491",
                900: "#5B626D"
              },
              scaccent: {
                DEFAULT: "#6C5DD3",
                50: "#F0EEFC",
                100: "#DCD8F7",
                200: "#C1B8F2",
                300: "#A697ED",
                400: "#8D7AE5",
                500: "#6C5DD3",
                600: "#5E50BB",
                700: "#4C4097",
                800: "#393172",
                900: "#28234F"
              },


              'brand-dark': '#1D2327',
              'primary-dark': '#0F172A',
              'primary-light': '#1E293B',
              'primary-accent': '#F59E0B',
              'primary-accent-dark': '#B45309',
              'accent-red': '#DC2626',
              'primary-dark-text': '#E0E7FF',
            },
            fontFamily: {
              sans: ['Inter', 'sans-serif'],
            },
          },
        },
        ...config
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

export const deepMerge = (target, source) => {
  const output = { ...target }
  for (const key in source) {
    if (
      typeof source[key] === 'object' &&
      source[key] !== null &&
      !Array.isArray(source[key])
    ) {
      output[key] = deepMerge(target[key] || {}, source[key])
    } else {
      output[key] = source[key]
    }
  }
  return output
}

import CryptoJS from 'crypto-js';

export const encryptString = (data, key) => {
  if (!data || !key) {
    throw new Error('Data and key are required for encryption.');
  }
  const encryptionKey = CryptoJS.enc.Utf8.parse(key);
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(data, encryptionKey, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const combined = iv.toString(CryptoJS.enc.Base64) + ':' + encrypted.toString();
  return combined;
};

