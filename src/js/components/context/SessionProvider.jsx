import React, { useState, useEffect, createContext, useContext } from 'react';
import { roles } from '@functions';
import request from '@common/request';
const SessionContext = createContext();

export default function SessionProvider({ children, initial = {} }) {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('app-session');
    const parsed = saved ? JSON.parse(saved) : initial
    const { user = {} } = parsed;
    roles.set_abilitites(
      (user?.roles??[]).map(r => r?.capabilities??{}).find(r => r)
    );
    return parsed;
  });

  useEffect(() => {
    try {
      localStorage.setItem('app-session', JSON.stringify(session));
      if (session?.authToken) {
        request.set('Authorization', session?.authToken);
      }
      const { user = {} } = session;
      roles.set_abilitites(
        (user?.roles??[]).map(r => r?.capabilities??{}).find(r => r)
      );
    } catch (error) {
      console.error(error);
    }
  }, [session]);

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
