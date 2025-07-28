import React, { useState, createContext, useContext } from 'react';

const StorageContext = createContext();

export default function StorageProvider({ children, config = {} }) {
  const [storage, setStorage] = useState(config);

  return (
    <StorageContext.Provider value={{ storage, setStorage }}>
      {children}
    </StorageContext.Provider>
  );
}

export const useStorage = () => useContext(StorageContext);