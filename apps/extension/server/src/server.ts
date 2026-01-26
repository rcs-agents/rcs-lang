import {
  type CodeAction,
  type CodeActionParams,
  type CompletionItem,
  CompletionItemKind,
  type Definition,
  type DefinitionParams,
  type Diagnostic,
  DiagnosticSeverity,
  DidChangeConfigurationNotification,
  type DocumentDiagnosticReport,
  DocumentDiagnosticReportKind,
  type DocumentFormattingParams,
  type DocumentSymbol,
  type DocumentSymbolParams,
  type FoldingRange,
  type FoldingRangeParams,
  type Hover,
  type HoverParams,
  type InitializeParams,
  type InitializeResult,
  type Location,
  type PrepareRenameParams,
  ProposedFeatures,
  type ReferenceParams,
  type RenameParams,
  type SemanticTokens,
  type SemanticTokensParams,
  type SignatureHelpParams,
  SymbolKind,
  type TextDocumentPositionParams,
  TextDocumentSyncKind,
  TextDocuments,
  type TextEdit,
  createConnection,
} from 'vscode-languageserver/node';

import { RCLParser } from '@rcl/parser';
import type { RCLSettings } from '@rcl/parser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { CodeActionProvider } from './features/codeActions';
import { CompletionProvider } from './features/completion';
import { DefinitionProvider } from './features/definition';
import { DiagnosticsProvider } from './features/diagnostics';
import { FoldingProvider } from './features/folding';
import { FormattingProvider } from './features/formatting';
import { HoverProvider } from './features/hover';
import { ReferencesProvider } from './features/references';
import { RenameProvider } from './features/rename';
import { SemanticTokensProvider } from './features/semanticTokens';
import { SignatureHelpProvider } from './features/signatureHelp';
import { SymbolsProvider } from './features/symbols';
import { SyntaxValidator } from './syntaxValidator';

// Create a connection for the server, using Node's IPC as a transport
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager
const documents = new TextDocuments(TextDocument);

// Initialize providers
const parser = new RCLParser();
const syntaxValidator = new SyntaxValidator();
const completionProvider = new CompletionProvider(parser);
const hoverProvider = new HoverProvider(parser);
const definitionProvider = new DefinitionProvider(parser);
const referencesProvider = new ReferencesProvider(parser);
const symbolsProvider = new SymbolsProvider(parser);
const formattingProvider = new FormattingProvider(parser);
const foldingProvider = new FoldingProvider(parser);
const semanticTokensProvider = new SemanticTokensProvider(parser);
const diagnosticsProvider = new DiagnosticsProvider(parser, syntaxValidator);
const renameProvider = new RenameProvider(parser);
const codeActionProvider = new CodeActionProvider(parser);
const signatureHelpProvider = new SignatureHelpProvider(parser);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let _hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
  console.log('Initializing RCL Language Server');

  const capabilities = params.capabilities;

  // Check client capabilities
  hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration);
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  _hasDiagnosticRelatedInformationCapability =
    !!capabilities.textDocument?.publishDiagnostics?.relatedInformation;

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Code completion
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: [' ', ':', '.', '$', '<', '|'],
      },
      // Hover information
      hoverProvider: true,
      // Signature help
      signatureHelpProvider: {
        triggerCharacters: [':', ' ', '"'],
        retriggerCharacters: [','],
      },
      // Go to definition
      definitionProvider: true,
      // Find references
      referencesProvider: true,
      // Document symbols
      documentSymbolProvider: true,
      // Rename
      renameProvider: {
        prepareProvider: true,
      },
      // Workspace symbols
      workspaceSymbolProvider: true,
      // Code actions
      codeActionProvider: {
        codeActionKinds: ['quickfix', 'refactor'],
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
          delta: false,
        },
      },
      // Diagnostics
      diagnosticProvider: {
        interFileDependencies: false,
        workspaceDiagnostics: false,
      },
    },
  };

  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }

  return result;
});

connection.onInitialized(() => {
  console.log('RCL Language Server initialized');

  if (hasConfigurationCapability) {
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }

  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event) => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});

// Default settings
const defaultSettings: RCLSettings = {
  maxNumberOfProblems: 1000,
  validation: {
    enabled: true,
  },
  completion: {
    enabled: true,
  },
  formatting: {
    enabled: true,
  },
};

let globalSettings: RCLSettings = defaultSettings;

// Cache settings of all open documents
const documentSettings: Map<string, Thenable<RCLSettings>> = new Map();

connection.onDidChangeConfiguration((change) => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = (change.settings.rcl || defaultSettings) as RCLSettings;
  }

  // Revalidate all open documents
  connection.languages.diagnostics.refresh();
});

function getDocumentSettings(resource: string): Thenable<RCLSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }

  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'rcl',
    });
    documentSettings.set(resource, result);
  }

  return result;
}

