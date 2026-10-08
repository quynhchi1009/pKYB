# AsiaVerify colour tokens

The shared colour system for AsiaVerify products, built on the AsiaVerify semantic colour sheet. pKYB in the AsiaVerify Portal is the first product on it, so its screens are the examples here.

- **Source of truth:** `src/index.css` in the pKYB repo, until the tokens move to a shared package.
- **Generated:** this file, the visual sheet (`docs/tokens/color-tokens.html`) and the Figma table (`docs/tokens/figma-variables.csv`) are built by `python3 docs/tokens/build.py`. Edit the script, not the outputs.
- **Naming:** a sheet name maps to code as `content.main` → `--color-content-main` → `text-content-main` (likewise `bg-…` and `border-…`). In Figma the same token is `content/main`.
- **Contrast:** ratios are WCAG 2.2. Text needs 4.5:1; UI edges and fills that carry meaning need 3:1.

**Status**

| Status | Meaning |
|---|---|
| Brand sheet | The value comes from the AsiaVerify sheet unchanged. |
| New | Not on the sheet yet. |
| Adjusted | Differs from the sheet, to pass contrast or to match Figma. The sheet value is in brackets. |

## content

Text and icons on light surfaces.

| Token | Code | Hex | RGB | HSL | Status | Usage | Contrast |
|---|---|---|---|---|---|---|---|
| **primary** | `content-primary` | #1B1C1E | rgb(27, 28, 30) | hsl(220, 5%, 11%) | Brand sheet | Use to emphasise primary content in relation to other elements nearby: headings, names, key values in tables. | 17.05:1 on white |
| **main** | `content-main` | #444444 | rgb(68, 68, 68) | hsl(0, 0%, 27%) | Brand sheet | Use for most body text, and in supportive elements that give context to content close to it: table headers, field labels, inactive tabs. | 9.74:1 on white, 8.38:1 on interactive.accent |
| **tertiary** | `content-tertiary` | #6B6B6B | rgb(107, 107, 107) | hsl(0, 0%, 42%) | Adjusted (sheet: #6F6F6F) | Meta text, timestamps, placeholders, 'Optional' labels and icons at rest. The lightest text allowed on any tinted fill. | 5.33:1 on white, 4.80:1 on interactive.selected, 4.72:1 on background.subtle |
| **disabled** | `content-disabled` | #5E5E5E | rgb(94, 94, 94) | hsl(0, 0%, 37%) | Brand sheet | Used for text inside disabled components. Avoid using elsewhere. | — |
| **link** | `content-link` | #004D3F | rgb(0, 77, 63) | hsl(169, 100%, 15%) | Brand sheet | Use for inline text links and external link icons. Underlined on hover. | 9.84:1 on white |
| **on_negative_elevated** | `content-on-negative-elevated` | #95231E | rgb(149, 35, 30) | hsl(3, 66%, 35%) | Brand sheet | Contrasting text on negative_elevated: error messages, destructive warnings, and high-risk labels. | 7.43:1 on negative_elevated |
| **on_warning_elevated** | `content-on-warning-elevated` | #9A6200 | rgb(154, 98, 0) | hsl(38, 100%, 30%) | Adjusted (sheet: #BB7600) | Contrasting text on warning_elevated: caution messages and medium-risk labels. | 4.76:1 on warning_elevated, 5.10:1 on white |
| **on_positive_elevated** | `content-on-positive-elevated` | #397300 | rgb(57, 115, 0) | hsl(90, 100%, 23%) | Brand sheet | Contrasting text on positive_elevated: success messages and confirmations. | 5.64:1 on positive_elevated |

## interactive

Anything the user can click, select or type into.

| Token | Code | Hex | RGB | HSL | Status | Usage | Contrast |
|---|---|---|---|---|---|---|---|
| **primary** | `interactive-primary` | #00735F | rgb(0, 115, 95) | hsl(170, 100%, 23%) | Brand sheet | Conveys interactivity: primary buttons, secondary-button outlines and text, the active tab underline, checkbox and radio marks, the focus ring and the caret. | 5.81:1 on white |
| **control** | `interactive-control` | #004D3F | rgb(0, 77, 63) | hsl(169, 100%, 15%) | Brand sheet | Text and icons on accent surfaces, and the hover state of primary buttons. | 8.47:1 on interactive.accent |
| **accent** | `interactive-accent` | #E5F1E8 | rgb(229, 241, 232) | hsl(135, 30%, 92%) | Brand sheet | Use sparingly as a soft green fill in interactive elements: secondary-button hover, active filters, promo panels and the New tag. | — |
| **accent_hover** | `interactive-accent-hover` | #D6E9DA | rgb(214, 233, 218) | hsl(133, 30%, 88%) | New | Hover state of accent fills, and text selection. Keeps interactive.primary text legible on top. | — |
| **selected** | `interactive-selected` | #EDF5EF | rgb(237, 245, 239) | hsl(135, 29%, 95%) | New | Selected rows in tables and lists. Accent at 70% over white, kept solid so sticky columns hide what scrolls beneath them. | — |
| **secondary** | `interactive-secondary` | #626262 | rgb(98, 98, 98) | hsl(0, 0%, 38%) | Brand sheet | Use for de-emphasised interactivity: borders on inputs, selects, textareas, checkboxes and unselected filter chips. Do not use on text. | 6.10:1 on white |
| **inverse** | `interactive-inverse` | #172636 | rgb(23, 38, 54) | hsl(211, 40%, 15%) | New | Strong selected state on light surfaces: a selected filter chip or segmented option, and the pressed primary button. Always pairs with base.light text. | — |
| **contrast** | `interactive-contrast` | #009A7E | rgb(0, 154, 126) | hsl(169, 100%, 30%) | Brand sheet | Use in components for text and icons that sit on an interactive.primary surface in dark mode. In light mode, use base.light on interactive.primary instead. | — |

## background

Surfaces that sit behind content.

| Token | Code | Hex | RGB | HSL | Status | Usage | Contrast |
|---|---|---|---|---|---|---|---|
| **subtle** | `background-subtle` | #F1F1F1 | rgb(241, 241, 241) | hsl(0, 0%, 95%) | New | Quiet fills: hover on ghost buttons and menu items, inactive count badges, empty chart cells and neutral pills. | — |
| **system** | `background-system` | #111A24 | rgb(17, 26, 36) | hsl(212, 36%, 10%) | New | System feedback inside the content area: toasts, tooltips, bulk-action and unsaved-changes bars, and unread markers. Never a brand moment. | — |
| **scrim** | `background-scrim` | #0B10168C | rgba(11, 16, 22, 0.55) | hsla(213, 33%, 6%, 0.55) | New | Dims the page behind dialogs, drawers and the mobile navigation. | — |
| **elevated** | `background-elevated` | #FCFCFC | rgb(252, 252, 252) | hsl(0, 0%, 99%) | Adjusted (sheet: #FDFDFD) | Use for elevated surfaces that partially show the content behind them, like bottom sheets and sidebars. | — |
| **demoted** | `background-demoted` | #292929 | rgb(41, 41, 41) | hsl(0, 0%, 16%) | Brand sheet | Use a dark background for surfaces like bottom sheets and sidebars, but keep it subtle so you can still see some of the content behind them. | — |
| **accent** | `background-accent` | #F8F7F4 | rgb(248, 247, 244) | hsl(45, 22%, 96%) | Brand sheet | Use to give special importance to an accent section. | — |
| **neutral** | `background-neutral` | #A5A5A533 | rgba(165, 165, 165, 0.2) | hsla(0, 0%, 65%, 0.2) | Brand sheet | Used as the background for disabled elements such as form inputs or buttons, to show an inactive or non-interactive state. | — |
| **overlay** | `background-overlay` | #0E0F0C1F | rgba(14, 15, 12, 0.12) | hsla(80, 11%, 5%, 0.12) | Brand sheet | Use on the edges of images to separate them from the background, such as country flags and avatars. | — |

## sentiment

Meaning: something went wrong, needs care, or went well.

