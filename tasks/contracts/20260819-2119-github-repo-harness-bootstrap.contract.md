# Task Contract: github-repo-harness-bootstrap

> **Status**: Fulfilled
> **Plan**: plans/plan-20260819-2119-github-repo-harness-bootstrap.md
> **Task Profile**: code-change
> <!-- legal values: code-change | docs-only | ledger-closeout | migration | eval-only | delegated-run | bugfix (omit for legacy passthrough); see docs/reference-configs/sprint-contracts.md -->
> **Owner**: aitwo
> **Capability ID**: root
> **Last Updated**: 2026-08-19 21:34
> **Review File**: `tasks/reviews/20260819-2119-github-repo-harness-bootstrap.review.md`
> **Notes File**: `tasks/notes/20260819-2119-github-repo-harness-bootstrap.notes.md`
> **Exemplar**: `docs/reference-configs/contract-brief-example.md`

## Why

Mercury Translate v0.1 is already implemented but is not safely publishable while it exists only as local commits, still points at the upstream repository, and lacks enforceable repository/release governance. A wrong bootstrap could push to FluentRead, expose secrets, publish a tag that disagrees with the package version, or create an unverifiable release.

## Goal

Publish the complete-history, standalone public repository `yurisachan16-creator/mercury-translate` through a verified bootstrap PR; configure repo-harness-backed CI and governance; protect `main` and `v*`; then create and verify the annotated `v0.1.0` GitHub Release.

## Scope

- In scope: GitHub Actions verification/release hardening, PR and issue templates, Dependabot, repository settings, branch/tag rulesets, remote setup, PR lifecycle, tag/release creation, repo-harness evidence and handoff.
- Out of scope: browser stores, Firefox/Safari support, product feature changes, backend services, subscription/telemetry, rewriting FluentRead history, or committing OCR model binaries.
- Taste constraints: keep governance files small, auditable and dependency-free; use package version as the only release version authority.

## Stop Conditions

- Stop and hand back to the parent if the change would require editing a path outside Allowed Paths.
- Stop if an Exit Criteria command cannot be run in this environment.
- Stop if Goal, Scope, or Exit Criteria are internally contradictory.
- Stop before public push if a secret/private key, unreviewed personal address, file over 10 MB, or missing GPL/NOTICE attribution is found.
- Stop before tag creation unless the bootstrap PR is merged into `main`, required GitHub checks are green, and the tag exactly equals `v${package.json.version}`.

## Falsifier

The direction is wrong if the new repository cannot retain `f91543c` ancestry without a GitHub fork relationship, or if the public-repository plan cannot enforce the required branch/tag rules. Cheapest proof: create the empty standalone repository, push baseline `main`, and query ancestry/settings before opening the bootstrap PR.

## Root Cause Evidence

Required when Task Profile is `bugfix`; leave as-is otherwise.

- root_cause: one sentence naming file:line/condition (testable, not "a state issue").
- repro: the command or UI path that reproduces the symptom.
- regression_guard: path to a test that fails on the unfixed code and passes after the fix (must also appear under exit_criteria.tests_pass).
- pre_fix_failure_artifact: path to a captured run of regression_guard on the UNFIXED code. Capture with `bun test <regression_guard> > <artifact> 2>&1; echo "PRE_FIX_EXIT=$?" >> <artifact>` (no pipes — pipes swallow the exit status). The gate requires a non-zero `PRE_FIX_EXIT=` line plus the regression_guard path string in the artifact (see the Root Cause Evidence Gate section in docs/reference-configs/sprint-contracts.md).

## Workflow Inventory

- Source plan: `plans/plan-20260819-2119-github-repo-harness-bootstrap.md`
- Deferred-goal ledger: `tasks/todos.md`
- Review file: `tasks/reviews/20260819-2119-github-repo-harness-bootstrap.review.md`
- Notes file: `tasks/notes/20260819-2119-github-repo-harness-bootstrap.notes.md`
- Checks file: `.ai/harness/checks/latest.json`
- Run snapshots: `.ai/harness/runs/`
- Scope gate: edit only paths listed under `allowed_paths`; update this contract before widening scope.
- Completion gate: run `verify-sprint --prepare-acceptance`, record one typed AcceptanceReceipt under the frozen policy below, then run `verify-sprint`; review Markdown is projection only.

## Change Assessment

```json
{"protocol":1,"oracles":[{"id":"local-release-gates","kind":"deterministic_test","paths":["*"]},{"id":"github-release-readback","kind":"runtime_readback","paths":["*"]}]}
```

## Acceptance Policy

```json
{"protocol":1,"reviewer":"Codex","user_waiver":"allowed"}
```

## Allowed Paths

```yaml
allowed_paths:
  - .ai/
  - .claude/
  - .github/
  - .gitignore
  - AGENTS.md
  - CLAUDE.md
  - assets/
  - components/
  - deploy/
  - docs/
  - entrypoints/
  - misc/README_ZH.md
  - package.json
  - pnpm-lock.yaml
  - plans/
  - public/
  - tasks/
  - tests/
  - userscripts.js
  - wxt.config.ts
  - CHANGELOG.md
  - README.md
  - INSTALL.md
  - NOTICE
  - THIRD_PARTY_NOTICES.md
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
    - .github/workflows/ci-release.yml
    - .github/PULL_REQUEST_TEMPLATE.md
    - .github/ISSUE_TEMPLATE/bug_report.yml
    - .github/ISSUE_TEMPLATE/feature_request.yml
    - .github/dependabot.yml
    - CHANGELOG.md
  artifacts_exist:
    - .ai/harness/checks/latest.json
    - tasks/notes/20260819-2119-github-repo-harness-bootstrap.notes.md
  tests_pass: []
  commands_succeed:
    - pnpm compile
    - pnpm test
    - pnpm build
    - pnpm docs:build
    - pnpm zip
    - git diff --check
    - unzip -t .output/mercury-translate-0.1.0-chrome.zip
    - repo-harness run check-context-files
    - repo-harness run check-task-workflow --strict
```

## Acceptance Notes (Human Review)

- Functional behavior: CI verifies every PR and release assets are published only from an exact SemVer tag on merged `main`.
- Edge cases: solo maintainer has zero required approvals but cannot bypass required checks accidentally; upstream push URL remains disabled.
- Regression risks: workflow permission or asset-name mistakes can block release; verify against an actual tag and downloaded asset.

## Rollback Point

- Commit / checkpoint: `24c6d07` is the clean pre-governance checkpoint; repo-harness init transaction is recorded under its ignored fs-transaction backup.
- Revert strategy: revert the governance commit, remove the new GitHub repository/rules only if explicitly authorized, and never rewrite or delete the FluentRead upstream history.
