# Colour tokens: brand sheet → pKYB

How the AsiaVerify semantic colour sheet maps into the pKYB Portal code, checked against WCAG 2.2 AA:

- **Text** needs 4.5:1 (3:1 at 24px+, or 18.66px+ bold).
- **UI boundaries** (inputs, checkboxes, focus) need 3:1.

`content.primary` and `interactive.primary` are locked and unchanged.

Tokens live in `src/index.css`. In code, a sheet name like `content.main` becomes `--color-content-main`, used as `text-content-main`, `bg-…` or `border-…`.

**Status key**

| Status | Meaning |
|---|---|
| **Applied** | In the theme and used in the UI at the sheet's value. |
| **In theme** | Defined at the sheet's value, but no screen needs it yet. |
| **Change** | The sheet value fails contrast here. The code uses the adjusted value shown; please update the sheet. |
| **Add** | A role the UI needs that the sheet doesn't cover. The code uses the proposed value; please add it to the sheet. |
| **Review** | Passes, but the definition or a label on the sheet needs a design decision. |

## 1. Brand sheet tokens

### content

| Token | Sheet value | In code | Contrast (where it's used) | Status | Advice |
|---|---|---|---|---|---|
| primary | #1B1C1E | #1B1C1E | 17.05:1 on white, 15.92:1 on base.contrast | **Applied** (locked) | None. Headings and primary text. |
| main | #444444 | #444444 | 9.74:1 on white, 8.38:1 on interactive.accent | **Applied** | None. Secondary text, table headers, Low severity text. |
| disabled | #5E5E5E | #5E5E5E | 6.48:1 on white | **In theme** · **Review** | It is *darker* than tertiary (6.48 vs 5.02), so disabled text reads as more important than placeholders. Disabled text is exempt from WCAG, so lighten it to around #8F8F8F (3.2:1), or swap it with tertiary. |
| tertiary | #6F6F6F | **#6B6B6B** | Sheet value: 4.29:1 on bg.neutral, 4.33:1 on interactive.accent, 4.52:1 on selected rows. Adjusted value: 4.55 / 4.59 / 4.80 | **Change** | Darken by 4 steps. Barely visible, but it clears AA on every tinted surface where meta text appears. |
| link | #004D3F | #004D3F | 9.84:1 on white | **Applied** | None. All 21 inline text links. |
| on_negative_elevated | #95231E | #95231E | 7.43:1 on negative_elevated, 8.28:1 on white | **Applied** | None. High severity text. |
| on_warning_elevated | #BB7600 | **#9A6200** | Sheet value: 3.44:1 on warning_elevated, 3.68:1 on white. Adjusted value: 4.76 / 5.10 | **Change** | Same 38° hue, darker. Medium severity text. |
| on_positive_elevated | #397300 | #397300 | 5.64:1 on positive_elevated | **In theme** · **Review** | The hex passes. Fix the sheet's labels: rgb(81,138,23) is #518A17, which fails at 4.09:1, and the swatch is painted #005C1D. Pick one value. |

### interactive

| Token | Sheet value | In code | Contrast | Status | Advice |
|---|---|---|---|---|---|
| primary | #00735F | #00735F | 5.81:1 as text on white, white on it 5.81:1, 5.00:1 on interactive.accent | **Applied** (locked) | None. Primary buttons, secondary outlines, active tab, checkbox marks, focus ring, caret. |
| accent | #E5F1E8 | #E5F1E8 | Background for primary (5.00) and control (8.47) text | **Applied** | None. Tinted fills: selected filters, the "New" tag, the promo panel. |
| secondary | #626262 | #626262 | 6.10:1 on white (needs 3:1) | **Applied** · **Review** | A big accessibility win: input borders were #CFD5DA at 1.4:1, which failed WCAG 1.4.11. The sheet's swatch is painted #424242, the same as content.main, so confirm #626262 is intended. |
| control | #004D3F | #004D3F | 8.47:1 on accent | **Applied** | None. Primary button hover, green text on accent fills. |
| contrast | #009A7E | #009A7E | **1.64:1 on interactive.primary** (as described), 3.34:1 on navy-700 | **In theme** · **Review** | The description, "text and icons on a Green Interactive Primary surface", fails in light mode. Put base.light on primary (5.81:1) and keep contrast for dark mode only. It is not used on the navy chrome either, because it drops to 3.34:1 where the logo sits. |

### background

| Token | Sheet value | In code | Contrast | Status | Advice |
|---|---|---|---|---|---|
| elevated | #FDFDFD | #FDFDFD | — | **In theme** | No bottom sheets in pKYB yet. |
| demoted | #292929 | #292929 | White on it 14.55:1 | **In theme** · **Review** | The sheet says sidebars use demoted, but the Portal sidebar is the navy gradient from Figma. Decide whether the Portal moves to #292929 or navy is added to the sheet (see "chrome" below). |
| accent | #F8F7F4 | #F8F7F4 | — | **In theme** · **Review** | Fix the label: rgb(244,244,244) should be rgb(248,247,244). |
| neutral | rgba(165,165,165,0.2) | same | Tertiary at the sheet value fails on it (4.29:1) | **In theme** · **Review** | The hex label #E0E0E0 is wrong. Over white this rgba gives #EDEDED. |
| overlay | rgba(14,15,12,0.12) | same | — | **Applied** | The 1px edge around every country flag, exactly the sheet's example. |

### sentiment

| Token | Sheet value | In code | Contrast | Status | Advice |
|---|---|---|---|---|---|
| negative | #D14343 | #D14343 | 4.57:1 on white (text or white on it), **4.10:1 on negative_elevated** | **Applied** | The danger button and High heatmap cells and dots. As text, use it on white only. On a negative_elevated fill, use on_negative_elevated. |
| positive | #73C322 | **#1B813D** | Sheet hex: **2.20:1** on white. Adjusted: 4.94:1 on white, 4.81:1 on positive_elevated | **Change** | The sheet has three different values: hex #73C322, rgb #009A7E (a copy of interactive.contrast) and a painted swatch of #1B813D. The swatch is the only one that passes, so it is the one used. |
| warning | #FFAA52 | #FFAA52 | 1.89:1 against white (fill only) | **Applied** | Medium heatmap cells and dots. The sheet is right that it is never text. Severity fills always sit beside a text label, so colour is never the only cue. |
| negative_elevated | #FFEFEF | #FFEFEF | — | **Applied** | High pill fill. |
| positive_elevated | #F6FFED | #F6FFED | — | **In theme** | No success surfaces yet. |
| warning_elevated | #FFF6E8 | #FFF6E8 | — | **Applied** | Medium pill fill. |

### border

| Token | Sheet value | In code | Contrast | Status | Advice |
|---|---|---|---|---|---|
| neutral | #A5A5A5 | #A5A5A5 | 2.46:1 on white | **Applied** · **Review** | Fine for separators, which are decorative and exempt, but never as the only edge of an active control (use interactive.secondary). Used for strong static edges and the scrollbar. The sheet says "most separators", but at #A5A5A5 the dense table rows look heavy, so hairlines use border.subtle (below). |

### base

| Token | Sheet value | In code | Status | Advice |
|---|---|---|---|---|
| light | #FFFFFF | #FFFFFF | **Applied** | Panels, and text on filled buttons. Tailwind's `white` resolves to the same value. |
| dark | #1B1C1E | #1B1C1E | **In theme** | Same value as content.primary. |
| contrast | #F7F7F7 | #F7F7F7 | **Applied** | Page background, row hover, dialog footers. Replaces #F7F8F8. |

## 2. Tokens to add to the sheet

The UI needs these roles, and nothing on the sheet covers them. All are used in code under these names.

| Proposed token | Value | Used for | Uses | Contrast note |
|---|---|---|---|---|
| border.subtle | #E3E3E3 | Table row dividers, panel borders, hairlines | 91 | Decorative. A neutral version of the old #E3E7EA. |
| background.subtle | #F1F1F1 | Ghost and menu hover, inactive count badges, empty heatmap cells, Low pill | 28 | content.main on it 8.62:1, tertiary 4.72:1 |
| border.accent | #8FCAA9 | Edges of accent-tinted chips and panels, the "New" tag | 10 | Decorative |
| interactive.accent_hover | #D6E9DA | Hover on accent fills, text selection | 4 | interactive.primary text on it 4.57:1 |
| interactive.selected | #EDF5EF | Selected table rows (accent at 70% over white, solid for sticky cells) | 2 | Tertiary on it 4.80:1 |
| sentiment.negative_hover | #A52B25 | Hover on the danger button | 1 | White on it 7.07:1 |
| border.negative | #F2C4C0 | High pill and lead-card border | via severity | Decorative |
| border.warning | #EFD7A3 | Medium pill border | via severity | Decorative |
| chrome.accent | #2FBF87 | Green on navy: "Asia" in the logo, active nav, toast icons, count badge | 8 | 7.45:1 on navy-900. interactive.contrast is only 3.34:1 on navy-700. |
| chrome.navy-950 → 600 | #0B1016, #111A24, #172636, #1F3954, #2A4A6A | Portal top bar and sidebar gradient, toasts, bulk bar | — | Kept from Figma until the demoted-vs-navy decision is made. |
| Severity data-viz | ramp #F3CCCC, #E38E8E · on-dark #FFB4AE · low line #D6D6D6 | Heatmap intensity steps, High count on the navy bulk bar, Low pill border | — | Ramps are re-derived from the new negative #D14343. |

## 3. Retired code tokens

These were the Portal's own names. Every usage now points at the semantic token.

| Old | Old value | Now |
|---|---|---|
| ink | #1D2329 | content.primary |
| ink-2 | #4D5761 | content.main |
| ink-3 | #646E77 | content.tertiary |
| brand-600, brand-700 | #0D7A58, #0A6A4D | interactive.primary (link-styled text uses content.link) |
| brand-800 | #08573F | interactive.control |
| brand-50 | #EAF5EF | interactive.accent |
| brand-100 | #D3EADD | interactive.accent_hover |
| brand-300 | #8FCAA9 | border.accent |
| brand-400 | #2FBF87 | chrome.accent |
| row-selected | #F0F8F4 | interactive.selected |
| line | #E3E7EA | border.subtle |
| line-strong | #CFD5DA | interactive.secondary (controls) or border.neutral (static edges, scrollbar) |
| canvas | #F7F8F8 | base.contrast |
| wash | #F1F3F4 | background.subtle |
| high, medium, low (text) | #C2362F, #9A6200, #4F5C67 | content.on_negative_elevated, content.on_warning_elevated, content.main |
| high-cell, medium-cell, low-cell | #D9473F, #E7A83A, #A9B4BD | sentiment.negative, sentiment.warning, border.neutral |
| high-bg, medium-bg, low-bg | #FDEEED, #FDF4E1, #F0F2F4 | sentiment.negative_elevated, sentiment.warning_elevated, background.subtle |

## 4. Usage rules that keep it accessible

1. **Text on a tinted sentiment fill always uses its on_*_elevated colour.** Never put sentiment.negative or sentiment.warning text on an elevated fill.
2. **Inputs, selects and checkboxes are bordered with interactive.secondary.** border.neutral is for static edges only.
3. **Text on interactive.primary is base.light.** interactive.contrast is for dark mode.
4. **sentiment.warning is a fill, never text,** and every severity colour sits beside a written label.
5. **content.tertiary is the lightest text allowed** on any fill darker than base.contrast.
