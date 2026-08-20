# Plan: Mercury Translate GitHub、版本管理与 repo-harness 接入

> **Status**: Executing
> **Created**: 20260819-2119
> **Slug**: github-repo-harness-bootstrap
> **Planning Source**: repo-harness-plan
> **Orchestration Kind**: release-bootstrap
> **Source Ref**: user-approved-plan-2026-08-19
> **Artifact Level**: work-package
> **Promotion Reason**: worktree_boundary
> **Verification Boundary**: Root Required Checks, repo-harness strict gates, GitHub CI, release ZIP integrity and SHA-256 must pass.
> **Rollback Surface**: Revert the three bootstrap commits; repo-harness init may additionally use its recorded fs-transaction manifest.
> **Spec**: `docs/spec.md`
> **Research**: See `docs/researches/`
> **Task Contract**: `tasks/contracts/20260819-2119-github-repo-harness-bootstrap.contract.md`
> **Task Review**: `tasks/reviews/20260819-2119-github-repo-harness-bootstrap.review.md`
> **Implementation Notes**: `tasks/notes/20260819-2119-github-repo-harness-bootstrap.notes.md`

## Agentic Routing
- Selected route: repo-harness-setup+github
- Routing reason: Captured from repo-harness-plan planning output.
- Source ref: user-approved-plan-2026-08-19
- Due diligence:
  - P1 map: See captured planning output below.
  - P2 trace: See captured planning output below.
  - P3 decision rationale: See captured planning output below.

## Workflow Inventory
Complete this inventory before implementation. If any line is unknown, keep the plan in Draft and fill it before projection.

- Active plan: `plans/plan-20260819-2119-github-repo-harness-bootstrap.md`
- Sprint contract: `tasks/contracts/20260819-2119-github-repo-harness-bootstrap.contract.md`
- Sprint review: `tasks/reviews/20260819-2119-github-repo-harness-bootstrap.review.md`
- Implementation notes: `tasks/notes/20260819-2119-github-repo-harness-bootstrap.notes.md`
- Deferred-goal ledger: `tasks/todos.md`
- Current checks: `.ai/harness/checks/latest.json`
- Run snapshots: `.ai/harness/runs/`
- Scope authority: `tasks/contracts/20260819-2119-github-repo-harness-bootstrap.contract.md` `allowed_paths`
- Concurrency rule: `.ai/harness/active-plan` selects the active plan for this worktree when present; `.ai/harness/active-worktree` records the owning worktree. If another worktree already owns active work, open or switch to the matching worktree instead of serializing unrelated plans.
- Execution isolation: approved contract-level work projects through `repo-harness run plan-to-todo --plan plans/plan-20260819-2119-github-repo-harness-bootstrap.md` and may start `repo-harness run contract-worktree start --plan plans/plan-20260819-2119-github-repo-harness-bootstrap.md`.

## Approach
### Strategy
Use the captured planning output below as the execution source of truth.

### Trade-offs
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Captured plan | Preserves the approved Codex Plan or Waza think decision | Requires the captured text to be concrete enough to execute | Use |

## Detailed Design
### File Changes
| File | Action | Description |
|------|--------|-------------|
| See captured planning output | Follow | Implement only the approved scope named below |

### Code Snippets
See captured planning output.

### Data Flow
See captured planning output.

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Captured plan lacks enough detail | Medium | Execution may need clarification | Stop before implementation if the captured output contradicts repo rules or lacks concrete file targets |

## Task Contracts
- Contract file: `tasks/contracts/20260819-2119-github-repo-harness-bootstrap.contract.md`
- Review file: `tasks/reviews/20260819-2119-github-repo-harness-bootstrap.review.md`
- Implementation notes file: `tasks/notes/20260819-2119-github-repo-harness-bootstrap.notes.md`
- Template: `.claude/templates/contract.template.md`
- Verification command: `repo-harness run verify-contract --contract tasks/contracts/20260819-2119-github-repo-harness-bootstrap.contract.md --strict`
- Active plan rule: this captured plan is written to `.ai/harness/active-plan` and the owning worktree is written to `.ai/harness/active-worktree` unless --no-active is used. Do not infer active execution from the latest non-archived plan.

## Handoff

- Checks file: `.ai/harness/checks/latest.json`
- Session handoff: `.ai/harness/handoff/current.md`

## Promotion Gate

