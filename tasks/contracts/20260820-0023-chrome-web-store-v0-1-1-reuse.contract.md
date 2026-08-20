# Task Contract: chrome-web-store-v0-1-1-reuse

> **Status**: Fulfilled
> **Plan**: plans/plan-20260820-0023-chrome-web-store-v0-1-1-reuse.md
> **Task Profile**: code-change
> **Workflow Profile**: strict
> <!-- legal values: code-change | docs-only | ledger-closeout | migration | eval-only | delegated-run | bugfix (omit for legacy passthrough); see docs/reference-configs/sprint-contracts.md -->
> **Owner**: aitwo
> **Capability ID**: extension-core
> **Last Updated**: 2026-08-20 10:57
> **Review File**: `tasks/reviews/20260820-0023-chrome-web-store-v0-1-1-reuse.review.md`
> **Notes File**: `tasks/notes/20260820-0023-chrome-web-store-v0-1-1-reuse.notes.md`
> **Exemplar**: `docs/reference-configs/contract-brief-example.md`

## Why

Mercury Translate v0.1.0 is installable only through a manually downloaded and unpacked GitHub ZIP. That is too difficult for ordinary use and cannot receive Chrome-managed updates. Shipping the wrong package could also change the existing sideload extension ID, expose API keys in a migration file, make inaccurate Chrome Web Store privacy claims, or add a forbidden paid/remote service boundary.

## Goal

Deliver a verified Mercury Translate v0.1.1 release system that produces distinct GitHub and unlisted Chrome Web Store packages, preserves the existing GitHub extension ID, lets a new store installation import versioned settings safely, includes original three-language store/privacy assets, and prepares a manual CWS upload without performing registration, payment, upload, declarations, or review submission.

## Scope

- In scope: dual WXT distributions, v0.1.1 versioning, deterministic release artifacts and checks, schema-versioned settings transfer, original Mercury store assets/listing/privacy pages, GitHub Pages workflow, GitHub Actions artifact retention, tests, documentation, GPL provenance, capability registration, and repo-harness evidence.
- Out of scope: CWS account registration or payment, package upload, accepting declarations, submitting for review, CWS API/service accounts, paid APIs, telemetry, subscriptions, custom domains, public-search distribution, other stores, and any Mercury backend.
- Taste constraints: reuse proven GPL workflow structure but write Mercury-specific copy and visuals; keep the end-user path simple; prefer local deterministic tooling over new services or credentials.

## Stop Conditions

- Stop and hand back to the parent if the change would require editing a path outside Allowed Paths.
- Stop if an Exit Criteria command cannot be run in this environment.
- Stop if Goal, Scope, or Exit Criteria are internally contradictory.
- Stop before any registration payment, CWS upload, declaration acceptance, or review submission.
- Stop if any secret would enter source, logs, fixtures, release assets, or GitHub Actions.
- Stop if executable code would be fetched remotely or a permission cannot be truthfully disclosed.
- Record Chrome GUI/account validation as unavailable rather than inferring a pass when no clean Chrome 151+ environment or store account is accessible.

## Falsifier

The direction is wrong if WXT cannot produce a store package without `manifest.key` while retaining the existing key in the GitHub package, or if the resulting CWS ZIP cannot load in Chrome 151+. The cheapest proof is a focused dual-manifest build test before creating the remaining store assets.

## Root Cause Evidence

Required when Task Profile is `bugfix`; leave as-is otherwise.

- root_cause: one sentence naming file:line/condition (testable, not "a state issue").
- repro: the command or UI path that reproduces the symptom.
- regression_guard: path to a test that fails on the unfixed code and passes after the fix (must also appear under exit_criteria.tests_pass).
- pre_fix_failure_artifact: path to a captured run of regression_guard on the UNFIXED code. Capture with `bun test <regression_guard> > <artifact> 2>&1; echo "PRE_FIX_EXIT=$?" >> <artifact>` (no pipes — pipes swallow the exit status). The gate requires a non-zero `PRE_FIX_EXIT=` line plus the regression_guard path string in the artifact (see the Root Cause Evidence Gate section in docs/reference-configs/sprint-contracts.md).

## Workflow Inventory

- Source plan: `plans/plan-20260820-0023-chrome-web-store-v0-1-1-reuse.md`
- Deferred-goal ledger: `tasks/todos.md`
- Review file: `tasks/reviews/20260820-0023-chrome-web-store-v0-1-1-reuse.review.md`
- Notes file: `tasks/notes/20260820-0023-chrome-web-store-v0-1-1-reuse.notes.md`
- Checks file: `.ai/harness/checks/latest.json`
- Run snapshots: `.ai/harness/runs/`
- Scope gate: edit only paths listed under `allowed_paths`; update this contract before widening scope.
- Completion gate: run `verify-sprint --prepare-acceptance`, record one typed AcceptanceReceipt under the frozen policy below, then run `verify-sprint`; review Markdown is projection only.

## Change Assessment

```json
{"protocol":1,"oracles":[{"id":"local-release-gates","kind":"deterministic_test","paths":["*"]},{"id":"release-artifact-readback","kind":"runtime_readback","paths":["*"]}]}
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
  - .gitignore
  - .gstack/qa-reports/
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
  - tests/
  - plans/
  - tasks/todos.md
  - tasks/current.md
  - tasks/contracts/20260820-0023-chrome-web-store-v0-1-1-reuse.contract.md
  - tasks/reviews/20260820-0023-chrome-web-store-v0-1-1-reuse.review.md
  - tasks/notes/20260820-0023-chrome-web-store-v0-1-1-reuse.notes.md
  - tasks/workstreams/
  - .ai/context/capabilities.json
  - .ai/context/contracts/
  - .ai/harness/checks/latest.json
  - .ai/harness/handoff/
  - .ai/harness/runs/
  - .claude/templates/
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
    - store-assets/chrome-web-store/README.md
    - store-assets/chrome-web-store/listing.en.md
    - store-assets/chrome-web-store/listing.zh-CN.md
    - store-assets/chrome-web-store/listing.zh-TW.md
    - docs/privacy/index.md
    - docs/privacy/en.md
    - docs/privacy/zh-TW.md
    - scripts/check-release-readiness.mjs
  artifacts_exist:
    - .ai/harness/checks/latest.json
    - tasks/notes/20260820-0023-chrome-web-store-v0-1-1-reuse.notes.md
  tests_pass:
    - path: tests/configTransfer.test.ts
    - path: tests/chromeWebStoreRelease.test.ts
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

- Functional behavior: GitHub users retain the old ID; store users receive a keyless, manually uploadable package and a guided import path.
- Edge cases: unknown transfer schema, malformed JSON, secret exclusion/inclusion, partial settings, artifact growth, missing locale/assets, forbidden remote executable code.
- Regression risks: WXT output naming, content-script size, PDF/OCR workers, GitHub Release assets, configuration compatibility, and provider-consent privacy behavior.

## Rollback Point

- Commit / checkpoint: base commit `8339693` on `main`.
- Revert strategy: revert the v0.1.1 work-package commit(s); the published v0.1.0 GitHub Release and existing sideload ID remain unchanged.
