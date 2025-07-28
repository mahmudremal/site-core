import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
    const [backdrop, setBackdrop] = useState({close: false});
    const [popup, setPopup] = useState(null);
    const popupRef = useRef(null);

    const closePopup = () => setPopup(null);

    useEffect(() => {
        if (!backdrop.close) {return;}
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
                <div className="xpo_fixed xpo_inset-0 xpo_bg-black/40 xpo_flex xpo_justify-center xpo_items-center xpo_z-50">
                    <div className="xpo_relative card xpo_rounded-2xl xpo_p-6 xpo_shadow-lg xpo_min-w-[300px] xpo_max-w-[90vw]" ref={popupRef}>
                        <button
                            onClick={closePopup}
                            className="xpo_absolute xpo_top-2 xpo_right-2 xpo_text-gray-500 hover:xpo_text-black"
                        >
                            <X className="xpo_w-5 xpo_h-5" />
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
