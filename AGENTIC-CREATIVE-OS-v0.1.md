# PROJECT — Agentic Creative OS v0.1

> Hinzugefügt am 2026-07-22 via Hermes (Telegram, Ralf).
> Status: Eingang / unbearbeitet. Kein Commit ohne Freigabe.

## ARCHITECTURAL CLASSIFICATION

Build a human-governed Autonomous Creative Production System.

This is NOT:
- a website generator,
- a chatbot,
- a single-agent application,
- a prompt collection,
- an autonomous company with sovereign AI authority,
- a Paperclip fork,
- a Hermes fork.

This IS:
- a domain package and workshop system for producing creative artifacts,
- a constitutional and auditable project lifecycle,
- a model-neutral and runtime-neutral agent organization,
- a human-ratified production architecture,
- a reusable basis for websites, branding, books, films, apps,
  exhibitions, learning worlds and hybrid artifacts.

## FOUNDATIONAL PRINCIPLE

Human intention is not a technical specification.

The system MUST:

1. preserve human authorship;
2. reconstruct multiple interpretation hypotheses;
3. disclose uncertainty and alternative readings;
4. generate a decision space;
5. allow agents to perform operational work;
6. require human ratification at defined gates;
7. preserve provenance, decisions and losses;
8. learn only from ratified records or evidenced observations.

The system MUST NOT:

1. treat an agent proposal as authorization;
2. treat a model output as canonical truth;
3. publish externally without an approved effectuation event;
4. merge model identity, organizational role and execution runtime;
5. use a single hidden quality score;
6. promote runtime memory into canonical memory automatically;
7. generalize client preferences across projects without permission;
8. allow an agent to expand its own mandate.

## CORE TYPE SEPARATION

Implement separate types for:

- HumanAuthority
- AgentRole
- AgentAssignment
- ModelProfile
- RuntimeAdapter
- Mandate
- IntentRecord
- InterpretationHypothesis
- SemanticBrief
- CreativeCharter
- CreativeDirection
- HumanSelection
- WorkPackage
- CandidateArtifact
- Assessment
- RatificationDecision
- EffectuationEvent
- ProjectionPackage
- Observation
- ReEntryProposal
- MemoryRecord
- ProvenanceRecord

ROLE, MODEL AND RUNTIME MUST BE INDEPENDENT.

Example:

```yaml
role:
  chief-experience-architect

runtime:
  hermes-gateway

model_profile:
  kimi-architect

mandate:
  project-petra-architecture-v1
```

Do not hardcode Kimi, Hermes or Paperclip into domain schemas.

## PAPERCLIP

Treat Paperclip as an orchestration adapter.

Use it for:
- organizational roles,
- goals,
- issue assignment,
- budgets,
- heartbeats,
- task state,
- escalation,
- operational audit visibility.

Do not use it as:
- canonical source of truth,
- semantic memory,
- constitutional authority,
- creative identity store,
- domain model.

Create:
- a Paperclip company template,
- role definitions,
- reporting lines,
- budget profiles,
- heartbeat policies,
- task ancestry conventions,
- approval/escalation documentation.

## HERMES

Treat Hermes as an execution runtime.

Support two profiles:

1. hermes-local
   - development use
   - local filesystem and repository work
   - restricted toolsets

2. hermes-gateway
   - remote or production-like use
   - HTTP/SSE integration
   - isolated runtime

Hermes session memory is runtime memory only.
Canonical decisions and project records must be written through the
system record interfaces.

## COLIBRI INTENT STUDIO

Implement Colibri as a workshop composition, not as a sovereign agent.

Colibri must produce:
- semantic atoms,
- interpretation hypotheses,
- evidence,
- alternative readings,
- risks of misreading,
- unresolved questions,
- possible design consequences.

Colibri must never convert an ambiguous phrase directly into a single
technical solution.

Example:

"living art"

must not become automatically:

"animated particle background"

It must produce multiple interpretations such as:
- visible process,
- temporal change,
- human trace,
- audience relationship,
- incompleteness,
- material transformation.

## PAUL LIFECYCLE

Implement the PAUL lifecycle:

PLAN
- intake
- intention reconstruction
- semantic brief
- creative charter
- direction generation
- human selection
- architecture plan

APPLY
- work package generation
- production
- integration
- candidate artifact

QUALIFY
- meaning review
- brand review
- UX review
- accessibility review
- technical review
- performance review
- provenance review
- devil review
- remediation

UNIFY
- assessment consolidation
- trade-off disclosure
- human ratification
- effectuation
- release candidate
- observation
- re-entry proposal

Required transition sequence:

Proposal
→ Assessment
→ Decision
→ Effectuation
→ Effective State

Do not collapse these records.

## RATIFICATION GATES

Implement at minimum:

- G0 — Project mandate approved
- G1 — Semantic brief ratified
- G2 — Creative direction selected
- G3 — Architecture approved
- G4 — Candidate artifact approved for release
- G5 — External publication authorized

