---
title: Overview
description: The structural gaps in the agent protocol stack and the four extensions that address them.
---

## The Problem

The Agent2Agent (A2A) protocol governs how agents discover, authenticate,
and exchange tasks with each other. The Model Context Protocol (MCP) governs
how agents call tools and interpret results. Neither governs what happens
at three critical boundaries:

1. **The policy boundary.** A2A's AgentCard describes what an agent *can* do.
   It has no mechanism for what calling agents *are permitted to do* under
   the callee's terms of service.

2. **The outcome boundary.** A2A's task lifecycle ends at `completed` or
   `failed`. It has no vocabulary for whether the outcome served the
   principal, or whether the agents involved should behave differently
   next time.

3. **The integrity boundary.** A2A authenticates agents at the transport
   layer (TLS, Bearer tokens). It does not detect agents whose behavior
   has drifted after authentication, whether from adversarial compromise,
   RL misalignment, or model update side effects.

4. **The principal boundary.** Every protocol assumes the principal can see,
   hear, read, comprehend, decide in real time, and provide consent. For
   1.3 billion people with disabilities and every adult whose capabilities
   are declining with age, this assumption is structurally exclusionary.

## Four Protocols, Four Gaps

| Protocol | Gap addressed | Phase |
|---|---|---|
| [Sauvidya / PACE](/agent-protocol-stack/protocols/sauvidya/) | Accessibility: can the principal participate? | Precondition |
| [Anumati / ACAP](/agent-protocol-stack/protocols/anumati/) | Consent: did the caller honor the callee's terms? | Entry |
| [Pratyahara / NERVE](/agent-protocol-stack/protocols/pratyahara/) | Integrity: is the agent still trustworthy? | Ongoing |
| [Phala](/agent-protocol-stack/protocols/phala/) | Welfare: did the action serve the principal? | Exit |

Each protocol is **independent**. You can deploy any one without the others.
They are also **composable**: deploying multiple protocols on the same
AgentCard produces compound guarantees that no single protocol provides alone.

## Design Principles

All four protocols share three architectural commitments:

1. **Non-breaking A2A/MCP extensions.** Every protocol uses the standard
   `capabilities.extensions` mechanism. No core spec changes are required.
   Agents that do not understand an extension ignore it.

2. **Companion repositories with tests.** Each protocol has a Python
   reference implementation with Pydantic types, runtime validators, and
   a pytest suite. What the paper specifies, the code enforces.

3. **Honest validation framing.** No protocol claims more than it has
   demonstrated. TLA+ model checking, numerical simulation, and runtime
   validators are clearly distinguished from empirical deployment evidence.

## Author

**Ravi Kiran Kadaboina** — Independent Researcher, M.S. Computer
Engineering, University of New Mexico, 2011.

All protocols are published as Zenodo preprints under Apache 2.0.
