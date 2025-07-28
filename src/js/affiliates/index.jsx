import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
const Affiliates = lazy(() => import('./backend'));
import { __, tailwind_install } from '@js/utils';

class AffiliateScript {
    constructor() {
        this.state = {tailwind: {installed: false}};
        this.setup_hooks();
    }
    setup_hooks() {
        this.apps_screen();
    }
    apps_screen() {
        document.querySelectorAll('#affiliate-links-app').forEach(async container => {
            await this.tailwind_install();
            container.innerHTML = '';
            const root = createRoot(container);root.render(
                <Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
                    <Affiliates />
                </Suspense>
            );
        });
    }
    async tailwind_install() {
        if (this.state.tailwind.installed) {return;}
        this.state.tailwind.installed = true;
        return await tailwind_install();
    }
}
const task = new AffiliateScript();

