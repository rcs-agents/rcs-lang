import type Parser from 'tree-sitter';
import type { Location, TextEdit, WorkspaceEdit } from 'vscode-languageserver';
import type { Position, Range, TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import type { ImportResolver } from '../import-resolver/index.js';
import type { WorkspaceIndex } from '../workspace-index/index.js';
import type { DefinitionProvider } from './DefinitionProvider.js';
import type { ReferencesProvider } from './ReferencesProvider.js';

export interface RenameResult {
  range: Range | null;
  placeholder: string;
}

export class RenameProvider {
  constructor(
    private parser: Parser,
    private workspaceIndex: WorkspaceIndex,
    private importResolver: ImportResolver,
    private referencesProvider: ReferencesProvider,
    private definitionProvider: DefinitionProvider,
  ) {}

  /**
   * Prepare rename operation - validate that the symbol can be renamed
   */
  async prepareRename(document: TextDocument, position: Position): Promise<RenameResult | null> {
    const tree = this.parser.parse(document.getText());
    if (!tree) return null;

    // Find the node at the cursor position
    const node = this.findNodeAtPosition(tree.rootNode, position, document);
    if (!node) return null;

    // Check if the node is renameable
    const renameableInfo = this.isRenameable(node);
    if (!renameableInfo) return null;

    // Get the range of the identifier
    const range = this.getNodeRange(node, document);
    if (!range) return null;

    return {
      range,
      placeholder: renameableInfo.currentName,
    };
  }

  /**
   * Provide rename edits for the symbol at the given position
   */
  async provideRenameEdits(
    document: TextDocument,
    position: Position,
    newName: string,
  ): Promise<WorkspaceEdit | null> {
    // Validate the new name
    if (!this.isValidIdentifier(newName)) {
      return null;
    }

    const tree = this.parser.parse(document.getText());
    if (!tree) return null;

    // Find the node at the cursor position
    const node = this.findNodeAtPosition(tree.rootNode, position, document);
    if (!node) return null;

    const renameableInfo = this.isRenameable(node);
    if (!renameableInfo) return null;

    // Find all references to this symbol
    const references = await this.referencesProvider.provideReferences(document, position, {
      includeDeclaration: true,
    });

    if (!references || references.length === 0) {
      return null;
    }

    // Create workspace edit
    const workspaceEdit: WorkspaceEdit = {
      changes: {},
    };

    // Group references by document URI
    const referencesByUri = new Map<string, Location[]>();
    for (const ref of references) {
      const uri = ref.uri;
      if (!referencesByUri.has(uri)) {
        referencesByUri.set(uri, []);
      }
      referencesByUri.get(uri)?.push(ref);
    }

    // Create text edits for each document
    for (const [uri, locations] of referencesByUri) {
      const edits: TextEdit[] = [];

      for (const location of locations) {
        // For imports, we might need special handling
        if (renameableInfo.type === 'import' && uri !== document.uri.toString()) {
          // Skip renaming import paths in other files
          continue;
        }

        edits.push({
          range: location.range,
          newText: newName,
        });
      }

      if (edits.length > 0) {
        workspaceEdit.changes![uri] = edits;
      }
    }

    // Handle special cases based on symbol type
    if (renameableInfo.type === 'flow') {
      // Update any start flow references if this is the initial flow
      await this.updateStartFlowReferences(
        workspaceEdit,
        document,
        renameableInfo.currentName,
        newName,
      );
    } else if (renameableInfo.type === 'message') {
      // Messages might be referenced in flows
      await this.updateMessageReferences(
        workspaceEdit,
        document,
        renameableInfo.currentName,
        newName,
      );
    }

    return workspaceEdit;
  }

  /**
   * Find the node at the given position
   */
  private findNodeAtPosition(
    node: Parser.SyntaxNode,
    position: Position,
    document: TextDocument,
  ): Parser.SyntaxNode | null {
    const offset = document.offsetAt(position);

    // Check if position is within this node
    if (offset < node.startIndex || offset > node.endIndex) {
      return null;
    }

    // Check children
    for (const child of node.children) {
      const result = this.findNodeAtPosition(child, position, document);
      if (result) return result;
    }

    // Return this node if it's a leaf or the most specific match
    return node;
  }

  /**
   * Check if a node is renameable and get info about it
   */
  private isRenameable(node: Parser.SyntaxNode): { type: string; currentName: string } | null {
    // Navigate up to find the relevant identifier
    let current: Parser.SyntaxNode | null = node;

    while (current) {
      switch (current.type) {
        case 'identifier':
        case 'IDENTIFIER': {
          // Check parent context
          const parent = current.parent;
          if (!parent) break;

          // Agent name
          if (parent.type === 'agent_definition') {
            return { type: 'agent', currentName: current.text };
          }

          // Flow name
          if (parent.type === 'flow_definition') {
            return { type: 'flow', currentName: current.text };
          }

          // Message name
          if (
            parent.type === 'message_definition' ||
            parent.type === 'text_message' ||
            parent.type === 'rich_card_message' ||
            parent.type === 'carousel_message'
          ) {
            return { type: 'message', currentName: current.text };
          }

          // State name in transitions
          if (parent.type === 'transition' || parent.type === 'state_reference') {
            return { type: 'state', currentName: current.text };
          }

          // Import alias
          if (parent.type === 'import_statement' && current.previousSibling?.text === 'as') {
            return { type: 'import', currentName: current.text };
          }

          break;
        }

        case 'string':
        case 'STRING': {
          // Some identifiers might be strings in certain contexts
          const stringParent = current.parent;
          if (stringParent?.type === 'import_statement') {
            // Don't rename import paths
            return null;
          }
          break;
        }
      }

      current = current.parent;
    }

    return null;
  }

  /**
   * Validate identifier name
   */
  private isValidIdentifier(name: string): boolean {
    // RCL identifier rules: must start with letter or underscore,
    // followed by letters, numbers, or underscores
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
  }

  /**
   * Get the range of a node
   */
  private getNodeRange(node: Parser.SyntaxNode, document: TextDocument): Range | null {
    try {
      return {
        start: document.positionAt(node.startIndex),
        end: document.positionAt(node.endIndex),
      };
    } catch {
      return null;
    }
  }

  /**
   * Update start flow references when renaming a flow
   */
  private async updateStartFlowReferences(
    workspaceEdit: WorkspaceEdit,
    document: TextDocument,
    oldName: string,
    newName: string,
  ): Promise<void> {
    // Search for 'start: oldName' patterns in agent definitions
    const tree = this.parser.parse(document.getText());
    if (!tree) return;

    const findStartReferences = (node: Parser.SyntaxNode): void => {
      if (node.type === 'agent_body') {
        for (const child of node.children) {
          if (child.type === 'start_statement') {
            const flowRef = child.children.find(
              (c: Parser.SyntaxNode) => c.type === 'identifier' || c.type === 'IDENTIFIER',
            );
            if (flowRef && flowRef.text === oldName) {
              const range = this.getNodeRange(flowRef, document);
              if (range) {
                const uri = document.uri.toString();
                if (!workspaceEdit.changes?.[uri]) {
                  workspaceEdit.changes![uri] = [];
                }
                workspaceEdit.changes?.[uri].push({
                  range,
                  newText: newName,
                });
              }
            }
          }
        }
      }

      for (const child of node.children) {
        findStartReferences(child);
      }
    };

    findStartReferences(tree.rootNode);
  }

  /**
   * Update message references when renaming a message
   */
  private async updateMessageReferences(
    workspaceEdit: WorkspaceEdit,
    document: TextDocument,
    oldName: string,
    newName: string,
  ): Promise<void> {
    // Messages can be referenced in flow states
    const tree = this.parser.parse(document.getText());
    if (!tree) return;

    const findMessageReferences = (node: Parser.SyntaxNode): void => {
      if (node.type === 'state_definition' || node.type === 'transition') {
        // Look for message references in state definitions
        for (const child of node.children) {
          if (
            (child.type === 'identifier' || child.type === 'IDENTIFIER') &&
            child.text === oldName
          ) {
            const range = this.getNodeRange(child, document);
            if (range) {
              const uri = document.uri.toString();
              if (!workspaceEdit.changes?.[uri]) {
                workspaceEdit.changes![uri] = [];
              }
              workspaceEdit.changes?.[uri].push({
                range,
                newText: newName,
              });
            }
          }
        }
      }

      for (const child of node.children) {
        findMessageReferences(child);
      }
    };

    findMessageReferences(tree.rootNode);
  }
}
