import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { __, tailwind_install } from '@js/utils';
import { install_media_tab } from './media-library';

class Medias {
    constructor() {
        this.state = {tailwind: {installed: false}};
        this.setup_hooks();
    }
    setup_hooks() {
        this.media_screen();
    }
    media_screen() {
        tailwind_install().finally(() => install_media_tab());
    }
}
const task = new Medias();

