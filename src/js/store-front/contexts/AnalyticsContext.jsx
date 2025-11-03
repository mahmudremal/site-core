import { createContext, useRef, useState } from 'react';

export const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
  const [analytics, setAnalytics] = useState([]);

  const clarity = useRef(() => window.clarity);
  const chat = useRef(() => window?.Tawk_API);
  const tags = useRef(() => window?.Tag);

  return (
    <AnalyticsContext.Provider value={{ analytics, chat, clarity, tags }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
