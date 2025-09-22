import { createContext, useState } from 'react';
import { Popup } from '@js/utils';

export const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const [popup, setPopup] = useState(null);

  return (
    <PopupContext.Provider value={{ popup, setPopup }}>
      {children}
      {popup && <Popup onClose={() => setPopup(null)}>{popup}</Popup>}
    </PopupContext.Provider>
  );
};
