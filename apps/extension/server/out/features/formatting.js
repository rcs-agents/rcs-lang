"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormattingProvider = void 0;
class FormattingProvider {
    constructor(parser) {
        this.parser = parser;
    }
    async formatDocument(document, options) {
        // Basic formatting - ensure consistent indentation
        const text = document.getText();
        const lines = text.split('\n');
        const formattedLines = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('agent') || trimmed.startsWith('flow') || trimmed.startsWith('messages')) {
                formattedLines.push(trimmed);
            }
            else if (trimmed.length > 0 && !trimmed.startsWith('#')) {
                // Indent content
                const indent = options.insertSpaces ? ' '.repeat(options.tabSize || 2) : '\t';
                formattedLines.push(indent + trimmed);
            }
            else {
                formattedLines.push(trimmed);
            }
        }
        const formattedText = formattedLines.join('\n');
        if (formattedText !== text) {
            return [{
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: document.lineCount, character: 0 }
                    },
                    newText: formattedText
                }];
        }
        return [];
    }
}
exports.FormattingProvider = FormattingProvider;
//# sourceMappingURL=formatting.js.map