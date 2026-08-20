# Plan: Mercury Translate v0.1.1：复用成熟商店方案

> **Status**: Review
> **Created**: 20260820-0023
> **Slug**: chrome-web-store-v0-1-1-reuse
> **Planning Source**: repo-harness-plan
> **Orchestration Kind**: implementation
> **Source Ref**: (none)
> **Artifact Level**: work-package
> **Promotion Reason**: User explicitly approved implementation of a cross-capability Chrome Web Store release work package.
> **Verification Boundary**: Dual distribution builds, migration tests, full required checks, clean Chrome validation, and independent review.
> **Rollback Surface**: Revert v0.1.1 release configuration, store assets, migration UI, CI, and documentation without changing the v0.1.0 GitHub release.
> **Spec**: `docs/spec.md`
> **Research**: See `docs/researches/`
> **Task Contract**: `tasks/contracts/20260820-0023-chrome-web-store-v0-1-1-reuse.contract.md`
> **Task Review**: `tasks/reviews/20260820-0023-chrome-web-store-v0-1-1-reuse.review.md`
> **Implementation Notes**: `tasks/notes/20260820-0023-chrome-web-store-v0-1-1-reuse.notes.md`

## Agentic Routing
- Selected route: planning
- Routing reason: Captured from repo-harness-plan planning output.
- Source ref: (none)
- Due diligence:
  - P1 map: See captured planning output below.
  - P2 trace: See captured planning output below.
  - P3 decision rationale: See captured planning output below.

## Workflow Inventory
Complete this inventory before implementation. If any line is unknown, keep the plan in Draft and fill it before projection.

- Active plan: `plans/plan-20260820-0023-chrome-web-store-v0-1-1-reuse.md`
- Sprint contract: `tasks/contracts/20260820-0023-chrome-web-store-v0-1-1-reuse.contract.md`
- Sprint review: `tasks/reviews/20260820-0023-chrome-web-store-v0-1-1-reuse.review.md`
- Implementation notes: `tasks/notes/20260820-0023-chrome-web-store-v0-1-1-reuse.notes.md`
- Deferred-goal ledger: `tasks/todos.md`
- Current checks: `.ai/harness/checks/latest.json`
- Run snapshots: `.ai/harness/runs/`
- Scope authority: `tasks/contracts/20260820-0023-chrome-web-store-v0-1-1-reuse.contract.md` `allowed_paths`
- Concurrency rule: `.ai/harness/active-plan` selects the active plan for this worktree when present; `.ai/harness/active-worktree` records the owning worktree. If another worktree already owns active work, open or switch to the matching worktree instead of serializing unrelated plans.
- Execution isolation: approved contract-level work projects through `repo-harness run plan-to-todo --plan plans/plan-20260820-0023-chrome-web-store-v0-1-1-reuse.md` and may start `repo-harness run contract-worktree start --plan plans/plan-20260820-0023-chrome-web-store-v0-1-1-reuse.md`.

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
- Contract file: `tasks/contracts/20260820-0023-chrome-web-store-v0-1-1-reuse.contract.md`
- Review file: `tasks/reviews/20260820-0023-chrome-web-store-v0-1-1-reuse.review.md`
- Implementation notes file: `tasks/notes/20260820-0023-chrome-web-store-v0-1-1-reuse.notes.md`
- Template: `.claude/templates/contract.template.md`
- Verification command: `repo-harness run verify-contract --contract tasks/contracts/20260820-0023-chrome-web-store-v0-1-1-reuse.contract.md --strict`
- Active plan rule: this captured plan is written to `.ai/harness/active-plan` and the owning worktree is written to `.ai/harness/active-worktree` unless --no-active is used. Do not infer active execution from the latest non-archived plan.

## Handoff

- Checks file: `.ai/harness/checks/latest.json`
- Session handoff: `.ai/harness/handoff/current.md`

## Promotion Gate

