import React, { useState, useEffect } from 'react';
import Application from '@entry';
import Content from './content';
import MainLayout from './MainLayout';

export default function MainApplication({ config = {} }) {
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
        <Application>
            <MainLayout>
                <Content />
            </MainLayout>
        </Application>
    );
}
