// Single source of truth for brand and chart colors used in inline styles and
// SVG attributes, where Tailwind's class tokens don't apply. Keep these in sync
// with the color tokens in tailwind.config.js.
export const BRAND = {
  primary: "#b7c4ff", // token: primary
  primaryContainer: "#6e8bff", // token: primary-container
  secondary: "#42e1b3", // token: secondary
  tertiary: "#ffb960", // token: tertiary
  errorCoral: "#FF6B7D", // token: error-coral
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

// Seven-color palette for the topic donut (more segments than the line charts).
export const TOPIC_PALETTE = [
  "#6e8bff",
  "#42e1b3",
  "#b7c4ff",
  "#00c599",
  "#3edeb1",
  "#8e909f",
  "#3554c6",
];
