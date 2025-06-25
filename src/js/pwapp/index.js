class MobilePWAApp {
	constructor() {
		this.config = window?.siteCoreConfig??{};
		this.ajaxUrl = this.config?.ajaxUrl??'';
		this.ajaxNonce = this.config?.ajax_nonce??'';
		var i18n = this.config?.i18n??{};
		this.i18n = {confirming: 'Confirming', ...i18n};
		this.setup_hooks();
	}
	setup_hooks() {
		this.initialize_service_worker();
	}
    initialize_service_worker() {
        self.addEventListener('install', (event) => {
            console.log('Service worker installed');
        });
    }
}
new MobilePWAApp();