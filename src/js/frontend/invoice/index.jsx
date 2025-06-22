import React from 'react';
import { createRoot } from 'react-dom/client';
import Invoice from './checkout';
import { tailwind_install } from '@js/utils';


export default function Application(config = {}) {
    const container = document.querySelector('#payment-invoice');
    if (container) {
        tailwind_install();
        const config = JSON.parse(atob(container.dataset.config));
        const root = createRoot(container);root.render(<Invoice config={config} />);
    }
}