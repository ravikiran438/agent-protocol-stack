---
title: Pramāṇa
description: Protocol-Layer Treatment of Claim Verification in Autonomous Agent Networks.
---

**Pramana** (Sanskrit for *valid means of knowledge*) defines a
protocol-layer claim verification primitive for agent-to-agent
networks. Every consequential agent output is wrapped in a typed
`ClaimAttestation` whose verification operation is deterministic
against the recorded source.

## The Gap

A2A and MCP standardize agent communication at the syntactic level
(messages, tasks, agent cards, tool calls, tool results). Neither
defines a typed vocabulary for the *epistemic ground* of an agent
output. A tool result in MCP is a content blob; an A2A agent
message is a text payload. Neither carries a typed attestation of
source URI, measurement record, or inference chain.

Production verification today splits into two unstandardized
halves. Probabilistic-verdict patterns (self-consistency voting,
confidence-scored outputs, reviewer LLM ensembles) produce judgments
about model outputs rather than the auditor-replayable artifact
regulators ask for; aggregating verdicts does not change their
category. Artifact-producing patterns (retrieval-augmented
generation with citations, tool-augmented traces,
generator-verifier loops as in FunSearch and AlphaEvolve, recent
multi-agent research systems such as Google's AI co-scientist)
produce vendor-specific records but no shared wire format. An
auditor inspecting a multi-vendor agent network cannot reconstruct
verification across patterns without bespoke per-vendor
integration.

Pramana defines the typed wire format that standardizes the
verification artifact across both halves. Each agent output
declares the epistemic ground that warrants the claim (measurement,
inference, analogy, or citation) plus the metadata required to
verify it independently against the recorded source.

## Four Primitives

| Primitive | Epistemic ground | Verification operation |
|---|---|---|
| `MeasurementClaim` | Direct observation / structured record | Source-record fetch and field match |
| `InferenceClaim` | Logical inference from prior claims | Inference-chain replay |
| `AnalogyClaim` | Similarity to a known reference case | Similarity recompute against reference |
| `CitationClaim` | Attribution to an authoritative source | Source fetch plus faithful-citation check |

For `MeasurementClaim` and `CitationClaim`, `verify()` is a
deterministic function of `(claim, source)` and no probabilistic
judge participates in the verification step. For `InferenceClaim`
and `AnalogyClaim` with LLM-backed oracles, Pramana's contribution
is narrower: the verification step's inputs and outputs are
audit-replayable. Deployments that need full deterministic
re-verification plug a deterministic oracle into the same
dependency slot without changing the wire format.

## Formal Verification

Five named safety invariants exhaustively verified under TLC across
three symmetry-reduced models (Lifecycle, Disclosure, Concurrency):
**38,563 distinct reachable states, 0 violations**.

| Invariant | Property |
|---|---|
| P-1 | Single Emission: each claim has at most one emission audit entry |
| P-2 | Verification Determinism: each claim's verification state is single-valued and terminal at most once |
| P-3 | Audit Completeness: every terminal verification, suppression, and disclosure is in the audit trail |
| P-4 | Disclosure Coupling: a claim shown to a principal has emit, verify, and disclose audit entries |
| SuppressionDisclosureDisjoint | No claim is both suppressed and shown to a principal |

## Claim-Attestation Wire Extension

The [claim-attestation extension](https://github.com/ravikiran438/pramana-attestation/tree/main/extensions/claim-attestation)
adds three deployment-grade invariants that make Pramana Core's
single-agent lifecycle guarantees checkable end-to-end across an
agent network.

| Invariant | Purpose |
|---|---|
| CA-1 Reachability | Every emitted attestation includes `verify_endpoint_hint` so any receiver can round-trip verification |
| CA-2 SLA-Bound | Every accepted attestation reaches a terminal verification state within the declared `sla_window_ms` |
| CA-3 Offline Re-verifiability | Every `VerificationOutcome` is re-verifiable offline given `(claim, source_digest, artifact_signature)` |

CA-1 and CA-3 are TLC-verified; CA-2 is enforced at runtime by the
extension's validators.

## Links

- **Full paper:** [Pramāṇa (full text)](/agent-protocol-stack/papers/pramana/)
- **Paper:** *Pramāṇa: A Protocol-Layer Treatment of Claim
  Verification in Autonomous Agent Networks* ([arXiv:2605.20312](https://arxiv.org/abs/2605.20312))
- **Repository:** [github.com/ravikiran438/pramana-attestation](https://github.com/ravikiran438/pramana-attestation)
- **Extension URI:** `https://ravikiran438.github.io/pramana-attestation/v1`
- **Tests:** 84 passing (59 Core + 25 claim-attestation extension)
- **License:** Apache 2.0
