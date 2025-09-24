import axios from 'axios';
import Cookies from 'js-cookie';
import { createContext, useEffect, useState } from 'react';
// import request from '@common/request';
import api from '../services/api';

export const RequestContext = createContext();

export const RequestProvider = ({ children }) => {
    const [caches, setCaches] = useState([]);
    const [config, setConfig] = useState(
        () => window?.siteCoreConfig??{}
    );
    const [nonce, setNonce] = useState(
        () => window?.siteCoreConfig?.ajax_nonce
    );

    useEffect(() => {
        if (!nonce) return;
        // request.set('_nonce', nonce);
    }, [nonce]);

    useEffect(() => {
        if (!nonce) return;
        // window.siteCoreConfig = undefined;
    }, []);

    return (
        <RequestContext.Provider value={{ api, caches, setCaches, config, setConfig, nonce, setNonce }}>
            {children}
        </RequestContext.Provider>
    );
};
