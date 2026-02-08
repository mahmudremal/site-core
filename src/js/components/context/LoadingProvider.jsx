import { createContext, useState, useContext } from 'react';
import { useTranslation } from "@context/LanguageProvider";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const { __ } = useTranslation();
    const [loading, setLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            {children}
            {loading && (
                <div className="fixed inset-0 bg-white/70 z-40 flex justify-center items-center">
                    <div className="text-primary-500 text-xl animate-pulse">
                        {__('Loading...')}
                    </div>
                </div>
            )}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);
