import React, { useState, createContext, useContext } from 'react';

const SettingsContext = createContext();

export default function SettingsProvider({ children, config = {} }) {
  const [settings, setSettings] = useState(config);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);