import { MousePointer } from 'lucide-react';
import BaseAddon from './base-addon';

class BasicButton extends BaseAddon {
    constructor() {
        super();
    }
    
    get_id() {
        return 'basic-button';
    }
    
    get_name() {
        return 'Basic Button';
    }
    
    get_icon() {
        return MousePointer;
    }
    
    get_category() {
        return 'interactive';
    }
    
    get_description() {
        return 'Add interactive buttons with customizable styling and actions';
    }
    
    get_settings() {
        return {
            content: {
                buttonContent: {
                    title: 'Button Content',
                    description: 'Configure your button text and behavior',
                    fields: [
                        {
                            id: 'text',
                            type: 'text',
                            label: 'Button Text',
                            description: 'Text displayed on the button',
                            value: 'Click Me',
                            required: true
                        },
                        {
                            id: 'title',
                            type: 'text',
                            label: 'Tooltip Text',
                            description: 'Text shown on hover',
                            value: ''
                        }
                    ]
                },
                buttonAction: {
                    title: 'Button Action',
                    description: "Configure the button's action",
                    fields: [
                        {
                            id: 'url',
                            type: 'text',
                            label: 'URL',
                            description: 'Enter the URL for the button to link to',
                            value: ''
                        },
                        {
                            id: 'linkTarget',
                            type: 'select',
                            label: 'Target',
                            description: 'Choose where to open the link',
                            value: '_self',
                            options: [
                                { value: '_self', label: 'Same Tab' },
                                { value: '_blank', label: 'New Tab' }
                            ]
                        }
                    ]
                }
            },
            style: {
                buttonStyle: {
                    title: 'Button Styling',
                    description: 'Customize the visual appearance of your button',
                    fields: [
                        {
                            id: 'variant',
                            type: 'select',
                            label: 'Button Variant',
                            description: 'Choose a predefined button style',
                            value: 'primary',
                            options: [
                                { value: 'primary', label: 'Primary' },
                                { value: 'secondary', label: 'Secondary' },
                                { value: 'success', label: 'Success' },
                                { value: 'danger', label: 'Danger' },
                                { value: 'warning', label: 'Warning' },
                                { value: 'info', label: 'Info' },
                                { value: 'light', label: 'Light' },
                                { value: 'dark', label: 'Dark' },
                                { value: 'outline', label: 'Outline' },
                                { value: 'ghost', label: 'Ghost' },
                                { value: 'custom', label: 'Custom' }
                            ]
                        },
                        {
                            id: 'size',
                            type: 'select',
                            label: 'Button Size',
                            description: 'Size of the button',
                            value: 'medium',
                            options: [
                                { value: 'small', label: 'Small' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'large', label: 'Large' },
                                { value: 'xl', label: 'Extra Large' }
                            ]
                        },
                        {
                            id: 'fullWidth',
                            type: 'checkbox',
                            label: 'Full Width',
                            description: 'Make button span full container width',
                            value: false
                        },
                        {
                            id: 'alignment',
                            type: 'select',
                            label: 'Button Alignment',
                            description: 'Align the button within its container',
                            value: 'left',
                            options: [
                                { value: 'left', label: 'Left' },
                                { value: 'center', label: 'Center' },
                                { value: 'right', label: 'Right' }
                            ]
                        }
                    ]
                },
                customStyle: {
                    title: 'Custom Styling',
                    description: 'Advanced styling options for custom appearance',
                    fields: [
                        {
                            id: 'backgroundColor',
                            type: 'color',
                            label: 'Background Color',
                            description: 'Button background color',
                            value: '#007bff'
                        },
                        {
                            id: 'textColor',
                            type: 'color',
                            label: 'Text Color',
                            description: 'Button text color',
                            value: '#ffffff'
                        },
                        {
                            id: 'borderColor',
                            type: 'color',
                            label: 'Border Color',
                            description: 'Button border color',
                            value: '#007bff'
                        },
                        {
                            id: 'borderRadius',
                            type: 'select',
                            label: 'Border Radius',
                            description: 'Corner roundness of the button',
                            value: 'medium',
                            options: [
                                { value: 'none', label: 'None (0px)' },
                                { value: 'small', label: 'Small (4px)' },
                                { value: 'medium', label: 'Medium (6px)' },
                                { value: 'large', label: 'Large (12px)' },
                                { value: 'xl', label: 'Extra Large (16px)' },
                                { value: 'full', label: 'Full (50px)' },
                                { value: 'custom', label: 'Custom' }
                            ]
                        },
                        {
                            id: 'customBorderRadius',
                            type: 'text',
                            label: 'Custom Border Radius',
                            description: 'Enter custom border radius (e.g., 8px)',
                            value: ''
                        },
                        {
                            id: 'fontWeight',
                            type: 'select',
                            label: 'Font Weight',
                            description: 'Text weight of the button',
                            value: 'medium',
                            options: [
                                { value: 'light', label: 'Light (300)' },
                                { value: 'normal', label: 'Normal (400)' },
                                { value: 'medium', label: 'Medium (500)' },
                                { value: 'semibold', label: 'Semibold (600)' },
                                { value: 'bold', label: 'Bold (700)' }
                            ]
                        }
                    ]
                }
            }
        };
    }
    
