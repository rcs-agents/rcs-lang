/**
 * Message extractor for RCL AST
 * Extracts message definitions from AST even when validation fails
 */

import type { RclFile, Section } from '@rcs-lang/ast';
import { isSection, isAttribute } from '@rcs-lang/ast';
import type { AgentContentMessage, ExtractedMessage, ExtractionResult } from '@rcs-lang/types';

/**
 * Extract messages from a parsed RCL AST
 * This function is resilient - it extracts what it can and skips malformed messages
 *
 * @param ast - The parsed AST (any because we're being resilient to partial ASTs)
 * @returns ExtractionResult with extracted messages and any errors encountered
 */
export function extractMessages(ast: any): ExtractionResult {
  const messages: ExtractedMessage[] = [];
  const errors: string[] = [];
  let order = 0;

  if (!ast) {
    return { messages, errors: ['No AST provided'] };
  }

  try {
    // Look for message declarations in the AST
    // The AST structure varies, so we try multiple paths
    const messageNodes = findMessageNodes(ast);

    for (const node of messageNodes) {
      try {
        const extracted = extractMessageFromNode(node, order);
        if (extracted) {
          messages.push(extracted);
          order++;
        }
      } catch (e) {
        const location = node.location || node.start;
        const line = location?.line ?? 'unknown';
        errors.push(`Failed to extract message at line ${line}: ${e}`);
      }
    }
  } catch (e) {
    errors.push(`AST traversal error: ${e}`);
  }

  return { messages, errors };
}

/**
 * Find all message declaration nodes in the AST
 */
function findMessageNodes(ast: any): any[] {
  const nodes: any[] = [];

  // Handle RclFile type
  if (ast.type === 'RclFile' && ast.sections) {
    for (const section of ast.sections) {
      if (section.sectionType === 'messages' || section.sectionType === 'message') {
        // Found a messages section, look for message definitions inside
        if (section.body && Array.isArray(section.body)) {
          for (const element of section.body) {
            if (isSection(element)) {
              nodes.push(element);
            }
          }
        }
      } else if (isMessageSection(section)) {
        // Direct message section
        nodes.push(section);
      }
    }
  }

  // Fallback: traverse recursively for other AST structures
  if (nodes.length === 0) {
    traverse(ast, nodes);
  }

  return nodes;
}

/**
 * Recursive traversal to find message nodes (fallback)
 */
function traverse(node: any, nodes: any[], depth = 0): void {
  if (!node || depth > 20) return; // Prevent infinite recursion

  // Check if this node is a message declaration
  if (isMessageNode(node)) {
    nodes.push(node);
  }

  // Check common AST child properties
  if (Array.isArray(node)) {
    for (const child of node) {
      traverse(child, nodes, depth + 1);
    }
  } else if (typeof node === 'object') {
    // Check for sections array
    if (node.sections && Array.isArray(node.sections)) {
      for (const section of node.sections) {
        traverse(section, nodes, depth + 1);
      }
    }
    // Check for messages property
    if (node.messages && Array.isArray(node.messages)) {
      for (const msg of node.messages) {
        traverse(msg, nodes, depth + 1);
      }
    }
    // Check for body
    if (node.body && Array.isArray(node.body)) {
      for (const child of node.body) {
        traverse(child, nodes, depth + 1);
      }
    }
    // Check for children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        traverse(child, nodes, depth + 1);
      }
    }
  }
}

/**
 * Check if a section is a message-type section
 */
function isMessageSection(section: Section): boolean {
  const messageTypes = ['text', 'richCard', 'carousel', 'message'];
  return messageTypes.includes(section.sectionType);
}

/**
 * Check if a node represents a message declaration
 */
function isMessageNode(node: any): boolean {
  if (!node || typeof node !== 'object') return false;

  // Check for Section type with message-related sectionType
  if (node.type === 'Section') {
    return isMessageSection(node);
  }

  // Check for various indicators of a message node (legacy formats)
  return (
    node.type === 'MessageDeclaration' ||
    node.type === 'TextMessage' ||
    node.type === 'RichCardMessage' ||
    node.type === 'CarouselMessage' ||
    node.kind === 'message' ||
    (node.name && node.contentMessage) ||
    (node.id && node.text !== undefined) ||
    (node.id && node.richCard !== undefined)
  );
}

/**
 * Extract a message from an AST node
 */
