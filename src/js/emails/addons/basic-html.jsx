import { Code } from 'lucide-react';
import BaseAddon from './base-addon';

class BasicHTML extends BaseAddon {
    constructor() {
        super();
    }

    get_id() {
        return 'basic-html';
    }

    get_name() {
        return 'HTML';
    }

    get_icon() {
        return Code;
    }

    get_category() {
        return 'basic';
    }

    get_description() {
        return 'Embed custom HTML code';
    }

    get_settings() {
        return {
            content: {
                html: {
                    title: 'HTML Code',
                    description: 'Paste your HTML markup',
                    fields: [
                        {
                            id: 'code',
                            type: 'textarea',
                            label: 'HTML Code',
                            description: 'Write your HTML here',
                            value: ''
                        }
                    ]
                }
            },
            style: {
                htmlStyle: {
                    title: 'Style',
                    description: 'Container styling options',
                    fields: [
                        {
                            id: 'padding',
                            type: 'text',
                            label: 'Padding',
                            value: '0px'
                        },
                        {
                            id: 'margin',
                            type: 'text',
                            label: 'Margin',
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
                            id: 'boxShadow',
                            type: 'text',
                            label: 'Box Shadow',
                            value: 'none'
                        },
                        {
                            id: 'minHeight',
                            type: 'text',
                            label: 'Min Height',
                            description: 'Minimum height for the HTML container',
                            value: '50px'
                        }
                    ]
                }
            },
            advanced: {
                htmlAdvanced: {
                    title: 'Advanced',
                    description: 'Advanced settings',
                    fields: [
                        {
                            id: 'customClass',
                            type: 'text',
                            label: 'Custom Class',
                            value: ''
                        },
                        {
                            id: 'customId',
                            type: 'text',
                            label: 'Custom ID',
                            value: ''
                        }
                    ]
                }
            }
        };
    }

    render({ element }) {
        if (!element?.data?.content?.html) {
            return <div>No HTML code provided</div>;
        }

        const contentFields = element.data.content.html;
        const styleFields = element.data.style?.htmlStyle || [];
        const advancedFields = element.data.advanced?.htmlAdvanced || [];

        const getValue = (group, id, fallback = '') => {
            const f = group.fields.find(f => f.id === id);
            return f?.value ?? fallback;
        };

        const htmlCode = getValue(contentFields, 'code', '');
        const padding = getValue(styleFields, 'padding', '0px');
        const margin = getValue(styleFields, 'margin', '0px');
        const background = getValue(styleFields, 'background', 'transparent');
        const border = getValue(styleFields, 'border', 'none');
        const borderRadius = getValue(styleFields, 'borderRadius', '0px');
        const customClass = getValue(advancedFields, 'customClass', '');
        const customId = getValue(advancedFields, 'customId', '');

        return (
            <div
                style={{ padding, margin, background, border, borderRadius }}
                className={customClass}
                id={customId}
                dangerouslySetInnerHTML={{ __html: htmlCode }}
            />
        );
    }
}
export default BasicHTML;