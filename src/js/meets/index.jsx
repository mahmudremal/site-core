// import React from 'react';
// import ReactDOM from 'react-dom';
import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
const App = lazy(() => import('./App'));
import { __ } from '@js/utils';
// import './styles.css';

document.querySelectorAll('#app_root').forEach(container => {
    const root = createRoot(container);root.render(
        <Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
            <App params={{}} />
        </Suspense>
    );
});
