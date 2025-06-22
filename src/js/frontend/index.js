// import axios from 'axios';
import Application from './invoice';

class Frontend {
    constructor() {
        this.config = window?.partnershipmangConfig??{};
        this.ajaxUrl = this.config?.ajaxUrl ?? '';
        this.ajaxNonce = this.config?.ajax_nonce ?? '';
        var i18n = this.config?.i18n ?? {};
        this.i18n = {confirming: 'Confirming', ...i18n};
        this.public_key = 'BEUQwQdk-gIs0lekyHrvOJSVCutY6UlhuyRs7eyING3jrisB3kRHnR5w19N3xwNvipuGBe-AjufZQG2QfqCXyhA';
        this.setup_hooks();
    }
    setup_hooks() {
        this.invoice_setup();
        this.add_necessery_css();
        this.register_service_worker();
        this.initialize_install_button();
        // this.initialize_notification_subscription();
    }
    register_service_worker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register(this.config.sw_uri)
                .then(registration => {
                    // console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(error => {
                    // console.log('Service Worker registration failed:', error);
                });
            });
        }
    }
    initialize_install_button() {
        if (! location.pathname.startsWith('/partnership-dashboard')) {return;}
		if (this.getCookie("installPopupDismissed") === "true") {return;}
        let deferredPrompt;
        const installPopup = document.createElement('div');
        installPopup.style.display = 'none'; // Initially hidden
    
        // Styling the popup
        installPopup.innerHTML = `
            <div style="
                position: fixed; 
                top: 0; 
                left: 0; 
                width: 100%; 
                height: 100%; 
                background: rgba(0, 0, 0, 0.5); 
                display: flex; 
                justify-content: center; 
                align-items: center;
                z-index: 100000;
            ">
                <div style="
                    background: white; 
                    padding: 20px; 
                    border-radius: 10px; 
                    text-align: center; 
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                ">
                    <h2 style="margin-bottom: 20px;font-weight: 800;">Install Partnership manager</h2>
                    <p style="margin-bottom: 20px;">Add Partnership manager to your home screen for a better experience.</p>
                    <button id="install-button" style="
                        padding: 10px 20px; 
                        background: #e63f51; 
                        color: white; 
                        border: none; 
                        border-radius: 5px;
                        cursor: pointer;
                    ">Install</button>
                    <button id="cancel-button" style="
                        padding: 10px 20px; 
                        background: #ccc; 
                        color: black; 
                        border: none; 
                        border-radius: 5px;
                        margin-left: 10px;
                        cursor: pointer;
                    ">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(installPopup);
    
        // Show popup if the cookie is not set
		window.addEventListener('beforeinstallprompt', (event) => {
			event.preventDefault();
			console.log('beforeinstallprompt event triggered');
			deferredPrompt = event;
			installPopup.style.display = 'flex'; // Show the popup
		});
    
        document.getElementById('install-button').addEventListener('click', async () => {
            console.log('Install button clicked');
            if (!deferredPrompt) {
                console.log('deferredPrompt is null');
                return;
            }
            const { outcome } = await deferredPrompt.prompt();
            console.log(`User response to the install prompt: ${outcome}`);
            deferredPrompt = null;
            installPopup.style.display = 'none'; // Hide the popup
        });
    
        document.getElementById('cancel-button').addEventListener('click', () => {
            // console.log('Cancel button clicked');
            installPopup.remove();
            this.setCookie("installPopupDismissed", "true", 1); // Set cookie to expire in 1 day
        });
    }
    add_necessery_css() {
        const style = document.createElement('style');
        style.innerHTML = `.elementor-location-header, .et-mobile-panel-wrapper, .elementor-location-footer {display: none;}`;
        document.head.appendChild(style);
    }

	setCookie(name, value, days) {
		const d = new Date();
		d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
		const expires = "expires=" + d.toUTCString();
		document.cookie = name + "=" + value + ";" + expires + ";path=/";
	}

	getCookie(name) {
		const cname = name + "=";
		const decodedCookie = decodeURIComponent(document.cookie);
		const ca = decodedCookie.split(';');
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(cname) == 0) {
				return c.substring(cname.length, c.length);
			}
		}
		return "";
	}

    async initialize_notification_subscription() {
        if (this.config?.subscribe) { return; }
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            console.log("Push notifications not supported.");
            return;
        }
    
        try {
            const registration = await navigator.serviceWorker.register(this.config.sw_uri);
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.public_key
            });
    
            const response = await axios.get(this.ajaxUrl, {
                params: {
                    action: "rbpn_subscribe",
                    subscription: JSON.stringify(subscription),
                    nonce: this.ajaxNonce,
                    user_role: this.config?.user_role
                },
                headers: {
                    "Content-Type": "application/json"
                }
            });
    
            console.log("Success:", response.data);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    invoice_setup() {
        Application(this.config);
    }
    
}

new Frontend();
