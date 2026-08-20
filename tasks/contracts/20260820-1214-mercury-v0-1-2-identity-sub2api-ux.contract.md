# Task Contract: mercury-v0-1-2-identity-sub2api-ux

> **Status**: Active
> **Plan**: plans/plan-20260820-1214-mercury-v0-1-2-identity-sub2api-ux.md
> **Task Profile**: code-change
> **Workflow Profile**: strict
> <!-- legal values: code-change | docs-only | ledger-closeout | migration | eval-only | delegated-run | bugfix (omit for legacy passthrough); see docs/reference-configs/sprint-contracts.md -->
> **Owner**: aitwo
> **Capability ID**: extension-core
> **Last Updated**: 2026-08-20 12:17
> **Review File**: `tasks/reviews/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.review.md`
> **Notes File**: `tasks/notes/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.notes.md`
> **Exemplar**: `docs/reference-configs/contract-brief-example.md`

## Why

Mercury Translate currently presents upstream branding in daily UI, and its public default branch retains the full FluentRead ancestry, so GitHub attributes the independent repository to upstream contributors. The existing `newapi` adapter already owns OpenAI-compatible Chat Completions for every translation surface, but its generic name, static model list, real-translation connection test, and weak response diagnostics make Sub2API setup unnecessarily difficult. If this ships incorrectly it could expose an API key, contact a paid inference endpoint without a deliberate translation action, change extension identity, drop required GPL notices, or make the history migration unrecoverable.

## Goal

Deliver a review-ready Mercury Translate v0.1.2 candidate on a Mercury-only clean-history branch. The candidate must preserve all existing settings and distribution identity, add explicit model discovery and robust non-streaming Chat Completions to the existing `newapi` service, refine popup/settings usability and product attribution in all three locales, retain required upstream/legal notices, prepare verified free release artifacts, and stop before any default-branch cutover, tag, Release, store submission, payment, or real paid-model test.

## Scope

- In scope: the clean-history candidate and recovery evidence; v0.1.2 versioning; OpenAI-compatible/Sub2API endpoint normalization, model discovery, errors, permissions, and tests; popup/settings/About density and status improvements; three-language copy; README/legal attribution boundaries; OCR package-size copy; product specification and release metadata; full local, fixture, browser, history, privacy, and repo-harness evidence.
- Out of scope: updating `main`; deleting or moving any existing tag or Release; GitHub Release or Chrome Web Store submission; payment; real paid-model calls; Responses API; real SSE streaming; Sub2API admin/account/OAuth APIs; telemetry; a Mercury backend; renaming `newapi`, saved configuration fields, or `fluentread-*` compatibility identifiers.
- Taste constraints: keep the current Mercury visual language and six-feature popup structure, reduce density rather than redesigning it, expose provider privacy/model/host status without secrets, use explicit actions for all network probes, and keep upstream attribution legally complete but visually low priority.

## Stop Conditions

- Stop and hand back to the parent if the change would require editing a path outside Allowed Paths.
- Stop if an Exit Criteria command cannot be run in this environment.
- Stop if Goal, Scope, or Exit Criteria are internally contradictory.
- Stop before any force update or other change to `main`, tag creation, Release, store upload, declaration, or payment; those require a later explicit user decision.
- Stop on any unexpected real-provider inference request, credential in a runtime response/log/fixture/export, changed `v0.1.0` object, changed GitHub distribution key, or missing archive recovery ref.
- Stop if the implementation needs a second provider client, automatic privacy-class fallback, or a stored-settings migration instead of preserving `newapi`.

## Falsifier

The direction is wrong if a normal Wei-Shaw-style Sub2API endpoint cannot support the required translation path through non-streaming `/v1/chat/completions`, if `/v1/models` requires an unsafe key flow, or if clean ancestry changes the GitHub distribution key or existing release refs. The cheapest proofs are focused endpoint/model fixture tests and tree/key/tag fingerprint comparisons before UI work or any main cutover.

## Root Cause Evidence

Required when Task Profile is `bugfix`; leave as-is otherwise.

- root_cause: one sentence naming file:line/condition (testable, not "a state issue").
- repro: the command or UI path that reproduces the symptom.
- regression_guard: path to a test that fails on the unfixed code and passes after the fix (must also appear under exit_criteria.tests_pass).
- pre_fix_failure_artifact: path to a captured run of regression_guard on the UNFIXED code. Capture with `bun test <regression_guard> > <artifact> 2>&1; echo "PRE_FIX_EXIT=$?" >> <artifact>` (no pipes — pipes swallow the exit status). The gate requires a non-zero `PRE_FIX_EXIT=` line plus the regression_guard path string in the artifact (see the Root Cause Evidence Gate section in docs/reference-configs/sprint-contracts.md).

## Workflow Inventory

