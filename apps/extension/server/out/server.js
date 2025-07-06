"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const parser_1 = require("@rcl/parser");
const syntaxValidator_1 = require("./syntaxValidator");
const completion_1 = require("./features/completion");
const hover_1 = require("./features/hover");
const definition_1 = require("./features/definition");
const references_1 = require("./features/references");
const symbols_1 = require("./features/symbols");
const formatting_1 = require("./features/formatting");
const folding_1 = require("./features/folding");
const semanticTokens_1 = require("./features/semanticTokens");
const diagnostics_1 = require("./features/diagnostics");
// Create a connection for the server, using Node's IPC as a transport
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
// Create a simple text document manager
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
// Initialize providers
const parser = new parser_1.RCLParser();
const syntaxValidator = new syntaxValidator_1.SyntaxValidator();
const completionProvider = new completion_1.CompletionProvider(parser);
const hoverProvider = new hover_1.HoverProvider(parser);
const definitionProvider = new definition_1.DefinitionProvider(parser);
const referencesProvider = new references_1.ReferencesProvider(parser);
const symbolsProvider = new symbols_1.SymbolsProvider(parser);
const formattingProvider = new formatting_1.FormattingProvider(parser);
const foldingProvider = new folding_1.FoldingProvider(parser);
const semanticTokensProvider = new semanticTokens_1.SemanticTokensProvider(parser);
const diagnosticsProvider = new diagnostics_1.DiagnosticsProvider(parser, syntaxValidator);
let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;
connection.onInitialize((params) => {
    console.log('Initializing RCL Language Server');
    const capabilities = params.capabilities;
    // Check client capabilities
    hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration);
    hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);
    hasDiagnosticRelatedInformationCapability = !!(capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation);
    const result = {
        capabilities: {
            textDocumentSync: node_1.TextDocumentSyncKind.Incremental,
            // Code completion
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: [' ', ':', '.', '$', '<', '|']
            },
            // Hover information
            hoverProvider: true,
            // Go to definition
            definitionProvider: true,
            // Find references
            referencesProvider: true,
            // Document symbols
            documentSymbolProvider: true,
            // Workspace symbols
            workspaceSymbolProvider: true,
            // Code actions
            codeActionProvider: {
                codeActionKinds: ['quickfix', 'refactor']
            },
            // Document formatting
            documentFormattingProvider: true,
            documentRangeFormattingProvider: true,
            // Folding ranges
            foldingRangeProvider: true,
            // Semantic tokens
            semanticTokensProvider: {
                legend: semanticTokensProvider.getLegend(),
                range: false,
                full: {
                    delta: false
                }
            },
            // Diagnostics
            diagnosticProvider: {
                interFileDependencies: false,
                workspaceDiagnostics: false
            }
        }
    };
    if (hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders: {
                supported: true
            }
        };
    }
    return result;
});
connection.onInitialized(() => {
    console.log('RCL Language Server initialized');
    if (hasConfigurationCapability) {
        connection.client.register(node_1.DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
            connection.console.log('Workspace folder change event received.');
        });
    }
});
// Default settings
const defaultSettings = {
    maxNumberOfProblems: 1000,
    validation: {
        enabled: true
    },
    completion: {
        enabled: true
    },
    formatting: {
        enabled: true
    }
};
let globalSettings = defaultSettings;
// Cache settings of all open documents
const documentSettings = new Map();
connection.onDidChangeConfiguration(change => {
    if (hasConfigurationCapability) {
        // Reset all cached document settings
        documentSettings.clear();
    }
    else {
        globalSettings = (change.settings.rcl || defaultSettings);
    }
    // Revalidate all open documents
    connection.languages.diagnostics.refresh();
});
function getDocumentSettings(resource) {
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    let result = documentSettings.get(resource);
    if (!result) {
        result = connection.workspace.getConfiguration({
            scopeUri: resource,
            section: 'rcl'
        });
        documentSettings.set(resource, result);
    }
    return result;
}
// Only keep settings for open documents
documents.onDidClose(e => {
    documentSettings.delete(e.document.uri);
    parser.clearCache(e.document.uri);
});
// Handle document content changes
documents.onDidChangeContent(change => {
    // Clear cache for changed document
    parser.clearCache(change.document.uri);
    // Trigger validation
    validateTextDocument(change.document);
});
// Diagnostics
connection.languages.diagnostics.on(async (params) => {
    const document = documents.get(params.textDocument.uri);
    if (document !== undefined) {
        return {
            kind: node_1.DocumentDiagnosticReportKind.Full,
            items: await validateTextDocument(document)
        };
    }
    else {
        return {
            kind: node_1.DocumentDiagnosticReportKind.Full,
            items: []
        };
    }
});
async function validateTextDocument(textDocument) {
    const settings = await getDocumentSettings(textDocument.uri);
    if (!settings.validation.enabled) {
        return [];
    }
    try {
        const rclDocument = parser.parseDocument(textDocument.getText(), textDocument.uri, textDocument.version);
        const diagnostics = await diagnosticsProvider.getDiagnostics(rclDocument, settings);
        // Limit the number of problems reported
        return diagnostics.slice(0, settings.maxNumberOfProblems);
    }
    catch (error) {
        console.error('Error validating document:', error);
        return [{
                severity: node_1.DiagnosticSeverity.Error,
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
                message: 'Internal validation error: ' + error.message,
                source: 'rcl'
            }];
    }
}
// Code completion
connection.onCompletion(async (params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return [];
    }
    const settings = await getDocumentSettings(document.uri);
    if (!settings.completionEnabled) {
        return [];
    }
    try {
        return await completionProvider.getCompletions(document, params.position);
    }
    catch (error) {
        console.error('Error providing completions:', error);
        return [];
    }
});
connection.onCompletionResolve((item) => {
    return completionProvider.resolveCompletion(item);
});
// Hover
connection.onHover(async (params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return null;
    }
    try {
        return await hoverProvider.getHover(document, params.position);
    }
    catch (error) {
        console.error('Error providing hover:', error);
        return null;
    }
});
// Go to definition
connection.onDefinition(async (params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return null;
    }
    try {
        return await definitionProvider.getDefinition(document, params.position);
    }
    catch (error) {
        console.error('Error providing definition:', error);
        return null;
    }
});
// Find references
connection.onReferences(async (params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return [];
    }
    try {
        return await referencesProvider.getReferences(document, params.position, params.context);
    }
    catch (error) {
        console.error('Error providing references:', error);
        return [];
    }
});
// Document symbols
connection.onDocumentSymbol(async (params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return [];
    }
    try {
        return await symbolsProvider.getDocumentSymbols(document);
    }
    catch (error) {
        console.error('Error providing document symbols:', error);
        return [];
    }
});
// Document formatting
connection.onDocumentFormatting(async (params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return [];
    }
    const settings = await getDocumentSettings(document.uri);
    if (!settings.formattingEnabled) {
        return [];
    }
    try {
        return await formattingProvider.formatDocument(document, params.options);
    }
    catch (error) {
        console.error('Error formatting document:', error);
        return [];
    }
});
// Folding ranges
connection.onFoldingRanges(async (params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return [];
    }
    try {
        return await foldingProvider.getFoldingRanges(document);
    }
    catch (error) {
        console.error('Error providing folding ranges:', error);
        return [];
    }
});
// Semantic tokens
connection.languages.semanticTokens.on(async (params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return { data: [] };
    }
    try {
        return await semanticTokensProvider.getSemanticTokens(document);
    }
    catch (error) {
        console.error('Error providing semantic tokens:', error);
        return { data: [] };
    }
});
// Code actions
connection.onCodeAction(async (params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
        return [];
    }
    try {
        // Code actions will be implemented in Phase 4
        return [];
    }
    catch (error) {
        console.error('Error providing code actions:', error);
        return [];
    }
});
// Make the text document manager listen on the connection
documents.listen(connection);
// Listen on the connection
connection.listen();
console.log('RCL Language Server started');
//# sourceMappingURL=server.js.map