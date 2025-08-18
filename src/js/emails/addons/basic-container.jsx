import { Plus, RectangleHorizontal, Columns, RowsIcon, Grid3x3 } from 'lucide-react';
import DropZone from '../components/DropZone';
import EmptyCanvas from '../components/EmptyCanvas';
import { useBuilder } from '../context';
import SingleElement from '../components/SingleElement';
import BaseAddon from './base-addon';

class BasicContainer extends BaseAddon {
    constructor() {
        super();
        this.has_children = true;
    }
    
    get_id() {
        return 'container';
    }

    get_name() {
        return 'Container';
    }

    get_icon() {
        return RectangleHorizontal;
    }

    get_category() {
        return 'layout';
    }

    get_description() {
        return 'Flexible container with customizable columns and rows layout.';
    }

    get_settings() {
        return {
            content: {
                layout: {
                    title: 'Layout Settings',
                    description: 'Configure container grid layout',
                    fields: [
                        {
                            id: 'layout_type',
                            type: 'select',
                            label: 'Layout Type',
                            description: 'Choose the layout structure',
                            value: 'columns',
                            options: [
                                { label: 'Columns', value: 'columns' },
                                { label: 'Rows', value: 'rows' },
                                { label: 'Grid', value: 'grid' },
                                { label: 'Flex', value: 'flex' }
                            ]
                        },
                        {
                            id: 'columns',
                            type: 'number',
                            label: 'Columns',
                            description: 'Number of columns (1-12)',
                            value: 1,
                            min: 1,
                            max: 12,
                            show_if: (data) => ['columns', 'grid'].includes(data?.content?.layout?.fields?.find(f => f.id === 'layout_type')?.value)
                        },
                        {
                            id: 'rows',
                            type: 'number',
                            label: 'Rows',
                            description: 'Number of rows (1-6)',
                            value: 1,
                            min: 1,
                            max: 6,
                            show_if: (data) => ['rows', 'grid'].includes(data?.content?.layout?.fields?.find(f => f.id === 'layout_type')?.value)
                        },
                        {
                            id: 'flex_direction',
                            type: 'select',
                            label: 'Flex Direction',
                            description: 'Flex container direction',
                            value: 'row',
                            options: [
                                { label: 'Row', value: 'row' },
                                { label: 'Column', value: 'column' },
                                { label: 'Row Reverse', value: 'row-reverse' },
                                { label: 'Column Reverse', value: 'column-reverse' }
                            ],
                            show_if: (data) => data?.content?.layout?.fields?.find(f => f.id === 'layout_type')?.value === 'flex'
                        }
                    ]
                },
                spacing: {
                    title: 'Spacing',
                    description: 'Configure spacing and gaps',
                    fields: [
                        {
                            id: 'column_gap',
                            type: 'number',
                            label: 'Column Gap',
                            description: 'Gap between columns (px)',
                            value: 20,
                            min: 0,
                            max: 100
                        },
                        {
                            id: 'row_gap',
                            type: 'number',
                            label: 'Row Gap',
                            description: 'Gap between rows (px)',
                            value: 20,
                            min: 0,
                            max: 100
                        },
                        {
                            id: 'padding',
                            type: 'spacing',
                            label: 'Padding',
                            description: 'Container padding',
                            value: { top: 0, right: 0, bottom: 0, left: 0 }
                        }
                    ]
                },
                alignment: {
                    title: 'Alignment',
                    description: 'Configure content alignment',
                    fields: [
                        {
                            id: 'justify_content',
                            type: 'select',
                            label: 'Justify Content',
                            description: 'Horizontal alignment',
                            value: 'flex-start',
                            options: [
                                { label: 'Start', value: 'flex-start' },
                                { label: 'Center', value: 'center' },
                                { label: 'End', value: 'flex-end' },
                                { label: 'Space Between', value: 'space-between' },
                                { label: 'Space Around', value: 'space-around' },
                                { label: 'Space Evenly', value: 'space-evenly' }
                            ]
                        },
                        {
                            id: 'align_items',
                            type: 'select',
                            label: 'Align Items',
                            description: 'Vertical alignment',
                            value: 'stretch',
                            options: [
                                { label: 'Stretch', value: 'stretch' },
                                { label: 'Start', value: 'flex-start' },
                                { label: 'Center', value: 'center' },
                                { label: 'End', value: 'flex-end' },
                                { label: 'Baseline', value: 'baseline' }
                            ]
                        },
                        {
                            id: 'flex_wrap',
                            type: 'select',
                            label: 'Flex Wrap',
                            description: 'Wrap behavior',
                            value: 'nowrap',
                            options: [
                                { label: 'No Wrap', value: 'nowrap' },
                                { label: 'Wrap', value: 'wrap' },
                                { label: 'Wrap Reverse', value: 'wrap-reverse' }
                            ],
                            show_if: (data) => data?.content?.layout?.fields?.find(f => f.id === 'layout_type')?.value === 'flex'
                        }
                    ]
                }
            },
            style: {
                background: {
                    title: 'Background',
                    description: 'Container background settings',
                    fields: [
                        {
                            id: 'background_type',
                            type: 'select',
                            label: 'Background Type',
                            value: 'none',
                            options: [
                                { label: 'None', value: 'none' },
                                { label: 'Color', value: 'color' },
                                { label: 'Gradient', value: 'gradient' },
                                { label: 'Image', value: 'image' }
                            ]
                        },
                        {
                            id: 'background_color',
                            type: 'color',
                            label: 'Background Color',
                            value: '#ffffff',
                            show_if: (data) => ['color', 'gradient'].includes(data?.style?.background?.fields?.find(f => f.id === 'background_type')?.value)
                        }
                    ]
                },
                border: {
                    title: 'Border',
                    description: 'Container border settings',
                    fields: [
                        {
                            id: 'border_width',
                            type: 'number',
                            label: 'Border Width',
                            value: 0,
                            min: 0,
                            max: 20
                        },
                        {
                            id: 'border_style',
                            type: 'select',
                            label: 'Border Style',
                            value: 'solid',
                            options: [
                                { label: 'Solid', value: 'solid' },
                                { label: 'Dashed', value: 'dashed' },
                                { label: 'Dotted', value: 'dotted' },
                                { label: 'Double', value: 'double' }
                            ]
                        },
                        {
                            id: 'border_color',
                            type: 'color',
                            label: 'Border Color',
                            value: '#e2e8f0'
                        },
                        {
                            id: 'border_radius',
                            type: 'number',
                            label: 'Border Radius',
                            value: 0,
                            min: 0,
                            max: 50
                        }
                    ]
                }
            }
        };
    }

