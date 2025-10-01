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
          className="xpo_fixed xpo_inset-0 xpo_z-50 xpo_flex xpo_items-center xpo_justify-center"
          bodyClassName="xpo_relative xpo_z-10 xpo_bg-scwhite dark:xpo_bg-scprimary xpo_text-scprimary dark:xpo_text-scwhite xpo_rounded-xl xpo_shadow-lg xpo_p-6 xpo_max-w-full xpo_min-w-[90vw] md:xpo_min-w-[28rem]"
          backdropClassName="xpo_absolute xpo_inset-0 xpo_bg-black/40 dark:xpo_bg-scprimary/40 xpo_bg-opacity-30"
          crossClassName="xpo_p-2 hover:xpo_bg-gray-100 dark:hover:xpo_bg-transparent xpo_border xpo_border-transparent dark:hover:xpo_border-scwhite xpo_rounded-lg"
        >
          {popup}
        </Popup>
      )}
    </PopupContext.Provider>
  );
};
