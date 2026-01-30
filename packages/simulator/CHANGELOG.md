# @rcs-lang/simulator

## 0.2.1

### Patch Changes

- a3adcda: feat(playground): add resizable splitters and Dev Mode switch

  - Add Park UI Splitter component between editor and output panes for resizable layout
  - Add Splitter between simulator and Simulator Data panel when Dev Mode is enabled
  - Replace "Show Dev Tools" button with a "Dev Mode" Switch component in the toolbar
  - Install and configure @microlink/react-json-view for interactive JSON viewing in Simulator Data panel
  - Fix simulator centering bug when Dev Mode is disabled
  - Update CSS styles for splitter triggers and switch component

  feat(simulator): fix device frame rendering

  - Fix device frame component exports and rendering issues

  fix(compiler): ensure message text extraction works correctly

  - Fix transform stage to properly extract message text content

  fix(types): add UserMessage type export

  - Export UserMessage type for simulator interactions

- Updated dependencies [a3adcda]
  - @rcs-lang/types@2.0.1
  - @rcs-lang/rcx@0.2.2
  - @rcs-lang/csm@2.0.1

## 0.2.0

### Minor Changes

- Add message resolution system and preview controls

  - Add `MessageResolver` for resolving message references from AgentBundle
  - Add `resolveMessageContent()` utility for content resolution
  - New `PreviewControls` React component for preview mode navigation
  - Enhance `SimulatorEngine` with improved state management
  - Enhance `SimulatorService` with bundle-based message resolution
  - Add comprehensive tests for message resolution logic
  - Export new types and components from React entry point

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @rcs-lang/rcx@0.2.1
  - @rcs-lang/types@2.0.0
  - @rcs-lang/csm@2.0.0

## 0.1.0

### Minor Changes

- ef14a79: Add @rcs-lang/simulator package - RCS Simulator for visualizing and testing RCS agents
- Add message resolution system and preview controls

  - Add `MessageResolver` for resolving message references from AgentBundle
  - Add `resolveMessageContent()` utility for content resolution
  - New `PreviewControls` React component for preview mode navigation
  - Enhance `SimulatorEngine` with improved state management
  - Enhance `SimulatorService` with bundle-based message resolution
  - Add comprehensive tests for message resolution logic
  - Export new types and components from React entry point

### Patch Changes

- Updated dependencies [ef14a79]
- Updated dependencies
- Updated dependencies
  - @rcs-lang/rcx@0.2.0
  - @rcs-lang/types@1.0.0
  - @rcs-lang/csm@1.0.0