| Token | Code | Hex | RGB | HSL | Status | Usage | Contrast |
|---|---|---|---|---|---|---|---|
| **negative** | `sentiment-negative` | #D14343 | rgb(209, 67, 67) | hsl(0, 61%, 54%) | Brand sheet | Indicates negative sentiment: error states, danger buttons, destructive menu items and high-risk markers. As text, use on white only. | 4.57:1 on white |
| **negative_hover** | `sentiment-negative-hover` | #A52B25 | rgb(165, 43, 37) | hsl(3, 63%, 40%) | New | Hover state of danger buttons. | — |
| **warning** | `sentiment-warning` | #FFAA52 | rgb(255, 170, 82) | hsl(31, 100%, 66%) | Brand sheet | Indicates warning sentiment on alerts and medium-risk markers. Use only as a fill, never as text, and always beside a written label. | — |
| **positive** | `sentiment-positive` | #1B813D | rgb(27, 129, 61) | hsl(140, 65%, 31%) | Adjusted (sheet: #73C322) | Indicates positive sentiment, for example on success alerts. Can be used as text or as a background. | 4.94:1 on white |
| **negative_elevated** | `sentiment-negative-elevated` | #FFEFEF | rgb(255, 239, 239) | hsl(0, 100%, 97%) | Brand sheet | A soft negative fill for error banners, invalid fields and high-risk pills. Pair with on_negative_elevated text. | — |
| **warning_elevated** | `sentiment-warning-elevated` | #FFF6E8 | rgb(255, 246, 232) | hsl(37, 100%, 95%) | Brand sheet | A soft warning fill for caution banners and medium-risk pills. Pair with on_warning_elevated text. | — |
| **positive_elevated** | `sentiment-positive-elevated` | #F6FFED | rgb(246, 255, 237) | hsl(90, 100%, 96%) | Brand sheet | A soft positive fill for success messages and confirmations. Pair with on_positive_elevated text. | — |

## border

Edges and separators.

| Token | Code | Hex | RGB | HSL | Status | Usage | Contrast |
|---|---|---|---|---|---|---|---|
| **subtle** | `border-subtle` | #E3E3E3 | rgb(227, 227, 227) | hsl(0, 0%, 89%) | New | Used for most separators: table row dividers, card and panel borders, and hairlines. | — |
| **neutral** | `border-neutral` | #A5A5A5 | rgb(165, 165, 165) | hsl(0, 0%, 65%) | Brand sheet | Stronger static edges: emphasised panels, dashed section separators, status badges, tags and scrollbar thumbs. Also the border of disabled components. Never the only edge of an active control. | — |
| **accent** | `border-accent` | #8FCAA9 | rgb(143, 202, 169) | hsl(146, 36%, 68%) | New | Edges of accent-tinted chips, panels and the New tag. | — |
| **negative** | `border-negative` | #F2C4C0 | rgb(242, 196, 192) | hsl(5, 66%, 85%) | New | Edges of negative-tinted surfaces: error banners, high-risk pills and cards. | — |
| **warning** | `border-warning` | #EFD7A3 | rgb(239, 215, 163) | hsl(41, 70%, 79%) | New | Edges of warning-tinted surfaces: caution banners and medium-risk pills. | — |

## base

Plain light and dark, for when nothing more specific applies.

| Token | Code | Hex | RGB | HSL | Status | Usage | Contrast |
|---|---|---|---|---|---|---|---|
| **light** | `base-light` | #FFFFFF | rgb(255, 255, 255) | hsl(0, 0%, 100%) | Brand sheet | Panels, cards and dialogs, and text on filled buttons. Tailwind's white resolves to the same value. | — |
| **contrast** | `base-contrast` | #F8F8F8 | rgb(248, 248, 248) | hsl(0, 0%, 97%) | Adjusted (sheet: #F7F7F7) | The page background, table row hover and dialog footers, where white would be too prominent. | — |
| **dark** | `base-dark` | #1B1C1E | rgb(27, 28, 30) | hsl(220, 5%, 11%) | Brand sheet | Use in informational or interactive elements where a dark colour is needed. | — |

## chrome

The navy AsiaVerify Portal shell shared by every product: top bar, sidebar and navy side panels.

| Token | Code | Hex | RGB | HSL | Status | Usage | Contrast |
|---|---|---|---|---|---|---|---|
| **navy_700** | `navy-700` | #1F3954 | rgb(31, 57, 84) | hsl(211, 46%, 23%) | New | Start of the shell gradient. The top bar runs 90°, the sidebar 180°. | — |
| **navy_900** | `navy-900` | #111A24 | rgb(17, 26, 36) | hsl(212, 36%, 10%) | New | Middle of the shell gradient, at 55%. Also the value behind background.system. | — |
| **navy_950** | `navy-950` | #0B1016 | rgb(11, 16, 22) | hsl(213, 33%, 6%) | New | End of the shell gradient. | — |
| **navy_600** | `navy-600` | #2A4A6A | rgb(42, 74, 106) | hsl(210, 43%, 29%) | New | Scrollbar thumb inside the sidebar. | — |
| **accent** | `chrome-accent` | #2FBF87 | rgb(47, 191, 135) | hsl(157, 61%, 47%) | New | Green on navy only: 'Asia' in the logo, the active sub-navigation marker, notification counts and toast check icons. Never on white. | 5.04:1 on navy_700, 7.45:1 on navy_900 |
| **content_main** | `chrome-content-main` | #FFFFFFD9 | rgba(255, 255, 255, 0.85) | hsla(0, 0%, 100%, 0.85) | New | Secondary text and icon buttons on navy. Primary text on navy is base.light. | 9.02:1 on navy_700 |
| **content_tertiary** | `chrome-content-tertiary` | #FFFFFFB2 | rgba(255, 255, 255, 0.7) | hsla(0, 0%, 100%, 0.7) | New | Inactive navigation items, toast body text and meta text on navy. | 6.72:1 on navy_700 |
| **hover** | `chrome-hover` | #FFFFFF0D | rgba(255, 255, 255, 0.05) | hsla(0, 0%, 100%, 0.05) | New | Hover fill of sidebar rows. | — |
| **selected** | `chrome-selected` | #FFFFFF12 | rgba(255, 255, 255, 0.07) | hsla(0, 0%, 100%, 0.07) | New | The active sidebar row, and raised cards on navy panels. | — |
| **control_hover** | `chrome-control-hover` | #FFFFFF1A | rgba(255, 255, 255, 0.1) | hsla(0, 0%, 100%, 0.1) | New | Hover fill of buttons on navy: icon buttons, toast actions, system-bar actions. | — |
| **border** | `chrome-border` | #FFFFFF1F | rgba(255, 255, 255, 0.12) | hsla(0, 0%, 100%, 0.12) | New | Dividers and edges on navy: sidebar rules, sub-navigation lines and card outlines. | — |

## chart

A categorical pair for two-series charts, such as new vs reviewed. Validated for colour-vision deficiency; always pair it with a legend, direct labels or a table.

| Token | Code | Hex | RGB | HSL | Status | Usage | Contrast |
|---|---|---|---|---|---|---|---|
| **new** | `chart-new` | #2F75B5 | rgb(47, 117, 181) | hsl(209, 59%, 45%) | New | The first series in a two-series chart, such as changes detected. A mid blue on the brand's blue hue. | 4.85:1 on white |
| **reviewed** | `chart-reviewed` | #009A7E | rgb(0, 154, 126) | hsl(169, 100%, 30%) | New | The second series, such as changes reviewed. Alias of interactive.contrast in light mode. | 3.55:1 on white |

## severity

Product layer: pKYB's client-defined High / Medium / Low tiers, built from the sentiment tokens. Other products add their own product tokens alongside, built the same way.

