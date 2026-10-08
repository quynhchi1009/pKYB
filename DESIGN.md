---
name: AsiaVerify Portal (pKYB)
description: The AsiaVerify Portal's navy-and-green compliance workspace, as used by Perpetual KYB monitoring.
colors:
  content-primary: "#1b1c1e"
  content-main: "#444444"
  content-disabled: "#5e5e5e"
  content-tertiary: "#6b6b6b"
  content-link: "#004d3f"
  content-on-negative-elevated: "#95231e"
  content-on-warning-elevated: "#9a6200"
  content-on-positive-elevated: "#397300"
  interactive-primary: "#00735f"
  interactive-accent: "#e5f1e8"
  interactive-accent-hover: "#d6e9da"
  interactive-selected: "#edf5ef"
  interactive-inverse: "#172636"
  interactive-secondary: "#626262"
  interactive-control: "#004d3f"
  interactive-contrast: "#009a7e"
  background-elevated: "#fdfdfd"
  background-demoted: "#292929"
  background-accent: "#f8f7f4"
  background-subtle: "#f1f1f1"
  background-system: "#111a24"
  background-scrim: "rgba(11, 16, 22, 0.55)"
  sentiment-negative: "#d14343"
  sentiment-negative-hover: "#a52b25"
  sentiment-positive: "#1b813d"
  sentiment-warning: "#ffaa52"
  sentiment-negative-elevated: "#ffefef"
  sentiment-positive-elevated: "#f6ffed"
  sentiment-warning-elevated: "#fff6e8"
  border-neutral: "#a5a5a5"
  border-subtle: "#e3e3e3"
  border-accent: "#8fcaa9"
  border-negative: "#f2c4c0"
  border-warning: "#efd7a3"
  base-light: "#ffffff"
  base-dark: "#1b1c1e"
  base-contrast: "#f8f8f8"
  navy-950: "#0b1016"
  navy-900: "#111a24"
  navy-800: "#172636"
  navy-700: "#1f3954"
  chrome-accent: "#2fbf87"
  chrome-content-main: "rgba(255, 255, 255, 0.85)"
  chrome-content-tertiary: "rgba(255, 255, 255, 0.7)"
  chrome-hover: "rgba(255, 255, 255, 0.05)"
  chrome-selected: "rgba(255, 255, 255, 0.07)"
  chrome-control-hover: "rgba(255, 255, 255, 0.1)"
  chrome-border: "rgba(255, 255, 255, 0.12)"
  chart-new: "#2f75b5"
  chart-reviewed: "#009a7e"
  high: "#95231e"
  high-bg: "#ffefef"
  high-line: "#f2c4c0"
  high-cell: "#d14343"
  medium: "#9a6200"
  medium-bg: "#fff6e8"
  medium-line: "#efd7a3"
  medium-cell: "#ffaa52"
  low: "#444444"
  low-bg: "#f1f1f1"
  low-line: "#d6d6d6"
  low-cell: "#a5a5a5"
