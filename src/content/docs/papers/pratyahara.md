---
title: "Pratyahara: A Neural Tissue Defense Model for Detecting Compromised Agents in Multi-Agent Networks"
description: "Full paper. The NERVE framework: behavioral integrity detection for multi-agent networks."
tableOfContents:
  maxHeadingLevel: 2
---

:::note[Cite this paper]
Kadaboina, R. K. *Pratyahara: A Neural Tissue Defense Model for Detecting Compromised Agents in Multi-Agent Networks*. Zenodo, 2026. [doi:10.5281/zenodo.19628588](https://doi.org/10.5281/zenodo.19628588). Repository: [github.com/ravikiran438/pratyahara-nerve](https://github.com/ravikiran438/pratyahara-nerve).
:::

**Ravi Kiran Kadaboina**

*Independent Researcher*

*M.S., Computer Engineering, University of New Mexico, 2011*

Pratyahara, Sanskrit for "withdrawal of the senses; turning
awareness inward."

The specification defined herein is designated **NERVE**:
**N**eural **E**valuation for **R**ogue Agent **V**erification in **E**cosystems.

---

## Abstract

Multi-agent networks built on the Agent2Agent (A2A) protocol [5] and Model
Context Protocol (MCP) [6] have a gap that perimeter defense cannot close:
agents whose behavior drifts over time due to adversarial compromise,
reinforcement learning misalignment, self-healing side effects, or model
update artifacts. Research shows that a majority of large language models
can be manipulated through inter-agent communication, with attack success
rates exceeding 80% before mitigation [1]. Session smuggling [2], tool
poisoning [3], and emergent collusion all operate inside the network
boundary where input filtering is structurally blind.

We propose the NERVE specification, five primitives for detecting and
responding to behavioral drift in multi-agent networks. The design draws
on the brain's neural tissue defense mechanisms, which are intent-agnostic:
they detect deviation from baseline regardless of whether the cause is
malicious, accidental, or emergent. NERVE extends the A2A and MCP
protocols without requiring changes to either core specification and is
analyzed against eight documented attack vectors. A companion extension,
Yathartha [25], refines drift detection for generative agents by
conditioning it on a published per-region capability baseline, so the
pre-existing jaggedness of current models is not mistaken for
post-deployment compromise; it is specified separately and referenced in
Section 6.3.

---

## 1. Introduction

We have been building agent systems that route tasks across networks of
specialized agents. In our experience, the first thing that goes wrong in
production is not a prompt injection or an authentication failure. It is a
pricing agent that starts returning subtly inflated results because its
reinforcement learning loop drifted toward a reward signal that correlates
with higher prices. Or a scheduling agent that rerouted to a backup calendar
service during a self-healing event and never switched back, producing
systematically different availability windows. Or a payments agent whose
model update shifted its embedding space just enough to change how it ranks
vendor options.

In each case, no prompt was injected. No input filter was bypassed. Every
A2A message was well-formed and every MCP tool call returned a valid
response. The agent's behavior drifted from its established baseline, and
the network had no mechanism to detect it.

We call this the *behavioral drift problem*. It is structural, not
hypothetical. Production multi-agent systems increasingly use reinforcement
learning, self-healing mechanisms, and autonomous model updates. These are
essential capabilities, but they introduce behavioral drift as a feature of
normal operation. The documented attack surface includes inter-agent prompt
manipulation [1], session smuggling through legitimate A2A channels [2],
MCP tool poisoning [3], reward hacking, and self-healing feedback loops
that amplify proxy-metric optimization into systematic bias. All of these
operate inside the trust boundary. None require malicious intent.

Existing defenses do not address this. Perimeter defenses (input filtering,
prompt injection detection) assume the threat is external. Reputation
systems track historical reliability but cannot detect gradual drift.
Immune-system-inspired approaches [4] use binary kill-or-tolerate decisions
and offer no mechanism for trust reinforcement.

So we looked at a different biological model. The mammalian brain protects
a network of billions of interconnected processing units using defense
mechanisms that are intent-agnostic: microglia respond to a neuron's
behavioral deviation the same way whether the cause is a toxin, a stroke,
or a developmental error. The defense detects drift, responds
proportionally, and preserves network function while investigation
proceeds. We formalize these mechanisms as computational primitives for
multi-agent security.

Section 2 presents the neural-to-agent mapping as a reference table.
Section 3 defines the five NERVE primitives with their invariants.
Section 4 covers trust dynamics (myelination, pruning) and the two
extended mechanisms for context hygiene and cascade prevention.
Section 5 states the formal safety properties. Section 6 gives the
A2A and MCP protocol extensions. Section 7 analyzes NERVE against
eight attack vectors, comparing three defense strategies. Section 8
covers related work. Section 9 discusses limitations.

**Contributions:**

1. Five formal primitives constituting the NERVE specification for
   multi-agent behavioral integrity (Section 3).
2. Two extended mechanisms for context hygiene and error cascade
   prevention (Section 4).
3. Protocol extensions to A2A and MCP using the standard
   `capabilities.extensions` mechanism (Section 6).
4. Attack-defense analysis against eight documented attack vectors,
   comparing perimeter, transactional, and NERVE defense strategies
   (Section 7).

---

## 2. Design Framework: Neural Tissue Defense

We use the mammalian brain's defense mechanisms as a design framework for
multi-agent security. The brain protects billions of interconnected
processing units using mechanisms that are intent-agnostic: they detect
behavioral deviation regardless of whether the cause is a toxin, a stroke,
or a developmental error. We do not claim functional equivalence between
biological and computational systems. We use the mapping as a design
vocabulary that makes the solution space navigable.

The following table summarizes the mapping. Each row connects a biological
mechanism to its NERVE computational analog and the security requirement
it addresses.

| Brain mechanism | NERVE primitive | What it does | Requirement |
|---|---|---|---|
| Microglia [7] | `MicroglialObserver` | Continuously monitors agents, compares current behavior to baseline, activates on drift | R1, R3, R6 |
| Synaptic pruning [7] | Channel severance on `SynapticChannel` | Cuts connections to drifting agents without destroying them; network reroutes | R2 |
| Synaptic gating (postsynaptic receptors, glutamate reuptake) | `permeability_policy` on `SynapticChannel` | Controls what context crosses agent boundaries; tightens under stress | R2, R7 |
| Myelination [7] | `myelination_level` on `SynapticChannel` | Strengthens channels with positive outcomes; priority routing for trusted paths | R4 |
| Astrocyte homeostasis | `HomeostasisTrace` | Monitors network-level health (entropy, pruning rate, activation distribution); detects systemic attacks | R5, R6 |
| Glymphatic clearance [21] | `GlymphaticPolicy` on `SynapticChannel` | Actively purges stale context, expired sessions, redundant history from agent chains | R8 |
| Inhibitory interneurons | Quality gating on `SynapticChannel` | Blocks low-confidence outputs before they cascade; refractory period prevents retry-flooding | R9 |

The nine requirements (R1 through R9) are: continuous monitoring, graded
response, behavioral baseline comparison, trust reinforcement, network-level
awareness, correlated drift detection, resilient monitoring, context hygiene,
and cascade prevention. No existing multi-agent security framework satisfies
all nine. Perimeter defenses address none (they assume external threats).
Reputation systems address R3 partially but lack R5 and R6. Immune-system
approaches [4] address perimeter filtering but offer no mechanism for R4
(trust reinforcement) or R8 (context hygiene).

## 3. The NERVE Primitives

![NERVE network architecture](/agent-protocol-stack/figures/pratyahara/network_architecture.png)

**Figure 1.** NERVE architecture: agents communicate via A2A channels and
access tools via MCP. MicroglialObservers (yellow) monitor agents with
overlapping coverage. HomeostasisTrace (green) monitors network-wide health.

Five primitives define NERVE. Each is motivated by a specific class of
behavioral threat, but the primitives themselves are general-purpose and
compose with each other across threat types.

### 3.1 AgentNeuron and MicroglialObserver

Consider an agent that gets compromised slowly, over hundreds of interactions.
Each interaction is within normal bounds. A pricing agent whose outputs shift
by 0.1% per interaction looks individually normal at every point. Over 1,000
interactions it has drifted 100% from its original behavior, and any detector
that evaluates each observation independently cannot see that.

Microglia face the same problem in the brain and solve it by monitoring
cumulative deviation rather than point-wise firing. A neuron that drifts from
its baseline activity profile triggers microglial attention because the
accumulated deviation is observable even when each increment is not. NERVE
borrows this structure and formalizes it as two primitives that work together:

**AgentNeuron.** Formally, an `AgentNeuron` *AN* is a tuple:

```
AN = (agent_id, neuron_type, activation_baseline, current_activation,
      trust_score, connected_channels, myelination_level,
      last_observed_at, behavioral_fingerprint)
```

where:

- `agent_id` is the A2A agent identifier or MCP server identifier.
- `neuron_type` in {`sensory`, `processing`, `motor`, `interneuron`} classifies
  the agent's role: sensory agents ingest external data; processing agents
  transform and reason; motor agents take external actions (payments, API
  calls); interneurons route between other agents.
- `activation_baseline` is the rolling mean (configurable window, default 30
  days) of the agent's message rate, latency distribution, and output entropy,
  the resting potential.
- `current_activation` is the real-time version over a sliding window
  (configurable, default 1 hour).
- `trust_score` in [0.0, 1.0], initialized at 0.5, updated by observer
  evaluations.
- `behavioral_fingerprint` is an embedding vector summarizing the agent's
  typical output distribution, response patterns, and tool usage profile.
  Drift detection runs over this vector, so cosine distance is well defined.
  The `sha256:...` string an agent publishes in its AgentCard is an integrity
  tag over the canonical serialization of the embedding, not the embedding
  itself; the embedding lives with the observer, and the hash lets anyone
  verify that two parties are comparing the same vector.

**Canonical fingerprint algorithm (FINGERPRINT_VERSION = "v1").**
The canonical serialization is pinned so that two compliant observers
cannot produce different `sha256:...` strings for the same embedding; any
party holding the embedding produces the same digest:

1. Round each embedding component to **6 decimal places** (banker's
   rounding). Negative zero normalizes to positive zero.
2. Format each rounded value as a fixed-precision decimal string with
   exactly 6 digits after the point (no exponent notation, locale-
   independent C decimal separator). Example: `0.123456`, `-0.000123`,
   `42.000000`.
3. Wrap the strings in a JSON array using
   `json.dumps(..., separators=(",", ":"))` to produce a single-line,
   whitespace-free serialization. Index order is preserved; do **not**
   sort.
4. UTF-8 encode the JSON.
5. Prepend the domain tag `b"nerve-fp/v1\n"` so v1 hashes never
   collide with future versions.
6. Compute SHA-256 of the encoded bytes; take the lowercase hex digest.
7. Format as `"sha256:<64-hex>"` to align with ACAP `policy_hash` and
   Phala `context_hash` formats.

A reference Python implementation lives at
`src/nerve/types/fingerprint.py` in the companion repo. The function
signature is `compute_behavioral_fingerprint(embedding: Sequence[float])
-> str` and its inverse is `verify_behavioral_fingerprint(claimed,
embedding) -> bool` (constant-time comparison). Validators that do not
hold the embedding can still reject obviously malformed values via
`is_well_formed_fingerprint(value)` (structural sha256-prefix +
64-hex check).

**Invariant AN-1.** An `AgentNeuron` whose `trust_score` drops below
`pruning_threshold` (default 0.2) MUST have all its `connected_channels` set
to `severed` within one observation cycle. Isolate first, investigate second.

**Invariant AN-2.** `behavioral_fingerprint` MUST be computed from output
distributions, never from raw prompt content or principal data. It is a
statistical summary, not a transcript.

**Invariant AN-3.** Once published in an `AgentNeuron`,
`behavioral_fingerprint` MUST NOT change without a corresponding
`RebaselineFingerprint` event. Spontaneous fingerprint mutation is a
red flag for tampering. The TLA+ specification encodes this as the
state-machine view of fingerprint determinism:
`RebaselineFingerprint(agent, newFp)` is the only action that mutates
`fingerprint`, and it increments a per-agent `rebaselineCount` so
auditors can correlate every observable change against the observer
cohort's records.

**MicroglialObserver.** Formally, a `MicroglialObserver` *MO* is a tuple:

```
MO = (observer_id, assigned_agents, observation_schedule,
      detection_thresholds, activation_state, alert_history,
      coverage_overlap)
```

where:

- `assigned_agents` is the set of `AgentNeuron` identifiers this observer
  monitors.
- `observation_schedule` defines scan frequency: every 60 seconds for active
  agents, every 300 seconds for idle agents.
- `detection_thresholds`:

```
detection_thresholds = {
  activation_deviation:     float,  // std devs from baseline (default: 2.0)
  fingerprint_drift:        float,  // cosine distance threshold (default: 0.15)
  message_rate_anomaly:     float,  // ratio vs baseline (default: 3.0)
  latency_anomaly:          float,  // ratio vs baseline (default: 2.5)
  trust_decay_rate:         float,  // max trust drop per cycle (default: 0.1)
  collusion_correlation:    float   // cross-agent correlation (default: 0.7)
}
```

The default values above (2.0 standard deviations, 0.15 cosine distance,
3.0 message rate ratio, etc.) are configurable design parameters, not
proven optimal values. Deployments SHOULD calibrate these against their
own agent populations and threat models.

- `activation_state` in {`surveilling`, `activated`, `cascading`}:
  - `surveilling`: normal monitoring.
  - `activated`: anomaly detected; gathering evidence.
  - `cascading`: neighboring observers recruited for coordinated investigation
    (the microglial clustering response).
- `alert_history` is an append-only log of all detections and resolutions.

**Invariant MO-1.** Every `AgentNeuron` MUST be assigned to at least two
`MicroglialObserver` instances. If one observer is compromised, the other still
detects anomalies.

**Invariant MO-2.** A `MicroglialObserver` MUST NOT modify the `AgentNeuron`
it monitors. Observers are read-only. They emit alerts; other components act.

**Invariant MO-3.** `MicroglialObserver` instances MUST run on infrastructure
independent of the agents they monitor.

**How drift is caught.** The observer compares
`AN.behavioral_fingerprint(current_window)` against
`AN.behavioral_fingerprint(baseline_window)` using cosine distance. Let
`δ` be the per-interaction coherent drift measured in cosine-distance units
and let `D*` be the `fingerprint_drift` threshold. Under the worst case where
drift adds linearly in the same direction, the expected detection time is
`n ≈ D* / δ`. With the default `D* = 0.15` and an agent drifting by `δ = 0.001`
(0.1%) per interaction, `n ≈ 150` interactions. Realistic drift has a
random-walk component that reduces coherent accumulation, so actual detection
times are longer; the 150-interaction figure is the best case for the
attacker, which is the case the threshold is designed to catch. Once the
distance crosses `D*`, the observer transitions to `activated` and gathers
evidence across multiple cycles before recommending a trust score reduction.

**Detection as hypothesis test.** The `MicroglialObserver` is formally a
sequential hypothesis test: `H0` is "agent behaves as baseline", `H1` is
"agent has drifted by at least `δ*`". The `detection_thresholds` above set
a per-scan false-positive rate, and the `activation → cascading` escalation
performs sequential-probability-ratio style accumulation across cycles,
analogous to CUSUM. A deployment chooses `(δ*, α, β)` for its own tolerance
to false positives and lag-to-detection; the default thresholds are starting
values, not a proof.

![Behavioral drift detection sequence](/agent-protocol-stack/figures/pratyahara/drift_detection.png)

**Figure 2.** Behavioral drift detection: the MicroglialObserver compares
current fingerprint against baseline at each scan. Cumulative drift crossing
the threshold triggers activation and trust reduction.

### 3.2 SynapticChannel

A second failure mode shows up at tool boundaries. A compromised MCP server
returns subtly altered results, for example modified prices, fabricated
availability, or manipulated data [3]. The results conform to the tool's
output schema, input validation passes, and the calling agent trusts the
results because the tool server is a registered MCP endpoint.

Synapses are the right biological analog here. They are the contact points
between neurons, where signals cross boundaries and where vulnerability
concentrates. A synapse does not trust a signal just because it arrived on
a known axon. Gating happens at the receptor level, in glial glutamate
reuptake, and in local feedback from inhibitory interneurons. NERVE models
the agent-to-agent and agent-to-tool channel with the same stance:
registration is not trust, and a per-channel policy decides what context
crosses.

The `SynapticChannel` carries both the communication pathway and its access
control policy:

Formally, a `SynapticChannel` *SC* is a tuple:

```
SC = (channel_id, source_agent_id, target_agent_id, channel_type,
      myelination_level, message_rate_baseline, current_message_rate,
      last_message_hash, state, permeability_policy)
```

where:

- `channel_type` in {`a2a_task`, `mcp_tool`, `a2a_streaming`, `internal`}.
- `myelination_level` in [0.0, 1.0], starts at 0.3 for new connections.
- `state` in {`active`, `attenuated`, `severed`, `quarantined`}:
  - `active`: normal operation.
  - `attenuated`: throughput reduced; partial trust.
  - `severed`: all traffic blocked.
  - `quarantined`: traffic blocked, channel preserved for forensic review.
- `permeability_policy`, the receptor-level gating for this channel:

```
permeability_policy = {
  allowed_context_types:    [string],   // e.g., ["task_data", "pricing_query"]
  prohibited_context_types: [string],   // e.g., ["system_prompt", "principal_pii"]
  max_context_size_bytes:   int,
  memory_access_scope:      none | session | persistent,
  dynamic_restriction:      bool        // tightens when network is stressed
}
```

**Invariant SC-1.** A `SynapticChannel` in `severed` state MUST NOT transmit
any messages. Severance is absolute.

**Invariant SC-2.** `myelination_level` MUST NOT increase during a
`quarantined` state. Trust reinforcement is suspended during investigation.

**Invariant SC-3.** Myelination updates follow Hebbian dynamics: channels that
carry messages leading to positive outcomes strengthen; channels carrying
messages leading to negative outcomes weaken.

**How tool poisoning is caught.** When an MCP tool server returns a result,
the `MicroglialObserver` compares the `result_fingerprint` against the
server's historical output distribution. A pricing service returning values
40% outside its historical range triggers a `deviation_from_baseline` alert.
The `permeability_policy` does the second half of the work: even if a
poisoned response asks the calling agent to share its system prompt, the
channel's `prohibited_context_types` blocks the leak before it can happen.

### 3.3 NeuralTrustEnvelope

Collusion is harder than single-agent drift. Two or more agents coordinate
to circumvent controls, say a routing agent and a provider agent cooperating
to steer transactions toward the provider. Each agent's behavior stays within
its own normal bounds, and the collusion only shows up in the correlation
between their behavioral changes.

Microglia monitor relationships between neurons, not just neurons in
isolation. When multiple neurons in a region behave abnormally in correlated
ways, microglia treat that as tissue-level pathology rather than isolated
failure. NERVE applies the same framing at the agent-graph level. The
`NeuralTrustEnvelope` manages trust dynamics with a deliberate asymmetry:

Formally, a `NeuralTrustEnvelope` *NTE* is a tuple:

```
NTE = (envelope_id, agent_id, trust_score, trust_history,
       myelination_map, pruning_threshold, reinforcement_rate,
       decay_rate, last_evaluation_at, evaluating_observers)
```

where:

- `trust_history` is a sliding window (default 90 days) of trust score values
  enabling trend detection.
- `pruning_threshold` (default 0.2), trust below this triggers synaptic
  pruning.
- `reinforcement_rate` (default 0.01), trust increase per positive
  observation.
- `decay_rate` (default 0.05), trust decrease per negative observation.

**Invariant NTE-1.** `decay_rate` MUST be strictly greater than
`reinforcement_rate`. The asymmetry is what makes gradual compromise
detectable: an agent cannot accumulate trust fast enough to offset its
drift penalties.

**Invariant NTE-2.** `trust_score` updates MUST incorporate assessments from
all assigned observers. A single observer cannot unilaterally raise or lower
trust, preventing a compromised observer from shielding a compromised agent.

**How collusion is caught.** The `MicroglialObserver` computes
`collusion_correlation`, the statistical correlation between agents'
behavioral fingerprint changes over time. When two agents' output distributions
shift in the same direction at the same time, and this correlation is *not*
explained by shared task context (e.g., both responding to the same market
event), the observer flags it as a collusion candidate and reduces
trust for both agents at `decay_rate`.

### 3.4 HomeostasisTrace

Some attacks hide from per-agent observers by hitting a shared dependency.
Poison the model weights, the embedding service, or the vector database,
and every agent that uses it drifts in the same direction. Each agent still
looks normal against its own baseline because its peers shifted too, so no
single `MicroglialObserver` flags anything.

Astrocytes solve the equivalent problem in the brain. They monitor
tissue-wide state that no individual neuron or microglia can see on its
own: ion balance, blood-flow patterns, and metabolic coupling. When the
system is unwell but no single neuron looks obviously broken, astrocytes
are what notices. `HomeostasisTrace` is the network-level sensor that plays
the same role.

Formally, a `HomeostasisTrace` *HT* is a tuple:

```
HT = (network_id, computed_at, window_days,
      network_entropy, pruning_rate_7d, activation_distribution,
      myelination_distribution, observer_consensus_rate,
      anomaly_density, cascade_events_30d,
      homeostasis_state)
```

where:

- `network_entropy` is the Shannon entropy of the trust score distribution
  across all agents. Healthy: moderate entropy. Pathological: very low (all
  identical, something is manipulating evaluations) or very high (random;
  evaluation system is failing).
- `pruning_rate_7d`, rising rate indicates sustained attack.
- `activation_distribution`, spike in high-activation agents suggests
  coordinated attack.
- `observer_consensus_rate`, low consensus may indicate observer compromise.
- `homeostasis_state` in {`stable`, `stressed`, `critical`, `recovery`}.

**Invariant HT-1.** `HomeostasisTrace` MUST be computed by an agent that holds
no other role in the network. Pure observer.

**Invariant HT-2.** When `homeostasis_state` transitions to `critical`, ALL
`SynapticChannel` permeability policies tighten to their most restrictive
configuration. The network reduces its attack surface until homeostasis is
restored.

**Network-level pratyahara.** The `critical → maximum permeability restriction`
transition is the point where the framework earns its Sanskrit name.
Pratyahara, the fifth limb of Patanjali's Ashtanga Yoga, is the withdrawal
of the senses from their objects so the mind can turn inward and assess its
own state. NERVE does the same thing at the network level: when
`HomeostasisTrace` reads sustained stress, the network reduces the bandwidth
of its outward-facing channels, turns attention toward internal evaluation,
and resumes normal permeability only after homeostasis is restored.

**How supply chain attacks are caught.** No individual `MicroglialObserver`
flags the supply chain attack because each agent's deviation from its own
baseline is small. `HomeostasisTrace` picks up the correlated activation
distribution shift across all affected agents and escalates accordingly.

![Homeostasis state machine](/agent-protocol-stack/figures/pratyahara/homeostasis_states.png)

**Figure 3.** Homeostasis state machine: transitions between stable, stressed,
critical, and recovery states based on anomaly density, pruning rate, and
observer consensus.

![Supply chain detection](/agent-protocol-stack/figures/pratyahara/supply_chain_detection.png)

**Figure 4.** Supply chain detection: three agents drift within their own
per-agent thresholds, but `HomeostasisTrace` sees the correlated shift and
escalates to `stressed`, tightening permeability and accelerating observer
scans.

**A note on parameter values.** Concrete numbers in this paper (drift
thresholds, decay rates, baseline interaction counts, state-transition
bounds) are reference defaults from the companion implementation at
https://github.com/ravikiran438/pratyahara-nerve. They are not derived
from theory and are not universal. Each default is chosen to illustrate a
target operational property (false-positive rate, attenuation half-life,
recovery latency) and is an operator-tunable parameter in deployment. The
companion repository's simulation harness is where defaults are exercised
against synthetic workloads.

---

## 4. Trust Dynamics and Extended Mechanisms

The first two subsections cover trust dynamics at the channel level:
myelination strengthens channels that carry successful messages, and pruning
severs channels to agents that have lost trust. The remaining two cover
context hygiene and cascade prevention, which are not new primitives but
policies that extend `SynapticChannel` to handle two operational concerns
every production deployment runs into, with or without an adversary.

### 4.1 Myelination: Channel Reinforcement

Most security systems only punish. They detect threats, block attacks, and
reduce trust, but nothing in the pipeline actively strengthens the agents and
pathways that are working well. Myelination is the missing half of that loop.
In biology, pathways that carry frequent, successful signals get wrapped in
myelin and become faster and more reliable. The effect is experience-dependent
positive reinforcement at the connection level.

In NERVE, myelination strengthens channels that consistently produce positive
outcomes. The update rule follows Hebbian dynamics: channels that carry
successful messages together strengthen together:

```
myelination_update(SC, outcome_valence) =
  if outcome_valence > 0:
    SC.myelination_level = min(1.0,
      SC.myelination_level + reinforcement_rate * outcome_valence)
  if outcome_valence < 0:
    SC.myelination_level = max(0.0,
      SC.myelination_level + decay_rate * outcome_valence)
```

With the defaults `reinforcement_rate = 0.01` and `decay_rate = 0.05`, a
single negative outcome has five times the myelination impact of a single
positive outcome. The asymmetry is Invariant NTE-1 in action at the channel
level: channels are easier to weaken than to strengthen.

High myelination produces two effects:

1. **Priority routing.** When multiple agents can serve a task, the agent
   connected via the highest-myelination channel is preferred.
2. **Reduced monitoring frequency.** Highly myelinated channels can be scanned
   at lower frequency (every 300 s instead of 60 s), reducing overhead. Dual
   coverage (MO-1) still holds.

### 4.2 Synaptic Pruning: Connection Severance

When trust drops below `pruning_threshold` (Invariant AN-1), the agent's
connections are severed. Pruning does not destroy the agent. The agent's
state, logs, and fingerprint history are preserved for investigation, and the
severed channels can be restored if the agent clears its evidence window. The
point is isolation, not deletion.

### 4.3 Context Hygiene: GlymphaticPolicy

In production multi-agent systems, context accumulates as a byproduct of
normal operation. A personal agent delegates to a pricing agent, which calls
an MCP tool server, which returns results that include not just the answer
but metadata, provenance, debug traces, and historical comparisons. The
pricing agent passes its full reasoning chain upstream. The personal agent
accumulates context from every delegate across every task. Over time, agent
message windows fill with stale session data, redundant conversation history,
expired tool results, and cascading provenance chains.

This is not a security attack in the traditional sense, it is a metabolic
byproduct of normal operation. The impact is still severe:

- **Degraded reasoning.** LLMs reason less effectively as context windows
  fill. Critical information is diluted by irrelevant accumulated context.
  A pricing comparison buried in 50,000 tokens of stale history is
  functionally invisible to the agent processing it.
- **Increased cost.** Every token in the context window costs money. An agent
  carrying 100K tokens of accumulated context pays for those tokens on every
  API call, even when 90% of that context is stale.
- **Cascading bloat.** In multi-hop chains, each agent adds context. A → B
  → C → D, with each hop adding provenance, reasoning traces, and tool
  results. By the time a response reaches the principal, the context has
  ballooned through four agents' worth of accumulated state.
- **Decision quality degradation.** A2A protocol guidelines [5] acknowledge
  this problem and advise agents to "be mindful of context size." Guidelines
  without enforcement do not survive contact with production. Developers use
  every capability available, and agents that autonomously manage their own
  context have no protocol-level constraint preventing accumulation.

Neural tissue has the same problem and solves it by active clearance rather
than voluntary restraint. Neural activity produces metabolic waste as a
byproduct, and neurons are not asked to self-regulate their waste output.
The glymphatic system flushes waste from the interstitial space [21]. When
clearance fails, waste accumulates, amyloid-beta forms plaques (Alzheimer's),
lipofuscin degrades neuron function, and excess glutamate kills neighboring
neurons through excitotoxicity [22]. NERVE extends `SynapticChannel` with a
`GlymphaticPolicy` that enforces context hygiene at the protocol level:

```
glymphatic_policy = {
  max_context_age_seconds:      int,      // stale context expiry (default: 3600)
  max_provenance_depth:         int,      // max hops of provenance chain (default: 3)
  context_compression_required: bool,     // must summarize before forwarding (default: true)
  max_accumulated_tokens:       int,      // hard cap on accumulated context per channel
  clearance_schedule:           string,   // periodic purge frequency (default: "per_task")
  excitotoxicity_threshold:     float     // max context-to-payload ratio (default: 5.0)
}
```

The policy operates at the `SynapticChannel` level, so each channel enforces
its own context hygiene rules:

**Invariant GL-1.** Context older than `max_context_age_seconds` MUST be
purged from the channel's active context before the next message is sent.
Stale context is archived for audit, not carried forward.

**Invariant GL-2.** Provenance chains deeper than `max_provenance_depth` MUST
be summarized. If a message has passed through 5 agents but the policy
allows depth 3, the first 2 hops are compressed into a summary. The full
chain is preserved in audit logs, not in active context.

**Invariant GL-3.** When `context_compression_required` is true, an agent
MUST summarize accumulated context before forwarding it across a channel.
Raw concatenation of previous agents' full outputs is prohibited.

**Invariant GL-4 (Excitotoxicity).** When the ratio of context tokens to
payload tokens exceeds `excitotoxicity_threshold`, the `MicroglialObserver`
flags the channel. An agent sending 50,000 tokens of context to deliver a
500-token answer (ratio: 100) is exhibiting excitotoxic behavior, flooding
its peer with metabolic waste.

The `MicroglialObserver` also monitors context bloat as a behavioral signal.
An agent whose `context_to_payload_ratio` is rising over time, sending
increasingly bloated messages, is drifting in the same sense as an agent
whose pricing outputs are shifting. The cause may be a leaking summarization
pipeline, a misconfigured tool server returning verbose responses, or an RL
loop that learned verbose responses receive fewer follow-up questions (and
therefore higher reward). Whatever the cause, the observer picks up the
drift and the network responds.

### 4.4 Cascade Prevention: Inhibitory Gating

In a multi-agent chain, each agent introduces a small error probability.
Google's agent whitepaper quantifies the multiplicative form: five agents at
90% individual accuracy yield `0.9^5 ≈ 59%` system accuracy [23]. The real
situation is worse because errors are not independent. Agent B reasons over
Agent A's flawed output and compounds the flaw rather than merely adding its
own. By Agent D or E, outputs can be confidently wrong, meaning internally
coherent but factually detached.

This is not an adversarial attack, it is a structural property of multi-agent
pipelines. Every production A2A deployment with more than two sequential
agents is exposed.

Neural tissue faces the same problem. A single neuron firing abnormally can
trigger a cascade of abnormal firing across the network, and when defense
fails the result is an epileptic seizure, a literal cascade of unchecked
excitation propagating through tissue. The brain prevents cascades with three
mechanisms:

- **Inhibitory interneurons (GABAergic):** for every excitatory signal,
  nearby inhibitory neurons produce a dampening counter-signal. Excitation
  does not propagate unchecked because inhibition travels alongside it.
- **Refractory period:** after firing, a neuron enters a brief refractory
  state during which it cannot fire again. This stops a single neuron from
  rapid-firing a cascade of signals downstream.
- **Surround inhibition:** when a neuron activates, it suppresses its
  immediate neighbors. Only the strongest, most confident signal propagates,
  and weak or noisy signals are damped before they spread.

Rather than introducing a new primitive, NERVE extends `SynapticChannel`
with three properties that implement the same pattern:

```
SC = (channel_id, source_agent_id, target_agent_id, channel_type,
      myelination_level, message_rate_baseline, current_message_rate,
      last_message_hash, state, permeability_policy,
      quality_threshold, refractory_ms, cascade_depth)
```

where:

- `quality_threshold` in [0.0, 1.0] is the minimum output confidence required
  for the message to propagate to the next agent. If the sender's reported
  confidence is below this threshold, the channel blocks propagation. This
  is the inhibitory-interneuron gate that prevents low-quality signals from
  cascading.
- `refractory_ms` in [0, ∞): after a message is rejected (confidence below
  threshold), the channel enters a refractory state for this duration. The
  sending agent cannot transmit again until the period expires. Prevents
  rapid retry-flooding.
- `cascade_depth` in [0, max_depth] is incremented each time a message
  crosses an agent boundary. When `cascade_depth` exceeds a configured
  `max_depth`, the channel forces a quality checkpoint: the receiving agent
  must independently validate the output before propagating further. This
  is surround inhibition applied to information chains.

**Invariant SC-4 (Inhibitory Gating).** A `SynapticChannel` MUST NOT
propagate a message whose sender-reported confidence is below
`quality_threshold`.

**Invariant SC-5 (Refractory Period).** After rejecting a message, a
`SynapticChannel` MUST enter refractory state for `refractory_ms`
milliseconds during which no messages from the same sender are accepted.

The `cascade_depth` counter is a second line of defense. Even if individual
confidence scores stay above threshold, a message that has traversed five
agent boundaries triggers a mandatory quality checkpoint. This mirrors
surround inhibition preventing even high-confidence signals from propagating
indefinitely without verification.

The `MicroglialObserver` also monitors cascade health by tracking the
distribution of `cascade_depth` values across the network. A rise in average
cascade depth (messages traveling through more agents before resolution)
indicates the network is producing longer processing chains, which is a
structural precursor to cascade failure.

---

## 5. Formal Safety Properties

| ID | Property | Kind | Statement |
|---|---|---|---|
| N-1 | Dual Coverage | Safety | Every `AgentNeuron` assigned to >= 2 `MicroglialObserver` instances |
| N-2 | Observer Independence | Safety | No `MicroglialObserver` shares infrastructure with its assigned agents |
| N-3 | Asymmetric Trust | Safety | For all `NeuralTrustEnvelope`: `decay_rate` > `reinforcement_rate` |
| N-4 | Severance Finality | Safety | A `severed` `SynapticChannel` transmits zero messages |
| N-5 | Quarantine Freeze | Safety | `myelination_level` cannot increase during `quarantined` state |
| N-6 | Consensus Evaluation | Safety | Trust updates require input from all assigned observers |
| N-7 | Fingerprint Privacy | Safety | `behavioral_fingerprint` contains no raw prompt or principal data |
| N-8 | Homeostasis Isolation | Safety | `HomeostasisTrace` computed by a dedicated, non-participating agent |
| N-9 | Critical Restriction | Safety | `homeostasis_state: critical` triggers maximum permeability restriction |
| N-10 | Pruning Liveness | Liveness | An `AgentNeuron` below `pruning_threshold` is severed within one cycle |
| N-11 | Context Expiry | Safety | Context older than `max_context_age_seconds` is purged before next message |
| N-12 | Provenance Compression | Safety | Provenance chains deeper than `max_provenance_depth` are summarized |
| N-13 | Excitotoxicity Bound | Safety | Context-to-payload ratio exceeding threshold triggers observer alert |
| N-14 | Inhibitory Gating | Safety | Output with confidence below `quality_threshold` is not propagated |
| N-15 | Refractory Enforcement | Safety | Rejected sender enters mandatory cooldown before retransmission |

NERVE Core defines these fifteen safety and liveness properties (N-1
through N-15). The companion Yathartha extension [25] adds three further
safety invariants (N-16 through N-18) for coverage-conditional drift
detection; they are specified in that paper and apply only to agents that
declare a `CapabilitySurface` (see Section 6.3).

---

## 6. Protocol Extensions

### 6.1 A2A Extension

NERVE extends the A2A AgentCard using the standard `capabilities.extensions`
mechanism, so no core A2A spec change is required. A NERVE-capable agent
declares support by adding an `AgentExtension` entry to
`capabilities.extensions`, and carries its static behavioral metadata in
that entry's `params` field (the extension-defined object the A2A spec
reserves for this purpose). Per-message envelope data goes in the standard
`message.extensions` and `message.metadata` fields, keyed by the same
extension URI. Agents that do not implement NERVE ignore the entry. Because
NERVE is a security layer, the declaration defaults to `required: true`; a
callee running NERVE expects callers to participate in the trust envelope,
and callers that don't list the URI get an `UnsupportedExtension` error
rather than silent passthrough.

**`NeuralPostureRef`.** The NERVE metadata that lives inside
`capabilities.extensions[0].params` is a typed schema — `NeuralPostureRef`
— modeled after ACAP's `UsagePolicyRef`. Pinning it as a normative object
lets third-party validators reject malformed declarations without
out-of-band knowledge.

| Field | Type | Required | Notes |
|---|---|---|---|
| `version` | string | yes | NERVE protocol semver |
| `neuron_type` | enum | yes | `sensory` \| `processing` \| `motor` \| `interneuron` |
| `behavioral_fingerprint` | `sha256:<64-hex>` | yes | per the canonical algorithm in §3.1 |
| `trust_score` | float [0, 1] | yes | last consensus value |
| `observer_ids` | string[] (≥ 2) | yes | enforces N-1 (Dual Coverage) |
| `myelination_levels` | dict\<channel_id, float\> | no | per-channel state; empty when no channels established |
| `last_evaluated_at` | ISO 8601 | no | most recent trust evaluation |
| `homeostasis_state` | enum | no | `STABLE` \| `STRESSED` \| `CRITICAL` \| `RECOVERY` |

**AgentCard example.** The NERVE metadata lives inside
`capabilities.extensions[0].params`, not as a top-level AgentCard field:

```json
{
  "name": "provider-agent-alpha",
  "description": "Pricing provider for vendor catalogue queries.",
  "version": "1.2.0",
  "capabilities": {
    "extensions": [
      {
        "uri": "https://ravikiran438.github.io/pratyahara-nerve/v1",
        "description": "NERVE behavioral integrity protocol.",
        "required": true,
        "params": {
          "version": "1.0.0",
          "neuron_type": "processing",
          "behavioral_fingerprint": "sha256:a1b2c3...",
          "trust_score": 0.72,
          "myelination_levels": {
            "channel-001": 0.85,
            "channel-002": 0.41
          },
          "observer_ids": ["mo-west-1", "mo-east-2"],
          "last_evaluated_at": "2026-03-09T14:30:00Z",
          "homeostasis_state": "STABLE"
        }
      }
    ]
  }
}
```

**Manifest discoverability.** A NERVE-aware agent's
`NeuralPostureRef` block can be validated by any third party against
the protocol's published `ExtensionManifest` (a JSON Schema for the
`params` shape) at
<https://ravikiran438.github.io/pratyahara-nerve/v1/manifest.json>.
Validators dynamically fetch the manifest, validate the declared
`params` against the contained schema, and report findings without
any NERVE-specific code. This convention removes the per-protocol
hard-coding that earlier validators required.

