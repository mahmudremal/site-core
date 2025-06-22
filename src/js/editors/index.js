import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
const Editor = lazy(() => import('./editor'));
import { __ } from './utils';
import { sleep } from "@functions";
import { tailwind_install } from '../utils';

class TaskEditor {
    constructor() {
        this.state = {tailwind: {installed: false}};
        this.config = window?._aieditor_config??{};
        this.setup_hooks();
    }
    setup_hooks() {
        this.editor_screen();
    }
    editor_screen() {
        document.querySelectorAll('#content-html').forEach(async button => {
            const container = document.createElement('div');
            const trigger = document.createElement('button');
            trigger.innerHTML = 'Let AI';trigger.type = 'button';
            trigger.classList.add('wp-switch-editor');
            button.parentElement.appendChild(trigger);
            const carea = document.querySelector('#wpbody-content');
            if (carea) {carea.appendChild(container);}
            else {document.body.appendChild(container);}
            await sleep(2000);
            if (container) {
                if (!this.state.tailwind.installed) {
                    this.state.tailwind.installed = await tailwind_install();
                }
                const root = createRoot(container);root.render(
                    <Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
                        <Editor trigger={trigger} config={this.config} />
                    </Suspense>
                );
            }
        });
    }

}
const task = new TaskEditor();