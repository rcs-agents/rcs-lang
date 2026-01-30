/**
 * Generate Park UI theme CSS file
 *
 * Configuration:
 * - Font: Inter
 * - Gray color: Sage
 * - Accent color: Teal
 * - Border radius: md
 */

const fs = require('fs');
const path = require('path');

const pluginPath = path.join(__dirname, '../node_modules/@park-ui/tailwind-plugin/dist/index.mjs');
const content = fs.readFileSync(pluginPath, 'utf-8');

// Configuration
const config = {
  accentColor: 'teal',
  grayColor: 'sage',
  borderRadius: 'md'
};

// Extract all color definitions
function extractColorVars(colorName) {
  const vars = { light: {}, dark: {} };
  const lightRegex = new RegExp(`"--colors-${colorName}-light-(\\d+|a\\d+)":\\s*"([^"]+)"`, 'g');
  const darkRegex = new RegExp(`"--colors-${colorName}-dark-(\\d+|a\\d+)":\\s*"([^"]+)"`, 'g');

  let match;
  while ((match = lightRegex.exec(content)) !== null) {
    vars.light[match[1]] = match[2];
  }
  while ((match = darkRegex.exec(content)) !== null) {
    vars.dark[match[1]] = match[2];
  }
  return vars;
}

const grayColors = extractColorVars(config.grayColor);
const accentColors = extractColorVars(config.accentColor);

// Radius mapping based on borderRadius setting
const radiusMap = {
  none: { l1: '0', l2: '0', l3: '0' },
  xs: { l1: '0.0625rem', l2: '0.125rem', l3: '0.25rem' },
  sm: { l1: '0.125rem', l2: '0.25rem', l3: '0.375rem' },
  md: { l1: '0.25rem', l2: '0.375rem', l3: '0.5rem' },
  lg: { l1: '0.375rem', l2: '0.5rem', l3: '0.75rem' },
  xl: { l1: '0.5rem', l2: '0.75rem', l3: '1rem' },
  '2xl': { l1: '0.75rem', l2: '1rem', l3: '1.5rem' }
};

const radii = radiusMap[config.borderRadius];

// Generate CSS
let css = `/**
 * Park UI Theme Configuration (Generated)
 *
 * Configuration:
 * - Font: Inter
 * - Gray color: ${config.grayColor}
 * - Accent color: ${config.accentColor}
 * - Border radius: ${config.borderRadius}
 *
 * This file is auto-generated. Do not edit directly.
 * Regenerate with: node scripts/generate-park-ui-theme.js
 */

/* ============================================
 * Color Palette - ${config.grayColor} (gray)
 * ============================================ */
:root {
`;

// Add gray color palette (light mode)
for (let i = 1; i <= 12; i++) {
  css += `  --colors-${config.grayColor}-${i}: ${grayColors.light[i]};\n`;
}
for (let i = 1; i <= 12; i++) {
  css += `  --colors-${config.grayColor}-a${i}: ${grayColors.light['a' + i]};\n`;
}

css += `
  /* Gray semantic mapping (light mode) */
`;
for (let i = 1; i <= 12; i++) {
  css += `  --colors-gray-${i}: var(--colors-${config.grayColor}-${i});\n`;
}
for (let i = 1; i <= 12; i++) {
  css += `  --colors-gray-a${i}: var(--colors-${config.grayColor}-a${i});\n`;
}

css += `
/* ============================================
 * Color Palette - ${config.accentColor} (accent)
 * ============================================ */
`;
for (let i = 1; i <= 12; i++) {
  css += `  --colors-${config.accentColor}-${i}: ${accentColors.light[i]};\n`;
}
for (let i = 1; i <= 12; i++) {
  css += `  --colors-${config.accentColor}-a${i}: ${accentColors.light['a' + i]};\n`;
}

css += `
  /* Accent semantic mapping (light mode) */
`;
for (let i = 1; i <= 12; i++) {
  css += `  --colors-accent-${i}: var(--colors-${config.accentColor}-${i});\n`;
}
for (let i = 1; i <= 12; i++) {
  css += `  --colors-accent-a${i}: var(--colors-${config.accentColor}-a${i});\n`;
}

css += `
/* ============================================
 * Semantic Colors (light mode)
 * ============================================ */
  --colors-bg-canvas: var(--colors-gray-1);
  --colors-bg-default: white;
  --colors-bg-subtle: var(--colors-gray-2);
  --colors-bg-muted: var(--colors-gray-3);
  --colors-bg-emphasized: var(--colors-gray-4);
  --colors-bg-disabled: var(--colors-gray-3);

  --colors-fg-default: var(--colors-gray-12);
  --colors-fg-muted: var(--colors-gray-11);
  --colors-fg-subtle: var(--colors-gray-10);
  --colors-fg-disabled: var(--colors-gray-7);

  --colors-accent-default: var(--colors-accent-9);
  --colors-accent-emphasized: var(--colors-accent-10);
  --colors-accent-fg: white;
  --colors-accent-text: var(--colors-accent-a11);

  --colors-border-default: var(--colors-gray-7);
  --colors-border-muted: var(--colors-gray-6);
  --colors-border-subtle: var(--colors-gray-4);
  --colors-border-disabled: var(--colors-gray-5);
  --colors-border-outline: var(--colors-gray-a9);

/* ============================================
 * Border Radius (${config.borderRadius})
 * ============================================ */
  --radii-l1: ${radii.l1};
  --radii-l2: ${radii.l2};
  --radii-l3: ${radii.l3};
  --radii-none: 0;
  --radii-2xs: 0.0625rem;
  --radii-xs: 0.125rem;
  --radii-sm: 0.25rem;
  --radii-md: 0.375rem;
  --radii-lg: 0.5rem;
  --radii-xl: 0.75rem;
  --radii-2xl: 1rem;
  --radii-3xl: 1.5rem;
  --radii-full: 9999px;

/* ============================================
 * Typography - Inter Font
 * ============================================ */
  --font-body: "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-heading: "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
}

/* ============================================
 * Dark Mode
 * ============================================ */
.dark, [data-theme="dark"] {
  color-scheme: dark;
`;

// Dark mode gray colors
for (let i = 1; i <= 12; i++) {
  css += `  --colors-${config.grayColor}-${i}: ${grayColors.dark[i]};\n`;
}
for (let i = 1; i <= 12; i++) {
  css += `  --colors-${config.grayColor}-a${i}: ${grayColors.dark['a' + i]};\n`;
}

// Dark mode accent colors
css += `\n`;
for (let i = 1; i <= 12; i++) {
  css += `  --colors-${config.accentColor}-${i}: ${accentColors.dark[i]};\n`;
}
for (let i = 1; i <= 12; i++) {
  css += `  --colors-${config.accentColor}-a${i}: ${accentColors.dark['a' + i]};\n`;
}

css += `
  /* Dark mode semantic overrides */
  --colors-bg-default: var(--colors-gray-2);
  --colors-accent-fg: var(--colors-gray-1);
}
`;

// Write to file
const outputPath = path.join(__dirname, '../src/styles/park-ui-theme.css');
fs.writeFileSync(outputPath, css);
console.log('Generated:', outputPath);
