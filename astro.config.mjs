// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://ravikiran438.github.io',
	base: '/agent-protocol-stack',
	integrations: [
		starlight({
			title: 'Agent Protocol Stack',
			description: 'Composable protocol extensions for accountable, accessible, welfare-aware, reliably-delivered, and audit-verifiable autonomous agent networks.',
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
						{ label: 'Pratyahara / NERVE (Integrity, incl. Yathartha)', slug: 'protocols/pratyahara' },
						{ label: 'Sauvidya / PACE (Accessibility)', slug: 'protocols/sauvidya' },
						{ label: 'Pramana (Verification)', slug: 'protocols/pramana' },
						{ label: 'Abhyasa (Delivery)', slug: 'protocols/abhyasa' },
					],
				},
				{ label: 'How They Compose', slug: 'composition' },
				{ label: 'Governance over AG-UI', slug: 'ag-ui' },
				{ label: 'For A2A Developers', slug: 'developers' },
				{ label: 'Extension Manifest Convention', slug: 'manifest-convention' },
				{ label: 'The Observer Pattern', slug: 'observer-pattern' },
				{
					label: 'Full Papers',
					items: [
						{ label: 'Anumati (Proof of Adherence)', slug: 'papers/anumati' },
						{ label: 'Phala (Welfare Feedback)', slug: 'papers/phala' },
						{ label: 'Pratyahara (NERVE)', slug: 'papers/pratyahara' },
						{ label: 'Yathartha (Jagged Intelligence)', slug: 'papers/yathartha' },
						{ label: 'Sauvidya (PACE)', slug: 'papers/sauvidya' },
						{ label: 'Pramana (Claim Verification)', slug: 'papers/pramana' },
						{ label: 'Abhyasa (Custody Transfer)', slug: 'papers/abhyasa' },
					],
				},
			],
		}),
	],
});
