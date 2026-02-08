const WIDGET_DESCRIPTIONS = {
  heading: "Display titles and headings with customizable HTML tags (H1-H6)",
  "text-editor": "Rich text editor for paragraphs, formatted content, and HTML",
  image: "Single image with link, caption, and lightbox options",
  button: "Call-to-action button with text, link, and icon",
  divider: "Visual separator line between sections",
  spacer: "Empty vertical space for layout control",
  icon: "Single icon from icon library (FontAwesome, etc.)",
  "icon-list": "List of items with icons",
  "icon-box": "Icon with heading and description text",
  "image-box": "Image with heading and description text",
  gallery: "Image gallery with lightbox",
  video: "Self-hosted or YouTube/Vimeo video player",
  "social-icons": "Links to social media profiles with icons",
  "nav-menu": "Navigation menu from WordPress menus",
  accordion: "Collapsible FAQ or content sections",
  tabs: "Tabbed content panels",
  toggle: "Expandable content sections",
  alert: "Notification or alert box",
  counter: "Animated number counter",
  progress: "Progress bar with percentage",
  testimonial: "Customer testimonial with quote and author",
  "star-rating": "Star rating display",
  "google-maps": "Embedded Google Maps",
  sidebar: "WordPress widget area",
  soundcloud: "SoundCloud audio player",
  shortcode: "WordPress shortcode renderer",
  html: "Custom HTML code block",
  "menu-anchor": "Anchor point for one-page navigation",
  "read-more": "Content with read more toggle",
};

