import React from 'react';
// import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import App from './app';
import { tailwind_install } from '@js/utils';


class Backend {
	constructor() {
		this.config = window?.siteCoreConfig??{};
		this.ajaxUrl = this.config?.ajaxUrl??'';
		this.ajaxNonce = this.config?.ajax_nonce??'';
		var i18n = this.config?.i18n??{};
		this.i18n = {submit: 'Submit', ...i18n};
		// window.siteCoreConfig = null;
		this.setup_hooks();
	}
	setup_hooks() {
		window.i18ns = window?.i18ns??{};
		this.init_metabox();
	}
	async init_metabox() {
		const container = document.querySelector('.partnershipapp');
		if (container) {
			try {
				await tailwind_install();
				document.querySelectorAll('#header, #footer').forEach(el => el.style.display = 'none');
				const root = createRoot(container);root.render(<App config={this.config} />);
				// ReactDOM.render(<App config={this.config} />, container);
			} catch (e) {
				console.error('Failed to parse JSON:', e);
			}
		}
	}
}

new Backend();