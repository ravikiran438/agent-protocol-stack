# Agent Protocol Stack — Documentation Site

Unified documentation site for the four-protocol stack for
accountable, accessible, and welfare-aware autonomous agent networks:

- **Anumati / ACAP** — Agent Consent and Adherence Protocol
- **Phala** — Principal-declared welfare feedback
- **Pratyahara / NERVE** — Behavioral integrity monitoring
- **Sauvidya / PACE** — Principal accessibility envelope

Live site: <https://ravikiran438.github.io/agent-protocol-stack/>

Each protocol is independently maintained in its own repository, has
its own Zenodo DOI paper, and ships a reference Python implementation
plus a reference MCP server. This site is the common entry point for
developers adopting one or more of the four protocols.

## Companion repositories

| Protocol | Repository | Paper |
|---|---|---|
| ACAP | [agent-consent-protocol](https://github.com/ravikiran438/agent-consent-protocol) | [10.5281/zenodo.19606339](https://doi.org/10.5281/zenodo.19606339) |
| Phala | [phala-protocol](https://github.com/ravikiran438/phala-protocol) | [10.5281/zenodo.19625612](https://doi.org/10.5281/zenodo.19625612) |
| NERVE | [pratyahara-nerve](https://github.com/ravikiran438/pratyahara-nerve) | [10.5281/zenodo.19628589](https://doi.org/10.5281/zenodo.19628589) |
| PACE | [sauvidya-pace](https://github.com/ravikiran438/sauvidya-pace) | [10.5281/zenodo.19633139](https://doi.org/10.5281/zenodo.19633139) |
| Yathartha (NERVE extension) | [pratyahara-nerve/extensions/yathartha](https://github.com/ravikiran438/pratyahara-nerve/tree/main/extensions/yathartha) | [10.5281/zenodo.19659633](https://doi.org/10.5281/zenodo.19659633) |

## Project layout

```
.
├── public/
├── src/
│   └── content/
│       └── docs/
│           ├── index.mdx
│           ├── overview.md
│           ├── composition.md
│           ├── developers.md
│           └── protocols/
│               ├── anumati.md
│               ├── acap-extensions.md
│               ├── phala.md
│               ├── pratyahara.md
│               └── sauvidya.md
└── astro.config.mjs
```

Markdown and MDX files under `src/content/docs/` are routed by file
path; sidebar ordering is declared in `astro.config.mjs`.

## Commands

All commands run from the root of the project:

| Command | Action |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build the production site to `./dist/` |
| `npm run preview` | Preview the build locally before deploying |
| `npm run astro ...` | Run Astro CLI commands (e.g. `astro check`) |

## Deploy

The site deploys to GitHub Pages under `/agent-protocol-stack/`.
Configuration is in `astro.config.mjs` (`site`, `base`). Pushes to
`main` trigger the deploy workflow.

## Built with

[Astro](https://astro.build) and [Starlight](https://starlight.astro.build).
For the underlying framework's own documentation see the
[Starlight docs](https://starlight.astro.build/) and the
[Astro documentation](https://docs.astro.build).

## License

Apache 2.0, consistent with the four protocol repositories this site
documents.
