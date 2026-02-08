import { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { __, tailwind_install } from '@js/utils';
import { install_media_tab } from './media-library';

class Medias {
    constructor() {
        this.state = { tailwind: { installed: false } };
        this.setup_hooks();
    }
    setup_hooks() {
        this.media_screen();
    }
    media_screen() {
        install_media_tab()
        // tailwind_install().finally(() => install_media_tab());
    }
}
const task = new Medias();

