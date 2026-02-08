export const COMMON_CONTROLS = {
  advanced: {
    _element_id: { type: "text", label: "CSS ID" },
    _css_classes: { type: "text", label: "CSS Classes" },
    _margin: { type: "dimensions", label: "Margin" },
    _padding: { type: "dimensions", label: "Padding" },
    _z_index: { type: "number", label: "Z-Index" },
    _element_width: { type: "select", label: "Width" },
    _position: { type: "select", label: "Position" },
    hide_desktop: { type: "switcher", label: "Hide On Desktop" },
    hide_tablet: { type: "switcher", label: "Hide On Tablet" },
    hide_mobile: { type: "switcher", label: "Hide On Mobile" },
    _animation: { type: "select", label: "Entrance Animation" },
    animation_duration: { type: "select", label: "Animation Duration" },
    _transform_rotate_popover: { type: "popover", label: "Rotate" },
    _transform_scale_popover: { type: "popover", label: "Scale" },
    _transform_translate_popover: { type: "popover", label: "Translate" },
  },

  style_typography: {
    typography_typography: { type: "select", label: "Typography" },
    typography_font_family: { type: "font", label: "Font Family" },
    typography_font_size: { type: "slider", label: "Size" },
    typography_font_weight: { type: "select", label: "Weight" },
    typography_text_transform: { type: "select", label: "Transform" },
    typography_font_style: { type: "select", label: "Style" },
    typography_text_decoration: { type: "select", label: "Decoration" },
    typography_line_height: { type: "slider", label: "Line Height" },
    typography_letter_spacing: { type: "slider", label: "Letter Spacing" },
    typography_word_spacing: { type: "slider", label: "Word Spacing" },
  },

  style_colors: {
    text_color: { type: "color", label: "Text Color" },
    background_color: { type: "color", label: "Background Color" },
    border_color: { type: "color", label: "Border Color" },
  },

  style_background: {
    background_background: { type: "choose", label: "Background Type" },
    background_color: { type: "color", label: "Color" },
    background_image: { type: "media", label: "Image" },
    background_position: { type: "select", label: "Position" },
    background_size: { type: "select", label: "Size" },
    background_repeat: { type: "select", label: "Repeat" },
    background_gradient_type: { type: "select", label: "Type" },
    background_gradient_angle: { type: "slider", label: "Angle" },
  },

  style_border: {
    border_border: { type: "select", label: "Border Type" },
    border_width: { type: "dimensions", label: "Width" },
    border_color: { type: "color", label: "Color" },
    border_radius: { type: "dimensions", label: "Border Radius" },
    box_shadow_box_shadow_type: { type: "select", label: "Box Shadow" },
    box_shadow_box_shadow: { type: "box_shadow", label: "Box Shadow" },
  },

  style_spacing: {
    margin: { type: "dimensions", label: "Margin" },
    padding: { type: "dimensions", label: "Padding" },
  },
};

export const getCommonControlsSchema = () => {
  return {
    description: "Common controls available to all Elementor widgets",
    tabs: {
      advanced:
        "CSS ID, classes, positioning, responsive visibility, animations",
      style: "Typography, colors, backgrounds, borders, spacing",
    },
    controls: COMMON_CONTROLS,
  };
};