Only a configured HumanAuthority may approve G1, G2, G4 and G5.

## AGENT ORGANIZATION

Provide role packages for:

- Executive Producer
- Colibri Lead
- Audience Researcher
- Experience Architect
- Technical Architect
- Creative Director
- Visual Systems Designer
- Hermes Operator
- Frontend Engineer
- Brand Guardian
- UX Reviewer
- Accessibility Reviewer
- Performance Reviewer
- Provenance Reviewer
- Devil Reviewer

Reviewer roles must be organizationally independent from producer roles.

A reviewer may recommend remediation but must not silently modify the
artifact being assessed.

## ASSESSMENTS

Do not implement a single aggregate quality score.

Assessment records must contain:

- criterion;
- verdict;
- findings;
- evidence;
- confidence;
- risks;
- blocking issues;
- conditions;
- recommended actions;
- trade-offs.

Allowed verdicts:

- pass
- pass_with_conditions
- fail
- not_applicable

## MEMORY FABRIC

Implement separate stores for:

1. canonical records;
2. project working memory;
3. runtime session memory;
4. skills;
5. client identity and ratified preferences;
6. artifacts and evidence.

Every MemoryRecord must contain:

- scope;
- kind;
- source references;
- provenance;
- epistemic status;
- retention policy;
- cross-project reuse permission.

Unratified agent interpretations must never become client facts.

## PROJECTION PACKAGES

Define a generic ProjectionPackage contract.

Implement:

1. web-experience
   - full initial adapter;

2. brand-charter
   - minimal proof adapter.

The web-experience package must define:
- required capabilities;
- production stages;
- artifact types;
- accessibility gates;
- performance gates;
- security gates;
- deployment gate.

The core project lifecycle must not contain web-specific fields.

## REPOSITORY

Create a pnpm workspace with:

```
constitution/
specs/
organs/
domain-packages/
workshops/
roles/
workflows/
projections/
adapters/
memory/
schemas/
tests/
examples/
```

Use TypeScript for contracts, schemas, validators and the lifecycle
simulator.

Use JSON Schema Draft 2020-12 for persistent record schemas.

Use YAML for:
- role definitions;
- mandates;
- workflow configuration;
- Paperclip templates;
- projection manifests.

Do not vendor Paperclip or Hermes.

Provide adapter documentation and example configuration only.

## DEMO PROJECT

Create:

```
examples/petra/
```

The demo must execute this complete roundtrip:

1. ingest the intention:
   "My website should show that my art is alive."

2. produce at least three interpretation hypotheses;

3. create a semantic brief;

4. stop at G1 until a human decision fixture is supplied;

5. create three substantially different creative directions;

6. stop at G2 until a human selection fixture is supplied;

7. create an experience and technical architecture;

8. create work packages;

9. simulate candidate artifact production;

10. produce independent assessments;

11. identify at least one blocking or conditional issue;

12. record remediation;

13. stop at G4 until a human approval fixture is supplied;

14. create an effectuation event;

15. record an observation;

16. create a non-canonical re-entry proposal.

## TESTS

Implement tests proving:

- a proposal cannot authorize itself;
- an assessment is not a decision;
- a decision without effectuation does not change effective state;
- a model cannot expand its role mandate;
- runtime memory cannot overwrite canonical records;
- a reviewer cannot ratify its own assessment;
- a failing blocking gate prevents release;
- no publication occurs without G5;
- rejected interpretation hypotheses remain traceable;
- client preferences cannot be generalized without permission;
- Paperclip adapter data can be replaced without changing domain records;
- Hermes can be replaced by a mock runtime;
- web-specific fields do not leak into the core lifecycle;
- the complete Petra roundtrip is reproducible.

## DELIVERABLES

Produce:

1. architecture.md
2. repository map
3. TypeScript domain contracts
4. JSON Schemas
5. PAUL state machine
6. role YAML files
7. mandate and autonomy schemas
8. Paperclip company template
9. Hermes adapter profiles
10. Memory Fabric contracts
11. ProjectionPackage contract
12. web-experience manifest
13. brand-charter proof manifest
14. Petra demo records
15. automated tests
16. unresolved-questions.md
17. final implementation report

Do not implement a polished user interface in v0.1.

A small diagnostic interface or CLI is sufficient.

Prioritize:
- correct authority boundaries;
- provenance;
- lifecycle correctness;
- replaceability;
- testability;
- a complete vertical roundtrip.

## STOP CONDITION

Do not add more agent roles, projection types or autonomous learning
features until the Petra roundtrip passes all tests and demonstrates:

- one human-ratified semantic brief;
- one human-selected direction;
- one independent failed or conditional assessment;
- one documented remediation;
- one human-authorized effectuation;
- one observation;
- one non-canonical re-entry proposal.
