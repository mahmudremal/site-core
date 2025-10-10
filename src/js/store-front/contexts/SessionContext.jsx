import Cookies from 'js-cookie';
import { createContext, useEffect, useState } from 'react';
// import request from '@common/request';
import api from '../services/api';

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    const [firstCall, setFirstCall] = useState(null);
    const [session, setSession] = useState(() => {
        const saved = localStorage.getItem('sc-session');
        const parsed = saved ? JSON.parse(saved) : {}
        return parsed;
    });

    useEffect(() => {
        if (!firstCall) return setFirstCall(true);
        try {
            localStorage.setItem('sc-session', JSON.stringify(session));
        }
        catch (err) {console.error(err);}
    }, [session]);

    return (
        <SessionContext.Provider value={{ session, setSession }}>
            {children}
        </SessionContext.Provider>
    );
};
