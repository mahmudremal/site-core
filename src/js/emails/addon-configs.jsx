export const defaultConfig = {
    content: {},
    style: {
        content: {
            title: "Content",
            description: "Content styling configuration.",
            fields: [
                {
                    id: "alignment",
                    type: "checkbox",
                    label: "Alignment",
                    description: "Add margin spacing around the component",
                    value: false
                },
            ]
        },
    },
    advanced: {
        layout: {
            title: "Layout Settings",
            description: "Configure the layout and positioning of your component",
            fields: [
                {
                    id: "enableMargin",
                    type: "checkbox",
                    label: "Enable Margin",
                    description: "Add margin spacing around the component",
                    value: false
                },
                {
                    id: "marginTop",
                    type: "text",
                    label: "Margin Top (px)",
                    description: "Top margin in pixels",
                    value: "",
                    showIf: { field: "enableMargin", value: true }
                },
                {
                    id: "marginRight",
                    type: "text",
                    label: "Margin Right (px)",
                    description: "Right margin in pixels",
                    value: "",
                    showIf: { field: "enableMargin", value: true }
                },
                {
                    id: "marginBottom",
                    type: "text",
                    label: "Margin Bottom (px)",
                    description: "Bottom margin in pixels",
                    value: "",
                    showIf: { field: "enableMargin", value: true }
                },
                {
                    id: "marginLeft",
                    type: "text",
                    label: "Margin Left (px)",
                    description: "Left margin in pixels",
                    value: "",
                    showIf: { field: "enableMargin", value: true }
                },
                {
                    id: "enablePadding",
                    type: "checkbox",
                    label: "Enable Padding",
                    description: "Add internal padding to the component",
                    value: false
                },
                {
                    id: "paddingTop",
                    type: "text",
                    label: "Padding Top (px)",
                    description: "Top padding in pixels",
                    value: "",
                    showIf: { field: "enablePadding", value: true }
                },
                {
                    id: "paddingRight",
                    type: "text",
                    label: "Padding Right (px)",
                    description: "Right padding in pixels",
                    value: "",
                    showIf: { field: "enablePadding", value: true }
                },
                {
                    id: "paddingBottom",
                    type: "text",
                    label: "Padding Bottom (px)",
                    description: "Bottom padding in pixels",
                    value: "",
                    showIf: { field: "enablePadding", value: true }
                },
                {
                    id: "paddingLeft",
                    type: "text",
                    label: "Padding Left (px)",
                    description: "Left padding in pixels",
                    value: "",
                    showIf: { field: "enablePadding", value: true }
                },
                {
                    id: "width",
                    type: "select",
                    label: "Width",
                    description: "Set the width of the component",
                    value: "default",
                    options: [
                        { value: "default", label: "Default" },
                        { value: "full", label: "Full Width" },
                        { value: "custom", label: "Custom" }
                    ]
                },
                {
                    id: "customWidth",
                    type: "text",
                    label: "Custom Width",
                    description: "Enter custom width (e.g., 300px, 50%, 20rem)",
                    value: "",
                    showIf: { field: "width", value: "custom" }
                }
            ]
        },
        styling: {
            title: "Styling Options",
            description: "Customize the appearance and visual styling",
            fields: [
                {
                    id: "enableShadow",
                    type: "checkbox",
                    label: "Enable Drop Shadow",
                    description: "Add a drop shadow effect to the component",
                    value: false
                },
                {
                    id: "shadowSize",
                    type: "select",
                    label: "Shadow Size",
                    description: "Choose the shadow intensity",
                    value: "medium",
                    options: [
                        { value: "small", label: "Small" },
                        { value: "medium", label: "Medium" },
                        { value: "large", label: "Large" },
                        { value: "xl", label: "Extra Large" }
                    ],
                    showIf: { field: "enableShadow", value: true }
                },
                {
                    id: "enableBorder",
                    type: "checkbox",
                    label: "Enable Border",
                    description: "Add a border around the component",
                    value: false
                },
                {
                    id: "borderColor",
                    type: "select",
                    label: "Border Color",
                    description: "Choose the border color",
                    value: "gray",
                    options: [
                        { value: "gray", label: "Gray" },
                        { value: "blue", label: "Blue" },
                        { value: "red", label: "Red" },
                        { value: "green", label: "Green" },
                        { value: "yellow", label: "Yellow" }
                    ],
                    showIf: { field: "enableBorder", value: true }
                },
                {
                    id: "borderWidth",
                    type: "select",
                    label: "Border Width",
                    description: "Choose the border thickness",
                    value: "1",
                    options: [
                        { value: "1", label: "1px" },
                        { value: "2", label: "2px" },
                        { value: "4", label: "4px" },
                        { value: "8", label: "8px" }
                    ],
                    showIf: { field: "enableBorder", value: true }
                },
                {
                    id: "backgroundColor",
                    type: "select",
                    label: "Background Color",
                    description: "Set the background color",
                    value: "white",
                    options: [
                        { value: "white", label: "White" },
                        { value: "gray-50", label: "Light Gray" },
                        { value: "gray-100", label: "Gray" },
                        { value: "blue-50", label: "Light Blue" },
                        { value: "green-50", label: "Light Green" }
                    ]
                }
            ]
        },
        advanced: {
            title: "Advanced Settings",
            description: "Advanced configuration options for power users",
            fields: [
                {
                    id: "enableAdvanced",
                    type: "checkbox",
                    label: "Enable Advanced Options",
                    description: "Show advanced configuration options",
                    value: false
                },
                {
                    id: "zIndex",
                    type: "text",
                    label: "Z-Index",
                    description: "Set the stacking order (higher numbers appear on top)",
                    value: "",
                    showIf: { field: "enableAdvanced", value: true }
                },
                {
                    id: "cssId",
                    type: "text",
                    label: "CSS ID",
                    description: "Unique identifier for CSS targeting",
                    value: "",
                    showIf: { field: "enableAdvanced", value: true }
                },
                {
                    id: "cssClasses",
                    type: "text",
                    label: "Additional CSS Classes",
                    description: "Space-separated list of CSS classes",
                    value: "",
                    showIf: { field: "enableAdvanced", value: true }
                },
                {
                    id: "customUrl",
                    type: "url",
                    label: "Custom URL",
                    description: "External URL for additional resources",
                    value: "",
                    showIf: { field: "enableAdvanced", value: true }
                }
            ]
        }
    }
};





