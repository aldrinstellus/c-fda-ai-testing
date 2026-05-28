"use client";

import {
  Activity,
  AlertTriangle,
  Archive,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  ClipboardCheck,
  Clock3,
  Download,
  Edit3,
  Eye,
  FileCheck2,
  FileText,
  FolderOpen,
  Gauge,
  History,
  LockKeyhole,
  Pause,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Trash2,
  UploadCloud,
  X,
  XCircle
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import {
  auditEvents,
  featureCandidates,
  generatedScenarios,
  liveExecutions,
  runBreakdown,
  sourceDocuments,
  workspaceSections,
  type ScenarioDecision,
  type ScenarioStatus,
  type StageId
} from "@/lib/poc-data";

type StageConfig = {
  id: StageId;
  label: string;
  short: string;
  icon: LucideIcon;
};

type Toast = {
  id: number;
  tone: "success" | "error" | "info";
  text: string;
};

const stages: StageConfig[] = [
  { id: "trigger", label: "Trigger", short: "Trigger", icon: UploadCloud },
  { id: "review", label: "Review & Edit", short: "Review", icon: ClipboardCheck },
  { id: "approve", label: "Approve & Execute", short: "Approve", icon: ShieldCheck },
  { id: "reports", label: "Reports", short: "Reports", icon: BarChart3 }
];

const scenarioStatusOptions: ScenarioStatus[] = ["Approved", "Needs Revision", "Rejected"];

function getInitialDecisions(): Record<string, ScenarioDecision> {
  return Object.fromEntries(
    generatedScenarios.map((scenario, index) => [
      scenario.id,
      {
        status: index < 4 ? "Approved" : "Needs Revision",
        comment: index < 4 ? "" : "Needs timestamp assertion before execution package."
      }
    ])
  );
}

function cls(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function FdaAiTestingApp() {
  const [activeStage, setActiveStage] = useState<StageId>("trigger");
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(
    () => new Set(featureCandidates.filter((feature) => feature.selected).map((feature) => feature.id))
  );
  const [context, setContext] = useState(
    "Focus on evidence capture, stale test impact, explicit approval governance, and audit-ready Gherkin."
  );
  const [agentOneStarted, setAgentOneStarted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(generatedScenarios[0].id);
  const [scenarioDrafts, setScenarioDrafts] = useState<Record<string, string>>(
    () => Object.fromEntries(generatedScenarios.map((scenario) => [scenario.id, scenario.gherkin]))
  );
  const [decisions, setDecisions] = useState<Record<string, ScenarioDecision>>(getInitialDecisions);
  const [approvalChecked, setApprovalChecked] = useState(false);
  const [executionStarted, setExecutionStarted] = useState(false);
  const [executionPaused, setExecutionPaused] = useState(false);
  const [evidenceTab, setEvidenceTab] = useState<"evidence" | "audit">("evidence");
  const [selectedEvidence, setSelectedEvidence] = useState<string>("SCN-036");
  const [auditSearch, setAuditSearch] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const selectedScenario =
    generatedScenarios.find((scenario) => scenario.id === selectedScenarioId) ?? generatedScenarios[0];

  const selectedFeatureCount = selectedFeatures.size;
  const approvedCount = Object.values(decisions).filter((decision) => decision.status === "Approved").length;
  const commentMissingCount = Object.values(decisions).filter(
    (decision) => decision.status !== "Approved" && decision.comment.trim().length === 0
  ).length;
  const canGenerate = selectedFeatureCount > 0 && sourceDocuments.some((document) => document.progress > 0);
  const canExecute = approvedCount > 0 && commentMissingCount === 0 && approvalChecked;
  const coverage = 84;
  const passRate = 91;

  const filteredAuditEvents = useMemo(() => {
    const query = auditSearch.trim().toLowerCase();
    if (!query) {
      return auditEvents;
    }

    return auditEvents.filter((event) => event.toLowerCase().includes(query));
  }, [auditSearch]);

  function addToast(tone: Toast["tone"], text: string) {
    const id = Date.now();
    setToasts((current) => [...current.slice(-2), { id, tone, text }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }

  function toggleFeature(featureId: string) {
    setSelectedFeatures((current) => {
      const next = new Set(current);
      if (next.has(featureId)) {
        next.delete(featureId);
      } else {
        next.add(featureId);
      }
      return next;
    });
  }

  function startGeneration() {
    if (!canGenerate) {
      addToast("error", "Upload at least one supported source and select a feature.");
      return;
    }

    setAgentOneStarted(true);
    setIsGenerating(true);
    addToast("info", "Agent 1 generation started inside FDA infrastructure.");
    window.setTimeout(() => {
      setIsGenerating(false);
      setActiveStage("review");
      addToast("success", "21 Gherkin scenarios generated and ready for review.");
    }, 900);
  }

  function updateDecisionStatus(scenarioId: string, status: ScenarioStatus) {
    setDecisions((current) => ({
      ...current,
      [scenarioId]: {
        ...current[scenarioId],
        status
      }
    }));
  }

  function updateDecisionComment(scenarioId: string, comment: string) {
    setDecisions((current) => ({
      ...current,
      [scenarioId]: {
        ...current[scenarioId],
        comment
      }
    }));
  }

  function isStageAvailable(stageId: StageId) {
    if (stageId === "trigger") {
      return true;
    }
    if (stageId === "review") {
      return agentOneStarted;
    }
    if (stageId === "approve") {
      return approvedCount > 0;
    }
    return executionStarted;
  }

  function openStage(stageId: StageId) {
    if (!isStageAvailable(stageId)) {
      addToast("error", "This workflow step is locked until prerequisites are met.");
      return;
    }
    setActiveStage(stageId);
  }

  function confirmExecution() {
    if (!canExecute) {
      addToast("error", "Complete approval responsibility and required reviewer comments.");
      return;
    }
    setExecutionStarted(true);
    setExecutionPaused(false);
    addToast("success", "Agent 2 execution started with approved edited scenarios.");
  }

  function renderTrigger() {
    return (
      <section className="stageGrid">
        <div className="panel intakePanel">
          <div className="panelHeader">
            <div>
              <span className="eyebrow">Source intake</span>
              <h2>Trigger Agent 1 from controlled source material</h2>
            </div>
            <span className="sourcePill">
              <LockKeyhole size={14} />
              FDA network only
            </span>
          </div>

          <div
            className="dropZone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              addToast("success", "Source package staged for Agent 1 parsing.");
            }}
          >
            <UploadCloud size={34} />
            <div>
              <h3>Drop requirement sources</h3>
              <p>PDF PRDs, Markdown, structured exports, Confluence pages, and HTML help articles.</p>
            </div>
            <label className="secondaryButton fileButton">
              <FolderOpen size={16} />
              Browse files
              <input
                className="fileInput"
                type="file"
                multiple
                onChange={() => addToast("success", "Selected files staged for parsing.")}
              />
            </label>
          </div>

          <div className="documentList">
            {sourceDocuments.map((document) => (
              <div className="documentRow" key={document.name}>
                <FileText size={18} />
                <div className="documentMeta">
                  <strong>{document.name}</strong>
                  <span>
                    {document.kind} / {document.size}
                  </span>
                  <div className="progressTrack">
                    <span style={{ width: `${document.progress}%` }} />
                  </div>
                </div>
                <span className={cls("statusChip", document.status === "Parsed" && "good")}>{document.status}</span>
                <button className="iconButton" type="button" aria-label={`Remove ${document.name}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="contextArea">
            <label htmlFor="context">Additional Context / Instructions (optional)</label>
            <textarea id="context" value={context} onChange={(event) => setContext(event.target.value)} />
          </div>
        </div>

        <aside className="panel scopePanel">
          <div className="panelHeader compact">
            <div>
              <span className="eyebrow">Feature scope</span>
              <h2>{selectedFeatureCount} selected</h2>
            </div>
            <div className="buttonCluster">
              <button
                className="textButton"
                type="button"
                onClick={() => setSelectedFeatures(new Set(featureCandidates.map((feature) => feature.id)))}
              >
                Select all
              </button>
              <button className="textButton" type="button" onClick={() => setSelectedFeatures(new Set())}>
                Clear
              </button>
            </div>
          </div>

          <div className="searchBox">
            <Search size={16} />
            <span>Search parsed features</span>
          </div>

          <div className="featureStack">
            {featureCandidates.map((feature) => (
              <button
                className={cls("featureChoice", selectedFeatures.has(feature.id) && "selected")}
                key={feature.id}
                type="button"
                onClick={() => toggleFeature(feature.id)}
              >
                <span className="checkBox">{selectedFeatures.has(feature.id) && <Check size={13} />}</span>
                <span>
                  <strong>{feature.title}</strong>
                  <em>
                    {feature.source} / {feature.risk}
                  </em>
                </span>
              </button>
            ))}
          </div>

          <div className="agentConsole">
            <div className="consoleTitle">
              <TerminalSquare size={16} />
              Agent 1 preflight
            </div>
            <p>Gemini Enterprise @ FDA adapter ready. Grammar validation, dedupe, and coverage scoring enabled.</p>
            {isGenerating && (
              <div className="liveLine">
                <CircleDashed size={15} />
                Generating scenarios, trace links, and stale test flags...
              </div>
            )}
          </div>

          <button className="primaryButton wide" type="button" disabled={!canGenerate || isGenerating} onClick={startGeneration}>
            {isGenerating ? <RefreshCw className="spin" size={17} /> : <Sparkles size={17} />}
            Generate Gherkin Test Cases
          </button>
        </aside>
      </section>
    );
  }

  function renderReview() {
    const currentDecision = decisions[selectedScenario.id];

    return (
      <section className="reviewGrid">
        <div className="panel scenarioTablePanel">
          <div className="panelHeader">
            <div>
              <span className="eyebrow">Review workbench</span>
              <h2>Generated tests with traceability and human decisions</h2>
            </div>
            <div className="metricBadge">
              <strong>{coverage}%</strong>
              <span>coverage</span>
            </div>
          </div>

          <div className="qualityStrip">
            <span className="qualityItem good">
              <CheckCircle2 size={15} />
              3 duplicates removed
            </span>
            <span className="qualityItem warn">
              <AlertTriangle size={15} />2 gaps flagged
            </span>
            <span className="qualityItem info">
              <History size={15} />4 impacted tests
            </span>
          </div>

          <div className="scenarioList" role="list">
            {generatedScenarios.map((scenario) => (
              <button
                className={cls("scenarioRow", selectedScenario.id === scenario.id && "active")}
                key={scenario.id}
                type="button"
                onClick={() => setSelectedScenarioId(scenario.id)}
              >
                <span className="scenarioId">{scenario.id}</span>
                <span className="scenarioMain">
                  <strong>{scenario.title}</strong>
                  <em>
                    {scenario.feature} / {scenario.requirement} / confidence {scenario.confidence}%
                  </em>
                </span>
                <span className={cls("coveragePill", scenario.coverage === "Covered" ? "good" : "warn")}>
                  {scenario.coverage}
                </span>
                {scenario.stale && <span className="staleBadge">Stale</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="panel editorPanel">
          <div className="panelHeader">
            <div>
              <span className="eyebrow">{selectedScenario.requirement}</span>
              <h2>{selectedScenario.title}</h2>
            </div>
            <span className="sourcePill">
              <Edit3 size={14} />
              Session copy
            </span>
          </div>

          <div className="editorShell">
            <textarea
              aria-label="Gherkin scenario editor"
              className="gherkinEditor"
              value={scenarioDrafts[selectedScenario.id]}
              onChange={(event) =>
                setScenarioDrafts((current) => ({
                  ...current,
                  [selectedScenario.id]: event.target.value
                }))
              }
            />
            <div className="validationRail">
              <span className="validationGood">
                <CheckCircle2 size={16} />
                Valid Gherkin
              </span>
              <span>Saved locally for this review session.</span>
              <span>Edited text becomes Agent 2 source after approval.</span>
            </div>
          </div>

          <div className="decisionBar">
            <label>
              Scenario decision
              <select
                value={currentDecision.status}
                onChange={(event) => updateDecisionStatus(selectedScenario.id, event.target.value as ScenarioStatus)}
              >
                {scenarioStatusOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="commentField">
              Reviewer comment {currentDecision.status !== "Approved" && <span>required</span>}
              <input
                value={currentDecision.comment}
                onChange={(event) => updateDecisionComment(selectedScenario.id, event.target.value)}
                placeholder="Add rationale for revision or rejection"
              />
            </label>
          </div>
        </div>

        <aside className="panel approvalReadiness">
          <span className="eyebrow">Review readiness</span>
          <h2>{approvedCount} approved scenarios</h2>
          <p>
            Comment gaps: <strong>{commentMissingCount}</strong>. Approval package uses edited scenario text only.
          </p>
          <button className="primaryButton wide" type="button" disabled={approvedCount === 0} onClick={() => setActiveStage("approve")}>
            <ShieldCheck size={17} />
            Continue to approval gate
          </button>
        </aside>
      </section>
    );
  }

  function renderApprove() {
    return (
      <section className="approvalGrid">
        <div className="panel gatePanel">
          <div className="panelHeader">
            <div>
              <span className="eyebrow">Governed execution</span>
              <h2>Explicit human gate before Agent 2</h2>
            </div>
            <span className={cls("statusChip", canExecute && "good")}>{canExecute ? "Ready" : "Blocked"}</span>
          </div>

          <div className="gateSummary">
            <div>
              <strong>{approvedCount}</strong>
              <span>approved</span>
            </div>
            <div>
              <strong>14 min</strong>
              <span>runtime estimate</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>audit capture</span>
            </div>
          </div>

          <label className="auditCheck">
            <input type="checkbox" checked={approvalChecked} onChange={(event) => setApprovalChecked(event.target.checked)} />
            <span>
              I confirm these tests are ready and accept full audit responsibility. Execution runs entirely inside FDA infrastructure.
            </span>
          </label>

          <div className="gateActions">
            <button className="primaryButton" type="button" disabled={!canExecute} onClick={confirmExecution}>
              <Play size={17} />
              Confirm Agent 2 execution
            </button>
            <button
              className="secondaryButton"
              type="button"
              onClick={() => addToast("info", "Approval package retained as a draft.")}
            >
              <Archive size={16} />
              Save draft
            </button>
          </div>
        </div>

        <div className="panel executionPanel">
          <div className="panelHeader">
            <div>
              <span className="eyebrow">Live execution</span>
              <h2>{executionStarted ? "Agent 2 is running approved tests" : "Execution pending approval"}</h2>
            </div>
            <button
              className="secondaryButton"
              type="button"
              disabled={!executionStarted}
              onClick={() => {
                setExecutionPaused((current) => !current);
                addToast("info", executionPaused ? "Execution resumed." : "Execution paused for operator control.");
              }}
            >
              <Pause size={16} />
              {executionPaused ? "Resume" : "Pause"}
            </button>
          </div>

          <div className="executionStack">
            {liveExecutions.map((execution) => (
              <div className="executionRow" key={execution.name}>
                <Activity size={18} />
                <div>
                  <strong>{execution.name}</strong>
                  <span>{execution.detail}</span>
                  <div className="progressTrack">
                    <span className={execution.tone} style={{ width: `${executionStarted ? execution.progress : 0}%` }} />
                  </div>
                </div>
                <em className={execution.tone}>{executionStarted ? execution.state : "Locked"}</em>
              </div>
            ))}
          </div>

          <div className="logStream">
            <span>10:57:52 Agent 2 runner initialized</span>
            <span>10:58:02 Browser action captured</span>
            <span>10:58:16 Locator changed, self-healing applied</span>
            <span>10:58:30 Evidence artifact written to run package</span>
          </div>

          <button className="primaryButton wide" type="button" disabled={!executionStarted} onClick={() => setActiveStage("reports")}>
            <BarChart3 size={17} />
            Open reports
          </button>
        </div>
      </section>
    );
  }

  function renderReports() {
    return (
      <section className="reportsGrid">
        <div className="panel reportSummary">
          <div className="panelHeader">
            <div>
              <span className="eyebrow">Run report</span>
              <h2>Run summary</h2>
            </div>
            <button className="secondaryButton" type="button" onClick={() => addToast("success", "Full run package export prepared.")}>
              <Download size={16} />
              Export package
            </button>
          </div>

          <div className="summaryMetrics">
            <div>
              <strong>21</strong>
              <span>passed</span>
            </div>
            <div>
              <strong>2</strong>
              <span>failed</span>
            </div>
            <div className="met">
              <strong>{passRate}%</strong>
              <span>pass rate target met</span>
            </div>
            <div>
              <strong>84%</strong>
              <span>coverage</span>
            </div>
          </div>

          <div className="breakdownTable">
            <div className="tableHeader">
              <span>Feature</span>
              <span>Result</span>
              <span>Evidence</span>
              <span>Owner</span>
            </div>
            {runBreakdown.map((run) => (
              <button className="tableRow" key={run.feature} type="button" onClick={() => setSelectedEvidence("SCN-036")}>
                <span>{run.feature}</span>
                <span>
                  {run.passed} passed / {run.failed} failed / {run.rate}%
                </span>
                <span>{run.evidence}</span>
                <span>{run.owner}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel evidencePanel">
          <div className="panelHeader">
            <div>
              <span className="eyebrow">Evidence vault</span>
              <h2>Evidence and audit drill-down</h2>
            </div>
            <span className="sourcePill">
              <Eye size={14} />
              {selectedEvidence}
            </span>
          </div>

          <div className="segmentedControl" aria-label="Evidence tab selector">
            <button
              className={evidenceTab === "evidence" ? "active" : ""}
              type="button"
              onClick={() => setEvidenceTab("evidence")}
            >
              <FileCheck2 size={15} />
              Evidence
            </button>
            <button
              className={evidenceTab === "audit" ? "active" : ""}
              type="button"
              onClick={() => setEvidenceTab("audit")}
            >
              <History size={15} />
              Audit trail
            </button>
          </div>

          <div className="searchBox strong">
            <Search size={16} />
            <input
              value={auditSearch}
              onChange={(event) => setAuditSearch(event.target.value)}
              placeholder="Search actions, logs, model ID, decisions"
              aria-label="Search audit trail"
            />
          </div>

          {evidenceTab === "evidence" ? (
            <div className="evidenceObjects">
              <div>
                <span className="objectIcon">
                  <FileCheck2 size={18} />
                </span>
                <strong>Screenshot bundle</strong>
                <em>4 images / timestamped / immutable</em>
              </div>
              <div>
                <span className="objectIcon">
                  <TerminalSquare size={18} />
                </span>
                <strong>Execution logs</strong>
                <em>Actions, assertions, retries, self-healing</em>
              </div>
              <div>
                <span className="objectIcon">
                  <Gauge size={18} />
                </span>
                <strong>Runtime metrics</strong>
                <em>02:18 duration / 1 retry / 0 external calls</em>
              </div>
            </div>
          ) : (
            <div className="auditTimeline">
              {filteredAuditEvents.map((event) => (
                <div key={event}>
                  <span />
                  <p>{event}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <main className="appShell">
      <div className="govBanner">
        <span className="flagMark">US</span>
        <span>Controlled FDA/CDER review environment. All demo data and agent activity remains inside the workspace boundary.</span>
      </div>

      <header className="topBar">
        <div className="brandBlock">
          <img
            className="fdaMark"
            src="/gov-fda-new-white.svg"
            alt="U.S. Food and Drug Administration"
            width={545}
            height={114}
          />
          <div>
            <p>Center for Drug Evaluation and Research</p>
            <h1>AI Agentic Testing</h1>
          </div>
        </div>

        <nav className="workflowStepper" aria-label="Workflow">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const activeIndex = stages.findIndex((item) => item.id === activeStage);
            const isActive = stage.id === activeStage;
            const isDone = index < activeIndex || (stage.id === "approve" && executionStarted);
            const available = isStageAvailable(stage.id);

            return (
              <button
                className={cls("stepButton", isActive && "active", isDone && "done", !available && "locked")}
                key={stage.id}
                type="button"
                title={available ? stage.label : "Complete prerequisites before opening this stage"}
                onClick={() => openStage(stage.id)}
              >
                <span className="stepIcon">{isDone ? <Check size={14} /> : <Icon size={15} />}</span>
                <span>{stage.short}</span>
                {index < stages.length - 1 && <ChevronRight className="stepArrow" size={15} />}
              </button>
            );
          })}
        </nav>

        <div className="userBlock">
          <span>AD</span>
          <div>
            <strong>Reviewer</strong>
            <em>Run FDA-RUN-009</em>
          </div>
          <button className="iconButton inverse" type="button" aria-label="Log out" onClick={() => addToast("info", "Session cleared.")}>
            <X size={16} />
          </button>
        </div>
      </header>

      <div className="appBody">
        <aside className="leftRail">
          <div className="railPanel priority">
            <span className="eyebrow">Run status</span>
            <strong>Ready for review</strong>
            <p>Source intake, generation, approval, execution, and evidence export are ready for a governed review run.</p>
          </div>

          <div className="railPanel">
            <span className="eyebrow">Success criteria</span>
            <div className="miniMetric">
              <span>Coverage</span>
              <strong>{coverage}%</strong>
            </div>
            <div className="miniMetric">
              <span>Pass rate</span>
              <strong>{passRate}%</strong>
            </div>
            <div className="miniMetric">
              <span>Audit trail</span>
              <strong>100%</strong>
            </div>
          </div>

          <div className="railPanel storyRail">
            <span className="eyebrow">Workspace</span>
            {workspaceSections.map(([index, title, detail]) => (
              <div className="storyChip" key={index}>
                <span>{index}</span>
                <strong>{title}</strong>
                <em>{detail}</em>
              </div>
            ))}
          </div>
        </aside>

        <section className="workspace">
          <div className="workspaceHeader">
            <div>
              <span className="eyebrow">Operational console</span>
              <h2>{stages.find((stage) => stage.id === activeStage)?.label}</h2>
            </div>
            <div className="workspaceActions">
              <span className="sourcePill">
                <CheckCircle2 size={14} />
                Gemini adapter ready
              </span>
              <span className="sourcePill muted">
                <Clock3 size={14} />
                Last source sync 10:58
              </span>
            </div>
          </div>

          <div className="mapPanel">
            <img src="/pipeline-map.svg" alt="FDA AI testing workflow from source package to evidence report" />
          </div>

          {activeStage === "trigger" && renderTrigger()}
          {activeStage === "review" && renderReview()}
          {activeStage === "approve" && renderApprove()}
          {activeStage === "reports" && renderReports()}
        </section>
      </div>

      <div className="toastStack" aria-live="polite">
        {toasts.map((toast) => (
          <div className={cls("toast", toast.tone)} key={toast.id}>
            {toast.tone === "success" && <CheckCircle2 size={16} />}
            {toast.tone === "error" && <XCircle size={16} />}
            {toast.tone === "info" && <Activity size={16} />}
            <span>{toast.text}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
