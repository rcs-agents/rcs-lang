// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import markdoc from '@astrojs/markdoc';
import starlightLlmsTxt from 'starlight-llms-txt';
import starlightLinksValidator from 'starlight-links-validator';
import starlightTypeDoc from 'starlight-typedoc';
// import starlightPackageManagers from 'starlight-package-managers'; // Still has compatibility issues
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	site: 'https://rcl.rcsagents.io',
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
				starlightLinksValidator(),
				// starlightPackageManagers(), // Still has compatibility issues
				starlightTypeDoc({
					entryPoints: [
						'../../packages/ast/src/index.ts',
						'../../packages/types/src/index.ts'
					],
					tsconfig: '../../tsconfig.base.json',
					output: 'api',
					sidebar: {
						label: 'API Reference',
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
