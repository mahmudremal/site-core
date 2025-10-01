import { createContext, useEffect, useState } from 'react';
import api from '../services/api';

export const LocaleContext = createContext();

export const LocaleProvider = ({ children }) => {
  const [locale, setLocale] = useState('en');
  const [languages, setLanguages] = useState([
    { code: "bn", name: "বাংলা", flag: "🇧🇩" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "zh", name: "中文", flag: "🇨🇳" }
  ]);
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    if (locale == 'en') return;
    if (translations?.[locale]) return;
    return;
    api.get(`locales/${locale}`)
    .then(res => res.data)
    .then(data => setTranslations(prev => ({...prev, [locale]: data})))
    .catch(err => console.log(err?.message));
  }, [locale]);

  const __ = (text, domain) => {
    if (!translations?.[domain]) {
      translations[domain] = {};
    }
    if (!translations?.[domain]?.[text]) {
      translations[domain][text] = text;
    }
    return translations?.[domain]?.[text] || text;
  };

  useEffect(() => {
    window.get_i18n_strings = () => translations
  }, []);
  

  return (
    <LocaleContext.Provider value={{ __, languages, locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};
