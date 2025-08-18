import { Slash, Circle, Star, Heart } from 'lucide-react';
import { Fragment } from 'react/jsx-runtime';
import BaseAddon from './base-addon';

class BasicDivider extends BaseAddon {
    constructor() {
        super();
    }

    get_id() {
        return 'divider';
    }

    get_name() {
        return 'Divider';
    }

    get_icon() {
        return Slash;
    }

    get_category() {
        return 'basic';
    }

    get_description() {
        return 'Stylized divider with multiple styles and alignment options';
    }

    get_settings() {
        return {
            content: {
                devider: {
                    title: 'Divider Settings',
                    description: 'Configure divider appearance',
                    fields: [
                        {
                            id: 'style',
                            type: 'select',
                            label: 'Style',
                            description: 'Divider style type',
                            value: 'solid',
                            options: [
                                { value: 'solid', label: 'Solid' },
                                { value: 'dashed', label: 'Dashed' },
                                { value: 'dotted', label: 'Dotted' },
                                { value: 'double', label: 'Double' },
                                { value: 'gradient', label: 'Gradient' }
                            ]
                        },
                        {
                            id: 'weight',
                            type: 'text',
                            label: 'Thickness',
                            description: 'Line thickness (e.g. 2px)',
                            value: '1px'
                        },
                        {
                            id: 'color',
                            type: 'text',
                            label: 'Color',
                            description: 'Line color (used unless gradient)',
                            value: '#e0e0e0'
                        },
                        {
                            id: 'gradientStart',
                            type: 'text',
                            label: 'Gradient Start',
                            description: 'Start color for gradient',
                            value: '#6a11cb'
                        },
                        {
                            id: 'gradientEnd',
                            type: 'text',
                            label: 'Gradient End',
                            description: 'End color for gradient',
                            value: '#2575fc'
                        },
                        {
                            id: 'width',
                            type: 'text',
                            label: 'Width',
                            description: 'Divider width (%, px, etc.)',
                            value: '100%'
                        },
                        {
                            id: 'alignment',
                            type: 'select',
                            label: 'Alignment',
                            description: 'Left / Center / Right',
                            value: 'center',
                            options: [
                                { value: 'left', label: 'Left' },
                                { value: 'center', label: 'Center' },
                                { value: 'right', label: 'Right' }
                            ]
                        },
                        {
                            id: 'showIcon',
                            type: 'checkbox',
                            label: 'Center Icon',
                            description: 'Place icon in middle of divider',
                            value: false
                        },
                        {
                            id: 'iconType',
                            type: 'select',
                            label: 'Icon Type',
                            description: 'Icon shown at center',
                            value: 'circle',
                            options: [
                                { value: 'circle', label: 'Circle' },
                                { value: 'star', label: 'Star' },
                                { value: 'heart', label: 'Heart' }
                            ]
                        },
                        {
                            id: 'spacingTop',
                            type: 'text',
                            label: 'Spacing Top',
                            description: 'Margin top (e.g. 20px)',
                            value: '16px'
                        },
                        {
                            id: 'spacingBottom',
                            type: 'text',
                            label: 'Spacing Bottom',
                            description: 'Margin bottom (e.g. 16px)',
                            value: '16px'
                        }
                    ]
                }
            }
        };
    }

    render({ element }) {
        if (!element?.data?.content?.devider) {
            return <div />;
        }

        const fields = element.data.content.devider?.fields??[];

        const get = (id, defaultValue = '') => {
            const f = fields.find(f => f.id === id);
            return f?.value ?? defaultValue;
        };

        const style = get('style', 'solid');
        const weight = get('weight', '1px');
        const color = get('color', '#e0e0e0');
        const gradientStart = get('gradientStart', '#6a11cb');
        const gradientEnd = get('gradientEnd', '#2575fc');
        const width = get('width', '100%');
        const alignment = get('alignment', 'center');
        const showIcon = get('showIcon') === true || get('showIcon') === 'true';
        const iconType = get('iconType', 'circle');
        const spacingTop = get('spacingTop', '16px');
        const spacingBottom = get('spacingBottom', '16px');

        // Determine icon component
        let IconComponent = null;
        if (showIcon) {
            if (iconType === 'circle') IconComponent = Circle;
            else if (iconType === 'star') IconComponent = Star;
            else if (iconType === 'heart') IconComponent = Heart;
        }

        // Divider line style
        const lineCommon = {
            height: weight,
            flex: 1,
            border: 'none',
            margin: 0,
            background: style === 'gradient' ? `linear-gradient(90deg, ${gradientStart} 0%, ${gradientEnd} 100%)` : 'transparent',
        };

        const borderStyleMap = {
            solid: 'solid',
            dashed: 'dashed',
            dotted: 'dotted',
            double: 'double',
        };

        const lineLeftRight = (position) => {
            if (style === 'gradient') {
                return (
                    <div
                        style={{
                            ...lineCommon,
                            minWidth: 0,
                        }}
                    />
                );
            }
            return (
                <div
                    style={{
                        flex: 1,
                        borderTop: `${weight} ${borderStyleMap[style] || 'solid'} ${color}`,
                        margin: 0,
                    }}
                />
            );
        };

        // Wrapper alignment
        const justifyMap = {
            left: 'flex-start',
            center: 'center',
            right: 'flex-end'
        };

        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: justifyMap[alignment] || 'center',
                    width,
                    gap: showIcon ? '8px' : '0',
                    marginTop: spacingTop,
                    marginBottom: spacingBottom,
                }}
                className="divider-wrapper"
            >
                {(!showIcon || alignment !== 'center') && lineLeftRight('left')}
                {showIcon ? (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 8px',
                        }}
                        className="divider-icon"
                    >
                        {IconComponent ? <IconComponent /> : null}
                    </div>
                ) : null}
                {(!showIcon || alignment !== 'center') && lineLeftRight('right')}
                {/* If no icon and centered, show single line */}
                {!showIcon && (
                    <div
                        style={{
                            flex: 1,
                            margin: 0,
                            ...(style === 'gradient' ? { background: `linear-gradient(90deg, ${gradientStart}, ${gradientEnd})`, height: weight } : { borderTop: `${weight} ${borderStyleMap[style] || 'solid'} ${color}` }),
                        }}
                    />
                )}
            </div>
        );
    }
}

export default BasicDivider;