typography:
  display:
    fontFamily: "Open Sans, Noto Sans SC, ui-sans-serif, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Roboto, Noto Sans SC, ui-sans-serif, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  lead-title:
    fontFamily: "Roboto, Noto Sans SC, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Roboto, Noto Sans SC, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.375
  heading:
    fontFamily: "Roboto, Noto Sans SC, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Open Sans, Noto Sans SC, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  body-dense:
    fontFamily: "Open Sans, Noto Sans SC, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Open Sans, Noto Sans SC, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.5
  micro:
    fontFamily: "Open Sans, Noto Sans SC, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  flag: "2px"
  control: "4px"
  panel: "6px"
  dialog: "8px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.interactive-primary}"
    textColor: "{colors.base-light}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.interactive-control}"
  button-primary-active:
    backgroundColor: "{colors.navy-800}"
  button-secondary:
    backgroundColor: "{colors.base-light}"
    textColor: "{colors.interactive-primary}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "36px"
  button-secondary-hover:
    backgroundColor: "{colors.interactive-accent}"
  button-ghost:
    textColor: "{colors.content-main}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "36px"
  button-ghost-hover:
    backgroundColor: "{colors.background-subtle}"
    textColor: "{colors.content-primary}"
  button-danger:
    backgroundColor: "{colors.high}"
    textColor: "{colors.base-light}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "36px"
  input:
    backgroundColor: "{colors.base-light}"
    textColor: "{colors.content-primary}"
    typography: "{typography.body-dense}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "36px"
  panel:
    backgroundColor: "{colors.base-light}"
    rounded: "{rounded.panel}"
    padding: "20px"
  dialog:
    backgroundColor: "{colors.base-light}"
    textColor: "{colors.content-primary}"
    rounded: "{rounded.dialog}"
    padding: "20px 24px"
  severity-pill-high:
    backgroundColor: "{colors.high-bg}"
    textColor: "{colors.high}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "24px"
  severity-pill-medium:
    backgroundColor: "{colors.medium-bg}"
    textColor: "{colors.medium}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "24px"
  severity-pill-low:
    backgroundColor: "{colors.low-bg}"
    textColor: "{colors.low}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "24px"
  category-chip:
    backgroundColor: "{colors.base-light}"
    textColor: "{colors.content-main}"
    rounded: "{rounded.control}"
    padding: "0 8px"
    height: "24px"
  tab-active:
    textColor: "{colors.content-primary}"
    typography: "{typography.body}"
    height: "44px"
  toast:
    backgroundColor: "{colors.navy-900}"
    textColor: "{colors.base-light}"
    rounded: "{rounded.panel}"
    padding: "12px 16px"
---

# Design System: AsiaVerify Portal (pKYB)

## Overview

**Creative North Star: "The Night Desk Ledger"**

This is the established AsiaVerify Portal, and pKYB runs inside it as a native module. Nothing about it was reinvented for pKYB. A dark navy gradient frames the workspace in the top bar and sidebar. Inside that frame the content sits on near-white base-contrast, in white panels with hairline borders. One deep green carries every committed action, and a three-step severity scale carries every status. The frame is calm and heavy, and the content is light and dense: the dark frame holds the room and the ledger inside does the work.

The density is analyst-grade. Body text is 14px, tables and secondary text are 13px, and meta text is 12px. Panels are flat, with no ambient shadow. Depth comes from the navy frame against the pale base-contrast and from two shadows reserved for things that float: menus, toasts, tooltips and dialogs. Colour is rationed. Green means "act or go here", red, amber and slate mean severity, and navy means "the system is speaking": selections, toasts, tooltips and the unreviewed marker.

Severity is the only status colour. The nine change categories are told apart by green line icons, never by hue, so whenever a user remaps severity in Severity Settings, the colour of every table row, chip dot, feed entry, heatmap and alert follows.

**Key Characteristics:**
- Navy gradient chrome (top bar and sidebar) around a light content area on base-contrast.
- A single green primary action per view, plus green outline and ghost buttons for everything else.
- Severity is a three-step scale (High red, Medium amber, Low slate). Each step has text, background, border and cell tints.
- Category identity is a green line icon inside a neutral chip.
- Hairline borders and small radii (4px controls, 6px panels), and flat surfaces at rest.
- Roboto for every heading (h1–h6), Open Sans for all other text, Noto Sans SC as the fallback for Chinese names in both, and tabular figures for every count and date.

## Colors

The palette is AsiaVerify's semantic colour sheet (content, interactive, background, sentiment, border, base), framed by the Portal's navy chrome. Token names in code mirror the sheet: `content.main` is `--color-content-main` and `text-content-main`. Three values are adjusted from the sheet to pass WCAG AA, and new tokens fill roles the sheet doesn't cover. The full reference, with hex, rgb, hsl and usage for every token, is `docs/color-tokens.md`, generated by `docs/tokens/build.py`.

