---
version: 1
slug: "src-pages-monitoring-tsx"
primary_target: "src/pages/Monitoring.tsx"
related_targets: ["src/pages/MonitorDetail.tsx","src/pages/SeveritySettings.tsx","src/pages/ChooseReport.tsx","src/pages/SearchPage.tsx","src/components/CreateMonitorDialog.tsx"]
---

# pKYB flow (Choose report → Create monitor → Monitoring → Detail → Severity settings)

Scope: whole pKYB flow inside the established AsiaVerify Portal world (Figma frames are visual authority). Mode: Operate.
Audience/job: compliance analysts triaging registry changes across 1–1,000s of monitored companies.
User-confirmed: full flow; "Expiring soon" replaced by "Needs review"; restructure permitted (same brand, tokens, components).
Unresolved: KYB Basic credit price (shown as "xx credits", as in Figma); case board view; deletion permissions.

## Direction contract
THESIS: Triage before detail. Every screen answers "where should I look?" first; the Figma's three equal KPI cards, per-category rainbow badges and in-row Stop link are refused.
OWN-WORLD: AsiaVerify navy gradient header and sidebar, white content on #f7f8f8, deep green #0a6a4d primary, Noto Sans, 4px radii, hairline #e3e7ea borders; severity is the only status colour (High red, Medium amber, Low slate), category identity carried by green line icons.
STORY: Analyst sees how many companies need review and how severe, opens High first, reads the latest change on a company, downloads a fresh KYB Basic report or marks it reviewed; tunes severity in settings and sees colours change everywhere.
FIRST VIEWPORT: Monitoring — title + "New monitor" right; one triage band: left "Needs review" 44px count with High/Medium/Low chips and "Review High first"; right 26-week High-severity heatmap; tabs and the severity-sorted table below.
FORM: established-world extension, no concept seed (precise user-confirmed restructure). Signature interaction: severity mapping recolours table, feed, heatmaps and alerts live.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
