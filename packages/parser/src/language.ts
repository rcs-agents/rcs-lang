import nodeTypes from './node-types.json';

// Define types for tree-sitter language
interface TreeSitterLanguage {
  nodeTypeCount: number;
  // Add other properties as needed based on actual tree-sitter language interface
}

// Define types for the node-types.json structure
interface NodeTypeField {
  types?: Array<{ type: string }>;
}

interface NodeType {
  type: string;
  children?: {
    types?: Array<{ type: string }>;
  };
  fields?: Record<string, NodeTypeField>;
}

// Extract node type names from the generated node-types.json
// Currently unused but kept for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function extractNodeTypeNames(): string[] {
  const typeNames: string[] = [];
  const seen = new Set<string>();

  function addType(typeName: string) {
    if (!seen.has(typeName)) {
      seen.add(typeName);
      typeNames.push(typeName);
    }
  }

  // Add all top-level types
  for (const nodeType of nodeTypes as NodeType[]) {
    addType(nodeType.type);

    // Add child types recursively
    if (nodeType.children?.types) {
      for (const childType of nodeType.children.types) {
        addType(childType.type);
      }
    }

    // Add field types
    if (nodeType.fields) {
      for (const field of Object.values(nodeType.fields)) {
        if (field.types) {
          for (const fieldType of field.types) {
            addType(fieldType.type);
          }
        }
      }
    }
  }

  return typeNames;
}

let cachedLanguage: TreeSitterLanguage | null = null;

export async function loadRCLLanguage(): Promise<TreeSitterLanguage> {
  if (cachedLanguage) {
    return cachedLanguage;
  }

  // Load the tree-sitter language
  try {
    const RCLLanguage = require('../../bindings/node');
    cachedLanguage = RCLLanguage;
    return RCLLanguage;
  } catch (error) {
    throw new Error('Tree-sitter native binding not available');
  }
}

export function isRCLLanguageAvailable(): boolean {
  try {
    require('../../bindings/node');
    return true;
  } catch {
    return false;
  }
}
