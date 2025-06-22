import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
const InstantImage = lazy(() => import('./instant-image'));
import { __ } from '../utils';

// Your React component


export default function install_media_tab() {
	const { media } = wp;
	const { l10n } = media.view;

	// Extend the media frame router
	media.view.MediaFrame.Select.prototype.browseRouter = (routerView) => {
		routerView.set({
			upload: {
				text: l10n.uploadFilesTitle,
				priority: 20,
			},
			browse: {
				text: l10n.mediaLibraryTitle,
				priority: 40,
			},
			instant_image: {
				text: __('Instant Image'),
				priority: 60,
			},
		});
	};

	// Open handler
	wp.media.view.Modal.prototype.on('open', function () {
		const activeTab = document.querySelector('.active#menu-item-instant_image');
		if (activeTab && activeTab?.nodeType) {mountReactComponent();}

		// Tab click handler.
		document.querySelectorAll('#menu-item-instant_image:not([data-event-attached])').forEach(tab => {
			tab.dataset.eventAttached = true;
			tab.addEventListener('click', function (e) {
				e.preventDefault();
				mountReactComponent();
			});
		});
	});


	// Function to mount React component
	function mountReactComponent() {
		const container = document.querySelector('.media-frame-content');
		if (container) {
			// Clear previous content
			container.innerHTML = '';

			// Create a new div as mount node
			const content = document.createElement('div');
			content.classList.add('xpo_p-3', 'xpo_rounded-lg');
			content.innerHTML = '<h2>Instant Image</h2><p>Mounting Instant Image Tab...</p>';
			container.appendChild(content);

			// Render React component
			const root = createRoot(container);root.render(
				<Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
					<InstantImage config={{}} />
				</Suspense>
			);
		}
	}
}