# RCL Professional Features Implementation Plan

## Overview

This document outlines the detailed implementation plan for adding professional language service and interactive diagram features to the RCL VSCode extension. The plan is organized into phases with specific tasks, technical details, and success criteria.

## Implementation Phases

### Phase 1: Critical Language Service Features (Days 1-5)

#### 1.1 Rename/Refactoring Support (Day 1-2)

**Files to modify:**
- `apps/extension/server/src/features/rename.ts` (new)
- `apps/extension/server/src/server.ts`
- `packages/language-service/src/providers/RenameProvider.ts` (new)

**Implementation steps:**
1. Create RenameProvider in language-service:
   ```typescript
   export class RenameProvider {
     async prepareRename(document: TextDocument, position: Position): Promise<Range | null>
     async provideRenameEdits(document: TextDocument, position: Position, newName: string): Promise<WorkspaceEdit>
   }
   ```

2. Implement symbol validation:
   - Check if symbol can be renamed (not keywords)
   - Validate new name (valid identifier)
   - Return range of renameable symbol

3. Implement workspace-wide rename:
   - Find all references using existing ReferencesProvider
   - Create WorkspaceEdit with all changes
   - Handle imports and exports
   - Update flow state references
   - Update message references

4. Add LSP handlers in server.ts:
   ```typescript
   connection.onPrepareRename(handler)
   connection.onRenameRequest(handler)
   ```

**Success criteria:**
- F2 on any symbol shows rename box
- Renaming updates all references across files
- Preview shows all affected locations
- Undo works correctly

#### 1.2 Code Actions & Quick Fixes (Day 2-3)

**Files to modify:**
- `apps/extension/server/src/features/codeActions.ts` (new)
- `packages/language-service/src/providers/CodeActionProvider.ts` (new)
- `packages/language-service/src/actions/` (new directory)

**Implementation steps:**
1. Create CodeActionProvider framework:
   ```typescript
   export class CodeActionProvider {
     async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext): Promise<CodeAction[]>
   }
   ```

2. Implement specific quick fixes:
   - **ImportMissingSymbol**: Add import for unresolved reference
   - **CreateMissingMessage**: Generate message definition
   - **FixInvalidTransition**: Correct transition target
   - **ConvertToRichCard**: Transform text to rich card
   - **ExtractMessage**: Move inline message to Messages section
   - **AddMissingFlowState**: Create referenced but missing state
   - **FixInvalidPropertyValue**: Correct property types/values

3. Context-aware action generation:
   - Analyze diagnostics in range
   - Check AST context
   - Generate appropriate fixes

4. Multi-file edit support:
   - Create WorkspaceEdit for complex changes
   - Handle file creation for new messages

**Success criteria:**
- Lightbulb appears on errors/warnings
- Quick fixes resolve issues correctly
- Multi-file edits work properly
- Actions are context-appropriate

#### 1.3 Signature Help (Day 4-5)

**Files to modify:**
- `apps/extension/server/src/features/signatureHelp.ts` (new)
- `packages/language-service/src/providers/SignatureHelpProvider.ts` (new)

**Implementation steps:**
1. Create SignatureHelpProvider:
   ```typescript
   export class SignatureHelpProvider {
     async provideSignatureHelp(document: TextDocument, position: Position): Promise<SignatureHelp | null>
   }
   ```

2. Implement trigger detection:
   - Track when inside property lists
   - Detect message/card property contexts
   - Monitor suggestion parameters

3. Generate signature information:
   - Property names and types
   - Required vs optional indicators
   - Documentation strings
   - Example values

4. Context-specific signatures:
   - Message properties (text, suggestions)
   - Rich card properties (title, description, media)
   - Flow properties (timeout, enabled)
   - Transition properties (when conditions)

**Success criteria:**
- Popup appears when typing properties
- Shows all available properties
- Indicates current parameter
- Includes helpful documentation

### Phase 2: Enhanced Interactive Diagram (Days 6-10)

#### 2.1 Cursor Synchronization (Day 6-7)

**Files to modify:**
- `apps/extension/client/src/extension.ts`
- `apps/extension/client/src/interactiveDiagramProvider.ts`
- `apps/extension/client/resources/interactive-diagram.js`

**Implementation steps:**
1. Editor → Diagram sync:
   ```typescript
   // Track cursor position changes
   vscode.window.onDidChangeTextEditorSelection(async (e) => {
     const position = e.selections[0].active;
     const node = await findNodeAtPosition(document, position);
     if (node) {
       diagramProvider.highlightNode(node.id);
     }
   });
   ```

