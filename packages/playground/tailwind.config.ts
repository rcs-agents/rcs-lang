import type { Config } from "tailwindcss";

/**
 * Tailwind CSS Configuration for @rcs-lang/playground
 *
 * Note: This file is kept for compatibility but most configuration
 * is done via CSS-first approach in Tailwind v4.
 *
 * Park UI theming is configured in:
 * - src/styles/park-ui-theme.css (generated design tokens)
 * - src/styles/index.css (@theme configuration)
 *
 * Configuration:
 * - Font: Inter
 * - Gray color: Sage
 * - Accent color: Teal
 * - Border radius: md
 */
export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class"],
} satisfies Config;
