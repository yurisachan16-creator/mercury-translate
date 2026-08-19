# Extension Assets Agent Context

Keep this file focused on the local contract for packaged extension assets.

<!-- BEGIN ARCHITECTURE CONTRACT -->
## Architecture Contract

- Functional block: `public`
- Capability ID: `extension-assets`
- Matched prefix: `public`
- Architecture domain: `assets`
- Architecture capability: `extension-assets`
- Architecture module: `docs/architecture/modules/assets/extension-assets.md`
- Last architecture event: 2026-08-19T13:18:29.713Z
- Last changed path: `public`
- Severity: medium
- Change type: capability-config
- Module responsibility: Keep packaged extension assets aligned with the release and licensing contract.
- Entrypoints: `public`
- Allowed dependencies: Follow root `AGENTS.md` and this local contract.
- Forbidden dependencies: Do not put agent instructions, secrets, build output, or unlicensed artifacts in the packaged asset tree.
- Runtime path: `public`
- LSP/tooling profile: `typescript-lsp`
- Verification: `pnpm build` and inspect the built extension file list.
- Latest snapshot: `(none yet)`
- Semantic diagram source: `docs/architecture/modules/assets/extension-assets.md`
- Pending architecture request: `(none)`

## Active Workstreams

- (none yet)

## Current Session Projection

- Durable progress lives under `tasks/workstreams/assets/extension-assets`.
- `tasks/current.md` is the tracked derived status snapshot; it is not a live lock or task source.
- `tasks/todos.md` is the deferred-goal ledger; current execution slices stay in the active plan's `## Task Breakdown`.
<!-- END ARCHITECTURE CONTRACT -->
