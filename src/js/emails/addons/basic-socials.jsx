import { Share2, Facebook, Twitter, Linkedin, Instagram, Youtube, Github } from 'lucide-react';
import { Fragment } from 'react/jsx-runtime';
import BaseAddon from './base-addon';

class BasicSocials extends BaseAddon {
    constructor() {
        super();
    }

    get_id() {
        return 'basic-socials';
    }

    get_name() {
        return 'Social Icons';
    }

    get_icon() {
        return Share2;
    }

    get_category() {
        return 'basic';
    }

    get_description() {
        return 'Add social media icons with links';
    }

    get_settings() {
        return {
            content: {
                socials: {
                    title: 'Social Icons',
                    description: 'Add or remove social links',
                    fields: [
                        {
                            id: 'items',
                            type: 'repeater',
                            label: 'Social Links',
                            description: 'Add your social profiles',
                            value: [
                                { icon: 'facebook', url: '#' },
                                { icon: 'twitter', url: '#' }
                            ],
                            fields: [
                                {
                                    id: 'icon',
                                    type: 'select',
                                    label: 'Icon',
                                    value: '',
                                    options: [
                                        { value: 'facebook', label: 'Facebook' },
                                        { value: 'twitter', label: 'Twitter' },
                                        { value: 'linkedin', label: 'LinkedIn' },
                                        { value: 'instagram', label: 'Instagram' },
                                        { value: 'youtube', label: 'YouTube' },
                                        { value: 'github', label: 'GitHub' }
                                    ]
                                },
                                {
                                    id: 'url',
                                    type: 'text',
                                    label: 'URL',
                                    value: ''
                                }
                            ]
                        }
                    ]
                }
            },
            style: {
                iconStyle: {
                    title: 'Icon Style',
                    description: 'Customize icon appearance',
                    fields: [
                        {
                            id: 'size',
                            type: 'text',
                            label: 'Size',
                            description: 'e.g. 24px',
                            value: '24px'
                        },
                        {
                            id: 'color',
                            type: 'text',
                            label: 'Icon Color',
                            value: '#333'
                        },
                        {
                            id: 'background',
                            type: 'text',
                            label: 'Background Color',
                            value: 'transparent'
                        },
                        {
                            id: 'borderRadius',
                            type: 'text',
                            label: 'Border Radius',
                            value: '50%'
                        },
                        {
                            id: 'gap',
                            type: 'text',
                            label: 'Icon Gap',
                            value: '12px'
                        },
                        {
                            id: 'alignment',
                            type: 'select',
                            label: 'Alignment',
                            value: 'center',
                            options: [
                                { value: 'left', label: 'Left' },
                                { value: 'center', label: 'Center' },
                                { value: 'right', label: 'Right' }
                            ]
                        }
                    ]
                }
            },
            advanced: {
                advancedOptions: {
                    title: 'Advanced Options',
                    description: 'Additional settings',
                    fields: [
                        {
                            id: 'openNewTab',
                            type: 'checkbox',
                            label: 'Open in New Tab',
                            value: true
                        },
                        {
                            id: 'nofollow',
                            type: 'checkbox',
                            label: 'Add rel="nofollow"',
                            value: false
                        }
                    ]
                }
            }
        };
    }

    render({ element }) {
        if (!element?.data?.content?.socials) return <div>No social data</div>;

        const contentFields = element.data.content.socials;
        const styleFields = element.data.style?.iconStyle || [];
        const advancedFields = element.data.advanced?.advancedOptions || [];

        const getStyle = (id, fallback = '') => {
            const f = styleFields.find(f => f.id === id);
            return f?.value ?? fallback;
        };

        const getAdvanced = (id, fallback = false) => {
            const f = advancedFields.find(f => f.id === id);
            return f?.value === true || f?.value === 'true';
        };

        const size = getStyle('size', '24px');
        const color = getStyle('color', '#333');
        const background = getStyle('background', 'transparent');
        const borderRadius = getStyle('borderRadius', '50%');
        const gap = getStyle('gap', '12px');
        const alignment = getStyle('alignment', 'center');

        const openNewTab = getAdvanced('openNewTab', true);
        const nofollow = getAdvanced('nofollow', false);

        const itemsField = contentFields.find(f => f.id === 'items');
        const items = Array.isArray(itemsField?.value) ? itemsField.value : [];

        const iconMap = {
            facebook: Facebook,
            twitter: Twitter,
            linkedin: Linkedin,
            instagram: Instagram,
            youtube: Youtube,
            github: Github
        };

        const containerStyle = {
            display: 'flex',
            justifyContent: {
                left: 'flex-start',
                center: 'center',
                right: 'flex-end'
            }[alignment],
            gap
        };

        const iconWrapperStyle = {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: size,
            height: size,
            color,
            background,
            borderRadius,
            textDecoration: 'none',
            transition: 'all 0.3s ease'
        };

        return (
            <div style={containerStyle}>
                {items.map((item, index) => {
                    const Icon = iconMap[item.icon] || Share2;
                    const url = item.url || '#';
                    const rel = nofollow ? 'nofollow' : undefined;

                    return (
                        <a
                            key={index}
                            href={url}
                            target={openNewTab ? '_blank' : '_self'}
                            rel={rel}
                            style={iconWrapperStyle}
                        >
                            <Icon size={parseInt(size)} />
                        </a>
                    );
                })}
            </div>
        );
    }
}

export default BasicSocials;
