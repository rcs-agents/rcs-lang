import { Editor as MonacoEditor, type OnMount } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';
import type * as monacoType from 'monaco-editor';
import { registerRclLanguage } from '../monaco/rcl-language';
import { registerRclThemes } from '../monaco/rcl-theme';

export interface EditorProps {
	value: string;
	onChange: (value: string) => void;
	diagnostics?: Array<{
		message: string;
		severity: 'error' | 'warning' | 'info';
		range: {
			start: { line: number; character: number };
			end: { line: number; character: number };
		};
	}>;
	theme?: 'light' | 'dark';
}

export function Editor({ value, onChange, diagnostics = [], theme = 'light' }: EditorProps) {
	const editorRef = useRef<monacoType.editor.IStandaloneCodeEditor | null>(null);
	const monacoRef = useRef<typeof monacoType | null>(null);

	const handleEditorDidMount: OnMount = (editor, monaco) => {
		editorRef.current = editor;
		monacoRef.current = monaco;

		// Register RCL language and themes
		registerRclLanguage(monaco);
		registerRclThemes(monaco);

		// Set the theme
		monaco.editor.setTheme(theme === 'dark' ? 'rcl-dark' : 'rcl-light');

		// Focus the editor
		editor.focus();
	};

	// Update error markers when diagnostics change
	useEffect(() => {
		if (!editorRef.current || !monacoRef.current) return;

		const monaco = monacoRef.current;
		const model = editorRef.current.getModel();
		if (!model) return;

		const markers = diagnostics.map((d) => ({
			severity:
				d.severity === 'error'
					? monaco.MarkerSeverity.Error
					: d.severity === 'warning'
						? monaco.MarkerSeverity.Warning
						: monaco.MarkerSeverity.Info,
			message: d.message,
			startLineNumber: d.range.start.line + 1,
			startColumn: d.range.start.character + 1,
			endLineNumber: d.range.end.line + 1,
			endColumn: d.range.end.character + 1,
		}));

		monaco.editor.setModelMarkers(model, 'rcl', markers);
	}, [diagnostics]);

	// Update theme when it changes
	useEffect(() => {
		if (!monacoRef.current) return;
		monacoRef.current.editor.setTheme(theme === 'dark' ? 'rcl-dark' : 'rcl-light');
	}, [theme]);

	return (
		<MonacoEditor
			height="100%"
			language="rcl"
			value={value}
			onChange={(value) => onChange(value || '')}
			onMount={handleEditorDidMount}
			options={{
				minimap: { enabled: false },
				fontSize: 14,
				lineNumbers: 'on',
				scrollBeyondLastLine: false,
				automaticLayout: true,
				tabSize: 2,
				insertSpaces: true,
				wordWrap: 'on',
				wrappingIndent: 'indent',
				folding: true,
				foldingStrategy: 'indentation',
				renderLineHighlight: 'all',
				scrollbar: {
					vertical: 'visible',
					horizontal: 'visible',
					useShadows: false,
				},
			}}
		/>
	);
}
