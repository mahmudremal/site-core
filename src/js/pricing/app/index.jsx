import React from 'react';
import { createRoot } from 'react-dom/client';
import Pricing from './pricing';
import LoadStyles from '@entry/LoadStyles';


export default function Application(config = {}) {
    const container = document.querySelector('#payment-pricing');
    if (container) {
        const root = createRoot(container);root.render(
            <>
                <LoadStyles />
                <Pricing config={config} />
            </>
        );
    }
}