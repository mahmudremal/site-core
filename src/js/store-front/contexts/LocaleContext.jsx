import { createContext, useEffect, useState } from 'react';
import api from '../services/api';

export const LocaleContext = createContext();

export const LocaleProvider = ({ children }) => {
  const [locale, setLocale] = useState('en');
  const [strings, setStrings] = useState({});
  const [languages, setLanguages] = useState([
    { code: "bn", name: "বাংলা", flag: "🇧🇩" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "zh", name: "中文", flag: "🇨🇳" }
  ]);

  useEffect(() => {
    if (locale == 'en') return setStrings({});
    return;
    api.get(`locales/${locale}`)
    .then(res => res.data)
    .then(res => setStrings(res))
    .catch(err => console.log(err?.message));
  }, [locale]);

  const __ = (text, domain) => {
    if (strings?.[text]) return strings[text];
    return text;
  };

  return (
    <LocaleContext.Provider value={{ __, languages, locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};
