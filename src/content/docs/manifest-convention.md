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

The proposal is experimental. It has not been adopted by the A2A
spec maintainers; we are exploring whether the convention generalizes
beyond this stack. Discussion is anchored at A2A repo issue
[#1464](https://github.com/a2aproject/A2A/issues/1464) (the Extension
Governance Framework, which explicitly deferred schema validation as
future work).

## Generate a manifest for your own extension

If you own an A2A extension and want to publish a manifest at its URI,
the testbed CLI ships a generator that takes a Pydantic model and
emits the full envelope.

### 1. Install the testbed

```sh
git clone https://github.com/ravikiran438/a2a-testbed.git
cd a2a-testbed && pip install -e ".[test]"
```

Source install only; the package is not yet published to PyPI.
The live playground at <https://a2a-testbed.com> performs the
same validation in the browser without a local install.

### 2. Author a Pydantic model for the AgentCard payload

Mirror what your extension expects under `capabilities.extensions[].params`:

```python
# my_protocol/types.py
from pydantic import BaseModel, Field
from typing import Optional

class MyServiceRef(BaseModel):
    """Body of the capabilities.extensions[] entry for my-protocol."""
    version: str = Field(..., description="My-protocol semver this agent implements.")
    endpoint: str = Field(..., description="HTTPS URL the agent serves my-protocol traffic at.")
    supported_modes: list[str] = Field(default_factory=list)
```

### 3. Generate the manifest

```sh
a2a-testbed manifest generate \
  --extension-uri https://my-org.github.io/my-protocol/v1 \
  --name "My Protocol" \
  --version 1.0.0 \
  --ref-class my_protocol.types:MyServiceRef \
  --publisher "My Org" \
  --human-readable-spec https://my-org.github.io/my-protocol/spec.html \
  --output ./v1/manifest.json
```

The CLI introspects the Pydantic model, lifts its JSON Schema, wraps
it in the `ExtensionManifest` envelope (with the URI, version,
publisher, optional spec links), and writes the result to disk.

### 4. Host the manifest at its URI

Convention: `<extension_uri>/manifest.json` returns the JSON envelope.
Free hosting via GitHub Pages works well — push your repo, enable
Pages, and the file is served:

```
https://<user>.github.io/<repo>/v1/manifest.json
```

The URI inside the manifest's `extension.uri` field MUST match the
URL it is served from. The CLI's `--extension-uri` flag is what gets
written there, so set it to the public URL you intend to use.

### 5. Validate the manifest itself

```sh
a2a-testbed manifest validate ./v1/manifest.json
```

Schema-checks the envelope and verifies the embedded URI matches the
file path's expected location.

### 6. (Optional) Generate a human-readable spec doc

The CLI also renders a Markdown summary of the manifest — handy for
README sections or docs sites — via:

```sh
a2a-testbed manifest spec ./v1/manifest.json --output ./v1/SPEC.md
```

The output has a stable header and a structured field table; a
`--check` flag in CI catches drift between the manifest and the
checked-in markdown.

### 7. Validate AgentCards that declare your extension

Once the manifest is live, anyone can validate an AgentCard against
it without protocol-specific code:

```sh
a2a-testbed validate path/to/agent-card.json --allow-fetch
```

The live playground at <https://a2a-testbed.com> performs the same
validation in the browser via the **Validator** mode.

### What the manifest envelope looks like

The full envelope includes optional fields beyond the JSON Schema:

```json
{
  "manifest_version": "1.0",
  "extension": {
    "uri": "https://my-org.github.io/my-protocol/v1",
    "name": "My Protocol",
    "version": "1.0.0",
    "publisher": "My Org",
    "description": "Optional human-readable summary.",
    "human_readable_spec": "https://my-org.github.io/my-protocol/spec.html",
    "machine_readable_spec": "https://my-org.github.io/my-protocol/spec.proto"
  },
  "agent_card_payload_schema": { ... JSON Schema ... },
  "wire_artefacts": [
    {
      "endpoint": "POST /my-protocol/event",
      "request_schema": { ... },
      "response_schema": { ... }
    }
  ],
  "invariants": [
    {
      "id": "MP-1",
      "summary": "Every event must be acknowledged within 5 seconds.",
      "reference": "https://my-org.github.io/my-protocol/spec.html#mp-1"
    }
  ]
}
```

`agent_card_payload_schema` is the only required substantive field;
everything else is metadata for human readers and richer tooling.

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
