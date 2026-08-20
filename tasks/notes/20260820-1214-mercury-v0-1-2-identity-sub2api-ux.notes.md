# Implementation Notes: mercury-v0-1-2-identity-sub2api-ux

> **Status**: Active
> **Plan**: plans/plan-20260820-1214-mercury-v0-1-2-identity-sub2api-ux.md
> **Contract**: tasks/contracts/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.contract.md
> **Review**: tasks/reviews/20260820-1214-mercury-v0-1-2-identity-sub2api-ux.review.md
> **Last Updated**: 2026-08-20 13:24
> **Lifecycle**: notes

## Design Decisions

- The clean root uses the exact fulfilled v0.1.1 tree `48a08b9548c77b03fb9b50ae4c9275f87d6a74b2` from source commit `7264ed33386ac4188fb732216ed70584d510ce28`; root commit `f26ac685b63b6e58e555791885ae232433f02b1b` has no parent and is authored by the configured Steven Chan noreply identity.
- Preserve internal service ID `newapi`, existing configuration fields, and all `fluentread-*` compatibility identifiers. Sub2API is an OpenAI-compatible presentation/protocol refinement, not a second provider.
- Provider discovery is an explicit GET-only action; automatic or connection-test inference is forbidden. Actual translation remains a deliberate user action.
- Daily UI removes promotional upstream branding, while README, LICENSE, NOTICE, and THIRD_PARTY_NOTICES retain attribution and licensing.

## Deviations From Plan Or Spec

- Chrome browser control can operate ordinary pages but its security policy refuses `chrome://extensions` and `chrome-extension://` navigation. The complete v0.1.1 Chrome 151 regression report remains valid for unchanged webpage, selection, YouTube, PDF, OCR, cancellation/retry, and privacy paths; this work package does not claim a live reload of the final v0.1.2 popup/settings build.
- The frozen Claude acceptance review is pending explicit source-disclosure authorization. The external review command was rejected before invocation; no candidate source was transmitted. A local independent gatekeeper review still runs before handoff, but cannot impersonate the frozen Claude AcceptanceReceipt authority.

## Tradeoffs Considered

| Option | Decision | Reason |
|--------|----------|--------|
| Rewrite the existing default branch after verification | Selected, but cutover deferred | Keeps repository URL and existing Release while enabling Mercury-only contributor ancestry; requires exact-SHA confirmation and rollback ref. |
| Add a second `sub2api` service ID | Rejected | Duplicates the established OpenAI-compatible adapter and creates settings/privacy migration risk. |
| Support Responses/SSE in v0.1.2 | Rejected | Expands protocol parsing and error surface without being needed for stable Chat Completions translation. |

## Open Questions

- The owner must explicitly choose either a read-only external Claude review or the contract's owner-waiver route before repo-harness can finalize semantic acceptance.
- Any exact-SHA `main` cutover remains a later, separately confirmed administrative action.

## Evidence Links