- **Merge/PR unit**: Captured plan `plans/plan-20260820-0023-chrome-web-store-v0-1-1-reuse.md` is the proposed mergeable execution unit; revise before execute if this is only a checklist step.
- **Rollback surface**: Revert v0.1.1 release configuration, store assets, migration UI, CI, and documentation without changing the v0.1.0 GitHub release.
- **Verification boundary**: Dual distribution builds, migration tests, full required checks, clean Chrome validation, and independent review.
- **Review/acceptance boundary**: `tasks/reviews/20260820-0023-chrome-web-store-v0-1-1-reuse.review.md` must record pass against the captured acceptance criteria.
- **High-risk surface**: Risks named in captured planning output; keep the plan Draft if risk ownership is not concrete.
- **Why not checklist row**: User explicitly approved implementation of a cross-capability Chrome Web Store release work package.

## Evidence Contract

- **State/progress path**: `plans/plan-20260820-0023-chrome-web-store-v0-1-1-reuse.md` task breakdown, `tasks/todos.md` deferred-goal ledger, `tasks/contracts/20260820-0023-chrome-web-store-v0-1-1-reuse.contract.md`, `tasks/reviews/20260820-0023-chrome-web-store-v0-1-1-reuse.review.md`, and `tasks/notes/20260820-0023-chrome-web-store-v0-1-1-reuse.notes.md`
- **Verification evidence**: `.ai/harness/checks/latest.json`, `.ai/harness/runs/`, and the commands named in the captured planning output
- **Evaluator rubric**: `tasks/reviews/20260820-0023-chrome-web-store-v0-1-1-reuse.review.md` must record a passing Waza /check style recommendation
- **Stop condition**: all task breakdown items are complete, sprint verification passes, and the review recommends pass
- **Rollback surface**: Revert v0.1.1 release configuration, store assets, migration UI, CI, and documentation without changing the v0.1.0 GitHub release.

## Captured Planning Output

# Mercury Translate v0.1.1：复用成熟商店方案

## Status

Approved

## Summary

Ship an unlisted Chrome Web Store package for Mercury Translate v0.1.1 by adapting the GPL-3.0 store-readiness structure from OnlyTranslate commit `3f5f16e8d94bc7f8f04add9264b804032c70d1b3`, the manual WXT ZIP upload flow proven by FluentRead, and the versioned settings-transfer behavior from Read Frog commit `61b3e76c3664006fd4cd2a265b3dab4fd025889d`.

End users install from one unlisted link and receive Chrome-managed updates. The only permitted cost is the developer registration fee paid manually by the user. The implementation must not add automated payment, subscriptions, a Mercury backend, telemetry, paid APIs, CWS API credentials, or automatic store submission.

## Product Decisions

- Release version is `0.1.1`; `package.json` remains the version source of truth.
- Keep GitHub Release builds with the existing public manifest key so current sideload users retain their extension ID.
- Produce a separate Chrome Web Store build without a manifest `key` or hard-coded `update_url`; the store assigns a new ID.
- Store visibility is Unlisted, all supported regions, with no in-app purchases.
- The new store ID cannot access the old extension's storage. Provide a guided, schema-versioned export/import migration. API keys are excluded by default and only included after an explicit plaintext-secret warning.
- First and subsequent CWS uploads remain manual in v0.1.1. CWS API v2 automation is deferred to a separate contract.
- Reuse GPL workflow structure and source templates only with provenance. All Mercury screenshots, branding, listing prose, privacy claims, identifiers, and publisher details must be original.

## Implementation

1. Add `github | chrome-web-store` distribution targets to WXT/build scripts. Generate deterministic GitHub, CWS, source, checksum, and license artifacts. The CWS manifest must omit the fixed key while preserving Chrome 151+, PDF, OCR, and local worker behavior.
2. Add `SettingsTransferEnvelopeV1` with app version, schema version, export timestamp, configuration, and `secretsIncluded`. Validate imports, reject unknown schemas, preview changes, preserve a safe backup, and exclude API keys by default.
3. Add Mercury-owned CWS assets: 128 icon, 440x280 promo tile, and five 1280x800 screenshots for webpage, subtitles, PDF, OCR, and provider/privacy settings. Add complete en, zh-CN, and zh-TW listing copy.
4. Publish matching three-language privacy pages through the existing public GitHub repository and GitHub Pages. Disclose local vs selected network providers, OCR model downloads, PDF memory/cache handling, local API-key storage, no telemetry, no data sale, and no Mercury backend.
5. Adapt OnlyTranslate's readiness checks for Mercury: version and filename consistency, dual-manifest invariants, ZIP integrity, source/licenses/checksums, locale and asset completeness, remote executable-code scanning, and artifact growth. Use the exact v0.1.0 ZIP size as baseline; warn above 15% growth and fail above 25% unless the reviewed baseline is intentionally updated.
6. Extend GitHub Actions to build and retain the CWS package without submitting it. Preserve the existing GitHub Release fallback.
7. Record copied/adapted GPL sources and commits in NOTICE/THIRD_PARTY_NOTICES and describe modifications. Do not copy store identity, reviews, images, telemetry, Discord hooks, deprecated Chrome API v1 upload code, or paid service integrations.

