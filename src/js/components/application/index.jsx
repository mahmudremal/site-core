import React, { useState, useEffect } from 'react';
import NotificationsProvider from '@context/NotificationsProvider';
import { LoadingProvider } from '@context/LoadingProvider';
import LanguageProvider from '@context/LanguageProvider';
import CurrencyProvider from '@context/CurrencyProvider';
import SettingsProvider from '@context/SettingsProvider';
import { PopupProvider } from '@context/PopupProvider';
import SessionProvider from '@context/SessionProvider';
import { AuthProvider } from '@context/AuthProvider';
import ThemeProvider from '@context/ThemeProvider';
import { HashRouter } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import LoadStyles from './LoadStyles';

export default function Application({ children, config = {} }) {
    const [loading, setLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [fullScreen, setFullScreen] = useState(false);

    useEffect(() => {
        handleFullScreen();
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
                <HashRouter>
                    <LanguageProvider config={config}>
                        <SettingsProvider config={config}>
                            <CurrencyProvider>
                                <LoadingProvider>
                                    <PopupProvider>
                                        <NotificationsProvider>
                                            <LoadStyles />
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
                </HashRouter>
            </ThemeProvider>
        </SessionProvider>
    );
}
