import { DollarSign, Check, X } from 'lucide-react';
import BaseAddon from './base-addon';

class BasicPricingTable extends BaseAddon {
    constructor() {
        super();
    }

    get_id() {
        return 'basic-pricing-table';
    }

    get_name() {
        return 'Pricing Table';
    }

    get_icon() {
        return DollarSign;
    }

    get_category() {
        return 'basic';
    }

    get_description() {
        return 'Display a pricing plan with features and action button';
    }

    get_settings() {
        return {
            content: {
                pricing: {
                    title: 'Pricing Content',
                    description: 'Set plan details and features',
                    fields: [
                        {
                            id: 'title',
                            type: 'text',
                            label: 'Plan Title',
                            value: 'Basic Plan'
                        },
                        {
                            id: 'price',
                            type: 'text',
                            label: 'Price',
                            value: '$19/mo'
                        },
                        {
                            id: 'features',
                            type: 'repeater',
                            label: 'Features',
                            value: [
                                { text: '1 Website', available: true },
                                { text: '5GB Storage', available: true },
                                { text: 'Email Support', available: false }
                            ],
                            fields: [
                                {
                                    id: 'text',
                                    type: 'text',
                                    label: 'Feature',
                                    value: ''
                                },
                                {
                                    id: 'available',
                                    type: 'checkbox',
                                    label: 'Available',
                                    value: true
                                }
                            ]
                        },
                        {
                            id: 'buttonText',
                            type: 'text',
                            label: 'Button Text',
                            value: 'Get Started'
                        },
                        {
                            id: 'buttonUrl',
                            type: 'text',
                            label: 'Button URL',
                            value: '#'
                        }
                    ]
                }
            },
            style: {
                tableStyle: {
                    title: 'Table Style',
                    description: 'Customize pricing table appearance',
                    fields: [
                        {
                            id: 'borderRadius',
                            type: 'text',
                            label: 'Border Radius',
                            value: '8px'
                        },
                        {
                            id: 'background',
                            type: 'text',
                            label: 'Background Color',
                            value: '#ffffff'
                        },
                        {
                            id: 'textAlign',
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
                            id: 'primaryColor',
                            type: 'text',
                            label: 'Primary Color',
                            value: '#4f46e5'
                        }
                    ]
                },
                titleTypography: {
                    title: 'Title Typography',
                    description: 'Styling for the plan title',
                    fields: [
                        { id: 'fontFamily', type: 'text', label: 'Font Family', value: 'inherit' },
                        { id: 'fontSize', type: 'text', label: 'Font Size', value: '24px' },
                        { id: 'fontWeight', type: 'select', label: 'Font Weight', value: 'bold', options: [
                            { value: 'normal', label: 'Normal' }, { value: 'bold', label: 'Bold' }, { value: '300', label: '300' }, { value: '400', label: '400' }, { value: '500', label: '500' }, { value: '600', label: '600' }, { value: '700', label: '700' }
                        ]},
                        { id: 'color', type: 'text', label: 'Text Color', value: '#333' },
                        { id: 'lineHeight', type: 'text', label: 'Line Height', value: '1.2' },
                        { id: 'marginBottom', type: 'text', label: 'Margin Bottom', value: '12px' }
                    ]
                },
                priceTypography: {
                    title: 'Price Typography',
                    description: 'Styling for the price text',
                    fields: [
                        { id: 'fontFamily', type: 'text', label: 'Font Family', value: 'inherit' },
                        { id: 'fontSize', type: 'text', label: 'Font Size', value: '28px' },
                        { id: 'fontWeight', type: 'select', label: 'Font Weight', value: 'bold', options: [
                            { value: 'normal', label: 'Normal' }, { value: 'bold', label: 'Bold' }, { value: '300', label: '300' }, { value: '400', label: '400' }, { value: '500', label: '500' }, { value: '600', label: '600' }, { value: '700', label: '700' }
                        ]},
                        { id: 'color', type: 'text', label: 'Text Color', value: '#333' },
                        { id: 'marginBottom', type: 'text', label: 'Margin Bottom', value: '16px' }
                    ]
                },
                featuresTypography: {
                    title: 'Features Typography',
                    description: 'Styling for the features list',
                    fields: [
                        { id: 'fontFamily', type: 'text', label: 'Font Family', value: 'inherit' },
                        { id: 'fontSize', type: 'text', label: 'Font Size', value: '16px' },
                        { id: 'fontWeight', type: 'select', label: 'Font Weight', value: 'normal', options: [
                            { value: 'normal', label: 'Normal' }, { value: 'bold', label: 'Bold' }, { value: '300', label: '300' }, { value: '400', label: '400' }, { value: '500', label: '500' }, { value: '600', label: '600' }, { value: '700', label: '700' }
                        ]},
                        { id: 'color', type: 'text', label: 'Text Color', value: '#333' },
                        { id: 'lineHeight', type: 'text', label: 'Line Height', value: '1.5' }
                    ]
                },
                buttonStyle: {
                    title: 'Button Style',
                    description: 'Customize the action button',
                    fields: [
                        { id: 'padding', type: 'text', label: 'Padding', value: '10px 20px' },
                        { id: 'background', type: 'text', label: 'Background Color', value: '#4f46e5' },
                        { id: 'color', type: 'text', label: 'Text Color', value: '#fff' },
                        { id: 'borderRadius', type: 'text', label: 'Border Radius', value: '4px' },
                        { id: 'fontWeight', type: 'select', label: 'Font Weight', value: 'bold', options: [
                            { value: 'normal', label: 'Normal' }, { value: 'bold', label: 'Bold' }, { value: '300', label: '300' }, { value: '400', label: '400' }, { value: '500', label: '500' }, { value: '600', label: '600' }, { value: '700', label: '700' }
                        ]}
                    ]
                },
                spacing: {
                    title: 'Spacing',
                    description: 'Margin for the pricing table',
                    fields: [
                        { id: 'margin', type: 'text', label: 'Margin', value: '0px' }
                    ]
                }
            },
            advanced: {
                tableAdvanced: {
                    title: 'Advanced Options',
                    description: 'Additional behavior options',
                    fields: [
                        {
                            id: 'highlight',
                            type: 'checkbox',
                            label: 'Highlight Plan',
                            value: false
                        },
                        {
                            id: 'highlightLabel',
                            type: 'text',
                            label: 'Highlight Label',
                            value: 'Popular'
                        }
                    ]
                }
            }
        };
    }

