import { useContext } from 'react';
import { LocaleContext } from '../contexts/LocaleContext';

export const useLocale = () => {
  return useContext(LocaleContext);
};