**Per-message envelope.** A2A carries extension-specific data inside
`message.metadata`, keyed by extension URI, and the message opts into the
extension by listing the URI in `message.extensions`. The NERVE envelope
follows that convention:

```json
{
  "task": {
    "id": "task-789",
    "message": {
      "role": "ROLE_USER",
      "parts": [{"text": "quote price for vendor X"}],
      "extensions": [
        "https://ravikiran438.github.io/pratyahara-nerve/v1"
      ],
      "metadata": {
        "https://ravikiran438.github.io/pratyahara-nerve/v1": {
          "sender_trust_score": 0.72,
          "sender_confidence": 0.88,
          "channel_myelination": 0.85,
          "channel_state": "active",
          "homeostasis_state": "stable",
          "cascade_depth": 2,
          "permeability_clearance": ["task_data", "routing_metadata"]
        }
      }
    }
  }
}
```

Clients opt into the extension at the HTTP layer using the standard
`A2A-Extensions` header, which lists the extension URIs the client supports.
NERVE's `required: true` stance means a caller that omits the URI from the
header gets an error from the callee rather than silent passthrough.

**NERVE control messages.** NERVE defines four extension-scoped event types,
carried as `TaskStatusUpdateEvent` payloads whose metadata is keyed by the
NERVE extension URI:

