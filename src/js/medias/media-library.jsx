import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { __ } from '../utils';

const InstantImage = lazy(() => import('./instant-image'));

export const install_media_tab = () => {
	const l10n = wp.media.view.l10n;
	const MediaFrame = wp.media.view.MediaFrame.Select;

	wp.media.view.MediaFrame.Select = MediaFrame.extend({
		initialize: function () {
			MediaFrame.prototype.initialize.apply(this, arguments);

			const InstantImageState = wp.media.controller.State.extend({
				insert: function () {
					this.frame.close();
				}
			});

			this.states.add([
				new InstantImageState({
					id: 'instant_image',
					title: __('Instant Images'),
					priority: 200,
					search: false,
				}),
			]);

			this.on('content:render:instant_image', this.renderInstantImageTab, this);
		},

		browseRouter: function (routerView) {
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
					text: __('Instant Images'),
					priority: 60,
				},
			});
		},

		renderInstantImageTab: function () {
			const View = wp.Backbone.View.extend({
				className: 'instant-image-tab-content',
				initialize: function () {
					this.render();
				},
				render: function () {
					const reactRoot = document.createElement('div');
					this.el.innerHTML = '';this.el.appendChild(reactRoot);

					const root = createRoot(reactRoot);
					root.render(
						<Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...')}</div>}>
							<InstantImage config={{}} />
						</Suspense>
					);

					return this;
				},
			});
			var view = new View();
			this.content.set(view);
		},
	});
}
