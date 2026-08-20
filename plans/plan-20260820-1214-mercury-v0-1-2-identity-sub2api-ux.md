# Plan: Mercury Translate v0.1.2 identity Sub2API and UX

> **Status**: Executing
> **Created**: 20260820-1214
> **Slug**: mercury-v0-1-2-identity-sub2api-ux
> **Planning Source**: user-approved-plan
> **Orchestration Kind**: codex-plan
> **Source Ref**: (none)
> **Artifact Level**: work-package
> **Promotion Reason**: human_decision_boundary
> **Verification Boundary**: Commands named in the captured planning output plus `repo-harness run verify-contract --contract tasks/contracts/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.contract.md --strict`.
> **Rollback Surface**: Before execution remove `plans/plan-20260820-1214-mercury-v0-1-2-identity-sub2api-ux.md`; after execution revert branch `codex/mercury-v0-1-2-identity-sub2api-ux` or the explicitly reviewed diff.
> **Spec**: `docs/spec.md`
> **Research**: See `docs/researches/`
> **Task Contract**: `tasks/contracts/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.contract.md`
> **Task Review**: `tasks/reviews/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.review.md`
> **Implementation Notes**: `tasks/notes/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.notes.md`

## Agentic Routing
- Selected route: planning
- Routing reason: Captured from user-approved-plan planning output.
- Source ref: (none)
- Due diligence:
  - P1 map: See captured planning output below.
  - P2 trace: See captured planning output below.
  - P3 decision rationale: See captured planning output below.

## Workflow Inventory
Complete this inventory before implementation. If any line is unknown, keep the plan in Draft and fill it before projection.

- Active plan: `plans/plan-20260820-1214-mercury-v0-1-2-identity-sub2api-ux.md`
- Sprint contract: `tasks/contracts/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.contract.md`
- Sprint review: `tasks/reviews/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.review.md`
- Implementation notes: `tasks/notes/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.notes.md`
- Deferred-goal ledger: `tasks/todos.md`
- Current checks: `.ai/harness/checks/latest.json`
- Run snapshots: `.ai/harness/runs/`
- Scope authority: `tasks/contracts/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.contract.md` `allowed_paths`
- Concurrency rule: `.ai/harness/active-plan` selects the active plan for this worktree when present; `.ai/harness/active-worktree` records the owning worktree. If another worktree already owns active work, open or switch to the matching worktree instead of serializing unrelated plans.
- Execution isolation: approved contract-level work projects through `repo-harness run plan-to-todo --plan plans/plan-20260820-1214-mercury-v0-1-2-identity-sub2api-ux.md` and may start `repo-harness run contract-worktree start --plan plans/plan-20260820-1214-mercury-v0-1-2-identity-sub2api-ux.md`.

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
- Contract file: `tasks/contracts/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.contract.md`
- Review file: `tasks/reviews/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.review.md`
- Implementation notes file: `tasks/notes/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.notes.md`
- Template: `.claude/templates/contract.template.md`
- Verification command: `repo-harness run verify-contract --contract tasks/contracts/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.contract.md --strict`
- Active plan rule: this captured plan is written to `.ai/harness/active-plan` and the owning worktree is written to `.ai/harness/active-worktree` unless --no-active is used. Do not infer active execution from the latest non-archived plan.

## Handoff

- Checks file: `.ai/harness/checks/latest.json`
- Session handoff: `.ai/harness/handoff/current.md`

## Promotion Gate

- **Merge/PR unit**: Captured plan `plans/plan-20260820-1214-mercury-v0-1-2-identity-sub2api-ux.md` is the proposed mergeable execution unit; revise before execute if this is only a checklist step.
- **Rollback surface**: Before execution remove `plans/plan-20260820-1214-mercury-v0-1-2-identity-sub2api-ux.md`; after execution revert branch `codex/mercury-v0-1-2-identity-sub2api-ux` or the explicitly reviewed diff.
- **Verification boundary**: Commands named in the captured planning output plus `repo-harness run verify-contract --contract tasks/contracts/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.contract.md --strict`.
- **Review/acceptance boundary**: `tasks/reviews/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.review.md` must record pass against the captured acceptance criteria.
- **High-risk surface**: Risks named in captured planning output; keep the plan Draft if risk ownership is not concrete.
- **Why not checklist row**: human_decision_boundary

## Evidence Contract

- **State/progress path**: `plans/plan-20260820-1214-mercury-v0-1-2-identity-sub2api-ux.md` task breakdown, `tasks/todos.md` deferred-goal ledger, `tasks/contracts/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.contract.md`, `tasks/reviews/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.review.md`, and `tasks/notes/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.notes.md`
- **Verification evidence**: `.ai/harness/checks/latest.json`, `.ai/harness/runs/`, and the commands named in the captured planning output
- **Evaluator rubric**: `tasks/reviews/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.review.md` must record a passing Waza /check style recommendation
- **Stop condition**: all task breakdown items are complete, sprint verification passes, and the review recommends pass
- **Rollback surface**: Before execution remove `plans/plan-20260820-1214-mercury-v0-1-2-identity-sub2api-ux.md`; after execution revert branch `codex/mercury-v0-1-2-identity-sub2api-ux` or the explicitly reviewed diff.

