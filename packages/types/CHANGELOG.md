# @rcs-lang/types

## 2.0.1

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

## 2.0.0

### Minor Changes

- Add AgentBundle type for runtime agent configuration

  New `AgentBundle` interface provides a standardized format for agent runtime data:

  - `agent`: RCS Business Messaging agent configuration
  - `messages`: Indexed message collection with ID-based lookups

## 1.0.0

### Minor Changes

- Add AgentBundle type for runtime agent configuration

  New `AgentBundle` interface provides a standardized format for agent runtime data:

  - `agent`: RCS Business Messaging agent configuration
  - `messages`: Indexed message collection with ID-based lookups

## 0.5.2

### Patch Changes

- Fixing "workspace:\*" versions

## 0.5.1

### Patch Changes

- Fixing broken dependencies

## 0.5.0
