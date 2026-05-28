import { expect, test, type Page } from "@playwright/test";

const realisticSourcePackage = [
  {
    name: "CDER_BLA_761999_review_scope.doc",
    mimeType: "application/msword",
    buffer: Buffer.from(
      [
        "CDER review scope",
        "Product: investigational oncology therapy BLA-761999",
        "Workflow controls: reviewer upload, feature scope, human approval, evidence export."
      ].join("\n")
    )
  },
  {
    name: "AI_agentic_testing_requirements.md",
    mimeType: "text/markdown",
    buffer: Buffer.from(
      [
        "# FDA AI Agentic Testing Requirements",
        "- Agent 1 generates Gherkin only after parsed source and selected feature scope.",
        "- Agent 2 executes only after reviewer approval and audit responsibility acknowledgement.",
        "- Evidence must include screenshots, execution logs, timestamps, model metadata, and reviewer decisions."
      ].join("\n")
    )
  },
  {
    name: "safety_labeling_evidence_packet.zip",
    mimeType: "application/zip",
    buffer: Buffer.from("PK\u0003\u0004dummy-evidence-packet-for-cder-agentic-testing")
  },
  {
    name: "cder_help_article_export.html",
    mimeType: "text/html",
    buffer: Buffer.from(
      "<!doctype html><title>CDER Help</title><main>Reviewer evidence drill-down and audit trail guidance.</main>"
    )
  }
];

async function openApp(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "AI Agentic Testing" })).toBeVisible();
}

