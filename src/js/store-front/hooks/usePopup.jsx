import { useContext } from 'react';
import { PopupContext } from '../contexts/PopupContext';

export const usePopup = () => {
  return useContext(PopupContext);
};
