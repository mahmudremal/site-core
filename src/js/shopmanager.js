import { createRoot } from "react-dom/client";
import ShopManager from "./shop-manager/index";
// import axios from 'axios';

class Frontend {
    constructor() {
        this.setup_hooks();
    }
    setup_hooks() {
        // this.tailwind_setup();
        this.app_setup();
    }
    app_setup() {
        document.querySelectorAll('#automated_store-manager').forEach(container => {
            const root = createRoot(container);root.render(<ShopManager />);
        })
    }
}

new Frontend();