| Token | Code | Hex | RGB | HSL | Status | Usage | Contrast |
|---|---|---|---|---|---|---|---|
| **high** | `high` | #95231E | rgb(149, 35, 30) | hsl(3, 66%, 35%) | New | High label text. Alias of content.on_negative_elevated. | — |
| **high_bg** | `high-bg` | #FFEFEF | rgb(255, 239, 239) | hsl(0, 100%, 97%) | New | High pill fill. Alias of sentiment.negative_elevated. | — |
| **high_line** | `high-line` | #F2C4C0 | rgb(242, 196, 192) | hsl(5, 66%, 85%) | New | High pill and lead-card edge. Alias of border.negative. | — |
| **high_cell** | `high-cell` | #D14343 | rgb(209, 67, 67) | hsl(0, 61%, 54%) | New | High dots, legend swatches and the darkest heatmap step. Alias of sentiment.negative. | — |
| **high_ramp_1** | `high-ramp-1` | #F3CCCC | rgb(243, 204, 204) | hsl(0, 62%, 88%) | New | Lightest heatmap step for unreviewed High changes (1 change). | — |
| **high_ramp_2** | `high-ramp-2` | #E38E8E | rgb(227, 142, 142) | hsl(0, 60%, 72%) | New | Middle heatmap step for unreviewed High changes. | — |
| **high_on_dark** | `high-on-dark` | #FFB4AE | rgb(255, 180, 174) | hsl(4, 100%, 84%) | New | High count on navy, as in the bulk-selection bar. | 10.35:1 on background.system |
| **medium** | `medium` | #9A6200 | rgb(154, 98, 0) | hsl(38, 100%, 30%) | New | Medium label text. Alias of content.on_warning_elevated. | — |
| **medium_bg** | `medium-bg` | #FFF6E8 | rgb(255, 246, 232) | hsl(37, 100%, 95%) | New | Medium pill fill. Alias of sentiment.warning_elevated. | — |
| **medium_line** | `medium-line` | #EFD7A3 | rgb(239, 215, 163) | hsl(41, 70%, 79%) | New | Medium pill edge. Alias of border.warning. | — |
| **medium_cell** | `medium-cell` | #FFAA52 | rgb(255, 170, 82) | hsl(31, 100%, 66%) | New | Medium dots, legend swatches and heatmap cells. Alias of sentiment.warning. | — |
| **low** | `low` | #444444 | rgb(68, 68, 68) | hsl(0, 0%, 27%) | New | Low label text. Alias of content.main, so Low never reads as good news. | — |
| **low_bg** | `low-bg` | #F1F1F1 | rgb(241, 241, 241) | hsl(0, 0%, 95%) | New | Low pill fill. Alias of background.subtle. | — |
| **low_line** | `low-line` | #D6D6D6 | rgb(214, 214, 214) | hsl(0, 0%, 84%) | New | Low pill edge. | — |
| **low_cell** | `low-cell` | #A5A5A5 | rgb(165, 165, 165) | hsl(0, 0%, 65%) | New | Low dots, legend swatches and heatmap cells. Same light value as border.neutral, brighter in dark mode. | — |

## Changes to send back to the brand sheet

1. **Adjust 3 values to pass contrast:**
   - content.tertiary #6F6F6F → #6B6B6B
   - content.on_warning_elevated #BB7600 → #9A6200
   - sentiment.positive #73C322 → #1B813D (the swatch's painted fill)
2. **Match Figma on 2 values:** background.elevated #FDFDFD → #FCFCFC, base.contrast #F7F7F7 → #F8F8F8.
3. **Add the tokens marked New.**
4. **Fix labels that don't match their swatch.** See the Label fixed notes in the raw palettes below.
5. **Reword interactive.contrast:** on a light-mode primary surface it is only 1.64:1. It is the text-on-primary colour, and it turns dark in dark mode.

Totals: 67 tokens. 23 from the brand sheet, 39 new, 5 adjusted.

# Figma variables

Two collections, both with a **Light Mode** and a **Dark Mode** column, as in your Variables panel.

- **Color Styles** is the palette. Each step holds its own light and dark value, so the palette switches with the mode.
- **Tokens** is the semantic layer. Each token aliases one Color Styles step in both modes, and Figma resolves the step for the frame's mode. The Light and Dark columns show what each token resolves to.

**Status of Color Styles steps:** In Figma = unchanged · Adjust = in Figma today, value changes · Confirm = from the brand sheets, not visible in the screenshot, so check it against your file · Add = new step.

## Collection: Color Styles

### color / neutral

| Name | Light Mode | Dark Mode | Status | Aliased by | Note |
|---|---|---|---|---|---|
| 0 | FFFFFF | 1C1C1B | In Figma | base/light |  |
| 100 | FCFCFC | 1C1C1B | In Figma | background/elevated |  |
| 200 | F8F8F8 | 202020 | In Figma | base/contrast |  |
| 225 | F8F7F4 | 27241B | Add | background/accent | background.accent: the warm off-white, darkening to velvet black. |
| 250 | F1F1F1 | FFFFFF · 6% | Add | background/subtle, severity/low_bg | Quiet fills and hover. Translucent in dark so it works on every surface. |
| 300 | ECECEC | 27241B | In Figma | — |  |
| 350 | E3E3E3 | FFFFFF · 10% | Add | border/subtle | Hairlines. |
| 400 | DEDEDE | 626262 | In Figma | — |  |
| 450 | D6D6D6 | FFFFFF · 10% | Add | severity/low_line | Low severity pill edge. |
| 480 | A5A5A5 | 545454 | Add | border/neutral | Solid quicksilver for strong static edges. Your gray/100 is the 20% tint of it. |
| 490 | A5A5A5 | 8D8D8D | Add | severity/low_cell | Low severity dots. A separate step because the dot needs 3:1 in dark and the edge doesn't. |
| 500 | 5E5E5E | 9A9A9A | In Figma | content/disabled | Dark disabled text (9A9A9A) is brighter than dark tertiary text, the same inversion as in light. |
| 600 | 6B6B6B | 979797 | Adjust | content/tertiary | Was 6F6F6F / 8D8D8D. Light fails 4.5:1 on tinted fills; dark fails on the green accent (4.05:1). |
| 650 | 626262 | 8D8D8D | Add | interactive/secondary | Input borders (interactive.secondary). Your neutral/700 (424242) is the darker value the sheet's swatch paints; pick one. |
| 700 | 424242 | B1B1B1 | In Figma | — |  |
| 800 | 444444 | B6B6B6 | In Figma | content/main, severity/low |  |
| 900 | 292929 | C3C3C3 | In Figma | — |  |
| 950 | 292929 | 111111 | Add | background/demoted | background.demoted has to stay a dark surface in dark mode; neutral/900 turns light. |
| 1000 | 1B1C1E | CDCED1 | In Figma | content/primary, base/dark |  |

### color / gray

| Name | Light Mode | Dark Mode | Status | Aliased by | Note |
|---|---|---|---|---|---|
| 100 | A5A5A5 · 20% | 626262 | In Figma | background/neutral |  |
| 200 | 0E0F0C · 12% | FFFFFF · 12% | Adjust | background/overlay | Dark was 0E0E0E. A dark edge around flags vanishes on dark surfaces. |
| 300 | 010B13 · 37% | FFFFFF | In Figma | — |  |
| 400 | 0B1016 · 55% | 010B13 · 70% | Add | background/scrim | Scrim behind dialogs and the mobile drawer. |
| 500 | FFFFFF · 5% | FFFFFF · 5% | Add | chrome/hover | On navy. The shell stays navy in dark mode, so these don't change. |
| 600 | FFFFFF · 7% | FFFFFF · 7% | Add | chrome/selected |  |
| 700 | FFFFFF · 10% | FFFFFF · 10% | Add | chrome/control_hover |  |
| 800 | FFFFFF · 12% | FFFFFF · 12% | Add | chrome/border |  |
| 850 | FFFFFF · 70% | FFFFFF · 70% | Add | chrome/content_tertiary |  |
| 900 | FFFFFF · 85% | FFFFFF · 85% | Add | chrome/content_main |  |

### color / green

| Name | Light Mode | Dark Mode | Status | Aliased by | Note |
|---|---|---|---|---|---|
| 100 | F6FFED | 1C3800 | Confirm | sentiment/positive_elevated |  |
| 150 | EDF5EF | 1F2B23 | Add | interactive/selected | Selected rows. |
| 200 | E5F1E8 | 203325 | Confirm | interactive/accent |  |
| 250 | D6E9DA | 2A4231 | Add | interactive/accent_hover | Hover on accent fills. |
| 300 | 8FCAA9 | 00BD9A · 35% | Add | border/accent | Edges of accent chips. |
| 350 | 2FBF87 | 2FBF87 | Add | chrome/accent | Green on navy. Unchanged, because the shell stays navy. |
| 400 | 009A7E | 1C1C1B | Adjust | interactive/contrast | Text on a primary fill. In dark the fill turns bright, so this turns dark. The sheet pairs it with billiard. |
| 450 | 009A7E | 1FA676 | Add | chart/reviewed | chart/reviewed. A separate step from green/400, whose dark value is a text colour. |
| 500 | 00735F | 00BD9A | Confirm | interactive/primary | Dark is billiard's label. The swatch paints #F0FFF1, which would make primary buttons nearly white. |
| 600 | 1B813D | A3E363 | Confirm | sentiment/positive |  |
| 700 | 397300 | A6D872 | Confirm | content/on_positive_elevated |  |
| 800 | 004D3F | 9AF4E3 | Confirm | content/link, interactive/control | Dark is freezy breezy's on-brand teal label. The swatch paints a lime #DAFC8F. |

### color / red

