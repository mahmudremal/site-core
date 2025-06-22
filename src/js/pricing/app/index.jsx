import React from 'react';
import { createRoot } from 'react-dom/client';
import Pricing from './pricing';


export default function Application(config = {}) {
    const container = document.querySelector('#payment-pricing');
    if (container) {
        const root = createRoot(container);root.render(<Pricing config={config} />);
    }
}