import { createContext, useState } from 'react';
import { Popup } from '@js/utils';

export const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const [popup, setPopup] = useState(null);

  return (
    <PopupContext.Provider value={{ popup, setPopup }}>
      {children}
      {popup && (
        <Popup
          onClose={() => setPopup(null)}
          className="fixed inset-0 z-50 flex items-center justify-center"
          bodyClassName="relative z-10 bg-scwhite dark:bg-scprimary text-scprimary dark:text-scwhite rounded-xl shadow-lg p-6 max-w-full min-w-[90vw] md:min-w-[28rem]"
          backdropClassName="absolute inset-0 bg-black/40 dark:bg-scprimary/40 bg-opacity-30"
          crossClassName="p-2 hover:bg-gray-100 dark:hover:bg-transparent border border-transparent dark:hover:border-scwhite rounded-lg"
        >
          {popup}
        </Popup>
      )}
    </PopupContext.Provider>
  );
};
