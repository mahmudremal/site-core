import React, { Suspense, lazy, useState, useEffect } from 'react';

import NotificationsProvider from './core/context/NotificationsProvider';
import { LoadingProvider } from './core/context/LoadingProvider';
import LanguageProvider from './core/context/LanguageProvider';
import CurrencyProvider from './core/context/CurrencyProvider';
import SettingsProvider from './core/context/SettingsProvider';
import { PopupProvider } from './core/context/PopupProvider';
import SessionProvider from './core/context/SessionProvider';
import { AuthProvider } from './core/context/AuthProvider';
import ThemeProvider from './core/context/ThemeProvider';
import { HashRouter, BrowserRouter } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
// import LoadStyles from '@entry/LoadStyles';



import { __ } from '@js/utils';

export default function Application({ children }) {
    const [loading, setLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [fullScreen, setFullScreen] = useState(false);

    const config = {};

    useEffect(() => {
        // handleFullScreen();
        setLoading(false);
    }, []);

    const handleLockScreen = () => setIsLocked(true);

    const handleFullScreen = () => {
        document.body.style.overflow = fullScreen ? 'auto' : 'hidden';
        setFullScreen(!fullScreen);
    };
    
    return (
        <SessionProvider>
            <ThemeProvider>
                <BrowserRouter>
                    <LanguageProvider config={config}>
                        <SettingsProvider config={config}>
                            <CurrencyProvider>
                                <LoadingProvider>
                                    <PopupProvider>
                                        <NotificationsProvider>
                                            {/* <LoadStyles /> */}
                                            <AuthProvider>
                                                <div>
                                                    <Toaster />
                                                    <div>
                                                        {children}
                                                    </div>
                                                    {isLocked && (
                                                        <div className="absolute top-0 left-0 xpo_w-full xpo_h-full bg-black bg-opacity-75 flex xpo_flex-col xpo_justify-center xpo_items-center">
                                                            <ShieldCheck size={200} color="white" className="mb-8" />
                                                            <button
                                                                onClick={(e) => setIsLocked(null)}
                                                                className="px-4 py-2 bg-primary-500 xpo_text-white rounded-full hover:bg-primary-600"
                                                            >{__('Unlock')}</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </AuthProvider>
                                        </NotificationsProvider>
                                    </PopupProvider>
                                </LoadingProvider>
                            </CurrencyProvider>
                        </SettingsProvider>
                    </LanguageProvider>
                </BrowserRouter>
            </ThemeProvider>
        </SessionProvider>
    );
}