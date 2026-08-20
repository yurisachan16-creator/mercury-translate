# Task Review: mercury-v0-1-2-identity-sub2api-ux

> **Status**: Reviewed
> **Plan**: plans/plan-20260820-1214-mercury-v0-1-2-identity-sub2api-ux.md
> **Contract**: tasks/contracts/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.contract.md
> **Notes File**: tasks/notes/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.notes.md
> **Checks File**: .ai/harness/checks/latest.json
> **Last Updated**: 2026-08-20 13:50
> **Recommendation**: pass
> **Review Rubric Version**: 2
> **Reviewed Subject SHA256**: sha256:2732b4fa02f48d11bc513d08f648f60cf6228ebdf19c6d3abbc945329310d1dc
> **Reviewed Subject Scope**: normalized-final-content
> **Reviewed Target Revision**: f26ac685b63b6e58e555791885ae232433f02b1b

## Human Review Card

- Verdict: PASS for the local v0.1.2 candidate and repo-harness acceptance scope. The owner explicitly selected the permitted user-waiver route after an independent local gatekeeper review.
- Change type: code-change / frontend / provider-integration / clean-history preparation / release-preparation.
- Intended files changed: Sub2API/OpenAI-compatible provider runtime and tests, popup/settings UX and three locales, Mercury identity/docs, version/release metadata, and scoped repo-harness evidence.
- Actual files changed: 47 tracked paths relative to clean root `f26ac685b63b6e58e555791885ae232433f02b1b`; all are inside the contract allowlist. The normalized implementation subject contains 42 paths and excludes five workflow-only evidence paths.
- Commands passed: `pnpm compile`; `pnpm test` (56 files / 498 tests); `pnpm build`; `pnpm docs:build`; `pnpm release:artifacts`; `pnpm release:check`; `git diff --check`; strict contract and sprint verification.
- Residual risks: Chrome security policy prevented automated navigation to `chrome://extensions` and `chrome-extension://` pages for a final v0.1.2 live reload; prior Chrome 151 full-product QA and final mocked/local provider coverage remain recorded. Documentation emits nonfatal imagemin warnings, and repo-harness reports one user-level unmanaged Claude hook warning.
- Reviewer action required: none for the local candidate. Default-branch replacement, policy restoration to `main`, tagging, Release creation, and store submission remain separate owner-confirmed actions.
- Rollback: discard the clean candidate branch before cutover; after any separately approved cutover, restore old main from immutable `archive/pre-clean-main-20260820` if necessary. Existing `v0.1.0` and Release assets remain untouched.

## Mode Evidence

- Selected route: strict repo-harness contract, deterministic Change Assessment, independent local gatekeeper, and explicit owner-waiver AcceptanceReceipt.
- P1/P2/P3 evidence: shared provider architecture and background-only credential flow; provider-ID-only model discovery; preservation of `newapi` storage identity; clean-root history with immutable recovery ref.
- Root cause or plan evidence: user-approved v0.1.2 plan, implementation notes, mocked/local Sub2API fixtures, and the fail-closed review-base diagnosis recorded in the task notes.

## Verification Evidence

- Waza `/check` run: repo-harness gatekeeper equivalent completed; its final pre-closeout finding was limited to the uncommitted waiver projection, which this review commit captures before the clean-tree release rerun.
- Commands run: all 22 contract criteria passed, including 56 files / 498 tests, compile/build/docs, both release distributions, release readiness, and diff checks.
- Manual checks: history authorship, old refs, extension-key preservation, keyless store manifest, no paid endpoint use, and no push/release/store mutation were inspected. Prior Chrome 151 full-product QA is recorded separately; no final special-page automation is inferred.
- Supporting artifacts: `.ai/harness/checks/latest.json`, `.ai/harness/runs/`, `release/mercury-translate-v0.1.2-chrome.zip`, `release/mercury-translate-v0.1.2-chrome-web-store.zip`, `release/mercury-translate-v0.1.2-source.zip`, `release/SHA256SUMS`, and `release/LICENSES.md`.
- Implementation notes reviewed: `tasks/notes/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.notes.md`.
- Run snapshot: `.ai/harness/runs/run-20260820T133548-33780-20260820-1214-mercury-v0-1-2-identity-sub2api-ux.json`.

## Manual Check Evidence

- [x] No additional `manual_checks` block is declared by the contract.
  - Evidence: required runtime readbacks are covered by local fixtures, release artifact inspection, Git history/ref checks, and the recorded Chrome 151 QA report.

## Acceptance Receipt Projection

> **Disposition**: user_waiver
> **Reviewer**: User
> **Source**: user-waiver
> **Actor**: aitwo
> **Reviewed Subject SHA256**: sha256:2732b4fa02f48d11bc513d08f648f60cf6228ebdf19c6d3abbc945329310d1dc
> **Reviewed Subject Scope**: normalized-final-content
> **Reviewed Target Revision**: f26ac685b63b6e58e555791885ae232433f02b1b
> **Verification Evidence SHA256**: sha256:86d3a1f6a609e33e17d9c1c312ef6d0b7e4a8eb9434410ef2e03248c65905eea
> **Issued At**: 2026-08-20T05:49:00.671Z

- Summary: Owner explicitly authorized the user-waiver route after local independent gatekeeper PASS; no external source review, payment, paid API call, push, release, or default-branch cutover is authorized.
- Findings: none

## Behavior Diff Notes

- `newapi` now presents as OpenAI compatible / Sub2API while preserving existing settings. Explicit model discovery sends no translation text, and user-initiated translation always uses non-streaming Chat Completions.
- Daily UI presents Mercury identity and provider privacy/model/hostname status; README and legally required files retain upstream provenance without promoting it in normal product surfaces.
- The candidate has a parentless Mercury root and one commit author. The old default branch, archive tag, version tag, repository URL, Releases, and extension distribution key remain unchanged.

## Residual Risks / Follow-ups

- Before any default-branch cutover, obtain a separate exact-SHA owner confirmation. Immediately after cutover, restore `worktree_strategy.review_base` to `main` in a reviewed commit and rerun subject-bound verification before any tag or Release.
- A final Chrome special-page reload of the v0.1.2 popup/settings build remains manual because the browser-control security boundary forbids extension-internal pages.
- No Chrome Web Store registration, payment, upload, declaration, review submission, or paid model call was performed.

## Scorecard

| Dimension | Score | Notes |
|-----------|-------|-------|
| Functionality | 10/10 | 56 files / 498 tests and all compile/build/release gates pass. |
| Product depth | 9/10 | Sub2API model discovery and all existing web, subtitle, PDF, and OCR paths remain covered; Responses/SSE are intentionally out of scope. |
| Design quality | 9/10 | Mercury-first daily UI, compact popup, explicit privacy labels, and localized guided setup. |
| Code quality | 9/10 | Typed provider core, deterministic local fixtures, fail-closed endpoint handling, and subject-bound workflow evidence. |

## Failing Items

- None.

## Retest Steps

- Re-run: `repo-harness run verify-sprint`, `pnpm release:artifacts`, `pnpm release:check`, and `git status --short --branch -uall` after any candidate commit.
- Re-check: exact remote old-main/archive/tag SHAs before a separately authorized cutover; then restore the normal `main` review base and reverify before tagging.

## Summary

- PASS for the local Mercury Translate v0.1.2 candidate. The owner-waiver AcceptanceReceipt is valid and the product/release checks are green; external mutations remain intentionally blocked pending separate confirmation.
