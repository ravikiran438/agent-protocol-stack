// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://ravikiran438.github.io',
	base: '/agent-protocol-stack',
	integrations: [
		starlight({
			title: 'Agent Protocol Stack',
			description: 'Five protocol extensions for accountable, accessible, welfare-aware, and audit-verifiable autonomous agent networks.',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/ravikiran438' }],
			pagefind: true,
			sidebar: [
				{ label: 'Overview', slug: 'overview' },
				{
					label: 'Protocols',
					items: [
						{ label: 'Anumati / ACAP (Consent)', slug: 'protocols/anumati' },
						{ label: 'ACAP Extensions', slug: 'protocols/acap-extensions' },
						{ label: 'Phala (Welfare)', slug: 'protocols/phala' },
						{ label: 'Pratyahara / NERVE (Integrity)', slug: 'protocols/pratyahara' },
						{ label: 'Sauvidya / PACE (Accessibility)', slug: 'protocols/sauvidya' },
						{ label: 'Pramana (Verification)', slug: 'protocols/pramana' },
					],
				},
				{ label: 'How They Compose', slug: 'composition' },
				{ label: 'For A2A Developers', slug: 'developers' },
				{ label: 'Extension Manifest Convention', slug: 'manifest-convention' },
				{ label: 'The Observer Pattern', slug: 'observer-pattern' },
			],
		}),
	],
});
