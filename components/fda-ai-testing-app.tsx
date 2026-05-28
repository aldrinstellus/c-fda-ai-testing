"use client";

import {
  Activity,
  AlertTriangle,
  Archive,
  Ban,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
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
  Layers3,
  LockKeyhole,
  LogOut,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Trash2,
  UploadCloud,
  UserRound,
  XCircle
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import {
  auditEvents,
  featureCandidates,
  generatedScenarios,
  liveExecutions,
  prdGuardrails,
  runBreakdown,
  sourceDocuments,
  stageAcceptance,
  workflowStages,
  type ScenarioDecision,
  type ScenarioStatus,
  type StageId
} from "@/lib/poc-data";

type Toast = {
  id: number;
  tone: "success" | "error" | "info";
  text: string;
};

const stageIcons: Record<StageId, LucideIcon> = {
  trigger: UploadCloud,
  review: ClipboardCheck,
  approve: ShieldCheck,
  reports: BarChart3
};

const defaultManualFeature = "Reviewer-facing evidence export for failed Agent 2 steps.";
const defaultContext =
  "Prioritize explicit approval governance, stale test impact, trace links, and audit-ready evidence capture.";
const supportedSourceExtensions = [".pdf", ".md", ".markdown", ".zip", ".html", ".htm", ".doc", ".docx", ".txt"];

const scenarioStatusOptions: ScenarioStatus[] = ["Approved", "Needs Revision", "Rejected"];

function cls(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

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

export function FdaAiTestingApp() {
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [sessionMenuOpen, setSessionMenuOpen] = useState(false);
  const [activeStage, setActiveStage] = useState<StageId>("trigger");
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(
    () => new Set(featureCandidates.filter((feature) => feature.selected).map((feature) => feature.id))
  );
  const [stagedDocumentNames, setStagedDocumentNames] = useState<Set<string>>(
    () => new Set(sourceDocuments.map((document) => document.name))
  );
  const [manualFeature, setManualFeature] = useState(defaultManualFeature);
  const [context, setContext] = useState(defaultContext);
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
  const activeStageConfig = workflowStages.find((stage) => stage.id === activeStage) ?? workflowStages[0];
  const stagedDocuments = sourceDocuments.filter((document) => stagedDocumentNames.has(document.name));
  const selectedFeatureCount = selectedFeatures.size;
  const approvedCount = Object.values(decisions).filter((decision) => decision.status === "Approved").length;
  const blockedDecisionCount = Object.values(decisions).filter((decision) => decision.status !== "Approved").length;
  const commentMissingCount = Object.values(decisions).filter(
    (decision) => decision.status !== "Approved" && decision.comment.trim().length === 0
  ).length;
  const canGenerate = selectedFeatureCount > 0 && stagedDocuments.some((document) => document.progress > 0);
  const canExecute = approvedCount > 0 && commentMissingCount === 0 && approvalChecked;
  const coverage = 84;
  const passRate = 91;
  const activeStageIndex = workflowStages.findIndex((stage) => stage.id === activeStage);

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

  function resetRunSession() {
    setActiveStage("trigger");
    setSelectedFeatures(new Set(featureCandidates.filter((feature) => feature.selected).map((feature) => feature.id)));
    setStagedDocumentNames(new Set(sourceDocuments.map((document) => document.name)));
    setManualFeature(defaultManualFeature);
    setContext(defaultContext);
    setAgentOneStarted(false);
    setIsGenerating(false);
    setSelectedScenarioId(generatedScenarios[0].id);
    setScenarioDrafts(Object.fromEntries(generatedScenarios.map((scenario) => [scenario.id, scenario.gherkin])));
    setDecisions(getInitialDecisions());
    setApprovalChecked(false);
    setExecutionStarted(false);
    setExecutionPaused(false);
    setEvidenceTab("evidence");
    setSelectedEvidence("SCN-036");
    setAuditSearch("");
  }

  function signOut() {
    setSessionMenuOpen(false);
    resetRunSession();
    setIsSignedIn(false);
    addToast("info", "Reviewer session cleared.");
  }

  function signIn() {
    resetRunSession();
    setIsSignedIn(true);
    addToast("success", "Reviewer session started inside FDA workspace.");
  }

  function handleSourceSelection(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    const unsupportedFile = Array.from(files).find((file) => {
      const lowerName = file.name.toLowerCase();
      return !supportedSourceExtensions.some((extension) => lowerName.endsWith(extension));
    });

    if (unsupportedFile) {
      addToast("error", `${unsupportedFile.name} is not a supported source format.`);
      return;
    }

    setStagedDocumentNames(new Set(sourceDocuments.map((document) => document.name)));
    addToast("success", "Selected files staged for parsing.");
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
      addToast("success", "21 Gherkin scenarios generated and ready for human review.");
    }, 900);
  }

  function isStageAvailable(stageId: StageId) {
    if (stageId === "trigger") {
      return true;
    }
    if (stageId === "review") {
      return agentOneStarted;
    }
    if (stageId === "approve") {
      return agentOneStarted && approvedCount > 0;
    }
    return executionStarted;
  }

  function openStage(stageId: StageId) {
    if (!isStageAvailable(stageId)) {
      addToast("error", "This workflow step is locked until its prerequisites are complete.");
      return;
    }
    setActiveStage(stageId);
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

  function bulkApprove() {
    setDecisions((current) =>
      Object.fromEntries(
        Object.entries(current).map(([id, decision]) => [
          id,
          {
            ...decision,
            status: "Approved",
            comment: ""
          }
        ])
      )
    );
    addToast("success", "Visible generated scenarios marked approved for the review session.");
  }

  function resetScenarioDraft() {
    setScenarioDrafts((current) => ({
      ...current,
      [selectedScenario.id]: selectedScenario.gherkin
    }));
    addToast("info", `${selectedScenario.id} restored to Agent 1 output.`);
  }

  function confirmExecution() {
    if (!canExecute) {
      addToast("error", "Complete approval responsibility and all required reviewer comments.");
      return;
    }
    setExecutionStarted(true);
    setExecutionPaused(false);
    addToast("success", "Agent 2 execution started with the approved edited package.");
  }

  function renderStageRail() {
    return (
      <aside className="runRail" aria-label="Workflow context">
        <section className="railBlock runCard">
          <span className="eyebrow">Current run</span>
          <strong>{executionStarted ? "Agent 2 active" : agentOneStarted ? "Ready for approval" : "Source setup"}</strong>
          <p>
            {executionStarted
              ? "Approved scenarios are executing with evidence capture enabled."
              : agentOneStarted
                ? "Generated tests are ready for human review and governance."
                : "Prepare documents and feature scope before Agent 1 starts."}
          </p>
          <div className="runStats">
            <span>
              <b>{coverage}%</b>
              Coverage
            </span>
            <span>
              <b>{passRate}%</b>
              Pass rate
            </span>
          </div>
        </section>

        <section className="railBlock">
          <span className="eyebrow">PRD guardrails</span>
          <div className="guardrailList">
            {prdGuardrails.map((guardrail) => (
              <div className="guardrailItem" key={guardrail.label}>
                <CheckCircle2 size={16} />
                <div>
                  <strong>{guardrail.label}</strong>
                  <span>{guardrail.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="railBlock">
          <span className="eyebrow">Stage acceptance</span>
          <ol className="acceptanceList">
            {stageAcceptance[activeStage].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>
      </aside>
    );
  }

  function renderTrigger() {
    return (
      <div className="triggerScreen">
        <section className="workPanel sourcePanel">
          <div className="panelHeading">
            <div>
              <span className="eyebrow">1. Source package</span>
              <h3>Ingest controlled requirements</h3>
            </div>
            <div className="panelHeadingActions">
              <button
                className="textButton"
                type="button"
                disabled={stagedDocuments.length === 0}
                onClick={() => {
                  setStagedDocumentNames(new Set());
                  addToast("info", "Source list cleared for this session.");
                }}
              >
                Clear all
              </button>
              <span className="secureBadge">
                <LockKeyhole size={14} />
                FDA network only
              </span>
            </div>
          </div>

          <div
            className="dropZone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              setStagedDocumentNames(new Set(sourceDocuments.map((document) => document.name)));
              addToast("success", "Source package staged for Agent 1 parsing.");
            }}
          >
            <UploadCloud size={30} />
            <div>
              <strong>Drop requirement sources</strong>
              <span>PDF PRDs, Markdown, structured exports, Confluence pages, and HTML help articles.</span>
            </div>
            <label className="secondaryButton fileButton">
              <FolderOpen size={16} />
              Browse
              <input
                className="fileInput"
                type="file"
                multiple
                onChange={(event) => handleSourceSelection(event.currentTarget.files)}
              />
            </label>
          </div>

          <div className="documentList">
            {stagedDocuments.length === 0 && (
              <div className="emptySourceState">
                <FileText size={18} />
                <div>
                  <strong>No source files staged</strong>
                  <span>Upload a supported source package before Agent 1 can generate tests.</span>
                </div>
              </div>
            )}
            {stagedDocuments.map((document) => (
              <div className="documentRow" key={document.name}>
                <FileText size={18} />
                <div>
                  <strong>{document.name}</strong>
                  <span>
                    {document.kind} / {document.size}
                  </span>
                  <div className="progressTrack" aria-label={`${document.name} ${document.progress}% parsed`}>
                    <i style={{ width: `${document.progress}%` }} />
                  </div>
                </div>
                <em className={cls("statusChip", document.status === "Parsed" || document.status === "Indexed" ? "good" : "neutral")}>
                  {document.status}
                </em>
                <button
                  className="iconButton"
                  type="button"
                  aria-label={`Remove ${document.name}`}
                  onClick={() => {
                    setStagedDocumentNames((current) => {
                      const next = new Set(current);
                      next.delete(document.name);
                      return next;
                    });
                    addToast("info", `${document.name} removed from this source package.`);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="workPanel scopePanel">
          <div className="panelHeading">
            <div>
              <span className="eyebrow">2. Feature scope</span>
              <h3>{selectedFeatureCount} selected for generation</h3>
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
                Deselect all
              </button>
            </div>
          </div>

          <div className="searchBox" aria-label="Feature search placeholder">
            <Search size={16} />
            <span>Search parsed features</span>
          </div>

          <div className="featureList">
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

          <label className="fieldStack">
            Manual feature entry
            <textarea value={manualFeature} onChange={(event) => setManualFeature(event.target.value)} />
          </label>
        </section>

        <section className="generationDock">
          <div>
            <span className="eyebrow">3. Generation job</span>
            <h3>Agent 1 preflight</h3>
            <p>Grammar validation, dedupe, coverage analysis, version tracking, and stale test impact detection are enabled.</p>
          </div>
          <label className="fieldStack contextField">
            Additional Context / Instructions (optional)
            <textarea value={context} onChange={(event) => setContext(event.target.value)} />
          </label>
          <div className="consoleBlock">
            <div>
              <TerminalSquare size={17} />
              Gemini adapter ready
            </div>
            {isGenerating ? (
              <span>
                <RefreshCw className="spin" size={15} />
                Generating scenarios, coverage map, and requirement links...
              </span>
            ) : (
              <span>Waiting for reviewer to start the generation job.</span>
            )}
          </div>
          <button className="primaryButton" type="button" disabled={!canGenerate || isGenerating} onClick={startGeneration}>
            {isGenerating ? <RefreshCw className="spin" size={17} /> : <Sparkles size={17} />}
            Generate Gherkin Test Cases
          </button>
        </section>
      </div>
    );
  }

  function renderReview() {
    const currentDecision = decisions[selectedScenario.id];
    const hasEdits = scenarioDrafts[selectedScenario.id] !== selectedScenario.gherkin;

    return (
      <div className="reviewScreen">
        <section className="reviewSummary">
          <div>
            <span className="eyebrow">Agent 1 output</span>
            <h3>Coverage and quality review</h3>
          </div>
          <div className="summaryPills">
            <span>
              <b>{coverage}%</b>
              coverage
            </span>
            <span>
              <b>3</b>
              duplicates removed
            </span>
            <span className="warn">
              <b>2</b>
              gaps flagged
            </span>
            <span>
              <b>4</b>
              impacted tests
            </span>
          </div>
        </section>

        <section className="scenarioNavigator">
          <div className="panelHeading">
            <div>
              <span className="eyebrow">Scenario queue</span>
              <h3>Grouped by feature</h3>
            </div>
            <button className="secondaryButton" type="button" onClick={bulkApprove}>
              <CheckCircle2 size={16} />
              Bulk approve
            </button>
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
                <span>
                  <strong>{scenario.title}</strong>
                  <em>
                    {scenario.feature} / {scenario.requirement}
                  </em>
                </span>
                <small className={scenario.coverage === "Covered" ? "goodText" : "warnText"}>{scenario.coverage}</small>
                {scenario.stale && <small className="staleBadge">Stale</small>}
              </button>
            ))}
          </div>
        </section>

        <section className="scenarioEditor">
          <div className="panelHeading">
            <div>
              <span className="eyebrow">
                {selectedScenario.requirement} / confidence {selectedScenario.confidence}%
              </span>
              <h3>{selectedScenario.title}</h3>
            </div>
            <button className="secondaryButton" type="button" disabled={!hasEdits} onClick={resetScenarioDraft}>
              <RotateCcw size={16} />
              Undo
            </button>
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
            <aside className="validationPanel">
              <span>
                <CheckCircle2 size={16} />
                Valid Gherkin syntax
              </span>
              <span>
                <FileCheck2 size={16} />
                Session copy saved
              </span>
              <span>
                <Layers3 size={16} />
                Edited version will be packaged for Agent 2
              </span>
            </aside>
          </div>

          <div className="diffPanel">
            <div>
              <span className="eyebrow">Original</span>
              <p>{selectedScenario.gherkin.split("\n").slice(-2).join(" ")}</p>
            </div>
            <div>
              <span className="eyebrow">Current session copy</span>
              <p>{scenarioDrafts[selectedScenario.id].split("\n").slice(-2).join(" ")}</p>
            </div>
          </div>

          <div className="decisionPanel">
            <div>
              <span className="eyebrow">Decision</span>
              <div className="decisionButtons" role="group" aria-label="Scenario decision">
                {scenarioStatusOptions.map((option) => (
                  <button
                    className={cls("decisionButton", currentDecision.status === option && "selected")}
                    key={option}
                    type="button"
                    onClick={() => updateDecisionStatus(selectedScenario.id, option)}
                  >
                    {option === "Approved" && <CheckCircle2 size={15} />}
                    {option === "Needs Revision" && <AlertTriangle size={15} />}
                    {option === "Rejected" && <XCircle size={15} />}
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <label className="fieldStack">
              Reviewer comment {currentDecision.status !== "Approved" && <b>required</b>}
              <input
                value={currentDecision.comment}
                onChange={(event) => updateDecisionComment(selectedScenario.id, event.target.value)}
                placeholder="Add rationale for revision or rejection"
              />
            </label>
          </div>
        </section>

        <aside className="readinessPanel">
          <span className="eyebrow">Approval readiness</span>
          <strong>{approvedCount} approved scenarios</strong>
          <p>{blockedDecisionCount} scenarios are held for revision or rejection. Comment gaps: {commentMissingCount}.</p>
          <button className="primaryButton" type="button" disabled={approvedCount === 0} onClick={() => setActiveStage("approve")}>
            <ShieldCheck size={17} />
            Continue to approval gate
          </button>
        </aside>
      </div>
    );
  }

  function renderApprove() {
    return (
      <div className="approvalScreen">
        <section className="approvalGate">
          <div className="panelHeading">
            <div>
              <span className="eyebrow">Human approval gate</span>
              <h3>Approve edited package before Agent 2</h3>
            </div>
            <span className={cls("statusChip", canExecute ? "good" : "neutral")}>{canExecute ? "Ready" : "Requires confirmation"}</span>
          </div>

          <div className="gateMetrics">
            <span>
              <b>{approvedCount}</b>
              approved tests
            </span>
            <span>
              <b>14m</b>
              estimated runtime
            </span>
            <span>
              <b>100%</b>
              audit capture
            </span>
          </div>

          <div className="packageChecklist">
            <div>
              <CheckCircle2 size={17} />
              Edited Gherkin session copies selected for packaging
            </div>
            <div>
              <CheckCircle2 size={17} />
              Comments complete for non-approved scenarios
            </div>
            <div>
              <LockKeyhole size={17} />
              Execution target restricted to FDA infrastructure
            </div>
          </div>

          <label className="auditCheck">
            <input type="checkbox" checked={approvalChecked} onChange={(event) => setApprovalChecked(event.target.checked)} />
            <span>I confirm these tests are ready and accept full audit responsibility for this Agent 2 run.</span>
          </label>

          <div className="actionRow">
            <button className="primaryButton" type="button" disabled={!canExecute || executionStarted} onClick={confirmExecution}>
              <Play size={17} />
              Confirm and start Agent 2
            </button>
            <button className="secondaryButton" type="button" onClick={() => addToast("info", "Approval package retained as a draft.")}>
              <Archive size={16} />
              Save draft
            </button>
          </div>
        </section>

        <section className={cls("executionBoard", !executionStarted && "locked")}>
          <div className="panelHeading">
            <div>
              <span className="eyebrow">Live execution</span>
              <h3>{executionStarted ? "Agent 2 is executing approved scenarios" : "Execution starts after approval"}</h3>
            </div>
            <div className="buttonCluster">
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
              <button className="secondaryButton danger" type="button" disabled={!executionStarted}>
                <Ban size={16} />
                Cancel
              </button>
            </div>
          </div>

          <div className="executionList">
            {liveExecutions.map((execution) => (
              <div className="executionRow" key={execution.name}>
                <Activity size={18} />
                <div>
                  <strong>{execution.name}</strong>
                  <span>{executionStarted ? execution.detail : "Waiting for approval package"}</span>
                  <div className="progressTrack">
                    <i className={execution.tone} style={{ width: `${executionStarted ? execution.progress : 0}%` }} />
                  </div>
                </div>
                <em className={executionStarted ? execution.tone : ""}>{executionStarted ? execution.state : "Locked"}</em>
              </div>
            ))}
          </div>

          <div className="logStream" aria-label="Live execution log">
            <span>10:57:52 Agent 2 runner initialized</span>
            <span>10:58:02 Browser action captured</span>
            <span>10:58:16 Locator changed, self-healing applied</span>
            <span>10:58:30 Evidence artifact written to run package</span>
          </div>

          <button className="primaryButton" type="button" disabled={!executionStarted} onClick={() => setActiveStage("reports")}>
            <BarChart3 size={17} />
            Open run report
          </button>
        </section>
      </div>
    );
  }

  function renderReports() {
    return (
      <div className="reportsScreen">
        <section className="reportSummary">
          <div className="panelHeading">
            <div>
              <span className="eyebrow">Run report</span>
              <h3>Run success metrics</h3>
            </div>
            <button className="secondaryButton" type="button" onClick={() => addToast("success", "Full run package export prepared.")}>
              <Download size={16} />
              Export package
            </button>
          </div>

          <div className="reportMetrics">
            <span>
              <b>21</b>
              passed
            </span>
            <span>
              <b>2</b>
              failed
            </span>
            <span className="met">
              <b>{passRate}%</b>
              pass-rate target met
            </span>
            <span>
              <b>{coverage}%</b>
              coverage
            </span>
          </div>

          <div className="resultTable">
            <div className="resultHeader">
              <span>Feature</span>
              <span>Result</span>
              <span>Evidence</span>
              <span>Owner</span>
            </div>
            {runBreakdown.map((run) => (
              <button className="resultRow" key={run.feature} type="button" onClick={() => setSelectedEvidence("SCN-036")}>
                <span>{run.feature}</span>
                <span>
                  {run.passed} passed / {run.failed} failed / {run.rate}%
                </span>
                <span>{run.evidence}</span>
                <span>{run.owner}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="evidencePanel">
          <div className="panelHeading">
            <div>
              <span className="eyebrow">Evidence drill-down</span>
              <h3>{selectedEvidence} evidence and audit trail</h3>
            </div>
            <span className="secureBadge">
              <Eye size={14} />
              Read-only
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

          <label className="searchBox strong">
            <Search size={16} />
            <input
              value={auditSearch}
              onChange={(event) => setAuditSearch(event.target.value)}
              placeholder="Search actions, logs, model ID, decisions"
              aria-label="Search evidence and audit trail"
            />
          </label>

          {evidenceTab === "evidence" ? (
            <div className="evidenceObjects">
              <div>
                <FileCheck2 size={19} />
                <strong>Screenshot bundle</strong>
                <span>4 images / timestamped / immutable</span>
              </div>
              <div>
                <TerminalSquare size={19} />
                <strong>Execution logs</strong>
                <span>Actions, assertions, retries, self-healing</span>
              </div>
              <div>
                <Gauge size={19} />
                <strong>Runtime metrics</strong>
                <span>02:18 duration / 1 retry / 0 external calls</span>
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
        </section>
      </div>
    );
  }

  function renderActiveStage() {
    if (activeStage === "trigger") {
      return renderTrigger();
    }
    if (activeStage === "review") {
      return renderReview();
    }
    if (activeStage === "approve") {
      return renderApprove();
    }
    return renderReports();
  }

  if (!isSignedIn) {
    return (
      <main className="appShell signedOutShell">
        <div className="govBanner">
          <span className="flagMark">US</span>
          <span>Controlled FDA/CDER review environment. Sign in to access the governed testing workspace.</span>
        </div>

        <header className="appHeader authHeader">
          <div className="brandBlock">
            <img
              className="fdaMark"
              src="/gov-fda-new-white.svg"
              alt="U.S. Food and Drug Administration"
              width={545}
              height={114}
            />
            <span className="brandDivider" aria-hidden="true" />
            <div className="brandCopy">
              <h1>AI Agentic Testing</h1>
              <p>Center for Drug Evaluation and Research</p>
            </div>
          </div>
          <span className="boundaryPill">
            <ShieldCheck size={15} />
            FDA workspace
          </span>
        </header>

        <section className="loginShell" aria-labelledby="login-title">
          <div className="loginPanel">
            <span className="loginIcon">
              <UserRound size={24} />
            </span>
            <span className="eyebrow">Reviewer access</span>
            <h2 id="login-title">Sign in to continue</h2>
            <p>Mocked session entry for the governed FDA/CDER review workspace. Signing in starts a clean run session.</p>
            <button className="primaryButton" type="button" onClick={signIn}>
              <UserRound size={17} />
              Sign in as reviewer
            </button>
          </div>
        </section>

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

  return (
    <main className="appShell">
      <div className="govBanner">
        <span className="flagMark">US</span>
        <span>Controlled FDA/CDER review environment. Demo data and agent activity remain inside the workspace boundary.</span>
      </div>

      <header className="appHeader">
        <div className="brandBlock">
          <img
            className="fdaMark"
            src="/gov-fda-new-white.svg"
            alt="U.S. Food and Drug Administration"
            width={545}
            height={114}
          />
          <span className="brandDivider" aria-hidden="true" />
          <div className="brandCopy">
            <h1>AI Agentic Testing</h1>
            <p>Center for Drug Evaluation and Research</p>
          </div>
        </div>

        <div className="headerMeta">
          <span className="boundaryPill">
            <ShieldCheck size={15} />
            FDA workspace
          </span>
          <div className="sessionMenuWrap">
            <button
              className="sessionBlock"
              type="button"
              aria-haspopup="menu"
              aria-expanded={sessionMenuOpen}
              onClick={() => setSessionMenuOpen((current) => !current)}
            >
              <span>AD</span>
              <div>
                <strong>Reviewer</strong>
                <em>FDA-RUN-009</em>
              </div>
              <ChevronDown className={cls("sessionChevron", sessionMenuOpen && "open")} size={14} />
            </button>
            {sessionMenuOpen && (
              <div className="sessionMenu" role="menu" aria-label="Reviewer menu">
                <div className="sessionMenuHeader">
                  <strong>Aldrin Dharmapuri</strong>
                  <span>Reviewer / FDA-RUN-009</span>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setSessionMenuOpen(false);
                    addToast("info", "Reviewer settings are mocked for this app run.");
                  }}
                >
                  <Settings size={15} />
                  Settings
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setSessionMenuOpen(false);
                    addToast("info", "Session details retained inside FDA workspace.");
                  }}
                >
                  <UserRound size={15} />
                  Session details
                </button>
                <button className="dangerMenuItem" type="button" role="menuitem" onClick={signOut}>
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="workflowBar" aria-label="Workflow">
        {workflowStages.map((stage, index) => {
          const Icon = stageIcons[stage.id];
          const isActive = stage.id === activeStage;
          const isDone = index < activeStageIndex || (stage.id === "approve" && executionStarted);
          const isAvailable = isStageAvailable(stage.id);

          return (
            <button
              className={cls("workflowStep", isActive && "active", isDone && "done", !isAvailable && "locked")}
              key={stage.id}
              type="button"
              title={isAvailable ? stage.summary : "Complete the previous workflow requirement first"}
              onClick={() => openStage(stage.id)}
            >
              <span className="stepNumber">{isDone ? <Check size={15} /> : <Icon size={16} />}</span>
              <span>
                <strong>{stage.label}</strong>
                <em>{stage.owner}</em>
              </span>
              {index < workflowStages.length - 1 && <ChevronRight className="stepArrow" size={16} />}
            </button>
          );
        })}
      </nav>

      <div className="productShell">
        {renderStageRail()}

        <section className="stageCanvas" aria-labelledby="stage-title">
          <div className="stageIntro">
            <div>
              <span className="eyebrow">Operational workflow</span>
              <h2 id="stage-title">{activeStageConfig.label}</h2>
              <p>{activeStageConfig.summary}</p>
            </div>
            <div className="stageStatus">
              <span>
                <CheckCircle2 size={15} />
                Gemini adapter ready
              </span>
              <span>
                <Clock3 size={15} />
                Last source sync 10:58
              </span>
            </div>
          </div>

          {renderActiveStage()}
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