## Workflow Inventory

- Active plan: `plans/plan-chrome-web-store-v0.1.1-reuse.md`
- Expected contract: `tasks/contracts/plan-chrome-web-store-v0.1.1-reuse.contract.md`
- Expected review: `tasks/reviews/plan-chrome-web-store-v0.1.1-reuse.review.md`
- Expected notes: `tasks/notes/plan-chrome-web-store-v0.1.1-reuse.notes.md`
- Deferred ledger: `tasks/todos.md`
- Check authority: `.ai/harness/checks/latest.json`
- Run evidence: `.ai/harness/runs/`
- Isolation: `codex/chrome-web-store-v0.1.1-reuse` linked worktree; main is receive-only until verification.
- Allowed-path owner: this contract owns product release configuration, settings-transfer implementation and UI, tests, `store-assets/**`, `scripts/**`, `docs/**`, `public/**`, `.github/**`, README, CHANGELOG, NOTICE/THIRD_PARTY_NOTICES, package metadata, WXT configuration, and repo-harness artifacts required by this task. Unrelated paths must not be absorbed.

## Acceptance Criteria

- Existing 49 test files / 448 tests remain green, with additional tests for dual manifests, key isolation, version consistency, store assets/locales, settings migration/default secret exclusion, remote executable code, ZIP integrity, and hashes.
- `pnpm compile`, `pnpm test`, `pnpm build`, `pnpm docs:build`, both distribution ZIPs, source/checksum/license artifacts, and `git diff --check` pass.
- The exact CWS ZIP can be loaded in a clean Chrome 151+ profile and passes webpage, subtitle, PDF, OCR, cancel/retry, local content privacy, and explicit network-consent checks.
- No payment or store submission is automated. Registration payment, dashboard upload, declarations, and final review submission remain explicit user actions.
- The implementation finishes with subject-bound repo-harness checks and an independent review. The next workflow action after implementation is `repo-harness-check`.

## Stop Conditions

- Stop before any payment, developer-account registration, CWS package upload, declaration acceptance, or review submission.
- Stop if a required secret would need to enter source, logs, fixtures, release assets, or GitHub Actions.
- Stop if the CWS build cannot remain free of remotely executed code or if a requested permission cannot be truthfully disclosed.
- Stop and preserve evidence if Chrome 151+ clean-profile validation requires an unavailable GUI/account step; do not infer it passed.

## Deferred

- CWS API v2/service-account automation.
- Public-search listing, paid promotion, custom domain, other browser stores, telemetry, subscriptions, and any Mercury-hosted backend.

## Annotations
<!-- [NOTE]: prefixed inline. Claude processes all and revises. -->

## Task Breakdown
- [x] Capture the approved plan, activate a Strict contract, and isolate work in `codex/chrome-web-store-v0-1-1-reuse`.
- [x] Implement dual GitHub/CWS builds, release artifacts, CI retention, and readiness checks.
- [x] Implement versioned settings transfer with safe secret handling and migration UI.
- [x] Produce original three-language store/privacy assets and record GPL provenance.
- [ ] Complete the subject-bound external acceptance receipt. The full local verification envelope and internal independent review are complete; clean Chrome 151+ and live Unlisted-link checks are recorded as unavailable/manual, and the Claude review channel is awaiting explicit source-disclosure authorization.
