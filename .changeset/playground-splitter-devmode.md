---
"@rcs-lang/playground": minor
"@rcs-lang/simulator": patch
"@rcs-lang/compiler": patch
"@rcs-lang/types": patch
---

feat(playground): add resizable splitters and Dev Mode switch

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
