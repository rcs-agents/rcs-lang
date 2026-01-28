import type * as monaco from 'monaco-editor';

export const rclLightTheme: monaco.editor.IStandaloneThemeData = {
	base: 'vs',
	inherit: true,
	rules: [
		{ token: 'keyword', foreground: '0000ff', fontStyle: 'bold' },
		{ token: 'keyword.flow', foreground: '0000ff', fontStyle: 'bold' },
		{ token: 'identifier.title', foreground: '267f99' },
		{ token: 'identifier.lower', foreground: '001080' },
		{ token: 'variable', foreground: '795e26' },
		{ token: 'variable.interpolation', foreground: '795e26', fontStyle: 'italic' },
		{ token: 'constant', foreground: '0000ff' },
		{ token: 'constant.atom', foreground: '0000ff' },
		{ token: 'attribute', foreground: '267f99', fontStyle: 'bold' },
		{ token: 'string', foreground: 'a31515' },
		{ token: 'string.quote', foreground: 'a31515' },
		{ token: 'string.escape', foreground: 'ee0000', fontStyle: 'bold' },
		{ token: 'regexp', foreground: '811f3f' },
		{ token: 'number', foreground: '098658' },
		{ token: 'embedded', foreground: '000000', background: 'f0f0f0' },
		{ token: 'type.tag', foreground: '267f99' },
		{ token: 'comment', foreground: '008000', fontStyle: 'italic' },
		{ token: 'operator', foreground: '000000' },
		{ token: 'operator.arrow', foreground: '0000ff' },
		{ token: 'operator.spread', foreground: '0000ff' },
		{ token: 'delimiter', foreground: '000000' },
	],
	colors: {
		'editor.foreground': '#000000',
		'editor.background': '#ffffff',
		'editorCursor.foreground': '#000000',
		'editor.lineHighlightBackground': '#f0f0f0',
		'editorLineNumber.foreground': '#237893',
		'editor.selectionBackground': '#add6ff',
		'editor.inactiveSelectionBackground': '#e5ebf1',
	},
};

export const rclDarkTheme: monaco.editor.IStandaloneThemeData = {
	base: 'vs-dark',
	inherit: true,
	rules: [
		{ token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
		{ token: 'keyword.flow', foreground: '569cd6', fontStyle: 'bold' },
		{ token: 'identifier.title', foreground: '4ec9b0' },
		{ token: 'identifier.lower', foreground: '9cdcfe' },
		{ token: 'variable', foreground: 'dcdcaa' },
		{ token: 'variable.interpolation', foreground: 'dcdcaa', fontStyle: 'italic' },
		{ token: 'constant', foreground: '569cd6' },
		{ token: 'constant.atom', foreground: '569cd6' },
		{ token: 'attribute', foreground: '4ec9b0', fontStyle: 'bold' },
		{ token: 'string', foreground: 'ce9178' },
		{ token: 'string.quote', foreground: 'ce9178' },
		{ token: 'string.escape', foreground: 'd7ba7d', fontStyle: 'bold' },
		{ token: 'regexp', foreground: 'd16969' },
		{ token: 'number', foreground: 'b5cea8' },
		{ token: 'embedded', foreground: 'd4d4d4', background: '2a2a2a' },
		{ token: 'type.tag', foreground: '4ec9b0' },
		{ token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
		{ token: 'operator', foreground: 'd4d4d4' },
		{ token: 'operator.arrow', foreground: '569cd6' },
		{ token: 'operator.spread', foreground: '569cd6' },
		{ token: 'delimiter', foreground: 'd4d4d4' },
	],
	colors: {
		'editor.foreground': '#d4d4d4',
		'editor.background': '#1e1e1e',
		'editorCursor.foreground': '#aeafad',
		'editor.lineHighlightBackground': '#2a2a2a',
		'editorLineNumber.foreground': '#858585',
		'editor.selectionBackground': '#264f78',
		'editor.inactiveSelectionBackground': '#3a3d41',
	},
};

export function registerRclThemes(monacoInstance: typeof monaco): void {
	monacoInstance.editor.defineTheme('rcl-light', rclLightTheme);
	monacoInstance.editor.defineTheme('rcl-dark', rclDarkTheme);
}