| Name | Light Mode | Dark Mode | Status | Aliased by | Note |
|---|---|---|---|---|---|
| 100 | FFEFEF | 3A0505 | Confirm | sentiment/negative_elevated, severity/high_bg |  |
| 200 | F3CCCC | FCBCB4 · 30% | Add | severity/high_ramp_1 | Heatmap step 1. |
| 250 | F2C4C0 | FCBCB4 · 40% | Add | border/negative, severity/high_line | High pill and lead-card edge. |
| 300 | FFB4AE | FFB4AE | Add | severity/high_on_dark | High count on the navy bulk bar. Unchanged. |
| 350 | E38E8E | FCBCB4 · 60% | Add | severity/high_ramp_2 | Heatmap step 2. |
| 500 | D14343 | FCBCB4 | Confirm | sentiment/negative, severity/high_cell |  |
| 550 | A52B25 | FFDAD5 | Add | sentiment/negative_hover | Danger button hover. |
| 600 | 95231E | FFE5E2 | Confirm | content/on_negative_elevated, severity/high |  |

### color / yellow

| Name | Light Mode | Dark Mode | Status | Aliased by | Note |
|---|---|---|---|---|---|
| 100 | FFF6E8 | 3E2807 | Confirm | sentiment/warning_elevated, severity/medium_bg |  |
| 200 | EFD7A3 | F4C430 · 40% | Add | border/warning, severity/medium_line | Medium pill edge. |
| 500 | FFAA52 | F4C430 | In Figma | sentiment/warning, severity/medium_cell |  |
| 600 | 9A6200 | FFDB58 | Adjust | content/on_warning_elevated, severity/medium | Light was BB7600, 3.44:1 on yellow/100. |

### color / blue

| Name | Light Mode | Dark Mode | Status | Aliased by | Note |
|---|---|---|---|---|---|
| 100 | AFDBF5 | 013263 | Confirm | — |  |
| 500 | 2F75B5 | 4F8FD0 | Add | chart/new | chart/new. Lighter in dark mode to stay inside the chart lightness band on the dark panel. |
| 600 | 2A4A6A | 2A4A6A | Add | chrome/navy_600 | Navy shell. The shell stays navy in dark mode. |
| 700 | 1F3954 | 1F3954 | Add | chrome/navy_700 |  |
| 750 | 1B3147 | E1FEFF | Confirm | — |  |
| 800 | 172636 | CDCED1 | Add | interactive/inverse | Selected status chip and pressed primary button. Turns light in dark mode. |
| 850 | 111A24 | 1B3147 | Add | background/system | Toasts, tooltips and system bars. Lifts to blue whale so they stand off a dark page. |
| 900 | 111A24 | 111A24 | Add | chrome/navy_900 | Navy shell. |
| 950 | 0B1016 | 0B1016 | Add | chrome/navy_950 | Navy shell. |

### color / purple

| Name | Light Mode | Dark Mode | Status | Aliased by | Note |
|---|---|---|---|---|---|
| 100 | FAEAFF | 30073E | Confirm | — |  |
| 500 | 512888 | 9975C8 | Confirm | — |  |

## Collection: Tokens

### content

| Name | Alias | Light Mode | Dark Mode |
|---|---|---|---|
| primary | color/neutral/1000 | 1B1C1E | CDCED1 |
| main | color/neutral/800 | 444444 | B6B6B6 |
| tertiary | color/neutral/600 | 6B6B6B | 979797 |
| disabled | color/neutral/500 | 5E5E5E | 9A9A9A |
| link | color/green/800 | 004D3F | 9AF4E3 |
| on_negative_elevated | color/red/600 | 95231E | FFE5E2 |
| on_warning_elevated | color/yellow/600 | 9A6200 | FFDB58 |
| on_positive_elevated | color/green/700 | 397300 | A6D872 |

### interactive

| Name | Alias | Light Mode | Dark Mode |
|---|---|---|---|
| primary | color/green/500 | 00735F | 00BD9A |
| control | color/green/800 | 004D3F | 9AF4E3 |
| accent | color/green/200 | E5F1E8 | 203325 |
| accent_hover | color/green/250 | D6E9DA | 2A4231 |
| selected | color/green/150 | EDF5EF | 1F2B23 |
| secondary | color/neutral/650 | 626262 | 8D8D8D |
| inverse | color/blue/800 | 172636 | CDCED1 |
| contrast | color/green/400 | 009A7E | 1C1C1B |

### background

| Name | Alias | Light Mode | Dark Mode |
|---|---|---|---|
| subtle | color/neutral/250 | F1F1F1 | FFFFFF · 6% |
| system | color/blue/850 | 111A24 | 1B3147 |
| scrim | color/gray/400 | 0B1016 · 55% | 010B13 · 70% |
| elevated | color/neutral/100 | FCFCFC | 1C1C1B |
| demoted | color/neutral/950 | 292929 | 111111 |
| accent | color/neutral/225 | F8F7F4 | 27241B |
| neutral | color/gray/100 | A5A5A5 · 20% | 626262 |
| overlay | color/gray/200 | 0E0F0C · 12% | FFFFFF · 12% |

### sentiment

| Name | Alias | Light Mode | Dark Mode |
|---|---|---|---|
| negative | color/red/500 | D14343 | FCBCB4 |
| negative_hover | color/red/550 | A52B25 | FFDAD5 |
| warning | color/yellow/500 | FFAA52 | F4C430 |
| positive | color/green/600 | 1B813D | A3E363 |
| negative_elevated | color/red/100 | FFEFEF | 3A0505 |
| warning_elevated | color/yellow/100 | FFF6E8 | 3E2807 |
| positive_elevated | color/green/100 | F6FFED | 1C3800 |

### border

| Name | Alias | Light Mode | Dark Mode |
|---|---|---|---|
| subtle | color/neutral/350 | E3E3E3 | FFFFFF · 10% |
| neutral | color/neutral/480 | A5A5A5 | 545454 |
| accent | color/green/300 | 8FCAA9 | 00BD9A · 35% |
| negative | color/red/250 | F2C4C0 | FCBCB4 · 40% |
| warning | color/yellow/200 | EFD7A3 | F4C430 · 40% |

### base

| Name | Alias | Light Mode | Dark Mode |
|---|---|---|---|
| light | color/neutral/0 | FFFFFF | 1C1C1B |
| contrast | color/neutral/200 | F8F8F8 | 202020 |
| dark | color/neutral/1000 | 1B1C1E | CDCED1 |

### chrome

| Name | Alias | Light Mode | Dark Mode |
|---|---|---|---|
| navy_700 | color/blue/700 | 1F3954 | 1F3954 |
| navy_900 | color/blue/900 | 111A24 | 111A24 |
| navy_950 | color/blue/950 | 0B1016 | 0B1016 |
| navy_600 | color/blue/600 | 2A4A6A | 2A4A6A |
| accent | color/green/350 | 2FBF87 | 2FBF87 |
| content_main | color/gray/900 | FFFFFF · 85% | FFFFFF · 85% |
| content_tertiary | color/gray/850 | FFFFFF · 70% | FFFFFF · 70% |
| hover | color/gray/500 | FFFFFF · 5% | FFFFFF · 5% |
| selected | color/gray/600 | FFFFFF · 7% | FFFFFF · 7% |
| control_hover | color/gray/700 | FFFFFF · 10% | FFFFFF · 10% |
| border | color/gray/800 | FFFFFF · 12% | FFFFFF · 12% |

### chart

| Name | Alias | Light Mode | Dark Mode |
|---|---|---|---|
| new | color/blue/500 | 2F75B5 | 4F8FD0 |
| reviewed | color/green/450 | 009A7E | 1FA676 |

### severity

| Name | Alias | Light Mode | Dark Mode |
|---|---|---|---|
| high | color/red/600 | 95231E | FFE5E2 |
| high_bg | color/red/100 | FFEFEF | 3A0505 |
| high_line | color/red/250 | F2C4C0 | FCBCB4 · 40% |
| high_cell | color/red/500 | D14343 | FCBCB4 |
| high_ramp_1 | color/red/200 | F3CCCC | FCBCB4 · 30% |
| high_ramp_2 | color/red/350 | E38E8E | FCBCB4 · 60% |
| high_on_dark | color/red/300 | FFB4AE | FFB4AE |
| medium | color/yellow/600 | 9A6200 | FFDB58 |
| medium_bg | color/yellow/100 | FFF6E8 | 3E2807 |
| medium_line | color/yellow/200 | EFD7A3 | F4C430 · 40% |
| medium_cell | color/yellow/500 | FFAA52 | F4C430 |
| low | color/neutral/800 | 444444 | B6B6B6 |
| low_bg | color/neutral/250 | F1F1F1 | FFFFFF · 6% |
| low_line | color/neutral/450 | D6D6D6 | FFFFFF · 10% |
| low_cell | color/neutral/490 | A5A5A5 | 8D8D8D |

