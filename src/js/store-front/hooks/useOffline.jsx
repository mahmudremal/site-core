import { useContext } from 'react';
import { OfflineContext } from '../contexts/OfflineContext';

export const useOffline = () => {
  return useContext(OfflineContext);
};