2. Diagram → Editor sync:
   ```javascript
   // In interactive-diagram.js
   function selectNode(nodeId) {
     // Send selection to extension
     vscode.postMessage({
       type: 'nodeSelected',
       data: { nodeId }
     });
   }
   ```

3. Position mapping:
   - Parse AST with position information
   - Map nodes to text ranges
   - Handle nested structures

4. Visual feedback:
   - Highlight synchronized elements
   - Smooth scrolling
   - Clear indicators

**Success criteria:**
- Cursor in flow highlights diagram node
- Clicking node jumps to code
- Smooth bidirectional sync
- No lag or flicker

#### 2.2 Advanced Property Editing Sidebar (Day 7-8)

**Files to modify:**
- `apps/extension/client/resources/interactive-diagram.js`
- `apps/extension/client/resources/interactive-diagram.css`
- `apps/extension/client/src/interactiveDiagramProvider.ts`

**Implementation steps:**
1. Enhanced property panel UI:
   ```javascript
   function createPropertyEditor(node) {
     const editor = {
       // Message properties
       text: createTextArea('Message Text', node.data?.messageData?.text),
       suggestions: createSuggestionList(node.data?.messageData?.suggestions),
       
       // Rich card builder
       richCard: createRichCardBuilder(node.data?.messageData?.richCard),
       
       // Validation
       validator: createPropertyValidator(node.type)
     };
     return editor;
   }
   ```

2. Rich card builder:
   - Title/description fields
   - Media upload/URL
   - Height selector
   - Button configuration
   - Live preview

3. Suggestion editor:
   - Add/remove suggestions
   - Reply vs URL actions
   - Postback data configuration
   - Drag to reorder

4. Real-time validation:
   - Property type checking
   - Required field validation
   - Error messages
   - Warning indicators

**Success criteria:**
- Professional property forms
- Rich card visual builder
- Live validation feedback
- Intuitive UX

#### 2.3 Enhanced WYSIWYG Features (Day 9-10)

**Files to modify:**
- `apps/extension/client/resources/interactive-diagram.js`
- `apps/extension/client/resources/sprotty-config.js` (new)

**Implementation steps:**
1. Professional layouts:
   ```javascript
   const layoutEngines = {
     hierarchical: new HierarchicalLayout(),
     force: new ForceDirectedLayout(),
     circular: new CircularLayout(),
     grid: new GridLayout()
   };
   ```

2. Advanced selection:
   - Marquee selection tool
   - Multi-select with Ctrl/Cmd
   - Selection groups
   - Copy/paste support

3. Alignment tools:
   - Snap to grid
   - Alignment guides
   - Distribute evenly
   - Align to edges

4. Node templates:
   - Common patterns
   - Custom templates
   - Quick insert menu

**Success criteria:**
- Multiple layout options
- Professional selection tools
- Precise alignment
- Efficient editing

### Phase 3: Professional Features (Days 11-15)

#### 3.1 Code Lens Implementation (Day 11)

**Files to modify:**
- `apps/extension/server/src/features/codeLens.ts` (new)
- `packages/language-service/src/providers/CodeLensProvider.ts` (new)

**Implementation steps:**
1. Create CodeLensProvider:
   ```typescript
   export class CodeLensProvider {
     async provideCodeLenses(document: TextDocument): Promise<CodeLens[]>
     async resolveCodeLens(codeLens: CodeLens): Promise<CodeLens>
   }
   ```

2. Implement reference counting:
   - Count references for flows/messages
   - Cache results for performance
   - Update on file changes

3. Add action commands:
   - "N references" with click to find all
   - "View in diagram" for flows
   - "Run flow" for executable flows
   - "Debug flow" with breakpoints

**Success criteria:**
- Reference counts above symbols
- Clickable actions work
- Performance is good
- Updates automatically

#### 3.2 Workspace Symbols (Day 12)

**Files to modify:**
- `apps/extension/server/src/features/workspaceSymbols.ts` (new)
- `packages/language-service/src/providers/WorkspaceSymbolProvider.ts` (new)

**Implementation steps:**
1. Create symbol indexer:
   ```typescript
   export class WorkspaceSymbolProvider {
     async provideWorkspaceSymbols(query: string): Promise<SymbolInformation[]>
     private indexWorkspace(): void
     private fuzzyMatch(query: string, symbol: string): number
   }
   ```

2. Efficient indexing:
   - Background indexing
   - Incremental updates
   - Persist index

3. Fuzzy search:
   - Score-based matching
   - Acronym support
   - Recent items boost