- Source plan: `plans/plan-20260820-1214-mercury-v0-1-2-identity-sub2api-ux.md`
- Deferred-goal ledger: `tasks/todos.md`
- Review file: `tasks/reviews/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.review.md`
- Notes file: `tasks/notes/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.notes.md`
- Checks file: `.ai/harness/checks/latest.json`
- Run snapshots: `.ai/harness/runs/`
- Scope gate: edit only paths listed under `allowed_paths`; update this contract before widening scope.
- Completion gate: run `verify-sprint --prepare-acceptance`, record one typed AcceptanceReceipt under the frozen policy below, then run `verify-sprint`; review Markdown is projection only.

## Change Assessment

```json
{"protocol":1,"oracles":[{"id":"local-provider-fixtures","kind":"deterministic_test","paths":["entrypoints/service/","entrypoints/utils/","tests/"]},{"id":"release-artifact-readback","kind":"runtime_readback","paths":["package.json","wxt.config.ts","scripts/","store-assets/"]},{"id":"git-history-fingerprint","kind":"runtime_readback","paths":["*"]},{"id":"chrome-regression","kind":"runtime_readback","paths":["entrypoints/","components/","public/"]}]}
```

## Acceptance Policy

```json
{"protocol":1,"reviewer":"Claude","user_waiver":"allowed"}
```

## Allowed Paths

```yaml
allowed_paths:
  - AGENTS.md
  - CLAUDE.md
  - README.md
  - INSTALL.md
  - CHANGELOG.md
  - NOTICE
  - THIRD_PARTY_NOTICES.md
  - package.json
  - pnpm-lock.yaml
  - wxt.config.ts
  - entrypoints/
  - components/
  - public/
  - store-assets/
  - scripts/
  - docs/
  - .github/
  - plans/
  - tasks/todos.md
  - tasks/current.md
  - tasks/contracts/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.contract.md
  - tasks/reviews/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.review.md
  - tasks/notes/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.notes.md
  - tasks/workstreams/
  - .ai/context/capabilities.json
  - .ai/context/contracts/
  - .ai/harness/checks/latest.json
  - .ai/harness/handoff/
  - .ai/harness/runs/
  - .claude/templates/
  - tests/
```

## Evidence Requirements

```yaml
evidence_requirements:
  # Set benchmark to required when this contract consumes the harness profile benchmark matrix.
  benchmark: not_applicable
```

## Delegation Contract

```yaml
delegation:
  budget:
    tokens: null
    runner_invocations: null
    wall_time_minutes: null
  permission_scope:
    mode: inherit_allowed_paths
    writable_paths: []
    network: inherited
  roles:
    parent:
      mode: narrate_and_gatekeep
      purpose: approval_checkpoint_owner
    explorer:
      mode: read_only
      purpose: codebase_research
    worker:
      mode: edit_within_allowed_paths
      purpose: implementation
    verifier:
      mode: read_only
      purpose: exit_criteria_review
  runner:
    preferred:
      - subagent
    fallback: null
    brief_is_authoritative: true
```

## Exit Criteria (Machine Verifiable)

```yaml
exit_criteria:
  files_exist:
    - docs/spec.md
    - entrypoints/service/newapi.ts
    - tests/newApiService.test.ts
    - tests/providerModelCatalog.test.ts
    - tests/sub2ApiLocalFixture.test.ts
    - tests/mercuryIdentityUx.test.ts
  artifacts_exist:
    - .ai/harness/checks/latest.json
    - tasks/notes/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.notes.md
  tests_pass:
    - path: tests/newApiService.test.ts
    - path: tests/providerModelCatalog.test.ts
    - path: tests/sub2ApiLocalFixture.test.ts
    - path: tests/mercuryIdentityUx.test.ts
    - path: tests/i18n.test.ts
  commands_succeed:
    - pnpm compile
    - pnpm test
    - pnpm build
    - pnpm docs:build
    - pnpm release:artifacts
    - pnpm release:check
    - git diff --check
```

## Acceptance Notes (Human Review)

- Functional behavior: model discovery is explicit and text-free; user-initiated webpage, subtitle, PDF, and OCR translation share the existing adapter; popup and settings identify privacy class, model, and host without secrets; normal UI presents Mercury branding.
- Edge cases: root/path-prefixed/full endpoints, unsupported `/responses`, missing `/models`, manual model IDs, malformed/mislabeled JSON, actual SSE, 401/403/404/429, cancellation, denied host permission, missing credentials, narrow popup viewport, and all three locales.
- Regression risks: shared translation batching, custom request-body precedence, provider consent/privacy classification, optional permissions, settings import/export, YouTube navigation, PDF/OCR workers, release ZIP size/identity, legal notices, and unrelated ancestry/tag changes.

## Rollback Point

- Commit / checkpoint: clean root `f26ac685b63b6e58e555791885ae232433f02b1b`; old main `83396931351ddf93637fb119c8582358533e8bf5`; immutable recovery tag `archive/pre-clean-main-20260820`.
- Revert strategy: revert or discard the v0.1.2 commits and clean branch. If a later separately approved main cutover fails, restore the exact old main commit from the immutable archive tag. Never move existing version tags or Releases.