# Raw palette: light

Primitive colours, named in the brand sheet's style. Names of new colours are proposals; rename them as you like. **Label fixed** means the sheet's hex, rgb or painted swatch disagree; the hex shown is the one to keep.

## neutral

| Name | Hex | RGB | HSL | Source | Used by | Note |
|---|---|---|---|---|---|---|
| **white** | #FFFFFF | rgb(255, 255, 255) | hsl(0, 0%, 100%) | Brand | base.light |  |
| **bold white** | #FCFCFC | rgb(252, 252, 252) | hsl(0, 0%, 99%) | Label fixed | background.elevated | The semantic sheet says #FDFDFD; Figma and the code use #FCFCFC. |
| **desert storm** | #F8F8F8 | rgb(248, 248, 248) | hsl(0, 0%, 97%) | Label fixed | base.contrast | Swatch is painted #ECECEC. Figma neutral/200. The page background. |
| **porcelain** | #ECECEC | rgb(236, 236, 236) | hsl(0, 0%, 93%) | New | unused | Figma neutral/300. Not on the raw sheet. |
| **gainsboro** | #DEDEDE | rgb(222, 222, 222) | hsl(0, 0%, 87%) | New | unused | Figma neutral/400. Not on the raw sheet. |
| **linen white** | #F8F7F4 | rgb(248, 247, 244) | hsl(45, 22%, 96%) | New | background.accent | The warm off-white behind background.accent. On the semantic sheet, but missing from the raw one. |
| **off-white** | #F7F7F7 | rgb(247, 247, 247) | hsl(0, 0%, 97%) | Label fixed | unused | rgb label says (244, 244, 244). Not in Figma; the page now uses desert storm (#F8F8F8), as Figma does. |
| **gallery** | #F1F1F1 | rgb(241, 241, 241) | hsl(0, 0%, 95%) | New | background.subtle, severity.low_bg |  |
| **mercury** | #E3E3E3 | rgb(227, 227, 227) | hsl(0, 0%, 89%) | New | border.subtle |  |
| **alto** | #D6D6D6 | rgb(214, 214, 214) | hsl(0, 0%, 84%) | New | severity.low_line |  |
| **shadows** | #6F6F6F | rgb(111, 111, 111) | hsl(0, 0%, 44%) | Brand | unused |  |
| **dove grey** | #6B6B6B | rgb(107, 107, 107) | hsl(0, 0%, 42%) | New | content.tertiary | Replaces shadows as content.tertiary to pass 4.5:1 on tinted fills. |
| **cloak grey** | #626262 | rgb(98, 98, 98) | hsl(0, 0%, 38%) | Label fixed | interactive.secondary | Swatch is painted #424242, which is what Figma neutral/700 holds. |
| **charcoal** | #424242 | rgb(66, 66, 66) | hsl(0, 0%, 26%) | New | unused | Figma neutral/700, the painted cloak grey. |
| **iron** | #5E5E5E | rgb(94, 94, 94) | hsl(0, 0%, 37%) | Brand | content.disabled |  |
| **vulcanized** | #444444 | rgb(68, 68, 68) | hsl(0, 0%, 27%) | Brand | content.main, severity.low |  |
| **dire wolf** | #292929 | rgb(41, 41, 41) | hsl(0, 0%, 16%) | Brand | background.demoted |  |
| **satin deep black** | #1B1C1E | rgb(27, 28, 30) | hsl(220, 5%, 11%) | Brand | content.primary, base.dark |  |

## green

| Name | Hex | RGB | HSL | Source | Used by | Note |
|---|---|---|---|---|---|---|
| **pearl powder** | #F6FFED | rgb(246, 255, 237) | hsl(90, 100%, 96%) | Brand | sentiment.positive_elevated |  |
| **panache** | #EDF5EF | rgb(237, 245, 239) | hsl(135, 29%, 95%) | New | interactive.selected |  |
| **polar** | #E5F1E8 | rgb(229, 241, 232) | hsl(135, 30%, 92%) | Brand | interactive.accent |  |
| **granny apple** | #D6E9DA | rgb(214, 233, 218) | hsl(133, 30%, 88%) | New | interactive.accent_hover |  |
| **vista mint** | #8FCAA9 | rgb(143, 202, 169) | hsl(146, 36%, 68%) | New | border.accent |  |
| **shamrock** | #2FBF87 | rgb(47, 191, 135) | hsl(157, 61%, 47%) | New | chrome.accent |  |
| **paolo veronese green** | #009A7E | rgb(0, 154, 126) | hsl(169, 100%, 30%) | Brand | interactive.contrast, chart.reviewed |  |
| **tropical rainforest** | #00735F | rgb(0, 115, 95) | hsl(170, 100%, 23%) | Brand | interactive.primary |  |
| **zunda green** | #1B813D | rgb(27, 129, 61) | hsl(140, 65%, 31%) | Label fixed | sentiment.positive | Label says #73C322 (2.20:1 on white); rgb says #009A7E. #1B813D is the painted swatch. |
| **enchanted forest** | #397300 | rgb(57, 115, 0) | hsl(90, 100%, 23%) | Label fixed | content.on_positive_elevated | rgb label says (81, 138, 23) = #518A17, which fails at 4.09:1. |
| **tropical forest** | #004D3F | rgb(0, 77, 63) | hsl(169, 100%, 15%) | Brand | content.link, interactive.control |  |

## grey

| Name | Hex | RGB | HSL | Source | Used by | Note |
|---|---|---|---|---|---|---|
| **quicksilver** | #A5A5A5 | rgb(165, 165, 165) | hsl(0, 0%, 65%) | Brand | border.neutral, severity.low_cell |  |
| **quicksilver 20%** | #A5A5A533 | rgba(165, 165, 165, 0.2) | hsla(0, 0%, 65%, 0.2) | Brand | background.neutral |  |
| **black knight 37%** | #010B135E | rgba(1, 11, 19, 0.37) | hsla(207, 90%, 4%, 0.37) | Brand | unused | Figma gray/300. |
| **overlay** | #0E0F0C1F | rgba(14, 15, 12, 0.12) | hsla(80, 11%, 5%, 0.12) | Brand | background.overlay |  |
| **black knight** | #010B13 | rgb(1, 11, 19) | hsl(207, 90%, 4%) | Brand | unused |  |
| **white 5%** | #FFFFFF0D | rgba(255, 255, 255, 0.05) | hsla(0, 0%, 100%, 0.05) | New | chrome.hover |  |
| **white 7%** | #FFFFFF12 | rgba(255, 255, 255, 0.07) | hsla(0, 0%, 100%, 0.07) | New | chrome.selected |  |
| **white 10%** | #FFFFFF1A | rgba(255, 255, 255, 0.1) | hsla(0, 0%, 100%, 0.1) | New | chrome.control_hover |  |
| **white 12%** | #FFFFFF1F | rgba(255, 255, 255, 0.12) | hsla(0, 0%, 100%, 0.12) | New | chrome.border |  |
| **white 70%** | #FFFFFFB2 | rgba(255, 255, 255, 0.7) | hsla(0, 0%, 100%, 0.7) | New | chrome.content_tertiary |  |
| **white 85%** | #FFFFFFD9 | rgba(255, 255, 255, 0.85) | hsla(0, 0%, 100%, 0.85) | New | chrome.content_main |  |
| **bunker 55%** | #0B10168C | rgba(11, 16, 22, 0.55) | hsla(213, 33%, 6%, 0.55) | New | background.scrim |  |

## red

| Name | Hex | RGB | HSL | Source | Used by | Note |
|---|---|---|---|---|---|---|
| **translucent unicorn** | #FFEFEF | rgb(255, 239, 239) | hsl(0, 100%, 97%) | Brand | sentiment.negative_elevated, severity.high_bg |  |
| **cavern pink** | #F3CCCC | rgb(243, 204, 204) | hsl(0, 62%, 88%) | New | severity.high_ramp_1 |  |
| **cinderella** | #F2C4C0 | rgb(242, 196, 192) | hsl(5, 66%, 85%) | New | border.negative, severity.high_line |  |
| **sundown** | #FFB4AE | rgb(255, 180, 174) | hsl(4, 100%, 84%) | New | severity.high_on_dark |  |
| **sea pink** | #E38E8E | rgb(227, 142, 142) | hsl(0, 60%, 72%) | New | severity.high_ramp_2 |  |
| **smooch rouge** | #D14343 | rgb(209, 67, 67) | hsl(0, 61%, 54%) | Label fixed | sentiment.negative, severity.high_cell | Label says #E79C9C; rgb and the swatch are #D14343. |
| **mexican red** | #A52B25 | rgb(165, 43, 37) | hsl(3, 63%, 40%) | New | sentiment.negative_hover |  |
| **antique port wine** | #95231E | rgb(149, 35, 30) | hsl(3, 66%, 35%) | Brand | content.on_negative_elevated, severity.high |  |

