import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
    const [backdrop, setBackdrop] = useState({close: false});
    const [popup, setPopup] = useState(null);
    const popupRef = useRef(null);
    
    return (
        <PopupContext.Provider value={{ popup, setPopup }}>
            {children}
            {popup && (
                <div className="fixed inset-0 bg-[#00000085] xpo_w-full xpo_h-full top-0 left-0 bg-black/40 flex xpo_justify-center xpo_items-center z-50">
                    <div className="card relative rounded-2xl xpo_p-6 shadow-lg min-w-[300px] xpo_max-w-[90vw]" ref={popupRef}>
                        <button
                            onClick={(e) => setPopup(null)}
                            className="absolute xpo_text-gray-500 hover:text-black top-2 right-2 xpo_p-4"
                        >
                            <X className="w-5 xpo_h-5" />
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
