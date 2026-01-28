import { useEffect, useState } from 'react';
import type { BundledLanguage, BundledTheme, HighlighterGeneric } from 'shiki';
import { createHighlighter } from 'shiki';

type Highlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;

const highlighterCache: { instance: Highlighter | null } = { instance: null };

/**
 * Hook to highlight code using Shiki.
 * Handles theme detection and caching for performance.
 */
export function useShiki(code: string, language: BundledLanguage) {
	const [highlighted, setHighlighted] = useState<string>('');
	const [theme, setTheme] = useState<'light' | 'dark'>('light');

	// Detect theme from document
	useEffect(() => {
		const detectTheme = () => {
			const isDark = document.documentElement.dataset.theme === 'dark';
			setTheme(isDark ? 'dark' : 'light');
		};

		detectTheme();

		// Watch for theme changes
		const observer = new MutationObserver(detectTheme);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme'],
		});

		return () => observer.disconnect();
	}, []);

	// Highlight code when it changes or theme changes
	useEffect(() => {
		let cancelled = false;

		const highlight = async () => {
			try {
				// Initialize highlighter if not cached
				if (!highlighterCache.instance) {
					highlighterCache.instance = await createHighlighter({
						themes: ['github-light', 'github-dark'],
						langs: ['json', 'javascript'],
					});
				}

				const highlighter = highlighterCache.instance;
				const themeName = theme === 'dark' ? 'github-dark' : 'github-light';

				const html = highlighter.codeToHtml(code, {
					lang: language,
					theme: themeName,
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
	}, [code, language, theme]);

	return highlighted;
}

function escapeHtml(text: string): string {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}