**Success criteria:**
- Ctrl+T opens symbol search
- Fast fuzzy matching
- All symbols included
- Good ranking

#### 3.3 Semantic Tokens (Day 13)

**Files to modify:**
- `apps/extension/server/src/features/semanticTokens.ts`
- `packages/language-service/src/providers/SemanticTokenProvider.ts` (new)

**Implementation steps:**
1. Complete implementation:
   ```typescript
   export class SemanticTokenProvider {
     async provideDocumentSemanticTokens(document: TextDocument): Promise<SemanticTokens>
     async provideDocumentSemanticTokensEdits(document: TextDocument, previousResultId: string): Promise<SemanticTokens | SemanticTokensEdits>
   }
   ```

2. Token types:
   - Flow names
   - Message identifiers
   - Property names
   - Keywords vs identifiers
   - String types (URL, text)

3. Token modifiers:
   - Declaration vs reference
   - Readonly properties
   - Deprecated items

**Success criteria:**
- Enhanced highlighting
- Semantic coloring
- Fast updates
- Theme support

#### 3.4 Diagram Undo/Redo (Day 14-15)

**Files to modify:**
- `apps/extension/client/resources/interactive-diagram.js`
- `apps/extension/client/src/diagramHistory.ts` (new)

**Implementation steps:**
1. Command pattern implementation:
   ```typescript
   interface DiagramCommand {
     execute(): void;
     undo(): void;
     redo(): void;
   }
   
   class DiagramHistory {
     private undoStack: DiagramCommand[] = [];
     private redoStack: DiagramCommand[] = [];
     
     execute(command: DiagramCommand): void
     undo(): void
     redo(): void
   }
   ```

2. Command types:
   - AddNodeCommand
   - DeleteNodeCommand
   - MoveNodeCommand
   - AddEdgeCommand
   - DeleteEdgeCommand
   - UpdatePropertiesCommand

3. State management:
   - Snapshot before changes
   - Efficient diff storage
   - Memory limits

4. UI integration:
   - Toolbar buttons
   - Keyboard shortcuts
   - Visual feedback

**Success criteria:**
- All operations undoable
- Multiple undo/redo levels
- Grouped operations
- Persistent across sessions

### Phase 4: Advanced Features (Days 16-20)

#### 4.1 Document Links (Day 16)

**Implementation:**
- Make import paths clickable
- URL detection in strings
- Navigate to imported files

#### 4.2 Advanced Layouts (Day 17-18)

**Implementation:**
- Integrate ELK (Eclipse Layout Kernel)
- Sugiyama hierarchical layout
- Force-directed physics
- Custom layout constraints

#### 4.3 Export Capabilities (Day 19)

**Implementation:**
- SVG export with styles
- PNG rendering
- PDF generation
- Integration with external tools

#### 4.4 Remaining Features (Day 20)

**Implementation:**
- Call hierarchy
- Inlay hints
- Performance optimization
- Final testing

## Testing Strategy

### Unit Tests
- Test each provider in isolation
- Mock LSP protocol
- Test edge cases

### Integration Tests
- Full language server tests
- Diagram interaction tests
- Multi-file scenarios

### Performance Tests
- Large file handling
- Many files in workspace
- Rapid editing scenarios

### User Acceptance Tests
- Developer workflows
- Common tasks
- Error scenarios

## Rollout Plan

1. **Alpha Release** (Internal testing)
   - All features implemented
   - Known issues documented
   - Performance baseline

2. **Beta Release** (Limited users)
   - Bug fixes from alpha
   - Performance improvements
   - Documentation complete

3. **General Release**
   - All tests passing
   - Documentation published
   - Migration guide ready

## Success Metrics

1. **Feature Coverage**
   - 100% critical features
   - 80% professional features
   - 60% advanced features

2. **Performance**
   - < 100ms response time
   - < 1s for workspace operations
   - Smooth diagram interactions

3. **Quality**
   - < 5 bugs per feature
   - 90% test coverage
   - Positive user feedback

## Risk Mitigation

1. **Performance Issues**
   - Profile early and often
   - Implement caching
   - Use web workers

2. **Complexity**
   - Incremental implementation
   - Feature flags
   - Fallback mechanisms

3. **Breaking Changes**
   - Maintain compatibility
   - Version detection
   - Graceful degradation

## Conclusion

This implementation plan provides a structured approach to adding professional features to the RCL extension. By following this plan, we can systematically enhance the extension while maintaining quality and performance. The phased approach allows for early feedback and continuous improvement throughout the development process.