    render({ element }) {
        const { sidebar, setSidebar, template, setTemplate, addons, drop_element } = useBuilder();
        
        // Helper function to get setting values
        const get_setting_value = (element, tab, section, key, defaultValue) => {
            return element?.data?.[tab]?.[section]?.fields?.find(f => f.id === key)?.value ?? defaultValue;
        };

        // Initialize container structure
        const initialize_structure = (element) => {
            const layoutType = get_setting_value(element, 'content', 'layout', 'layout_type', 'columns');
            const columns = Math.max(1, parseInt(get_setting_value(element, 'content', 'layout', 'columns', 1)));
            const rows = Math.max(1, parseInt(get_setting_value(element, 'content', 'layout', 'rows', 1)));

            if (!element.structure) {
                element.structure = { cells: [] };
            }

            let totalCells = 1;
            if (layoutType === 'columns') {
                totalCells = columns;
            } else if (layoutType === 'rows') {
                totalCells = rows;
            } else if (layoutType === 'grid') {
                totalCells = columns * rows;
            }

            // Initialize cells if needed
            while (element.structure.cells.length < totalCells) {
                element.structure.cells.push({
                    id: `cell_${element.structure.cells.length}`,
                    children: []
                });
            }

            // Remove excess cells
            element.structure.cells = element.structure.cells.slice(0, totalCells);

            return element.structure;
        };

        // Get container styles
        const get_container_styles = (element) => {
            const layoutType = get_setting_value(element, 'content', 'layout', 'layout_type', 'columns');
            const columns = Math.max(1, parseInt(get_setting_value(element, 'content', 'layout', 'columns', 1)));
            const rows = Math.max(1, parseInt(get_setting_value(element, 'content', 'layout', 'rows', 1)));
            const flexDirection = get_setting_value(element, 'content', 'layout', 'flex_direction', 'row');
            
            const columnGap = get_setting_value(element, 'content', 'spacing', 'column_gap', 20);
            const rowGap = get_setting_value(element, 'content', 'spacing', 'row_gap', 20);
            const padding = get_setting_value(element, 'content', 'spacing', 'padding', { top: 0, right: 0, bottom: 0, left: 0 });
            
            const justifyContent = get_setting_value(element, 'content', 'alignment', 'justify_content', 'flex-start');
            const alignItems = get_setting_value(element, 'content', 'alignment', 'align_items', 'stretch');
            const flexWrap = get_setting_value(element, 'content', 'alignment', 'flex_wrap', 'nowrap');
            
            const backgroundType = get_setting_value(element, 'style', 'background', 'background_type', 'none');
            const backgroundColor = get_setting_value(element, 'style', 'background', 'background_color', '#ffffff');
            
            const borderWidth = get_setting_value(element, 'style', 'border', 'border_width', 0);
            const borderStyle = get_setting_value(element, 'style', 'border', 'border_style', 'solid');
            const borderColor = get_setting_value(element, 'style', 'border', 'border_color', '#e2e8f0');
            const borderRadius = get_setting_value(element, 'style', 'border', 'border_radius', 0);

            let styles = {
                columnGap: `${columnGap}px`,
                rowGap: `${rowGap}px`,
                padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
                borderWidth: `${borderWidth}px`,
                borderStyle: borderStyle,
                borderColor: borderColor,
                borderRadius: `${borderRadius}px`,
                minHeight: '60px',
                position: 'relative'
            };

            if (backgroundType === 'color') {
                styles.backgroundColor = backgroundColor;
            }

            switch (layoutType) {
                case 'columns':
                    styles.display = 'grid';
                    styles.gridTemplateColumns = `repeat(${columns}, 1fr)`;
                    break;
                case 'rows':
                    styles.display = 'grid';
                    styles.gridTemplateRows = `repeat(${rows}, 1fr)`;
                    break;
                case 'grid':
                    styles.display = 'grid';
                    styles.gridTemplateColumns = `repeat(${columns}, 1fr)`;
                    styles.gridTemplateRows = `repeat(${rows}, 1fr)`;
                    break;
                case 'flex':
                    styles.display = 'flex';
                    styles.flexDirection = flexDirection;
                    styles.justifyContent = justifyContent;
                    styles.alignItems = alignItems;
                    styles.flexWrap = flexWrap;
                    break;
                default:
                    styles.display = 'grid';
                    styles.gridTemplateColumns = '1fr';
            }

            return styles;
        };

        // Render individual cell
        const render_cell = (cellData, cellIndex, element) => {
            const handleCellClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                setSidebar(prev => ({
                    ...prev, 
                    visible: true, 
                    element: element,
                    activeCell: cellIndex
                }));
            };

            const handleDrop = (e) => {
                drop_element(e, cellIndex, { id: element.id, cell: cellIndex });
            };

            return (
                <div 
                    key={cellIndex}
                    onClick={handleCellClick}
                    className="xpo_container_cell xpo_border-2 xpo_border-dashed xpo_border-slate-300 xpo_rounded-[4px] xpo_min-h-[60px] xpo_relative xpo_cursor-pointer xpo_transition-all xpo_duration-200 xpo_ease-in-out"
                    style={{
                        // padding: `${!sidebar.visible ? 0 : 12}px`, // || sidebar?.element?.id == element.id
                        backgroundColor: cellData.children?.length ? 'transparent' : '#f8fafc'
                    }}
                    onMouseEnter={(e) => {
                        e.stopPropagation();
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.backgroundColor = cellData.children?.length ? 'transparent' : '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                        e.stopPropagation();
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.backgroundColor = cellData.children?.length ? 'transparent' : '#f8fafc';
                    }}
                >
                    <DropZone 
                        element={element} 
                        cellIndex={cellIndex}
                        onDrop={handleDrop}
                        style={{ minHeight: '40px' }}
                    >
                        {cellData.children?.length > 0 ? (
                            <div className="xpo_cell_children">
                                {cellData.children.map((child, childIndex) => (
                                    <div key={childIndex} className="xpo_child_element">
                                        <SingleElement element={child} container={{id: element?.id, cell: cellIndex, child: childIndex}} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyCanvas onDrop={(e) => {
                                handleDrop(e)
                            }} />
                        )}
                    </DropZone>
                    
                    {/* Cell indicator */}
                    <div className="xpo_absolute xpo_top-1 xpo_right-1 xpo_bg-[#3b82f6] xpo_text-white xpo_text-[10px] xpo_p-[2px_6px] xpo_rounded-1 xpo_opacity-70 xpo_pointer-events-none">
                        {cellIndex + 1}
                    </div>
                </div>
            );
        };

        // Initialize container structure
        const structure = initialize_structure(element);
        
        // Get container styles
        const containerStyles = get_container_styles(element);
        
        const handleContainerClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setSidebar(prev => ({
                ...prev, 
                visible: true, 
                element: element
            }));
        };

        return (
            <div 
                className="xpo_container"
                style={containerStyles}
                onClick={handleContainerClick}
                data-element-id={element.id}
                data-element-type="container"
            >
                {structure.cells.map((cellData, cellIndex) => 
                    render_cell(cellData, cellIndex, element)
                )}
                
                {/* Container overlay for selection */}
                <div 
                    className="xpo_container_overlay"
                    style={{
                        zIndex: 1,
                        top: '-2px',
                        left: '-2px',
                        right: '-2px',
                        bottom: '-2px',
                        position: 'absolute',
                        pointerEvents: 'none',
                        borderRadius: 'inherit',
                        border: sidebar?.element?.id === element.id ? '2px solid #3b82f6' : 'none'
                    }}
                />
            </div>
        );
    }
}

export default BasicContainer;
