import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
const Invoice = lazy(() => import('./checkout'));
import { __, tailwind_install } from '@js/utils';


export default function Application(config = {}) {
    const container = document.querySelector('#payment-invoice');
    if (container) {
        tailwind_install().then(res => {
            const config = JSON.parse(atob(container.dataset.config));
            const root = createRoot(container);root.render(
                <Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
                    <Invoice config={config} />
                </Suspense>
            );
        });
    }
}