// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import markdoc from '@astrojs/markdoc';
import starlightLlmsTxt from 'starlight-llms-txt';
import starlightLinksValidator from 'starlight-links-validator';
import starlightTypeDoc from 'starlight-typedoc';
// import starlightPackageManagers from 'starlight-package-managers'; // Still has compatibility issues
import react from '@astrojs/react';

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packagesDir = resolve(__dirname, '../../packages');

// https://astro.build/config
export default defineConfig({
	site: 'https://rcl.rcsagents.io',
	vite: {
		resolve: {
			alias: {
				// Explicitly resolve @rcs-lang packages to their dist folders
				'@rcs-lang/ast': resolve(packagesDir, 'ast/dist/index.js'),
				'@rcs-lang/core': resolve(packagesDir, 'core/dist/index.js'),
				'@rcs-lang/csm': resolve(packagesDir, 'csm/dist/index.js'),
				'@rcs-lang/parser': resolve(packagesDir, 'parser/dist/index.js'),
				'@rcs-lang/compiler': resolve(packagesDir, 'compiler/dist/index.js'),
				'@rcs-lang/file-system': resolve(packagesDir, 'file-system/dist/index.js'),
				'@rcs-lang/diagram': resolve(packagesDir, 'diagram/dist/index.js'),
				'@rcs-lang/diagram/web': resolve(packagesDir, 'diagram/dist/web-diagram.js'),
				'@rcs-lang/playground': resolve(packagesDir, 'playground/dist'),
				'@rcs-lang/simulator': resolve(packagesDir, 'simulator/dist/index.js'),
				'@rcs-lang/simulator/react': resolve(packagesDir, 'simulator/dist/react.js'),
			},
			conditions: ['import', 'module', 'browser', 'default'],
		},
		plugins: [
			{
				name: 'resolve-rcs-subpath-exports',
				enforce: 'pre',
				resolveId(source, importer) {
					// Handle @rcs-lang package subpath exports
					if (source === '@rcs-lang/diagram/web') {
						return resolve(packagesDir, 'diagram/dist/web-diagram.js');
					}
					if (source === '@rcs-lang/simulator/react') {
						return resolve(packagesDir, 'simulator/dist/react.js');
					}
					return null;
				},
			},
		],
		optimizeDeps: {
			// Include core RCS packages for pre-bundling (needed for browser compilation)
			include: [
				'@rcs-lang/parser',
				'@rcs-lang/compiler',
				'@rcs-lang/csm',
				'@rcs-lang/file-system',
				'@rcs-lang/file-system/browser',
			],
			// Exclude packages not needed in browser or with ESM issues
			exclude: [
				'@rcs-lang/diagram',
				'@rcs-lang/diagram/web',
				// Exclude solid-js - it's only for the simulator's solid variant
				'solid-js',
				'solid-js/web',
				'lucide-solid',
				'lit',
			],
		},
		ssr: {
			// Don't try to bundle these for SSR - they're only used in browser via dynamic imports
			noExternal: [],
			external: [
				'@rcs-lang/csm',
				'@rcs-lang/parser',
				'@rcs-lang/compiler',
				'@rcs-lang/file-system',
				'@rcs-lang/diagram',
				'@rcs-lang/diagram/web',
				'@rcs-lang/playground',
				'@rcs-lang/simulator',
				'@rcs-lang/simulator/react',
				'vscode-languageserver-types',
				'@ark-ui/react',
				'@monaco-editor/react',
				'lucide-react',
				// Exclude solid-js - it's only for the simulator's solid variant
				'solid-js',
				'solid-js/web',
				'lucide-solid',
				'lit',
			],
		},
		build: {
			rollupOptions: {
				// Only mark vscode-languageserver-types as external (server-side only)
				// RCS packages need to be bundled for browser use in playground
				external: (id) => {
					if (id === 'vscode-languageserver-types') return true;
					// Diagram is only loaded on demand and can be external
					if (id.startsWith('@rcs-lang/diagram')) return true;
					return false;
				},
				onwarn(warning, defaultHandler) {
					// Suppress warnings about external dependencies in dynamic imports
					if (warning.code === 'UNRESOLVED_IMPORT' && warning.message?.includes('@rcs-lang')) {
						return;
					}
					defaultHandler(warning);
				},
			},
		},
	},
	integrations: [
		react(),
		markdoc(),
		starlight({
			title: 'RCL Documentation',
			description: 'Rich Communication Language - A domain-specific language for creating RCS agents.',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/rcs-agents/rcs-lang' },
			],
			plugins: [
				starlightLlmsTxt({
					includeFull: true,
					includeSmall: true,
				}),
				// starlightLinksValidator(), // Temporarily disabled due to /api/ast/readme/ link issue
				// starlightPackageManagers(), // Still has compatibility issues
				starlightTypeDoc({
					entryPoints: ['../../packages/ast/src/index.ts'],
					tsconfig: './typedoc.tsconfig.json',
					output: 'api/ast',
					sidebar: {
						label: 'AST API Reference',
						collapsed: false,
					},
				}),
			],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Overview', slug: '' },
						{ label: 'Getting Started', slug: 'getting-started' },
						{ label: 'Playground', link: '/playground' },
						{ label: 'Examples', slug: 'examples' },
					],
				},
				{
					label: 'Language Reference',
					items: [
						{ label: 'Formal Specification', slug: 'rcl-formal-specification' },
						{ label: 'Output Specification', slug: 'rcl-output-specification' },
						{ label: 'JSON Schemas', slug: 'schemas' },
						{ label: 'API Reference', slug: 'api' },
					],
				},
				{
					label: 'Packages',
					items: [
						{ label: 'Overview', slug: 'packages' },
						{
							label: 'Core Infrastructure',
							collapsed: true,
							items: [
								{ label: '@rcs-lang/core', slug: 'packages/core' },
								{ label: '@rcs-lang/ast', slug: 'packages/ast' },
								{ label: '@rcs-lang/types', slug: 'packages/types' },
								{ label: '@rcs-lang/file-system', slug: 'packages/file-system' },
							]
						},
						{
							label: 'Language Processing',
							collapsed: true,
							items: [
								{ label: '@rcs-lang/parser', slug: 'packages/parser' },
								{ label: '@rcs-lang/compiler', slug: 'packages/compiler' },
								{ label: '@rcs-lang/validation', slug: 'packages/validation' },
							]
						},
						{
							label: 'Developer Tools',
							collapsed: true,
							items: [
								{ label: '@rcs-lang/cli', slug: 'packages/cli' },
								{ label: '@rcs-lang/language-service', slug: 'packages/language-service' },
							]
						},
						{
							label: 'Runtime',
							collapsed: true,
							items: [
								{ label: '@rcs-lang/csm', slug: 'packages/csm' },
							]
						},
					],
				},
				{
					label: 'Development',
					items: [
						{ label: 'Release Guide', slug: 'release-guide' },
						{ label: 'Local CI', slug: 'local-ci' },
						{ label: 'FSM Requirements', slug: 'conversational-agent-fsm-requirements' },
					],
				},
				{
					label: 'LLM Resources',
					items: [
						{ label: 'llms.txt', link: '/llms.txt' },
						{ label: 'llms-full.txt', link: '/llms-full.txt' },
						{ label: 'llms-small.txt', link: '/llms-small.txt' },
					],
				},
			],
		}),
	],
});
