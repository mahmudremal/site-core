import React, { createContext, useContext, useState } from 'react';

const StorageContext = createContext();

export const useStorage = () => useContext(StorageContext);

const StorageProvider = ({ children }) => {
    const [storage, setStorage] = useState({}); // Placeholder state

    const value = {
        storage,
        setStorage,
    };

    return (
        <StorageContext.Provider value={value}>
            {children}
        </StorageContext.Provider>
    );
};

export default StorageProvider;
