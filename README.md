# c-fda-ai-testing

FDA AI Agentic Testing app.

This is a production-grade interactive app for governed AI test generation, review, execution, and evidence inspection:

- Trigger: source upload, feature selection, optional context, Agent 1 generation
- Review & Edit: generated Gherkin grouped by feature, traceability, stale/impacted tests, inline edits, scenario decisions
- Approve & Execute: explicit human gate, audit responsibility, Agent 2 live execution, pause/cancel controls
- Reports: pass-rate summary, feature breakdown, evidence drill-down, immutable audit trail

## Workflow model

The PRD requires a strict sequence: Agent 1 generation, human review and edits, explicit approval, Agent 2 execution, then reporting. The app shell keeps the FDA header and stepper persistent, while the main workspace shows one active stage at a time with stage-specific acceptance checks.

## Jira story coverage

- Story 0.1 Header & Branding: FDA header, reviewer identity menu, mocked login/logout session reset, responsive workflow stepper
- Story 0.2 Workflow Navigation: locked/current/completed step states with prerequisite checks
- Story 0.3 Global Notifications & Loading: spinner, success/error/info toasts, FDA-boundary copy
- Story 1.1 Document Upload: multi-file input, drag/drop, file list, remove, clear all, progress, unsupported-format error
- Story 1.2 Feature Selection: searchable checkbox list, select all, deselect all, manual feature entry
- Story 1.3 Optional Context: saved additional instructions field
- Story 1.4 Start Generation: disabled prerequisite state, live progress, success navigation, retry-ready error toast
- Story 2.1 View Generated Tests: grouped scenario list, traceability, coverage, duplicate/gap/stale indicators
- Story 2.2 Inline Editing: editable Gherkin session copy, validation, undo, before/after diff
- Story 2.3 Approve / Reject Scenarios: bulk approve, decisions, required comments, approved package only
- Story 3.1 Approval Gate: approved-count summary, runtime estimate, FDA reminder, responsibility checkbox
- Story 4.1 Live Execution View: per-feature progress, retry/self-healing log, pause/cancel controls
- Story 5.1 Results Summary: pass/fail counts, pass-rate target, feature breakdown, export
- Story 5.2 Evidence & Audit Trail: read-only evidence objects, audit tab, search, exportable run package

## Commands

```bash
npm install
npm run dev
npm run build
npm run test:e2e
```

`npm run test:e2e` runs the Playwright suite across desktop and mobile Chrome with realistic dummy CDER source files, reviewer decisions, approval, execution, reports, and audit search.