- **Merge/PR unit**: Captured plan `plans/plan-20260819-2119-github-repo-harness-bootstrap.md` is the proposed mergeable execution unit; revise before execute if this is only a checklist step.
- **Rollback surface**: Revert the three bootstrap commits; repo-harness init may additionally use its recorded fs-transaction manifest.
- **Verification boundary**: Root Required Checks, repo-harness strict gates, GitHub CI, release ZIP integrity and SHA-256 must pass.
- **Review/acceptance boundary**: `tasks/reviews/20260819-2119-github-repo-harness-bootstrap.review.md` must record pass against the captured acceptance criteria.
- **High-risk surface**: Risks named in captured planning output; keep the plan Draft if risk ownership is not concrete.
- **Why not checklist row**: worktree_boundary

## Evidence Contract

- **State/progress path**: `plans/plan-20260819-2119-github-repo-harness-bootstrap.md` task breakdown, `tasks/todos.md` deferred-goal ledger, `tasks/contracts/20260819-2119-github-repo-harness-bootstrap.contract.md`, `tasks/reviews/20260819-2119-github-repo-harness-bootstrap.review.md`, and `tasks/notes/20260819-2119-github-repo-harness-bootstrap.notes.md`
- **Verification evidence**: `.ai/harness/checks/latest.json`, `.ai/harness/runs/`, and the commands named in the captured planning output
- **Evaluator rubric**: `tasks/reviews/20260819-2119-github-repo-harness-bootstrap.review.md` must record a passing Waza /check style recommendation
- **Stop condition**: all task breakdown items are complete, sprint verification passes, and the review recommends pass
- **Rollback surface**: Revert the three bootstrap commits; repo-harness init may additionally use its recorded fs-transaction manifest.

## Captured Planning Output

# Mercury Translate GitHub、版本管理与 repo-harness 接入

## Goal

Create the public standalone repository `yurisachan16-creator/mercury-translate`, retain FluentRead history from `f91543c`, adopt repo-harness Standard for Codex and Claude, protect `main` and `v*`, and publish the verified `v0.1.0` GitHub Release.

## Decisions

- Public standalone repository, not a GitHub fork.
- Preserve the complete upstream history; rename the FluentRead remote to fetch-only `upstream`.
- Use repo-local identity `Steven Chan <232764247+yurisachan16-creator@users.noreply.github.com>`.
- Bootstrap through `codex/bootstrap-mercury-v0.1.0`; retain three logical commits and use rebase merge.
- Use SemVer with `package.json` as version authority and immutable annotated `vX.Y.Z` tags.
- Require linked `codex/<slug>` worktrees for subsequent contract-level changes.

## Allowed paths

- Existing Mercury product paths included in the release candidate.
- `.ai/**`, `.claude/**`, `plans/**`, `tasks/**`, `deploy/**`
- `.github/**`, `AGENTS.md`, `CLAUDE.md`, `.gitignore`, `package.json`
- `docs/spec.md`, `docs/architecture/**`, `docs/reference-configs/**`, `docs/researches/**`
- `CHANGELOG.md`, `README.md`, `INSTALL.md`, `NOTICE`, `THIRD_PARTY_NOTICES.md`

## Verification and release

- Required checks come from root `AGENTS.md` and `CLAUDE.md`.
- Release checks additionally run `pnpm zip`, ZIP integrity validation, SHA-256 generation, secret/large-file/license scans, and clean-profile Chrome 151+ validation.
- GitHub CI must validate that `vX.Y.Z` equals `package.json` version before publishing.
- `main` requires a PR, current successful CI, resolved conversations, and no force-push or deletion; solo-maintainer approval count is zero.
- `v*` blocks update and deletion. Release assets include extension ZIP, source archive, OCR packs, notices and checksums.

## Task Breakdown

- [x] Audit and commit the Mercury Translate v0.1.0 product release candidate.
- [x] Initialize repo-harness Standard, CodeGraph, root agent contracts and capability prefixes.
- [x] Complete GitHub CI, templates, Dependabot, version guards and repository governance.
- [x] Create the public GitHub repository, push baseline and bootstrap branch, then open the PR.
- [ ] Run local/repo-harness checks and GitHub CI, record review and acceptance evidence, and merge by rebase.
- [ ] Create annotated `v0.1.0`, verify the GitHub Release assets and checksum, and refresh handoff state.

## Annotations
<!-- [NOTE]: prefixed inline. Claude processes all and revises. -->

## Task Breakdown
- [x] Audit and commit the Mercury Translate v0.1.0 product release candidate.
- [x] Initialize repo-harness Standard, CodeGraph, root agent contracts and capability prefixes.
- [x] Complete GitHub CI, templates, Dependabot, version guards and repository governance.
- [x] Create the public GitHub repository, push baseline and bootstrap branch, then open the PR.
- [ ] Run local/repo-harness checks and GitHub CI, record review and acceptance evidence, and merge by rebase.
- [ ] Create annotated `v0.1.0`, verify the GitHub Release assets and checksum, and refresh handoff state.
