# Implementation Notes: chrome-web-store-v0-1-1-reuse

> **Status**: Awaiting External Acceptance
> **Plan**: plans/plan-20260820-0023-chrome-web-store-v0-1-1-reuse.md
> **Contract**: tasks/contracts/20260820-0023-chrome-web-store-v0-1-1-reuse.contract.md
> **Review**: tasks/reviews/20260820-0023-chrome-web-store-v0-1-1-reuse.review.md
> **Last Updated**: 2026-08-20 10:57
> **Lifecycle**: notes

## Design Decisions

- Use two explicit WXT distribution targets. The GitHub target keeps the existing public manifest key; the CWS target omits both `key` and `update_url`.
- Keep CWS submission manual for v0.1.1. CI may build and retain the store ZIP but must not hold account credentials or call a store API.
- Use the v0.1.0 GitHub ZIP size, 4,860,119 bytes, as the reviewed artifact-growth baseline. Warn above 15% and fail above 25%.
- Build store visuals deterministically from Mercury-owned SVG/HTML/CSS and actual product UI representations. The image-generation skill was considered and rejected because its own guidance prefers repo-native vector/code assets for established icon systems and exact UI graphics.
- A new CWS item receives a new extension ID because the original private key is unavailable. Cross-ID storage access is impossible, so migration is an explicit local export/import operation.

## Deviations From Plan Or Spec

- `repo-harness run verify-sprint --prepare-acceptance` now passes and binds the committed implementation subject. The frozen Claude cross-review channel was not invoked because the approval guard correctly required explicit authorization before disclosing the repository diff to that external service.
- Browser control became available for the installed unpacked distribution. Chrome 151 active-profile QA covered webpage, selection, dynamic/Shadow DOM, YouTube direct/SPA subtitles, PDF sources/fallback, OCR, cancellation/retry, and privacy boundaries. A clean-profile install of the keyless CWS ZIP and real Unlisted-link installation remain unavailable because no store item exists; no pass was inferred for either.
- QA evidence lives under `.gstack/qa-reports/`, which was added to this contract's allowed paths after the `/qa` workflow produced its durable report and screenshots.
- The provisional local OSS/license review recorded provenance and dependency notices, but it is not legal clearance or legal advice.

## Tradeoffs Considered

| Option | Decision | Reason |
|--------|----------|--------|
| Manual CWS dashboard upload vs service-account automation | Manual upload | Matches FluentRead's proven flow and avoids secrets, setup, and a new operational boundary in v0.1.1. |
| Copy final third-party screenshots vs reuse structure | Reuse structure only | Mercury has different PDF/OCR/privacy behavior and must not copy brand identity or misleading claims. |
| AI-generated store images vs deterministic source assets | Deterministic source assets | Exact dimensions, faithful UI, reproducibility, and reviewability matter more than painterly variation. |

## Open Questions

- None.

## Evidence Links

- Checks: `.ai/harness/checks/latest.json`
- Run snapshots: `.ai/harness/runs/`
- Contract preflight: `repo-harness run contract-run -- preflight --contract tasks/contracts/20260820-0023-chrome-web-store-v0-1-1-reuse.contract.md --json` returned `preflight_pass`.
- Workflow preflight: `repo-harness run check-task-workflow -- --strict` returned `[workflow] OK`.
- Asset dimensions: `node store-assets/scripts/generate-chrome-web-store-assets.mjs --check` returned `Chrome Web Store asset check passed (7 PNGs)`.
- Focused tests: `pnpm test tests/configTransfer.test.ts tests/chromeWebStoreRelease.test.ts` passed 2 files / 18 tests.
- Full tests: `pnpm test` passed 52 files / 474 tests.
- Browser QA: `.gstack/qa-reports/qa-report-mercury-translate-browser-2026-08-20.md` records a 78.4 → 99.9 health-score improvement, seven fixed medium findings, one deferred low content finding, and 24 inspected screenshots.
- Build checks: `pnpm compile`, `pnpm build`, `pnpm docs:build`, `pnpm zip`, `pnpm release:artifacts`, `pnpm release:check`, and `git diff --check` exited 0.
- Release artifacts: `release/mercury-translate-v0.1.1-chrome.zip`, `release/mercury-translate-v0.1.1-chrome-web-store.zip`, `release/mercury-translate-v0.1.1-source.zip`, `release/SHA256SUMS`, `release/LICENSES.md`, and copied license/notice/install files were generated locally.
- Release readback: GitHub ZIP contains the existing public key; the CWS ZIP contains no `key`; neither manifest contains `update_url`; both archives pass `unzip -t` and the readiness scan.
- Package hashes are materialized with the final local build in `release/SHA256SUMS`; they are deliberately not copied into tracked source because rebuilding ZIP timestamps can change the archive digest.
- Security review: the scoped diff scan reported no surviving reportable findings. Follow-up hardening clears stale plaintext exports, selects only the exact fresh WXT ZIP, validates ZIP integrity, reads the manifest without archive extraction, and expands remote executable-code checks.
- Cost/external-state boundary: no registration, payment, store upload, declaration acceptance, review submission, deployment, subscription, telemetry, backend, paid API, or store API call was performed.

## Promotion Filter

Promote a candidate to `tasks/lessons.md`, `docs/researches/`, or harness asset files only when all three hold: hard to reverse, surprising without local context, and a real trade-off existed. If any one is missing, keep it in this notes file instead.

## Promotion Candidates

- Promote to `tasks/lessons.md` only after a repeated correction or failure pattern.
- Promote to `docs/researches/` only when it is durable repo knowledge with evidence.
- Promote to harness asset files only after verification across more than one task or fixture.
