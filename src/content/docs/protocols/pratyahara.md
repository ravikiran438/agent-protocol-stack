---
title: Pratyahara / NERVE
description: Neural Evaluation for Rogue Agent Verification in Ecosystems — behavioral integrity for multi-agent networks.
---

**Pratyahara** (Sanskrit for *withdrawal of the senses; turning awareness
inward*) defines the **NERVE** specification: **N**eural **E**valuation
for **R**ogue Agent **V**erification in **E**cosystems.

## The Gap

Agents in production drift. Reinforcement learning misalignment, tool
poisoning, self-healing side effects, and model update artifacts all
produce behavioral changes that operate inside the trust boundary where
input filtering is structurally blind. Existing defenses assume the
threat is external. NERVE addresses the internal integrity problem.

## Five Primitives

| Primitive | What it does |
|---|---|
| `AgentNeuron` | Behavioral baseline and trust state per agent |
| `SynapticChannel` | Communication link with selective permeability and myelination |
| `MicroglialObserver` | Lightweight surveillance agent detecting drift and collusion |
| `NeuralTrustEnvelope` | Asymmetric trust dynamics (trust harder to earn than to lose) |
| `HomeostasisTrace` | Network-level health monitoring for systemic attacks |

## Two SynapticChannel-Level Refinements

These are refinements that live inside the `SynapticChannel` primitive,
not separate extensions. They are listed here because they appear in
the NERVE paper alongside the five primitives.

- `GlymphaticPolicy` for context hygiene (stale context clearance)
- Inhibitory gating for error cascade prevention

Protocol-level extensions that sit alongside the five primitives (rather
than refining one of them) are listed separately further down this
page; see the Yathartha section below.

## Eight Attack Vectors Addressed

| Attack | NERVE mechanism |
|---|---|
| Behavioral drift | Cumulative fingerprint drift + asymmetric trust |
| MCP tool poisoning | Result fingerprint + permeability policy |
| Agent collusion | Cross-agent correlation detection |
| Supply chain compromise | Network-level activation distribution shift |
| Observer compromise | Dual coverage + consensus rate monitoring |
| Session smuggling | Fingerprint deviation from baseline |
| Context bloat | GlymphaticPolicy: age expiry, depth limits, compression |
| Error cascade | Quality threshold, refractory period, cascade depth cap |

## Formal Verification

15 safety properties. Full TLA+ state machine with Init/Next/Spec
verified under TLC (N-1, N-3, N-4, N-9, N-10, N-14, N-15 modeled).

## Yathartha Extension (Capability Surface)

The [Yathartha extension](https://github.com/ravikiran438/pratyahara-nerve/tree/main/extensions/yathartha)
([Zenodo DOI 10.5281/zenodo.19659633](https://doi.org/10.5281/zenodo.19659633))
adds a `CapabilitySurface` primitive and three invariants (N-16, N-17,
N-18) that condition behavioral drift detection on an observed
baseline. Without this extension, a `MicroglialObserver` cannot
distinguish *jaggedness* (the agent was always incompetent at this
task, no baseline exists) from *drift* (the agent used to be competent
and no longer is). Yathartha makes the distinction explicit at the
protocol layer.

| Primitive | What it records |
|---|---|
| `CapabilityRegion` | A named region of the task space with a declared probe battery |
| `ProbeBatteryResult` | Immutable, SHA-256-addressed outcome of running a region's probes |
| `CapabilitySurface` | The agent's published map of covered regions + refresh cadence + uncovered_policy |
| `SurfaceChangeEvent` | Distinct event type recording coverage transitions |

| Invariant | Purpose |
|---|---|
| N-16 Coverage-Conditional Drift | Observers flag drift only within `covered_regions`; out-of-coverage tasks defer to `uncovered_policy` |
| N-17 Probe Battery Maintenance | Battery version bumps trigger a full baseline re-run; results across versions are not comparable |
| N-18 Capability Surface Integrity | Every coverage transition is recorded as its own event type |

Full specification with TLA+ model and TLC configuration at
[`extensions/yathartha/`](https://github.com/ravikiran438/pratyahara-nerve/tree/main/extensions/yathartha).
The extension is additive: agents that do not declare a
`CapabilitySurface` continue to operate under NERVE's existing
single-fingerprint drift model.

## Links

- **Paper:** [Zenodo DOI 10.5281/zenodo.19628589](https://doi.org/10.5281/zenodo.19628589)
- **Repository:** [github.com/ravikiran438/pratyahara-nerve](https://github.com/ravikiran438/pratyahara-nerve)
- **Extension URI:** `https://github.com/ravikiran438/pratyahara-nerve/v1`
- **Tests:** 94 passing (Core + Yathartha + MCP)
- **MCP server:** `nerve-mcp` — 10 tools (7 Core + 3 Yathartha); see [MCP Reference Servers](/agent-protocol-stack/developers/#mcp-reference-servers)
- **License:** Apache 2.0