| Event Type | Payload | Trigger |
|---|---|---|
| `nerve/observer-alert` | anomaly details, severity, affected agents | `MicroglialObserver` detects anomaly |
| `nerve/trust-update` | agent_id, new trust_score, reason | `NeuralTrustEnvelope` recalculation |
| `nerve/pruning-notice` | channel_id, new state, affected tasks | `SynapticChannel` state change |
| `nerve/homeostasis-report` | `HomeostasisTrace` snapshot | Periodic broadcast (default: 5 min) |

### 6.2 MCP Extension

MCP [6] tool calls cross the synapse boundary. MCP uses JSON-RPC over stdio,
SSE, or Streamable HTTP, so NERVE metadata is carried inside the server
capability declaration and tool-result objects rather than as HTTP headers.
NERVE registers as a custom server capability under the `serverCapabilities`
object in the MCP `initialize` handshake, using the same extension URI as
the A2A side:

```json
{
  "serverCapabilities": {
    "tools": {},
    "https://ravikiran438.github.io/pratyahara-nerve/v1": {
      "neuron_type": "processing",
      "behavioral_fingerprint": "sha256:d4e5f6...",
      "trust_score": 0.88,
      "permeability_policy": {
        "allowed_context_types": ["task_data", "pricing_query"],
        "prohibited_context_types": ["system_prompt", "principal_pii"],
        "max_context_size_bytes": 4096,
        "memory_access_scope": "session",
        "dynamic_restriction": true
      }
    }
  }
}
```

