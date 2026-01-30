import type { StorybookConfig } from "@storybook/web-components-vite";
import { resolve } from "path";

const config: StorybookConfig = {
  stories: ["../**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
  ],
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },
  async viteFinal(config) {
    // Resolve workspace dependencies to their source files
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@rcs-lang/csm": resolve(__dirname, "../../../../csm/src"),
        "@rcs-lang/types": resolve(__dirname, "../../../../types/src"),
      };
    }
    return config;
  },
};

export default config;