    render({ element }) {
        if (!element?.data?.content?.pricing) return <div>No pricing data</div>;
        
        const fields = element.data.content.pricing;
        const styleFields = element.data.style?.tableStyle || [];
        const titleTypographyFields = element.data.style?.titleTypography || [];
        const priceTypographyFields = element.data.style?.priceTypography || [];
        const featuresTypographyFields = element.data.style?.featuresTypography || [];
        const buttonStyleFields = element.data.style?.buttonStyle || [];
        const spacingFields = element.data.style?.spacing || [];
        const advancedFields = element.data.advanced?.tableAdvanced || [];

        const getFieldValue = (tabKey, section, id, defaultValue = '') => {
            const sectionData = element.data?.[tabKey]?.[section] || [];
            if (!sectionData?.fields?.length) return defaultValue;
            const field = sectionData?.fields.find(block => block.id === id);
            return field?.value ?? defaultValue;
        };

        const get = (group, id, fallback = '') => {
            const f = group.fields.find(f => f.id === id);
            return f?.value ?? fallback;
        };

        const getBool = (group, id, fallback = false) => {
            const f = group.fields.find(f => f.id === id);
            return f?.value === true || f?.value === 'true';
        };

        const getTypographyStyle = (section) => ({
            fontFamily: getFieldValue('style', section, 'fontFamily'),
            fontSize: getFieldValue('style', section, 'fontSize'),
            fontWeight: getFieldValue('style', section, 'fontWeight'),
            color: getFieldValue('style', section, 'color'),
            lineHeight: getFieldValue('style', section, 'lineHeight'),
            marginBottom: getFieldValue('style', section, 'marginBottom'),
        });

        const title = getFieldValue('content', 'pricing', 'title', 'Basic Plan');
        const price = getFieldValue('content', 'pricing', 'price', '$0');
        const featuresField = getFieldValue('content', 'pricing', 'features', {});
        const features = Array.isArray(featuresField?.value) ? featuresField.value : [];
        const buttonText = getFieldValue('content', 'pricing', 'buttonText', 'Get Started');
        const buttonUrl = getFieldValue('content', 'pricing', 'buttonUrl', '#');

        const borderRadius = getFieldValue('style', 'tableStyle', 'borderRadius', '8px');
        const background = getFieldValue('style', 'tableStyle', 'background', '#ffffff');
        const textAlign = getFieldValue('style', 'tableStyle', 'textAlign', 'center');
        const primaryColor = getFieldValue('style', 'tableStyle', 'primaryColor', '#4f46e5');

        const margin = getFieldValue('style', 'spacing', 'margin', '0px');

        const highlight = getFieldValue('advanced', 'tableAdvanced', 'highlight');
        const highlightLabel = getFieldValue('advanced', 'tableAdvanced', 'highlightLabel', 'Popular');

        const buttonStyles = {
            display: 'inline-block',
            padding: getFieldValue('style', 'buttonStyle', 'padding', '10px 20px'),
            background: getFieldValue('style', 'buttonStyle', 'background', primaryColor),
            color: getFieldValue('style', 'buttonStyle', 'color', '#fff'),
            borderRadius: getFieldValue('style', 'buttonStyle', 'borderRadius', '4px'),
            textDecoration: getFieldValue('style', 'buttonStyle', 'textDecoration', 'none'),
            fontWeight: getFieldValue('style', 'buttonStyle', 'fontWeight', 'bold'),
        };

        return (
            <div
                style={{
                    borderRadius,
                    background,
                    padding: '24px',
                    textAlign,
                    margin
                }}
                className={`pricing-table ${highlight ? 'highlighted' : ''}`}
            >
                {highlight && (
                    <div
                        style={{
                            background: primaryColor,
                            color: '#fff',
                            padding: '4px 40px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                    >
                        {highlightLabel}
                    </div>
                )}
                <h3 style={getTypographyStyle('titleTypography')}>{title}</h3>
                <div style={getTypographyStyle('priceTypography')}>{price}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '24px' }}>
                    {features.map((f, i) => {
                        const available = f.available === true || f.available === 'true';
                        return (
                            <li
                                key={i}
                                style={{
                                    gap: '6px',
                                    display: 'flex',
                                    marginBottom: '8px',
                                    alignItems: 'center',
                                    justifyContent: textAlign,
                                    color: available ? getFieldValue('style', 'featuresTypography', 'color', '#333') : '#999',
                                    ...getTypographyStyle('featuresTypography')
                                }}
                            >
                                {available ? <Check size={16} color={primaryColor} /> : <X size={16} color="#ccc" />}
                                <span>{f.text}</span>
                            </li>
                        );
                    })}
                </ul>
                <a
                    href={buttonUrl}
                    style={buttonStyles}
                >
                    {buttonText}
                </a>
            </div>
        );
    }
}

export default BasicPricingTable;
