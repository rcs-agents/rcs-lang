# @rcs-lang/compiler

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

- Updated dependencies [a3adcda]
  - @rcs-lang/types@2.0.1
  - @rcs-lang/core@2.0.1
  - @rcs-lang/csm@2.0.1
  - @rcs-lang/file-system@2.0.1
  - @rcs-lang/parser@2.0.1
  - @rcs-lang/validation@2.0.1
  - @rcs-lang/ast@2.0.1

## 2.0.0

### Minor Changes

- Add message extraction and improve compilation pipeline

  - Add `extractMessages()` function for extracting messages from compiled AST
  - Improve transform stage with better context operation handling
  - Enhance JavaScript generator output format
  - Update D2 and Mermaid diagram generators for improved visualizations

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @rcs-lang/ast@2.0.0
  - @rcs-lang/core@2.0.0
  - @rcs-lang/types@2.0.0
  - @rcs-lang/parser@2.0.0
  - @rcs-lang/validation@2.0.0
  - @rcs-lang/csm@2.0.0
  - @rcs-lang/file-system@2.0.0

## 1.0.0

### Minor Changes

- Add message extraction and improve compilation pipeline

  - Add `extractMessages()` function for extracting messages from compiled AST
  - Improve transform stage with better context operation handling
  - Enhance JavaScript generator output format
  - Update D2 and Mermaid diagram generators for improved visualizations

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @rcs-lang/ast@1.0.0
  - @rcs-lang/core@1.0.0
  - @rcs-lang/types@1.0.0
  - @rcs-lang/parser@1.0.0
  - @rcs-lang/validation@1.0.0
  - @rcs-lang/csm@1.0.0
  - @rcs-lang/file-system@1.0.0

## 0.5.2

### Patch Changes

- Fixing "workspace:\*" versions
- Updated dependencies
  - @rcs-lang/core@0.5.2
  - @rcs-lang/csm@0.5.2
  - @rcs-lang/file-system@0.5.2
  - @rcs-lang/validation@0.5.2

## 0.5.1

### Patch Changes

- Fixing broken dependencies
- Updated dependencies
  - @rcs-lang/core@0.5.1
  - @rcs-lang/csm@0.5.1
  - @rcs-lang/file-system@0.5.1
  - @rcs-lang/validation@0.5.1

## 0.5.0

### Minor Changes

- 14af18d: Fix broken dependencies

### Patch Changes

- Updated dependencies [14af18d]
  - @rcs-lang/file-system@0.5.0
  - @rcs-lang/core@0.5.0
  - @rcs-lang/csm@0.5.0
  - @rcs-lang/validation@0.5.0
