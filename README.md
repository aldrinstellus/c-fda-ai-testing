# c-fda-ai-testing

FDA AI Agentic Testing app.

This is a production-grade interactive app for governed AI test generation, review, execution, and evidence inspection:

- Trigger: source upload, feature selection, optional context, Agent 1 generation
- Review & Edit: generated Gherkin grouped by feature, traceability, stale/impacted tests, inline edits, scenario decisions
- Approve & Execute: explicit human gate, audit responsibility, Agent 2 live execution, pause/cancel controls
- Reports: pass-rate summary, feature breakdown, evidence drill-down, immutable audit trail

## Workflow model

The PRD requires a strict sequence: Agent 1 generation, human review and edits, explicit approval, Agent 2 execution, then reporting. The app shell keeps the FDA header and stepper persistent, while the main workspace shows one active stage at a time with stage-specific acceptance checks.

## Commands

```bash
npm install
npm run dev
npm run build
```
