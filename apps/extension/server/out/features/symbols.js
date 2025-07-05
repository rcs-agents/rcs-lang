"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolsProvider = void 0;
const node_1 = require("vscode-languageserver/node");
class SymbolsProvider {
    constructor(parser) {
        this.parser = parser;
    }
    async getDocumentSymbols(document) {
        const symbols = [];
        const text = document.getText();
        const lines = text.split('\n');
        // Simple symbol extraction
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('agent ')) {
                const name = line.substring(6).trim();
                symbols.push({
                    name: name,
                    detail: 'RCS Agent',
                    kind: node_1.SymbolKind.Class,
                    range: {
                        start: { line: i, character: 0 },
                        end: { line: i, character: line.length }
                    },
                    selectionRange: {
                        start: { line: i, character: 6 },
                        end: { line: i, character: 6 + name.length }
                    }
                });
            }
            if (line.startsWith('flow ')) {
                const name = line.substring(5).trim();
                symbols.push({
                    name: name,
                    detail: 'Conversation Flow',
                    kind: node_1.SymbolKind.Method,
                    range: {
                        start: { line: i, character: 0 },
                        end: { line: i, character: line.length }
                    },
                    selectionRange: {
                        start: { line: i, character: 5 },
                        end: { line: i, character: 5 + name.length }
                    }
                });
            }
        }
        return symbols;
    }
}
exports.SymbolsProvider = SymbolsProvider;
//# sourceMappingURL=symbols.js.map