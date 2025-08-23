import axios from 'axios';
import { lazy, Suspense } from 'react';
// import settings_screen from '../settings';
// const TaskManager = lazy(() => import('@js/tasks'));
// const Affiliates = lazy(() => import('@js/affiliates'));
// const ShopManager = lazy(() => import('@js/shop-manager'));
// const EmailBuilderApp = lazy(() => import('@js/emails/index'));
const ServicePackage = lazy(() => import('@js/services/package'));
const ServiceMetaBox = lazy(() => import('@js/services/metabox'));
const ServiceContracts = lazy(() => import('@js/services/contracts'));
import { 
    __,
    tailwind_install
 } from '@js/utils';
import { createRoot } from 'react-dom/client';

class SiteCore {
    constructor() {
        this.config = window?.siteCoreConfig??{};
		this.ajaxUrl = this.config?.ajaxUrl??'';
		this.ajaxNonce = this.config?.ajax_nonce??'';
		var i18n = this.config?.i18n??{};
		this.i18n = {confirming: 'Confirming', ...i18n};
		this.setup_hooks();
    }

    setup_hooks() {
        tailwind_install();
        // settings_screen();
        // this.cdnmanager_setup();
		// this.taskmanager_setup();
		// this.shopmanager_setup();
        // this.emailbuilder_setup();
        // this.linksmanager_setup();

        window.addEventListener('load', () => {
            this.packagebtn_setup();
        });
    }

    taskmanager_setup() {
        document.querySelectorAll('.toplevel_page_automated-jobs select[name="job-status"]').forEach(element => {
            element.addEventListener('change', (event) => {
                event.preventDefault();event.stopPropagation();
                const job_id = parseInt(element.parentElement.parentElement.dataset.jobId);
                const task_key = parseInt(element.parentElement.dataset.key);
                const update_value = event.target.value
                if (job_id) {
                    axios.post(`https://${location.host}/wp-json/sitecore/v1/tasks/${job_id}`, {task_key, update_value}, {headers: {'X-WP-Nonce': this.ajaxNonce}});
                }
            });
        });
        document.querySelectorAll('#automated_task_table').forEach(container => {
            const config = JSON.parse(container.dataset.config);
            const root = createRoot(container);root.render(<TaskManager config={config} />);
        });
    }

    shopmanager_setup() {
        document.querySelectorAll('#automated_store-manager').forEach(container => {
            const root = createRoot(container);root.render(<ShopManager />);
        })
    }

    emailbuilder_setup() {
        document.querySelectorAll('#email-editor-screen').forEach(container => {
            const root = createRoot(container);root.render(<EmailBuilderApp />);
        })
    }

    cdnmanager_setup() {
        document.querySelectorAll('.send_to_cdn a').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();e.stopPropagation();
                const formData = new FormData();
                formData.append('token', Date.now());
                axios.get(`https://${location.host}/wp-json/sitecore/v1/cdn/attachments/${btn.dataset.post_id}/send`)
                .then(res => res.data)
                .then(data => btn.remove())
                .then(data => location.reload())
                .catch(err => console.error(err));
            });
        });
    }

    linksmanager_setup() {
        document.querySelectorAll('#affiliate-links-app').forEach(async container => {
            container.innerHTML = '';
            const root = createRoot(container);root.render(
                <Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
                    <Affiliates />
                </Suspense>
            );
        });
    }

    packagebtn_setup() {
        const buttons = document.querySelectorAll('.select-package-button');
        if (buttons?.length) {
            const container = document.createElement('div');
            document.body.appendChild(container);
            const root = createRoot(container);root.render(
                <Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
                    <ServicePackage buttons={buttons} />
                </Suspense>
            );
        }
        document.querySelectorAll('#services_meta-box[data-config]').forEach(container => {
            const config = JSON.parse(container?.dataset?.config);
            if (!config) {return;}container.innerHTML = '';
            const input = document.createElement('input');
            input.type = 'hidden';input.name = '_service_conditionals';
            container.parentElement.insertBefore(input, container);
            const root = createRoot(container);root.render(
                <Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
                    <ServiceMetaBox config={config} input={input} />
                </Suspense>
            );
        });
        document.querySelectorAll('#service-contract-leads').forEach(container => {
            const root = createRoot(container);root.render(
                <Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
                    <ServiceContracts />
                </Suspense>
            );
        });
    }


}

new SiteCore();