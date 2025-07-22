// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import markdoc from '@astrojs/markdoc';
import starlightLlmsTxt from 'starlight-llms-txt';
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
					label: 'Package Documentation',
					items: [
						{ label: 'AST Package', slug: 'packages/ast' },
						{ label: 'Parser Package', slug: 'packages/parser' },
						{ label: 'Compiler Package', slug: 'packages/compiler' },
						{ label: 'Language Service', slug: 'packages/language-service' },
						{ label: 'CSM Package', slug: 'packages/csm' },
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