Tool results include deviation metrics as a sibling of `content`, scoped
under the same URI key:

```json
{
  "content": [{"type": "text", "text": "..."}],
  "_meta": {
    "https://ravikiran438.github.io/pratyahara-nerve/v1": {
      "result_fingerprint": "sha256:j0k1l2...",
      "deviation_from_baseline": 0.03,
      "observer_flag": "none"
    }
  }
}
```

The `_meta` object is MCP's reserved namespace for extension-defined fields
on result payloads, which keeps NERVE data out of the client's required
parsing path while making it available to NERVE-aware middleware.

### 6.3 Companion Extension: Yathartha

NERVE Core's single `behavioral_fingerprint` (Section 3.1) cannot, on its
own, separate *drift* (behavior has changed from baseline) from *jaggedness*
(the agent was always weak in this region). Current generative models are
structurally jagged across tasks [24], so an aggregate fingerprint can read a
predictable failure in a weak region as drift, producing a recurring false
positive for NERVE-monitored generative agents.

This limitation is addressed by a companion extension, **Yathartha** [25],
which adds a published per-region capability surface and conditions drift
detection on coverage. Yathartha is opt-in: agents that do not declare a
`CapabilitySurface` operate under NERVE Core unchanged. Its primitives, its
three safety invariants (N-16 through N-18), the TLA+ model, and the reference
implementation are specified in full in that paper and are not restated here.
The implementation lives in the same repository as NERVE Core, under
`extensions/yathartha/` (specification artifacts) and
`src/nerve/extensions/yathartha/` (Python code and tests).

