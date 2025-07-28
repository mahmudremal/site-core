import { createRoot } from 'react-dom/client';
import App from './content';
import { tailwind_install } from '@js/utils';

class Banglee {
    constructor() {
        this.state = {tailwind: {installed: false}};
        this.setup_hooks();
    }
    setup_hooks() {
        this.setup_hunts_screen();
    }
    setup_hunts_screen() {
        document.querySelectorAll('#app_root').forEach(async container => {
            await this.tailwind_install();
            container.innerHTML = '';
            // const params = JSON.parse(container.dataset.params);
            const root = createRoot(container);root.render(<App />);
        });
    }
    async tailwind_install() {
        if (this.state.tailwind.installed) {return;}
        this.state.tailwind.installed = true;
        tailwind_install();
    }
}
const task = new Banglee();