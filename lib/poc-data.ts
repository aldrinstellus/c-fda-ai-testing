export type StageId = "trigger" | "review" | "approve" | "reports";

export type ScenarioStatus = "Approved" | "Needs Revision" | "Rejected";

export type ScenarioDecision = {
  status: ScenarioStatus;
  comment: string;
};

export const workflowStages = [
  {
    id: "trigger",
    label: "Trigger",
    summary: "Ingest source documents, select feature scope, and start Agent 1.",
    owner: "Reviewer + Agent 1"
  },
  {
    id: "review",
    label: "Review & Edit",
    summary: "Inspect generated Gherkin, correct scenarios, and record reviewer decisions.",
    owner: "Reviewer"
  },
  {
    id: "approve",
    label: "Approve & Execute",
    summary: "Accept audit responsibility, send edited tests to Agent 2, and monitor execution.",
    owner: "Reviewer + Agent 2"
  },
  {
    id: "reports",
    label: "Reports",
    summary: "Evaluate pass rate, feature results, evidence, and immutable audit history.",
    owner: "Reviewer"
  }
] as const;

export const prdGuardrails = [
  {
    label: "Sequential gate",
    detail: "Agent 2 cannot run until generated tests are reviewed and approved."
  },
  {
    label: "FDA boundary",
    detail: "All source data, model calls, execution logs, and evidence remain inside FDA infrastructure."
  },
  {
    label: "Human accountability",
    detail: "Approval requires explicit audit responsibility before execution begins."
  },
  {
    label: "Traceable evidence",
    detail: "Every scenario maps back to requirements and produces logs, timestamps, and evidence."
  }
] as const;

export const stageAcceptance: Record<StageId, string[]> = {
  trigger: [
    "Upload multiple PDF, Markdown, export, Confluence, and HTML sources.",
    "Select or deselect parsed features before generation.",
    "Save optional reviewer instructions with the generation job.",
    "Disable generation until a source and feature scope exist."
  ],
  review: [
    "Group generated scenarios by feature and requirement.",
    "Show coverage, gaps, duplicate removal, and stale impacted tests.",
    "Persist inline Gherkin edits as the execution source.",
    "Require comments for Needs Revision or Rejected decisions."
  ],
  approve: [
    "Require at least one approved scenario before Agent 2 is available.",
    "Show approved count and estimated runtime before execution.",
    "Require audit responsibility confirmation.",
    "Expose live execution progress, retry indicators, logs, pause, and cancel controls."
  ],
  reports: [
    "Show pass/fail counts and pass rate against the 90 percent target.",
    "Show per-feature breakdown.",
    "Support full run package export.",
    "Provide searchable evidence and immutable audit trail drill-down."
  ]
};

export const sourceDocuments = [
  {
    name: "CDER_review_scope.doc",
    kind: "Confluence export",
    size: "142 KB",
    status: "Parsed",
    progress: 100,
    issues: 0
  },
  {
    name: "requirement_packet.zip",
    kind: "Structured source packet",
    size: "1.1 MB",
    status: "Parsed",
    progress: 100,
    issues: 0
  },
  {
    name: "AI_drug_review_PRD.pdf",
    kind: "PRD",
    size: "2.4 MB",
    status: "Indexed",
    progress: 100,
    issues: 1
  },
  {
    name: "HTML_help_articles",
    kind: "Help content",
    size: "628 KB",
    status: "Queued",
    progress: 36,
    issues: 0
  }
] as const;

export const featureCandidates = [
  {
    id: "feature-upload",
    title: "Multi-document requirement intake",
    source: "Source intake",
    risk: "Medium",
    selected: true
  },
  {
    id: "feature-scope",
    title: "Parsed feature selection and manual entry",
    source: "Feature scope",
    risk: "Medium",
    selected: true
  },
  {
    id: "feature-generation",
    title: "Agent 1 Gherkin generation with live progress",
    source: "Generation",
    risk: "High",
    selected: true
  },
  {
    id: "feature-review",
    title: "Grouped scenario review with traceability",
    source: "Review queue",
    risk: "High",
    selected: true
  },
  {
    id: "feature-editing",
    title: "Inline Gherkin editing and validation",
    source: "Scenario editor",
    risk: "High",
    selected: true
  },
  {
    id: "feature-gate",
    title: "Human approval gate before Agent 2",
    source: "Governance gate",
    risk: "Critical",
    selected: true
  },
  {
    id: "feature-execution",
    title: "Live Agent 2 execution and self-healing",
    source: "Execution",
    risk: "High",
    selected: true
  },
  {
    id: "feature-evidence",
    title: "Evidence and immutable audit trail",
    source: "Evidence vault",
    risk: "Critical",
    selected: true
  }
] as const;

