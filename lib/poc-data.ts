export type StageId = "trigger" | "review" | "approve" | "reports";

export type ScenarioStatus = "Approved" | "Needs Revision" | "Rejected";

export type ScenarioDecision = {
  status: ScenarioStatus;
  comment: string;
};

export const jiraStories = [
  ["K1-1", "0.1", "Header & Branding", "Foundation"],
  ["K1-2", "0.2", "Workflow Navigation", "Foundation"],
  ["K1-3", "0.3", "Global Notifications & Loading", "Foundation"],
  ["K1-4", "1.1", "Document Upload", "Trigger"],
  ["K1-5", "1.2", "Feature Selection", "Trigger"],
  ["K1-6", "1.3", "Optional Context", "Trigger"],
  ["K1-7", "1.4", "Start Generation", "Trigger"],
  ["K1-8", "2.1", "View Generated Tests", "Review"],
  ["K1-9", "2.2", "Inline Editing", "Review"],
  ["K1-10", "2.3", "Approve / Reject Scenarios", "Review"],
  ["K1-11", "3.1", "Approval Gate", "Approval"],
  ["K1-12", "4.1", "Live Execution View", "Execution"],
  ["K1-13", "5.1", "Results Summary", "Reports"],
  ["K1-14", "5.2", "Evidence & Audit Trail Drill-Down", "Reports"]
] as const;

export const sourceDocuments = [
  {
    name: "CDER_POC_scope.doc",
    kind: "Confluence export",
    size: "142 KB",
    status: "Parsed",
    progress: 100
  },
  {
    name: "K1_story_exports.zip",
    kind: "Jira PDF bundle",
    size: "1.1 MB",
    status: "Parsed",
    progress: 100
  },
  {
    name: "AI_drug_review_PRD.pdf",
    kind: "PRD",
    size: "2.4 MB",
    status: "Indexing",
    progress: 78
  },
  {
    name: "HTML_help_articles",
    kind: "Help content",
    size: "628 KB",
    status: "Queued",
    progress: 32
  }
] as const;

export const featureCandidates = [
  {
    id: "feature-upload",
    title: "Multi-document requirement intake",
    source: "K1-4",
    risk: "Medium",
    selected: true
  },
  {
    id: "feature-scope",
    title: "Parsed feature selection and manual entry",
    source: "K1-5",
    risk: "Medium",
    selected: true
  },
  {
    id: "feature-generation",
    title: "Agent 1 Gherkin generation with live progress",
    source: "K1-7",
    risk: "High",
    selected: true
  },
  {
    id: "feature-review",
    title: "Grouped scenario review with traceability",
    source: "K1-8",
    risk: "High",
    selected: true
  },
  {
    id: "feature-editing",
    title: "Inline Gherkin editing and validation",
    source: "K1-9",
    risk: "High",
    selected: true
  },
  {
    id: "feature-gate",
    title: "Human approval gate before Agent 2",
    source: "K1-11",
    risk: "Critical",
    selected: true
  },
  {
    id: "feature-execution",
    title: "Live Agent 2 execution and self-healing",
    source: "K1-12",
    risk: "High",
    selected: true
  },
  {
    id: "feature-evidence",
    title: "Evidence and immutable audit trail",
    source: "K1-14",
    risk: "Critical",
    selected: true
  }
] as const;

export const generatedScenarios = [
  {
    id: "SCN-001",
    feature: "Document intake",
    requirement: "K1-4",
    title: "Upload supported requirement sources",
    coverage: "Covered",
    impact: "New",
    stale: false,
    confidence: 96,
    gherkin:
      "Feature: Document intake\\n\\nScenario: Upload supported requirement sources\\n  Given a reviewer is on the Trigger stage\\n  When they upload PDF, Jira, Confluence, Markdown, and HTML sources\\n  Then each supported source is accepted\\n  And the file list shows name, size, progress, and remove actions\\n  And the upload event is retained inside FDA infrastructure"
  },
  {
    id: "SCN-014",
    feature: "Gherkin generation",
    requirement: "K1-7",
    title: "Start Agent 1 only after scope is ready",
    coverage: "Covered",
    impact: "Changed",
    stale: false,
    confidence: 93,
    gherkin:
      "Feature: Agent 1 generation\\n\\nScenario: Start generation after intake prerequisites\\n  Given at least one source document is parsed\\n  And at least one feature is selected\\n  When the reviewer selects Generate Gherkin Test Cases\\n  Then Agent 1 starts a generation job\\n  And live status, ETA, and logs are displayed\\n  And the session ID is stored for audit review"
  },
  {
    id: "SCN-021",
    feature: "Review and edit",
    requirement: "K1-9",
    title: "Persist edited Gherkin as execution source",
    coverage: "Covered",
    impact: "Changed",
    stale: false,
    confidence: 91,
    gherkin:
      "Feature: Inline scenario editing\\n\\nScenario: Use edited scenario for execution\\n  Given a generated scenario is displayed in review\\n  When the reviewer edits the Given When Then steps\\n  Then validation runs in real time\\n  And the edited session copy is saved\\n  And Agent 2 receives the edited version after approval"
  },
  {
    id: "SCN-028",
    feature: "Approval governance",
    requirement: "K1-11",
    title: "Block Agent 2 until explicit approval",
    coverage: "Covered",
    impact: "New",
    stale: false,
    confidence: 98,
    gherkin:
      "Feature: Approval gate\\n\\nScenario: Reviewer accepts audit responsibility\\n  Given one or more scenarios are approved\\n  When the reviewer opens Approve and Execute\\n  And confirms the audit responsibility statement\\n  Then Agent 2 receives the approved edited package\\n  And execution starts only inside FDA infrastructure"
  },
  {
    id: "SCN-036",
    feature: "Evidence package",
    requirement: "K1-14",
    title: "Open immutable evidence trail",
    coverage: "Gap flagged",
    impact: "Existing",
    stale: true,
    confidence: 79,
    gherkin:
      "Feature: Evidence drill-down\\n\\nScenario: Inspect evidence for a failed case\\n  Given a completed Agent 2 run has evidence records\\n  When the reviewer opens a failed result\\n  Then the evidence panel shows actions, screenshots, logs, timestamps, and runtime\\n  And the audit trail shows model ID, token count, human decisions, and timestamps"
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
  "10:53:36 K1 PDF bundle attached to source package",
  "10:55:23 Agent 1 parsed document upload requirements",
  "10:56:18 Generation job K1-GEN-042 started",
  "10:56:33 Coverage analysis reached 84 percent",
  "10:56:49 Reviewer edited SCN-021 local session copy",
  "10:57:04 Scenario SCN-036 marked Needs Revision",
  "10:57:35 Reviewer accepted audit responsibility",
  "10:57:52 Agent 2 execution began inside FDA infrastructure",
  "10:58:16 Self-healing locator recovery applied",
  "10:58:30 Evidence package exported for run K1-RUN-009"
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
