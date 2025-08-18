import { Quote } from 'lucide-react';
import BaseAddon from './base-addon';

class BasicBlackQuota extends BaseAddon {
    constructor() {
        super();
    }

    get_id() {
        return 'black-quota';
    }

    get_name() {
        return 'Black Quota';
    }

    get_icon() {
        return Quote;
    }

    get_category() {
        return 'basic';
    }

    get_description() {
        return 'Stylized block quote for testimonials or quotations';
    }

    get_settings() {
        return {
            content: {
                quote: {
                    title: 'Quote Content',
                    description: 'Add quote text and author',
                    fields: [
                        {
                            id: 'text',
                            type: 'textarea',
                            label: 'Quote Text',
                            description: 'Enter the quote text',
                            value: '“Design is not just what it looks like and feels like. Design is how it works.”'
                        },
                        {
                            id: 'author',
                            type: 'text',
                            label: 'Author',
                            description: 'Person who said the quote',
                            value: 'Steve Jobs'
                        }
                    ]
                }
            },
            style: {
                quoteStyle: {
                    title: 'Quote Style',
                    description: 'Customize appearance',
                    fields: [
                        {
                            id: 'alignment',
                            type: 'select',
                            label: 'Text Alignment',
                            value: 'center',
                            options: [
                                { value: 'left', label: 'Left' },
                                { value: 'center', label: 'Center' },
                                { value: 'right', label: 'Right' }
                            ]
                        },
                        {
                            id: 'fontSize',
                            type: 'text',
                            label: 'Font Size',
                            value: '20px'
                        },
                        {
                            id: 'fontColor',
                            type: 'text',
                            label: 'Font Color',
                            value: '#fff'
                        },
                        {
                            id: 'background',
                            type: 'text',
                            label: 'Background Color',
                            value: '#000'
                        },
                        {
                            id: 'padding',
                            type: 'text',
                            label: 'Padding',
                            value: '24px'
                        },
                        {
                            id: 'borderRadius',
                            type: 'text',
                            label: 'Border Radius',
                            value: '8px'
                        }
                    ]
                },
                quoteTypography: {
                    title: 'Quote Typography',
                    description: 'Styling for the quote text',
                    fields: [
                        { id: 'fontFamily', type: 'text', label: 'Font Family', value: 'inherit' },
                        { id: 'fontWeight', type: 'select', label: 'Font Weight', value: 'normal', options: [
                            { value: 'normal', label: 'Normal' }, { value: 'bold', label: 'Bold' }, { value: '300', label: '300' }, { value: '400', label: '400' }, { value: '500', label: '500' }, { value: '600', label: '600' }, { value: '700', label: '700' }
                        ]},
                        { id: 'lineHeight', type: 'text', label: 'Line Height', value: '1.3' },
                        { id: 'letterSpacing', type: 'text', label: 'Letter Spacing', value: '0px' },
                        { id: 'textTransform', type: 'select', label: 'Text Transform', value: 'none', options: [
                            { value: 'none', label: 'None' }, { value: 'uppercase', label: 'Uppercase' }, { value: 'lowercase', label: 'Lowercase' }, { value: 'capitalize', label: 'Capitalize' }
                        ]},
                        { id: 'fontStyle', type: 'select', label: 'Font Style', value: 'italic', options: [
                            { value: 'normal', label: 'Normal' }, { value: 'italic', label: 'Italic' }
                        ]}
                    ]
                },
                authorTypography: {
                    title: 'Author Typography',
                    description: 'Styling for the author text',
                    fields: [
                        { id: 'fontFamily', type: 'text', label: 'Font Family', value: 'inherit' },
                        { id: 'fontSize', type: 'text', label: 'Font Size', value: '16px' },
                        { id: 'fontWeight', type: 'select', label: 'Font Weight', value: 'bold', options: [
                            { value: 'normal', label: 'Normal' }, { value: 'bold', label: 'Bold' }, { value: '300', label: '300' }, { value: '400', label: '400' }, { value: '500', label: '500' }, { value: '600', label: '600' }, { value: '700', label: '700' }
                        ]},
                        { id: 'fontColor', type: 'text', label: 'Font Color', value: '#fff' },
                        { id: 'lineHeight', type: 'text', label: 'Line Height', value: '1.5' },
                        { id: 'letterSpacing', type: 'text', label: 'Letter Spacing', value: '0px' },
                        { id: 'textTransform', type: 'select', label: 'Text Transform', value: 'none', options: [
                            { value: 'none', label: 'None' }, { value: 'uppercase', label: 'Uppercase' }, { value: 'lowercase', label: 'Lowercase' }, { value: 'capitalize', label: 'Capitalize' }
                        ]},
                        { id: 'fontStyle', type: 'select', label: 'Font Style', value: 'normal', options: [
                            { value: 'normal', label: 'Normal' }, { value: 'italic', label: 'Italic' }
                        ]}
                    ]
                },
                boxStyle: {
                    title: 'Box Style',
                    description: 'Container border and shadow',
                    fields: [
                        { id: 'border', type: 'text', label: 'Border', value: 'none' },
                        { id: 'boxShadow', type: 'text', label: 'Box Shadow', value: 'none' }
                    ]
                },
                spacing: {
                    title: 'Spacing',
                    description: 'Margin for the quote box',
                    fields: [
                        { id: 'margin', type: 'text', label: 'Margin', value: '0px' }
                    ]
                }
            },
            advanced: {
                advancedOptions: {
                    title: 'Advanced',
                    description: 'Advanced options',
                    fields: []
                }
            }
        };
    }