## Captured Planning Output

# Plan: Mercury Translate v0.1.2 identity, Sub2API, and UX

> **Artifact Level**: work-package
> **Promotion Reason**: human_decision_boundary
> **Verification Boundary**: Independent repo-harness-check plus full local build, release, browser-fixture, history, and privacy verification before any default-branch cutover.
> **Rollback Surface**: The clean-history branch, provider/UI commits, package version, and any eventual main cutover; archive/pre-clean-main-20260820 and unchanged release tags provide recovery.

**Status**: Approved

## Goal

Ship a review-ready Mercury Translate v0.1.2 candidate that presents an independent Mercury product identity, supports Wei-Shaw-style Sub2API/OpenAI-compatible Chat Completions with explicit model discovery, and improves popup/settings usability without payments, store submission, telemetry, or automated paid inference. Prepare—but do not perform without a final user confirmation—the audited replacement of the default branch with a Mercury-only history.

## Why

The public default branch currently retains 754 upstream commits, so GitHub attributes the repository to upstream contributors and the product UI repeats upstream branding more prominently than the user wants. The existing `newapi` provider already implements most of OpenAI-compatible Chat Completions, so extending that stable storage identity is safer than adding a second client. A clean-history cutover is the only way to change GitHub's contributor display while keeping the repository URL; the archive ref and unchanged tags are the rollback boundary.

## Scope

- Build from the fulfilled v0.1.1 source tree at `codex/chrome-web-store-v0-1-1-reuse`.
- Create and verify `archive/pre-clean-main-20260820`; keep `v0.1.0` and every existing Release immutable.
- Establish a Mercury-only clean root and implement v0.1.2 on `codex/mercury-v0.1.2-identity-sub2api-ux` in a linked worktree.
- Keep internal `newapi`, settings fields, and `fluentread-*` compatibility identifiers stable.
- Add OpenAI-compatible/Sub2API endpoint normalization, explicit model discovery, non-streaming Chat Completions, clear errors, and manual-model fallback.
- Refine popup and settings density/status/configuration flow; remove prominent upstream branding from daily UI and ordinary marketing/help copy.
- Keep the upstream fixed-commit statement in README and all required GPL/NOTICE/third-party license material.
- Bump the package source of truth to 0.1.2 and prepare both free release artifact variants.

## Non-goals

- No Responses API, real SSE streaming, Sub2API admin API, account import, OAuth, provider management, or automatic protocol switching.
- No payment, purchase, paid API call, Chrome Web Store upload/submission, GitHub Release, or tag creation.
- No default-branch force update until a separate final user confirmation after independent verification.
- No renaming of stored service IDs, existing user settings, or internal compatibility markers.

## P1/P2/P3 Decision

- **P1 architecture**: provider network access remains in `entrypoints/service/` and background runtime; Vue UI never calls provider endpoints directly. `services.newapi` remains the single OpenAI-compatible adapter used by webpage, subtitle, PDF, and OCR translation paths.
- **P2 data flow**: the user saves endpoint/key locally, requests exact host permission, explicitly requests model discovery, background reads local config, GETs `/v1/models`, returns only model descriptors, then user-initiated translation POSTs non-streaming Chat Completions through the existing shared service path.
- **P3 decision**: preserve the storage schema and enhance the existing adapter. Dynamic model results are session UI data; the selected/manual model remains in the existing configuration. Unexpected actual SSE and Responses endpoints fail with actionable messages rather than adding a second protocol in this version.

## Implementation Contract

- Accept root, `/v1`, and `/v1/chat/completions` endpoint forms, including gateways hosted under a path prefix; derive `/v1/models` and `/v1/chat/completions` deterministically.
- Reject `/v1/responses` for v0.1.2 with a localized explanation.
- Add internal `provider.listModels`; message payload contains provider ID only, while background reads endpoint/token from `storage.local`. Never return, log, sync, or default-export the key.
- Model discovery occurs only after an explicit click and never sends translation text. A 404/unsupported models endpoint enables manual model entry instead of invalidating the provider.
- Apply custom request-body fields first and enforce `stream: false` afterward. Parse JSON from the response body regardless of content type; accept mislabeled JSON and reject real multi-event SSE clearly.
- Popup shows provider privacy class, selected model, and endpoint hostname without credentials. Settings uses endpoint -> key -> fetch models -> choose/manual model -> save, with advanced JSON collapsed.
- Daily UI contains only Mercury branding. README and required legal notices retain upstream attribution; a low-priority generic open-source-license link may expose those notices without an upstream promotional label.
- Keep the six quick functions visible at a typical 800px viewport with reduced spacing, consistent state indicators, keyboard focus, and localized disabled/error reasons.
- Replace OCR pack size placeholders with measured packaged/download sizes and update `docs/spec.md`.