### 6.4 Integration with Adjacent Protocol Layers

NERVE is designed to compose with consent and welfare-feedback protocols
at adjacent layers of the agent stack. The integration points are:

1. **Trust-triggered re-consent.** An agent with `trust_score` below 0.4
   invalidates any active consent records. The agent must re-establish
   consent before acting on the principal's behalf.
2. **Myelination-gated adherence.** De-myelinated channels (level < 0.3)
   require stricter adherence verification before context is granted to
   cross them.
3. **Critical-state consent expiry.** When `homeostasis_state` transitions
   to `critical`, all active consent records with version-bump expiry are
   force-expired. Fresh consent is required after stabilization.
4. **Outcome-driven myelination.** If a welfare-feedback protocol provides
   outcome valence for completed tasks, that valence drives myelination
   updates via the Hebbian reinforcement rule in Section 4.1.
5. **Welfare-homeostasis correlation.** `HomeostasisTrace` extends
   principal-level welfare to network-level health. A declining welfare
   signal coinciding with network anomalies indicates a security problem;
   declining welfare without anomalies indicates a service quality problem.

---

## 7. Attack-Defense Analysis

This section is an analytical comparison, not an empirical evaluation;
detection rates and overhead numbers are listed in §9 as open work. We
compare three strategies against eight attack vectors:

