"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletionProvider = void 0;
const node_1 = require("vscode-languageserver/node");
class CompletionProvider {
    constructor(parser) {
        this.parser = parser;
    }
    async getCompletions(_document, _position) {
        // Basic completion items for RCL
        return [
            {
                label: 'agent',
                kind: node_1.CompletionItemKind.Keyword,
                detail: 'Agent Definition',
                documentation: {
                    kind: node_1.MarkupKind.Markdown,
                    value: 'Define a new RCS agent',
                },
                insertText: 'agent ${1:AgentName}',
                insertTextFormat: node_1.InsertTextFormat.Snippet,
            },
            {
                label: 'flow',
                kind: node_1.CompletionItemKind.Keyword,
                detail: 'Flow Definition',
                documentation: 'Define a conversation flow',
                insertText: 'flow ${1:FlowName}',
                insertTextFormat: node_1.InsertTextFormat.Snippet,
            },
            {
                label: 'displayName',
                kind: node_1.CompletionItemKind.Property,
                detail: 'Agent Display Name',
                insertText: 'displayName: "${1:Name}"',
                insertTextFormat: node_1.InsertTextFormat.Snippet,
            },
        ];
    }
    resolveCompletion(item) {
        return item;
    }
}
exports.CompletionProvider = CompletionProvider;
//# sourceMappingURL=completion.js.map