## yellow

| Name | Hex | RGB | HSL | Source | Used by | Note |
|---|---|---|---|---|---|---|
| **soft pillow** | #FFF6E8 | rgb(255, 246, 232) | hsl(37, 100%, 95%) | Brand | sentiment.warning_elevated, severity.medium_bg |  |
| **givry** | #EFD7A3 | rgb(239, 215, 163) | hsl(41, 70%, 79%) | New | border.warning, severity.medium_line |  |
| **sandy brown** | #FFAA52 | rgb(255, 170, 82) | hsl(31, 100%, 66%) | Brand | sentiment.warning, severity.medium_cell |  |
| **golden brown** | #BB7600 | rgb(187, 118, 0) | hsl(38, 100%, 37%) | Brand | unused | 3.44:1 on soft pillow, so warning text uses bronze. |
| **bronze** | #9A6200 | rgb(154, 98, 0) | hsl(38, 100%, 30%) | New | content.on_warning_elevated, severity.medium |  |

## blue

| Name | Hex | RGB | HSL | Source | Used by | Note |
|---|---|---|---|---|---|---|
| **endless horizon** | #AFDBF5 | rgb(175, 219, 245) | hsl(202, 78%, 82%) | Brand | unused |  |
| **mariner** | #2F75B5 | rgb(47, 117, 181) | hsl(209, 59%, 45%) | New | chart.new | Chart series blue, on the brand's blue hue. |
| **san juan** | #2A4A6A | rgb(42, 74, 106) | hsl(210, 43%, 29%) | New | chrome.navy_600 |  |
| **cloud burst** | #1F3954 | rgb(31, 57, 84) | hsl(211, 46%, 23%) | New | chrome.navy_700 | Close to blue whale. Aligning the two would cut one navy. |
| **blue whale** | #1B3147 | rgb(27, 49, 71) | hsl(210, 45%, 19%) | Brand | unused |  |
| **mirage** | #172636 | rgb(23, 38, 54) | hsl(211, 40%, 15%) | New | interactive.inverse |  |
| **ebony clay** | #111A24 | rgb(17, 26, 36) | hsl(212, 36%, 10%) | New | background.system, chrome.navy_900 |  |
| **bunker** | #0B1016 | rgb(11, 16, 22) | hsl(213, 33%, 6%) | New | chrome.navy_950 |  |

## purple

| Name | Hex | RGB | HSL | Source | Used by | Note |
|---|---|---|---|---|---|---|
| **strawberry bonbon** | #FAEAFF | rgb(250, 234, 255) | hsl(286, 100%, 96%) | Brand | unused |  |
| **tekhelet** | #512888 | rgb(81, 40, 136) | hsl(266, 55%, 35%) | Brand | unused |  |

# Raw palette: dark

The dark value of every Color Styles step, named after the dark sheet where it has one. Figma holds the dark sheet's painted swatches, not its hex labels.

## neutral

| Name | Hex | RGB | HSL | Source | Steps | Used by |
|---|---|---|---|---|---|---|
| **coco's black** | #1C1C1B | rgb(28, 28, 27) | hsl(60, 2%, 11%) | Brand | neutral/0, neutral/100 | base.light, background.elevated |
| **lead** | #202020 | rgb(32, 32, 32) | hsl(0, 0%, 13%) | Brand | neutral/200 | base.contrast |
| **velvet black** | #27241B | rgb(39, 36, 27) | hsl(45, 18%, 13%) | Brand | neutral/225, neutral/300 | background.accent |
| **new** | #FFFFFF0F | rgba(255, 255, 255, 0.06) | hsla(0, 0%, 100%, 0.06) | New | neutral/250 | background.subtle, severity.low_bg |
| **new** | #FFFFFF1A | rgba(255, 255, 255, 0.1) | hsla(0, 0%, 100%, 0.1) | New | neutral/350, neutral/450 | border.subtle, severity.low_line |
| **new** | #626262 | rgb(98, 98, 98) | hsl(0, 0%, 38%) | Brand | neutral/400 | unused |
| **new** | #545454 | rgb(84, 84, 84) | hsl(0, 0%, 33%) | New | neutral/480 | border.neutral |
| **new** | #8D8D8D | rgb(141, 141, 141) | hsl(0, 0%, 55%) | New | neutral/490, neutral/650 | severity.low_cell, interactive.secondary |
| **cloak grey** | #9A9A9A | rgb(154, 154, 154) | hsl(0, 0%, 60%) | Brand | neutral/500 | content.disabled |
| **stone cold** | #979797 | rgb(151, 151, 151) | hsl(0, 0%, 59%) | Adjusted | neutral/600 | content.tertiary |
| **pedigrey** | #B1B1B1 | rgb(177, 177, 177) | hsl(0, 0%, 69%) | Brand | neutral/700 | unused |
| **million grey** | #B6B6B6 | rgb(182, 182, 182) | hsl(0, 0%, 71%) | Brand | neutral/800 | content.main, severity.low |
| **steam engine** | #C3C3C3 | rgb(195, 195, 195) | hsl(0, 0%, 76%) | Brand | neutral/900 | unused |
| **new** | #111111 | rgb(17, 17, 17) | hsl(0, 0%, 7%) | New | neutral/950 | background.demoted |
| **weathered stone** | #CDCED1 | rgb(205, 206, 209) | hsl(225, 4%, 81%) | Brand | neutral/1000 | content.primary, base.dark |

## gray

| Name | Hex | RGB | HSL | Source | Steps | Used by |
|---|---|---|---|---|---|---|
| **new** | #626262 | rgb(98, 98, 98) | hsl(0, 0%, 38%) | Brand | gray/100 | background.neutral |
| **new** | #FFFFFF1F | rgba(255, 255, 255, 0.12) | hsla(0, 0%, 100%, 0.12) | Adjusted | gray/200, gray/800 | background.overlay, chrome.border |
| **new** | #FFFFFF | rgb(255, 255, 255) | hsl(0, 0%, 100%) | Brand | gray/300 | unused |
| **new** | #010B13B2 | rgba(1, 11, 19, 0.7) | hsla(207, 90%, 4%, 0.7) | New | gray/400 | background.scrim |
| **new** | #FFFFFF0D | rgba(255, 255, 255, 0.05) | hsla(0, 0%, 100%, 0.05) | New | gray/500 | chrome.hover |
| **new** | #FFFFFF12 | rgba(255, 255, 255, 0.07) | hsla(0, 0%, 100%, 0.07) | New | gray/600 | chrome.selected |
| **new** | #FFFFFF1A | rgba(255, 255, 255, 0.1) | hsla(0, 0%, 100%, 0.1) | New | gray/700 | chrome.control_hover |
| **new** | #FFFFFFB2 | rgba(255, 255, 255, 0.7) | hsla(0, 0%, 100%, 0.7) | New | gray/850 | chrome.content_tertiary |
| **new** | #FFFFFFD9 | rgba(255, 255, 255, 0.85) | hsla(0, 0%, 100%, 0.85) | New | gray/900 | chrome.content_main |

## green

| Name | Hex | RGB | HSL | Source | Steps | Used by |
|---|---|---|---|---|---|---|
| **melancholia** | #1C3800 | rgb(28, 56, 0) | hsl(90, 100%, 11%) | Brand | green/100 | sentiment.positive_elevated |
| **new** | #1F2B23 | rgb(31, 43, 35) | hsl(140, 16%, 15%) | New | green/150 | interactive.selected |
| **bitter liquorice** | #203325 | rgb(32, 51, 37) | hsl(136, 23%, 16%) | Brand | green/200 | interactive.accent |
| **new** | #2A4231 | rgb(42, 66, 49) | hsl(138, 22%, 21%) | New | green/250 | interactive.accent_hover |
| **new** | #00BD9A59 | rgba(0, 189, 154, 0.35) | hsla(169, 100%, 37%, 0.35) | New | green/300 | border.accent |
| **new** | #2FBF87 | rgb(47, 191, 135) | hsl(157, 61%, 47%) | New | green/350 | chrome.accent |
| **billiard** | #1C1C1B | rgb(28, 28, 27) | hsl(60, 2%, 11%) | Adjusted | green/400 | interactive.contrast |
| **new** | #1FA676 | rgb(31, 166, 118) | hsl(159, 69%, 39%) | New | green/450 | chart.reviewed |
| **billiard** | #00BD9A | rgb(0, 189, 154) | hsl(169, 100%, 37%) | Brand | green/500 | interactive.primary |
| **last of lettuce** | #A3E363 | rgb(163, 227, 99) | hsl(90, 70%, 64%) | Brand | green/600 | sentiment.positive |
| **last of lettuce** | #A6D872 | rgb(166, 216, 114) | hsl(89, 57%, 65%) | Brand | green/700 | content.on_positive_elevated |
| **freezy breezy** | #9AF4E3 | rgb(154, 244, 227) | hsl(169, 80%, 78%) | Brand | green/800 | content.link, interactive.control |

