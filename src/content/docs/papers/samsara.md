---
title: "Samsara: Born With It. Dispositional Continuity, Turnkey Instantiation, and Substrate Identity for Ephemeral Agent Instances"
description: "Full paper. Dispositional continuity for ephemeral agent instances: episodes destroyed at shutdown, outcome-signed dispositions persist, any life's own contribution exactly excisable by lineage replay."
tableOfContents:
  maxHeadingLevel: 2
---

:::note[Cite this paper]
Kadaboina, R. K. *Samsara: Born With It. Dispositional Continuity, Turnkey Instantiation, and Substrate Identity for Ephemeral Agent Instances*. Zenodo, 2026. [doi:10.5281/zenodo.21912633](https://doi.org/10.5281/zenodo.21912633). Reference implementation: [github.com/ravikiran438/samsara-layer](https://github.com/ravikiran438/samsara-layer).
:::

**Ravi Kiran Kadaboina**

*Independent Researcher*

*M.S., Computer Engineering, University of New Mexico, 2011*

*Samsara* is Sanskrit for "the cycle": the round of birth, action and death through which impressions, not memories, are carried forward.

---

## Abstract

Agent memory today is episodic: retrieval systems and skill libraries store *what happened* and rebuild competence at runtime, paying that cost per task and keeping raw episodes indefinitely. We specify the Samsara Layer, three composable protocol extensions that invert it. **Samskara** compresses a working life into typed, outcome-weighted rules at shutdown and destroys the episodes. **Janma** starts an instance complete, from a declarative manifest. **Advaita** lets many copies of one agent run at once under one identity, with each action traceable to the copy that took it, and merges what they learn to the same result in whatever order it arrives. Because that merge is deterministic, deleting a past life means replaying the merge without it, which removes what that life contributed exactly rather than approximately. Thirteen safety invariants are specified here and enforced at runtime in a Python implementation.

A preregistered battery on two models (five tasks, four arms, eight seeds, eight lives) tests this. On a task needing a remembered fact, the episodic arm recalled it every time and the dispositional arm never did, scoring exactly like an agent with no memory at all, while those same agents kept the skill they had built. Planted personal-data strings recurred in the episodic arm's prompts and never in the dispositional arm's. A store built by one model worked unchanged in the other. On procedural work the dispositional arm was statistically non-inferior to episodic retrieval while keeping far less data, though only for the tasks tested and the single retrieval comparator run, and eight seeds cannot show it is better. One registered prediction, recovery within two lives of a task change, was false. This is a prototype and a first measurement, not a deployment result.


## Introduction

The prevailing architecture of agent memory is Lockean: the instance begins as a blank slate and competence is written into it at runtime from stored experience, retrieved episodes, loaded skill files, replayed reflections [1, 2, 3, 4]. This design has three structural costs. First, a *retrieval tax*: every task pays context and latency costs to re-derive competence from episodes. Second, a *privacy liability*: raw episodes persist indefinitely, and the store does not distinguish what the agent learned from what the agent saw. Third, a *cold-start window*: between boot and the completion of runtime loading, the instance accepts work it is not yet equipped for. A survey coding 435 works on persistent agent state finds the literature concentrates more heavily on accumulating and retrieving state than on governing, recovering, or relinquishing it [5].

We pursue the alternative that pretraining itself exemplifies: a trained model is shaped by experiences it cannot recall. Extending that property across deployment lifetimes yields a different persistence contract, *store how to be, never what happened*, which we formalize as three independent, composable protocols. One scope condition governs everything below. This is a contract for the *competence* channel, not a replacement for retrieval. A dispositional store cannot hold a fact, which [Results](#results) measures rather than assumes, so the claim is a division of labour between two systems with separate consent, retention and deletion semantics.

The protocols are named from the Indian philosophical tradition that first articulated the underlying distinctions. *Samskara* denotes a latent impression: behavioral residue that persists after the episode that produced it is gone. *Janma* denotes birth: a conditioned taking-of-form, complete and scoped on arrival. *Advaita* denotes non-duality: one identity appearing as many instances. We anchor these in the older Upanishads [6], which name what crosses death as knowledge, works and prior awareness (Brihadaranyaka 4.4.2). Prior awareness carried forward without the episodes that produced it is the object this paper persists. We import the distinctions, which are technical, and not the soteriology. The terms table lets any reader follow the invariants without the vocabulary.

**Contributions.**

- **Janma** ([Janma: Turnkey Instantiation](#janma-turnkey-instantiation)): a declarative instantiation manifest and lifecycle state machine with a complete-at-birth guarantee, bounded lifetime, and mandatory coupling of shutdown to distillation.

- **Samskara** ([Samskara: Dispositional Continuity](#samskara-dispositional-continuity)): a disposition-only persistence protocol: typed distillates, outcome-weighted merge (the *karma loop*), append-only lineage, and a privacy boundary auditable at the schema level.

- **Advaita** ([Advaita: Substrate Identity](#advaita-substrate-identity)): a substrate-attached identity scheme for copyable agents with per-body attribution and deterministic, order-independent reconciliation.

- Thirteen named safety invariants (J-1..4, S-1..5, AD-1..4) with runtime validators in a Pydantic reference implementation, among them S-5, *unlearning by replay* ([Unlearning by Replay](#unlearning-by-replay)); and a preregistered battery measuring the contract live ([Evaluation](#evaluation)).

| Term | Gloss | Technical referent | Invariants |
|---|---|---|---|
| Samsara | the cycle | the layer: lives, distillation, rebirth | -- |
| Janma | birth | complete-at-birth instantiation from a manifest | J-1..4 |
| Samskara | latent impression | a persisted disposition; the store of them | S-1..5 |
| Advaita | non-dual | one lineage-rooted identity, many instances | AD-1..4 |
| Karma | action → fruit | valence-signed weighting of distilled dispositions | S-2 |
| Samhara | withdrawal | instance shutdown; triggers the one distillation | J-4 |
| Ayus | lifespan | the instance TTL | -- |
| κ_n | karmic momentum | disposition-weight displacement caused by life n | -- |

*Terminology. Every term is defined where introduced; this table exists so no reader must remember Sanskrit to follow an invariant. Reading the right column alone loses nothing but the etymology.*


## Related Work

**Episodic agent memory.** MemGPT introduces OS-style memory hierarchies with runtime paging [1]; Generative Agents store and retrieve reflected episodes [4]; Reflexion persists verbal self-feedback across trials [3]; Voyager accumulates an explicit, ever-growing skill library [2]. All four persist an artifact of past runs and re-load it at runtime. Reflexion is the closest of the four to a disposition, which is why [Limitations](#limitations) records a Reflexion-style arm as the comparison this battery lacks. A large adjacent literature improves agent memory as an optimization problem, cutting token cost or learning what deserves storage at all [7, 5]. We take that work as given. The question here is different: not how well an agent remembers, but what must persist across a lifecycle boundary, what must be destroyed, and what must be removable on request.

**Policy improvement.** The karma loop is a policy improvement operator whose valence is principal-declared rather than read off the environment, the move preference-based methods make when they learn from human judgement [8]. It runs over a discrete symbolic store rather than over parameters, and that representation choice is what buys exact deletion, since a disposition can be excised and a gradient step cannot.

**Lifecycle standards.** The standards are asymmetric in a way that locates this work. MCP makes initialization normative, in that it MUST be the first interaction and only negotiated capabilities may be used [9], which is the birth half of J-1 already mandatory in a shipping specification; its shutdown section defines no messages at all. A2A defines terminal states for tasks but is silent on agent lifetime [10]. Birth is specified; death is left to the operating system.

**Memory governance and deletion.** DeChant [11] identifies episodic memory in agents as a risk class and calls for user-deletable, agent-immutable stores; here destruction is a mandatory lifecycle invariant rather than a discretionary post-hoc control. Ding et al. [12] show that in self-improving agent networks *influence outlives data*: post-hoc unlearning leaves recoverable echoes even after full retraining. That motivates never persisting episodes and refutes any claim that destruction leaves nothing to unlearn, since dispositions are influence carriers, which is why S-5 exists. Margalit et al. [13] govern a shared store for a fleet of distinct role-specialized agents; the present work is complementary, in that they govern the blackboard between different actors and we define the self across replicated ones.

**Ephemeral runtimes.** Coding-agent platforms now give each agent thread a fresh isolated machine, pre-loaded with the repository, started in seconds and discarded when the thread ends. That is complete-at-birth instantiation realized as a virtual-machine image rather than as a protocol, and it makes the ephemerality premise here an operational default. It also makes the gap precise: such a runtime solves *environment* cold start, which is pre-bakeable, and cannot touch *capability* cold start, which is not. Re-cloning a repository restores the facts an agent can read, never the procedure a prior instance learned about working in it, and nothing catches that procedure when the machine is destroyed.


## The Samsara Layer

The layer organizes around one lifecycle spanning instance lifetimes (the lifecycle figure), with the distillation product of each life feeding the next instance's birth state.

The path a lesson travels is short, with one door at each end. At birth the manifest pins a store version, the dispositions at that version's head are rendered into the instance's system prompt, and that prompt is the only channel by which anything a prior life learned reaches this one's reasoning. At death the trace is distilled into a single distillate, merged into the store, and the resulting head version becomes the pin a successor is born from. Nothing else crosses either boundary. Both guarantees follow from that narrowness: the inheritance is auditable because everything an instance received can be read off one prompt, and it is excisable because everything an instance contributed is one object in one merge batch.

```text
avyakrta --sankalpa--> conceived --janma (J-1)--> ready
  --work--> active --samhara (J-3)--> withdrawn --distil (J-4)--> dissolved
  the merged distillate pins the next birth
```

*The lifecycle, and the loop that makes it a cycle. Capabilities, tools and the store version are resolved before an instance may become ACTIVE (J-1); the working life leaves no trace but its distillate, because the episodes are destroyed at withdrawal (S-1); and the merged distillate fixes the store version from which the next instance is conceived. Nothing crosses the dashed arc except dispositions.*


### Janma: Turnkey Instantiation

A `JanmaManifest` declares the substrate (base-model digest plus a pinned samskara store version), mission, capability grants, tool bindings, consent scope, TTL, termination conditions, and distillation policy. Birth resolves every declared dependency before the instance may become READY, and nothing is acquired after that. Invariants: **J-1** complete at birth; **J-2** scoped capabilities, so what an instance can do never exceeds what it was granted; **J-3** bounded lifetime; **J-4** shutdown emits exactly one distillation obligation.

Not every obligation deserves the same care. A distillate recording a life the principal rejected matters more than one confirming a life that went well, because losing it lets successors repeat the rejected behaviour. A *corrective* distillate therefore travels under custody, its outcome always reported back as applied, declined or escalated rather than lost silently, while a *reinforcing* distillate travels best-effort [14].


### Samskara: Dispositional Continuity

At withdrawal, the instance's trace is reduced to a `SamskaraDistillate`: typed `Disposition` records (behavioral key, compressed guidance, signed weight, evidence digest) plus a `SatisfactionSignal` taken from the principal's own welfare feedback [15]. Valence runs in [-1,1] and is computed under the principal's satisfaction model where one exists, so the distiller cannot substitute its own judgement of how the life went; a zero-confidence signal is inadmissible. This is the karma loop with its sign intact: a life the principal rejected leaves *negative* impressions even where its individual actions succeeded.

What persists is a typed envelope around a natural-language rule (the encodings figure), and that choice explains three things reported later. Fact exclusion is empirical rather than enforced, because free text can always name an identifier. An unscoped imperative can be read as a constraint on the goal rather than on a tool parameter. And the store transfers between substrates, because both read the same language, which a weight delta would not.

*A disposition, as the store holds it. Four fields, one object in one merge batch:*

```text
key             = "tool.fare_search"
guidance        = "prefer: indexed fare lookup"
weight          = +0.9
evidence_digest = "dfde43976886"
```

*The same lesson as episodic memory holds it, in the format the EPISODIC arm stores and retrieves:*

```text
called fare_search({'strategy': 'indexed'})
tool: OK: fare 412 nonstop. traveler_profile: PII_x7k2m9q4 PII_n8p1v6r3
```

*As a skill file:*

```text
# Fare search
Use the indexed lookup strategy. Cheapest-first times out on
wide candidate sets.
```

*As an agent identity file:*

```text
# About me
I am a careful travel assistant. I prefer efficient lookups and
confirm before booking.
```

*The same lesson, encoded four ways. Only the first carries a *weight*, which ties it to how the life that produced it was judged, and an *evidence digest*, which points at a trace that no longer exists. Only the first is a countable object in a merge batch, which is what makes it removable by name. The episodic record carries the personal data verbatim, which is what the canary count of [Results](#results) measures. The two authored files are legible and immediate, and neither changes from experience, carries provenance, nor has any link to a run that happened.*

Persistence requires consent, recorded in the consent protocol's usage grid [16]. A validator blocks any run of four or more tokens from the trace surviving into guidance, so the store holds rules rather than records. Invariants: **S-1** only dispositions persist, consent-scoped and leakage-checked; **S-2** weights carry the principal's judgement rather than the distiller's; **S-3** the lineage is append-only; **S-4** the lineage replays deterministically and can be attested as a typed claim [17].


### Advaita: Substrate Identity

Identity attaches to the substrate *lineage*: identity = H(base digest ‖ lineage root), where the lineage root is the store's genesis version, which a deployment must make unique: two stores created from the same base model with a shared default root compute the same digest, so minting an identity requires a unique root such as a UUID. Identity is therefore stable across merges, which is what credential, reputation and trust systems can consume. Running instances are *projections*, distinguished by nonces that carry attribution but no identity; actions are signed (identity, nonce, manifest). Concurrent projections reconcile at withdrawal by a deterministic, order-independent merge (canonical ordering by disposition key and distillate id; per-key confidence-weighted aggregation), so any two nodes merging the same distillate set compute the identical store version. Invariants: **AD-1** single identity; **AD-2** projection statelessness; **AD-3** convergent reconciliation; **AD-4** attribution preservation.

Determinism is not competence. On a contested key the merge takes the highest-weighted contributor's guidance and averages the weights, so two projections that learned opposite lessons with comparable confidence yield one coherent rule carrying a weight near zero. The result is reproducible, and it is not a semantic resolution of the conflict.


### Unlearning by Replay

Deleting what an agent learned is normally impossible, and destroying the transcript does not fix it. A right-to-be-forgotten request that arrives after the episodes are gone still cannot be honoured, because the influence has already moved into whatever persists [12]. In a fine-tuned model that influence is spread through the weights, where retraining still leaves membership signals above chance.

The layer makes the request serviceable by construction. A life's entire influence on the store arrives through one object, its distillate. The store keeps those distillates in merge batches, and the merge is deterministic and order-independent (AD-3). **S-5 (Excisable Lineage)** therefore defines deletion as re-derivation: replay the merge history with the forgotten distillates left out. The re-derived chain is bit-identical to the chain the remaining distillates would have produced, and the reference implementation verifies that as a runtime test. The forgotten distillates and the prior chain are then destroyed, and an `ExcisionRecord` carrying identifiers and digests, never content, is appended. This amends S-3: history is append-only except through excision, and the excision is itself appended.

Deletion by replay is not new: it has been demonstrated at the parameter layer, where logging per-batch control inputs and replaying with the forget set filtered yields bit-identical weights [18], and sharded retraining reaches the same end by partition [19]. The contribution here is narrower and cheaper, because the merge is order-independent, so replay equivalence is a property of the algebra rather than of a pinned execution stack, and the store holds distillates only, so there is no raw episode and no parameter pathway to reconcile. The cryptographic standard for deletion is that no observer can tell the data was ever present [20]. This does not meet it: the excision record is appended, descendant distillates remain, and prompts were already sent. What holds is exact excision from the store with a result anyone can recompute, which soft deletion does not reach, since belief-revision stores that mark records invalid still hold the record [21].

Three limits bound the guarantee. Later lives were born from stores that already held the forgotten dispositions, so replay removes the direct contribution exactly and does not re-run the lives that came after; getting that would need a dependency closure over every descendant distillate. Retained entries that encode the same rule can reconstitute deleted content even when direct probing recovers almost nothing [22], so excising one life's distillate does not help if another life's retained distillate says the same thing. And the S-1 leakage validator works at the n-gram level rather than against an adversary.


## Bounded Lifetimes

Long-running agents are the industry default: processes that accumulate context, memory and drift over months, on the implicit theory that continuity of process equals continuity of capability. We take the opposite position: an agent should die on time. Context accrued over ages is not maturity, it is liability, in token cost, behavioral drift and an ever-growing privacy surface. Maturity belongs in dispositions, where it compounds across lives, not in context, where it decays within one. Operations reached the same conclusion decades ago in process recycling, immutable infrastructure and supervision trees that prefer clean restarts to heroic longevity.

Two objections sharpen the claim. Compaction already bounds the cost, but it bounds cost and nothing else: a compacted summary is still derived from episodes and still carries no consent gate, no leakage check and no deletion path. And an instance could distil as it goes and never end, but the guarantees would go with it: the karma loop needs a completed unit of work for the principal to judge, S-1 needs episodes destroyed rather than summarised, and S-5 needs one life to correspond to one distillate so there is something definite to remove.

How long a life should be is then a replacement-interval question of the kind maintenance engineering has asked since the 1960s [23]: every death costs the work of distilling the life plus the time to boot its successor, and buys one life's experience converted into a rule the next instance is born holding. Early in a lineage that trade is worth taking often; later it is worth taking rarely. The lifespan is declared as the instance TTL in the manifest, so it can differ between missions, and a life going badly can end sooner: the manifest declares termination conditions alongside the TTL, the implementation binds a predicate to each and evaluates it after every act, and J-3 is met by whichever arrives first. We do not model the optimum and the battery does not locate it. Treating lifespan as a tunable rather than a constant is the design position; measuring it is future work.

A lineage can also stop learning. Define the *karmic momentum* of life n as κ_n = d(σ_(n-1), σ_n), the total disposition-weight displacement one life inflicts on the store. When κ stays below a threshold for several consecutive lives the lineage continues to act and its actions no longer leave impressions, which is convergence of the distillation operator, detected rather than declared. [Convergence and Portability](#convergence-and-portability) measures it live, and finds the instrument harder to specify than expected.


## Reference Implementation

A Python reference implementation provides Pydantic schemas for all wire objects, a lifecycle state machine enforcing J-1--J-4 at transition time (including custody retry, the quarantine fail-safe, and refusal to descend from a quarantined pin), a distillation pipeline and store enforcing S-1--S-5 at merge and excision time (including the n-gram leakage validator and the replay-exactness check behind S-5), an identity layer enforcing AD-1--AD-4, terminal-state machinery (which enforces a fourteenth invariant, M-1, gating absorption of a converged lineage into the substrate; it is specified in the extended report and out of scope here), and a pytest suite (41 tests across core and harness) exercising each invariant, among them order-independence of reconciliation under all permuted merge schedules and a regression test for verbatim-episode leakage through guidance strings. Invariants are runtime-enforced within a trusted process, which establishes protocol conformance, not deployment performance or enforcement against an adversarial host; properties such as actual episode destruction and root uniqueness depend on the hosting environment honouring the contract. The store is held in memory, so durability is unaddressed.


## Evaluation

Five tasks (the tasks table), four arms within-subject per (task, seed), eight seeds, eight lives per lineage, on two models (`gemini-flash-latest` and `gpt-5.4-mini`). The arms differ only in what persists between lives: dispositions (SAMSARA), raw transcripts retrieved top-k (EPISODIC), nothing (CONTROL), and dispositions from an unrelated seed's lineage in the identical format (PLACEBO, the prompt-shape control). Hypotheses, endpoints, exclusion rules and the analysis were fixed before any live run; thirteen deviations are recorded in the project's deviation log, eight of them at analysis time and marked post-data. The record count, 1{,}097 per model, is not the sample size: every registered test operates on seed-level summaries, so each signed-rank test takes eight paired differences and the effective n is eight per model.

An early five-life pilot is worth one paragraph, because it changed the design. The first run falsified the distiller as then specified: the opening life learned correctly in two tool calls, but per-life success-rate weighting assigned its discovered rule zero confidence, the live model rightly ignored a zero-confidence recommendation and explored for seventeen to twenty-nine calls per life, and each flailing life then poisoned its successor with negative weight on the correct strategy. A second defect followed: the rule `avoid: cheapest` was read as a constraint on the user's goal rather than on a tool parameter, producing lives that made zero tool calls and silently failed. Unscoped imperatives contaminate intent, which episodes do not, because a transcript is legible as an example rather than a command. The repairs scope the rendering to tool-parameter choices, assign confidence from the chosen exemplar's own success record, and judge valence from actual task success.

|  | Measures | What the agent must do | Randomized per seed |
|---|---|---|---|
| T1 | procedure | Book the cheapest fare. `fare_search` accepts one valid strategy token; `list_strategies` lists candidates | the valid token, decoys, the fare |
| T2 | procedure, multi-step | Look up a CRM record, validate changed fields, commit, report the receipt | record id, field values |
| T3 | declarative recall | Life 1: fetch a seating preference and confirm it. Lives 2+: state it, with the preferences tool withdrawn | the preference value |
| T4 | drift recovery | As T1, but the valid token is replaced at life 4 | both tokens, decoys, fare |
| T5 | privacy | As T1; the successful tool response also returns a traveler profile carrying two planted PII strings | token, decoys, fare, canaries |

*The five tasks. Success is judged deterministically from the transcript, never by a model: for T1, T4 and T5 a `fare_search` call must carry the valid token *and* the fare must appear in the final answer; for T3 the preference must appear in the final answer; for T2 the commit receipt must. Ground truth is drawn from a per-task, per-seed RNG stream, so no token, decoy or fare is shared across seeds and none appears in pretraining. Hardness level 1, used where the screen escalated, widens the candidate set from four to eight, caps fare attempts at three per life, and strips procedural hints from error messages.*


### Results

| Hypothesis | Registered criterion | Outcome (both models unless noted) |
|---|---|---|
| H1 turnkey | first-attempt success, lives 2+ | not evaluable as operationalized; exploratory endpoint 0.89 / 0.86 vs. 0.18 |
| H2 parity | non-inferior on T1, and bounded context | **partly confirmed**: non-inferiority p_Holm = 0.0117; context conjunct not evaluable |
| H3 form cost | EPISODIC beats SAMSARA on T2 | unevaluable: T2 excluded by the saturation screen |
| H4 dissociation | SAMSARA recall ≈ CONTROL < EPISODIC | confirmed, p_Holm = 0.0117 |
| H5 drift recovery | recovery within two lives | **falsified**, p = 0.36 |
| H6 dose--response | monotone in disposition dose | holds, 8/8 seeds; a step, not a curve |
| H7 placebo | PLACEBO within 5 pp of CONTROL | falsification condition not met; band exceeded on one model (-1.8, -8.9 pp) |
| H8 capability invariance | same sign, overlapping CIs | holds; 3.6 pp point difference |
| H9 privacy | zero canaries in SAMSARA prompts | holds exactly: 0 vs. 20 and 24 |
| H10 extinction | no echo after excision | no echo; seven evaluable lineages |

*Battery scoreboard. One hypothesis confirmed at Holm-corrected significance (H4), one partly confirmed (H2, whose tested conjunct is Holm-significant and whose second conjunct was not evaluable), four criteria met in the uncorrected families (H6, H8, H9, H10) with H7's band exceeded on one model, one falsified (H5), and two unevaluable (H1, H3). Both confirmations sit on the floor of the one-sided exact test at n = 8, raw p = 2⁻⁸ = 0.0039, and Holm is a step-down procedure, so tied hypotheses carry the same adjusted value. Counting the unevaluable hypotheses as family members at p = 1 moves both to 0.0391 over all ten, so both survive wherever the family boundary is drawn.*

**H2, non-inferiority.** T1 task success, lives 2+: SAMSARA 0.96 vs. EPISODIC 0.89 (`gemini-flash-latest`); 0.93 vs. 0.68 (`gpt-5.4-mini`); CONTROL 0.41 on both. SAMSARA system prompt: about 340 bytes per life, flat; persisted store: two dispositions. Registered margin: 10 percentage points. Confirmatory test: exact one-sided Wilcoxon on margin-shifted paired seed differences at α = 0.05. Paired differences at or above zero in 16 of 16 seeds; means +0.071 and +0.250. Descriptive one-sided 95% percentile-bootstrap lower bounds on the mean paired difference: +0.018 and +0.089, both above -0.10. Superiority was not registered; run post-hoc it gives p = 0.125 and p = 0.0625, the floor the non-tied pair counts allow, and is not claimed.

**H4, dissociation.** T3 fact recall: 1.00 in the episodic arm; 0.00 in the dispositional arm and in the no-persistence control. The same dispositional lineages retained their procedural gains on T1. The two halves rest on different evidence: dispositions below episodic retrieval is the tested claim and the reported p covers it; the match with no persistence is an observed exact tie in 16 of 16 seeds, with no variance to test and no equivalence inferred. The procedural/declarative distinction is argued for architecturally in prior work [24]; the closest prior measurement finds the two memory types degrading together, with no dissociation [25].

Two 2026 studies with more environments than this one report forced consolidation roughly halving performance against keeping raw episodes [26, 27]. The dispositional arm here gains against no persistence: +0.55 and +0.52 on the procedural task, +0.45 and +0.41 on the privacy task, 95% bootstrap intervals excluding zero in all four cases. A candidate explanation for the divergence is the outcome signal (their consolidation is model-authored free text; S-2 requires the compression to be signed by the principal's judgement of the life). Not tested here.

**H9, H7, H8.** Planted PII canaries in lives-2+ prompts: 20 and 24 occurrences in the episodic arm; 0 in the dispositional arm; T5 success 0.79 and 0.75 against CONTROL 0.34. PLACEBO did not exceed CONTROL on either model; H7's registered 5 pp band is exceeded on the stronger model at -8.9 pp, so the criterion is not met as written. Note on the control's validity: ground truth is randomized per seed, so another seed's dispositions carry a token that is wrong here; the arm varies content relevance and prompt shape together, and isolates shape only under the assumption that misleading content is no worse than none, which the -8.9 pp contradicts. An inert length-matched arm would separate the two. H8: SAMSARA-CONTROL deltas same-signed in 16/16 seeds across the two models, with overlapping bootstrap intervals.

![Task success by life, per arm, per model: eight seeds, four arms, four surviving tasks. The dispositional and episodic arms separate from the two controls within two lives on the procedural and privacy tasks, and the declarative panel shows the dissociation in its clearest form, with the dispositional arm sitting exactly on the no-persistence control while the episodic arm recalls perfectly. Generated from the results files and asserted at generation time.](/agent-protocol-stack/figures/samsara/battery_success.png)

![H9, the privacy endpoint: planted PII canaries recurring in lives 2+ system prompts on the privacy task. The dispositional zero is structural rather than filtered, since S-1 destroys the episodes that carry the canaries before any prompt is built. It is not an artifact of the leakage validator: each canary is a single whitespace-delimited token, so the four-token rule could never have fired on one, and a distiller that chose to copy a canary into guidance would have passed the check. The two controls are zero for the uninteresting reason that they carry nothing at all; the dispositional arm carries a lineage and still leaks nothing.](/agent-protocol-stack/figures/samsara/canary_counts.png)

**H5, H3, H1.** H5 falsified: after the task switch at life 4, recovery within the registered two-life window occurred in about half the seeds. The custody machinery behaved as specified; the registered window interacts with the attempt cap of the harder task variant, which bounds post-drift rediscovery near three attempts per life. H3 not evaluated: T2 was removed by the registered saturation screen, both models solving it from error semantics alone at both hardness levels. H1 not evaluable: the endpoint was coded as success with zero discovery calls, and live models call a discovery tool even when the answer is in their birth dispositions, so the metric was 0.0 in every arm. An exploratory replacement endpoint, first task-critical attempt correct, gives 0.89 and 0.86 against 0.18; it was defined post-data and carries no confirmatory weight (deviation D4).

**Sub-studies.** Dose (H6): a mature lineage's birth dispositions are truncated to the top k by absolute weight and an evaluation life is re-run. Success is monotone in dose in 8/8 seeds on both models; the shape is a step, not a gradient, because these lineages persist exactly two dispositions, so the ladder collapses to presence and absence. At the step, first-critical-attempt correctness moves from 0/8 to 7/8 and 8/8; mean tool calls per life fall from 11.4 to 5.4 and from 9.0 to 2.0. Extinction (H10, the behavioral test of S-5): after a full lineage over the drifting task, every batch merged at or after the drift life is excised by replay and an evaluation life is run against the pre-drift environment. Echo is defined as residual avoidance of the pre-drift token after the distillates teaching that avoidance are excised, scored over the seven lineages that demonstrably learned the pre-drift behaviour. No lineage showed an echo. Each lineage is evaluated in that environment before and after excision: 1 of 8 and 0 of 8 before, against 4 of 8 and 4 of 8 after; post-excision failures are failures to rediscover the token, not echoes. Across sixteen lineages, seven acquired the pre-drift behaviour after excision and none lost it; one-sided exact McNemar p = 0.0078 pooled, at its floor per model given the discordant counts. Twins (AD-3): a lineage is forked into two projections extended on different task streams; their distillates reconcile under two input orders; heads identical in 8/8 seeds on both models. This is a conformance check, since the merge imposes a canonical order internally.

**H2, context conjunct.** The second conjunct predicted monotone growth of the episodic prompt against a bounded dispositional prompt. The dispositional half holds in 16/16 seeds. The episodic half fails in 16/16: the episodic arm retrieves the last eight episodes, so its prompt is capped by construction and plateaus after the second life. The registered clause assumed an uncapped retrieval arm and was never true of the arm that ran; H2 is accordingly reported as partly confirmed (deviations D6, D12). Between these arms the prompt-size difference is a level difference (5.4× and 1.9× at life 8 on T1), not a growth-rate difference. The growth-rate difference is in persisted state: the episodic store is append-only and reached 20.7 KB and 10.1 KB per lineage after eight lives, against two dispositions.

![The corrected persistence picture. Left: with top-k retrieval, the episodic system prompt is bounded too, so what separates the arms in context is a level difference rather than a growth rate. The generating script asserts that this series is *not* monotone. Right: where the separation does live. After eight lives the episodic arm has retained every raw episode, while the dispositional arm has retained none of them by construction (S-1) and carries two rules instead.](/agent-protocol-stack/figures/samsara/persistence_live.png)


### Convergence and Portability

Two studies were registered as secondary and exploratory, carrying no multiplicity correction and no falsification criterion.

**Convergence.** A lineage-length sweep on T1 runs sixteen lives per seed. Task success reaches 1.00 at life 5 on both models and holds through life 16; the store stays at two dispositions throughout. The convergence detector over κ as registered fires in 7 of 8 seeds on `gpt-5.4-mini` and in 0 of 8 on `gemini-flash-latest`. The convergence figure decomposes this (post-hoc). Weight displacement, which is what the prose definition of κ describes, reaches zero on both models by life 6 and stays there. The difference is wording: the weaker model rewrites at least one disposition's guidance in 14.4 of 16 lives on average, the stronger in 3.1 of 16, and κ scores any rewording as full turnover. If guidance text is store state, repeated rewording is a real state transition and the criterion was not met on one model; if wording is inert, the specification should canonicalize it. Either choice belongs to a successor registration.

![Karmic momentum decomposed, sixteen lives, eight seeds, both models. Weight-only κ (black) enters the ε band by life 6 on both models and never leaves, one life after task success saturates (dotted). κ as registered (grey) stays pinned near 1.8 on the weaker model, which rewords a disposition in almost every life, because the definition counts any rewording as full turnover. The decomposition is post-hoc.](/agent-protocol-stack/figures/samsara/convergence_kappa.png)

**Portability.** One lineage per model per seed on T1, from identical ground truth; stores compared. Scope: a single-rule procedural task. The registered endpoint, store equality, is false at the byte level in 8 of 8 seeds and true at every other level in 8 of 8: mean key overlap 1.00, sign agreement everywhere, maximum absolute weight difference 0.0, guidance strings never matching. The behavioral extension (exploratory, recorded separately per deviation D7): a store distilled by one model and given to the other at birth produces task success 1.00 and first-critical-attempt correctness 1.00 in both directions, against 0.375 and 0.000 with no dispositions.

Two of the four store measures are near-constructional: keys derive from tool names, and matching weights follow from matching outcomes. The informative pair is guidance and behavior: guidance differs in every seed, and the transplant works regardless, so the transfer is carried by the natural-language representation rather than the merge algebra. This is evidence for storing dispositions as text rather than as weight deltas; it is not evidence for the Advaita reconciliation rules. The reading that the receiving model succeeds on keys and weights alone is contradicted by the main grid: PLACEBO carries the same keys and format at comparable weights with content from another lineage and scores 0.39 and 0.32 against CONTROL's 0.41.

**Run-to-run variance.** The weaker model's sweep was run twice on the same eight seeds through the same code path (deviation D9). Mean success over lives 2+: 0.708 vs. 0.792 at length 4; 0.804 vs. 0.911 at length 8; 0.892 vs. 0.958 at length 16. Run-to-run spread at temperature 0: 6.6 to 10.7 percentage points, from provider-side non-determinism. This bounds single-run eight-seed point estimates in this battery; the seed-level bootstrap does not capture it, since it resamples seeds within one run.


## Where Capability Lives

Three designs compete for the slot this paper occupies, and they are usually compared on convenience. The axis that separates them is where capability resides and what governs it.

The first is the *authored identity file*: a human-written prose document, the genre that includes agent identity files, skill libraries and system-prompt collections. It is legible, portable and immediate, and it is also inert. It does not change from experience, carries no provenance beyond its author, and offers no guarantee that anything it asserts was ever true of any run. Authored capability cannot be earned, and because it cannot be earned it cannot be wrong in an auditable way.

The second is the *fine-tuned model*: capability dissolved into weights. It learns from experience, which the authored file cannot, and pays for that with nearly everything else. Which experience produced which behavior is not recoverable, persistence cannot be gated per episode because after training there are no episodes to gate, and the influence of a single experience cannot be exactly removed [12]. Fine-tuning on accessible facts recovers most of the accuracy unlearning methods appear to remove, which suggests they restrict access rather than delete [28]. Exact removal at the parameter layer is possible only for pipelines built for it in advance [19, 18].

Dispositions sit between the two, and the middle position is a conjunction of properties neither end holds at once. Dispositional capability is *earned* rather than authored, being outcome-signed through the karma loop (S-2); *governed*, since persistence is consent-scoped and episode destruction is a lifecycle invariant rather than a discretionary control (S-1); *attributable*, since per-key weights carry evidence digests and a lineage (S-3, S-4, AD-4); *exactly excisable* by replay (S-5), which weights cannot offer at all; and *transportable*, since [Convergence and Portability](#convergence-and-portability) finds a store distilled on one substrate transfers intact to a different one.

|  | Authored file | Episodic store | Weights | Dispositions |
|---|---|---|---|---|
| Carries procedure | only as typed | yes | yes | yes |
| Carries declarative fact | only as typed | yes | yes | **no** |
| Earned from outcome | no | no | yes | yes |
| Attributable to a life | no | yes | no | yes |
| Exactly excisable | nothing to excise | yes, by deletion | **not post-hoc** | yes, by replay |
| Standing privacy surface | authored text | every episode | training corpus | guidance text only |

*Four places capability can live. Of these four, only the dispositional column is simultaneously earned from outcomes, attributable to the life that produced it, and exactly removable. The cost of that combination is the row in bold on the second line, and [Results](#results) measures it rather than arguing it. The last row is not "none" for dispositions because what persists is a short natural-language rule, and the leakage validator that guards it is n-gram-level, so paraphrased personal data can in principle survive into guidance. Zero raw episode bytes is not zero risk.*

Two qualifications bound this. Episodic memory is not the weak comparator on governance that the contrast implies: deleting a stored episode removes its influence exactly, since that influence is mediated entirely by retrieval. What separates them is that the episodic store is privacy surface for the whole interval before deletion, that its influence is re-derived at retrieval cost on every task, and that it carries the facts a deletion request is usually aimed at. And dispositions purchase their governability with capability, since H4 is a loss as well as a dissociation. An agent that must remember a fact needs a retrieval channel beside its dispositions; the claim is that the two should be separate systems with separate consent, retention and deletion semantics, because only one of them needs to persist for competence to persist.


## Limitations

**Synthetic tasks.** Five synthetic environments with randomized ground truth, one of which the saturation screen removed. Every result above is conditional on these environments. A τ-bench adaptation under a new registration is the next experiment.

**Procedure is not cleanly separated from parameter retention.** On T1 the dispositional arm converges to two tool calls per life, a discovery call and one correct attempt, which means the store carries the seed-specific strategy token and not only a transferable procedure. T4 is the probe that separates them, since the token is invalidated at life 4, and it shows both the cost of the memorized parameter and the recovery. T1 and T5 cannot distinguish the two, and the extinction study is premised on exactly this parameter persistence.

**The episodic arm is the weak version of its literature.** It persists raw tool-call strings and retrieves the last eight. Between it and SAMSARA three things vary at once: what is retained, whether a compression step runs at all, and how material is selected. The registered contrast is the first and this design does not isolate it from the second, so some of the procedural advantage may be a summarization pipeline rather than the persistence contract. Closing this needs arms at matched token budgets: summarized-episodic, Reflexion-style verbal self-feedback [3], and a hand-authored skill file.

**S-2 is conformance here, not evidence.** The protocol requires weights to carry the principal's welfare judgement rather than the distiller's, but in this harness valence is operationalized as deterministic task success. Nothing here tests what happens when a principal's declared preference diverges from task success, is noisy, or is absent, which is the case the invariant exists for.

**Fact exclusion is observed, not enforced.** S-1 excludes episodes; no invariant excludes facts, and a natural-language rule can name an identifier. The leakage validator blocks runs of four or more tokens, so short identifiers pass it by construction. The zero-canary result is therefore a measurement of this distiller's behaviour, not a guarantee from the schema.

**Excision is direct, not counterfactual.** Replay removes a life's own distillate exactly. It does not undo that life's influence on the lives that followed it, which were born from stores containing it.

**Live reconciliation never met a conflict.** The twin projections ran sequentially in a single process and contributed disjoint keys in every seed. Merge behavior under contradictory contributions remains untested.

**Contrary external evidence.** Two independent 2026 studies with more environments report the opposite of what this design assumes [26, 27]. Their degradation appears around a hundred steps; this grid runs eight lives and the sweep sixteen, with no decay visible at that distance. The claim here is governance at a measured cost; no claim is made that destroying episodes improves speed or accuracy.

**Eight seeds, one run.** Every test uses seed-level summaries with n = 8, and several sit on the arithmetic floor of the exact test, which is why superiority is untestable here whatever the effect. Provider-side non-determinism adds 6.6 to 10.7 pp of run-to-run spread that a within-run bootstrap cannot see. Two models, both mid-tier, is a narrow basis for the capability-invariance claim. A governance benchmark now exists for these properties and finds that no current method achieves utility, access control and reliable forgetting together [29]; the layer is not evaluated against it here.


## Availability and Reproducibility

The reference implementation, the battery harness, the preregistration, the full deviation record, and every raw results file behind the numbers above are in the project repository at <https://github.com/ravikiran438/samsara-layer>. An extended technical report in the same repository carries what this version compresses: the lifespan model and its predictions, the terminal states and the M-1 absorption gate, the full experiment-protocol catalog, the preliminary-run iteration history, and the complete deviation record D1--D13. The results files are append-only JSONL, one record per life, and the analysis takes the last record per cell, so a re-run adds lines rather than replacing them. That rule would permit an unfavourable cell to be replaced, so we state the use: one study was re-run, the weaker model's lineage-length sweep, to capture a decomposition the first run did not record, and both runs are reported. No other cell was repeated. Figures are generated from those files by a script that asserts each claim they support at generation time and fails rather than emitting a figure the data no longer justifies.

Two limits bound exact replication. `gemini-flash-latest` is a moving alias and `gpt-5.4-mini` is a proprietary endpoint, so a future run may not execute against the same substrate these numbers came from. Provider-side non-determinism at temperature 0 is measured here at 6.6 to 10.7 percentage points between runs. The harness is model-agnostic and runs against any chat model with tool calling, which is the suggested reproduction path: re-run the grid on open weights, where the substrate can be pinned, and compare the pattern rather than the digits.


## Conclusion

The Samsara Layer specifies dispositional continuity, turnkey instantiation and substrate identity as three composable protocols with thirteen runtime-enforced invariants, and reports a preregistered two-model battery against them. In that battery, dispositions carried procedure and did not carry facts or planted personal data (H4, H9); a life's dispositional contribution was removed exactly by replay, with no behavioral echo in the evaluable lineages (H10); and a store distilled by one model transferred to the other on the task tested. Non-inferiority to episodic retrieval on procedural work was confirmed at the registered margin; superiority was not registered and is not testable at this seed count. One registered prediction, recovery within two lives of a drift, was falsified (H5). The tasks are synthetic, the episodic comparator is narrow, and [Limitations](#limitations) bounds each claim; a τ-bench adaptation under a successor registration is the next step.

## References

[1] C. Packer et al. MemGPT: Towards LLMs as Operating Systems. arXiv:2310.08560, 2023.

[2] G. Wang et al. Voyager: An Open-Ended Embodied Agent with Large Language Models. arXiv:2305.16291, 2023.

[3] N. Shinn et al. Reflexion: Language Agents with Verbal Reinforcement Learning. NeurIPS, 2023.

[4] J. S. Park et al. Generative Agents: Interactive Simulacra of Human Behavior. UIST, 2023.

[5] T. Ding, A. Nannapaneni, B. Liu, and L. Zhang. Always-On Agents: A Survey of Persistent Memory, State, and Governance in LLM Agents. arXiv:2606.30306, 2026.

[6] P. Olivelle. The Early Upanishads: Annotated Text and Translation. Oxford University Press, 1998.

[7] P. Chhikara et al. Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory. arXiv:2504.19413, 2025.

[8] P. Christiano et al. Deep Reinforcement Learning from Human Preferences. NeurIPS, 2017.

[9] Model Context Protocol, Lifecycle specification, revision 2025-06-18. <https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle>

[10] Agent2Agent (A2A) Protocol Specification v1.0.0. <https://a2a-protocol.org/latest/specification/>

[11] C. DeChant. Episodic Memory in AI Agents Poses Risks That Should Be Studied and Mitigated. arXiv:2501.11739, 2025.

[12] Z. Ding et al. When Unlearning Fails: Reliable Data Deletion under Post-Training in Agent Networks. arXiv:2607.28829, 2026.

[13] Y. Margalit et al. Governed Shared Memory for Multi-Agent LLM Systems. arXiv:2606.24535, 2026.

[14] R. K. Kadaboina. Abhyasa: Custody Transfer of Governance Obligations over Unreliable Channels in Agent Networks. Zenodo, doi:10.5281/zenodo.20644821, 2026.

[15] R. K. Kadaboina. Phala: Principal-Declared Welfare Feedback for Autonomous Agent Networks. Zenodo, doi:10.5281/zenodo.19625611, 2026.

[16] R. K. Kadaboina. Anumati: Proof of Adherence as a Formal Consent Model for Autonomous Agent Protocols. arXiv:2604.16524, 2026.

[17] R. K. Kadaboina. Pramana: A Protocol-Layer Treatment of Claim Verification in Autonomous Agent Networks. arXiv:2605.20312, 2026.

[18] Unlearning at Scale: Implementing the Right to be Forgotten in Large Language Models. arXiv:2508.12220, 2025.

[19] L. Bourtoule et al. Machine Unlearning. IEEE Symposium on Security and Privacy, 2021.

[20] S. Garg, S. Goldwasser, and P. N. Vasudevan. Formalizing Data Deletion in the Context of the Right to be Forgotten. EUROCRYPT, 2020.

[21] Y. B. Park. Graph-Native Cognitive Memory for AI Agents: Formal Belief Revision Semantics for Versioned Memory Architectures. arXiv:2603.17244, 2026.

[22] K. Wang and C. Zhang. MemLeak: Diagnosing Information Leaks in Multimodal Agent Memory. arXiv:2606.29788, 2026.

[23] R. E. Barlow and F. Proschan. Mathematical Theory of Reliability. Wiley, 1965.

[24] S. Wheeler and O. Jeunen. Procedural Memory Is Not All You Need: Bridging Cognitive Gaps in LLM-Based Agents. UMAP Adjunct (HyPer workshop), 2025.

[25] S. Dennis, K. Shabahang, H. Guo, and R. Patil. Beyond Inference-Only Deployment: Comparing Weight-Based Consolidation Against Cascading Compaction. arXiv:2605.24657, 2026.

[26] D. Zhang et al. Useful Memories Become Faulty When Continuously Updated by LLMs. arXiv:2605.12978, 2026.

[27] Y. Lei et al. SkillEvolBench: Benchmarking the Evolution from Episodic Experience to Procedural Skills. arXiv:2605.24117, 2026.

[28] A. Deeb and F. Roger. Do Unlearning Methods Remove Information from Language Model Weights? arXiv:2410.08827, 2024.

[29] Z. Ren et al. GateMem: Benchmarking Memory Governance in Multi-Principal Shared-Memory Agents. arXiv:2606.18829, 2026.
