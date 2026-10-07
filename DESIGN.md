---
name: AsiaVerify Portal (pKYB)
description: The AsiaVerify Portal's navy-and-green compliance workspace, as used by Perpetual KYB monitoring.
colors:
  navy-950: "#0b1016"
  navy-900: "#111a24"
  navy-800: "#172636"
  navy-700: "#1f3954"
  brand-50: "#eaf5ef"
  brand-100: "#d3eadd"
  brand-300: "#8fcaa9"
  brand-400: "#2fbf87"
  brand-600: "#0d7a58"
  brand-700: "#0a6a4d"
  brand-800: "#08573f"
  ink: "#1d2329"
  ink-2: "#4d5761"
  ink-3: "#646e77"
  line: "#e3e7ea"
  line-strong: "#cfd5da"
  canvas: "#f7f8f8"
  wash: "#f1f3f4"
  white: "#ffffff"
  high: "#c2362f"
  high-bg: "#fdeeed"
  high-line: "#f2c4c0"
  high-cell: "#d9473f"
  medium: "#9a6200"
  medium-bg: "#fdf4e1"
  medium-line: "#efd7a3"
  medium-cell: "#e7a83a"
  low: "#4f5c67"
  low-bg: "#f0f2f4"
  low-line: "#d6dbe0"
  low-cell: "#a9b4bd"
typography:
  display:
    fontFamily: "Noto Sans, Noto Sans SC, ui-sans-serif, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Noto Sans, Noto Sans SC, ui-sans-serif, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Noto Sans, Noto Sans SC, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.375
  heading:
    fontFamily: "Noto Sans, Noto Sans SC, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Noto Sans, Noto Sans SC, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  body-dense:
    fontFamily: "Noto Sans, Noto Sans SC, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Noto Sans, Noto Sans SC, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.5
  micro:
    fontFamily: "Noto Sans, Noto Sans SC, ui-sans-serif, system-ui, sans-serif"
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
    backgroundColor: "{colors.brand-700}"
    textColor: "{colors.white}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.brand-800}"
  button-primary-active:
    backgroundColor: "{colors.navy-800}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.brand-700}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "36px"
  button-secondary-hover:
    backgroundColor: "{colors.brand-50}"
  button-ghost:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "36px"
  button-ghost-hover:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.ink}"
  button-danger:
    backgroundColor: "{colors.high}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "36px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.body-dense}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "36px"
  panel:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.panel}"
    padding: "20px"
  dialog:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
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
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.control}"
    padding: "0 8px"
    height: "24px"
  tab-active:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    height: "44px"
  toast:
    backgroundColor: "{colors.navy-900}"
    textColor: "{colors.white}"
    rounded: "{rounded.panel}"
    padding: "12px 16px"
---

# Design System: AsiaVerify Portal (pKYB)

## Overview

**Creative North Star: "The Night Desk Ledger"**

This is the established AsiaVerify Portal, and pKYB runs inside it as a native module. Nothing about it was reinvented for pKYB. A dark navy gradient frames the workspace in the top bar and sidebar. Inside that frame the content sits on near-white canvas, in white panels with hairline borders. One deep green carries every committed action, and a three-step severity scale carries every status. The frame is calm and heavy, and the content is light and dense: the dark frame holds the room and the ledger inside does the work.

The density is analyst-grade. Body text is 14px, tables and secondary text are 13px, and meta text is 12px. Panels are flat, with no ambient shadow. Depth comes from the navy frame against the pale canvas and from two shadows reserved for things that float: menus, toasts, tooltips and dialogs. Colour is rationed. Green means "act or go here", red, amber and slate mean severity, and navy means "the system is speaking": selections, toasts, tooltips and the unreviewed marker.

Severity is the only status colour. The nine change categories are told apart by green line icons, never by hue, so whenever a user remaps severity in Severity Settings, the colour of every table row, chip dot, feed entry, heatmap and alert follows.

