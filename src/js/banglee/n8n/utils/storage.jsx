import React, { useState, useEffect, createContext, useContext } from 'react';
const StorageContext = createContext();

export default function StorageProvider({ children, canvas_id = null }) {
  const [storage, setStorage] = useState(null);

//   useEffect(() => {
//   }, [canvas_id, storage]);

  return (
    <StorageContext.Provider value={{ storage, setStorage }}>
      {children}
    </StorageContext.Provider>
  );
}

export const useStorage = () => useContext(StorageContext);
