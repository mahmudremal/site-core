const formatElementData = (element) => {
    const formattedData = Object.entries(element.data).reduce((acc, [tabKey, tabCont]) => {
        const formattedTabCont = Object.entries(tabCont).reduce((innerAcc, [accKey, accCont]) => {
            const fields = (accCont?.fields ?? []).map(i => ({ id: i.id, value: i.value }));
            innerAcc[accKey] = fields;
            return innerAcc;
        }, {});
        acc[tabKey] = formattedTabCont;
        return acc;
    }, {});

    if (element?.structure?.cells?.length) {
        return {
            ...element,
            data: formattedData,
            structure: {
                ...element.structure,
                cells: element.structure.cells.map(cel => ({...cel, children: cel.children.map(formatElementData)}))
            }
        };
    }

    return {
        ...element,
        data: formattedData
    };
};

export const formatTemplateData = (template) => {
    return {
        ...template,
        elements: template.elements.map(formatElementData)
    };
};
