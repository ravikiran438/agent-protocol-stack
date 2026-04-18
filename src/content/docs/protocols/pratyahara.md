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

## Five Primitives + Two Extensions

| Primitive | What it does |
|---|---|
| `AgentNeuron` | Behavioral baseline and trust state per agent |
| `SynapticChannel` | Communication link with selective permeability and myelination |
| `MicroglialObserver` | Lightweight surveillance agent detecting drift and collusion |
| `NeuralTrustEnvelope` | Asymmetric trust dynamics (trust harder to earn than to lose) |
| `HomeostasisTrace` | Network-level health monitoring for systemic attacks |

**Extensions on SynapticChannel:**
- `GlymphaticPolicy` for context hygiene (stale context clearance)
- Inhibitory gating for error cascade prevention

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

## Links

- **Paper:** [Zenodo DOI 10.5281/zenodo.19628589](https://doi.org/10.5281/zenodo.19628589)
- **Repository:** [github.com/ravikiran438/pratyahara-nerve](https://github.com/ravikiran438/pratyahara-nerve)
- **Extension URI:** `https://github.com/ravikiran438/pratyahara-nerve/v1`
- **Tests:** 39 passing
- **License:** Apache 2.0
