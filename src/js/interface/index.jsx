import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import MainApplication from './application';
import { __ } from '@js/utils';

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
	}
	setup_table() {
		document.querySelectorAll('#app_root').forEach(container => {
			const root = createRoot(container);root.render(
				<Suspense fallback={<div className="text-center xpo_p-4">{__('Loading...')}</div>}>
					<Toaster />
					<MainApplication config={{}} />
				</Suspense>
			);
		});
	}
}
new Tasks();
