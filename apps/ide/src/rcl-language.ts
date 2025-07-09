import * as monaco from 'monaco-editor';

// RCL Language Definition for Monaco Editor
export const RCL_LANGUAGE_ID = 'rcl';

// Keywords and tokens
const keywords = [
  'agent',
  'flow',
  'on',
  'match',
  'messages',
  'message',
  'config',
  'defaults',
  'with',
  'default',
  'richCard',
  'text',
  'suggestions',
  'reply',
  'action',
  'openUrl',
  'displayName',
  'description',
  'start',
  'import',
  'from',
  'as',
  'true',
  'false',
  'carousel',
  'saveEvent',
  'title',
  'media',
  'phoneNumber',
  'phoneLabel',
  'logoUri',
  'color',
  'startTime',
  'endTime',
];

const typeKeywords = ['url', 'money', 'phone', 'email', 'location', 'datetime', 'date', 'time'];

const controlKeywords = ['if', 'else', 'elif', 'match', 'default'];

// Language configuration
export const rclLanguageConfiguration: monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: '#',
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
    ['<', '>'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"', notIn: ['string'] },
    { open: "'", close: "'", notIn: ['string'] },
    { open: '<', close: '>' },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: '<', close: '>' },
  ],
  folding: {
    markers: {
      start: /^\s*(agent|flow|on|messages|config|message|richCard|carousel|suggestions)\s+\w+/,
      end: /^\s*$/,
    },
  },
  indentationRules: {
    increaseIndentPattern:
      /^\s*(agent|flow|on|messages|config|message|richCard|carousel|suggestions|if|else|elif|match)\s+.*$/,
    decreaseIndentPattern: /^\s*(else|elif)\s*.*$/,
  },
};

// Monarch tokenizer
export const rclMonarchLanguage: monaco.languages.IMonarchLanguage = {
  defaultToken: 'invalid',
  tokenPostfix: '.rcl',

  keywords,
  typeKeywords,
  controlKeywords,

  // Regular expressions
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  // The main tokenizer
  tokenizer: {
    root: [
      // Comments
      [/#.*$/, 'comment'],

      // Agent declaration
      [/^(\s*)(agent)(\s+)([A-Z]\w*)/, ['white', 'keyword', 'white', 'type.identifier']],

      // Flow declaration
      [/^(\s*)(flow)(\s+)([A-Z]\w*)/, ['white', 'keyword', 'white', 'type.identifier']],

      // On state declaration
      [/^(\s*)(on)(\s+)([A-Z]\w*)/, ['white', 'keyword', 'white', 'identifier']],

      // Message declaration
      [/^(\s*)(message)(\s+)([A-Z]\w*)/, ['white', 'keyword', 'white', 'identifier']],

      // Messages section
      [/^(\s*)(messages)(\s+)(Messages)/, ['white', 'keyword', 'white', 'type.identifier']],

      // Type tags
      [/<(\w+)\s+([^>]+)>/, ['delimiter.angle', { token: 'type', next: '@typeTag' }]],

      // Keywords
      [
        /[a-z_]\w*/,
        {
          cases: {
            '@keywords': 'keyword',
            '@typeKeywords': 'keyword.type',
            '@controlKeywords': 'keyword.control',
            '@default': 'identifier',
          },
        },
      ],

      // Identifiers (Title case)
      [/[A-Z]\w*/, 'type.identifier'],

      // Whitespace
      { include: '@whitespace' },

      // Delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [/[<>](?!@symbols)/, '@brackets'],
      [
        /@symbols/,
        {
          cases: {
            '->': 'operator',
            ':': 'delimiter',
            '@default': 'operator',
          },
        },
      ],

      // Numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, 'number'],

      // Strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-terminated string
      [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

      // Characters
      [/'[^\\']'/, 'string'],
      [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
      [/'/, 'string.invalid'],
    ],

    typeTag: [
      [/>/, { token: 'delimiter.angle', next: '@pop' }],
      [/[^>]+/, 'string'],
    ],

    string: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/#.*$/, 'comment'],
    ],
  },

  symbols: /[=><!~?:&|+\-*\/\^%]+/,
};

// Completion provider
export const rclCompletionProvider: monaco.languages.CompletionItemProvider = {
  provideCompletionItems: (model, position) => {
    const word = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };

    const suggestions: monaco.languages.CompletionItem[] = [];

    // Keywords
    keywords.forEach((keyword) => {
      suggestions.push({
        label: keyword,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: keyword,
        range: range,
      });
    });

    // Type keywords
    typeKeywords.forEach((type) => {
      suggestions.push({
        label: type,
        kind: monaco.languages.CompletionItemKind.TypeParameter,
        insertText: `<${type} $1>`,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
      });
    });

    // Common snippets
    const snippets = [
      {
        label: 'agent',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText:
          'agent ${1:AgentName}\n  displayName: "${2:Display Name}"\n  start: ${3:FlowName}\n  $0',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'Agent declaration',
      },
      {
        label: 'flow',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText:
          'flow ${1:FlowName}\n  start: ${2:InitialState}\n\n  on ${2:InitialState}\n    match @reply.text\n      "${3:Option}" -> ${4:NextState}\n      :default -> ${2:InitialState}\n  $0',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'Flow declaration',
      },
      {
        label: 'on',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText:
          'on ${1:StateName}\n  match @reply.text\n    "${2:trigger}" -> ${3:NextState}\n    :default -> ${1:StateName}\n  $0',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'State declaration',
      },
      {
        label: 'message',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText:
          'message ${1:MessageName}\n  text "${2:Message text}"\n  suggestions\n    reply "${3:Option}"\n  $0',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'Message declaration',
      },
      {
        label: 'richCard',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText:
          'richCard\n  title "${1:Title}"\n  description "${2:Description}"\n  suggestions\n    reply "${3:Option}"\n  $0',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'Rich card message',
      },
    ];

    snippets.forEach((snippet) => {
      suggestions.push({
        ...snippet,
        range: range,
      });
    });

    return { suggestions };
  },
};

// Register the language
export function registerRCLLanguage() {
  // Register language
  monaco.languages.register({ id: RCL_LANGUAGE_ID });

  // Set language configuration
  monaco.languages.setLanguageConfiguration(RCL_LANGUAGE_ID, rclLanguageConfiguration);

  // Set monarch tokens provider
  monaco.languages.setMonarchTokensProvider(RCL_LANGUAGE_ID, rclMonarchLanguage);

  // Register completion provider
  monaco.languages.registerCompletionItemProvider(RCL_LANGUAGE_ID, rclCompletionProvider);

  console.log('✅ RCL language registered for Monaco Editor');
}