### Interactive
- **Interactive Primary** (interactive-primary, #00735f): the one filled action per view, secondary-button outlines and text, the active tab underline, checkbox marks, the focus ring, focused input borders and the caret. White on it is 5.81:1.
- **Control** (interactive-control, #004d3f): the primary button's hover, and green text on interactive-accent fills (for example the active section in the report rail).
- **Link** (content-link, #004d3f): inline text links, underlined on hover.
- **Accent** (interactive-accent, with interactive-accent-hover, interactive-selected and border-accent): selected rows (interactive-selected), secondary-button hover, active filter rows, the pKYB promo panel header and the "New" tag. Accent-hover is the hover of accent fills and text selection.
- **Secondary** (interactive-secondary, #626262): the border of every input, select, textarea, checkbox-style toggle and unselected filter chip. Hover darkens it to content-main.
- **Chrome Accent** (chrome-accent): appears only on navy. It is used for the "Asia" in the logo, the active sub-nav marker, the notification count badge, the active pKYB nav icon and the toast check icon. interactive-contrast is not used here, because it is only 3.34:1 on navy-700.

### Chart
- **Chart pair** (chart-new #2f75b5, chart-reviewed = interactive-contrast #009a7e): the two series of a two-series chart, such as new vs reviewed in the queue trend. Validated for colour-vision deficiency and 3:1 on white. Tritanopia separation is in the floor band, so the pair always ships with a legend and a data table, never colour alone. Severity hues are never chart series.

### Portal chrome
- **Night Navy** (navy-700 → navy-900 → navy-950): the chrome gradient. The top bar runs 90deg and the sidebar 180deg, both from navy-700 through navy-900 at 55% to navy-950.
- **On navy** (chrome-content-main at 85% white, chrome-content-tertiary at 70%): secondary and inactive text on the shell. Primary text is base-light. Fills on navy are chrome-hover (sidebar row hover), chrome-selected (active row, raised cards) and chrome-control-hover (buttons); edges are chrome-border.
- **System** (background-system, navy-900): toasts, tooltips, the bulk-selection and unsaved-changes bars, the selected heatmap-cell stroke and the unreviewed dot. **Inverse** (interactive-inverse, navy-800) is the selected status filter chip and the pressed primary button. **Scrim** (background-scrim) sits behind dialogs and the mobile drawer.

### Severity
Severity is a product layer over the sentiment tokens:
- **High** (high, high-bg, high-line, high-cell): text is content-on-negative-elevated, the fill is sentiment-negative-elevated, the cell is sentiment-negative. Red also marks destructive actions: the danger button is sentiment-negative with white text, and its hover is sentiment-negative-hover.
- **Medium** (medium, medium-bg, medium-line, medium-cell): text is content-on-warning-elevated, the fill is sentiment-warning-elevated, the cell is sentiment-warning.
- **Low** (low, low-bg, low-line, low-cell): content-main on background-subtle, with a border-neutral cell. It is deliberately quiet, not green, so Low never reads as "good".
- Each step has four roles: `text` for the label, `bg` for the pill fill, `line` for pill and lead-card borders, and `cell` for dots, heatmap cells and legend swatches. Text always uses the on_*_elevated colour so it passes on the tinted pill and on white.

### Neutral
- **Content Primary** (content-primary): headings and primary text.
- **Content Main** (content-main): secondary text, table headers, panel labels, inactive tabs.
- **Content Tertiary** (content-tertiary): meta text, placeholder, icons at rest, heatmap axis labels.
- **Border Subtle** (border-subtle): every panel border, divider and table rule.
- **Border Neutral** (border-neutral): stronger static edges (the status panel, dashed section separators, status badges, the Required tag) and the scrollbar thumb.
- **Base Contrast** (base-contrast): page background, dialog footer, table row hover.
- **Background Subtle** (background-subtle): ghost and menu-item hover, inactive count badges, and the empty heatmap cell.
- **Background Overlay** (background-overlay): the 1px edge around flags.

### Named Rules
**The Severity Is the Only Status Colour Rule.** Red, amber and slate mean High, Medium and Low and nothing else, except that red also marks destructive actions. Categories never get their own hue. They are shown with a green line icon in a neutral chip, and a severity dot when severity matters. A multi-category event takes the colour of its worst severity.

**The Green on Navy Rule.** Chrome Accent (chrome-accent) appears only on the navy chrome and on navy surfaces such as toasts. On white, green is always interactive-primary or darker.

**The Navy Speaks for the System Rule.** Navy-900 surfaces inside the content area (toasts, tooltips, the bulk-selection bar, the unreviewed dot) mark system state or feedback, never a brand moment.

## Typography

**Heading Font:** Roboto (with Noto Sans SC, ui-sans-serif, system-ui), applied to every h1–h6 through `--font-heading`
**Body Font:** Open Sans (with Noto Sans SC, ui-sans-serif, system-ui), everything that is not a heading, through `--font-sans`

**Character:** Roboto's tighter, more engineered forms carry headings; Open Sans's open humanist shapes carry tables, controls and prose in four weights (400, 500, 600, 700). Noto Sans SC sets Simplified Chinese company names in either role. The family is chosen by element, not by size: a large number set in a `span` (the Display count) stays Open Sans.

### Hierarchy
- **Display** (Open Sans 600, 44px, line-height 1, -0.03em, tabular): the triage headline count only ("133 companies with unreviewed changes").
- **Headline** (Roboto 600, 26px, tight leading, -0.015em): the page h1. Report pages use 24px and the Search heading 22px, at -0.01em.
- **Lead title** (Roboto 600, 20px, snug leading, -0.01em): the lead change headline on a company page.
- **Title** (Roboto 600, 18px, snug leading): dialog titles, section headings, result counts.
- **Body** (400, 14px, 1.5): page intros, dialog prose, buttons and tabs. Prose is capped at 62–64ch.
- **Body dense** (400, 13px): table cells, filter controls, menus, toasts, panel labels (as 600 in content-main).
- **Label** (600, 12px): table headers and select labels (500 in content-main), meta lines and timestamps (400 in content-tertiary). Use 11px only for chip counts, the New tag, legend text and the inline Baseline / Now labels of a stacked field diff below md.

### Named Rules
**The Tabular Figures Rule.** Every count, date, registration number and credit figure is set with tabular figures so columns line up across thousands of rows.

**The Sentence-Case Label Rule.** Panel and section labels are sentence case, semibold, content-main, 12–13px (for example "Needs review" or "Active monitors"). Weight and colour carry the hierarchy.

## Layout

- **Shell.** The top bar is sticky and 56px tall. The sidebar is sticky, 252px wide, and collapses to 72px at lg and above. Below lg the sidebar becomes a 280px drawer over a navy-950 scrim at 60%, opened from a menu button in the top bar. The top bar shows the product title ("Perpetual KYB (pKYB)") next to the logo, and the title hides below sm.
- **Content.** Content is centred and capped at 1280–1360px, with 16px side padding (32px at lg and above), 24px top and 64px bottom. The page header has the title and intro on the left and the page action on the right. It wraps on small screens.
- **Rhythm.** Spacing follows a 4px base: 8px and 12px gaps inside rows, 16–24px between blocks, 32px before the tab strip. Panels are padded 20px (24px at lg), table cells 12px horizontally, and rows 14px vertically (10px for headers).
- **Two-column pages.** These use a main column plus a 300px side column (company detail) or a 200px filter rail (Search) at lg, and stack below it.
- **Breakpoints** are Tailwind defaults: sm 640px, md 768px, lg 1024px.

### Named Rules
**The Stacked Rows Rule.** Every data table has two renderings from the same rows. At md and above it is a horizontally scrollable table with a minimum width. Below md it becomes a divided list of stacked rows: name line, meta line (flag, jurisdiction, date), then severity pill and category chips, with the ⋯ menu at the right. Never squeeze a table down to a phone width.

## Elevation & Depth

The system is flat at rest. Depth comes from the navy frame against the pale base-contrast, from base-contrast against white panels, and from 1px hairline borders. Panels, tables and cards carry no shadow. Shadows only appear on elements that float above the page.

### Shadow Vocabulary
- **Pop** (`box-shadow: 0 8px 24px -6px rgb(13 22 32 / 0.18), 0 2px 6px -2px rgb(13 22 32 / 0.12)`): menus, the notification popover, toasts, heatmap tooltips.
- **Dialog** (`box-shadow: 0 24px 64px -12px rgb(13 22 32 / 0.35)`): modal dialogs and the mobile nav drawer.

### Named Rules
**The Flat Until Floating Rule.** A surface gets a shadow only if it overlays other content. Panels separate themselves with a hairline border, never a shadow.

## Shapes

Corners are small and consistent, and the radius grows with the size of the container. Controls (buttons, inputs, selects, category chips, nav rows, icon buttons) are 4px. Panels, tables, menus, popovers and toasts are 6px. Dialogs are 8px. Severity pills, status filter chips, count badges and dots are fully round. Flags are 2px with a 1px inner hairline, and heatmap cells have 2px corners. Borders are always 1px hairlines in line or interactive-secondary. Heavier lines are reserved for state: the 2px active-tab underline and the 2px chrome-accent active sub-nav marker.

## Components

### Buttons
Buttons are compact and decisive.
- **Shape:** gently squared (4px). Medium is 36px tall with 16px padding at 14px semibold. Small is 32px with 12px padding at 13px. Icon and label have a 6px gap.
- **Primary:** Interactive Primary fill, white text. Hover is interactive-control and pressed is navy-800.
- **Secondary:** white with a 1px interactive-primary border and interactive-primary text. Hover is mint background-subtle. It is the default variant and serves page-level creation actions ("New monitor").
- **Ghost:** content-main text, no border. Hover is background-subtle with content-primary text. Used for Cancel and low-stakes actions.
- **Danger:** high-red fill, white text. Used only as the confirm button inside a destructive confirm dialog.
- **Link:** interactive-primary text, underlined on hover.
- **Focus:** a 2px interactive-primary outline at 2px offset on every focusable element. Disabled is 50% opacity.

**The One Filled Primary Rule.** Each view has at most one primary (filled green) button: the next step in triage ("Review High first", "Download fresh report"). When a lead change takes the primary on a company page, the header download becomes secondary.

### Severity pills and category chips
- **Severity pill:** fully round, 24px tall (20px small), with a severity bg fill, severity-line border and severity text, a 6px cell-colour dot, and the label "High", "Medium" or "Low".
- **Triage chips:** 32px round chips in the same severity tints, showing a count and label. They are filter buttons.
- **Category chip:** 4px radius, white, hairline border, content-main 12px text, a 14px green line icon for the category, and a trailing severity dot that follows the user's mapping. Icons: Identity user, Address map-pin, BusinessActivity briefcase, Officers users, Ownership pie-chart, Capital landmark, Status circle-check, AnnualReturn calendar, Other ellipsis.
- **Status filter chips:** round, white with a interactive-secondary border. Selected is a navy-800 fill with white text.
- **Triage chips as filters:** they carry `aria-pressed`. Pressed shows a check in place of the dot and a 1px inset ring in the chip's own colour; pressing again clears the filter. They are the only severity filter on Active monitors.
- **Severity annotation:** severity is a lens the client can re-aim, so each change keeps the severity it had when detected. Where today's mapping reads differently, the pill is followed by "was Low" in 11px content-tertiary. The pill always shows today's value.
- **Status badge:** Active is a mint tint, Stopped a background-subtle tint with a solid dot, Inactive white with a hollow dot. Amber is never used for a status, only for Medium severity.

### Panels and tables
- **Corner style:** 6px.
- **Background:** white on base-contrast, with a 1px hairline border and no shadow.
- **Internal padding:** 20px, 24px at lg.
- **Tables:** 13px cells, 12px semibold content-main headers, hairline row dividers. Rows highlight in base-contrast on hover and in interactive-selected (solid interactive-accent at 70% over white) when selected. The whole row is clickable, and the row's Review / View link is its keyboard path. Columns that support sorting show a down arrow when active.
- **Featured change:** a portfolio row shows one change: the company's most severe unreviewed change, or, with a category filter, the most severe unreviewed change in that category. "+N more unreviewed" follows its chips, and the Detected cell adds "Newest <date>" when a later change exists. The severity filter and triage chips use the company's worst unreviewed severity, so each company sits in one tier; the category filter matches any unreviewed change; the date sort uses the newest change.
- **Pinned identity columns:** on wide portfolio tables the checkbox and Company columns are sticky on horizontal scroll, with a 1px inset hairline on the right edge. Pinned cells carry their own solid fill, so every cell takes the row state. Secondary facts such as "Checked 02 Oct 2026" go on the company's meta line rather than in a column of their own.
- **Bulk selection:** when rows are selected, a navy-900 bar appears above the table with the selected count, a visible "Clear selection", the review action ("Review N changes…") and a ⋯ menu holding the destructive action. Row selectors are real checkboxes (`role="checkbox"`, 24px). Shift-click selects a range. After a bulk action or Clear selection, focus returns to the select-all checkbox. A polite live region announces the result count and the selection ("3 selected, including 2 High").
- **Paging and keys:** the Active monitors footer holds Export N as CSV, Shortcuts, a Rows size (25 / 50 / 100, kept in the URL as `per`) and a Page jump. Keys: j / k move between rows, Enter opens, x selects (Shift+x for a range), r reviews the company's unreviewed changes, ? opens the shortcut sheet. Keys never fire inside inputs, menus or dialogs.
- **Result bar:** an action on the whole filtered result ("Review all N…") sits in a bar at the top of the result with the count, never among the filters. CSV export sits in the result's footer, beside the pager.
- **CSV export:** every audit export (active monitors, order history, a company's change log, the change feed) goes through `data/csv.ts`. It writes UTF-8 with a BOM so Chinese names open correctly, and prefixes any cell starting with `=`, `+`, `-` or `@` with an apostrophe so no cell runs as a formula.
- **Pending-changes bar:** Severity Settings has one save model. Edits stay drafts until saved. A sticky navy-900 bar at the foot of the page states the count, how many companies change severity and the in-app alert volume before and after, with a ghost Discard and a white Save changes. Saving shows a toast with Undo, and the mapping footer records who changed it last and when. Unsaved drafts are kept for the session, so leaving the page and coming back restores them, and closing the tab with unsaved changes asks first.
- **Status notice:** Stopped and Inactive company pages lead with a white panel (hairline-strong border, no tint) that says what the status means and offers "Create pKYB monitor". Inactive never claims checks, a baseline or a cost. Activity and change-log panels render only when the company has changes.

### Review decisions
A review is a decision, not a tick, because the change log is the client's audit trail.
- **Decisions:** "No action needed" or "Actioned". Each review records the decision, the reviewer, the date and an optional note of up to 500 characters.
- **Lead card (company page):** the lead change shows a field diff, then the primary "Get fresh KYB Basic report", then a base-contrast footer titled "Record your review". The footer holds the two decisions as radio cards (white with a interactive-secondary border; selected has a interactive-primary border on interactive-accent), a note field, and a secondary "Record review" that stays disabled until a decision is chosen. Ordering a fresh report pre-selects Actioned and pre-fills the note.
- **Field diff:** a hairline-bordered list with Field, Baseline (date) and Registry now (date) columns. Each row has the category chip, the field name in 13px semibold, the baseline value in content-main and the current value in content-primary at 500, and "In the fresh report: <section>" in 12px content-tertiary. Below md the columns stack, with inline 11px labels. Changed values are never colour-coded, because severity is the only status colour.
- **Field diff, inline:** everywhere else a change can be reviewed or audited (feed rows, change-log rows, review dialogs) it shows as "<Field> <before> → <after>" in 13px: field in content-primary semibold, before in content-main, after in content-primary at 500, with a screen-reader "changed to". It stays after review, so the change log records what was judged.
- **Review menu (lists):** in the change log and the feed, each unreviewed change has a 32px outlined "Review ▾" menu with the two decisions and "Add a note…", which opens the review dialog.
- **Review dialog:** used for bulk review, for a whole company's changes from its ⋯ menu, and for a single change with a note. It always asks for the decision. Above the decision it lists the changes being reviewed, most severe first, each with its inline field diff (the first 8, then "and N more, less severe"), so no decision is recorded blind. When High changes are included it names how many.
- **Recorded outcome:** the decision in 12px semibold content-main, then "reviewer · date" in content-tertiary, then "Note: …" in content-main. After a review, focus moves to this outcome. Where the list hides reviewed changes (the feed), focus moves to the next row's Review button.

### Inputs and fields
- **Style:** 36px tall (40px on the Search hero), 4px radius, white with a 1px interactive-secondary border, 13px content-primary text, content-tertiary placeholder. A 12px medium content-main label sits above.
- **Hover / focus:** the border darkens to content-tertiary on hover and turns interactive-primary on focus, with no glow, and the global 2px interactive-primary focus outline still shows: inputs never suppress it. Checkboxes use the native control with a interactive-primary accent. On phones inputs and selects are 44px tall and 16px, so iOS does not zoom them.

### Navigation
- **Top bar:** navy gradient, logo ("Asia" in chrome-accent, "Verify" in white, 17px bold), product title at 16px semibold, and 36px icon buttons in white at 85%. Hover is a 10% white overlay.
- **Sidebar:** navy gradient, 40px rows at 14px with 18px line icons (1.75 stroke). Rest is white at 75%, hover adds a 5% white fill, active adds a 7% white fill with white text. Sub-items indent under a 12% white rule, and the active sub-item is semibold with a 2px chrome-accent marker on that rule. A "New" tag marks new modules.
- **Tabs:** 44px tall, 14px. Active is semibold content-primary with a 2px interactive-primary underline and a accent count badge. Inactive is content-main with a background-subtle count badge. Labels shorten below sm.

### Menus, dialogs and toasts
- **⋯ menu:** a 32px ghost icon trigger opens a 200px, 6px-radius white menu with the pop shadow. It is rendered in a portal so tables never clip it. It follows its trigger while the page scrolls, opens upward when there is no room below, and closes only when the trigger leaves the viewport. Items are 13px, with background-subtle on hover and focus, and danger items are high-red text.
- **Dialog:** a native modal, 8px radius, dialog shadow, navy-950 backdrop at 55%. The header has an 18px title and a close button above a hairline. The body is padded 20px by 24px. The footer sits on base-contrast, right-aligned, with a ghost Cancel before the confirming button. It enters over 220ms (8px rise, 0.985 scale) on the out-expo curve.
- **Toast:** navy-900, 6px radius, pop shadow, chrome-accent check icon, 13px semibold title with a 70% white body, bottom-right, up to 380px wide. It enters over 260ms with a 10px rise. Its timer pauses while the pointer or keyboard focus is on it, so Undo is never taken away mid-reach.
- **Credit-spending confirm:** ordering a monitor or a fresh KYB Basic report states the price before the click (on the button and in the dialog) and focuses Cancel first, so Enter on open never spends credits. Each purchase also shows the credit balance before and after ("Balance xx credits → xx credits after"). Until the KYB Basic price and the balance are available they read "xx credits", from one place in `data/model.ts`. On a company with nothing left to review, Get fresh KYB Basic report is a secondary button: buying a report is an option there, not the next step. On the report-choice page, choosing KYB Basic for an unmonitored company offers to create the monitor instead, because the monitor's baseline is that same report.

**The Confirm Before Destroy Rule.** "Stop monitoring" is never a visible row or header button. A single company's stop lives in its ⋯ menu as a red item. Bulk stop lives in the navy selection bar. Both open a confirm dialog that names the company or count, leads with any unreviewed changes (and how many are High), explains what stays (history under Order history) and that no further monitoring credits are charged, and confirms with the danger button, with Cancel focused first.

### Report viewer (KYB Basic baseline)
`/reports/:monitorId` shows the KYB Basic report a monitor was ordered with, rebuilt from the Portal's View Report Figma. It is opened from the monitor page's baseline panel ("View"). Confirming a new monitor does not land here: it lands on the monitor's details page, `/pkyb/monitoring/:id?new=1`, where the baseline shows as generating.
- **Header:** the company name and local name at 24px, separated by an content-tertiary bar, with the flag after them. Below that, the registry label in uppercase 13px content-main. On the right, a two-line meta ("pKYB baseline report" / "Monitoring since …") and the page's one primary, **View pKYB**, a link to `/pkyb/monitoring/:id`. Below lg it stacks, and on phones the button is full width.
- **Toolbar:** "View report:" with a navy-900 report chip, then the pager ("Page N of 3", first/prev/next/last), share and download icon buttons, and the EN / OG language toggle (`aria-pressed`).
- **Section rail:** 272px, base-contrast at 70%, sticky under the top bar. "Jump to section", "Share recommendation" and "Add-ons" headings are uppercase 12px content-tertiary, matching the Portal's existing viewer. The active section is interactive-accent with a 2px interactive-primary marker, like the sidebar's sub-nav. Below lg the rail becomes a "Jump to section" select.
- **Section heading:** a interactive-accent band, 18px interactive-control, with a 2px interactive-primary rule underneath.
- **Cover sheet:** printed-document art, so it keeps its own background-subtle (mint to sky) and a slate façade band (#c3d3db → #7f98a7) under a vertical REPORT. These colours stay on the cover and never reach the UI.
- **Report content:** facts are hairline `dl` lists, and tables follow the Stacked Rows rule. Historical Changes ends with "Changes after <date> are tracked by your pKYB monitor · View pKYB". The monitor page's baseline panel links back with "View".

### Signature: unreviewed marker, queue trend and heatmap
- **Unreviewed dot:** an 8px navy-900 dot before the company name, with the name in semibold instead of medium. It means "has unreviewed changes" and stays separate from severity, so it is never tinted.
- **Queue trend (Monitoring triage band):** a column chart of changes detected (chart-new) and reviewed (chart-reviewed) per week for the last 12 weeks. A good week is a green column at least as tall as the blue one, so the chart stays meaningful when the team is caught up. It's drawn at the container's real pixel width so 11px axis text never scales down. Above it: a legend and "This week so far: N new, M reviewed · queue up/down K". Below it: a readout for the hovered week, plus a screen-reader table. Below md it sits behind a "Show new and reviewed changes per week" toggle.
- **Heatmap (company page):** an SVG grid with weeks as columns and Monday at the top. Cells are 12–13px with a 3px gap and 2px corners. Month labels and Mon/Wed/Fri labels are 9–10px content-tertiary. Hovering shows a navy-900 tooltip, and the selected day gets a 1.5px navy-900 stroke. The grid opens scrolled to the most recent weeks.

## Do's and Don'ts

### Do:
- **Do** keep severity as the only status hue: High red, Medium amber, Low slate. Every severity-coloured element reads from the user's mapping, so a remap recolours tables, feed, heatmaps and alerts at once.
- **Do** identify change categories with the green line icon inside a neutral 4px chip.
- **Do** use exactly one filled green primary per view, and make it the next triage step.
- **Do** put destructive actions in a ⋯ menu (or the bulk-selection bar) and always confirm them in a dialog with the danger button.
- **Do** render every data table as stacked rows below md.
- **Do** mark unreviewed items with the 8px navy-900 dot and a semibold name.
- **Do** write cadence copy as "Last checked" and "Checks run automatically".
- **Do** use tabular figures for every number and date.
- **Do** keep panels flat with 1px hairline borders, and keep shadows for elements that float.
- **Do** show the price before any action that spends credits, and focus Cancel first in its confirm.
- **Do** keep every interactive control at least 24px, and give days with changes in a heatmap a keyboard path (one tab stop, arrow keys).
- **Do** give one count one meaning, and put its unit on screen. The triage band counts companies only. Unreviewed changes are counted on the Change feed tab. The bell counts alerts to review at your in-app severities; alerts clear when reviewed, not when read, so never call them "unread".
- **Do** record a decision with every review, including bulk review.
- **Do** show what changed, field by field, before asking the client to spend credits on a report.

### Don't:
- **Don't** give categories their own colours or rainbow badges.
- **Don't** use Chrome Accent (chrome-accent) on white surfaces.
- **Don't** place a visible "Stop" or "Delete" link inline in a table row.
- **Don't** promise a check cadence: no "checks every N days", no countdowns, no next-check dates.
- **Don't** add shadows to panels or cards at rest, or use radii larger than 8px.
- **Don't** introduce a third typeface, or set a heading in Open Sans or body text in Roboto. Headings (h1–h6) are Roboto; everything else is Open Sans.
- **Don't** use amber for anything but Medium severity, including the Inactive status.
- **Don't** animate layout properties such as `width`; the sidebar collapses without a transition.
- **Don't** apply an org-wide severity change without showing its impact first.
