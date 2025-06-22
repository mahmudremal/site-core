import Content from './content';
import MainLayout from './MainLayout';
import LoadStyles from '@entry/LoadStyles';
import { Toaster } from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import LanguageProvider from '@context/LanguageProvider';
import SettingsProvider from '@context/SettingsProvider';
import { LoadingProvider } from '@context/LoadingProvider';
import { PopupProvider } from '@context/PopupProvider';
import { AuthProvider } from '@context/AuthProvider';
import SessionProvider from '@context/SessionProvider';
import ThemeProvider from '@context/ThemeProvider';
import NotificationsProvider from '@context/NotificationsProvider';
import CurrencyProvider from '@context/CurrencyProvider';

export default function App({ config = {} }) {
    const [loading, setLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [fullScreen, setFullScreen] = useState(false);

    useEffect(() => {
        handleFullScreen();
        setLoading(false);
    }, []);

    const handleLockScreen = () => setIsLocked(true);
    const handleUnlockScreen = () => setIsLocked(false);

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
                                            <LoadStyles />
                                            <AuthProvider>
                                                <MainLayout>
                                                    <div>
                                                        <Toaster />
                                                        <Content />
                                                        {isLocked && (
                                                            <div className="xpo_absolute xpo_top-0 xpo_left-0 xpo_w-full xpo_h-full xpo_bg-black xpo_bg-opacity-75 xpo_flex xpo_flex-col xpo_justify-center xpo_items-center">
                                                                <ShieldCheck size={200} color="white" className="xpo_mb-8" />
                                                                <button
                                                                    onClick={handleUnlockScreen}
                                                                    className="xpo_px-4 xpo_py-2 xpo_bg-primary-500 xpo_text-white xpo_rounded-full hover:xpo_bg-primary-600"
                                                                >{__('Unlock')}</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </MainLayout>
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