    render({ element }) {
        if (!element?.data?.content) {
            return (
                <div style={{
                    color: '#999',
                    padding: '20px',
                    textAlign: 'center',
                    borderRadius: '8px',
                    border: '2px dashed #ddd',
                    backgroundColor: '#f9f9f9'
                }}>
                    <MousePointer size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                    <p>Click to configure button</p>
                </div>
            );
        }

        const getFieldValue = (tabKey, section, id, defaultValue = '') => {
            const sectionData = element.data?.[tabKey]?.[section] || [];
            if (!sectionData?.fields?.length) return defaultValue;
            const field = sectionData?.fields.find(block => block.id === id);
            return field?.value ?? defaultValue;
        };

        const text = getFieldValue('content', 'buttonContent', 'text', '');
        const title = getFieldValue('content', 'buttonContent', 'title');
        const url = getFieldValue('content', 'buttonContent', 'url', '');
        const linkTarget = getFieldValue('content', 'buttonContent', 'linkTarget');

        const variant = getFieldValue('style', 'buttonStyle', 'variant', 'primary');
        const size = getFieldValue('style', 'buttonStyle', 'size', 'medium');
        const fullWidth = getFieldValue('style', 'buttonStyle', 'fullWidth') === true;
        const alignment = getFieldValue('style', 'buttonStyle', 'alignment', 'left');
        
        const backgroundColor = getFieldValue('style', 'customStyle', 'backgroundColor', '#007bff');
        const textColor = getFieldValue('style', 'customStyle', 'textColor', '#ffffff');
        const borderColor = getFieldValue('style', 'customStyle', 'borderColor', '#007bff');
        const borderRadius = getFieldValue('style', 'customStyle', 'borderRadius', 'medium');
        const customBorderRadius = getFieldValue('style', 'customStyle', 'customBorderRadius');
        const fontWeight = getFieldValue('style', 'customStyle', 'fontWeight', 'medium');

        const variantStyles = {
            primary: { backgroundColor: '#007bff', color: '#ffffff', borderColor: '#007bff' },
            secondary: { backgroundColor: '#6c757d', color: '#ffffff', borderColor: '#6c757d' },
            success: { backgroundColor: '#28a745', color: '#ffffff', borderColor: '#28a745' },
            danger: { backgroundColor: '#dc3545', color: '#ffffff', borderColor: '#dc3545' },
            warning: { backgroundColor: '#ffc107', color: '#212529', borderColor: '#ffc107' },
            info: { backgroundColor: '#17a2b8', color: '#ffffff', borderColor: '#17a2b8' },
            light: { backgroundColor: '#f8f9fa', color: '#212529', borderColor: '#f8f9fa' },
            dark: { backgroundColor: '#343a40', color: '#ffffff', borderColor: '#343a40' },
            outline: { backgroundColor: 'transparent', color: '#007bff', borderColor: '#007bff' },
            ghost: { backgroundColor: 'transparent', color: '#007bff', borderColor: 'transparent' },
            custom: { backgroundColor, color: textColor, borderColor }
        };

        const sizeStyles = {
            small: { padding: '6px 12px', fontSize: '14px' },
            medium: { padding: '8px 16px', fontSize: '16px' },
            large: { padding: '12px 24px', fontSize: '18px' },
            xl: { padding: '16px 32px', fontSize: '20px' }
        };

        const borderRadiusValues = {
            none: '0px',
            small: '4px',
            medium: '6px',
            large: '12px',
            xl: '16px',
            full: '50px',
            custom: customBorderRadius || '6px'
        };

        const fontWeightValues = {
            light: '300',
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700'
        };

        const buttonStyles = {
            ...variantStyles[variant],
            ...sizeStyles[size],
            border: `1px solid ${variantStyles[variant].borderColor}`,
            borderRadius: borderRadiusValues[borderRadius],
            fontWeight: fontWeightValues[fontWeight],
            cursor: 'default',
            textDecoration: 'none',
            display: 'inline-block',
            textAlign: 'center',
            verticalAlign: 'middle',
            userSelect: 'none',
            fontFamily: 'inherit',
            lineHeight: '1.5',
            opacity: 1,
            width: fullWidth ? '100%' : 'auto'
        };

        const containerStyles = {
            textAlign: fullWidth ? 'initial' : alignment,
            display: fullWidth ? 'block' : 'inline-block',
            width: fullWidth ? '100%' : 'auto'
        };

        const LinkBtn = ({ children }) => {
            if (!url) {
                return (
                    <button
                        type="button"
                        title={title}
                        style={buttonStyles}
                        className="basic-button"
                    >
                        {children}
                    </button>
                )
            }
            return (
                <a
                    href={url}
                    type="button"
                    title={title}
                    target={linkTarget}
                    style={buttonStyles}
                    className="basic-button"
                >
                    {children}
                </a>
            )
        }
        
        return (
            <div style={containerStyles} className="basic-button-container">
                <LinkBtn>
                    {text}
                </LinkBtn>
            </div>
        );
    }
}

export default BasicButton;