**Key Characteristics:**
- Navy gradient chrome (top bar and sidebar) around a light content area on canvas.
- A single green primary action per view, plus green outline and ghost buttons for everything else.
- Severity is a three-step scale (High red, Medium amber, Low slate). Each step has text, background, border and cell tints.
- Category identity is a green line icon inside a neutral chip.
- Hairline borders and small radii (4px controls, 6px panels), and flat surfaces at rest.
- Noto Sans throughout, with Noto Sans SC for Chinese names, and tabular figures for every count and date.

## Colors

The palette is a dark navy frame, one green action colour, a cool grey ink and line ramp, and a severity scale that is the only other source of hue.

### Primary
- **Ledger Green** (brand-700): the one filled action per view, secondary-button outlines and text, link text, the active tab underline, checkbox accent and caret. Brand-800 is the hover state and darker green text on brand-50 fills. Brand-600 is the focus ring and focused input border.
- **Mint Wash** (brand-50, with brand-100 and brand-300): selected rows (at 70%), secondary-button hover, active filter rows, the pKYB promo panel header, and the "New" tag. Brand-100 is text selection, and brand-300 is the border of green-tinted panels and the New tag.
- **Signal Green** (brand-400): appears only on navy. It is used for the "Asia" in the logo, the active sub-nav marker, the notification count badge, the active pKYB nav icon, and the toast check icon.

### Secondary
- **Night Navy** (navy-700 → navy-900 → navy-950): the chrome gradient. The top bar runs 90deg and the sidebar 180deg, both from navy-700 through navy-900 at 55% to navy-950. Navy-900 also fills toasts, tooltips, the bulk-selection bar, the selected heatmap-cell stroke and the unreviewed dot. Navy-800 is the selected state of status filter chips and the pressed primary button. The dialog backdrop is navy-950 at 55%.

### Tertiary (Severity)
- **High** (high, high-bg, high-line, high-cell): red. It marks High severity and doubles as the destructive colour (danger button, danger menu items).
- **Medium** (medium, medium-bg, medium-line, medium-cell): amber. Text uses the dark medium value so it stays legible on medium-bg.
- **Low** (low, low-bg, low-line, low-cell): slate. It is deliberately quiet, not green, so Low never reads as "good".
- Each step has four roles: `text` for the label, `bg` for the pill fill, `line` for pill and lead-card borders, and `cell` for dots, heatmap cells and legend swatches.

### Neutral
- **Ink** (ink): headings and primary text.
- **Ink 2** (ink-2): secondary text, table headers, panel labels, inactive tabs.
- **Ink 3** (ink-3): meta text, placeholder, icons at rest, heatmap axis labels.
- **Hairline** (line): every panel border, divider and table rule.
- **Hairline Strong** (line-strong): input and select borders, unselected filter chips, scrollbar thumb.
- **Canvas** (canvas): page background, dialog footer, table row hover, the heatmap half of the triage band (at 60%).
- **Wash** (wash): ghost and menu-item hover, inactive count badges, and the empty heatmap cell.

### Named Rules
**The Severity Is the Only Status Colour Rule.** Red, amber and slate mean High, Medium and Low and nothing else, except that red also marks destructive actions. Categories never get their own hue. They are shown with a green line icon in a neutral chip, and a severity dot when severity matters. A multi-category event takes the colour of its worst severity.

**The Green on Navy Rule.** Signal Green (brand-400) appears only on the navy chrome and on navy surfaces such as toasts. On white, green is always brand-700 or darker.

**The Navy Speaks for the System Rule.** Navy-900 surfaces inside the content area (toasts, tooltips, the bulk-selection bar, the unreviewed dot) mark system state or feedback, never a brand moment.

## Typography

**Display Font:** Noto Sans (with Noto Sans SC, ui-sans-serif, system-ui)
**Body Font:** Noto Sans (with Noto Sans SC, ui-sans-serif, system-ui)

**Character:** A single humanist sans in four weights (400, 500, 600, 700) that sets Latin and Simplified Chinese company names with equal weight. Hierarchy comes from size and semibold weight, not from a second family.