const WIDGET_UNIQUE_CONTROLS = {
  heading: {
    title: { type: "text", label: "Title", default: "This is the heading" },
    link: { type: "url", label: "Link" },
    size: {
      type: "select",
      label: "HTML Tag",
      options: ["h1", "h2", "h3", "h4", "h5", "h6"],
    },
    align: {
      type: "choose",
      label: "Alignment",
      options: ["left", "center", "right", "justify"],
    },
  },

  "text-editor": {
    editor: {
      type: "wysiwyg",
      label: "Text Editor",
      default: "<p>Content goes here</p>",
    },
    drop_cap: { type: "switcher", label: "Drop Cap" },
  },

  image: {
    image: { type: "media", label: "Choose Image" },
    image_size: { type: "select", label: "Image Size" },
    link_to: {
      type: "select",
      label: "Link",
      options: ["none", "file", "custom"],
    },
    link: { type: "url", label: "Link" },
    caption: { type: "text", label: "Caption" },
    open_lightbox: { type: "select", label: "Lightbox" },
  },

  button: {
    text: { type: "text", label: "Text", default: "Click here" },
    link: { type: "url", label: "Link" },
    size: {
      type: "select",
      label: "Size",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    icon: { type: "icons", label: "Icon" },
    icon_align: {
      type: "select",
      label: "Icon Position",
      options: ["left", "right"],
    },
    button_type: {
      type: "select",
      label: "Type",
      options: ["primary", "secondary", "success", "info", "warning", "danger"],
    },
  },

  divider: {
    style: {
      type: "select",
      label: "Style",
      options: ["solid", "double", "dotted", "dashed"],
    },
    weight: { type: "slider", label: "Weight" },
    gap: { type: "slider", label: "Gap" },
    width: { type: "slider", label: "Width" },
  },

  spacer: {
    space: {
      type: "slider",
      label: "Space",
      default: { size: 50, unit: "px" },
    },
  },

  icon: {
    icon: { type: "icons", label: "Icon" },
    view: {
      type: "select",
      label: "View",
      options: ["default", "stacked", "framed"],
    },
    shape: { type: "select", label: "Shape", options: ["circle", "square"] },
    link: { type: "url", label: "Link" },
  },

  "icon-box": {
    icon: { type: "icons", label: "Icon" },
    view: {
      type: "select",
      label: "View",
      options: ["default", "stacked", "framed"],
    },
    title_text: {
      type: "text",
      label: "Title & Description",
      default: "This is the heading",
    },
    description_text: {
      type: "textarea",
      label: "Description",
      default: "Lorem ipsum dolor sit amet.",
    },
    position: {
      type: "choose",
      label: "Icon Position",
      options: ["left", "top", "right"],
    },
    title_size: {
      type: "select",
      label: "Title HTML Tag",
      options: ["h1", "h2", "h3", "h4", "h5", "h6"],
    },
  },

  "image-box": {
    image: { type: "media", label: "Choose Image" },
    title_text: {
      type: "text",
      label: "Title & Description",
      default: "This is the heading",
    },
    description_text: {
      type: "textarea",
      label: "Description",
      default: "Lorem ipsum dolor sit amet.",
    },
    position: {
      type: "choose",
      label: "Image Position",
      options: ["left", "top", "right"],
    },
    image_size: { type: "select", label: "Image Size" },
  },

  "icon-list": {
    items: {
      type: "repeater",
      label: "Items",
      fields: {
        text: { type: "text" },
        icon: { type: "icons" },
        link: { type: "url" },
      },
    },
    view: { type: "select", label: "Layout", options: ["default", "inline"] },
  },

  counter: {
    starting_number: { type: "number", label: "Starting Number", default: 0 },
    ending_number: { type: "number", label: "Ending Number", default: 100 },
    prefix: { type: "text", label: "Number Prefix" },
    suffix: { type: "text", label: "Number Suffix" },
    duration: { type: "number", label: "Animation Duration", default: 2000 },
    title: { type: "text", label: "Title", default: "Cool Number" },
  },

  progress: {
    title: { type: "text", label: "Title", default: "My Skill" },
    percent: { type: "slider", label: "Percentage", default: { size: 50 } },
    display_percentage: {
      type: "switcher",
      label: "Display Percentage",
      default: "yes",
    },
    inner_text: { type: "text", label: "Inner Text" },
  },

  testimonial: {
    testimonial_content: { type: "textarea", label: "Content" },
    testimonial_image: { type: "media", label: "Choose Image" },
    testimonial_name: { type: "text", label: "Name" },
    testimonial_job: { type: "text", label: "Job" },
    testimonial_image_position: {
      type: "select",
      label: "Image Position",
      options: ["aside", "top"],
    },
    alignment: {
      type: "choose",
      label: "Alignment",
      options: ["left", "center", "right"],
    },
  },

  alert: {
    alert_type: {
      type: "select",
      label: "Type",
      options: ["info", "success", "warning", "danger"],
    },
    alert_title: { type: "text", label: "Title", default: "This is an Alert" },
    alert_description: { type: "textarea", label: "Description" },
    show_close: { type: "switcher", label: "Dismiss Button", default: "yes" },
  },

  "star-rating": {
    rating: { type: "number", label: "Rating", default: 5 },
    rating_scale: {
      type: "select",
      label: "Rating Scale",
      options: ["5", "10"],
    },
    title: { type: "text", label: "Title" },
    alignment: {
      type: "choose",
      label: "Alignment",
      options: ["left", "center", "right"],
    },
  },

  "social-icons": {
    social_icon_list: {
      type: "repeater",
      label: "Social Icons",
      fields: {
        social: { type: "icon" },
        link: { type: "url" },
      },
    },
    shape: {
      type: "select",
      label: "Shape",
      options: ["rounded", "square", "circle"],
    },
    align: {
      type: "choose",
      label: "Alignment",
      options: ["left", "center", "right"],
    },
  },

  accordion: {
    tabs: {
      type: "repeater",
      label: "Accordion Items",
      fields: {
        tab_title: { type: "text" },
        tab_content: { type: "wysiwyg" },
      },
    },
    icon: { type: "icons" },
    active_icon: { type: "icons" },
  },
};

export const getWidgetNames = () => {
  return Object.keys(WIDGET_DESCRIPTIONS);
};

export const getWidgetInfo = (mode = "names", widgetNames = []) => {
  if (mode === "names") {
    return Object.entries(WIDGET_DESCRIPTIONS).map(([name, desc]) => ({
      name,
      description: desc,
    }));
  }

  if (mode === "selective" && widgetNames.length > 0) {
    const selected = {};
    widgetNames.forEach((name) => {
      selected[name] = {
        description: WIDGET_DESCRIPTIONS[name] || "Elementor widget",
        controls: WIDGET_UNIQUE_CONTROLS[name] || {}, // Fallback to empty if not defined
      };
    });
    return selected;
  }

  return {
    descriptions: WIDGET_DESCRIPTIONS,
    controls: WIDGET_UNIQUE_CONTROLS,
  };
};

export const extractWidgetNamesFromText = (text) => {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  const found = new Set();

  Object.keys(WIDGET_DESCRIPTIONS).forEach((widgetName) => {
    // Escape widget name for regex and check with word boundaries
    const escapedName = widgetName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
      `\\b${escapedName.replace("-", "[-\\s]")}\\b`,
      "gi",
    );

    if (regex.test(lowerText)) {
      found.add(widgetName);
    }
  });

  return Array.from(found);
};
