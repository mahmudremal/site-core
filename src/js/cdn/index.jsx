import axios from "axios";

class CDN {
    constructor() {
        this.state = {tailwind: {installed: false}};
        this.setup_hooks();
    }
    setup_hooks() {
        this.setup_events();
    }
    setup_events() {
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
}
const cdn = new CDN();