### Hierarchy
- **Display** (600, 44px, line-height 1, -0.03em, tabular): the triage headline count only ("133 companies with unreviewed changes").
- **Headline** (600, 26px, tight leading, -0.015em): the page h1. Report pages use 24px and the Search heading 22px, at -0.01em.
- **Lead title** (600, 20px, snug leading, -0.01em): the lead change headline on a company page.
- **Title** (600, 18px, snug leading): dialog titles, section headings, result counts.
- **Body** (400, 14px, 1.5): page intros, dialog prose, buttons and tabs. Prose is capped at 62–64ch.
- **Body dense** (400, 13px): table cells, filter controls, menus, toasts, panel labels (as 600 in ink-2).
- **Label** (600, 12px): table headers and select labels (500 in ink-2), meta lines and timestamps (400 in ink-3). Use 11px only for chip counts, the New tag and legend text.

### Named Rules
**The Tabular Figures Rule.** Every count, date, registration number and credit figure is set with tabular figures so columns line up across thousands of rows.

**The Sentence-Case Label Rule.** Panel and section labels are sentence case, semibold, ink-2, 12–13px (for example "Needs review" or "Active monitors"). Weight and colour carry the hierarchy.

## Layout

- **Shell.** The top bar is sticky and 56px tall. The sidebar is sticky, 252px wide, and collapses to 72px at lg and above. Below lg the sidebar becomes a 280px drawer over a navy-950 scrim at 60%, opened from a menu button in the top bar. The top bar shows the product title ("Perpetual KYB (pKYB)") next to the logo, and the title hides below sm.
- **Content.** Content is centred and capped at 1280–1360px, with 16px side padding (32px at lg and above), 24px top and 64px bottom. The page header has the title and intro on the left and the page action on the right. It wraps on small screens.
- **Rhythm.** Spacing follows a 4px base: 8px and 12px gaps inside rows, 16–24px between blocks, 32px before the tab strip. Panels are padded 20px (24px at lg), table cells 12px horizontally, and rows 14px vertically (10px for headers).
- **Two-column pages.** These use a main column plus a 300px side column (company detail) or a 200px filter rail (Search) at lg, and stack below it.
- **Breakpoints** are Tailwind defaults: sm 640px, md 768px, lg 1024px.

### Named Rules
**The Stacked Rows Rule.** Every data table has two renderings from the same rows. At md and above it is a horizontally scrollable table with a minimum width. Below md it becomes a divided list of stacked rows: name line, meta line (flag, jurisdiction, date), then severity pill and category chips, with the ⋯ menu at the right. Never squeeze a table down to a phone width.

## Elevation & Depth

The system is flat at rest. Depth comes from the navy frame against the pale canvas, from canvas against white panels, and from 1px hairline borders. Panels, tables and cards carry no shadow. Shadows only appear on elements that float above the page.

### Shadow Vocabulary
- **Pop** (`box-shadow: 0 8px 24px -6px rgb(13 22 32 / 0.18), 0 2px 6px -2px rgb(13 22 32 / 0.12)`): menus, the notification popover, toasts, heatmap tooltips.
- **Dialog** (`box-shadow: 0 24px 64px -12px rgb(13 22 32 / 0.35)`): modal dialogs and the mobile nav drawer.

### Named Rules
**The Flat Until Floating Rule.** A surface gets a shadow only if it overlays other content. Panels separate themselves with a hairline border, never a shadow.

## Shapes

Corners are small and consistent, and the radius grows with the size of the container. Controls (buttons, inputs, selects, category chips, nav rows, icon buttons) are 4px. Panels, tables, menus, popovers and toasts are 6px. Dialogs are 8px. Severity pills, status filter chips, count badges and dots are fully round. Flags are 2px with a 1px inner hairline, and heatmap cells have 2px corners. Borders are always 1px hairlines in line or line-strong. Heavier lines are reserved for state: the 2px active-tab underline and the 2px brand-400 active sub-nav marker.

