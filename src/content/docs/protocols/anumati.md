---
title: Anumati / ACAP
description: Agent Consent and Adherence Protocol — per-clause usage-policy evaluation with proof of adherence.
---

**Anumati** (Sanskrit for *consent, formal permission*) defines the **ACAP**
specification: Agent Consent and Adherence Protocol.

## The Gap

The A2A AgentCard communicates what an agent *can* do. It has no mechanism
for communicating what calling agents *are permitted to do* under the
callee's terms of service. Auth policy (OAuth scopes, RBAC) governs **who**
may call **which** endpoint. Usage policy governs **how** and **under what
conditions** a permitted action may be taken.

Under [UETA §14](https://www.uniformlaws.org/), the human principal is
legally bound by whatever terms their agent accepts, without
necessarily being aware. ACAP closes this gap.

## Three Primitives

| Primitive | What it records |
|---|---|
| `PolicyDocument` | The callee's versioned, machine-readable terms of service |
| `ConsentRecord` | The calling agent's parsed understanding and acceptance decision |
| `AdherenceEvent` | The calling agent's per-action policy evaluation with reasoning |

Together they shift consent from **proof of acceptance** ("I clicked agree")
to **proof of adherence** ("I evaluated §3.4.2 before acting and here is
my reasoning").

## Formal Verification

Seven safety properties and two liveness properties model-checked under
TLC. The TLA+ specification covers chain integrity, consent-before-action,
version-gated re-acceptance, and the no-disputed-permit invariant.

## Links

- **Paper:** [arXiv:2604.16524](https://arxiv.org/abs/2604.16524) · also on [Zenodo (DOI 10.5281/zenodo.19606339)](https://doi.org/10.5281/zenodo.19606339)
- **Repository:** [github.com/ravikiran438/agent-consent-protocol](https://github.com/ravikiran438/agent-consent-protocol)
- **Extension URI:** `https://github.com/ravikiran438/agent-consent-protocol/v1`
- **Tests:** 35 passing
- **MCP server:** `acap-mcp` (see [MCP Reference Servers](/agent-protocol-stack/developers/#mcp-reference-servers))
- **License:** Apache 2.0
