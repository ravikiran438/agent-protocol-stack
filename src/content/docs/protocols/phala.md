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

## Links

- **Paper:** [Zenodo DOI 10.5281/zenodo.19625612](https://doi.org/10.5281/zenodo.19625612)
- **Repository:** [github.com/ravikiran438/phala-protocol](https://github.com/ravikiran438/phala-protocol)
- **Extension URI:** `https://github.com/ravikiran438/phala-protocol/v1`
- **Tests:** 10 passing
- **License:** Apache 2.0
