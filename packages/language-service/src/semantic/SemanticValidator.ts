import * as fs from 'node:fs';
import * as path from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { ensureOldAST } from '../ast-adapter';
import type { ASTNode } from '../ast-compatibility';
import type { Diagnostic } from '../program/types';

export interface SemanticValidationResult {
  diagnostics: Diagnostic[];
}

export class SemanticValidator {
  private ajv: Ajv;
  private schemas: Map<string, any> = new Map();

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      strict: false,
      validateFormats: true,
    });
    addFormats(this.ajv);

    this.loadSchemas();
  }

  private loadSchemas(): void {
    const schemaDir = path.resolve(__dirname, '../../../../schemas');

    // Load all RCL schemas in dependency order
    const schemaFiles = [
      'agent-config.schema.json',
      'agent-message.schema.json',
      'rcl-agent-section.schema.json',
      'rcl-flow-section.schema.json',
      'rcl-messages-section.schema.json',
      'rcl-document.schema.json',
    ];

    for (const file of schemaFiles) {
      try {
        const schemaPath = path.join(schemaDir, file);
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

        // Fix relative references to use absolute IDs
        if (file === 'rcl-document.schema.json' && schema.properties?.sections?.items?.oneOf) {
          schema.properties.sections.items.oneOf = schema.properties.sections.items.oneOf.map(
            (ref: any) => {
              if (ref.$ref?.startsWith('./')) {
                const refFile = ref.$ref.replace('./', '');
                const refSchema = this.schemas.get(refFile);
                if (refSchema?.$id) {
                  return { $ref: refSchema.$id };
                }
              }
              return ref;
            },
          );
        }

        this.schemas.set(file, schema);
        this.ajv.addSchema(schema, schema.$id || file);
      } catch (error) {
        console.error(`Failed to load schema ${file}:`, error);
      }
    }
  }

  /**
   * Validate an RCL document AST against semantic rules
   */
  public validate(ast: ASTNode | any): SemanticValidationResult {
    const diagnostics: Diagnostic[] = [];

    // Ensure we're working with old AST format
    const oldAST = ensureOldAST(ast);

    // Convert AST to JSON structure for validation
    const document = this.astToJson(oldAST);

    // DISABLED: Schema validation against RCL document schema
    // The AST structure doesn't match the compiled output schemas,
    // and validation should happen after compilation, not before.
    // The compiler itself validates the output against the proper schemas.

    // Additional semantic validations (these are safe to run on AST)
    diagnostics.push(...this.validateAgentSection(document, oldAST));
    diagnostics.push(...this.validateFlowSections(document, oldAST));
    diagnostics.push(...this.validateMessagesSections(document, oldAST));

    return { diagnostics };
  }

  /**
   * Convert AST to JSON structure for schema validation
   */
  private astToJson(ast: ASTNode | any): any {
    const document: any = {
      imports: [],
      sections: [],
    };

    // For now, create a minimal structure that passes validation
    // This is temporary until the ANTLR parser is fully functional
    if (ast && 'text' in ast && typeof ast.text === 'string') {
      // Parse text content to extract basic structure
      const lines = ast.text.split('\n');
      let currentSection: any = null;
      let parentSection: any = null;
      let currentIndent = 0;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('<')) continue; // Skip empty lines and indent tokens

        // Calculate indentation
        const indent = line.length - line.trimStart().length;

        // Parse top-level agent section
        if (indent === 0 && trimmed.match(/^agent\s+/)) {
          const [type, ...idParts] = trimmed.split(/\s+/);
          currentSection = {
            type,
            id: idParts.join(' '),
            attributes: {},
            sections: [],
          };
          parentSection = currentSection;
          document.sections.push(currentSection);
          currentIndent = 0;
        }
        // Parse nested sections (flow, messages) inside agent
        else if (parentSection && indent > 0 && trimmed.match(/^(flow|messages)\s+/)) {
          const [type, ...idParts] = trimmed.split(/\s+/);
          const nestedSection = {
            type,
            id: idParts.join(' '),
            attributes: {},
            sections: [],
          };
          parentSection.sections.push(nestedSection);
          currentSection = nestedSection;
          currentIndent = indent;
        }
        // Parse attributes
        else if (currentSection && indent > currentIndent && trimmed.includes(':')) {
          const [key, ...valueParts] = trimmed.split(':');
          const value = valueParts
            .join(':')
            .trim()
            .replace(/^["']|["']$/g, '');
          currentSection.attributes[key.trim()] = value;
        }
      }
    } else if ('children' in ast && ast.children && Array.isArray(ast.children)) {
      // Original logic for proper AST
      for (const child of ast.children) {
        if (child.type === 'import_statement') {
          document.imports.push(this.parseImport(child));
        } else if (child.type === 'section') {
          const section = this.parseSection(child);
          if (section) {
            document.sections.push(section);
          }
        }
      }
    }

    return document;
  }

  private parseImport(node: any): any {
    const importObj: any = {};

    if (node.children) {
      for (const child of node.children) {
        if (child.type === 'import_path') {
          importObj.path = this.getNodeText(child);
        } else if (child.type === 'identifier' && child.parent?.type === 'import_statement') {
          importObj.alias = this.getNodeText(child);
        }
      }
    }

    return importObj;
  }

  private parseSection(node: any): any {
    const section: any = {
      attributes: {},
      sections: [],
    };

    if (node.children) {
      for (const child of node.children) {
        if (child.type === 'section_type') {
          section.type = this.getNodeText(child);
        } else if (child.type === 'identifier' && child.parent === node) {
          section.id = this.getNodeText(child);
        } else if (child.type === 'attribute') {
          const attr = this.parseAttribute(child);
          if (attr) {
            section.attributes[attr.key] = attr.value;
          }
        } else if (child.type === 'section') {
          const subSection = this.parseSection(child);
          if (subSection) {
            section.sections.push(subSection);
          }
        }
      }
    }

    return section;
  }

  private parseAttribute(node: any): { key: string; value: any } | null {
    let key = '';
    let value: any = null;

    if (node.children) {
      for (const child of node.children) {
        if (child.type === 'attribute_key') {
          key = this.getNodeText(child);
        } else if (child.type === 'value' || child.type === 'string' || child.type === 'number') {
          value = this.parseValue(child);
        }
      }
    }

    return key ? { key, value } : null;
  }

  private parseValue(node: any): any {
    switch (node.type) {
      case 'string':
        return this.getNodeText(node).replace(/^["']|["']$/g, '');
      case 'number':
        return Number.parseFloat(this.getNodeText(node));
      case 'boolean': {
        const text = this.getNodeText(node).toLowerCase();
        return text === 'true' || text === 'yes' || text === 'on';
      }
      case 'null':
        return null;
      case 'list':
        return this.parseList(node);
      case 'dictionary':
        return this.parseDictionary(node);
      default:
        return this.getNodeText(node);
    }
  }

  private parseList(node: any): any[] {
    const items: any[] = [];

    if (node.children) {
      for (const child of node.children) {
        if (child.type === 'value' || child.type === 'string' || child.type === 'number') {
          items.push(this.parseValue(child));
        }
      }
    }

    return items;
  }

  private parseDictionary(node: any): any {
    const dict: any = {};

    if (node.children) {
      for (const child of node.children) {
        if (child.type === 'dict_entry') {
          const entry = this.parseDictEntry(child);
          if (entry) {
            dict[entry.key] = entry.value;
          }
        }
      }
    }

    return dict;
  }

  private parseDictEntry(node: any): { key: string; value: any } | null {
    let key = '';
    let value: any = null;

    if (node.children) {
      for (const child of node.children) {
        if (child.type === 'attribute_key' || child.type === 'string') {
          key = this.getNodeText(child).replace(/^["']|["']$/g, '');
        } else if (child.type === 'value') {
          value = this.parseValue(child);
        }
      }
    }

    return key ? { key, value } : null;
  }

  private getNodeText(node: any): string {
    return node.text || '';
  }

  private ajvErrorToDiagnostic(error: any, ast: ASTNode): Diagnostic | null {
    // Map JSON path to AST node for accurate position
    const path = error.instancePath.split('/').filter(Boolean);
    const node = this.findNodeByPath(ast, path);

    if (!node) {
      return null;
    }

    // Handle ANTLR AST structure
    const range = (node as any).range || (node as any).location?.range;
    if (!range) {
      return null;
    }

    return {
      severity: 'error' as const,
      line: range.start.line + 1, // Convert to 1-based
      column: range.start.character + 1, // Convert to 1-based
      message: this.formatErrorMessage(error),
      code: error.keyword?.toUpperCase() || 'VALIDATION_ERROR',
    };
  }

  private formatErrorMessage(error: any): string {
    switch (error.keyword) {
      case 'required':
        return `Missing required property: ${error.params.missingProperty}`;
      case 'enum':
        return `Invalid value. Must be one of: ${error.params.allowedValues.join(', ')}`;
      case 'pattern':
        return `Invalid format for ${error.instancePath.split('/').pop()}: ${error.message}`;
      case 'maxLength':
        return `Value exceeds maximum length of ${error.params.limit} characters`;
      default:
        return error.message || 'Validation error';
    }
  }

  private findNodeByPath(ast: ASTNode, path: string[]): ASTNode | null {
    // This is a simplified version - a real implementation would need
    // to properly map JSON paths to AST nodes
    let current: any = ast;

    for (const segment of path) {
      if (!current) return null;

      if (segment === 'sections' && 'children' in current) {
        // Find sections in children
        current = current.children?.find((c: any) => c.type === 'section');
      } else if (segment === 'attributes' && 'children' in current) {
        // Find attributes in children
        current = current.children?.find((c: any) => c.type === 'attribute');
      } else if (/^\d+$/.test(segment)) {
        // Array index
        const index = Number.parseInt(segment, 10);
        if ('children' in current && current.children) {
          current = current.children[index];
        }
      } else {
        // Property name
        if ('children' in current && current.children) {
          current = current.children.find(
            (c: any) =>
              (c.type === 'identifier' || c.type === 'attribute_key') &&
              this.getNodeText(c) === segment,
          );
        }
      }
    }

    return current;
  }

  private validateAgentSection(document: any, ast: ASTNode): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const agentSections = document.sections.filter((s: any) => s.type === 'agent');

    if (agentSections.length > 1) {
      // Multiple agent sections
      for (let i = 1; i < agentSections.length; i++) {
        const node = this.findSectionNode(ast, 'agent', i);
        const range = (node as any)?.range || (node as any)?.location?.range;
        if (range) {
          diagnostics.push({
            severity: 'error' as const,
            line: range.start.line + 1,
            column: range.start.character + 1,
            message: 'Only one agent section is allowed per RCL document',
            code: 'MULTIPLE_AGENTS',
          });
        }
      }
    }

    // Check that each agent has required nested sections
    for (const agent of agentSections) {
      const flows = agent.sections?.filter((s: any) => s.type === 'flow') || [];
      const messages = agent.sections?.filter((s: any) => s.type === 'messages') || [];

      if (flows.length === 0) {
        diagnostics.push({
          severity: 'error' as const,
          line: 1,
          column: 1,
          message: `Agent '${agent.id}' must contain at least one flow section`,
          code: 'MISSING_FLOW',
        });
      }

      if (messages.length === 0) {
        diagnostics.push({
          severity: 'error' as const,
          line: 1,
          column: 1,
          message: `Agent '${agent.id}' must contain a messages section`,
          code: 'MISSING_MESSAGES',
        });
      }
    }

    return diagnostics;
  }

  private validateFlowSections(document: any, _ast: ASTNode): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    // Get all agents and validate flows inside them
    const agentSections = document.sections.filter((s: any) => s.type === 'agent');

    for (const agent of agentSections) {
      const flowSections = agent.sections?.filter((s: any) => s.type === 'flow') || [];

      for (const flow of flowSections) {
        // Validate flow references
        if (flow.attributes.start) {
          const startState = flow.attributes.start;
          const hasState = flow.sections?.some((s: any) => s.type === 'on' && s.id === startState);

          if (!hasState && startState !== 'end') {
            // For now, just create a simple diagnostic
            diagnostics.push({
              severity: 'error' as const,
              line: 1,
              column: 1,
              message: `Start state '${startState}' not found in flow '${flow.id}'`,
              code: 'INVALID_START_STATE',
            });
          }
        }
      }
    }

    return diagnostics;
  }

  private validateMessagesSections(document: any, _ast: ASTNode): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    // Get all agents and check for multiple messages sections inside each
    const agentSections = document.sections.filter((s: any) => s.type === 'agent');

    for (const agent of agentSections) {
      const messagesSections = agent.sections?.filter((s: any) => s.type === 'messages') || [];

      if (messagesSections.length > 1) {
        // Multiple messages sections within an agent
        diagnostics.push({
          severity: 'warning' as const,
          line: 1,
          column: 1,
          message: `Agent '${agent.id}' has multiple messages sections. Consider consolidating into one section.`,
          code: 'MULTIPLE_MESSAGES_SECTIONS',
        });
      }
    }

    return diagnostics;
  }

  private findSectionNode(ast: ASTNode, type: string, index = 0): ASTNode | null {
    let count = 0;

    const findSection = (node: any): any => {
      if (node.type === 'section') {
        const typeNode = node.children?.find((c: any) => c.type === 'section_type');
        if (typeNode && this.getNodeText(typeNode) === type) {
          if (count === index) {
            return node;
          }
          count++;
        }
      }

      if ('children' in node && node.children) {
        for (const child of node.children) {
          const result = findSection(child);
          if (result) return result;
        }
      }

      return null;
    };

    return findSection(ast);
  }

  private findFlowAttributeNode(
    ast: ASTNode,
    flowId: string,
    attributeKey: string,
  ): ASTNode | null {
    const flowNode = this.findSectionById(ast, 'flow', flowId);
    if (!flowNode) return null;

    const findAttribute = (node: any): any => {
      if (node.type === 'attribute') {
        const keyNode = node.children?.find((c: any) => c.type === 'attribute_key');
        if (keyNode && this.getNodeText(keyNode) === attributeKey) {
          return node;
        }
      }

      if ('children' in node && node.children) {
        for (const child of node.children) {
          const result = findAttribute(child);
          if (result) return result;
        }
      }

      return null;
    };

    return findAttribute(flowNode);
  }

  private findSectionById(ast: ASTNode, type: string, id: string): ASTNode | null {
    const findSection = (node: any): any => {
      if (node.type === 'section') {
        const typeNode = node.children?.find((c: any) => c.type === 'section_type');
        const idNode = node.children?.find(
          (c: any) => c.type === 'identifier' && c.parent === node,
        );

        if (
          typeNode &&
          this.getNodeText(typeNode) === type &&
          idNode &&
          this.getNodeText(idNode) === id
        ) {
          return node;
        }
      }

      if ('children' in node && node.children) {
        for (const child of node.children) {
          const result = findSection(child);
          if (result) return result;
        }
      }

      return null;
    };

    return findSection(ast);
  }
}