function extractMessageFromNode(node: any, order: number): ExtractedMessage | null {
  if (!node) return null;

  const id = node.identifier?.value || node.id || node.name || `message_${order}`;
  const location = node.start || node.location;

  // Build AgentContentMessage based on what's available
  const content: AgentContentMessage = {};

  // Extract content from Section (new AST format)
  if (isSection(node)) {
    // First, check for shorthand syntax in parameters
    // e.g., `text Welcome "Hello!"` has the text in parameters[0]
    if (node.parameters && node.parameters.length > 0) {
      const firstParam = node.parameters[0];
      if (!firstParam.key) {
        // Positional parameter (shorthand syntax)
        const value = extractValue(firstParam.value);

        // Map based on sectionType
        if (node.sectionType === 'text' && typeof value === 'string') {
          content.text = value;
        } else if (node.sectionType === 'richCard' && typeof value === 'string') {
          // For richCard shorthand, first param is typically the title
          // Build a proper StandaloneCard structure
          content.richCard = {
            standaloneCard: {
              cardOrientation: 'VERTICAL',
              cardContent: {
                title: value
              }
            }
          };
        }
      }
    }

    // Then, extract content from Section body attributes
    if (node.body) {
      for (const element of node.body) {
        if (isAttribute(element)) {
          const key = element.key;
          const value = extractValue(element.value);

          // Map attribute keys to AgentContentMessage properties
          if (key === 'text' && typeof value === 'string') {
            content.text = value;
          } else if (key === 'richCard' && typeof value === 'object') {
            content.richCard = value;
          } else if (key === 'suggestions' && Array.isArray(value)) {
            content.suggestions = value;
          } else if (key === 'uploadedRbmFile' && typeof value === 'object') {
            content.uploadedRbmFile = value;
          } else if (key === 'contentInfo' && typeof value === 'object') {
            content.contentInfo = value;
          } else if (key === 'description' && content.richCard && typeof value === 'string') {
            // Add description to richCard (handling both standalone and carousel)
            if ('standaloneCard' in content.richCard) {
              content.richCard.standaloneCard.cardContent.description = value;
            } else if ('carouselCard' in content.richCard) {
              // For carousel, this would need different handling
              // Just store as-is for now (resilient extraction)
            }
          }
        }
      }
    }
  }

  // Try to extract from legacy formats
  if (!content.text && !content.richCard) {
    // Try direct properties
    if (node.text) {
      content.text = typeof node.text === 'string' ? node.text : node.text.value;
    } else if (node.contentMessage?.text) {
      content.text = node.contentMessage.text;
    } else if (node.content?.text) {
      content.text = node.content.text;
    }

    // Try to extract rich card
    if (node.richCard || node.contentMessage?.richCard) {
      content.richCard = node.richCard || node.contentMessage.richCard;
    }

    // Try to extract suggestions
    if (node.suggestions || node.contentMessage?.suggestions) {
      content.suggestions = node.suggestions || node.contentMessage.suggestions;
    }
  }

  // Only return if we have some content
  if (content.text || content.richCard || content.uploadedRbmFile || content.contentInfo) {
    return {
      id,
      content,
      order,
      location: location ? { line: location.line, column: location.column } : undefined
    };
  }

  return null;
}

/**
 * Extract a value from an AST Value node
 */
function extractValue(valueNode: any): any {
  if (!valueNode) return undefined;

  // Handle different value types
  switch (valueNode.type) {
    case 'StringLiteral':
    case 'MultiLineString':
      return valueNode.value;

    case 'NumericLiteral':
      return valueNode.value;

    case 'BooleanLiteral':
      return valueNode.value;

    case 'NullLiteral':
      return null;

    case 'Atom':
      return valueNode.value;

    case 'Identifier':
      return valueNode.value;

    case 'Variable':
      return `@${valueNode.name}`;

    case 'List':
      return valueNode.items?.map((item: any) => extractValue(item)) || [];

    case 'Dictionary':
      const obj: Record<string, any> = {};
      if (valueNode.entries) {
        for (const entry of valueNode.entries) {
          const key = typeof entry.key === 'string' ? entry.key : entry.key.value;
          obj[key] = extractValue(entry.value);
        }
      }
      return obj;

    case 'ContextualizedValue':
      return extractValue(valueNode.value);

    case 'TypeTag':
      return valueNode.value;

    default:
      // For unknown types, try to return the value property if it exists
      return valueNode.value !== undefined ? valueNode.value : valueNode;
  }
}
