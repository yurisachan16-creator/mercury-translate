# Implementation Notes: mercury-v0-1-2-identity-sub2api-ux

> **Status**: Active
> **Plan**: plans/plan-20260820-1214-mercury-v0-1-2-identity-sub2api-ux.md
> **Contract**: tasks/contracts/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.contract.md
> **Review**: tasks/reviews/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.review.md
> **Last Updated**: 2026-08-20 12:31
> **Lifecycle**: notes

## Design Decisions

- The clean root uses the exact fulfilled v0.1.1 tree `48a08b9548c77b03fb9b50ae4c9275f87d6a74b2` from source commit `7264ed33386ac4188fb732216ed70584d510ce28`; root commit `f26ac685b63b6e58e555791885ae232433f02b1b` has no parent and is authored by the configured Steven Chan noreply identity.
- Preserve internal service ID `newapi`, existing configuration fields, and all `fluentread-*` compatibility identifiers. Sub2API is an OpenAI-compatible presentation/protocol refinement, not a second provider.
- Provider discovery is an explicit GET-only action; automatic or connection-test inference is forbidden. Actual translation remains a deliberate user action.
- Daily UI removes promotional upstream branding, while README, LICENSE, NOTICE, and THIRD_PARTY_NOTICES retain attribution and licensing.

## Deviations From Plan Or Spec

- None recorded.

## Tradeoffs Considered

| Option | Decision | Reason |
|--------|----------|--------|
| Rewrite the existing default branch after verification | Selected, but cutover deferred | Keeps repository URL and existing Release while enabling Mercury-only contributor ancestry; requires exact-SHA confirmation and rollback ref. |
| Add a second `sub2api` service ID | Rejected | Duplicates the established OpenAI-compatible adapter and creates settings/privacy migration risk. |
| Support Responses/SSE in v0.1.2 | Rejected | Expands protocol parsing and error surface without being needed for stable Chat Completions translation. |

## Open Questions

- None.

## Evidence Links

- Checks: `.ai/harness/checks/latest.json`
- Run snapshots: `.ai/harness/runs/`
- Old default branch: `83396931351ddf93637fb119c8582358533e8bf5`.
- Existing `v0.1.0` tag object: `0e1ab74db4b2e1327dcc29dc7f338f97b0e2dd99`.
- Remote archive tag object: `7b7682c2714689c0e673066b269502a5ac9f7f75`; GitHub ruleset `21073410` forbids update, deletion, and non-fast-forward changes with no bypass actor.
- Existing v0.1.0 Release remains `https://github.com/yurisachan16-creator/mercury-translate/releases/tag/v0.1.0`; its recorded assets and SHA-256 digests were read before implementation.
- Clean candidate ancestry proof at start: one root, one commit, one author (`Steven Chan <232764247+yurisachan16-creator@users.noreply.github.com>`).
- GitHub distribution public-key SHA-256 is `77df294a8324d912977362874cb79a4ba8504d4eec05e5fad02ba6dbd7ab129d`; it is present in the old main and fulfilled v0.1.1 WXT configuration and will be rebound to the final GitHub-target manifest during release verification.
- Documentation/version slice: `package.json` is now `0.1.2`; README keeps the canonical FluentRead `f91543c6b6b76f3c5d6343b47a82e431acfa648a` provenance while ordinary help/store listing copy uses Mercury identity; Sub2API/OpenAI-compatible privacy and model-discovery behavior is documented; OCR pack sizes are recorded from `OCR_LANGUAGE_ASSETS` as `eng` 4,113,088 bytes, `chi_sim` 2,469,156 bytes, `chi_tra` 2,366,642 bytes, `jpn` 2,471,260 bytes and `kor` 1,677,415 bytes.
- Documentation/version verification: `pnpm docs:build` passed after repository-local temp-file escalation; `node store-assets/scripts/generate-chrome-web-store-assets.mjs --check` passed; `pnpm vitest run tests/chromeWebStoreRelease.test.ts tests/ocrLanguageAssets.test.ts tests/i18n.test.ts` passed with 3 files / 22 tests; `git diff --check` passed. `pnpm release:artifacts` was attempted and correctly refused the dirty concurrent worktree before creating release archives, so `pnpm release:check` remains blocked until the full v0.1.2 candidate is clean/committed.
- Provider implementation commit `e74a1f7` normalizes root, path-prefixed `/v1`, and full Chat Completions URLs, rejects Responses API endpoints, forces `stream: false`, parses JSON by body rather than `Content-Type`, and exposes provider-ID-only `provider.listModels` routing.
- UI implementation commit `6467ec7` adds the guided Sub2API setup, explicit text-free model-discovery wording, privacy/model/hostname status, missing-configuration navigation, compact shortcut cards, and Mercury-only daily UI in all three locales.
- Version/documentation commit `8ef2743` updates the `package.json` version authority to `0.1.2`, changelog/spec/privacy/help/store copy, README-only upstream promotion, and exact OCR pack sizes.
- Focused integration verification after merging the slices: `pnpm test -- tests/mercuryIdentityUx.test.ts tests/i18n.test.ts tests/newApiService.test.ts tests/providerModelCatalog.test.ts tests/chromeWebStoreRelease.test.ts tests/ocrLanguageAssets.test.ts tests/translateApiPerformance.test.ts` passed with 7 files / 47 tests; `pnpm compile` passed. All provider network behavior in these tests used mocked responses only.
- Local transport fixture commit `9dc5e69` starts an ephemeral `127.0.0.1` server and verifies text-free `GET /v1/models`, non-streaming `POST /v1/chat/completions`, selected model, local Authorization header, and valid-JSON parsing under incorrect response `Content-Type`; `pnpm test -- tests/sub2ApiLocalFixture.test.ts tests/newApiService.test.ts` passed with 2 files / 5 tests and made no external connection.

## Promotion Filter

Promote a candidate to `tasks/lessons.md`, `docs/researches/`, or harness asset files only when all three hold: hard to reverse, surprising without local context, and a real trade-off existed. If any one is missing, keep it in this notes file instead.

## Promotion Candidates

- Promote to `tasks/lessons.md` only after a repeated correction or failure pattern.
- Promote to `docs/researches/` only when it is durable repo knowledge with evidence.
- Promote to harness asset files only after verification across more than one task or fixture.