// Only keep settings for open documents
documents.onDidClose((e) => {
  documentSettings.delete(e.document.uri);
  parser.clearCache(e.document.uri);
});

// Handle document content changes
documents.onDidChangeContent((change) => {
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
      kind: DocumentDiagnosticReportKind.Full,
      items: await validateTextDocument(document),
    } satisfies DocumentDiagnosticReport;
  }
  return {
    kind: DocumentDiagnosticReportKind.Full,
    items: [],
  } satisfies DocumentDiagnosticReport;
});

async function validateTextDocument(textDocument: TextDocument): Promise<Diagnostic[]> {
  const settings = await getDocumentSettings(textDocument.uri);

  if (!settings.validation.enabled) {
    return [];
  }

  try {
    const rclDocument = await parser.parseDocument(
      textDocument.getText(),
      textDocument.uri,
      textDocument.version,
    );
    const diagnostics = await diagnosticsProvider.getDiagnostics(rclDocument, settings);

    // Limit the number of problems reported
    return diagnostics.slice(0, settings.maxNumberOfProblems);
  } catch (error) {
    console.error('Error validating document:', error);
    return [
      {
        severity: DiagnosticSeverity.Error,
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
        message: `Internal validation error: ${(error as Error).message}`,
        source: 'rcl',
      },
    ];
  }
}

// Code completion
connection.onCompletion(async (params: TextDocumentPositionParams): Promise<CompletionItem[]> => {
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
  } catch (error) {
    console.error('Error providing completions:', error);
    return [];
  }
});

connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
  return completionProvider.resolveCompletion(item);
});

// Hover
connection.onHover(async (params: HoverParams): Promise<Hover | null> => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return null;
  }

  try {
    return await hoverProvider.getHover(document, params.position);
  } catch (error) {
    console.error('Error providing hover:', error);
    return null;
  }
});

// Signature help
connection.onSignatureHelp(async (params: SignatureHelpParams) => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return null;
  }

  try {
    return await signatureHelpProvider.getSignatureHelp(document, params.position);
  } catch (error) {
    console.error('Error providing signature help:', error);
    return null;
  }
});

// Go to definition
connection.onDefinition(async (params: DefinitionParams): Promise<Definition | null> => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return null;
  }

  try {
    return await definitionProvider.getDefinition(document, params.position);
  } catch (error) {
    console.error('Error providing definition:', error);
    return null;
  }
});

// Find references
connection.onReferences(async (params: ReferenceParams): Promise<Location[]> => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return [];
  }

  try {
    return await referencesProvider.getReferences(document, params.position, params.context);
  } catch (error) {
    console.error('Error providing references:', error);
    return [];
  }
});

// Prepare rename
connection.onPrepareRename(async (params: PrepareRenameParams) => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return null;
  }

  try {
    return await renameProvider.prepareRename(document, params.position);
  } catch (error) {
    console.error('Error preparing rename:', error);
    return null;
  }
});

// Rename
connection.onRenameRequest(async (params: RenameParams) => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return null;
  }

  try {
    return await renameProvider.provideRenameEdits(document, params.position, params.newName);
  } catch (error) {
    console.error('Error performing rename:', error);
    return null;
  }
});

// Document symbols
connection.onDocumentSymbol(async (params: DocumentSymbolParams): Promise<DocumentSymbol[]> => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return [];
  }

  try {
    return await symbolsProvider.getDocumentSymbols(document);
  } catch (error) {
    console.error('Error providing document symbols:', error);
    return [];
  }
});

// Document formatting
connection.onDocumentFormatting(async (params: DocumentFormattingParams): Promise<TextEdit[]> => {
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
  } catch (error) {
    console.error('Error formatting document:', error);
    return [];
  }
});

// Folding ranges
connection.onFoldingRanges(async (params: FoldingRangeParams): Promise<FoldingRange[]> => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return [];
  }

  try {
    return await foldingProvider.getFoldingRanges(document);
  } catch (error) {
    console.error('Error providing folding ranges:', error);
    return [];
  }
});

// Semantic tokens
connection.languages.semanticTokens.on(
  async (params: SemanticTokensParams): Promise<SemanticTokens> => {
    const document = documents.get(params.textDocument.uri);
    if (!document) {
      return { data: [] };
    }

    try {
      return await semanticTokensProvider.getSemanticTokens(document);
    } catch (error) {
      console.error('Error providing semantic tokens:', error);
      return { data: [] };
    }
  },
);

// Code actions
connection.onCodeAction(async (params: CodeActionParams): Promise<CodeAction[]> => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return [];
  }

  try {
    return await codeActionProvider.getCodeActions(document, params);
  } catch (error) {
    console.error('Error providing code actions:', error);
    return [];
  }
});

// Make the text document manager listen on the connection
documents.listen(connection);

// Listen on the connection
connection.listen();

console.log('RCL Language Server started');
