import { createContext, useEffect, useState } from 'react';
import { useSession } from '../hooks/useSession';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { session, setSession } = useSession();
  const [theme, setTheme] = useState(
    () => session?.theme || 'dark'
  );

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setSession(prev => ({...prev, theme: newTheme}));
  };

  useEffect(() => {
    if (theme == 'light') return document.documentElement.classList.remove('xpo_dark');
    document.documentElement.classList.add('xpo_dark');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
