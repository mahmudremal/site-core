import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
    const [backdrop, setBackdrop] = useState({ close: false });
    const [popup, setPopup] = useState(null);
    const popupRef = useRef(null);

    const closePopup = () => setPopup(null);

    useEffect(() => {
        if (!backdrop.close) { return; }
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setPopup(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    return (
        <PopupContext.Provider value={{ popup, setPopup }}>
            {children}
            {popup && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="relative card rounded-2xl p-6 shadow-lg min-w-[300px] max-w-[90vw]" ref={popupRef}>
                        <button
                            onClick={closePopup}
                            className="absolute top-2 right-2 text-gray-500 hover:text-black"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="card-body">
                            {popup}
                        </div>
                    </div>
                </div>
            )}
        </PopupContext.Provider>
    );
};

export const usePopup = () => useContext(PopupContext);
