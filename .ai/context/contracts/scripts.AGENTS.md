# Release Tooling Agent Context

Keep this file focused on repository-local release scripts and verification helpers.

<!-- BEGIN ARCHITECTURE CONTRACT -->
## Architecture Contract

- Functional block: `scripts`
- Capability ID: `release-tooling`
- Matched prefix: `scripts`
- Architecture domain: `release`
- Architecture capability: `release-tooling`
- Architecture module: `docs/architecture/modules/release/release-tooling.md`
- Last architecture event: 2026-08-20T00:40:00+08:00
- Last changed path: `scripts`
- Severity: medium
- Change type: capability-config
- Module responsibility: Build deterministic local release artifacts and run readiness checks for GitHub and Chrome Web Store packages.
- Entrypoints: `scripts/build-release-artifacts.mjs`, `scripts/check-release-readiness.mjs`
- Allowed dependencies: Follow root `AGENTS.md`; scripts may use local Node, WXT, zip/unzip, and Git.
- Forbidden dependencies: No Chrome Web Store API credentials, automated store upload, payment automation, telemetry, or remote executable code.
- Runtime path: `scripts`
- LSP/tooling profile: `typescript-lsp`
- Verification: `pnpm release:artifacts`, `pnpm release:check`, and ZIP integrity checks.
- Latest snapshot: `(none yet)`
- Semantic diagram source: `docs/architecture/modules/release/release-tooling.md`
- Pending architecture request: `(none)`

## Active Workstreams

- `tasks/workstreams/release/release-tooling/chrome-web-store-v0.1.1.md`

## Current Session Projection

- Durable progress lives under `tasks/workstreams/release/release-tooling`.
- `tasks/current.md` is the tracked derived status snapshot; it is not a live lock or task source.
- `tasks/todos.md` is the deferred-goal ledger; current execution slices stay in the active plan's `## Task Breakdown`.
<!-- END ARCHITECTURE CONTRACT -->