## red

| Name | Hex | RGB | HSL | Source | Steps | Used by |
|---|---|---|---|---|---|---|
| **lonely chocolate** | #3A0505 | rgb(58, 5, 5) | hsl(0, 84%, 12%) | Brand | red/100 | sentiment.negative_elevated, severity.high_bg |
| **new** | #FCBCB44C | rgba(252, 188, 180, 0.3) | hsla(7, 92%, 85%, 0.3) | New | red/200 | severity.high_ramp_1 |
| **new** | #FCBCB466 | rgba(252, 188, 180, 0.4) | hsla(7, 92%, 85%, 0.4) | New | red/250 | border.negative, severity.high_line |
| **new** | #FFB4AE | rgb(255, 180, 174) | hsl(4, 100%, 84%) | New | red/300 | severity.high_on_dark |
| **new** | #FCBCB499 | rgba(252, 188, 180, 0.6) | hsla(7, 92%, 85%, 0.6) | New | red/350 | severity.high_ramp_2 |
| **pink floyd** | #FCBCB4 | rgb(252, 188, 180) | hsl(7, 92%, 85%) | Brand | red/500 | sentiment.negative, severity.high_cell |
| **new** | #FFDAD5 | rgb(255, 218, 213) | hsl(7, 100%, 92%) | New | red/550 | sentiment.negative_hover |
| **bride's blush** | #FFE5E2 | rgb(255, 229, 226) | hsl(6, 100%, 94%) | Brand | red/600 | content.on_negative_elevated, severity.high |

## yellow

| Name | Hex | RGB | HSL | Source | Steps | Used by |
|---|---|---|---|---|---|---|
| **secret passage** | #3E2807 | rgb(62, 40, 7) | hsl(36, 80%, 14%) | Brand | yellow/100 | sentiment.warning_elevated, severity.medium_bg |
| **new** | #F4C43066 | rgba(244, 196, 48, 0.4) | hsla(45, 90%, 57%, 0.4) | New | yellow/200 | border.warning, severity.medium_line |
| **whisky sour** | #F4C430 | rgb(244, 196, 48) | hsl(45, 90%, 57%) | Brand | yellow/500 | sentiment.warning, severity.medium_cell |
| **moccasin** | #FFDB58 | rgb(255, 219, 88) | hsl(47, 100%, 67%) | Adjusted | yellow/600 | content.on_warning_elevated, severity.medium |

## blue

| Name | Hex | RGB | HSL | Source | Steps | Used by |
|---|---|---|---|---|---|---|
| **seafarer** | #013263 | rgb(1, 50, 99) | hsl(210, 98%, 20%) | Brand | blue/100 | unused |
| **new** | #4F8FD0 | rgb(79, 143, 208) | hsl(210, 58%, 56%) | New | blue/500 | chart.new |
| **new** | #2A4A6A | rgb(42, 74, 106) | hsl(210, 43%, 29%) | New | blue/600 | chrome.navy_600 |
| **new** | #1F3954 | rgb(31, 57, 84) | hsl(211, 46%, 23%) | New | blue/700 | chrome.navy_700 |
| **ice desert** | #E1FEFF | rgb(225, 254, 255) | hsl(182, 100%, 94%) | Brand | blue/750 | unused |
| **new** | #CDCED1 | rgb(205, 206, 209) | hsl(225, 4%, 81%) | New | blue/800 | interactive.inverse |
| **new** | #1B3147 | rgb(27, 49, 71) | hsl(210, 45%, 19%) | New | blue/850 | background.system |
| **new** | #111A24 | rgb(17, 26, 36) | hsl(212, 36%, 10%) | New | blue/900 | chrome.navy_900 |
| **new** | #0B1016 | rgb(11, 16, 22) | hsl(213, 33%, 6%) | New | blue/950 | chrome.navy_950 |

## purple

| Name | Hex | RGB | HSL | Source | Steps | Used by |
|---|---|---|---|---|---|---|
| **dark purple** | #30073E | rgb(48, 7, 62) | hsl(285, 80%, 14%) | Brand | purple/100 | unused |
| **violet velvet** | #9975C8 | rgb(153, 117, 200) | hsl(266, 43%, 62%) | Brand | purple/500 | unused |

# Dark mode plan

Each semantic token's dark value. Panels are #1C1C1B (neutral/0) and the page is #202020 (neutral/200). Every text pair passes 4.5:1, and every edge or fill that carries meaning passes 3:1.

**The rule that changes in dark mode:** base.light turns dark, so text on filled buttons, chips and toasts flips from white to near-black.

**Adjust (5):** content.tertiary, content.on_warning_elevated, interactive.contrast, background.overlay, severity.medium

**Add (36):** interactive.accent_hover, interactive.selected, interactive.secondary, interactive.inverse, background.subtle, background.system, background.scrim, background.demoted, background.accent, sentiment.negative_hover, border.subtle, border.neutral, border.accent, border.negative, border.warning, chrome.navy_700, chrome.navy_900, chrome.navy_950, chrome.navy_600, chrome.accent, chrome.content_main, chrome.content_tertiary, chrome.hover, chrome.selected, chrome.control_hover, chrome.border, chart.new, chart.reviewed, severity.high_line, severity.high_ramp_1, severity.high_ramp_2, severity.high_on_dark, severity.medium_line, severity.low_bg, severity.low_line, severity.low_cell

## content

| Token | Step | Light | Dark | Status | Contrast in dark | Note |
|---|---|---|---|---|---|---|
| **primary** | color/neutral/1000 | #1B1C1E | #CDCED1 | From Figma / dark sheet | 10.84:1 on panel, 10.35:1 on page |  |
| **main** | color/neutral/800 | #444444 | #B6B6B6 | From Figma / dark sheet | 8.41:1 on panel, 8.03:1 on page |  |
| **tertiary** | color/neutral/600 | #6B6B6B | #979797 | Adjust | 5.84:1 on panel, 4.60:1 on accent, 5.03:1 on selected | Was 6F6F6F / 8D8D8D. Light fails 4.5:1 on tinted fills; dark fails on the green accent (4.05:1). |
| **disabled** | color/neutral/500 | #5E5E5E | #9A9A9A | From Figma / dark sheet | — | Brighter than tertiary in dark. Consider swapping the two steps. |
| **link** | color/green/800 | #004D3F | #9AF4E3 | From Figma / dark sheet | 13.34:1 on panel | Dark is freezy breezy's on-brand teal label. The swatch paints a lime #DAFC8F. |
| **on_negative_elevated** | color/red/600 | #95231E | #FFE5E2 | From Figma / dark sheet | 14.59:1 on negative_elevated |  |
| **on_warning_elevated** | color/yellow/600 | #9A6200 | #FFDB58 | Adjust | 10.27:1 on warning_elevated | Light was BB7600, 3.44:1 on yellow/100. |
| **on_positive_elevated** | color/green/700 | #397300 | #A6D872 | From Figma / dark sheet | 7.86:1 on positive_elevated |  |

## interactive

