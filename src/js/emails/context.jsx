import axios from 'axios';
import { useState, useEffect, createContext, useContext } from 'react';
import { editorAddons, placeHolderElements } from './addons';
import { merge_configs } from './addon-configs';
import { formatTemplateData } from './components/formatTemplateData';
export const BuilderContext = createContext();

export const BuilderProvider = ({ id: template_id = 0,  children }) => {
    const [template, setTemplate] = useState({elements: placeHolderElements});
    const [selectedAddon, setSelectedAddon] = useState(null);
    const [addons, setAddons] = useState(editorAddons);
    const [previewMode, setPreviewMode] = useState('desktop');
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sidebar, setSidebar] = useState({
        search: '',
        visible: true,
    });

    const [selectedCategory, setSelectedCategory] = useState('all');

    const loadTemplate = async () => {
        axios.get(`/wp-json/sitecore/v1/emails/templates/${template_id}`)
        .then(res => res.data)
        .then(data => {
            if (!data?.template?._template) {
                throw new Error('Template not found!');
            }
            setTemplate(prev => {
                const newTemp = {
                    ...data.template,
                    ...data.template._template,
                    _template: undefined,
                    // elements: prev.elements
                };
                newTemp.elements = merge_configs(newTemp.elements, addons);
                // console.log(newTemp)
                return newTemp;
            });
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    };

    const saveTemplate = (publish = 'draft') => {
        return new Promise((resolve) => {
            axios.post(`/wp-json/sitecore/v1/emails/templates/${template?.id || 0}`, {
                _status: publish,
                _template: JSON.stringify(formatTemplateData(template)),
            })
            .then(res => res.data)
            // .then(data => alert('Template saved successfully!'))
            .catch(err => alert('Failed to save template'))
            .finally(() => resolve(true))
        });
    };

    const addElementToCellRecursive = (elements, containerId, cellIndex, elementToAdd) => {
        return elements.flatMap(element => {
            if (element.id === containerId) {
                console.log(elementToAdd, element)
                return [elementToAdd, element];
            }
            // if (element.id === containerId) {
            //     console.log(elementToAdd, element)
            //     return [elementToAdd, element];
            //     const newStructure = { ...element.structure };
            //     const newCells = [...newStructure.cells];
            //     const targetCell = { ...newCells[cellIndex] };
            //     const newChildren = [...(targetCell.children || [])];
            //     newChildren.push(elementToAdd);
            //     targetCell.children = newChildren;
            //     newCells[cellIndex] = targetCell;
            //     newStructure.cells = newCells;
            //     return { ...element, structure: newStructure };
            // }
            // if (element?.structure?.cells) {
            //     const newCells = element.structure.cells.map(cell => {
            //         if (cell.children) {
            //             return { ...cell, children: addElementToCellRecursive(cell.children, containerId, cellIndex, elementToAdd) };
            //         }
            //         return cell;
            //     });
            //     return { ...element, structure: { ...element.structure, cells: newCells } };
            // }
            return [element];
        });
    };

    const drop_element = (e, index = null, container = null) => {
        e.preventDefault();
        e.stopPropagation();
        const _json = e.dataTransfer.getData("application/json");
        if (!_json || _json == '') return;
        const _data = JSON.parse(_json);
        // 
        if (_data?.move === 'order') {
            // console.log('is for move', _data, container);
            const { id: containerId, cell: cellIndex, child: childIndex } = container;
            move_element(_data, {id: childIndex});
        } else {
            // console.log('is for drop', _data, container);
            const data = merge_configs([_data], addons)[0];
            if (container) {
                if (typeof container === 'object' && container.id) {
                    const { id: containerId, cell: cellIndex, child: childIndex } = container;
                    setTemplate(prev => ({ ...prev, elements: addElementToCellRecursive(prev.elements, containerId, cellIndex, data) }));
                } else {
                    const updateElementsRecursively = (elements, targetId, newElement, insertIndex) => {
                        return elements.map(element => {
                            if (element.id === targetId) {
                                const children = element.children || [];
                                const updatedChildren = [...children];
                                if (insertIndex !== null) {
                                    updatedChildren.splice(insertIndex, 0, newElement);
                                } else {
                                    updatedChildren.push(newElement);
                                }
                                return { ...element, children: updatedChildren };
                            }
                            
                            if (element.children?.length > 0) {
                                return { ...element, children: updateElementsRecursively(element.children, targetId, newElement, insertIndex) };
                            }
                            
                            return element;
                        });
                    };
                    setTemplate(prev => ({ ...prev,  elements: updateElementsRecursively(prev.elements, container, data, index) }));
                }
            } else {
                setTemplate(prev => {
                    const newElements = [...prev.elements];
                    if (index !== null) {
                        newElements.splice(index, 0, data);
                    } else {
                        newElements.push(data);
                    }
                    return { ...prev, elements: newElements };
                });
            }
            setSidebar(prev => ({ ...prev,  selectedTab: 'content',  visible: true,  element: data }));
        }
    };





window.template = template;
// 
const move_element = (droppedElem, droppedOnElem) => {
    if (droppedElem?.move === 'order' && droppedElem.id && droppedOnElem.id && droppedElem.id !== droppedOnElem.id) {
        const sourceId = droppedElem.id;
        const targetId = droppedOnElem.id;

        const get_element_by_id = (element_id) => {
            return get_element_recursively(template.elements, element_id);
        }

        const get_element_recursively = (elements, targetId) => {
            for (let elem of elements) {
                if (targetId === elem.id) {
                    return elem;
                }
                if (elem?.structure?.cells?.length) {
                    for (let cell of elem.structure.cells) {
                        if (cell.children) {
                            const found = get_element_recursively(cell.children, targetId);
                            if (found) {
                                return found;
                            }
                        }
                    }
                }
            }
            return null;
        }

        const sourceElement = get_element_by_id(sourceId);
        const targetElement = get_element_by_id(targetId);
        if (!sourceElement || !targetElement) {
            console.log('Source or Target Element not found!', sourceElement, targetElement);
            return;
        }

        const recursiveElements = (elements) => {
            let targetColumn = null;
            const result = elements
                .filter(elem => {
                    if (sourceId == elem.id) {
                        return false;
                    }
                    return true;
                })
                .map((elem, elemIndex) => {
                    if (targetId == elem.id) {
                        targetColumn = elemIndex;
                    }
                    if (elem?.structure?.cells?.length) {
                        elem.structure.cells = elem.structure.cells.map(cell => {
                            return {
                                ...cell,
                                children: recursiveElements(cell.children)
                            };
                        });
                    }
                    return elem;
                });

            if (targetColumn !== null) {
                result.splice(targetColumn, 0, {...sourceElement});
            }
            return result;
        }
        // 
        // if (droppedElem?.move === 'order') {console.log('Move triggired', {...template, elements: recursiveElements(template.elements)});return;}
        // 
        setSidebar(prev => ({ ...prev,  selectedTab: 'content',  visible: true,  element: sourceElement }));
        setTemplate(prev => ({...prev, elements: recursiveElements(prev.elements)}));
    }
}









    useEffect(() => {
        loadTemplate();
    }, []);

    const get_uniqueid = (addon) => {
        return `${addon.get_id().split('-').map(i => i.trim()[0]).join('')}-${Date.now()}`;
    }

    const contextValue = {
        template,
        setTemplate,
        addons, setAddons,
        sidebar, setSidebar,
        selectedAddon,
        setSelectedAddon,
        previewMode,
        setPreviewMode,
        isLoading,
        setIsLoading,
        searchTerm,
        setSearchTerm,
        selectedCategory,
        setSelectedCategory,
        saveTemplate,
        loadTemplate,
        get_uniqueid,
        drop_element,
        move_element,
    };
    
    return (
        <BuilderContext.Provider value={contextValue}>
            {children}
        </BuilderContext.Provider>
    );
};

export const useBuilder = () => {
    const context = useContext(BuilderContext);
    if (!context) {
        throw new Error('useBuilder must be used within BuilderProvider');
    }
    return context;
};
