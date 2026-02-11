export const generateId = () => Math.random().toString(36).substr(2, 7);

const BASE_CONTAINER = {
  elType: "container",
  isInner: false,
  settings: {
    flex_direction: "column",
    container_type: "flex",
    content_width: "boxed",
    flex_justify_content: "center",
    flex_align_items: "stretch",
    flex_gap: { column: "20", row: "20", isLinked: true, unit: "px" },
  },
};

const BASE_WIDGET = {
  elType: "widget",
};

export const expandElementorJson = (json) => {
  if (!json) return null;

  if (Array.isArray(json)) {
    return json.map((item) => expandElementorJson(item));
  }

  // Handle Container
  if (json.elType === "container" || json.section) {
    const data = json.section || json;
    return {
      ...BASE_CONTAINER,
      id: generateId(),
      settings: {
        ...BASE_CONTAINER.settings,
        ...data.settings,
      },
      elements: (data.elements || [])
        .map((el) => expandElementorJson(el))
        .filter(Boolean),
    };
  }

  // Handle Widget
  if (json.elType === "widget" || json.widgetType || json.widget) {
    const widgetType = json.widgetType || json.widget;
    return {
      ...BASE_WIDGET,
      id: generateId(),
      widgetType: widgetType,
      settings: {
        ...json.settings,
      },
    };
  }

  return json;
};
