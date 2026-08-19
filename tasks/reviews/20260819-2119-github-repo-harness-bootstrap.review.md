# Task Review: github-repo-harness-bootstrap

> **Status**: Reviewed
> **Plan**: plans/plan-20260819-2119-github-repo-harness-bootstrap.md
> **Contract**: tasks/contracts/20260819-2119-github-repo-harness-bootstrap.contract.md
> **Notes File**: tasks/notes/20260819-2119-github-repo-harness-bootstrap.notes.md
> **Checks File**: .ai/harness/checks/latest.json
> **Last Updated**: 2026-08-19 22:31
> **Recommendation**: pass
> **Review Rubric Version**: 2
> **Reviewed Subject SHA256**: sha256:c21ff2d0ddb05d268340b4c22cff9c790c5f399bd4442b8b3e962b6786b6a594
> **Reviewed Subject Scope**: normalized-final-content
> **Reviewed Target Revision**: f91543c6b6b76f3c5d6343b47a82e431acfa648a

## Human Review Card

- Verdict: PASS — no blocking findings after the commit-boundary repair.
- Change type: code-change / release-bootstrap
- Intended files changed: Mercury product launch, repo-harness Standard adoption, GitHub CI/governance, version/release documentation, and scoped workflow evidence.
- Actual files changed: 224 paths relative to `f91543c`; the third slice contains the GitHub workflow, templates, Dependabot, release checklist, capability-context relocation, and plan/contract/review notes.
- Commands passed: `pnpm compile`; `pnpm test` (49 files / 448 tests); `pnpm build`; `pnpm docs:build`; `pnpm zip`; `git diff --check`; ZIP integrity; context scan; strict task workflow; strict contract verification.
- Residual risks: the final amended head still needs its free GitHub CI run, rebase merge, tag workflow, release download checksum, and clean-profile Chrome validation; repository and tag rulesets are already active and read back successfully.
- Reviewer action required: none before push; do not tag until the PR is merged and remote `main` is verified.
- Rollback: revert the three independent bootstrap commits; use the repo-harness transaction manifest only for initialization recovery.

## Mode Evidence

- Selected route: repo-harness gatekeeper, read-only pre-push acceptance review.
- P1/P2/P3 evidence: full diff and ancestry map; focused commit-boundary trace; PASS after the workflow introduction moved from the product commit to the governance commit.
- Root cause or plan evidence: user-approved three-commit rollback contract and `tasks/contracts/20260819-2119-github-repo-harness-bootstrap.contract.md`.

## Verification Evidence

- Waza `/check` run: repo-harness gatekeeper equivalent completed with PASS; external `repo-harness cross-review --provider claude` was blocked by the environment's source-export policy and was not bypassed.
- Commands run: all 19 machine-verifiable contract checks passed; gatekeeper independently rechecked commit ownership, ZIP contents, secret signatures, file sizes, remotes, history, and repository settings.
- Manual checks: `.github/workflows/ci-release.yml` is absent from product commit `55ab34c`, agent-only context is absent from the ZIP, and `upstream` push fails through its disabled push URL.
- Supporting artifacts: `.ai/harness/checks/latest.json`, `.ai/harness/runs/`, `.output/mercury-translate-0.1.0-chrome.zip` (ignored local evidence).
- Implementation notes reviewed: `tasks/notes/20260819-2119-github-repo-harness-bootstrap.notes.md`.
- Run snapshot: `.ai/harness/runs/run-20260819T222722-71586-20260819-2119-github-repo-harness-bootstrap.json`.

## Manual Check Evidence

Copy each non-built-in contract `manual_checks` requirement exactly. Check it only after
the observation is complete and replace the placeholder with concrete command output,
screenshot/artifact path, or reviewer observation.

- [x] No additional `manual_checks` block is declared by the contract.
  - Evidence: the explicit runtime readback oracle is fulfilled through local repository/settings/ZIP inspection now and GitHub CI/ruleset/release readback before tag completion.

## Acceptance Receipt Projection

> **Disposition**: external_pass
> **Reviewer**: Codex
> **Source**: codex-review
> **Actor**: not-applicable
> **Reviewed Subject SHA256**: sha256:c21ff2d0ddb05d268340b4c22cff9c790c5f399bd4442b8b3e962b6786b6a594
> **Reviewed Subject Scope**: normalized-final-content
> **Reviewed Target Revision**: f91543c6b6b76f3c5d6343b47a82e431acfa648a
> **Verification Evidence SHA256**: sha256:a32acb0df2141692dc1bfe7f83973ac80affb087a6f1ed4115abfe3541bdd884
> **Issued At**: 2026-08-19T14:29:22.839Z

- Summary: PASS from the read-only Codex team gatekeeper for exact local HEAD 80c3dd22a3e8349b7eefe985548a049faf910124; no blocking findings; all 19 contract checks passed under the zero-fee policy.
- Findings: none

## Behavior Diff Notes

- Mercury product, harness, and GitHub governance are separated into three independently revertible commits; no `.github/**` path is introduced by the product commit.
- WXT now packages only runtime assets from `public/`; repo-harness capability context resolves from `.ai/context/contracts/` and does not ship in the Chrome ZIP.

## Residual Risks / Follow-ups

- The local ZIP is not the release authority. The tag workflow rebuilds it and publishes a new SHA-256 manifest.
- GitHub cannot natively assert that a tag target came from `main`; the release procedure therefore verifies the remote `main` SHA before creating the annotated tag.

## Scorecard

| Dimension | Score | Notes |
|-----------|-------|-------|
| Functionality | 10/10 | 49 files / 448 tests, compile/build/docs/ZIP gates pass. |
| Product depth | 9/10 | Web, subtitle, image OCR, and PDF paths are covered; browser-store publishing is intentionally excluded. |
| Design quality | 9/10 | Local-first privacy boundary, typed provider/PDF contracts, and clean packaging boundary. |
| Code quality | 9/10 | Strict TypeScript, focused tests, release governance, and independent review are in place. |

## Failing Items

- None.

## Retest Steps

- Re-run: `repo-harness run verify-sprint --prepare-acceptance`, record the receipt, then `repo-harness run verify-sprint`.
- Re-check: GitHub `verify` after push; ruleset readback; merged `main` SHA; tag/release asset download and checksum.

## Summary

- PASS for the third governance commit and bootstrap PR. Release remains correctly blocked until remote CI, rulesets, merge, tag, and artifact readback complete.
