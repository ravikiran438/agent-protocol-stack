---
title: Abhyasa
description: Custody Transfer of Governance Obligations over Unreliable Channels in Agent Networks.
---

**Abhyasa** (Sanskrit for *sustained practice*) defines a transport-agnostic
framework that delivers governance obligations under a **deliver-or-report**
guarantee.

## The Gap

Agent transports deliver *messages* reliably. None of them addresses whether a
*governance obligation* a message carries — a consent decision, a corrective
welfare signal — survives a channel that is lossy, intermittent, or
partitioned. Over such a channel a best-effort governance message can be
silently dropped, leaving an agent acting without authorization or correction,
with no party aware the signal was lost. Transport reliability is necessary but
not sufficient for governance correctness.

## The Approach

Guaranteed delivery is impossible over an unreliable channel (the Two Generals
Problem; FLP), and by the end-to-end argument the missing guarantee belongs at
the endpoints, not in an intermediary queue. A governance obligation whose loss
carries *asymmetric* cost can declare a **fail-safe polarity**: a pure
`safe(O)` default the sender applies locally when delivery is not confirmed.
Abhyasa lifts the custody-transfer mechanism of delay-tolerant networking from
opaque bundles to governance obligations, pairs at-least-once delivery with
idempotent application (effectively-once), and adds a principal-side fail-safe
that holds without a working reverse channel.

## Four Invariants

| Invariant | Behaviour |
|---|---|
| AB-1 Custody | Retain responsibility until an `applied`/`declined` ack or the deadline. |
| AB-2 Persistence | On timeout, retry under bounded exponential backoff up to `max_retries`. |
| AB-3 Idempotency | Receiver applies at most once, keyed on `obligation_id`, persisted with the effect. |
| AB-4 Fail-safe | On deadline without `applied`/`declined`, run `safe(O)` on principal-side state and escalate. |

**Deliver-or-report:** every admissible obligation terminates as `applied`,
`declined`, or `escalated` — never silent loss.

## Admissibility (AC-1)

An obligation is *Abhyasa-admissible* only if it declares a fail-safe polarity.
The framework is invariant-agnostic; instantiations supply the polarity rule:

| Instantiation | Polarity | `safe(O)` |
|---|---|---|
| Anumati (consent) | binary | withhold principal-mediated authority (fail-closed) |
| Phala, corrective (`valence < 0`) | signed | down-weight principal-side routing to the target |
| OAuth, token revocation | binary | authorization server stops honoring the token (fail-closed) |

Reinforcing Phala updates and OAuth issue/refresh are benign-loss and travel
best-effort, not under custody.

## Links

- **Full paper:** [Abhyasa (full text)](/agent-protocol-stack/papers/abhyasa/)
- **Paper:** [Zenodo DOI 10.5281/zenodo.20644821](https://doi.org/10.5281/zenodo.20644821)
- **Repository:** [github.com/ravikiran438/abhyasa-protocol](https://github.com/ravikiran438/abhyasa-protocol)
- **Extension URI:** `https://ravikiran438.github.io/abhyasa-protocol/v1`
- **Formal model:** TLA+ / TLC, 31,250 distinct states, no violation
- **License:** Apache 2.0
