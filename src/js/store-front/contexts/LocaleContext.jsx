import { createContext, useEffect, useRef, useState } from 'react';
import { useSession } from '../hooks/useSession';
import api from '../services/api';

export const LocaleContext = createContext();

export const LocaleProvider = ({ children }) => {
  const { session, setSession } = useSession();
  const [locale, setLocale] = useState(() => session?.['locale'] || 'en');
  const [firstCall, setFirstCall] = useState(null);
  const [languages, setLanguages] = useState([
    { code: "bn_BD", name: "বাংলা", flag: "🇧🇩" },
    { code: "en_US", name: "English", flag: "🇺🇸" },
    { code: "hi_IN", name: "हिन्दी", flag: "🇮🇳" },
    { code: "ar_SA", name: "العربية", flag: "🇸🇦" },
    { code: "zh_CN", name: "中文", flag: "🇨🇳" }
  ]);
  // const [translations, setTranslations] = useState({});
  const translations = useRef({});

  useEffect(() => {
    if (!firstCall) {setFirstCall(true);return;}
    setSession(prev => ({ ...prev, locale: locale }));
  }, [locale]);

  const __ = (text, domain) => {
    if (!translations.current?.[domain]) {
      translations.current[domain] = {};
    }
    if (!translations.current?.[domain]?.[locale]) {
      translations.current[domain][locale] = {};
      loadLanguage(locale, domain);
    }
    if (!translations.current?.[domain]?.[locale]?.[text]) {
      translations.current[domain][locale][text] = text;
    }
    return translations.current?.[domain]?.[locale]?.[text] || text;
  };

  useEffect(() => {
    loadLanguage(locale, 'site-core');
    window.get_i18n_strings = () => translations.current
  }, []);


  useEffect(() => {
    const send = async (e) => {
      // e.preventDefault();
      try {
        await api.post(`/locale/update`, {list: { ...translations.current }});
      } catch (error) {}
    };

    window.addEventListener('beforeunload', send);

    return () => window.removeEventListener('beforeunload', send);
  }, []);

  
  const switchLanguage = async (lang, domain = 'site-core') => {
    return new Promise((resolve) => {
      setLocale(lang);
      resolve(loadLanguage(lang, domain));
    });
  }
  const loadLanguage = (lang, domain) => {
    return api.get(`locales/${domain}/${lang}`)
    .then(res => res.data)
    .then(data => {
      translations.current[domain][lang] = data;
    })
    .catch(err => console.log(err?.message));
  }

  

  return (
    <LocaleContext.Provider value={{ __, languages, locale, setLocale, switchLanguage }}>
      {children}
    </LocaleContext.Provider>
  );
};
