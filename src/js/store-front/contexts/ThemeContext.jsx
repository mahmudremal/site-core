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
    setSession(prev => ({...prev, theme: newTheme}));
  };

  useEffect(() => {
    if (theme == 'light') return document.documentElement.classList.remove('xpo_dark');
    document.documentElement.classList.add('xpo_dark');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="xpo_relative">
        <div className="xpo_fixed xpo_max-h-screen xpo_z-[-1] xpo_inset-0 xpo_pointer-events-none xpo_select-none xpo_hidden dark:xpo_block">
          <MoonlitSkyBg />
        </div>
        <div className="xpo_relative xpo_z-10">
          {children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
};
