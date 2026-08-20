# Deferred Goal Ledger

> **Status**: Backlog
> **Updated**: 2026-08-20 12:17
> **Scope**: Medium/long-term goals deferred from active plan execution

Current plan tasks live in the active plan's `## Task Breakdown`.
Do not duplicate that execution checklist here. Record only work intentionally deferred beyond this slice, with the tradeoff and revisit trigger.

## Deferred Goals

| Goal | Why Deferred | Tradeoff | Revisit Trigger |
|------|--------------|----------|-----------------|
| Clean-profile Chrome 151+ and live Unlisted-link validation | The unpacked distribution passed active-profile browser QA, but no reviewed CWS item exists and the keyless store ZIP was not installed in a separate clean profile. | Active-profile testing cannot prove store-assigned ID, dashboard installation, or Chrome-managed update behavior. | After the owner manually uploads the keyless ZIP and Chrome Web Store approves the item. |
| Chrome Web Store API v2 automation | v0.1.1 deliberately avoids service accounts, credentials, and operational complexity. | Upload and submission remain manual owner actions. | Only under a separate approved contract after the manual release process is stable. |
| Restore repo-harness review base to `main` | The pre-cutover clean-history candidate has no merge base with the old default branch, so strict review is temporarily bound to the immutable clean root. | Future reviews would otherwise compare against the v0.1.1 clean root instead of the current default branch. | Immediately after the separately confirmed Mercury-history `main` cutover; commit the policy restoration and rerun subject-bound verification before any tag or Release. |