export const merge_configs = (elements, addons) => {
    const mergeElementConfig = (element) => {
        // Find the corresponding addon for this element type
        const ElAddon = addons.find(a => a.get_id() == element.type);
        
        // If no addon found, return the element as is
        if (!ElAddon) return element;

        // Get element settings, merging with default config
        const ElSettings = Object.entries({...defaultConfig, ...ElAddon.get_settings()}).reduce((tab, [tabKey, tabCont]) => {
            Object.entries({...defaultConfig?.[tabKey]??{}, ...tabCont}).reduce((acc, [accKey, accCont]) => {
                const createUniqueMap = (items = []) => {
                    const result = new Map();
                    items.forEach(item => result.set(item.id, item));
                    return result;
                };
                acc[accKey] = {
                    ...accCont,
                    fields: [
                        ...createUniqueMap([...defaultConfig?.[tabKey]?.[accKey]?.fields??[], ...accCont.fields??[]]).values()
                    ]
                };
                return acc;
            }, {});
            tab[tabKey] = tabCont;
            return tab;
        }, {});

        // Merge data configuration
        const mergedData = Object.entries(ElSettings).reduce((acc, [tabKey, tabCont]) => {
            acc[tabKey] = Object.entries(tabCont).reduce((innerAcc, [accKey, accCont]) => {
                innerAcc[accKey] = {
                    ...accCont,
                    fields: accCont.fields.map(accI => ({
                        ...accI,
                        value: element?.data?.[tabKey]?.[accKey]?.find(f => f.id == accI.id)?.value ?? accI?.value
                    }))
                };
                return innerAcc;
            }, {});
            return acc;
        }, {});

        // Handle nested structure recursively
        const mergedElement = {
            ...element,
            data: mergedData
        };

        // Recursively merge nested cells if structure exists
        if (mergedElement?.structure?.cells?.length) {
            return {
                ...mergedElement,
                structure: {
                    ...mergedElement.structure,
                    cells: mergedElement.structure.cells.map(cell => ({
                        ...cell,
                        children: cell.children ? cell.children.map(mergeElementConfig) : []
                    }))
                }
            };
        }

        return mergedElement;
    };

    // Map through elements and apply recursive merge
    return elements.map(mergeElementConfig);
};

