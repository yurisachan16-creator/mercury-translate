# Implementation Notes: github-repo-harness-bootstrap

> **Status**: Active
> **Plan**: plans/plan-20260819-2119-github-repo-harness-bootstrap.md
> **Contract**: tasks/contracts/20260819-2119-github-repo-harness-bootstrap.contract.md
> **Review**: tasks/reviews/20260819-2119-github-repo-harness-bootstrap.review.md
> **Last Updated**: 2026-08-19 21:34
> **Lifecycle**: notes

## Design Decisions

- Created `yurisachan16-creator/mercury-translate` as a public standalone repository (`fork: false`) and pushed the preserved FluentRead baseline `f91543c` to `main` before the Mercury commits.
- Renamed the FluentRead remote to fetch-only `upstream`, set its push URL to `DISABLED`, and assigned the standalone repository to `origin`.
- Kept `package.json` at `0.1.0` as the release version authority. The WXT manifest and ZIP name derive from it; the tag workflow rejects any tag other than `v${package.json.version}`.
- Split the bootstrap into the requested rollback units: product launch, repo-harness adoption, and GitHub governance/release policy. The final PR uses the linked worktree branch `codex/bootstrap-mercury-v0.1.0`.
- Rebuilt the two unpublished local bootstrap commits after review found the CI workflow was introduced too early. The product commit now contains no `.github/**` files, the harness commit contains only capability contracts under `.github/`, and the governance commit introduces the CI workflow itself.
- Initialized repo-harness Standard for Codex and Claude, synchronized CodeGraph, registered non-overlapping capability prefixes, and made the root required checks identical for both agents.
- Stored the `public` capability contract under `.ai/context/contracts/` instead of `public/`. WXT copies everything in `public/` into the extension, so leaving agent instructions there would unnecessarily expose them in the release ZIP.
- CI runs the same compile, 448-test, build, documentation, ZIP, diff, and archive-integrity gates on pushes and PRs. Tag releases additionally rebuild from the tagged commit, validate the SemVer tag, download the five pinned OCR packs, and publish checksums and notices.
- All project automation remains on the no-cost path: a public GitHub repository, public-repository standard Actions runner, GitHub Free rulesets, GitHub Release, and direct upstream OCR assets. No paid provider, store listing, hosted backend, subscription, or billable API is enabled.

## Deviations From Plan Or Spec

- The requested full user-level `repo-harness update --target both --channel latest --with-external-skills --configure-codegraph` reached an upstream `archctx` architecture-doc renderer mismatch after updating. repo-harness remained on `0.15.2`; the four requested Waza skills (`think`, `hunt`, `check`, `health`) were repaired directly for Codex and Claude, and repository initialization/checks continued successfully.
- repo-harness generated capability contract files inside `public/` by default. They were relocated through the capability registry because the default location polluted the extension package; no product runtime behavior changed.
- The first committed `verify-sprint` evaluated the complete three-commit branch against `main`, while the machine contract listed only the third-slice paths. The Allowed Paths block was widened to the exact user-approved product, harness, documentation, asset, test, and GitHub prefixes so the evidence gate reviews the full bootstrap instead of relying on a mutable worktree checkpoint.
- The first GitHub Actions run failed before install because `pnpm/action-setup` rejected a duplicate pnpm version (the workflow input plus `package.json#packageManager`). The workflow now uses only the package-manager declaration, preserving `package.json` as the single version authority for tooling as well as the release.
- The next run passed every build/test gate but artifact upload ignored the dot-prefixed `.output` directory. `actions/upload-artifact` now opts into hidden files. Branch pushes are limited to `main` while PR events verify topic branches, preventing duplicate public-runner work for the same PR commit.
- PR #1 check `verify` passed on GitHub Actions run `32262571643` after those fixes. Active ruleset readback confirmed `main-governance` (`21045527`), `v-tags-creation` (`21045528`), and `v-tags-immutable` (`21045530`) with the required check, rebase/squash-only history, zero approvals, resolved threads, and protected refs.
- Final review found that a clean-checkout `git diff --check` cannot inspect already committed whitespace. The workflow now fetches history and checks the PR or push commit range; the exposed trailing blank line in `THIRD_PARTY_NOTICES.md` was removed in the product commit.
- The optional external Claude cross-review was not run: the environment blocked full-diff export, and the user subsequently required that no fee-bearing operation occur. The Acceptance Policy therefore uses repo-harness's canonical `Codex` reviewer name with source `codex-team-gatekeeper`, accurately representing the no-cost, read-only internal gate instead of mislabeling it as Claude or requiring a user waiver.

## Tradeoffs Considered

| Option | Decision | Reason |
|--------|----------|--------|
| GitHub Fork vs standalone repository | Standalone | Keeps upstream ancestry without establishing GitHub's fork relationship, matching the product's independent identity. |
| Merge commit vs rebase for bootstrap | Rebase | Preserves the three reviewable commits without adding a merge commit. |
| Capability contracts inside `public/` vs central context directory | `.ai/context/contracts/` | Keeps agent-only metadata out of Chrome-distributed assets while retaining prefix resolution. |
| Commit OCR models vs release assets | Release assets | Avoids large binary history while pinning each model by upstream commit and application SHA-256. |

## Open Questions

- The final release checksum and clean-download evidence can only be recorded after the merged `v0.1.0` tag workflow completes.

## Evidence Links

- Checks: `.ai/harness/checks/latest.json`
- Run snapshots: `.ai/harness/runs/`
- repo-harness initialization transaction: `.ai/harness/backups/fs-transaction/1787145351215-34339-1/manifest.json` (ignored local recovery evidence)
- Local ZIP: `.output/mercury-translate-0.1.0-chrome.zip` (ignored build output)
- Public repository: `https://github.com/yurisachan16-creator/mercury-translate`
- Bootstrap PR: `https://github.com/yurisachan16-creator/mercury-translate/pull/1`
- Green CI: `https://github.com/yurisachan16-creator/mercury-translate/actions/runs/32262571643`

## Promotion Filter

Promote a candidate to `tasks/lessons.md`, `docs/researches/`, or harness asset files only when all three hold: hard to reverse, surprising without local context, and a real trade-off existed. If any one is missing, keep it in this notes file instead.

## Promotion Candidates

- Promote to `tasks/lessons.md` only after a repeated correction or failure pattern.
- Promote to `docs/researches/` only when it is durable repo knowledge with evidence.
- Promote to harness asset files only after verification across more than one task or fixture.
