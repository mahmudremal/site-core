import { Code } from 'lucide-react';
import BaseAddon from './base-addon';

class BasicShortcode extends BaseAddon {
    constructor() {
        super();
    }

    get_id() {
        return 'basic-shortcode';
    }

    get_name() {
        return 'Shortcode';
    }

    get_icon() {
        return Code;
    }

    get_category() {
        return 'basic';
    }

    get_description() {
        return 'Render a WordPress shortcode';
    }

    get_settings() {
        return {
            content: {
                shortcode: {
                    title: 'Shortcode',
                    description: 'Enter your WordPress shortcode',
                    fields: [
                        {
                            id: 'code',
                            type: 'textarea',
                            label: 'Shortcode',
                            description: 'Example: [your_shortcode]',
                            value: ''
                        }
                    ]
                }
            },
            style: {
                shortcodeStyle: {
                    title: 'Wrapper Style',
                    description: 'Customize wrapper styles',
                    fields: [
                        {
                            id: 'textAlign',
                            type: 'select',
                            label: 'Text Align',
                            value: 'center',
                            options: [
                                { value: 'left', label: 'Left' },
                                { value: 'center', label: 'Center' },
                                { value: 'right', label: 'Right' }
                            ]
                        },
                        {
                            id: 'padding',
                            type: 'text',
                            label: 'Padding',
                            value: '0px'
                        },
                        {
                            id: 'background',
                            type: 'text',
                            label: 'Background Color',
                            value: 'transparent'
                        },
                        {
                            id: 'border',
                            type: 'text',
                            label: 'Border',
                            value: 'none'
                        },
                        {
                            id: 'borderRadius',
                            type: 'text',
                            label: 'Border Radius',
                            value: '0px'
                        },
                        {
                            id: 'textColor',
                            type: 'text',
                            label: 'Text Color',
                            value: 'inherit'
                        },
                        {
                            id: 'fontSize',
                            type: 'text',
                            label: 'Font Size',
                            value: 'inherit'
                        }
                    ]
                }
            },
            advanced: {
                shortcodeAdvanced: {
                    title: 'Advanced',
                    description: 'Extra options',
                    fields: [
                        {
                            id: 'wrapInDiv',
                            type: 'checkbox',
                            label: 'Wrap in DIV',
                            description: 'Wrap shortcode output in a container',
                            value: true
                        }
                    ]
                }
            }
        };
    }

    render({ element }) {
        if (!element?.data?.content?.shortcode) {
            return <div>No HTML code provided</div>;
        }

        const contentFields = element.data.content.shortcode;
        const styleFields = element.data.style?.shortcodeStyle || [];
        const advancedFields = element.data.advanced?.shortcodeAdvanced || [];

        const getValue = (group, id, fallback = '') => {
            const f = group.fields.find(f => f.id === id);
            return f?.value ?? fallback;
        };

        const shortcode = getValue(contentFields, 'code', '');
        const textAlign = getValue(styleFields, 'textAlign', 'center');
        const padding = getValue(styleFields, 'padding', '0px');
        const background = getValue(styleFields, 'background', 'transparent');
        const border = getValue(styleFields, 'border', 'none');
        const borderRadius = getValue(styleFields, 'borderRadius', '0px');
        const textColor = getValue(styleFields, 'textColor', 'inherit');
        const fontSize = getValue(styleFields, 'fontSize', 'inherit');
        const wrapInDiv = getValue(advancedFields, 'wrapInDiv', true) === true || getValue(advancedFields, 'wrapInDiv') === 'true';

        if (!shortcode) {
            return (
                <div
                    style={{
                        padding: '20px',
                        border: '2px dashed #ccc',
                        borderRadius: '4px',
                        textAlign: 'center',
                        color: '#999',
                        fontStyle: 'italic'
                    }}
                >
                    No shortcode provided
                </div>
            );
        }

        const parsedShortcodeOutput = `<div>[Shortcode Output: ${shortcode}]</div>`;

        if (!wrapInDiv) {
            return <div dangerouslySetInnerHTML={{ __html: parsedShortcodeOutput }} />;
        }

        return (
            <div
                style={{
                    textAlign,
                    padding,
                    background,
                    border,
                    borderRadius,
                    color: textColor,
                    fontSize
                }}
                className="shortcode-wrapper"
                dangerouslySetInnerHTML={{ __html: parsedShortcodeOutput }}
            />
        );
    }
}
export default BasicShortcode;