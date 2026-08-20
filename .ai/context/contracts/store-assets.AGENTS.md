# Store Assets Agent Context

Keep this file focused on Chrome Web Store listing assets, privacy copy, and manual upload evidence.

<!-- BEGIN ARCHITECTURE CONTRACT -->
## Architecture Contract

- Functional block: `store-assets`
- Capability ID: `store-publishing`
- Matched prefix: `store-assets`
- Architecture domain: `release`
- Architecture capability: `store-publishing`
- Architecture module: `docs/architecture/modules/release/store-publishing.md`
- Last architecture event: 2026-08-20T00:40:00+08:00
- Last changed path: `store-assets`
- Severity: medium
- Change type: capability-config
- Module responsibility: Maintain original Mercury Chrome Web Store source assets, listing copy, manual upload instructions, and provenance notes.
- Entrypoints: `store-assets/chrome-web-store/README.md`, `store-assets/scripts/generate-chrome-web-store-assets.mjs`
- Allowed dependencies: Follow root `AGENTS.md`; generated PNGs must have tracked HTML/SVG/CSS or generator inputs.
- Forbidden dependencies: No paid services, store API credentials, copied store identity, telemetry, uploaded secrets, or remote executable code.
- Runtime path: `store-assets`
- LSP/tooling profile: `typescript-lsp`
- Verification: Build docs, generate/check asset dimensions, and run release readiness checks.
- Latest snapshot: `(none yet)`
- Semantic diagram source: `docs/architecture/modules/release/store-publishing.md`
- Pending architecture request: `(none)`

## Active Workstreams

- `tasks/workstreams/release/store-publishing/chrome-web-store-v0.1.1.md`

## Current Session Projection

- Durable progress lives under `tasks/workstreams/release/store-publishing`.
- `tasks/current.md` is the tracked derived status snapshot; it is not a live lock or task source.
- `tasks/todos.md` is the deferred-goal ledger; current execution slices stay in the active plan's `## Task Breakdown`.
<!-- END ARCHITECTURE CONTRACT -->
