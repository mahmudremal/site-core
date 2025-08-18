import { Video } from 'lucide-react';
import BaseAddon from './base-addon';

class BasicVideo extends BaseAddon {
    constructor() {
        super();
    }

    get_id() {
        return 'basic-video';
    }

    get_name() {
        return 'Basic Video';
    }

    get_icon() {
        return Video;
    }

    get_category() {
        return 'basic';
    }

    get_description() {
        return 'Embed a YouTube or custom video';
    }

    get_settings() {
        return {
            content: {
                video: {
                    title: 'Video Source',
                    description: 'Configure video details',
                    fields: [
                        {
                            id: 'sourceType',
                            type: 'select',
                            label: 'Source Type',
                            description: 'Select video type',
                            value: 'youtube',
                            options: [
                                { value: 'youtube', label: 'YouTube' },
                                { value: 'url', label: 'Custom URL' },
                                { value: 'embed', label: 'Embed Code' }
                            ]
                        },
                        {
                            id: 'youtubeId',
                            type: 'text',
                            label: 'YouTube Video ID',
                            description: 'Enter YouTube video ID (e.g., dQw4w9WgXcQ)',
                            value: ''
                        },
                        {
                            id: 'videoUrl',
                            type: 'text',
                            label: 'Custom Video URL',
                            description: 'Direct video file URL (mp4/webm)',
                            value: ''
                        },
                        {
                            id: 'embedCode',
                            type: 'textarea',
                            label: 'Embed Code',
                            description: 'Paste custom iframe/embed code',
                            value: ''
                        }
                    ]
                }
            },
            style: {
                videoStyle: {
                    title: 'Video Style',
                    description: 'Customize video display',
                    fields: [
                        {
                            id: 'aspectRatio',
                            type: 'select',
                            label: 'Aspect Ratio',
                            description: 'Video aspect ratio',
                            value: '16:9',
                            options: [
                                { value: '16:9', label: '16:9' },
                                { value: '4:3', label: '4:3' },
                                { value: '21:9', label: '21:9' },
                                { value: '1:1', label: '1:1' }
                            ]
                        },
                        {
                            id: 'borderRadius',
                            type: 'text',
                            label: 'Border Radius',
                            description: 'e.g., 8px, 50%',
                            value: '0px'
                        }
                    ]
                }
            },
            advanced: {
                videoAdvanced: {
                    title: 'Advanced',
                    description: 'Advanced options',
                    fields: [
                        {
                            id: 'autoplay',
                            type: 'checkbox',
                            label: 'Autoplay',
                            description: 'Start playing automatically',
                            value: false
                        },
                        {
                            id: 'loop',
                            type: 'checkbox',
                            label: 'Loop',
                            description: 'Play repeatedly',
                            value: false
                        },
                        {
                            id: 'muted',
                            type: 'checkbox',
                            label: 'Muted',
                            description: 'Start muted',
                            value: false
                        },
                        {
                            id: 'controls',
                            type: 'checkbox',
                            label: 'Show Controls',
                            description: 'Display video controls',
                            value: true
                        }
                    ]
                }
            }
        };
    }

    render({ element }) {
        if (!element?.data?.content?.video) return <div>No video data</div>;

        const fields = element.data.content.video;
        const videoStyleFields = element.data.style?.videoStyle || [];
        const videoAdvancedFields = element.data.advanced?.videoAdvanced || [];

        const get = (group, id, defaultVal = '') => {
            const field = group.find(f => f.id === id);
            return field?.value ?? defaultVal;
        };

        const sourceType = get(fields, 'sourceType', 'youtube');
        const youtubeId = get(fields, 'youtubeId');
        const videoUrl = get(fields, 'videoUrl');
        const embedCode = get(fields, 'embedCode');

        const autoplay = get(videoAdvancedFields, 'autoplay', false) === true || get(videoAdvancedFields, 'autoplay') === 'true';
        const loop = get(videoAdvancedFields, 'loop', false) === true || get(videoAdvancedFields, 'loop') === 'true';
        const muted = get(videoAdvancedFields, 'muted', false) === true || get(videoAdvancedFields, 'muted') === 'true';
        const controls = get(videoAdvancedFields, 'controls', true) === true || get(videoAdvancedFields, 'controls') === 'true';

        const aspectRatio = get(videoStyleFields, 'aspectRatio', '16:9');
        const borderRadius = get(videoStyleFields, 'borderRadius', '0px');

        const aspectPadding = {
            '16:9': '56.25%',
            '4:3': '75%',
            '21:9': '42.85%',
            '1:1': '100%'
        }[aspectRatio] || '56.25%';

        const wrapperStyle = {
            width: '100%',
            paddingBottom: aspectPadding,
            borderRadius,
            overflow: 'hidden'
        };

        const iframeStyle = {
            width: '100%',
            height: '100%',
            border: 'none'
        };

        if (sourceType === 'youtube' && youtubeId) {
            const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`;

            return (
                <div style={wrapperStyle}>
                    <iframe
                        style={iframeStyle}
                        src={embedUrl}
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title="YouTube Video"
                    />
                </div>
            );
        }

        if (sourceType === 'url' && videoUrl) {
            return (
                <div style={wrapperStyle}>
                    <video
                        src={videoUrl}
                        style={iframeStyle}
                        controls={controls}
                        autoPlay={autoplay}
                        loop={loop}
                        muted={muted}
                        playsInline
                    />
                </div>
            );
        }

        if (sourceType === 'embed' && embedCode) {
            return (
                <div
                    style={wrapperStyle}
                    dangerouslySetInnerHTML={{ __html: embedCode }}
                />
            );
        }

        return (
            <div
                style={{
                    padding: '20px',
                    color: '#999',
                    fontStyle: 'italic',
                    border: '2px dashed #ddd',
                    borderRadius: '4px',
                    textAlign: 'center'
                }}
            >
                Please provide a valid video source
            </div>
        );
    }
}
export default BasicVideo;