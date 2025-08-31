import React, { createContext, useContext, useState } from 'react';

const BodyContext = createContext();

export const useBody = () => useContext(BodyContext);

const BodyProvider = ({ children }) => {
    const [bodyState, setBodyState] = useState({}); // Placeholder state

    const value = {
        bodyState,
        setBodyState,
    };

    return (
        <BodyContext.Provider value={value}>
            {children}
        </BodyContext.Provider>
    );
};

export default BodyProvider;
