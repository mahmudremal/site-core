import React from 'react';
import { useChat } from '../contexts/ChatContext';
import QRCode from 'react-qr-code';
import { __ } from '@js/utils';

const Login = () => {
    const { authState, qrCode } = useChat();

    return (
        <div className="xpo_flex xpo_flex-col xpo_items-center xpo_justify-center xpo_h-screen xpo_bg-gray-100">
            <div className="xpo_p-8 xpo_bg-white xpo_shadow-lg xpo_rounded-lg">
                <h1 className="xpo_text-2xl xpo_font-bold xpo_mb-4">{__('WhatsApp Login')}</h1>
                {authState === 'QR' && qrCode ? (
                    <div>
                        <p className="xpo_mb-4">{__('Scan this QR code with your phone')}</p>
                        <div className="xpo_p-4 xpo_bg-white">
                            <QRCode value={qrCode} size={256} />
                        </div>
                    </div>
                ) : authState === 'PENDING' ? (
                    <p>{__('Connecting...')}</p>
                ) : authState === 'FAILED' ? (
                    <p className="xpo_text-red-500">{__('Authentication Failed. Please try again.')}</p>
                ) : null}
            </div>
        </div>
    );
};

export default Login;
