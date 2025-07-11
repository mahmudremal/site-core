import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
const Hunts = lazy(() => import('./hunts'));
const Editor = lazy(() => import('./editor'));
import { __, tailwind_install } from '@js/utils';

class HuntsClient {
    constructor() {
        this.state = {tailwind: {installed: false}};
        this.setup_hooks();
    }
    setup_hooks() {
        this.setup_hunts_screen();
    }
    setup_hunts_screen() {
        document.querySelectorAll('#hunting-record-table').forEach(async container => {
            document.body.style.visibility = 'hidden';
            container.style.visibility = "visible";
            await this.tailwind_install();
            container.innerHTML = '';
            const params = JSON.parse(container.dataset.params);
            if (location.search) {
                const searchParams = new URLSearchParams(location.search);
                if (searchParams.get('f')) {
                    params._filters = JSON.parse(atob(searchParams.get('f')));
                }
            }
            const root = createRoot(container);root.render(
                <Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
                    <Hunts params={params} />
                </Suspense>
            );
        });
        document.querySelectorAll('#hunting-editor-table').forEach(async container => {
            await this.tailwind_install();
            container.innerHTML = '';
            const params = JSON.parse(container.dataset.params);
            const root = createRoot(container);root.render(
                <Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
                    <Editor params={params} />
                </Suspense>
            );
        });
    }
    async tailwind_install() {
        if (this.state.tailwind.installed) {return;}
        this.state.tailwind.installed = true;
        tailwind_install();
    }
}
const task = new HuntsClient();