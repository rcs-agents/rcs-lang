/**
 * Type definitions for the RCL Playground component
 */

/**
 * Theme configuration for the playground
 */
export type PlaygroundTheme = "light" | "dark" | "system";

/**
 * Props for the Playground component
 */
export interface PlaygroundProps {
  /**
   * Initial RCL code to display in the editor
   * @default ""
   */
  initialCode?: string;

  /**
   * Theme for the playground UI
   * @default "system"
   */
  theme?: PlaygroundTheme;

  /**
   * Height of the playground container
   * @default "600px"
   */
  height?: string | number;

  /**
   * Width of the playground container
   * @default "100%"
   */
  width?: string | number;

  /**
   * Whether to show the diagram panel
   * @default true
   */
  showDiagram?: boolean;

  /**
   * Whether to show the simulator panel
   * @default true
   */
  showSimulator?: boolean;

  /**
   * Whether to enable URL state persistence
   * @default true
   */
  enableUrlState?: boolean;

  /**
   * Callback when the code changes
   */
  onCodeChange?: (code: string) => void;

  /**
   * Callback when compilation completes
   */
  onCompile?: (result: {
    success: boolean;
    errors?: string[];
    warnings?: string[];
  }) => void;

  /**
   * Custom CSS class name for the container
   */
  className?: string;
}
