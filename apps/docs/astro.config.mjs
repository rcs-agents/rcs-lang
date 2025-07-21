// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import markdoc from '@astrojs/markdoc';

// https://astro.build/config
export default defineConfig({
	site: 'https://rcs-agents.github.io',
	base: '/rcs-lang',
	integrations: [
		markdoc(),
		starlight({
			title: 'RCL Documentation',
			description: 'Rich Communication Language - A domain-specific language for creating RCS agents.',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/rcs-agents/rcs-lang' },
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
			],
		}),
	],
});
