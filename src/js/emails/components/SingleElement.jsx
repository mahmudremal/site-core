
import { useState, useRef, memo } from 'react';
import { GripVertical, Copy, Trash2, Edit, Type, Image, Square, Columns } from 'lucide-react';
import { useBuilder } from '../context';
import DropZone from './DropZone';

const ElementControls = ({ element, onEdit, onDuplicate, onDelete, className = '' }) => {
    const { addons } = useBuilder();
    const Addon = addons.find(addn => addn.get_id() == element.type);
    if (!Addon) return <></>;
    const ElementIcon = Addon.get_icon();

    return (
        <>
            <div className={`xpo_absolute xpo_-top-10 xpo_left-0 xpo_items-center xpo_gap-1 xpo_bg-blue-600 xpo_text-white xpo_px-2 xpo_py-1 xpo_rounded xpo_text-xs xpo_font-medium xpo_shadow-lg xpo_z-10 ${className}`}>
                <ElementIcon size={12} />
                <span className="xpo_capitalize">{Addon.get_name()}</span>
                <div className="xpo_flex xpo_items-center xpo_gap-1 xpo_ml-2">
                    <button
                        title="Edit"
                        onClick={(e) => {e.preventDefault();e.stopPropagation();onEdit(element);}}
                        className="xpo_p-1 xpo_hover:xpo_bg-blue-700 xpo_rounded xpo_transition-colors"
                    >
                        <Edit size={10} />
                    </button>
                    <button
                        title="Duplicate"
                        onClick={(e) => {e.preventDefault();e.stopPropagation();onDuplicate(element);}}
                        className="xpo_p-1 xpo_hover:xpo_bg-blue-700 xpo_rounded xpo_transition-colors"
                    >
                        <Copy size={10} />
                    </button>
                    <button
                        title="Delete"
                        onClick={(e) => {e.preventDefault();e.stopPropagation();confirm('Are you sure you want to remove this block!') && onDelete(element);}}
                        className="xpo_p-1 xpo_hover:xpo_bg-red-600 xpo_rounded xpo_transition-colors"
                    >
                        <Trash2 size={10} />
                    </button>
                </div>
            </div>
            <div className={`xpo_absolute xpo_-left-8 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_bg-blue-600 xpo_text-white xpo_p-1 xpo_rounded xpo_cursor-move xpo_shadow-lg ${className}`}>
                <GripVertical size={12} />
            </div>
        </>
    );
};

const ElementRenderer = ({ element, onSelect, onEdit, onDelete, onDuplicate, onMove, index }) => {
    const { sidebar, addons } = useBuilder();
    const [isHovered, setIsHovered] = useState(false);
    const Addon = addons.find(addn => addn.get_id() == element.type);
    const dragRef = useRef(null);

    const isSelected = () => sidebar?.element?.id == element?.id;

    const handleDragStart = (e) => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify({ id: element.id, move: 'order', index }));
    };

    const handleDragOver = (e) => {
        e.preventDefault();e.stopPropagation();
    };

    const handleDrop = (e) => {
        onMove(e, index, element);
        // e.preventDefault();e.stopPropagation();
        // const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
        // if (dragData.id !== element.id) {onMove(e, dragData, element);}
    };

    return (
        <div
            draggable
            ref={dragRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            // onMouseEnter={() => setIsHovered(true)}
            // onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => {e.preventDefault();e.stopPropagation();!isSelected() && onSelect(element);}}
            className={`xpo_relative xpo_group xpo_transition-all xpo_duration-200 ${isSelected() ? 'xpo_ring-2 xpo_ring-blue-500' : ''}`}
        >
            <div className="xpo_relative">
                <div>
                    {Addon?.render && <Addon.render element={element} />}
                </div>
                {(isHovered || isSelected()) && (
                    <div className={`xpo_absolute xpo_inset-0 xpo_pointer-events-none ${(isHovered || isSelected()) ? '' : 'xpo_hidden'}`}>
                        <div className={`xpo_absolute xpo_inset-0 xpo_border-2 xpo_rounded ${isSelected() ? 'xpo_border-blue-500' : 'xpo_border-blue-300'}`} />
                    </div>
                )}
            </div>
            {(isHovered || isSelected()) && (
                <ElementControls
                    onEdit={onEdit}
                    element={element}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    className={(isHovered || isSelected()) ? 'xpo_flex' : 'xpo_hidden'}
                />
            )}
        </div>
    );
};

const SingleElement = ({ element = {}, index = null, container = null }) => {
    const { setSidebar, setTemplate, drop_element, move_element } = useBuilder();

    const handleElementEdit = (element) => {
        setSidebar(prev => ({ ...prev, visible: true, selectedTab: 'content', element }));
    };

    const handleElementSelect = (element) => {
        handleElementEdit(element);
    };

    const removeElementRecursively = (elements, elementIdToRemove) => {
        return elements.filter(el => el.id !== elementIdToRemove)
            .map(el => {
                // Create a deep copy to avoid direct mutation
                const updatedElement = { ...el };

                // Handle nested cells recursively
                if (updatedElement.structure?.cells) {
                    updatedElement.structure.cells = updatedElement.structure.cells.map(cell => {
                        // Create a copy of the cell
                        const updatedCell = { ...cell };

                        // Recursively filter children
                        if (updatedCell.children) {
                            updatedCell.children = removeElementRecursively(updatedCell.children, elementIdToRemove);
                        }

                        return updatedCell;
                    });
                }

                return updatedElement;
            });
    };

    const handleElementDelete = (element) => {
        setTemplate(prev => ({
            ...prev,
            elements: removeElementRecursively(prev.elements, element.id)
        }));
        setSidebar(prev => ({ ...prev, selectedTab: 'content', visible: null, element: null }));
    };

    const duplicateElementRecursively = (elements, elementToDuplicate) => {
        return elements.flatMap(el => {
            // If this is not the element we're looking for, process its children recursively
            if (el.id !== elementToDuplicate.id) {
                // Create a copy of the element
                const updatedElement = { ...el };

                // Recursively handle nested cells
                if (updatedElement.structure?.cells) {
                    updatedElement.structure.cells = updatedElement.structure.cells.map(cell => {
                        // Create a copy of the cell
                        const updatedCell = { ...cell };

                        // Recursively duplicate children if needed
                        if (updatedCell.children) {
                            updatedCell.children = duplicateElementRecursively(updatedCell.children, elementToDuplicate);
                        }

                        return updatedCell;
                    });
                }

                return [updatedElement];
            }

            // If this is the element to duplicate
            const duplicated = { 
                ...elementToDuplicate, 
                id: `${elementToDuplicate.type}-${Date.now()}`, 
                content: elementToDuplicate.content 
            };
            setSidebar(prev => ({...prev, selectedTab: 'content', visible: true, element: duplicated}));
            
            // Return the original element and its duplicate
            return [el, duplicated];
        });
    };

    const handleElementDuplicate = (element) => {
        setTemplate(prev => ({...prev, elements: duplicateElementRecursively(prev.elements, element)}));
    };
    
    return (
        <DropZone
            element={element}
            onDrop={(e) => drop_element(e, index, container)}
        >
            <div className="xpo_block">
                <ElementRenderer
                    index={index}
                    element={element}
                    onMove={drop_element}
                    onEdit={handleElementEdit}
                    onDelete={handleElementDelete}
                    onSelect={handleElementSelect}
                    onDuplicate={handleElementDuplicate}
                />
            </div>
        </DropZone>
    )
}

export default memo(SingleElement);
