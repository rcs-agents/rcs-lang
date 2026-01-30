import { useEffect, useState } from 'react';
import type { BundledLanguage, BundledTheme, HighlighterGeneric } from 'shiki';
import { createHighlighter } from 'shiki';

type Highlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;

const highlighterCache: { instance: Highlighter | null } = { instance: null };

/**
 * Hook to highlight code using Shiki.
 * Handles theme detection, line numbers, and caching for performance.
 */
export function useShiki(code: string, language: BundledLanguage) {
	const [highlighted, setHighlighted] = useState<string>('');

	// Highlight code when it changes
	useEffect(() => {
		let cancelled = false;

		const highlight = async () => {
			try {
				// Initialize highlighter if not cached
				if (!highlighterCache.instance) {
					highlighterCache.instance = await createHighlighter({
						themes: ['catppuccin-mocha', 'catppuccin-latte'],
						langs: ['json', 'javascript'],
					});
				}

				const highlighter = highlighterCache.instance;

				// Use Catppuccin Mocha to match the editor theme
				const html = highlighter.codeToHtml(code, {
					lang: language,
					theme: 'catppuccin-mocha',
					transformers: [
						{
							// Add line numbers
							line(node, line) {
								node.properties['data-line'] = line;
							},
						},
					],
				});

				if (!cancelled) {
					setHighlighted(html);
				}
			} catch (error) {
				console.error('Failed to highlight code:', error);
				// Fallback to plain code
				if (!cancelled) {
					setHighlighted(`<pre><code>${escapeHtml(code)}</code></pre>`);
				}
			}
		};

		if (code) {
			highlight();
		} else {
			setHighlighted('');
		}

		return () => {
			cancelled = true;
		};
	}, [code, language]);

	return highlighted;
}

function escapeHtml(text: string): string {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}
