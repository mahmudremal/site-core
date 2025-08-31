
import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
// import StorageProvider from './utils/contexts/storage';
// import BodyProvider from './utils/contexts/body';
// import { SocketProvider } from './contexts/SocketContext';
// import { ChatProvider } from './contexts/ChatContext';
import { __ } from '@js/utils';

// const WhatsappHome = lazy(() => import('./pages/Home'));
// const WhatsappHome = lazy(() => import('./Home'));
const WhatsappHome = lazy(() => import('./Client'));

const WhatsappError = () => {
    return (
        <div>{__('Something wrong happen', 'site-core')}</div>
    )
}


const Whatsapp = () => {
    return (
        <Suspense fallback={<div className="xpo_text-center xpo_p-4">Loading...</div>}>
            {/* <StorageProvider>
                <BodyProvider>
                    <SocketProvider>
                        <ChatProvider> */}
                            <Routes>
                                <Route path="/" element={<WhatsappHome />} />
                                <Route path="*" element={<WhatsappError />} />
                            </Routes>
                        {/* </ChatProvider>
                    </SocketProvider>
                </BodyProvider>
            </StorageProvider> */}
        </Suspense>
    );
};

export default Whatsapp;