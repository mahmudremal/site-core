import { Type } from 'lucide-react';
import { Fragment } from 'react/jsx-runtime';
import BaseAddon from './base-addon';

class BasicTextEditor extends BaseAddon {
    constructor() {
        super();
    }
    get_id() {
        return 'text-editor';
    }
    get_name() {
        return 'Text Editor';
    }
    get_icon() {
        return Type;
    }
    get_category() {
        return 'basic';
    }
    get_description() {
        return 'Add and edit text content';
    }
    get_settings() {
        return {
            content: {
                textcontent: {
                    title: 'Text Content',
                    description: 'White your textcontent here',
                    fields: [
                        {
                            id: 'text',
                            type: 'textarea',
                            label: 'Content',
                            description: 'White your textcontent here',
                            value: ''
                        },
                        {
                            id: 'dropcap',
                            type: 'checkbox',
                            label: 'Drop Cap',
                            description: 'Enable dropcap',
                            value: ''
                        },
                        {
                            id: 'columns',
                            type: 'select',
                            label: 'Columns',
                            description: 'Select Columns',
                            value: '',
                            options: [
                                {value: '', label: 'Default'},
                                ...[...[...Array(10)].keys().map(index => ({value: index + 1, label: index + 1}))]
                            ]
                        },
                        {
                            id: 'columns-gap',
                            type: 'text',
                            label: 'Columns Gap',
                            description: 'Set Columns Gap',
                            value: ''
                        },
                    ]
                },
            },
            style: {
                typography: {
                    title: 'Typography',
                    description: 'Font and text styling',
                    fields: [
                        { id: 'fontFamily', type: 'text', label: 'Font Family', value: 'inherit' },
                        { id: 'fontSize', type: 'text', label: 'Font Size', value: '16px' },
                        { id: 'fontWeight', type: 'select', label: 'Font Weight', value: 'normal', options: [
                            { value: 'normal', label: 'Normal' }, { value: 'bold', label: 'Bold' }, { value: '300', label: '300' }, { value: '400', label: '400' }, { value: '500', label: '500' }, { value: '600', label: '600' }, { value: '700', label: '700' }
                        ]},
                        { id: 'lineHeight', type: 'text', label: 'Line Height', value: '1.5' },
                        { id: 'letterSpacing', type: 'text', label: 'Letter Spacing', value: '0px' },
                        { id: 'textTransform', type: 'select', label: 'Text Transform', value: 'none', options: [
                            { value: 'none', label: 'None' }, { value: 'uppercase', label: 'Uppercase' }, { value: 'lowercase', label: 'Lowercase' }, { value: 'capitalize', label: 'Capitalize' }
                        ]},
                        { id: 'textDecoration', type: 'select', label: 'Text Decoration', value: 'none', options: [
                            { value: 'none', label: 'None' }, { value: 'underline', label: 'Underline' }, { value: 'overline', label: 'Overline' }, { value: 'line-through', label: 'Line Through' }
                        ]},
                        { id: 'fontStyle', type: 'select', label: 'Font Style', value: 'normal', options: [
                            { value: 'normal', label: 'Normal' }, { value: 'italic', label: 'Italic' }
                        ]}
                    ]
                },
                colors: {
                    title: 'Colors',
                    description: 'Text and background colors',
                    fields: [
                        { id: 'textColor', type: 'text', label: 'Text Color', value: '#333' },
                        { id: 'backgroundColor', type: 'text', label: 'Background Color', value: 'transparent' }
                    ]
                },
                spacing: {
                    title: 'Spacing',
                    description: 'Padding and margin',
                    fields: [
                        { id: 'padding', type: 'text', label: 'Padding', value: '0px' },
                        { id: 'margin', type: 'text', label: 'Margin', value: '0px' }
                    ]
                },
                border: {
                    title: 'Border & Shadow',
                    description: 'Border, radius, and shadow',
                    fields: [
                        { id: 'border', type: 'text', label: 'Border', value: 'none' },
                        { id: 'borderRadius', type: 'text', label: 'Border Radius', value: '0px' },
                        { id: 'boxShadow', type: 'text', label: 'Box Shadow', value: 'none' }
                    ]
                },
                alignment: {
                    title: 'Alignment',
                    description: 'Text alignment',
                    fields: [
                        { id: 'textAlign', type: 'select', label: 'Text Alignment', value: 'left', options: [
                            { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }, { value: 'justify', label: 'Justify' }
                        ]}
                    ]
                }
            },
            advanced: {
                attributes: {
                    title: 'Attributes',
                    description: 'Custom ID and Class',
                    fields: [
                        { id: 'customId', type: 'text', label: 'Custom ID', value: '' },
                        { id: 'customClass', type: 'text', label: 'Custom Class', value: '' }
                    ]
                }
            }
        };
    }
    render({ element }) {
        if (!element?.data?.content?.textcontent) {
            return <div>No content available</div>;
        }

        const getFieldValue = (tabKey, section, id, defaultValue = '') => {
            const sectionData = element.data?.[tabKey]?.[section] || [];
            if (!sectionData?.fields?.length) return defaultValue;
            const field = sectionData?.fields.find(block => block.id === id);
            return field?.value ?? defaultValue;
        };

        const textContentFields = element.data.content.textcontent;
        const typographyFields = element.data.style?.typography || [];
        const colorsFields = element.data.style?.colors || [];
        const spacingFields = element.data.style?.spacing || [];
        const borderFields = element.data.style?.border || [];
        const alignmentFields = element.data.style?.alignment || [];
        const attributesFields = element.data.advanced?.attributes || [];

        // Get all content field values
        const text = getFieldValue('content', 'textcontent', 'text');
        const dropcap = getFieldValue('content', 'textcontent', 'dropcap') === true || getFieldValue('content', 'textcontent', 'dropcap') === 'true';
        const columns = getFieldValue('content', 'textcontent', 'columns');
        const columnsGap = getFieldValue('content', 'textcontent', 'columns-gap');

        // Get all style field values
        const fontFamily = getFieldValue('style', 'typography', 'fontFamily', 'inherit');
        const fontSize = getFieldValue('style', 'typography', 'fontSize', '16px');
        const fontWeight = getFieldValue('style', 'typography', 'fontWeight', 'normal');
        const lineHeight = getFieldValue('style', 'typography', 'lineHeight', '1.5');
        const letterSpacing = getFieldValue('style', 'typography', 'letterSpacing', '0px');
        const textTransform = getFieldValue('style', 'typography', 'textTransform', 'none');
        const textDecoration = getFieldValue('style', 'typography', 'textDecoration', 'none');
        const fontStyle = getFieldValue('style', 'typography', 'fontStyle', 'normal');

        const textColor = getFieldValue('style', 'colors', 'textColor', '#333');
        const backgroundColor = getFieldValue('style', 'colors', 'backgroundColor', 'transparent');

        const padding = getFieldValue('style', 'spacing', 'padding', '0px');
        const margin = getFieldValue('style', 'spacing', 'margin', '0px');

        const border = getFieldValue('style', 'border', 'border', 'none');
        const borderRadius = getFieldValue('style', 'border', 'borderRadius', '0px');
        const boxShadow = getFieldValue('style', 'border', 'boxShadow', 'none');

        const textAlign = getFieldValue('style', 'alignment', 'textAlign', 'left');

        // Get advanced field values
        const customId = getFieldValue('advanced', 'attributes', 'customId', '');
        const customClass = getFieldValue('advanced', 'attributes', 'customClass', '');

        // Build dynamic styles
        const containerStyles = {
            fontFamily,
            fontSize,
            fontWeight,
            lineHeight,
            letterSpacing,
            textTransform,
            textDecoration,
            fontStyle,
            color: textColor,
            backgroundColor,
            padding,
            margin,
            border,
            borderRadius,
            boxShadow,
            textAlign,
        };
        
        // Apply column styles if specified
        if (columns && columns !== '' && columns !== 'Default') {
            containerStyles.columnCount = parseInt(columns);
            containerStyles.columnFill = 'balance';
            
            // Apply column gap if specified
            if (columnsGap && columnsGap.trim() !== '') {
                // Handle different units (px, rem, em, etc.)
                const gap = columnsGap.includes('px') || columnsGap.includes('rem') || 
                        columnsGap.includes('em') || columnsGap.includes('%') 
                        ? columnsGap 
                        : `${columnsGap}px`;
                containerStyles.columnGap = gap;
            }
        }

        // If no text content, show placeholder
        if (!text || text.trim() === '') {
            return (
                <div style={{ 
                    padding: '20px', 
                    color: '#999', 
                    fontStyle: 'italic',
                    border: '2px dashed #ddd',
                    borderRadius: '4px',
                    textAlign: 'center'
                }}>
                    Click to add text content
                </div>
            );
        }

        // Create the main content element
        const ContentElement = ({ children }) => {
            if (dropcap) {
                return (
                    <div 
                        style={containerStyles}
                        className={`text-content drop-cap ${customClass}`}
                        id={customId}
                    >
                        <style jsx="true">{`
                            .drop-cap::first-letter {
                                float: left;
                                color: #333;
                                line-height: 1;
                                font-size: 3.5em;
                                margin-top: 0.1em;
                                font-weight: bold;
                                margin-right: 0.1em;
                            }
                        `}</style>
                        {children}
                    </div>
                );
            }
            
            return (
                <div 
                    style={containerStyles}
                    className={`text-content ${customClass}`}
                    id={customId}
                >
                    {children}
                </div>
            );
        };

        // Process text content - handle line breaks and basic formatting
        const processText = (text) => {
            return text.split('\n').map((line, index) => (
                <Fragment key={index}>
                    {line}
                    {index < text.split('\n').length - 1 && <br />}
                </Fragment>
            ));
        };

        return (
            <ContentElement>
                {processText(text)}
            </ContentElement>
        );
    }
}

export default BasicTextEditor;
