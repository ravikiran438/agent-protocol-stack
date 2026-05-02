---
title: Extension Manifest Convention
description: A schema-discovery convention for A2A capabilities.extensions[] payloads.
---

A2A 1.0 lets an agent declare extensions on its AgentCard via
`capabilities.extensions[]`, with each entry carrying a `uri` and an
opaque `params` payload. The spec does not yet prescribe how a
third-party validator should *understand* that payload — what fields
are required, what types are expected, what invariants the protocol
enforces.

We propose a research-stage convention to fill that gap: every
extension publishes a self-describing **manifest** at its URI.

```
GET <extension_uri>/manifest.json   →   ExtensionManifest (JSON Schema for the payload)
```

A generic validator can:

1. Read `capabilities.extensions[].uri` from the AgentCard
2. Fetch `<uri>/manifest.json`
3. Validate the entry's `params` against the manifest's JSON Schema
4. Report findings — without any protocol-specific code

This is not in the A2A spec today. It is exploratory; we are testing
whether the convention generalizes.

## Live reference manifests

The four protocols in this stack each publish a manifest at the URI
each agent declares. Anyone with a JSON-Schema validator can fetch
these directly:

| Protocol | Manifest |
|---|---|
| ACAP | [`/agent-consent-protocol/v1/manifest.json`](https://ravikiran438.github.io/agent-consent-protocol/v1/manifest.json) |
| Phala | [`/phala-protocol/v1/manifest.json`](https://ravikiran438.github.io/phala-protocol/v1/manifest.json) |
| NERVE | [`/pratyahara-nerve/v1/manifest.json`](https://ravikiran438.github.io/pratyahara-nerve/v1/manifest.json) |
| PACE | [`/sauvidya-pace/v1/manifest.json`](https://ravikiran438.github.io/sauvidya-pace/v1/manifest.json) |

Sub-extensions follow the same pattern at `<protocol-uri>/extensions/<name>/v1/manifest.json`. Every URI in the table above is self-consistent: the manifest's
`extension.uri` field equals the URL it was fetched from.

## What the manifest contains

| Field | Purpose |
|---|---|
| `extension.uri` | The canonical URI this manifest describes (must equal the fetch URL) |
| `extension.version` | Protocol version |
| `extension.publisher` / `human_readable_spec` / `machine_readable_spec` | Identity + paper / proto pointers |
| `agent_card_payload_schema` | The JSON Schema that the `params` payload of `capabilities.extensions[]` must satisfy |
| `wire_artefacts[]` | Optional: declared endpoints (e.g., `/phala/satisfaction`) the extension exposes |
| `invariants[]` | Optional: human-readable invariant identifiers and references for audit |

A generic validator only needs `extension.uri` and `agent_card_payload_schema` to do its job. The other fields are for human readers and richer tooling.

## Two layers of validation

Manifests give you **schema discovery**. They do not capture every
invariant a protocol enforces (cross-field rules, time-window
constraints, monotonicity, etc.). For deeper checks, this stack pairs
each manifest with the protocol's MCP server:

| Layer | What it checks | How |
|---|---|---|
| **Manifest** | Structural shape of `capabilities.extensions[].params` | Fetch `<uri>/manifest.json`, validate against JSON Schema |
| **MCP delegation** | Cross-field invariants, runtime-only rules, semantic correctness | Spawn the protocol's MCP server, call `validate_*` tools |

The two layers compose. A card can pass schema and fail semantic
validation (e.g., ACAP `acceptance_required=true` without an
`acceptance_endpoint`). The schema layer doesn't catch that; the MCP
layer does.

## Why this exists

A2A 1.0 §3.1 defines `AgentCard.capabilities.extensions[]` and
specifies the `uri` discovery mechanism. It does **not** specify a
schema for the entry's payload. This means any third party fetching
an AgentCard sees an opaque object and must either:

- hard-code knowledge of every protocol they want to validate against, or
- ignore extension declarations they don't recognize.

Neither scales. As more protocols ship — consent, welfare, integrity,
accessibility, and the dozens that haven't been authored yet — a
schema-discovery convention reduces this to one fetch per URI.

The proposal is research-stage. It has not been adopted by the A2A
spec maintainers; we are exploring whether the convention generalizes
beyond this stack.

## Status

- ✅ Convention defined; published as JSON-Schema-based `ExtensionManifest` envelope
- ✅ Four reference protocols (ACAP, Phala, NERVE, PACE) publish manifests
  per this convention; seven sub-extensions follow the same pattern
- ✅ Manifests resolvable over HTTPS via GitHub Pages; each manifest's
  `extension.uri` is self-consistent with the URL it is fetched from
- ✅ End-to-end validation demonstrated: any JSON-Schema validator can
  fetch `<uri>/manifest.json` and verify a declared payload, with
  cross-field invariants delegated to the protocol's own runtime tools
- ⏳ Upstream A2A spec proposal — not yet filed
