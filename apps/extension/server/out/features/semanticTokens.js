"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticTokensProvider = void 0;
class SemanticTokensProvider {
    constructor(parser) {
        this.parser = parser;
        this.legend = {
            tokenTypes: [
                'namespace',
                'type',
                'class',
                'enum',
                'interface',
                'struct',
                'typeParameter',
                'parameter',
                'variable',
                'property',
                'enumMember',
                'event',
                'function',
                'method',
                'macro',
                'keyword',
                'modifier',
                'comment',
                'string',
                'number',
                'regexp',
                'operator',
            ],
            tokenModifiers: [
                'declaration',
                'definition',
                'readonly',
                'static',
                'deprecated',
                'abstract',
                'async',
                'modification',
                'documentation',
                'defaultLibrary',
            ],
        };
    }
    getLegend() {
        return this.legend;
    }
    async getSemanticTokens(document) {
        // Basic semantic tokens - return empty for now
        return { data: [] };
    }
}
exports.SemanticTokensProvider = SemanticTokensProvider;
//# sourceMappingURL=semanticTokens.js.map