- Checks: `.ai/harness/checks/latest.json`
- Run snapshots: `.ai/harness/runs/`
- Old default branch: `83396931351ddf93637fb119c8582358533e8bf5`.
- Existing `v0.1.0` tag object: `0e1ab74db4b2e1327dcc29dc7f338f97b0e2dd99`.
- Remote archive tag object: `7b7682c2714689c0e673066b269502a5ac9f7f75`; GitHub ruleset `21073410` forbids update, deletion, and non-fast-forward changes with no bypass actor.
- Existing v0.1.0 Release remains `https://github.com/yurisachan16-creator/mercury-translate/releases/tag/v0.1.0`; its recorded assets and SHA-256 digests were read before implementation.
- Clean candidate ancestry at `7c6bbfaca969adec4396f12bd261ca013f52137d`: nine commits, one root (`f26ac685b63b6e58e555791885ae232433f02b1b`), and one author (`Steven Chan <232764247+yurisachan16-creator@users.noreply.github.com>`).
- GitHub distribution public-key SHA-256 is `77df294a8324d912977362874cb79a4ba8504d4eec05e5fad02ba6dbd7ab129d`; it is present in the old main and fulfilled v0.1.1 WXT configuration and will be rebound to the final GitHub-target manifest during release verification.
- Documentation/version slice: `package.json` is now `0.1.2`; README keeps the canonical FluentRead `f91543c6b6b76f3c5d6343b47a82e431acfa648a` provenance while ordinary help/store listing copy uses Mercury identity; Sub2API/OpenAI-compatible privacy and model-discovery behavior is documented; OCR pack sizes are recorded from `OCR_LANGUAGE_ASSETS` as `eng` 4,113,088 bytes, `chi_sim` 2,469,156 bytes, `chi_tra` 2,366,642 bytes, `jpn` 2,471,260 bytes and `kor` 1,677,415 bytes.
- Documentation/version verification: `pnpm docs:build`, the store-asset checker, version/locale/OCR tests, and `git diff --check` pass. On the clean candidate, `pnpm release:artifacts` and `pnpm release:check` both pass and produce integrity-checked GitHub, Chrome Web Store, and source ZIPs without uploading them.
- Provider implementation commit `e74a1f7` normalizes root, path-prefixed `/v1`, and full Chat Completions URLs, rejects Responses API endpoints, forces `stream: false`, parses JSON by body rather than `Content-Type`, and exposes provider-ID-only `provider.listModels` routing.
- UI implementation commit `6467ec7` adds the guided Sub2API setup, explicit text-free model-discovery wording, privacy/model/hostname status, missing-configuration navigation, compact shortcut cards, and Mercury-only daily UI in all three locales.
- Version/documentation commit `8ef2743` updates the `package.json` version authority to `0.1.2`, changelog/spec/privacy/help/store copy, README-only upstream promotion, and exact OCR pack sizes.
- Focused integration verification after merging the slices: `pnpm test -- tests/mercuryIdentityUx.test.ts tests/i18n.test.ts tests/newApiService.test.ts tests/providerModelCatalog.test.ts tests/chromeWebStoreRelease.test.ts tests/ocrLanguageAssets.test.ts tests/translateApiPerformance.test.ts` passed with 7 files / 47 tests; `pnpm compile` passed. All provider network behavior in these tests used mocked responses only.
- Local transport fixture commit `9dc5e69` starts an ephemeral `127.0.0.1` server and verifies text-free `GET /v1/models`, non-streaming `POST /v1/chat/completions`, selected model, local Authorization header, and valid-JSON parsing under incorrect response `Content-Type`; `pnpm test -- tests/sub2ApiLocalFixture.test.ts tests/newApiService.test.ts` passed with 2 files / 5 tests and made no external connection.
- Bun/Vitest compatibility commit `7c6bbfa` extracts the pure New API runtime core and injects locale storage in tests without changing the production config/template path. Contract-listed tests pass both as individual Bun files (30 tests, zero failures) and in the normal Vitest suite.
- Final machine verification on the clean candidate: `repo-harness run verify-contract --strict` passed 22/22 criteria; `pnpm test` passed 56 files / 498 tests; `pnpm compile`, `pnpm build`, `pnpm docs:build`, `pnpm release:artifacts`, `pnpm release:check`, and `git diff --check` all passed.
- Final release hashes: GitHub ZIP `003d46ca9fc5ded3b5a6137d4967e81c785fb4545c4c4641c693e3a175dae389`; Chrome Web Store ZIP `ada319b402553286ea8dd3e610cbe61e0ba77c33c5d61ba2f0507e831e500215`; source ZIP `dfc9af389d5b142081a02663c481a647649c175f035ad5048640e79936afb068`. `unzip -t` passed for all three. The GitHub manifest retains key-derived ID `oeonghgdkdbhojfdjoaegbapbnjfdemm`; the store manifest contains neither `key` nor `update_url`.
- Remote readback after artifact verification: public repository/default `main` remain unchanged at `83396931351ddf93637fb119c8582358533e8bf5`; archive tag object `7b7682c2714689c0e673066b269502a5ac9f7f75` and `v0.1.0` tag object `0e1ab74db4b2e1327dcc29dc7f338f97b0e2dd99` still dereference to that exact old main. Release `373128536` still has its original twelve assets/digests. Ruleset `21073410` remains active with update, deletion, and non-fast-forward prohibitions and no bypass actors.
- Repo tooling: CodeGraph indexed 216 source files and reports the project index up to date; `repo-harness doctor` passes all hard checks with one pre-existing user-level unmanaged Claude hook warning. Strict task-workflow checking passes. Agent tooling reports only user-level Waza drift/advisories, not a repository failure.
- Security/privacy evidence: no private key, real provider key, or unexpected personal email was found; only the configured GitHub noreply identity and reserved fixture domains appear. Largest tracked files are the two bundled Tesseract WASM JavaScript assets at about 3.95 MB, below the 10 MB review threshold. LICENSE, NOTICE, and THIRD_PARTY_NOTICES remain unchanged from the clean v0.1.1 root.
- Browser evidence: `.gstack/qa-reports/qa-report-mercury-translate-browser-2026-08-20.md` records the prior Chrome 151 full matrix and 24 inspected screenshots, including webpage, selection, dynamic/Shadow DOM, YouTube, PDF, OCR, cancel/retry, and local/network privacy. v0.1.2 provider behavior is additionally covered by local/mocked tests; final popup/settings live reload remains the explicit manual residual noted above.
- Independent local gatekeeper review at `3e01db9b55a8f29f5082cec20e9446ffa2466148` returned PASS after rerunning compile, 56 files / 498 tests, build, docs, release artifacts/readiness, diff, doctor, strict workflow, and strict read-only contract verification. It confirmed the provider/privacy/history/manifest boundaries and carried forward only the documented Chrome special-page, external Claude AcceptanceReceipt, user-level hook warning, and nonfatal docs imagemin residuals.

## Promotion Filter

Promote a candidate to `tasks/lessons.md`, `docs/researches/`, or harness asset files only when all three hold: hard to reverse, surprising without local context, and a real trade-off existed. If any one is missing, keep it in this notes file instead.

## Promotion Candidates

- Promote to `tasks/lessons.md` only after a repeated correction or failure pattern.
- Promote to `docs/researches/` only when it is durable repo knowledge with evidence.
- Promote to harness asset files only after verification across more than one task or fixture.
