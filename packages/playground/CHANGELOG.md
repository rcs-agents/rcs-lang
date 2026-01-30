# @rcs-lang/playground

## 0.3.0

### Minor Changes

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

## 0.2.0

### Minor Changes

- Major playground refactor with improved panel architecture

  - Add new AgentPanel for displaying agent configuration
  - Add new MessagesPanel for viewing extracted messages
  - Add DiagnosticsPanel component for compiler diagnostics
  - Add CodeViewer component for syntax-highlighted code display
  - Remove DiagramPanel (diagram visualization moved elsewhere)
  - Improve SimulatorPanel integration with new compilation output
  - Update compilation pipeline to use new AgentBundle format
  - Refresh example code samples
  - Enhanced CSS styling for better panel layouts

## 0.1.0

### Minor Changes

- Major playground refactor with improved panel architecture

  - Add new AgentPanel for displaying agent configuration
  - Add new MessagesPanel for viewing extracted messages
  - Add DiagnosticsPanel component for compiler diagnostics
  - Add CodeViewer component for syntax-highlighted code display
  - Remove DiagramPanel (diagram visualization moved elsewhere)
  - Improve SimulatorPanel integration with new compilation output
  - Update compilation pipeline to use new AgentBundle format
  - Refresh example code samples
  - Enhanced CSS styling for better panel layouts
