import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
const Radar = lazy(() => import('./radar'));
const RoleBased = lazy(() => import('./role-based'));
const AppsApiKeys = lazy(() => import('./api-keys'));
const TaskConfig = lazy(() => import('./task-config'));
import { __, tailwind_install } from '../utils';

class TaskSettings {
    constructor() {
        this.state = {tailwind: {installed: false}};
        this.setup_hooks();
    }
    setup_hooks() {
        this.settings_screen();
    }
    settings_screen() {
        document.querySelectorAll('#roles-assign-interface').forEach(async field => {
            const container = field.parentElement;
            container.previousElementSibling.remove();
            if (container) {
                await this.tailwind_install();
                container.innerHTML = '';
                container.setAttribute('colspan', 2);
                const config = JSON.parse(field.dataset.config);
                const root = createRoot(container);root.render(
                    <Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
                        <RoleBased config={config} />
                    </Suspense>
                );
            }
        });
        document.querySelectorAll('#apps-api-keys').forEach(async field => {
            const container = field.parentElement;
            container.previousElementSibling.remove();
            if (container) {
                await this.tailwind_install();
                container.innerHTML = '';
                container.setAttribute('colspan', 2);
                const config = JSON.parse(field.dataset.config);
                const root = createRoot(container);root.render(
                    <Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
                        <AppsApiKeys config={config} />
                    </Suspense>
                );
            }
        });
        document.querySelectorAll('#task-config-interface').forEach(async field => {
            const container = field.parentElement;
            container.previousElementSibling.remove();
            if (container) {
                await this.tailwind_install();
                container.innerHTML = '';
                container.setAttribute('colspan', 2);
                const config = JSON.parse(field.dataset.config);
                const root = createRoot(container);root.render(
                    <Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
                        <TaskConfig config={config} />
                    </Suspense>
                );
            }
        });
        document.querySelectorAll('#radar-interface').forEach(async field => {
            const container = field.parentElement;
            container.previousElementSibling.remove();
            if (container) {
                await this.tailwind_install();
                container.innerHTML = '';
                container.setAttribute('colspan', 2);
                const config = JSON.parse(field.dataset.config);
                const root = createRoot(container);root.render(
                    <Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
                        <Radar config={config} />
                    </Suspense>
                );
            }
        });
    }
    async tailwind_install() {
        if (this.state.tailwind.installed) {return;}
        this.state.tailwind.installed = true;
        tailwind_install();
    }
}
const task = new TaskSettings();