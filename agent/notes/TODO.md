# RCL Tree-Sitter TODO List

## High Priority

### Parser Issues
- [ ] **Fix message extraction** - only first message in messages section is being extracted
  - Status: `pending`
  - Priority: `high`
  - ID: `fix-message-extraction`

- [ ] **Fix flow parsing** - transitions are being parsed as state names
  - Status: `pending`
  - Priority: `high`
  - ID: `fix-flow-parsing`

## Medium Priority

### Interactive Diagrams
- [ ] **Implement Sprotty interactive diagram - Phase 3.3**: Interactive editing (drag & drop, connections)
  - Status: `pending`
  - Priority: `medium`
  - ID: `sprotty-phase-3.3`

- [ ] **Implement Sprotty interactive diagram - Phase 3.4**: Bi-directional sync
  - Status: `pending`
  - Priority: `medium`
  - ID: `sprotty-phase-3.4`

## Low Priority

### Technical Debt
- [ ] **Fix Node.js binding nodeTypeNamesById issue**
  - Status: `pending`
  - Priority: `low`
  - ID: `fix-node-bindings`

- [ ] **Run all monorepo tests to confirm everything works**
  - Status: `pending`
  - Priority: `low`
  - ID: `run-all-tests`

### Language Service Features
- [ ] **Implement import resolution and workspace indexing**
  - Status: `pending`
  - Priority: `low`
  - ID: `import-resolution`

- [ ] **Add context-aware completion for language service**
  - Status: `pending`
  - Priority: `low`
  - ID: `context-completion`

---

## Completed Tasks

- [x] **Debug and fix the indentation scanner for RCL grammar** - handle flow clauses with -> and indented blocks
  - Status: `completed`
  - Priority: `high`
  - ID: `fix-indentation-scanner`

- [x] **Fix parser indentation handling** - scanner not emitting INDENT/DEDENT tokens correctly
  - Status: `completed`
  - Priority: `high`
  - ID: `fix-parser-indentation`

- [x] **Fix empty messages dictionary in JSON output for realistic.rcl**
  - Status: `completed`
  - Priority: `high`
  - ID: `fix-empty-messages`

- [x] **Review and test JavaScript code generation for correctness**
  - Status: `completed`
  - Priority: `high`
  - ID: `review-js-codegen`

- [x] **Implement Sprotty interactive diagram - Phase 3.2**: RCL model integration
  - Status: `completed`
  - Priority: `high`
  - ID: `sprotty-phase-3.2`

- [x] **Remove embedded code support from grammar to simplify parser**
  - Status: `completed`
  - Priority: `high`
  - ID: `remove-embedded-code`

- [x] **Clean up unnecessary files in parser package**
  - Status: `completed`
  - Priority: `high`
  - ID: `cleanup-parser-files`

- [x] **Fix parser not recognizing agent definition structure** - external scanner not emitting tokens
  - Status: `completed`
  - Priority: `high`
  - ID: `fix-agent-definition`

## Notes

### Current Parser Status
The parser now recognizes basic agent definitions but still has issues with properly parsing indented blocks. The external scanner is working (producing _newline, _indent, _dedent tokens) but there are integration issues with the grammar rules. We've added proper newline handling to many rules following Python's grammar pattern, but more work is needed to fully resolve the indentation parsing issues.

### Key Findings
1. External scanner is functional and produces correct tokens
2. Grammar rules need consistent newline enforcement
3. Following tree-sitter conventions: all generated files should be in `src/` directory
4. The issue appears to be with how the grammar consumes the external tokens rather than with the scanner itself

### Indentation Issues Summary
- The external scanner correctly produces NEWLINE, INDENT, and DEDENT tokens
- The grammar has been updated to include newlines in appropriate places
- However, there's still a fundamental issue with how tree-sitter integrates these tokens
- Python's grammar separates indent handling from content rules, which RCL should adopt
- Consider creating a general `indented_block` rule similar to Python's approach