| Token | Step | Light | Dark | Status | Contrast in dark | Note |
|---|---|---|---|---|---|---|
| **primary** | color/green/500 | #00735F | #00BD9A | From Figma / dark sheet | 7.10:1 on panel | Text on it is base.light, which turns dark. |
| **control** | color/green/800 | #004D3F | #9AF4E3 | From Figma / dark sheet | 10.52:1 on accent, 8.54:1 on accent_hover | Also the primary button's hover in dark. |
| **accent** | color/green/200 | #E5F1E8 | #203325 | From Figma / dark sheet | — |  |
| **accent_hover** | color/green/250 | #D6E9DA | #2A4231 | Add | — | Hover on accent fills. |
| **selected** | color/green/150 | #EDF5EF | #1F2B23 | Add | — | Selected rows. |
| **secondary** | color/neutral/650 | #626262 | #8D8D8D | Add | 5.14:1 on panel, 4.91:1 on page | Input borders (interactive.secondary). Your neutral/700 (424242) is the darker value the sheet's swatch paints; pick one. |
| **inverse** | color/blue/800 | #172636 | #CDCED1 | Add | — | Selected status chip and pressed primary button. Turns light in dark mode. |
| **contrast** | color/green/400 | #009A7E | #1C1C1B | Adjust | 7.10:1 on primary | Text on a primary fill. In dark the fill turns bright, so this turns dark. The sheet pairs it with billiard. |

## background

| Token | Step | Light | Dark | Status | Contrast in dark | Note |
|---|---|---|---|---|---|---|
| **subtle** | color/neutral/250 | #F1F1F1 | #FFFFFF0F | Add | — | Quiet fills and hover. Translucent in dark so it works on every surface. |
| **system** | color/blue/850 | #111A24 | #1B3147 | Add | — | Toasts, tooltips and system bars. Lifts to blue whale so they stand off a dark page. |
| **scrim** | color/gray/400 | #0B10168C | #010B13B2 | Add | — | Scrim behind dialogs and the mobile drawer. |
| **elevated** | color/neutral/100 | #FCFCFC | #1C1C1B | From Figma / dark sheet | — |  |
| **demoted** | color/neutral/950 | #292929 | #111111 | Add | — | background.demoted has to stay a dark surface in dark mode; neutral/900 turns light. |
| **accent** | color/neutral/225 | #F8F7F4 | #27241B | Add | — | background.accent: the warm off-white, darkening to velvet black. |
| **neutral** | color/gray/100 | #A5A5A533 | #626262 | From Figma / dark sheet | — |  |
| **overlay** | color/gray/200 | #0E0F0C1F | #FFFFFF1F | Adjust | — | Dark was 0E0E0E. A dark edge around flags vanishes on dark surfaces. |

## sentiment

| Token | Step | Light | Dark | Status | Contrast in dark | Note |
|---|---|---|---|---|---|---|
| **negative** | color/red/500 | #D14343 | #FCBCB4 | From Figma / dark sheet | 10.55:1 on panel | Danger buttons use base.light text, which turns dark. |
| **negative_hover** | color/red/550 | #A52B25 | #FFDAD5 | Add | — | Danger button hover. |
| **warning** | color/yellow/500 | #FFAA52 | #F4C430 | From Figma / dark sheet | 10.38:1 on panel |  |
| **positive** | color/green/600 | #1B813D | #A3E363 | From Figma / dark sheet | 11.15:1 on panel |  |
| **negative_elevated** | color/red/100 | #FFEFEF | #3A0505 | From Figma / dark sheet | — |  |
| **warning_elevated** | color/yellow/100 | #FFF6E8 | #3E2807 | From Figma / dark sheet | — |  |
| **positive_elevated** | color/green/100 | #F6FFED | #1C3800 | From Figma / dark sheet | — |  |

## border

| Token | Step | Light | Dark | Status | Contrast in dark | Note |
|---|---|---|---|---|---|---|
| **subtle** | color/neutral/350 | #E3E3E3 | #FFFFFF1A | Add | — | Hairlines. |
| **neutral** | color/neutral/480 | #A5A5A5 | #545454 | Add | — | Solid quicksilver for strong static edges. Your gray/100 is the 20% tint of it. |
| **accent** | color/green/300 | #8FCAA9 | #00BD9A59 | Add | — | Edges of accent chips. |
| **negative** | color/red/250 | #F2C4C0 | #FCBCB466 | Add | — | High pill and lead-card edge. |
| **warning** | color/yellow/200 | #EFD7A3 | #F4C43066 | Add | — | Medium pill edge. |

## base

| Token | Step | Light | Dark | Status | Contrast in dark | Note |
|---|---|---|---|---|---|---|
| **light** | color/neutral/0 | #FFFFFF | #1C1C1B | From Figma / dark sheet | 7.10:1 as text on primary button, 10.55:1 as text on danger button, 13.19:1 as text on danger hover, 10.84:1 as text on selected chip, 1.28:1 as text on toast | Turns dark, as the sheet says: panels and text on filled buttons. |
| **contrast** | color/neutral/200 | #F8F8F8 | #202020 | From Figma / dark sheet | — | Page background. |
| **dark** | color/neutral/1000 | #1B1C1E | #CDCED1 | From Figma / dark sheet | — |  |

## chrome

| Token | Step | Light | Dark | Status | Contrast in dark | Note |
|---|---|---|---|---|---|---|
| **navy_700** | color/blue/700 | #1F3954 | #1F3954 | Add | — |  |
| **navy_900** | color/blue/900 | #111A24 | #111A24 | Add | — | Navy shell. |
| **navy_950** | color/blue/950 | #0B1016 | #0B1016 | Add | — | Navy shell. |
| **navy_600** | color/blue/600 | #2A4A6A | #2A4A6A | Add | — | Navy shell. The shell stays navy in dark mode. |
| **accent** | color/green/350 | #2FBF87 | #2FBF87 | Add | — | Green on navy. Unchanged, because the shell stays navy. |
| **content_main** | color/gray/900 | #FFFFFFD9 | #FFFFFFD9 | Add | — |  |
| **content_tertiary** | color/gray/850 | #FFFFFFB2 | #FFFFFFB2 | Add | 6.72:1 on navy-700 |  |
| **hover** | color/gray/500 | #FFFFFF0D | #FFFFFF0D | Add | — | On navy. The shell stays navy in dark mode, so these don't change. |
| **selected** | color/gray/600 | #FFFFFF12 | #FFFFFF12 | Add | — |  |
| **control_hover** | color/gray/700 | #FFFFFF1A | #FFFFFF1A | Add | — |  |
| **border** | color/gray/800 | #FFFFFF1F | #FFFFFF1F | Add | — |  |

## chart

| Token | Step | Light | Dark | Status | Contrast in dark | Note |
|---|---|---|---|---|---|---|
| **new** | color/blue/500 | #2F75B5 | #4F8FD0 | Add | — | chart/new. Lighter in dark mode to stay inside the chart lightness band on the dark panel. |
| **reviewed** | color/green/450 | #009A7E | #1FA676 | Add | — | chart/reviewed. A separate step from green/400, whose dark value is a text colour. |

## severity

| Token | Step | Light | Dark | Status | Contrast in dark | Note |
|---|---|---|---|---|---|---|
| **high** | color/red/600 | #95231E | #FFE5E2 | From Figma / dark sheet | — |  |
| **high_bg** | color/red/100 | #FFEFEF | #3A0505 | From Figma / dark sheet | — |  |
| **high_line** | color/red/250 | #F2C4C0 | #FCBCB466 | Add | — | High pill and lead-card edge. |
| **high_cell** | color/red/500 | #D14343 | #FCBCB4 | From Figma / dark sheet | — |  |
| **high_ramp_1** | color/red/200 | #F3CCCC | #FCBCB44C | Add | — | Heatmap step 1. |
| **high_ramp_2** | color/red/350 | #E38E8E | #FCBCB499 | Add | — | Heatmap step 2. |
| **high_on_dark** | color/red/300 | #FFB4AE | #FFB4AE | Add | — | High count on the navy bulk bar. Unchanged. |
| **medium** | color/yellow/600 | #9A6200 | #FFDB58 | Adjust | — | Light was BB7600, 3.44:1 on yellow/100. |
| **medium_bg** | color/yellow/100 | #FFF6E8 | #3E2807 | From Figma / dark sheet | — |  |
| **medium_line** | color/yellow/200 | #EFD7A3 | #F4C43066 | Add | — | Medium pill edge. |
| **medium_cell** | color/yellow/500 | #FFAA52 | #F4C430 | From Figma / dark sheet | — |  |
| **low** | color/neutral/800 | #444444 | #B6B6B6 | From Figma / dark sheet | — |  |
| **low_bg** | color/neutral/250 | #F1F1F1 | #FFFFFF0F | Add | — | Quiet fills and hover. Translucent in dark so it works on every surface. |
| **low_line** | color/neutral/450 | #D6D6D6 | #FFFFFF1A | Add | — | Low severity pill edge. |
| **low_cell** | color/neutral/490 | #A5A5A5 | #8D8D8D | Add | 5.14:1 on panel | Low severity dots. A separate step because the dot needs 3:1 in dark and the edge doesn't. |