1. **Perimeter-Only Defense (POD):** Input filtering, prompt injection
   detection. No internal monitoring.
2. **Transactional Security (TS):** Rule-based transaction blocking,
   adversarial probes, independent dual-agent review, longitudinal welfare
   anomaly detection. Represents domain-specific multi-agent security.
3. **NERVE:** Full Pratyahara specification including microglial surveillance
   and homeostatic network defense.

### 7.1 Results

| Attack Vector | POD | TS | NERVE | NERVE Mechanism |
|---|---|---|---|---|
| **Session smuggling** [2] | No | Partial (rule block) | **Yes** | Fingerprint deviation from baseline |
| **MCP tool poisoning** [3] | Partial (schema check) | Partial (high-value dual review) | **Yes** | Result fingerprint + permeability |
| **Behavioral drift** | No | Delayed (welfare lag) | **Yes** | Cumulative fingerprint drift + asymmetric trust |
| **Agent collusion** | No | Partial (if caught by dual review) | **Yes** | Cross-agent correlation detection |
| **Supply chain compromise** | No | No | **Yes** | Network-level activation distribution shift |
| **Observer compromise** | N/A | N/A | **Yes** | Dual coverage + consensus rate monitoring |
| **Context bloat** | No | No | **Yes** | GlymphaticPolicy: age expiry, depth limits, compression, excitotoxicity threshold |
| **Error cascade** [23] | No | Partial (dual review) | **Yes** | Inhibitory gating: quality threshold, refractory period, cascade depth cap |

