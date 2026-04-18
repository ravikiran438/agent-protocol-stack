---
title: For A2A Developers
description: How to declare all four protocol extensions on a single AgentCard.
---

## AgentCard with All Four Extensions

All four protocols use the standard A2A `capabilities.extensions`
mechanism. An agent that supports all four declares them in a single
array:

```json
{
  "name": "service-provider-agent",
  "version": "1.0",
  "capabilities": {
    "extensions": [
      {
        "uri": "https://github.com/ravikiran438/agent-consent-protocol/v1",
        "description": "ACAP: usage-policy consent and per-action adherence.",
        "required": true
      },
      {
        "uri": "https://github.com/ravikiran438/phala-protocol/v1",
        "description": "Phala: principal-declared welfare feedback.",
        "required": false
      },
      {
        "uri": "https://github.com/ravikiran438/pratyahara-nerve/v1",
        "description": "NERVE: behavioral integrity monitoring.",
        "required": true
      },
      {
        "uri": "https://github.com/ravikiran438/sauvidya-pace/v1",
        "description": "PACE: principal accessibility and capacity.",
        "required": true
      }
    ]
  }
}
```

### Why some are `required: true`

| Protocol | Default | Reason |
|---|---|---|
| ACAP | `true` | Callee wants callers to accept usage policy before invoking skills |
| Phala | `false` | Welfare feedback is advisory (BU-3: agents MAY ignore BeliefUpdates) |
| NERVE | `true` | Security layer: callee expects callers to participate in the trust envelope |
| PACE | `true` | Agents serving principals with registered PCPs MUST adapt interaction |

### Agents that support fewer protocols

An agent can declare any subset. A deployment that only needs consent:

```json
{
  "capabilities": {
    "extensions": [
      {
        "uri": "https://github.com/ravikiran438/agent-consent-protocol/v1",
        "description": "ACAP: usage-policy consent and per-action adherence.",
        "required": true
      }
    ]
  }
}
```

Agents that do not understand an extension ignore the entry. No error,
no failure, no negotiation. The extensions are additive.

## MCP Integration

For MCP tool servers, each protocol registers as a custom server
capability in the `serverCapabilities` object during the `initialize`
handshake, keyed by the same extension URI:

```json
{
  "serverCapabilities": {
    "tools": {},
    "https://github.com/ravikiran438/pratyahara-nerve/v1": {
      "neuron_type": "processing",
      "behavioral_fingerprint": "sha256:...",
      "trust_score": 0.88
    },
    "https://github.com/ravikiran438/sauvidya-pace/v1": {
      "supported_modalities": ["voice", "text"],
      "supported_languages": ["en", "te", "hi"]
    }
  }
}
```

## Companion Repositories

| Protocol | Package | Tests | TLA+ |
|---|---|---|---|
| ACAP | [agent-consent-protocol](https://github.com/ravikiran438/agent-consent-protocol) | 35 | Full state machine |
| Phala | [phala-protocol](https://github.com/ravikiran438/phala-protocol) | 10 | Skeleton |
| NERVE | [pratyahara-nerve](https://github.com/ravikiran438/pratyahara-nerve) | 39 | Full state machine |
| PACE | [sauvidya-pace](https://github.com/ravikiran438/sauvidya-pace) | 32 | Full state machine |

Total: **116 tests** across the stack.

## Papers

| Protocol | DOI |
|---|---|
| Anumati / ACAP | [10.5281/zenodo.19606339](https://doi.org/10.5281/zenodo.19606339) |
| Phala | [10.5281/zenodo.19625612](https://doi.org/10.5281/zenodo.19625612) |
| Pratyahara / NERVE | [10.5281/zenodo.19628589](https://doi.org/10.5281/zenodo.19628589) |
| Sauvidya / PACE | [10.5281/zenodo.19633139](https://doi.org/10.5281/zenodo.19633139) |
