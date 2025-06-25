// import axios from 'axios';
import Application from './app';

class Pricing {
    constructor() {
        this.config = window?.siteCoreConfig??{};
        this.ajaxUrl = this.config?.ajaxUrl ?? '';
        this.ajaxNonce = this.config?.ajax_nonce ?? '';
        var i18n = this.config?.i18n ?? {};
        this.i18n = {confirming: 'Confirming', ...i18n};
        this.setup_hooks();
    }
    setup_hooks() {
        this.invoice_setup();
    }
    invoice_setup() {
        Application(this.config);
    }
    
}

new Pricing();