async function startAgentOne(page: Page) {
  await page
    .getByLabel("Additional context (optional)")
    .fill("Prioritize IND amendment traceability, reviewer audit rationale, and 21 CFR Part 11 evidence readiness.");

  await page.getByRole("button", { name: /Generate scenarios/i }).click();
  await expect(page.getByText("Agent 1 generation started inside FDA infrastructure.")).toBeVisible();
  await expect(page.getByText("Generating scenarios, coverage map, and requirement links...")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Review & Edit" })).toBeVisible({ timeout: 5_000 });
}

test.describe("FDA AI Agentic Testing app", () => {
  test("covers header branding, workflow locks, reviewer menu, logout, and sign-in reset", async ({ page }) => {
    await openApp(page);

    await expect(page.getByAltText("U.S. Food and Drug Administration")).toBeVisible();
    await expect(page.getByText("Center for Drug Evaluation and Research")).toHaveCount(1);
    await expect(page.getByText("Controlled FDA/CDER review environment")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Workflow" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Jordan Lee/i })).toBeVisible();

    await page.getByRole("button", { name: /Reports/i }).click();
    await expect(page.getByText("This workflow step is locked until its prerequisites are complete.")).toBeVisible();

    await page.getByRole("button", { name: /Jordan Lee/i }).click();
    await expect(page.getByRole("menu", { name: "Reviewer menu" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Settings" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Session details" })).toBeVisible();

    await page.getByRole("menuitem", { name: "Logout" }).click();
    await expect(page.getByRole("heading", { name: "Sign in to continue" })).toBeVisible();
    await expect(page.getByText("Controlled FDA/CDER review environment. Sign in to access")).toBeVisible();

    await page.getByRole("button", { name: "Sign in as reviewer" }).click();
    await expect(page.getByRole("heading", { name: "Trigger" })).toBeVisible();
    await expect(page.getByText("Reviewer session started inside FDA workspace.")).toBeVisible();
  });

  test("validates realistic source intake, feature scope, optional context, and generation readiness", async ({ page }) => {
    await openApp(page);

    const generateButton = page.getByRole("button", { name: /Generate scenarios/i });
    await expect(generateButton).toBeEnabled();

    await page.getByRole("button", { name: "Clear all" }).click();
    await expect(page.getByText("No source files staged")).toBeVisible();
    await expect(generateButton).toBeDisabled();

    await page.locator('input[type="file"]').setInputFiles({
      name: "unvalidated_export.exe",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("not a supported controlled source")
    });
    await expect(page.getByText("unvalidated_export.exe is not a supported source format.")).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(realisticSourcePackage);
    await expect(page.getByText("Selected files staged for parsing.")).toBeVisible();
    await expect(page.getByText("4 staged sources")).toBeVisible();
    await expect(page.getByText("3 ready")).toBeVisible();

    await page.getByRole("button", { name: "Deselect all" }).click();
    await expect(page.getByRole("heading", { name: "0 selected for generation" })).toBeVisible();
    await expect(generateButton).toBeDisabled();

    await page.getByRole("button", { name: "Select all", exact: true }).click();
    await expect(page.getByRole("heading", { name: "8 selected for generation" })).toBeVisible();
    await expect(generateButton).toBeEnabled();

    await page
      .getByLabel("Manual feature entry")
      .fill("Validate cross-application review memo export for failed Agent 2 evidence packages.");
    await page
      .getByLabel("Additional context (optional)")
      .fill("Use BLA-761999 labeling review, IND amendment A-2026-17, and accountable reviewer trace links.");

    await expect(page.getByText("Launch readiness")).toBeVisible();
    await expect(page.getByLabel("Agent 1 preflight checks")).toContainText("Gherkin grammar validation");
    await expect(page.getByLabel("Agent 1 preflight checks")).toContainText("FDA workspace execution");
  });

  test("runs the full governed flow from Agent 1 generation through evidence and audit drill-down", async ({ page }) => {
    await openApp(page);
    await startAgentOne(page);

    await expect(page.getByRole("heading", { name: "Coverage and quality review" })).toBeVisible();
    await expect(page.locator(".reviewSummary").getByText("84%")).toBeVisible();
    await expect(page.getByText("gaps flagged")).toBeVisible();

    await page.locator(".scenarioRow").filter({ hasText: "SCN-036" }).click();
    await expect(page.getByRole("heading", { name: "Open immutable evidence trail" })).toBeVisible();

    const editor = page.getByLabel("Gherkin scenario editor");
    await editor.fill(
      [
        "Feature: Evidence drill-down",
        "",
        "Scenario: Inspect evidence for a failed CDER case",
        "  Given a completed Agent 2 run has immutable evidence records",
        "  When reviewer Jordan Lee opens failed case SCN-036 for BLA-761999",
        "  Then screenshots, logs, model ID, token count, and timestamps are visible",
        "  And the audit trail links IND amendment A-2026-17 to the reviewer decision"
      ].join("\n")
    );
    await expect(editor).toHaveValue(/IND amendment A-2026-17 to the reviewer decision/);
    await expect(page.locator(".diffPanel").getByText("IND amendment A-2026-17 to the reviewer decision")).toBeVisible();

    const decisionGroup = page.getByRole("group", { name: "Scenario decision" });
    await decisionGroup.getByRole("button", { name: "Rejected" }).click();
    await page.getByPlaceholder("Add rationale for revision or rejection").fill("");
    await expect(page.getByText("Comment gaps: 1.")).toBeVisible();
    await page
      .getByPlaceholder("Add rationale for revision or rejection")
      .fill("Rejected until screenshot timestamps and reviewer rationale are linked to IND amendment A-2026-17.");
    await expect(page.getByText("Comment gaps: 0.")).toBeVisible();

    await page.getByRole("button", { name: /Bulk approve/i }).click();
    await expect(page.getByText("Visible generated scenarios marked approved for the review session.")).toBeVisible();
    await expect(page.getByText("5 approved scenarios")).toBeVisible();

    await page.getByRole("button", { name: /Continue to approval gate/i }).click();
    await expect(page.getByRole("heading", { name: "Approve & Execute" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Approve edited package before Agent 2" })).toBeVisible();
    await expect(page.getByText("5", { exact: true }).first()).toBeVisible();

    const startAgentTwo = page.getByRole("button", { name: /Confirm and start Agent 2/i });
    await expect(startAgentTwo).toBeDisabled();
    await page.getByLabel(/I confirm these tests are ready/).check();
    await expect(startAgentTwo).toBeEnabled();

    await startAgentTwo.click();
    await expect(page.getByText("Agent 2 execution started with the approved edited package.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Agent 2 is executing approved scenarios" })).toBeVisible();
    await expect(page.getByText("Document intake suite")).toBeVisible();
    await expect(page.getByLabel("Live execution log")).toContainText("Locator changed, self-healing applied");

    await page.getByRole("button", { name: /^Pause$/i }).click();
    await expect(page.getByText("Execution paused for operator control.")).toBeVisible();
    await expect(page.getByRole("button", { name: /^Resume$/i })).toBeVisible();

    await page.getByRole("button", { name: /Open run report/i }).click();
    await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Run success metrics" })).toBeVisible();
    await expect(page.locator(".reportMetrics").getByText("21", { exact: true })).toBeVisible();
    await expect(page.locator(".reportMetrics").getByText("2", { exact: true })).toBeVisible();
    await expect(page.getByText("pass-rate target met")).toBeVisible();
    await expect(page.getByText("Document intake")).toBeVisible();

    await page.getByRole("button", { name: /Export package/i }).click();
    await expect(page.getByText("Full run package export prepared.")).toBeVisible();

    await page.getByRole("button", { name: /Audit trail/i }).click();
    await page.getByLabel("Search evidence and audit trail").fill("self-healing");
    await expect(page.getByText("10:58:16 Self-healing locator recovery applied")).toBeVisible();
    await expect(page.getByText("Agent 1 parsed upload requirements")).toBeHidden();
  });
});