## Task Breakdown

- [x] Capture and preflight the strict repo-harness contract; establish the linked clean-history worktree from the fulfilled v0.1.1 tree.
- [x] Create and verify the pre-clean archive ref and record old main/tag/release/key fingerprints without moving main.
- [x] Implement endpoint normalization, model discovery, non-streaming response parsing, localized errors, and provider tests.
- [x] Implement popup/settings/About attribution and usability refinements with complete English, Simplified Chinese, and Traditional Chinese strings.
- [x] Update version, changelog, README/legal boundaries, product specification, OCR size copy, and release metadata.
- [ ] Run local Sub2API fixtures, unit/integration suites, compile, builds, docs, artifacts, readiness, diff, and Chrome 151+ regressions without real paid endpoints.
- [ ] Run repo-harness-check and independent review; record history and privacy evidence.
- [ ] Stop before default-branch cutover, tag, Release, or store submission and request the final explicit user confirmation.

## Evidence Contract

- **State/progress path**: the active plan, contract, notes, review, `tasks/current.md`, `.ai/harness/checks/latest.json`, and `.ai/harness/runs/` in the linked worktree.
- **Verification evidence**: subject-bound command logs for `pnpm compile`, `pnpm test`, `pnpm build`, `pnpm docs:build`, `pnpm release:artifacts`, `pnpm release:check`, `git diff --check`, local Sub2API fixtures, Chrome QA, and Git history/ref comparisons.
- **Evaluator rubric**: all provider/privacy/localization/history invariants pass; no secret or paid endpoint is contacted; upstream branding is absent from normal UI while legal notices remain; old tags and extension-key fingerprints are unchanged.
- **Stop condition**: stop immediately on secret exposure, unexpected paid/network call, changed release tag, changed GitHub key/extension ID, unrelated worktree drift, or any request to update `main` before explicit final confirmation.
- **Rollback surface**: revert provider/UI/version commits on the clean branch; discard the clean branch if needed; recover old main from `archive/pre-clean-main-20260820`. No existing tag or Release is rewritten.

## Promotion Gate

- **Merge/PR unit**: one reviewed v0.1.2 clean-history candidate branch; the later exact-SHA main cutover is a separately confirmed administrative action.
- **Rollback surface**: clean branch commits plus the default-branch ref; the archive ref and unchanged old tags restore the prior state.
- **Verification boundary**: full repo checks, release readiness, local provider fixtures, browser regression, Git ancestry/ref proof, and repo-harness-check must bind to the candidate SHA.
- **Review/acceptance boundary**: an independent gatekeeper reviews the diff and exact candidate; the user separately confirms any default-branch force-with-lease operation.
- **High-risk surface**: Git history replacement, API-key handling, dynamic endpoint permissions, provider network behavior, and preservation of extension identity.
- **Why not checklist row**: the work spans repository governance, shared provider contracts, multilingual UX, release metadata, and destructive-history safeguards with an independent verification boundary.

## Acceptance Criteria

- Default-branch candidate ancestry contains only Mercury-authored commits; old `main`, `v0.1.0`, Release assets, repository URL, and GitHub distribution key remain recoverable and unchanged.
- `newapi` accepts supported endpoint forms, lists models explicitly, supports manual fallback, enforces non-streaming Chat Completions, and never silently changes privacy class or provider.
- Popup and settings present Mercury identity, provider privacy/model/host status, and all six shortcuts within the target viewport; no daily UI labels FluentRead.
- README names FluentRead and fixed commit `f91543c`; GPL, NOTICE, and third-party notices remain complete.
- Existing 52 files/475 tests plus new coverage pass, as do compile/build/docs/release/diff checks and Chrome 151+ regression on local fixtures.
- No payment, purchase, telemetry, store submission, GitHub Release, real paid model call, or default-branch cutover occurs in this contract.

## Annotations
<!-- [NOTE]: prefixed inline. Claude processes all and revises. -->

## Task Breakdown
- [x] Capture and preflight the strict repo-harness contract; establish the linked clean-history worktree from the fulfilled v0.1.1 tree.
- [x] Create and verify the pre-clean archive ref and record old main/tag/release/key fingerprints without moving main.
- [x] Implement endpoint normalization, model discovery, non-streaming response parsing, localized errors, and provider tests.
- [x] Implement popup/settings/About attribution and usability refinements with complete English, Simplified Chinese, and Traditional Chinese strings.
- [x] Update version, changelog, README/legal boundaries, product specification, OCR size copy, and release metadata.
- [ ] Run local Sub2API fixtures, unit/integration suites, compile, builds, docs, artifacts, readiness, diff, and Chrome 151+ regressions without real paid endpoints.
- [ ] Run repo-harness-check and independent review; record history and privacy evidence.
- [ ] Stop before default-branch cutover, tag, Release, or store submission and request the final explicit user confirmation.
