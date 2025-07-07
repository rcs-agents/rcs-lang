"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoverProvider = void 0;
const node_1 = require("vscode-languageserver/node");
class HoverProvider {
    constructor(parser) {
        this.parser = parser;
    }
    async getHover(document, position) {
        const line = document.getText({
            start: { line: position.line, character: 0 },
            end: { line: position.line + 1, character: 0 },
        });
        // Simple hover for RCL keywords
        if (line.includes('agent')) {
            return {
                contents: {
                    kind: node_1.MarkupKind.Markdown,
                    value: '## Agent\n\nDefines an RCS agent with its configuration and behavior.',
                },
            };
        }
        if (line.includes('flow')) {
            return {
                contents: {
                    kind: node_1.MarkupKind.Markdown,
                    value: '## Flow\n\nDefines a conversation flow with states and transitions.',
                },
            };
        }
        return null;
    }
}
exports.HoverProvider = HoverProvider;
//# sourceMappingURL=hover.js.map