"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RCLParser = void 0;
const Parser = __importStar(require("tree-sitter"));
// Note: In a real implementation, this would import the compiled RCL language
// For now, we'll create a mock implementation that handles the basic structure
let rclLanguage;
try {
    // This would be the actual tree-sitter RCL language binding
    // rclLanguage = require('tree-sitter-rcl');
}
catch (error) {
    console.warn('Tree-sitter RCL language not found, using mock parser');
}
class RCLParser {
    constructor() {
        this.documentCache = new Map();
        this.parser = new Parser();
        if (rclLanguage) {
            this.parser.setLanguage(rclLanguage);
        }
        else {
            // Mock parser for development
            console.log('Using mock RCL parser');
        }
    }
    parseDocument(document) {
        const uri = document.uri;
        const version = document.version;
        const content = document.getText();
        // Check cache
        const cached = this.documentCache.get(uri);
        if (cached && cached.version === version) {
            return cached;
        }
        const ast = this.parseText(content);
        const rclDocument = {
            uri,
            version,
            content,
            ast,
            imports: this.extractImports(ast),
            symbols: this.extractSymbols(ast),
            diagnostics: []
        };
        this.documentCache.set(uri, rclDocument);
        return rclDocument;
    }
    parseText(text) {
        if (!rclLanguage) {
            return this.mockParse(text);
        }
        try {
            const tree = this.parser.parse(text);
            return this.convertToRCLNode(tree.rootNode);
        }
        catch (error) {
            console.error('Error parsing RCL document:', error);
            return null;
        }
    }
    mockParse(text) {
        // Simple mock parser for basic RCL structure
        const lines = text.split('\n');
        const mockNode = {
            type: 'source_file',
            text: text,
            startPosition: { row: 0, column: 0 },
            endPosition: { row: lines.length - 1, column: lines[lines.length - 1].length },
            children: [],
            parent: null
        };
        // Look for agent definitions
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('agent ')) {
                const agentName = line.substring(6).trim();
                mockNode.children.push({
                    type: 'agent_definition',
                    text: line,
                    startPosition: { row: i, column: 0 },
                    endPosition: { row: i, column: line.length },
                    children: [],
                    parent: mockNode
                });
            }
        }
        return mockNode;
    }
    convertToRCLNode(node) {
        const rclNode = {
            type: node.type,
            text: node.text,
            startPosition: node.startPosition,
            endPosition: node.endPosition,
            children: node.children.map(child => this.convertToRCLNode(child)),
            parent: null
        };
        // Set parent references
        rclNode.children.forEach(child => {
            child.parent = rclNode;
        });
        return rclNode;
    }
    extractImports(ast) {
        if (!ast)
            return [];
        const imports = [];
        this.traverseAST(ast, (node) => {
            if (node.type === 'import_statement') {
                imports.push({
                    path: this.extractImportPath(node),
                    range: this.nodeToRange(node),
                    resolved: false
                });
            }
        });
        return imports;
    }
    extractSymbols(ast) {
        if (!ast)
            return [];
        const symbols = [];
        this.traverseAST(ast, (node) => {
            if (['agent_definition', 'flow_definition', 'message_definition'].includes(node.type)) {
                symbols.push({
                    name: this.extractNodeName(node),
                    kind: this.nodeTypeToSymbolKind(node.type),
                    range: this.nodeToRange(node),
                    selectionRange: this.nodeToRange(node)
                });
            }
        });
        return symbols;
    }
    traverseAST(node, callback) {
        callback(node);
        if ('children' in node && node.children) {
            node.children.forEach(child => this.traverseAST(child, callback));
        }
    }
    extractImportPath(node) {
        // Extract import path from import statement
        return node.text.replace(/^import\s+/, '').trim();
    }
    extractNodeName(node) {
        // Extract name from definition nodes
        if ('name' in node) {
            return node.name;
        }
        // Fallback: extract from text
        const match = node.text.match(/^\w+\s+(\w+)/);
        return match ? match[1] : 'unknown';
    }
    nodeTypeToSymbolKind(nodeType) {
        switch (nodeType) {
            case 'agent_definition': return 'agent';
            case 'flow_definition': return 'flow';
            case 'message_definition': return 'message';
            default: return 'unknown';
        }
    }
    nodeToRange(node) {
        return {
            start: {
                line: node.startPosition.row,
                character: node.startPosition.column
            },
            end: {
                line: node.endPosition.row,
                character: node.endPosition.column
            }
        };
    }
    getNodeAt(document, line, character) {
        if (!document.ast)
            return null;
        return this.findNodeAtPosition(document.ast, line, character);
    }
    findNodeAtPosition(node, line, character) {
        if (line < node.startPosition.row || line > node.endPosition.row) {
            return null;
        }
        if (line === node.startPosition.row && character < node.startPosition.column) {
            return null;
        }
        if (line === node.endPosition.row && character > node.endPosition.column) {
            return null;
        }
        // Check children for more specific match
        if ('children' in node && node.children) {
            for (const child of node.children) {
                const childMatch = this.findNodeAtPosition(child, line, character);
                if (childMatch) {
                    return childMatch;
                }
            }
        }
        return node;
    }
    clearCache(uri) {
        if (uri) {
            this.documentCache.delete(uri);
        }
        else {
            this.documentCache.clear();
        }
    }
}
exports.RCLParser = RCLParser;
//# sourceMappingURL=rclParser.js.map