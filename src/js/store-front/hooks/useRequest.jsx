import { useContext } from 'react';
import { RequestContext } from '../contexts/RequestContext';

export const useRequest = () => {
  return useContext(RequestContext);
};