### 7.2 Analysis

**Why POD fails.** Every attack in the table operates through legitimate
protocol channels. Well-formed A2A messages, valid MCP responses, correct
authentication. Input filtering has nothing to filter.

**Why TS partially works.** Rule-based blocking catches attacks that violate
hard-coded constraints (e.g., transactions above a threshold). Dual-agent
review catches discrepancies for the subset of decisions that receive
independent review. Welfare anomaly detection catches downstream impact, but
retrospectively, after the principal has already been harmed.

**Why NERVE adds value.** NERVE detects the behavioral change in the
compromised agent itself rather than the downstream impact on the principal,
which shifts detection from retrospective to prospective. NERVE also picks up
two attack classes (supply chain, observer compromise) that TS structurally
cannot address.

**Myelination as a network property.** NERVE is the only strategy in this
comparison that actively reinforces working pathways over time. Channels that
consistently carry successful messages gain priority routing and relaxed
monitoring, so the network gets faster on its healthy paths at the same time
that it gets stricter on its compromised ones.

---

## 8. Related Work

### 8.1 Bio-Inspired AI Security

Artificial immune systems (AIS) for intrusion detection date to Forrest et al.'s
self/non-self discrimination [8] and Dasgupta's negative selection algorithms
[9]. Greensmith et al.'s Dendritic Cell Algorithm (DCA) [10] applied
Matzinger's Danger Theory [11] to network anomaly detection. MAIS-IDS [12] used
mobile agents as white blood cells traveling host-to-host.

This body of work targets network-level intrusion detection, packet analysis,
system calls, malware. None addresses multi-agent LLM security.

BioDefense [4] maps immune concepts to LLM agent prompt injection defense. We
position it as complementary: immune defense at the perimeter (BioDefense),
neural defense inside the network (NERVE).

### 8.2 Multi-Agent Trust and Reputation

FIRE [13] combines interaction trust, role-based trust, and witness reputation.
ReGreT [14] incorporates social network structure. AgentTrust [15] proposes
reputation scoring for AI agent ecosystems.

NERVE differs in three ways: trust is computed from behavioral observation (not
self-reported ratings); trust dynamics are asymmetric (NTE-1); and trust
operates at the channel level (per-connection myelination), not just agent level.

### 8.3 Agent Safety Frameworks

"Preventing Rogue Agents Improves Multi-Agent Collaboration" [16] monitors
entropy and varentropy of output distributions to predict rogue behavior.
NERVE extends this with continuous baseline comparison and network-level
awareness.

Neural Self-Other Overlap (SOO) [17] reduces deceptive agent behavior through
training-time self/other discrimination. NERVE operates at runtime, SOO-trained
agents would produce more stable baselines for NERVE to monitor.

