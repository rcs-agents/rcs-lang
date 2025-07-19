/**
 * Utility functions for working with AST nodes
 */

import type {
  Attribute,
  ImportStatement,
  MatchBlock,
  RclFile,
  Section,
  SpreadDirective,
  Value,
} from './ast.js';
import { isAttribute, isMatchBlock, isSection, isSpreadDirective } from './guards.js';
import type { Position, Range, SourceLocation, WithLocation } from './position.js';

/**
 * Create a position object
 */
export function createPosition(line: number, character: number): Position {
  return { line, character };
}

/**
 * Create a range object
 */
export function createRange(start: Position, end: Position): Range {
  return { start, end };
}

/**
 * Create a source location object
 */
export function createLocation(range: Range, source?: string): SourceLocation {
  return { range, source };
}

/**
 * Add location to a node
 */
export function withLocation<T>(node: T, location?: SourceLocation): T & WithLocation {
  return { ...node, location };
}

/**
 * Get all sections from an RCL file
 */
export function getAllSections(file: RclFile): Section[] {
  const sections: Section[] = [];

  function collectSections(items: Section['body']) {
    for (const item of items) {
      if (isSection(item)) {
        sections.push(item);
        collectSections(item.body);
      }
    }
  }

  sections.push(...file.sections);
  for (const section of file.sections) {
    collectSections(section.body);
  }

  return sections;
}

/**
 * Find a section by type and identifier
 */
export function findSection(
  file: RclFile,
  sectionType: string,
  identifier?: string,
): Section | undefined {
  const sections = getAllSections(file);
  return sections.find(
    (s) => s.sectionType === sectionType && (!identifier || s.identifier?.value === identifier),
  );
}

/**
 * Get all attributes from a section
 */
export function getSectionAttributes(section: Section): Attribute[] {
  return section.body.filter(isAttribute);
}

/**
 * Get attribute value by key
 */
export function getAttributeValue(section: Section, key: string): Value | undefined {
  const attr = section.body.find((item) => isAttribute(item) && item.key === key) as
    | Attribute
    | undefined;

  return attr?.value;
}

/**
 * Get all spread directives from a section
 */
export function getSectionSpreads(section: Section): SpreadDirective[] {
  return section.body.filter(isSpreadDirective);
}

/**
 * Get all nested sections
 */
export function getNestedSections(section: Section): Section[] {
  return section.body.filter(isSection);
}

/**
 * Get all match blocks from a section
 */
export function getSectionMatchBlocks(section: Section): MatchBlock[] {
  return section.body.filter(isMatchBlock);
}

/**
 * Check if a section has a specific attribute
 */
export function hasAttribute(section: Section, key: string): boolean {
  return section.body.some((item) => isAttribute(item) && item.key === key);
}

/**
 * Get all imports from an RCL file
 */
export function getImports(file: RclFile): ImportStatement[] {
  return file.imports;
}

/**
 * Find import by alias
 */
export function findImportByAlias(file: RclFile, alias: string): ImportStatement | undefined {
  return file.imports.find((imp) => imp.alias?.value === alias);
}

/**
 * Convert import path array to string
 */
export function importPathToString(importPath: string[]): string {
  return importPath.join('/');
}

/**
 * Parse import path string to array
 */
export function parseImportPath(path: string): string[] {
  return path.split('/').filter((p) => p.length > 0);
}

/**
 * Walk through AST nodes recursively
 */
export function walkAST(node: any, callback: (node: any) => void): void {
  if (!node || typeof node !== 'object') return;

  callback(node);

  // Handle arrays
  if (Array.isArray(node)) {
    for (const child of node) {
      walkAST(child, callback);
    }
    return;
  }

  // Handle objects - walk through relevant properties
  for (const key of Object.keys(node)) {
    // Skip non-AST properties
    if (key === 'location' || key === 'type' || typeof node[key] !== 'object') {
      continue;
    }
    walkAST(node[key], callback);
  }
}

/**
 * Find a node by type in the AST
 */
export function findNodeByType(ast: any, nodeType: string): any {
  let result: any = null;

  walkAST(ast, (node) => {
    if (node.type === nodeType && !result) {
      result = node;
    }
  });

  return result;
}

/**
 * Find all nodes by type in the AST
 */
export function findNodesByType(ast: any, nodeType: string): any[] {
  const results: any[] = [];

  walkAST(ast, (node) => {
    if (node.type === nodeType) {
      results.push(node);
    }
  });

  return results;
}