    render({ element }) {
        if (!element?.data?.content?.quote) return <div>No quote content</div>;

        const contentFields = element.data.content.quote;
        const styleFields = element.data.style?.quoteStyle || [];
        const quoteTypographyFields = element.data.style?.quoteTypography || [];
        const authorTypographyFields = element.data.style?.authorTypography || [];
        const boxStyleFields = element.data.style?.boxStyle || [];
        const spacingFields = element.data.style?.spacing || [];

        const getFieldValue = (group, id, fallback = '') => {
            const field = group.fields.find(f => f.id === id);
            return field?.value ?? fallback;
        };

        const getTypographyStyle = (group) => ({
            fontFamily: getFieldValue(group, 'fontFamily'),
            fontSize: getFieldValue(group, 'fontSize'),
            fontWeight: getFieldValue(group, 'fontWeight'),
            lineHeight: getFieldValue(group, 'lineHeight'),
            letterSpacing: getFieldValue(group, 'letterSpacing'),
            textTransform: getFieldValue(group, 'textTransform'),
            fontStyle: getFieldValue(group, 'fontStyle'),
            color: getFieldValue(group, 'fontColor'),
        });

        const quoteText = getFieldValue(contentFields, 'text');
        const author = getFieldValue(contentFields, 'author');

        const alignment = getFieldValue(styleFields, 'alignment', 'center');
        const fontSize = getFieldValue(styleFields, 'fontSize', '20px');
        const fontColor = getFieldValue(styleFields, 'fontColor', '#fff');
        const background = getFieldValue(styleFields, 'background', '#000');
        const padding = getFieldValue(styleFields, 'padding', '24px');
        const borderRadius = getFieldValue(styleFields, 'borderRadius', '8px');

        const border = getFieldValue(boxStyleFields, 'border', 'none');
        const boxShadow = getFieldValue(boxStyleFields, 'boxShadow', 'none');
        const margin = getFieldValue(spacingFields, 'margin', '0px');

        return (
            <div
                style={{
                    background,
                    padding,
                    borderRadius,
                    color: fontColor,
                    textAlign: alignment,
                    fontSize,
                    fontStyle: 'italic',
                    border,
                    margin
                }}
            >
                <div style={{ marginBottom: '12px', ...getTypographyStyle(quoteTypographyFields) }}>{quoteText}</div>
                {author && (
                    <div style={{ fontWeight: 'bold', marginTop: '8px', ...getTypographyStyle(authorTypographyFields) }}>
                        — {author}
                    </div>
                )}
            </div>
        );
    }
}

export default BasicBlackQuota;