## Components

### Buttons
Buttons are compact and decisive.
- **Shape:** gently squared (4px). Medium is 36px tall with 16px padding at 14px semibold. Small is 32px with 12px padding at 13px. Icon and label have a 6px gap.
- **Primary:** Ledger Green fill, white text. Hover is brand-800 and pressed is navy-800.
- **Secondary:** white with a 1px brand-700 border and brand-700 text. Hover is mint wash. It is the default variant and serves page-level creation actions ("New monitor").
- **Ghost:** ink-2 text, no border. Hover is wash with ink text. Used for Cancel and low-stakes actions.
- **Danger:** high-red fill, white text. Used only as the confirm button inside a destructive confirm dialog.
- **Link:** brand-700 text, underlined on hover.
- **Focus:** a 2px brand-600 outline at 2px offset on every focusable element. Disabled is 50% opacity.

**The One Filled Primary Rule.** Each view has at most one primary (filled green) button: the next step in triage ("Review High first", "Download fresh report"). When a lead change takes the primary on a company page, the header download becomes secondary.

### Severity pills and category chips
- **Severity pill:** fully round, 24px tall (20px small), with a severity bg fill, severity-line border and severity text, a 6px cell-colour dot, and the label "High", "Medium" or "Low".
- **Triage chips:** 32px round chips in the same severity tints, showing a count and label. They are filter buttons.
- **Category chip:** 4px radius, white, hairline border, ink-2 12px text, a 14px green line icon for the category, and a trailing severity dot that follows the user's mapping. Icons: Identity user, Address map-pin, BusinessActivity briefcase, Officers users, Ownership pie-chart, Capital landmark, Status circle-check, AnnualReturn calendar, Other ellipsis.
- **Status filter chips:** round, white with a line-strong border. Selected is a navy-800 fill with white text.
- **Triage chips as filters:** they carry `aria-pressed`. Pressed shows a check in place of the dot and a 1px inset ring in the chip's own colour; pressing again clears the filter. They are the only severity filter on Active monitors.
- **Severity annotation:** severity is a lens the client can re-aim, so each change keeps the severity it had when detected. Where today's mapping reads differently, the pill is followed by "was Low" in 11px ink-3. The pill always shows today's value.
- **Status badge:** Active is a mint tint, Stopped a wash tint with a solid dot, Inactive white with a hollow dot. Amber is never used for a status, only for Medium severity.

### Panels and tables
- **Corner style:** 6px.
- **Background:** white on canvas, with a 1px hairline border and no shadow.
- **Internal padding:** 20px, 24px at lg.
- **Tables:** 13px cells, 12px semibold ink-2 headers, hairline row dividers. Rows highlight in canvas on hover and in mint wash when selected. The whole row is clickable. Columns that support sorting show a down arrow when active.
- **Bulk selection:** when rows are selected, a navy-900 bar appears above the table with the selected count, a visible "Clear selection", the review action and a ⋯ menu holding the destructive action. Row selectors are real checkboxes (`role="checkbox"`, 24px).
- **Pending-changes bar:** Severity & Notification Settings has one save model. Edits stay drafts until saved. A sticky navy-900 bar at the foot of the page states the count, how many companies change severity and the in-app alert volume before and after, with a ghost Discard and a white Save changes. Saving shows a toast with Undo, and the mapping footer records who changed it last and when.
- **Status notice:** Stopped and Inactive company pages lead with a white panel (hairline-strong border, no tint) that says what the status means and offers "Create pKYB monitor". Inactive never claims checks, a baseline or a cost. Activity and change-log panels render only when the company has changes.

### Inputs and fields
- **Style:** 36px tall (40px on the Search hero), 4px radius, white with a 1px line-strong border, 13px ink text, ink-3 placeholder. A 12px medium ink-2 label sits above.
- **Hover / focus:** the border darkens to ink-3 on hover and turns brand-600 on focus, with no glow, and the global 2px brand-600 focus outline still shows: inputs never suppress it. Checkboxes use the native control with a brand-700 accent. On phones inputs and selects are 44px tall and 16px, so iOS does not zoom them.

