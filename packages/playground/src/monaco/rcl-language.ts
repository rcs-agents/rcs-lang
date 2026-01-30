import type * as monaco from 'monaco-editor';

export const rclLanguageConfig: monaco.languages.LanguageConfiguration = {
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
		{ open: '<', close: '>' },
		{ open: '"', close: '"', notIn: ['string'] },
		{ open: '"""', close: '"""', notIn: ['string'] },
	],
	surroundingPairs: [
		{ open: '{', close: '}' },
		{ open: '[', close: ']' },
		{ open: '(', close: ')' },
		{ open: '<', close: '>' },
		{ open: '"', close: '"' },
	],
};

export const rclTokensProvider: monaco.languages.IMonarchLanguage = {
	defaultToken: '',
	tokenPostfix: '.rcl',

	keywords: [
		'agent',
		'config',
		'defaults',
		'flow',
		'messages',
		'import',
		'as',
		'with',
		'match',
		'start',
		'on',
		'append',
		'set',
		'merge',
		'to',
		'into',
		'result',
		'end',
	],

	flowTermination: [':end', ':cancel', ':error'],

	literals: ['True', 'Yes', 'False', 'No', 'Off', 'Null', 'None', 'Void'],

	operators: ['->', '...'],

	symbols: /[=><!~?:&|+\-*\/\^%]+/,

	escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

	tokenizer: {
		root: [
			// Keywords
			[
				/[a-z][a-zA-Z0-9_]*/,
				{
					cases: {
						'@keywords': 'keyword',
						'@literals': 'constant',
						'@default': 'identifier.lower',
					},
				},
			],

			// Title Case Identifiers (section names, state names)
			[/[A-Z][A-Za-z0-9_-]*/, 'identifier.title'],

			// Variables
			[/@[a-zA-Z_][a-zA-Z0-9_]*/, 'variable'],

			// Flow termination atoms
			[/:(?:end|cancel|error)\b/, 'keyword.flow'],

			// Atoms
			[/:[a-zA-Z_][a-zA-Z0-9_]*/, 'constant.atom'],

			// Default case
			[/:default\b/, 'keyword'],

			// Attribute names (with colon)
			[/[a-z][a-zA-Z0-9_]+\s*:/, 'attribute'],

			// Numbers
			[/-?\d+\.?\d*([eE][+-]?\d+)?/, 'number'],

			// Strings
			[/"([^"\\]|\\.)*$/, 'string.invalid'], // non-terminated string
			[/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
			[/"""/, { token: 'string.quote', bracket: '@open', next: '@multilinestring' }],

			// Regex
			[/\/(?:[^\/\r\n\\]|\\.)+\//, 'regexp'],

			// Embedded code
			[/\$(?:js|ts)?>>>/, { token: 'embedded', next: '@embeddedmulti' }],
			[/\$(?:js|ts)?>[^\r\n]*/, 'embedded'],

			// Type tags
			[/<[a-zA-Z]+\s+[^>]+>/, 'type.tag'],

			// Operators
			[/->/, 'operator.arrow'],
			[/\.\.\./, 'operator.spread'],

			// Comments
			[/#.*$/, 'comment'],

			// Delimiters
			[/[{}()\[\]]/, '@brackets'],
			[/[<>](?!@symbols)/, '@brackets'],
			[/[,.]/, 'delimiter'],
		],

		string: [
			[/[^\\"#]+/, 'string'],
			[/#\{[^}]*\}/, 'variable.interpolation'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
		],

		multilinestring: [
			[/[^"]+/, 'string'],
			[/#\{[^}]*\}/, 'variable.interpolation'],
			[/"""/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
			[/"/, 'string'],
		],

		embeddedmulti: [
			[/[^<]+/, 'embedded'],
			[/<<</, { token: 'embedded', next: '@pop' }],
		],
	},
};

export function registerRclLanguage(monacoInstance: typeof monaco): void {
	monacoInstance.languages.register({ id: 'rcl' });
	monacoInstance.languages.setMonarchTokensProvider('rcl', rclTokensProvider);
	monacoInstance.languages.setLanguageConfiguration('rcl', rclLanguageConfig);
}