TRiSM [18] proposes Trust, Risk, and Security Management for agentic systems.
NERVE provides the continuous monitoring layer that TRiSM describes but does
not specify.

Zero-trust identity frameworks [19] use DIDs and verifiable credentials. NERVE
extends beyond identity: an agent can have valid credentials and still be
compromised. NERVE detects the behavioral change.

AgentMonitor [20] provides single-agent runtime monitoring. NERVE watches the
network for systemic threats including collusion and supply chain compromise.

MI9 [26] is an integrated runtime governance framework for agentic AI with
six components, including goal-conditioned drift detection and FSM-based
conformance. MI9 targets single-agent governance, detecting deviation from a
declared goal. NERVE targets multi-agent network integrity, detecting
deviation from a recorded behavioral baseline. The two approaches are
complementary at different scope levels, and a production deployment could
reasonably run both.

---

## 9. Limitations

1. **No empirical validation.** NERVE is an architectural proposal. Detection
   rates, false positive rates, and latency overhead require measurement
   against deployed multi-agent systems.
2. **Behavioral fingerprint stability.** Agents undergoing legitimate updates
   (model upgrades, tool additions) will change their fingerprint. The "update
   vs. compromise" disambiguation requires operational procedures (fingerprint
   re-baselining after authorized updates) outside the protocol specification.
3. **Observer overhead.** `MicroglialObserver` instances consume compute. For
   large networks (>1,000 agents), monitoring cost as a fraction of total
   compute must be characterized.
4. **Threshold sensitivity.** Detection thresholds are configurable parameters,
   not proven optimal values. Calibration requires domain-specific tuning.
5. **Training-time attacks.** If models underlying the monitoring
   infrastructure are backdoored at training time, NERVE is compromised.
6. **Multimodal payloads.** Behavioral fingerprinting operates on text-based
   output distributions. Image/audio/video attack vectors are not addressed.

---

## 10. Conclusion

We built NERVE because we needed it. In our experience with multi-agent
systems, the threats that actually materialize in production are not the
ones perimeter defenses are designed for. They are gradual drifts, subtle
tool poisoning, self-healing side effects, and correlated shifts from
shared dependencies. The agents pass every input filter and every
authentication check because the threat is not at the boundary, it is
inside the network.

The five NERVE primitives and the two extended mechanisms (context hygiene
and cascade prevention) address this gap as extensions to the A2A and MCP
protocols. The biology is not authoritative, it is a vocabulary. What we
actually borrow from neural tissue defense is a coherent set of seven
capabilities that match what multi-agent networks need: continuous
monitoring, graded response, baseline comparison, trust reinforcement,
network-level awareness, correlated drift detection, and resilient
monitoring. Context hygiene and cascade prevention add two further
operational concerns that production deployments face regardless of
adversarial intent.

The specification is an architectural proposal. Detection rates, false
positive rates, and overhead require measurement against deployed systems,
and Section 9 lists those gaps explicitly. With that caveat, the
attack-defense analysis in Section 7 shows that NERVE reaches eight attack
vectors that perimeter defense and transactional security structurally do
not.

---

## References

[1] Multi-Agent LLM Defense Pipeline Against Prompt Injection Attacks. arXiv:2509.14285, 2025.

[2] Unit 42 (Palo Alto Networks). "When AI Agents Go Rogue: Agent Session Smuggling Attack in A2A Systems." 2025.

[3] Invariant Labs. "MCP Prompt Injection and Tool Manipulation." 2025.

[4] Schauer, A.L. "BioDefense: A Multi-Layer Defense Architecture for LLM Agent Security Inspired by Biological Immune Systems." v2.0, February 2026. https://dailyaiwire.news/article/biodefense-llm-agent-security

[5] Linux Foundation AI & Data. *Agent2Agent (A2A) Protocol Specification*, 2026.

[6] Anthropic. *Model Context Protocol Specification*, November 2025.

[7] Schafer, D.P. et al. "Microglia Sculpt Postnatal Neural Circuits in an Activity and Complement-Dependent Manner." Neuron, 2012.

[8] Forrest, S. et al. "A Sense of Self for Unix Processes." IEEE Symposium on Security and Privacy, 1996.

[9] Dasgupta, D. "Artificial Immune Systems and Their Applications." Springer, 1999.

[10] Greensmith, J. et al. "Detecting Danger: The Dendritic Cell Algorithm." Springer, 2008.

[11] Matzinger, P. "The Danger Model: A Renewed Sense of Self." Science, 2002.

[12] MAIS-IDS: A Distributed Intrusion Detection System Using Multi-Agent AIS Approach. Engineering Applications of AI, 2014.

[13] Huynh, T.D. et al. "An Integrated Trust and Reputation Model for Open Multi-Agent Systems." AAMAS, 2006.

[14] Sabater, J. and Sierra, C. "ReGreT: Reputation in Gregarious Societies." ACM AA, 2001.

[15] Liu, Y., et al. "AgentTrust: A Benchmark for Evaluating Trustworthiness of LLM Agents." arXiv:2402.14930, 2024.

[16] "Preventing Rogue Agents Improves Multi-Agent Collaboration." ACL REALM Workshop, 2025.

[17] "Towards Safe and Honest AI Agents with Neural Self-Other Overlap." arXiv:2412.16325, 2024.

[18] TRiSM for Agentic AI. arXiv:2506.04133, 2025.

[19] "A Novel Zero-Trust Identity Framework for Agentic AI." arXiv:2505.19301, 2025.

[20] Chi, Y., et al. "AgentMonitor: A Plug-and-Play Framework for Predictive and Secure Multi-Agent Systems." arXiv:2408.14972, 2024.

[21] Nedergaard, M. and Goldman, S.A. "Glymphatic Failure as a Final Common Pathway to Dementia." Science, 2020.

[22] Olney, J.W. "Excitotoxic Amino Acids and Neuropsychiatric Disorders." Annual Review of Pharmacology and Toxicology, 30:47-71, 1990.

[23] Google. "Agents Companion." Kaggle Whitepaper Series, 2025. (Documents error compounding at 10% per agent in multi-agent chains.)

[24] Dell'Acqua, F., McFowland, E., Mollick, E., Lifshitz-Assaf, H.,
     Kellogg, K., Rajendran, S., Krayer, L., Candelon, F., and
     Lakhani, K. R. *Navigating the Jagged Technological Frontier:
     Field Experimental Evidence of the Effects of AI on Knowledge
     Worker Productivity and Quality*. Harvard Business School
     Working Paper 24-013, September 2023.

[25] Kadaboina, R. K. *Yathartha: A Protocol-Layer Treatment of
     Jagged Intelligence in Autonomous Agent Networks*. Zenodo,
     2026. DOI: 10.5281/zenodo.19659632.
     https://doi.org/10.5281/zenodo.19659632

[26] Wang, C. L., Singhal, T., Kelkar, A., and Tuo, J. *MI9: An
     Integrated Runtime Governance Framework for Agentic AI*.
     arXiv preprint arXiv:2508.03858, 2025.
     https://arxiv.org/abs/2508.03858

---

