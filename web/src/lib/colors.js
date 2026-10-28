// Single source of truth for brand and chart colors used in inline styles and
// SVG attributes, where Tailwind's class tokens don't apply. Keep these in sync
// with the color tokens in tailwind.config.js.
export const BRAND = {
  primary: "#b7c4ff", // token: primary
  primaryContainer: "#6e8bff", // token: primary-container
  secondary: "#42e1b3", // token: secondary
  tertiary: "#ffb960", // token: tertiary
  errorCoral: "#FF6B7D", // token: error-coral
  accentLight: "#4F46E5", // token: accent-light
  secondaryContainer: "#00c599", // token: secondary-container
};

// Five-color line-chart palette shared by InteractiveChart, MultiLineChart and
// the Star Growth page legend.
export const CHART_PALETTE = [
  BRAND.primaryContainer,
  BRAND.secondary,
  BRAND.primary,
  BRAND.tertiary,
  BRAND.errorCoral,
];

// Seven-color palette for the topic donut. Each hue is distinct, so neighbouring
// segments never read as the same color.
export const TOPIC_PALETTE = [
  "#6e8bff", // blue
  "#42e1b3", // mint
  "#ffb960", // amber
  "#FF6B7D", // coral
  "#b7c4ff", // lavender
  "#a78bfa", // violet
  "#8e909f", // gray
];
