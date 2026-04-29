---
title: Phala
description: Principal-Declared Welfare Feedback for Autonomous Agent Networks.
---

**Phala** (Sanskrit for *fruit, the outcome of action*) defines a
principal-declared welfare feedback protocol for agent-to-agent networks.

## The Gap

Agent protocols define how tasks begin. They say nothing about whether
tasks ended well, who decides what *well* means, or whether the
cumulative effect of many well-ended tasks is improving the principal's
life or eroding it.

Every existing protocol-layer mechanism that propagates outcome signals
(RLHF at training time, MARL reward functions, advertising context
protocols) defines what a good outcome means from the service provider's
perspective. The principal does not. This is the *welfare inversion*.

## Five Primitives

| Primitive | What it records |
|---|---|
| `OutcomeEvent` | Objective facts of task resolution |
| `SatisfactionRecord` | Principal's quality signal (valence in [-1, 1]) |
| `BeliefUpdate` | Scalar weight adjustment propagated back through the network |
| `PrincipalSatisfactionModel` | Per-context, principal-authored definition of what *good* means |
| `WelfareTrace` | On-device longitudinal welfare signal modulating network learning rate |

The `PrincipalSatisfactionModel` is the primitive that closes the welfare
inversion: the principal declares what good means, and no agent may
substitute its own formula.

## Welfare Detector Panel Extension

The [welfare_detectors extension](https://github.com/ravikiran438/phala-protocol/tree/main/extensions/welfare_detectors)
adds a typed panel of specialized welfare detectors with deterministic
arbitration and a predictive welfare horizon. Phala Core's single
`BeliefUpdate` channel collapses every welfare dimension into one
scalar weight delta. The relevant welfare dimensions (cognitive load,
autonomy, dignity, social connection, pace) routinely conflict, and a
single scalar loses the information the agent needs to act well — most
acutely for elderly, autistic, or cognitively impaired principals.

| Primitive | What it records |
|---|---|
| `WelfareDetector` | Typed detector declaration with priority |
| `DetectorPanel` | Consumer-side declaration of accepted detector types |
| `TypedBeliefUpdate` | A `BeliefUpdate` carrying `detector_type` and `provenance_hash` |
| `WelfarePrediction` / `WelfareRealization` | Predicted vs realized welfare delta over a declared horizon |
| `MissingRealization` | Auto-emitted when a prediction's horizon elapses without a paired realization |

| Invariant | Purpose |
|---|---|
| WD-1 Typed Detector Composition | Untyped or unknown-type updates are rejected |
| WD-2 Arbitration Determinism | Conflicting updates resolve by declared priority + lower `provenance_hash` |
| WD-3 Predictive Welfare Horizon | Paired realizations stay within the prediction's horizon window |
| WD-4 Detector Provenance Disclosure | Every update carries an audit-fingerprint; BU-Privacy preserved |

Full specification with TLA+ model and TLC configuration at
[`extensions/welfare_detectors/`](https://github.com/ravikiran438/phala-protocol/tree/main/extensions/welfare_detectors).
The extension is additive: agents that do not declare a `DetectorPanel`
continue to operate under Phala Core's existing single-channel
`BeliefUpdate` model.

## Links

- **Paper:** [Zenodo DOI 10.5281/zenodo.19625612](https://doi.org/10.5281/zenodo.19625612)
- **Repository:** [github.com/ravikiran438/phala-protocol](https://github.com/ravikiran438/phala-protocol)
- **Extension URI:** `https://github.com/ravikiran438/phala-protocol/v1`
- **Tests:** 68 passing (Core + welfare_detectors + MCP)
- **MCP server:** `phala-mcp` — 11 tools (6 Core + 5 welfare_detectors); see [MCP Reference Servers](/agent-protocol-stack/developers/#mcp-reference-servers)
- **License:** Apache 2.0
