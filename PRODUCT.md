# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + TypeScript, Vite, Tailwind CSS v4. This is the existing AsiaVerify Portal stack, so keep it. (The `pKYB` working folder holds no source code yet.)

## Users

Compliance and risk analysts at AsiaVerify Portal client organisations who review their business customers. Some monitor a single company; others, such as a payment gateway watching its merchant base, monitor hundreds or thousands. These analysts set severity levels, receive change notifications, and decide which changes need action. Business owners submitting their own documents are **not** an audience for this feature.

## Product Purpose

Perpetual KYB (pKYB) is ongoing monitoring of a company after its initial KYB check, so it is not a one-off pull. A client registers a company once and is told automatically when its registry information changes.

pKYB was API-only through Phase 1 (change detection) and Phase 2 (change categorisation). Phase 3, the current work, brings it into the AsiaVerify Portal as a first-class UI product. Clients can create, monitor and manage monitoring orders without building their own integration, order storage or UI.

Success means a client can see at a glance where their portfolio changed and how serious each change is. When a high-priority change appears, they download a fresh KYB Basic report to get the full picture.

## Positioning

pKYB is a layer above the KYB Basic report:
- **Baseline:** every pKYB monitor starts from a KYB Basic report on the company. The report is mandatory, and the UI must say so.
- **Change detection:** pKYB then flags later registry changes against that baseline, in 9 categories. Each category has a client-defined severity.
- **Severity is the client's call:** the API applies no server-side risk ranking, so the Portal gives clients severity tiers they define themselves.

Two positioning questions are **open, not decided**:
- **Region focus:** the demo company is a Shenzhen entity, but nothing limits the feature to one region.
- **AI-assisted review:** undecided.

## Operating Context

- **Entry points:**
  - The Choose A Report page (main entry): a Create Perpetual KYB monitor modal, then the pKYB details or baseline report.
  - KYB Search results: a "Create pKYB" action next to "View".
  - View Report (Lite/Basic/Complete): the same create action, or a link to the details page when a monitor is already running.
- **pKYB module:** its own sidebar section (marked "New") with Monitoring and Severity Settings pages.
- **Monitoring homepage:** the default view is a table of orders with a Search company filter. It also has summary counts (total monitors, critical changes, expiring soon) and tabs for active monitors, order history and change history, filterable by jurisdiction, status and category.
- **Company details page:** a 365-day activity heatmap and a change log for the company, plus Stop pKYB and Download KYB Report actions. The heatmap is the one place a contribution-graph-style visual fits, because it shows one real time series.
- **Severity & Notification Settings:** a severity tier for each category, plus notification preferences:
  - in-app alerts by severity
  - a weekly email digest by severity
  - a daily email digest by severity
- **Announcements:** a modal or prompt on login, and "NEW" tags.
- **Downstream action:** after a high-priority change, the client downloads a new KYB Basic report.
- **Other views:** an activity feed (reverse-chronological change events) and a case board (New / Reviewing / Actioned / No action needed) are in the requirements. The case board is an open question.

## Capabilities and Constraints

- **Change categories (fixed set of 9):** Identity, Address, BusinessActivity, Officers, Ownership, Capital, Status, AnnualReturn, Other. Use these names.
- **Severity tiers:** Low / Medium / High. The user sets one per category after setup.
  - **Default:** every category starts at Medium. The current designs override the requirements doc's suggested defaults (Status/Ownership high, and so on).
  - **Multi-category events:** an event can carry several categories. Its colour is always the worst severity in the set, however the individual categories are mapped.
  - **Where severity shows:** colour coding across the monitoring table, heatmap and activity feed.
- **Duration:** a monitor has no end date and runs until the user stops it. This replaces the 1–3 year terms in the earlier API phases.
  - **Open:** the designs still show "expiring soon" and "Ended". Check before designing any renewal or end-date surfaces.
- **Pricing:** 10 credits per company per year, plus the cost of the KYB Basic baseline report.
- **Order creation:**
  - one company at a time, reusing the existing KYB Search, with no new search paradigm
  - a confirmation step that shows the baseline company snapshot
  - jurisdiction-aware validation before submission (for example, HKG needs a CR number, not a BR number; some jurisdictions may not be supported)
- **Order statuses:** Active / Inactive / Ended / Deleted. Each needs a plain-language explanation in the UI:
  - Inactive means setup failed and can't be reactivated.
  - Deleted means the user removed it.
  - Deleted orders stay visible in history.
- **Stop or delete:**
  - Confirm before acting, for a single order or a multi-select bulk action.
  - Idempotent: deleting an already-deleted order still succeeds.
  - Deletion may become a permission-restricted action for team accounts. This is open.
- **Scale:** lists must handle thousands of rows with server-side pagination, search and filtering. Tables can be sorted by severity.
- **Cadence copy:** check timing varies by jurisdiction and is not guaranteed. Never imply a schedule.
  - Write "last checked" or "checks run automatically".
  - Never write "checks every N days" or show a countdown.
- **API/Portal parity:** the same order state shows in both channels.
- **Export:** CSV export of order history and the change log, for audit.

## Brand Commitments

- **Parent brand:** AsiaVerify. The product name is "Perpetual KYB (pKYB)" in the app header and "pKYB" in navigation.
- **Visual authority:** the existing Figma designs set the visual standard, and screens are built from them in code. Novel or bold screens are sketched in Figma first.
- **Product term:** the user-facing term is "monitor", as in "Create a Perpetual KYB Monitor" and "Stop monitoring".

## Evidence on Hand

- **Requirements doc:** `/Users/quynhchilai/Documents/AsiaVerify/High-level Requirements-061026-014204.pdf` (pKYB on Portal, 28 Sept 2026). It covers context, user stories, requirements and inspirations.
- **Figma flows**, shared as screenshots:
  - creating a monitor from the KYB page and from Search
  - the Monitoring list, empty and filtered states
  - the company details page with heatmap and stop-confirm
  - the View Report baseline
  - Severity & Notification Settings
- **Demo data only:** Shenzhen Tencent Computer System Co., Ltd; Fortune Link Group; Silver Pine Traders; and others. These are placeholders, not real client usage.
- **Must not be fabricated:** no testimonials, client logos, usage statistics or benchmarks exist.

## Product Principles

1. **Triage first.** Every view answers "where should I look?" before "what happened?". Severity and category beat raw detail.
2. **Built for portfolios.** Design for 1 to 1,000s of monitors. Nothing should depend on opening each company one by one.
3. **The client owns risk.** Severity is the client's model. Defaults are a starting point, never a verdict.
4. **Honest about state.** Use plain-language statuses and the baseline requirement. Never promise a check cadence.
5. **A path back to the report.** A change leads to action, which is a fresh KYB Basic report.
