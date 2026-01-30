import { Editor as MonacoEditor, type OnMount } from '@monaco-editor/react';
import { useRef } from 'react';
import type * as monacoType from 'monaco-editor';

export interface CodeViewerProps {
	value: string;
	language: 'json' | 'javascript' | 'typescript';
	theme?: 'light' | 'dark';
}

/**
 * Read-only code viewer using Monaco Editor.
 * Provides syntax highlighting, line numbers, and code folding.
 */
export function CodeViewer({ value, language, theme = 'dark' }: CodeViewerProps) {
	const monacoRef = useRef<typeof monacoType | null>(null);

	const handleEditorDidMount: OnMount = (_editor, monaco) => {
		monacoRef.current = monaco;
		// Set the theme
		monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
	};

	return (
		<MonacoEditor
			height="100%"
			language={language}
			value={value}
			onMount={handleEditorDidMount}
			options={{
				readOnly: true,
				domReadOnly: true,
				minimap: { enabled: false },
				fontSize: 13,
				lineNumbers: 'on',
				scrollBeyondLastLine: false,
				automaticLayout: true,
				tabSize: 2,
				folding: true,
				foldingStrategy: 'auto',
				renderLineHighlight: 'none',
				lineNumbersMinChars: 3,
				glyphMargin: false,
				lineDecorationsWidth: 0,
				overviewRulerBorder: false,
				hideCursorInOverviewRuler: true,
				renderValidationDecorations: 'off',
				scrollbar: {
					vertical: 'auto',
					horizontal: 'auto',
					useShadows: false,
					verticalScrollbarSize: 10,
					horizontalScrollbarSize: 10,
				},
				contextmenu: false,
				selectionHighlight: false,
				occurrencesHighlight: 'off',
				cursorStyle: 'line-thin',
				cursorBlinking: 'solid',
			}}
		/>
	);
}
