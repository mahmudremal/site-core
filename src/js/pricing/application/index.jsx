import React from 'react';
import { createRoot } from 'react-dom/client';
import Pricing from './pricing';
import { __, tailwind_install } from '@js/utils';


export default function Application(config = {}) {
    const container = document.querySelector('#payment-pricing');
    if (container) {
        tailwind_install();
        document.querySelectorAll('#header, #footer').forEach(el => el.style.display = 'none');
        const root = createRoot(container);root.render(<Pricing config={config} />);
    }
}