export const generatedScenarios = [
  {
    id: "SCN-001",
    feature: "Document intake",
    requirement: "REQ-INTAKE",
    title: "Upload supported requirement sources",
    coverage: "Covered",
    impact: "New",
    stale: false,
    confidence: 96,
    gherkin:
      "Feature: Document intake\n\nScenario: Upload supported requirement sources\n  Given a reviewer is on the Trigger stage\n  When they upload PDF, structured exports, Confluence, Markdown, and HTML sources\n  Then each supported source is accepted\n  And the file list shows name, size, progress, and remove actions\n  And the upload event is retained inside FDA infrastructure"
  },
  {
    id: "SCN-014",
    feature: "Gherkin generation",
    requirement: "REQ-GEN",
    title: "Start Agent 1 only after scope is ready",
    coverage: "Covered",
    impact: "Changed",
    stale: false,
    confidence: 93,
    gherkin:
      "Feature: Agent 1 generation\n\nScenario: Start generation after intake prerequisites\n  Given at least one source document is parsed\n  And at least one feature is selected\n  When the reviewer selects Generate Gherkin Test Cases\n  Then Agent 1 starts a generation job\n  And live status, ETA, and logs are displayed\n  And the session ID is stored for audit review"
  },
  {
    id: "SCN-021",
    feature: "Review and edit",
    requirement: "REQ-REVIEW",
    title: "Persist edited Gherkin as execution source",
    coverage: "Covered",
    impact: "Changed",
    stale: false,
    confidence: 91,
    gherkin:
      "Feature: Inline scenario editing\n\nScenario: Use edited scenario for execution\n  Given a generated scenario is displayed in review\n  When the reviewer edits the Given When Then steps\n  Then validation runs in real time\n  And the edited session copy is saved\n  And Agent 2 receives the edited version after approval"
  },
  {
    id: "SCN-028",
    feature: "Approval governance",
    requirement: "REQ-GATE",
    title: "Block Agent 2 until explicit approval",
    coverage: "Covered",
    impact: "New",
    stale: false,
    confidence: 98,
    gherkin:
      "Feature: Approval gate\n\nScenario: Reviewer accepts audit responsibility\n  Given one or more scenarios are approved\n  When the reviewer opens Approve and Execute\n  And confirms the audit responsibility statement\n  Then Agent 2 receives the approved edited package\n  And execution starts only inside FDA infrastructure"
  },
  {
    id: "SCN-036",
    feature: "Evidence package",
    requirement: "REQ-EVIDENCE",
    title: "Open immutable evidence trail",
    coverage: "Gap flagged",
    impact: "Existing",
    stale: true,
    confidence: 79,
    gherkin:
      "Feature: Evidence drill-down\n\nScenario: Inspect evidence for a failed case\n  Given a completed Agent 2 run has evidence records\n  When the reviewer opens a failed result\n  Then the evidence panel shows actions, screenshots, logs, timestamps, and runtime\n  And the audit trail shows model ID, token count, human decisions, and timestamps"
  }
] as const;

export const liveExecutions = [
  {
    name: "Document intake suite",
    state: "Passed",
    progress: 100,
    detail: "7 of 7 complete",
    tone: "good"
  },
  {
    name: "Review and edit suite",
    state: "Running",
    progress: 76,
    detail: "Retry 1 self-healed",
    tone: "warn"
  },
  {
    name: "Approval governance suite",
    state: "Queued",
    progress: 42,
    detail: "Waiting for runner slot",
    tone: "info"
  },
  {
    name: "Evidence export suite",
    state: "Watching",
    progress: 22,
    detail: "Screenshots streaming",
    tone: "info"
  }
] as const;

export const runBreakdown = [
  {
    feature: "Document intake",
    passed: 7,
    failed: 0,
    rate: 100,
    evidence: "Complete",
    owner: "Agent 1"
  },
  {
    feature: "Review and edit",
    passed: 8,
    failed: 1,
    rate: 89,
    evidence: "Needs reviewer note",
    owner: "Human gate"
  },
  {
    feature: "Approval governance",
    passed: 4,
    failed: 0,
    rate: 100,
    evidence: "Complete",
    owner: "Reviewer"
  },
  {
    feature: "Agent 2 execution",
    passed: 6,
    failed: 1,
    rate: 86,
    evidence: "Self-heal recorded",
    owner: "Agent 2"
  }
] as const;

export const auditEvents = [
  "10:53:36 Source packet attached to run FDA-RUN-009",
  "10:55:23 Agent 1 parsed upload requirements",
  "10:56:18 Generation job FDA-GEN-042 started",
  "10:56:33 Coverage analysis reached 84 percent",
  "10:56:49 Reviewer edited SCN-021 local session copy",
  "10:57:04 Scenario SCN-036 marked Needs Revision",
  "10:57:35 Reviewer accepted audit responsibility",
  "10:57:52 Agent 2 execution began inside FDA infrastructure",
  "10:58:16 Self-healing locator recovery applied",
  "10:58:30 Evidence package exported for run FDA-RUN-009"
] as const;
