---
title: Samsara
description: Dispositional Continuity, Turnkey Instantiation, and Substrate Identity for Ephemeral Agent Instances.
---

**Samsara** (Sanskrit for *the cycle*) defines what an agent instance carries
across its own death: not what it did, but what it became. Three composable
extensions, one contract, *store how to be, never what happened*.

## The Gap

Agent memory today is episodic. Retrieval systems and skill libraries store
*what happened* and rebuild competence at runtime, which has three structural
costs: a **retrieval tax** paid per task to re-derive competence from episodes,
a **privacy liability** in raw episodes retained indefinitely, and a
**cold-start window** between boot and the completion of runtime loading, during
which the instance accepts work it is not yet equipped for.

The transports have the same asymmetry. MCP makes initialization normative, and
only negotiated capabilities may be used; its shutdown section defines no
messages at all. A2A defines terminal states for tasks but is silent on agent
lifetime. Birth is specified; death is left to the operating system.

## The Approach

Pretraining already exemplifies the alternative: a model is shaped by
experiences it cannot recall. Samsara extends that property across deployment
lifetimes. A life ends, its trace is distilled into typed, outcome-weighted
rules, the episodes are destroyed, and the merged result pins the next
instance's birth state. Nothing else crosses either boundary.

Because the merge is deterministic and order-independent, deletion is
re-derivation: replay the merge history without a life's distillate and the
result is bit-identical to what the remaining distillates would have produced.
That is exact removal of a life's *direct* contribution, which gradient-based
unlearning cannot offer. It is deliberately not counterfactual, since later
lives were born from stores that still held the forgotten dispositions.

This is a contract for the **competence** channel, not a replacement for
retrieval. A dispositional store does not carry facts, which the battery
measures rather than assumes.

## Three Protocols

| Protocol | Guarantee |
|---|---|
| **Janma** (birth) | Complete-at-birth instantiation from a declarative manifest; scoped capabilities; bounded lifetime; shutdown emits exactly one distillation obligation (J-1..4) |
| **Samskara** (latent impression) | Episodes destroyed at shutdown by contract; only consent-gated, leakage-validated, outcome-signed dispositions persist; append-only lineage; any life's own contribution exactly excisable by replay (S-1..5) |
| **Advaita** (non-dual) | K concurrent instances share one lineage-rooted identity with per-body attribution and deterministic, order-independent reconciliation (AD-1..4) |

Valence is principal-declared rather than read off the environment, which binds
the karma loop to [Phala](/agent-protocol-stack/protocols/phala/); persistence
is authorized per `(category, training)` cell of the
[Anumati](/agent-protocol-stack/protocols/anumati/) consent grid; corrective
distillates travel under [Abhyasa](/agent-protocol-stack/protocols/abhyasa/)
custody while reinforcing ones travel best-effort; and a lineage replays
deterministically, so it can be attested as a
[Pramana](/agent-protocol-stack/protocols/pramana/) claim.

## What the Battery Found

A preregistered battery on two models (five tasks, four arms within-subject,
eight seeds, eight lives per lineage) tested the contract live.

- **The dissociation.** On a task needing a remembered fact, recall was 1.00
  under episodic retrieval and 0.00 under both dispositional continuity and no
  persistence, while the same lineages kept their procedural gains.
- **Privacy.** Planted PII canaries recurred in the episodic arm's prompts
  (20 and 24 occurrences) and never once in the dispositional arm's.
- **Portability.** A store distilled by one model transferred to the other
  intact, on the single-rule task tested.
- **Parity.** On procedural work the dispositional arm was non-inferior to
  episodic retrieval against a registered 10 pp margin, at a fraction of the
  retained state. Eight seeds cannot show it is better.
- **One registered prediction was falsified**: recovery within two lives of a
  task change did not hold, and is reported as false.

Thirteen deviations from the registration are recorded, eight of them post-data.

## Links

- **Full paper:** [Samsara (full text)](/agent-protocol-stack/papers/samsara/)
- **Paper:** [Zenodo DOI 10.5281/zenodo.21912633](https://doi.org/10.5281/zenodo.21912633)
- **Repository:** [github.com/ravikiran438/samsara-layer](https://github.com/ravikiran438/samsara-layer)
- **Extension URIs:** `.../janma/v1`, `.../samskara/v1`, `.../advaita/v1`
- **Validation:** thirteen invariants runtime-enforced, 41 tests; preregistration and full deviation record in the repository
- **License:** Apache 2.0
