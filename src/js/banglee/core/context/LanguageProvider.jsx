import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { useSession } from './SessionProvider';
import { site_url, rest_url } from '@functions';
import request from '@common/request';

const LanguageContext = createContext();
const get_langcode = (l) => l.toString().split('_')[0];
let isFirstCall = true;

export default function LanguageProvider({ children, config = {} }) {
  const { session, setSession } = useSession();
  const [language, setLanguage] = useState(get_langcode(config?.locale ?? ''));
  const [translations, setTranslations] = useState({});
  // const cache = {};

  // const lang_request = (url) => {
  //   return new Promise((resolve, reject) => {
  //     if (cache[url]) {
  //       resolve(cache[url]);
  //       return;
  //     }
  //     fetch(url)
  //       .then(res => res.json())
  //       .then(data => {
  //         cache[url] = data;
  //         resolve(data);
  //       })
  //       .catch(err => reject(err));
  //   });
  // };

  const loadLanguage = useCallback(async (langCode) => {
    if (!langCode || langCode === '') {
      langCode = session?.languageCode ?? 'en';
    }

    try {
      // const data = await request(rest_url(`/sitecore/v1/translations/${langCode}/list`));
      const data = await request(site_url(`/languages/${langCode}.json`));
      if (!data) {
        console.error('Failed to load language data:', langCode);
        return;
      }
      setTranslations(data);
      setLanguage(langCode);
      setSession(prev => ({ ...prev, languageCode: langCode }));

      if (!window.i18ns) window.i18ns = {};
      window.i18ns[langCode] = {}; // or to preserve commented merge logic:
      // window.i18ns[langCode] = { ...window?.i18ns[langCode] ?? {}, ...data };

    } catch (err) {
      console.error('Failed to load language:', err);
    }
  }, [config?.user_id, session?.languageCode, setSession]);

  useEffect(() => {
    // loadLanguage(language);
  }, [loadLanguage, language]);

  window.i18ns = window.i18ns ?? {};

  const t = (key) => {
    if (!translations?.[key]) {
      if (!window.i18ns?.[language]) {
        window.i18ns[language] = {};
      }
      window.i18ns[language][key] = translations[key] = key;
    }
    return translations?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage: loadLanguage, __: t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => useContext(LanguageContext);
