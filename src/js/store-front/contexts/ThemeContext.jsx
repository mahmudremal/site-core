import { createContext, useEffect, useState } from 'react';
import { useSession } from '../hooks/useSession';
import { MoonlitSkyBg } from '../components/backgrounds/MoonlitSky';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { session, setSession } = useSession();
  const [theme, setTheme] = useState(
    () => session?.theme || 'dark'
  );

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setSession(prev => ({ ...prev, theme: newTheme }));
  };

  useEffect(() => {
    if (theme == 'light') return document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('dark');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="relative">
        <div className="fixed max-h-screen z-[-1] inset-0 pointer-events-none select-none hidden dark:block">
          <MoonlitSkyBg />
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
};