### Navigation
- **Top bar:** navy gradient, logo ("Asia" in brand-400, "Verify" in white, 17px bold), product title at 16px semibold, and 36px icon buttons in white at 85%. Hover is a 10% white overlay.
- **Sidebar:** navy gradient, 40px rows at 14px with 18px line icons (1.75 stroke). Rest is white at 75%, hover adds a 5% white fill, active adds a 7% white fill with white text. Sub-items indent under a 12% white rule, and the active sub-item is semibold with a 2px brand-400 marker on that rule. A "New" tag marks new modules.
- **Tabs:** 44px tall, 14px. Active is semibold ink with a 2px brand-700 underline and a mint count badge. Inactive is ink-2 with a wash count badge. Labels shorten below sm.

### Menus, dialogs and toasts
- **⋯ menu:** a 32px ghost icon trigger opens a 200px, 6px-radius white menu with the pop shadow. It is rendered in a portal so tables never clip it. Items are 13px, with wash on hover and focus, and danger items are high-red text.
- **Dialog:** a native modal, 8px radius, dialog shadow, navy-950 backdrop at 55%. The header has an 18px title and a close button above a hairline. The body is padded 20px by 24px. The footer sits on canvas, right-aligned, with a ghost Cancel before the confirming button. It enters over 220ms (8px rise, 0.985 scale) on the out-expo curve.
- **Toast:** navy-900, 6px radius, pop shadow, brand-400 check icon, 13px semibold title with a 70% white body, bottom-right, up to 380px wide. It enters over 260ms with a 10px rise. Its timer pauses while the pointer or keyboard focus is on it, so Undo is never taken away mid-reach.
- **Credit-spending confirm:** ordering a monitor or a fresh KYB Basic report states the price before the click (on the button and in the dialog) and focuses Cancel first, so Enter on open never spends credits. Until the KYB Basic price is confirmed it reads "xx credits", from one place in `data/model.ts`.

**The Confirm Before Destroy Rule.** "Stop monitoring" is never a visible row or header button. A single company's stop lives in its ⋯ menu as a red item. Bulk stop lives in the navy selection bar. Both open a confirm dialog that names the company or count, explains what stays (history under Order history), and confirms with the danger button, with Cancel focused first.

### Signature: unreviewed marker and heatmap
- **Unreviewed dot:** an 8px navy-900 dot before the company name, with the name in semibold instead of medium. It means "has unreviewed changes" and stays separate from severity, so it is never tinted.
- **Heatmap:** an SVG grid with weeks as columns and Monday at the top. Cells are 12–13px with a 3px gap and 2px corners. Month labels and Mon/Wed/Fri labels are 9–10px ink-3. Hovering shows a navy-900 tooltip, and the selected day gets a 1.5px navy-900 stroke. The portfolio High-severity ramp is four steps: wash for none, then #f6cfcb, #e9928a and high-cell, with a matching inline legend. The grid opens scrolled to the most recent weeks.

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
- **Do** give one count one meaning: the bell, the chips, the heatmap and the feed all count unreviewed changes, and the bell's link opens exactly the set it counted.

### Don't:
- **Don't** give categories their own colours or rainbow badges.
- **Don't** use Signal Green (brand-400) on white surfaces.
- **Don't** place a visible "Stop" or "Delete" link inline in a table row.
- **Don't** promise a check cadence: no "checks every N days", no countdowns, no next-check dates.
- **Don't** add shadows to panels or cards at rest, or use radii larger than 8px.
- **Don't** introduce a second typeface. Noto Sans with Noto Sans SC covers every role.
- **Don't** use amber for anything but Medium severity, including the Inactive status.
- **Don't** animate layout properties such as `width`; the sidebar collapses without a transition.
- **Don't** apply an org-wide severity change without showing its impact first.
