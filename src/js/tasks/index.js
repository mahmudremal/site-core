import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
const TaskTable = lazy(() => import('./table'));
import axios from 'axios';

const __ = (t) => t;

class Tasks {
	constructor() {
		this.config = window?.siteCoreConfig??{};
		this.ajaxUrl = this.config?.ajaxUrl??'';
		this.ajaxNonce = this.config?.ajax_nonce??'';
		var i18n = this.config?.i18n??{};
		this.i18n = {confirming: 'Confirming', ...i18n};
		this.setup_hooks();
	}
	setup_hooks() {
		this.setup_table();
		this.setup_events();
	}
    setup_events() {
        document.querySelectorAll('.toplevel_page_automated-jobs select[name="job-status"]').forEach(element => {
			element.addEventListener('change', (event) => {
				event.preventDefault();event.stopPropagation();
				const job_id = parseInt(element.parentElement.parentElement.dataset.jobId);
				const task_key = parseInt(element.parentElement.dataset.key);
				const update_value = event.target.value
				if (job_id) {
					axios.post(`https://core.agency.local/wp-json/sitecore/v1/tasks/${job_id}`, {task_key, update_value}, {headers: {'X-WP-Nonce': this.ajaxNonce}});
				}
			});
		});
    }
	setup_table() {
		const script = document.createElement("script");
        script.src = 'https://cdn.tailwindcss.com';
        script.onload = () => {
            window.tailwind = window.tailwind || {};
            window.tailwind.config = {prefix: 'xpo_'};
        }
        document.head.appendChild(script);
		document.querySelectorAll('#automated_task_table').forEach(container => {
			const config = JSON.parse(container.dataset.config);
			const root = createRoot(container);root.render(
				<Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
					<Toaster />
					<TaskTable config={config} />
				</Suspense>
			);
		});
	}
}
new Tasks();