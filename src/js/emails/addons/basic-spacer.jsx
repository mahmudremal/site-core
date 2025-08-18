import { Minus } from 'lucide-react';
import BaseAddon from './base-addon';

class BasicSpacer extends BaseAddon {
    constructor() {
        super();
    }
    
    get_id() {
        return 'spacer';
    }

    get_name() {
        return 'Spacer';
    }

    get_icon() {
        return Minus;
    }

    get_category() {
        return 'basic';
    }

    get_description() {
        return 'Add vertical space or a horizontal line';
    }

    get_settings() {
        return {
            layout: {
                spacer: {
                    title: 'Spacer Settings',
                    description: 'Configure spacer appearance',
                    fields: [
                        {
                            id: 'height',
                            type: 'text',
                            label: 'Height',
                            description: 'Set vertical space height (e.g. 20px, 2rem)',
                            value: '40px'
                        },
                        {
                            id: 'showLine',
                            type: 'checkbox',
                            label: 'Show Horizontal Line',
                            description: 'Display a horizontal rule',
                            value: false
                        },
                        {
                            id: 'lineColor',
                            type: 'text',
                            label: 'Line Color',
                            description: 'Color of the horizontal line',
                            value: '#ccc'
                        },
                        {
                            id: 'lineThickness',
                            type: 'text',
                            label: 'Line Thickness',
                            description: 'Thickness of the horizontal line (e.g. 1px)',
                            value: '1px'
                        }
                    ]
                }
            }
        };
    }

    render({ element }) {
        if (!element?.data?.layout?.spacer) {
            return <div />;
        }

        const spacerFields = element.data.layout.spacer;

        const getFieldValue = (id, defaultValue = '') => {
            const field = spacerFields.find(block => block.id === id);
            return field?.value ?? defaultValue;
        };

        const height = getFieldValue('height', '40px');
        const showLine = getFieldValue('showLine') === true || getFieldValue('showLine') === 'true';
        const lineColor = getFieldValue('lineColor', '#ccc');
        const lineThickness = getFieldValue('lineThickness', '1px');

        if (showLine) {
            return (
                <hr
                    style={{
                        height: lineThickness,
                        backgroundColor: lineColor,
                        border: 'none',
                        margin: 0,
                        marginTop: height,
                        marginBottom: height,
                        width: '100%',
                    }}
                />
            );
        }

        return (
            <div style={{ height }} />
        );
    }
}

export default BasicSpacer;
