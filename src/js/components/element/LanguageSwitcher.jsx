import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from "@context/LanguageProvider";
import { createPopper } from '@popperjs/core';
import request from '@common/request';
import { rest_url, roles } from '@functions';

const LanguageCodes = [
    {
      country_name: 'English',
      country_code: 'us',
      language_name: 'English',
      lang_code: 'en',
      flag_code: 'us',
    },
    {
      country_name: 'Japan',
      country_code: 'jp',
      language_name: 'Japanese',
      lang_code: 'ja',
      flag_code: 'jp',
    },
    {
      country_name: 'France',
      country_code: 'fr',
      language_name: 'French',
      lang_code: 'fr',
      flag_code: 'fr',
    },
    {
      country_name: 'Germany',
      country_code: 'de',
      language_name: 'German',
      lang_code: 'de',
      flag_code: 'de',
    },
    {
      country_name: 'South Korea',
      country_code: 'kr',
      language_name: 'Korean',
      lang_code: 'ko',
      flag_code: 'kr',
    },
    {
      country_name: 'Bangladesh',
      country_code: 'bd',
      language_name: 'Bengali',
      lang_code: 'bn',
      flag_code: 'bd',
    },
    {
      country_name: 'India',
      country_code: 'in',
      language_name: 'Hindi',
      lang_code: 'hi',
      flag_code: 'in',
    },
    {
      country_name: 'Canada',
      country_code: 'ca',
      language_name: 'English',
      lang_code: 'ca',
      flag_code: 'ca',
    }
];

export default function LanguageSwitcher() {
  const { __, language, switchLanguage } = useTranslation();
  const [menuOpened, setMenuOpened] = useState(false);
  const [sending, setSending] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleSwitchLanguage = (lang_code) => {
    setMenuOpened(false);
    switchLanguage(lang_code);
  };

  const toggleDropdown = () => {
    setMenuOpened(prev => !prev);
  };

  const sendLanguages = () => {
    if (!roles.has_ability('translations')) {return;}
    setSending(true);
    request(rest_url('/sitecore/v1/translations'), {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({language, list: window.i18ns[language]})}).then(data => console.log(data)).catch(console.error).finally(() => setSending(false));
  }

  useEffect(() => {
    if (menuOpened && buttonRef.current && dropdownRef.current) {
      createPopper(buttonRef.current, dropdownRef.current, {
        placement: 'bottom-end',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 10],
            },
          },
        ],
      });
    }
  }, [menuOpened]);
  
  const currentLang = LanguageCodes.find(lang => lang.lang_code === language) ?? LanguageCodes.find(lang => lang.lang_code === 'en');

  return (
    <div className="d-none d-sm-inline-block position-relative">
      <button
        ref={buttonRef}
        className={`has-indicator xpo_w-40-px xpo_h-40-px bg-neutral-200 rounded-circle flex xpo_justify-content-center xpo_items-center ${menuOpened ? 'show' : ''}`}
        type="button"
        onClick={toggleDropdown}
        aria-expanded={menuOpened ? 'true' : 'false'}
      >
        <img
          src={`https://flagcdn.com/24x18/${currentLang?.flag_code}.png`}
          alt={currentLang?.language_name}
          className="w-24 xpo_h-24 object-fit-cover rounded-circle aspect-square"
        />
      </button>

      {menuOpened && <div className="fixed top-0 left-0 xpo_w-full xpo_h-full z-10" onClick={(e) => setMenuOpened(false)}></div>}

      <div
        ref={dropdownRef}
        className={`dropdown-menu to-top dropdown-menu-sm z-10 ${menuOpened ? 'show block' : ''}`}
      >
        <div className="py-12 px-16 radius-8 bg-primary-50 xpo_mb-16 flex xpo_items-center xpo_justify-between xpo_gap-2">
          <h6 className="text-lg xpo_text-primary-light fw-semibold xpo_mb-0">
            {__('Choose Your Language')}
          </h6>
          {roles.has_ability('translations') && (window.i18ns[language] && Object.keys(window.i18ns[language]).length) ? (
            <button type="button" className="btn rounded-pill btn-success-100 xpo_text-success-600 radius-8 px-20 py-11" onClick={sendLanguages}>{sending ? __('Sending') : __('Send')}</button>
          ) : null}
        </div>

        <div className="max-h-400-px overflow-y-auto scroll-sm pe-8">
          {LanguageCodes.map((lang, index) => (
            <div
              className="form-check style-check flex xpo_items-center xpo_justify-between xpo_mb-16"
              key={index}
            >
              <label
                className="form-check-label line-height-1 fw-medium xpo_text-secondary-light"
                htmlFor={lang.lang_code + '-' + index}
              >
                <span className="text-black hover-bg-transparent hover-text-primary flex xpo_items-center xpo_gap-3">
                  <img
                    src={`https://flagcdn.com/48x36/${lang.flag_code}.png`}
                    alt={lang.language_name}
                    className="w-36-px xpo_h-36-px bg-success-subtle xpo_text-success-main rounded-circle xpo_flex-shrink-0"
                  />
                  <span className="text-md fw-semibold xpo_mb-0">
                    {lang.country_name}
                  </span>
                </span>
              </label>
              <input
                className="form-check-input"
                type="radio"
                name="language"
                id={lang.lang_code + '-' + index}
                checked={language === lang.lang_code}
                onChange={() => handleSwitchLanguage(lang.lang_code)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
