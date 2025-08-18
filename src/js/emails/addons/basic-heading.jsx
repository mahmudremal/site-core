import { Heading as HeadingIcon } from 'lucide-react';
import BaseAddon from './base-addon';

class BasicHeading extends BaseAddon {
    constructor() {
        super();
    }

    get_id() {
        return 'basic-heading';
    }

    get_name() {
        return 'Heading';
    }

    get_icon() {
        return HeadingIcon;
    }

    get_category() {
        return 'basic';
    }

    get_description() {
        return 'Add a customizable heading/title';
    }

    get_settings() {
        return {
            content: {
                heading: {
                    title: 'Heading Content',
                    description: 'Set heading text and tag',
                    fields: [
                        {
                            id: 'text',
                            type: 'text',
                            label: 'Title',
                            description: 'Enter your heading text',
                            value: 'Heading Title'
                        },
                        {
                            id: 'tag',
                            type: 'select',
                            label: 'HTML Tag',
                            description: 'Choose heading tag',
                            value: 'h2',
                            options: [
                                { value: 'h1', label: 'H1' },
                                { value: 'h2', label: 'H2' },
                                { value: 'h3', label: 'H3' },
                                { value: 'h4', label: 'H4' },
                                { value: 'h5', label: 'H5' },
                                { value: 'h6', label: 'H6' },
                                { value: 'div', label: 'Div' },
                                { value: 'span', label: 'Span' },
                                { value: 'p', label: 'Paragraph' }
                            ]
                        },
                        {
                            id: 'alignment',
                            type: 'select',
                            label: 'Alignment',
                            description: 'Text alignment',
                            value: 'left',
                            options: [
                                { value: 'left', label: 'Left' },
                                { value: 'center', label: 'Center' },
                                { value: 'right', label: 'Right' },
                                { value: 'justify', label: 'Justify' }
                            ]
                        },
                        {
                            id: 'linkUrl',
                            type: 'url',
                            label: 'Link URL',
                            description: 'URL to link the heading to',
                            value: ''
                        },
                        {
                            id: 'linkTarget',
                            type: 'select',
                            label: 'Link Target',
                            description: 'How the link should open',
                            value: '_self',
                            options: [
                                { value: '_self', label: 'Same Window' },
                                { value: '_blank', label: 'New Window' },
                                { value: '_parent', label: 'Parent Frame' },
                                { value: '_top', label: 'Top Frame' }
                            ]
                        }
                    ]
                }
            },
            style: {
                headingStyle: {
                    title: 'Typography',
                    description: 'Style the heading text',
                    fields: [
                        {
                            id: 'color',
                            type: 'text',
                            label: 'Text Color',
                            value: '#222'
                        },
                        {
                            id: 'fontSize',
                            type: 'text',
                            label: 'Font Size',
                            value: '32px'
                        },
                        {
                            id: 'fontWeight',
                            type: 'select',
                            label: 'Font Weight',
                            value: '600',
                            options: [
                                { value: 'normal', label: 'Normal' },
                                { value: 'bold', label: 'Bold' },
                                { value: '100', label: '100' },
                                { value: '200', label: '200' },
                                { value: '300', label: '300' },
                                { value: '400', label: '400' },
                                { value: '500', label: '500' },
                                { value: '600', label: '600' },
                                { value: '700', label: '700' },
                                { value: '800', label: '800' },
                                { value: '900', label: '900' }
                            ]
                        },
                        {
                            id: 'lineHeight',
                            type: 'text',
                            label: 'Line Height',
                            value: '1.3'
                        },
                        {
                            id: 'letterSpacing',
                            type: 'text',
                            label: 'Letter Spacing',
                            value: '0px'
                        },
                        {
                            id: 'textTransform',
                            type: 'select',
                            label: 'Text Transform',
                            value: 'none',
                            options: [
                                { value: 'none', label: 'None' },
                                { value: 'uppercase', label: 'UPPERCASE' },
                                { value: 'lowercase', label: 'lowercase' },
                                { value: 'capitalize', label: 'Capitalize' }
                            ]
                        },
                        {
                            id: 'fontFamily',
                            type: 'text',
                            label: 'Font Family',
                            value: 'inherit'
                        },
                        {
                            id: 'fontStyle',
                            type: 'select',
                            label: 'Font Style',
                            value: 'normal',
                            options: [
                                { value: 'normal', label: 'Normal' },
                                { value: 'italic', label: 'Italic' }
                            ]
                        },
                        {
                            id: 'textDecoration',
                            type: 'select',
                            label: 'Text Decoration',
                            value: 'none',
                            options: [
                                { value: 'none', label: 'None' },
                                { value: 'underline', label: 'Underline' },
                                { value: 'overline', label: 'Overline' },
                                { value: 'line-through', label: 'Line Through' }
                            ]
                        },
                        {
                            id: 'textShadow',
                            type: 'text',
                            label: 'Text Shadow',
                            description: 'e.g., 2px 2px 4px #000000',
                            value: 'none'
                        }
                    ]
                }
            },
            advanced: {
                headingAdvanced: {
                    title: 'Advanced',
                    description: 'Advanced spacing and more',
                    fields: [
                        {
                            id: 'margin',
                            type: 'text',
                            label: 'Margin',
                            description: 'CSS margin',
                            value: '0 0 20px 0'
                        },
                        {
                            id: 'padding',
                            type: 'text',
                            label: 'Padding',
                            description: 'CSS padding',
                            value: '0'
                        }
                    ]
                }
            }
        };
    }

    render({ element }) {
        const content = element?.data?.content?.heading || [];
        const style = element?.data?.style?.headingStyle || [];
        const advanced = element?.data?.advanced?.headingAdvanced || [];

        const get = (group, id, fallback = '') => {
            const f = group.fields.find(f => f.id === id);
            return f?.value ?? fallback;
        };

        const text = get(content, 'text', 'Heading Title');
        const tag = get(content, 'tag', 'h2');
        const alignment = get(content, 'alignment', 'left');
        const linkUrl = get(content, 'linkUrl', '');
        const linkTarget = get(content, 'linkTarget', '_self');

        const color = get(style, 'color', '#222');
        const fontSize = get(style, 'fontSize', '32px');
        const fontWeight = get(style, 'fontWeight', '600');
        const lineHeight = get(style, 'lineHeight', '1.3');
        const letterSpacing = get(style, 'letterSpacing', '0px');
        const textTransform = get(style, 'textTransform', 'none');
        const fontFamily = get(style, 'fontFamily', 'inherit');
        const fontStyle = get(style, 'fontStyle', 'normal');
        const textDecoration = get(style, 'textDecoration', 'none');
        const textShadow = get(style, 'textShadow', 'none');

        const margin = get(advanced, 'margin', '0 0 20px 0');
        const padding = get(advanced, 'padding', '0');

        const Tag = tag || 'h2';

        const styleObj = {
            color,
            fontSize,
            fontWeight,
            lineHeight,
            letterSpacing,
            textTransform,
            textAlign: alignment,
            margin,
            padding,
            fontFamily,
            fontStyle,
            textDecoration,
            textShadow: 'none'
        };

        const HeadingContent = <Tag style={styleObj}>{text}</Tag>;

        if (linkUrl) {
            return (
                <a href={linkUrl} target={linkTarget} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {HeadingContent}
                </a>
            );
        }

        return HeadingContent;
    }
}

export default BasicHeading;
