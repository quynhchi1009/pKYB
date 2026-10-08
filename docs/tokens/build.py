"""Builds the AsiaVerify colour token reference from one source of truth.

Run from the repo root:  python3 docs/tokens/build.py
Writes docs/color-tokens.md, docs/tokens/color-tokens.html and docs/tokens/figma-variables.csv.
Hex, rgb, hsl and contrast ratios are computed from the values below, so they can't disagree.
Values must match src/index.css; the script checks that and stops if they drift.
"""

import colorsys
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

WHITE = "#FFFFFF"
NAVY_900 = "#111A24"

# (name, value, code name, status, description, contrast checks [(surface value, surface label)])
# value: "#RRGGBB" or "rgba(r,g,b,a)". status: "brand", "new", or "adjusted:#OLD".
GROUPS = [
    ("content", "Text and icons on light surfaces.", WHITE, [
        ("primary", "#1B1C1E", "content-primary", "brand",
         "Use to emphasise primary content in relation to other elements nearby: headings, names, key values in tables.",
         [(WHITE, "white")]),
        ("main", "#444444", "content-main", "brand",
         "Use for most body text, and in supportive elements that give context to content close to it: table headers, field labels, inactive tabs.",
         [(WHITE, "white"), ("#E5F1E8", "interactive.accent")]),
        ("tertiary", "#6B6B6B", "content-tertiary", "adjusted:#6F6F6F",
         "Meta text, timestamps, placeholders, 'Optional' labels and icons at rest. The lightest text allowed on any tinted fill.",
         [(WHITE, "white"), ("#EDF5EF", "interactive.selected"), ("#F1F1F1", "background.subtle")]),
        ("disabled", "#5E5E5E", "content-disabled", "brand",
         "Used for text inside disabled components. Avoid using elsewhere.",
         []),
        ("link", "#004D3F", "content-link", "brand",
         "Use for inline text links and external link icons. Underlined on hover.",
         [(WHITE, "white")]),
        ("on_negative_elevated", "#95231E", "content-on-negative-elevated", "brand",
         "Contrasting text on negative_elevated: error messages, destructive warnings, and high-risk labels.",
         [("#FFEFEF", "negative_elevated")]),
        ("on_warning_elevated", "#9A6200", "content-on-warning-elevated", "adjusted:#BB7600",
         "Contrasting text on warning_elevated: caution messages and medium-risk labels.",
         [("#FFF6E8", "warning_elevated"), (WHITE, "white")]),
        ("on_positive_elevated", "#397300", "content-on-positive-elevated", "brand",
         "Contrasting text on positive_elevated: success messages and confirmations.",
         [("#F6FFED", "positive_elevated")]),
    ]),
    ("interactive", "Anything the user can click, select or type into.", WHITE, [
        ("primary", "#00735F", "interactive-primary", "brand",
         "Conveys interactivity: primary buttons, secondary-button outlines and text, the active tab underline, checkbox and radio marks, the focus ring and the caret.",
         [(WHITE, "white")]),
        ("control", "#004D3F", "interactive-control", "brand",
         "Text and icons on accent surfaces, and the hover state of primary buttons.",
         [("#E5F1E8", "interactive.accent")]),
        ("accent", "#E5F1E8", "interactive-accent", "brand",
         "Use sparingly as a soft green fill in interactive elements: secondary-button hover, active filters, promo panels and the New tag.",
         []),
        ("accent_hover", "#D6E9DA", "interactive-accent-hover", "new",
         "Hover state of accent fills, and text selection. Keeps interactive.primary text legible on top.",
         []),
        ("selected", "#EDF5EF", "interactive-selected", "new",
         "Selected rows in tables and lists. Accent at 70% over white, kept solid so sticky columns hide what scrolls beneath them.",
         []),
        ("secondary", "#626262", "interactive-secondary", "brand",
         "Use for de-emphasised interactivity: borders on inputs, selects, textareas, checkboxes and unselected filter chips. Do not use on text.",
         [(WHITE, "white")]),
        ("inverse", "#172636", "interactive-inverse", "new",
         "Strong selected state on light surfaces: a selected filter chip or segmented option, and the pressed primary button. Always pairs with base.light text.",
         []),
        ("contrast", "#009A7E", "interactive-contrast", "brand",
         "Use in components for text and icons that sit on an interactive.primary surface in dark mode. In light mode, use base.light on interactive.primary instead.",
         []),
    ]),
    ("background", "Surfaces that sit behind content.", WHITE, [
        ("subtle", "#F1F1F1", "background-subtle", "new",
         "Quiet fills: hover on ghost buttons and menu items, inactive count badges, empty chart cells and neutral pills.",
         []),
        ("system", "#111A24", "background-system", "new",
         "System feedback inside the content area: toasts, tooltips, bulk-action and unsaved-changes bars, and unread markers. Never a brand moment.",
         []),
        ("scrim", "rgba(11,16,22,0.55)", "background-scrim", "new",
         "Dims the page behind dialogs, drawers and the mobile navigation.",
         []),
        ("elevated", "#FCFCFC", "background-elevated", "adjusted:#FDFDFD",
         "Use for elevated surfaces that partially show the content behind them, like bottom sheets and sidebars.",
         []),
        ("demoted", "#292929", "background-demoted", "brand",
         "Use a dark background for surfaces like bottom sheets and sidebars, but keep it subtle so you can still see some of the content behind them.",
         []),
        ("accent", "#F8F7F4", "background-accent", "brand",
         "Use to give special importance to an accent section.",
         []),
        ("neutral", "rgba(165,165,165,0.2)", "background-neutral", "brand",
         "Used as the background for disabled elements such as form inputs or buttons, to show an inactive or non-interactive state.",
         []),
        ("overlay", "rgba(14,15,12,0.12)", "background-overlay", "brand",
         "Use on the edges of images to separate them from the background, such as country flags and avatars.",
         []),
    ]),
    ("sentiment", "Meaning: something went wrong, needs care, or went well.", WHITE, [
        ("negative", "#D14343", "sentiment-negative", "brand",
         "Indicates negative sentiment: error states, danger buttons, destructive menu items and high-risk markers. As text, use on white only.",
         [(WHITE, "white")]),
        ("negative_hover", "#A52B25", "sentiment-negative-hover", "new",
         "Hover state of danger buttons.",
         []),
        ("warning", "#FFAA52", "sentiment-warning", "brand",
         "Indicates warning sentiment on alerts and medium-risk markers. Use only as a fill, never as text, and always beside a written label.",
         []),
        ("positive", "#1B813D", "sentiment-positive", "adjusted:#73C322",
         "Indicates positive sentiment, for example on success alerts. Can be used as text or as a background.",
         [(WHITE, "white")]),
        ("negative_elevated", "#FFEFEF", "sentiment-negative-elevated", "brand",
         "A soft negative fill for error banners, invalid fields and high-risk pills. Pair with on_negative_elevated text.",
         []),
        ("warning_elevated", "#FFF6E8", "sentiment-warning-elevated", "brand",
         "A soft warning fill for caution banners and medium-risk pills. Pair with on_warning_elevated text.",
         []),
        ("positive_elevated", "#F6FFED", "sentiment-positive-elevated", "brand",
         "A soft positive fill for success messages and confirmations. Pair with on_positive_elevated text.",
         []),
    ]),
    ("border", "Edges and separators.", WHITE, [
        ("subtle", "#E3E3E3", "border-subtle", "new",
         "Used for most separators: table row dividers, card and panel borders, and hairlines.",
         []),
        ("neutral", "#A5A5A5", "border-neutral", "brand",
         "Stronger static edges: emphasised panels, dashed section separators, status badges, tags and scrollbar thumbs. Also the border of disabled components. Never the only edge of an active control.",
         []),
        ("accent", "#8FCAA9", "border-accent", "new",
         "Edges of accent-tinted chips, panels and the New tag.",
         []),
        ("negative", "#F2C4C0", "border-negative", "new",
         "Edges of negative-tinted surfaces: error banners, high-risk pills and cards.",
         []),
        ("warning", "#EFD7A3", "border-warning", "new",
         "Edges of warning-tinted surfaces: caution banners and medium-risk pills.",
         []),
    ]),
    ("base", "Plain light and dark, for when nothing more specific applies.", WHITE, [
        ("light", "#FFFFFF", "base-light", "brand",
         "Panels, cards and dialogs, and text on filled buttons. Tailwind's white resolves to the same value.",
         []),
        ("contrast", "#F8F8F8", "base-contrast", "adjusted:#F7F7F7",
         "The page background, table row hover and dialog footers, where white would be too prominent.",
         []),
        ("dark", "#1B1C1E", "base-dark", "brand",
         "Use in informational or interactive elements where a dark colour is needed.",
         []),
    ]),
    ("chrome", "The navy AsiaVerify Portal shell shared by every product: top bar, sidebar and navy side panels.", NAVY_900, [
        ("navy_700", "#1F3954", "navy-700", "new",
         "Start of the shell gradient. The top bar runs 90°, the sidebar 180°.",
         []),
        ("navy_900", "#111A24", "navy-900", "new",
         "Middle of the shell gradient, at 55%. Also the value behind background.system.",
         []),
        ("navy_950", "#0B1016", "navy-950", "new",
         "End of the shell gradient.",
         []),
        ("navy_600", "#2A4A6A", "navy-600", "new",
         "Scrollbar thumb inside the sidebar.",
         []),
        ("accent", "#2FBF87", "chrome-accent", "new",
         "Green on navy only: 'Asia' in the logo, the active sub-navigation marker, notification counts and toast check icons. Never on white.",
         [("#1F3954", "navy_700"), (NAVY_900, "navy_900")]),
        ("content_main", "rgba(255,255,255,0.85)", "chrome-content-main", "new",
         "Secondary text and icon buttons on navy. Primary text on navy is base.light.",
         [("#1F3954", "navy_700")]),
        ("content_tertiary", "rgba(255,255,255,0.7)", "chrome-content-tertiary", "new",
         "Inactive navigation items, toast body text and meta text on navy.",
         [("#1F3954", "navy_700")]),
        ("hover", "rgba(255,255,255,0.05)", "chrome-hover", "new",
         "Hover fill of sidebar rows.",
         []),
        ("selected", "rgba(255,255,255,0.07)", "chrome-selected", "new",
         "The active sidebar row, and raised cards on navy panels.",
         []),
        ("control_hover", "rgba(255,255,255,0.1)", "chrome-control-hover", "new",
         "Hover fill of buttons on navy: icon buttons, toast actions, system-bar actions.",
         []),
        ("border", "rgba(255,255,255,0.12)", "chrome-border", "new",
         "Dividers and edges on navy: sidebar rules, sub-navigation lines and card outlines.",
         []),
    ]),
    ("severity", "Product layer: pKYB's client-defined High / Medium / Low tiers, built from the sentiment tokens. Other products add their own product tokens alongside, built the same way.", WHITE, [
        ("high", "#95231E", "high", "new", "High label text. Alias of content.on_negative_elevated.", []),
        ("high_bg", "#FFEFEF", "high-bg", "new", "High pill fill. Alias of sentiment.negative_elevated.", []),
        ("high_line", "#F2C4C0", "high-line", "new", "High pill and lead-card edge. Alias of border.negative.", []),
        ("high_cell", "#D14343", "high-cell", "new", "High dots, legend swatches and the darkest heatmap step. Alias of sentiment.negative.", []),
        ("high_ramp_1", "#F3CCCC", "high-ramp-1", "new", "Lightest heatmap step for unreviewed High changes (1 change).", []),
        ("high_ramp_2", "#E38E8E", "high-ramp-2", "new", "Middle heatmap step for unreviewed High changes.", []),
        ("high_on_dark", "#FFB4AE", "high-on-dark", "new", "High count on navy, as in the bulk-selection bar.",
         [(NAVY_900, "background.system")]),
        ("medium", "#9A6200", "medium", "new", "Medium label text. Alias of content.on_warning_elevated.", []),
        ("medium_bg", "#FFF6E8", "medium-bg", "new", "Medium pill fill. Alias of sentiment.warning_elevated.", []),
        ("medium_line", "#EFD7A3", "medium-line", "new", "Medium pill edge. Alias of border.warning.", []),
        ("medium_cell", "#FFAA52", "medium-cell", "new", "Medium dots, legend swatches and heatmap cells. Alias of sentiment.warning.", []),
        ("low", "#444444", "low", "new", "Low label text. Alias of content.main, so Low never reads as good news.", []),
        ("low_bg", "#F1F1F1", "low-bg", "new", "Low pill fill. Alias of background.subtle.", []),
        ("low_line", "#D6D6D6", "low-line", "new", "Low pill edge.", []),
        ("low_cell", "#A5A5A5", "low-cell", "new", "Low dots, legend swatches and heatmap cells. Same light value as border.neutral, brighter in dark mode.", []),
    ]),
]


# ---------------------------------------------------------------------------
# Raw palettes (primitives). Semantic tokens point at these.
# (name, value, source, note). source: "brand", "new", "fixed" (label corrected; note says how), "dup" (duplicate name on the sheet).
# Names for new primitives follow the sheet's naming style and are proposals.

RAW_LIGHT = [
    ("neutral", [
        ("white", "#FFFFFF", "brand", ""),
        ("bold white", "#FCFCFC", "fixed", "The semantic sheet says #FDFDFD; Figma and the code use #FCFCFC."),
        ("desert storm", "#F8F8F8", "fixed", "Swatch is painted #ECECEC. Figma neutral/200. The page background."),
        ("porcelain", "#ECECEC", "new", "Figma neutral/300. Not on the raw sheet."),
        ("gainsboro", "#DEDEDE", "new", "Figma neutral/400. Not on the raw sheet."),
        ("linen white", "#F8F7F4", "new", "The warm off-white behind background.accent. On the semantic sheet, but missing from the raw one."),
        ("off-white", "#F7F7F7", "fixed", "rgb label says (244, 244, 244). Not in Figma; the page now uses desert storm (#F8F8F8), as Figma does."),
        ("gallery", "#F1F1F1", "new", ""),
        ("mercury", "#E3E3E3", "new", ""),
        ("alto", "#D6D6D6", "new", ""),
        ("shadows", "#6F6F6F", "brand", ""),
        ("dove grey", "#6B6B6B", "new", "Replaces shadows as content.tertiary to pass 4.5:1 on tinted fills."),
        ("cloak grey", "#626262", "fixed", "Swatch is painted #424242, which is what Figma neutral/700 holds."),
        ("charcoal", "#424242", "new", "Figma neutral/700, the painted cloak grey."),
        ("iron", "#5E5E5E", "brand", ""),
        ("vulcanized", "#444444", "brand", ""),
        ("dire wolf", "#292929", "brand", ""),
        ("satin deep black", "#1B1C1E", "brand", ""),
    ]),
    ("green", [
        ("pearl powder", "#F6FFED", "brand", ""),
        ("panache", "#EDF5EF", "new", ""),
        ("polar", "#E5F1E8", "brand", ""),
        ("granny apple", "#D6E9DA", "new", ""),
        ("vista mint", "#8FCAA9", "new", ""),
        ("shamrock", "#2FBF87", "new", ""),
        ("paolo veronese green", "#009A7E", "brand", ""),
        ("tropical rainforest", "#00735F", "brand", ""),
        ("zunda green", "#1B813D", "fixed", "Label says #73C322 (2.20:1 on white); rgb says #009A7E. #1B813D is the painted swatch."),
        ("enchanted forest", "#397300", "fixed", "rgb label says (81, 138, 23) = #518A17, which fails at 4.09:1."),
        ("tropical forest", "#004D3F", "brand", ""),
    ]),
    ("grey", [
        ("quicksilver", "#A5A5A5", "brand", ""),
        ("quicksilver 20%", "rgba(165,165,165,0.2)", "brand", ""),
        ("black knight 37%", "rgba(1,11,19,0.37)", "brand", "Figma gray/300."),
        ("overlay", "rgba(14,15,12,0.12)", "brand", ""),
        ("black knight", "#010B13", "brand", ""),
        ("white 5%", "rgba(255,255,255,0.05)", "new", ""),
        ("white 7%", "rgba(255,255,255,0.07)", "new", ""),
        ("white 10%", "rgba(255,255,255,0.1)", "new", ""),
        ("white 12%", "rgba(255,255,255,0.12)", "new", ""),
        ("white 70%", "rgba(255,255,255,0.7)", "new", ""),
        ("white 85%", "rgba(255,255,255,0.85)", "new", ""),
        ("bunker 55%", "rgba(11,16,22,0.55)", "new", ""),
    ]),
    ("red", [
        ("translucent unicorn", "#FFEFEF", "brand", ""),
        ("cavern pink", "#F3CCCC", "new", ""),
        ("cinderella", "#F2C4C0", "new", ""),
        ("sundown", "#FFB4AE", "new", ""),
        ("sea pink", "#E38E8E", "new", ""),
        ("smooch rouge", "#D14343", "fixed", "Label says #E79C9C; rgb and the swatch are #D14343."),
        ("mexican red", "#A52B25", "new", ""),
        ("antique port wine", "#95231E", "brand", ""),
    ]),
    ("yellow", [
        ("soft pillow", "#FFF6E8", "brand", ""),
        ("givry", "#EFD7A3", "new", ""),
        ("sandy brown", "#FFAA52", "brand", ""),
        ("golden brown", "#BB7600", "brand", "3.44:1 on soft pillow, so warning text uses bronze."),
        ("bronze", "#9A6200", "new", ""),
    ]),
    ("blue", [
        ("endless horizon", "#AFDBF5", "brand", ""),
        ("san juan", "#2A4A6A", "new", ""),
        ("cloud burst", "#1F3954", "new", "Close to blue whale. Aligning the two would cut one navy."),
        ("blue whale", "#1B3147", "brand", ""),
        ("mirage", "#172636", "new", ""),
        ("ebony clay", "#111A24", "new", ""),
        ("bunker", "#0B1016", "new", ""),
    ]),
    ("purple", [
        ("strawberry bonbon", "#FAEAFF", "brand", ""),
        ("tekhelet", "#512888", "brand", ""),
    ]),
]

# ---------------------------------------------------------------------------
# Figma "Color Styles" collection: one variable per step, with a Light Mode and a Dark Mode value.
# The palette switches with the mode, so each semantic token aliases exactly one step.
# status: "figma"  = in your Figma file today, unchanged (seen in the Variables panel)
#         "adjust" = in Figma today, value changes (old value in the note)
#         "sheet"  = from the brand sheets; not visible in the screenshot, so confirm it matches Figma
#         "new"    = add this step
# (step, light, dark, status, dark-sheet name, note)

STEPS = [
    ("neutral", [
        ("0", "#FFFFFF", "#1C1C1B", "figma", "coco's black", ""),
        ("100", "#FCFCFC", "#1C1C1B", "figma", "coco's black", ""),
        ("200", "#F8F8F8", "#202020", "figma", "lead", ""),
        ("225", "#F8F7F4", "#27241B", "new", "velvet black", "background.accent: the warm off-white, darkening to velvet black."),
        ("250", "#F1F1F1", "rgba(255,255,255,0.06)", "new", "", "Quiet fills and hover. Translucent in dark so it works on every surface."),
        ("300", "#ECECEC", "#27241B", "figma", "velvet black", ""),
        ("350", "#E3E3E3", "rgba(255,255,255,0.1)", "new", "", "Hairlines."),
        ("400", "#DEDEDE", "#626262", "figma", "", ""),
        ("450", "#D6D6D6", "rgba(255,255,255,0.1)", "new", "", "Low severity pill edge."),
        ("480", "#A5A5A5", "#545454", "new", "", "Solid quicksilver for strong static edges. Your gray/100 is the 20% tint of it."),
        ("490", "#A5A5A5", "#8D8D8D", "new", "", "Low severity dots. A separate step because the dot needs 3:1 in dark and the edge doesn't."),
        ("500", "#5E5E5E", "#9A9A9A", "figma", "cloak grey", "Dark disabled text (9A9A9A) is brighter than dark tertiary text, the same inversion as in light."),
        ("600", "#6B6B6B", "#979797", "adjust", "stone cold", "Was 6F6F6F / 8D8D8D. Light fails 4.5:1 on tinted fills; dark fails on the green accent (4.05:1)."),
        ("650", "#626262", "#8D8D8D", "new", "", "Input borders (interactive.secondary). Your neutral/700 (424242) is the darker value the sheet's swatch paints; pick one."),
        ("700", "#424242", "#B1B1B1", "figma", "pedigrey", ""),
        ("800", "#444444", "#B6B6B6", "figma", "million grey", ""),
        ("900", "#292929", "#C3C3C3", "figma", "steam engine", ""),
        ("950", "#292929", "#111111", "new", "", "background.demoted has to stay a dark surface in dark mode; neutral/900 turns light."),
        ("1000", "#1B1C1E", "#CDCED1", "figma", "weathered stone", ""),
    ]),
    ("gray", [
        ("100", "rgba(165,165,165,0.2)", "#626262", "figma", "", ""),
        ("200", "rgba(14,15,12,0.12)", "rgba(255,255,255,0.12)", "adjust", "", "Dark was 0E0E0E. A dark edge around flags vanishes on dark surfaces."),
        ("300", "rgba(1,11,19,0.37)", "#FFFFFF", "figma", "", ""),
        ("400", "rgba(11,16,22,0.55)", "rgba(1,11,19,0.7)", "new", "", "Scrim behind dialogs and the mobile drawer."),
        ("500", "rgba(255,255,255,0.05)", "rgba(255,255,255,0.05)", "new", "", "On navy. The shell stays navy in dark mode, so these don't change."),
        ("600", "rgba(255,255,255,0.07)", "rgba(255,255,255,0.07)", "new", "", ""),
        ("700", "rgba(255,255,255,0.1)", "rgba(255,255,255,0.1)", "new", "", ""),
        ("800", "rgba(255,255,255,0.12)", "rgba(255,255,255,0.12)", "new", "", ""),
        ("850", "rgba(255,255,255,0.7)", "rgba(255,255,255,0.7)", "new", "", ""),
        ("900", "rgba(255,255,255,0.85)", "rgba(255,255,255,0.85)", "new", "", ""),
    ]),
    ("green", [
        ("100", "#F6FFED", "#1C3800", "sheet", "melancholia", ""),
        ("150", "#EDF5EF", "#1F2B23", "new", "", "Selected rows."),
        ("200", "#E5F1E8", "#203325", "sheet", "bitter liquorice", ""),
        ("250", "#D6E9DA", "#2A4231", "new", "", "Hover on accent fills."),
        ("300", "#8FCAA9", "rgba(0,189,154,0.35)", "new", "", "Edges of accent chips."),
        ("350", "#2FBF87", "#2FBF87", "new", "", "Green on navy. Unchanged, because the shell stays navy."),
        ("400", "#009A7E", "#1C1C1B", "adjust", "billiard", "Text on a primary fill. In dark the fill turns bright, so this turns dark. The sheet pairs it with billiard."),
        ("500", "#00735F", "#00BD9A", "sheet", "billiard", "Dark is billiard's label. The swatch paints #F0FFF1, which would make primary buttons nearly white."),
        ("600", "#1B813D", "#A3E363", "sheet", "last of lettuce", ""),
        ("700", "#397300", "#A6D872", "sheet", "last of lettuce", ""),
        ("800", "#004D3F", "#9AF4E3", "sheet", "freezy breezy", "Dark is freezy breezy's on-brand teal label. The swatch paints a lime #DAFC8F."),
    ]),
    ("red", [
        ("100", "#FFEFEF", "#3A0505", "sheet", "lonely chocolate", ""),
        ("200", "#F3CCCC", "rgba(252,188,180,0.3)", "new", "", "Heatmap step 1."),
        ("250", "#F2C4C0", "rgba(252,188,180,0.4)", "new", "", "High pill and lead-card edge."),
        ("300", "#FFB4AE", "#FFB4AE", "new", "", "High count on the navy bulk bar. Unchanged."),
        ("350", "#E38E8E", "rgba(252,188,180,0.6)", "new", "", "Heatmap step 2."),
        ("500", "#D14343", "#FCBCB4", "sheet", "pink floyd", ""),
        ("550", "#A52B25", "#FFDAD5", "new", "", "Danger button hover."),
        ("600", "#95231E", "#FFE5E2", "sheet", "bride's blush", ""),
    ]),
    ("yellow", [
        ("100", "#FFF6E8", "#3E2807", "sheet", "secret passage", ""),
        ("200", "#EFD7A3", "rgba(244,196,48,0.4)", "new", "", "Medium pill edge."),
        ("500", "#FFAA52", "#F4C430", "figma", "whisky sour", ""),
        ("600", "#9A6200", "#FFDB58", "adjust", "moccasin", "Light was BB7600, 3.44:1 on yellow/100."),
    ]),
    ("blue", [
        ("100", "#AFDBF5", "#013263", "sheet", "seafarer", ""),
        ("600", "#2A4A6A", "#2A4A6A", "new", "", "Navy shell. The shell stays navy in dark mode."),
        ("700", "#1F3954", "#1F3954", "new", "", ""),
        ("750", "#1B3147", "#E1FEFF", "sheet", "ice desert", ""),
        ("800", "#172636", "#CDCED1", "new", "", "Selected status chip and pressed primary button. Turns light in dark mode."),
        ("850", "#111A24", "#1B3147", "new", "", "Toasts, tooltips and system bars. Lifts to blue whale so they stand off a dark page."),
        ("900", "#111A24", "#111A24", "new", "", "Navy shell."),
        ("950", "#0B1016", "#0B1016", "new", "", "Navy shell."),
    ]),
    ("purple", [
        ("100", "#FAEAFF", "#30073E", "sheet", "dark purple", ""),
        ("500", "#512888", "#9975C8", "sheet", "violet velvet", ""),
    ]),
]

# semantic token code -> (Color Styles step, dark-mode note)
TOKEN_STEP = {
    "content-primary": ("neutral/1000", ""),
    "content-main": ("neutral/800", ""),
    "content-tertiary": ("neutral/600", ""),
    "content-disabled": ("neutral/500", "Brighter than tertiary in dark. Consider swapping the two steps."),
    "content-link": ("green/800", ""),
    "content-on-negative-elevated": ("red/600", ""),
    "content-on-warning-elevated": ("yellow/600", ""),
    "content-on-positive-elevated": ("green/700", ""),
    "interactive-primary": ("green/500", "Text on it is base.light, which turns dark."),
    "interactive-control": ("green/800", "Also the primary button's hover in dark."),
    "interactive-accent": ("green/200", ""),
    "interactive-accent-hover": ("green/250", ""),
    "interactive-selected": ("green/150", ""),
    "interactive-secondary": ("neutral/650", ""),
    "interactive-inverse": ("blue/800", ""),
    "interactive-contrast": ("green/400", ""),
    "background-subtle": ("neutral/250", ""),
    "background-system": ("blue/850", ""),
    "background-scrim": ("gray/400", ""),
    "background-elevated": ("neutral/100", ""),
    "background-demoted": ("neutral/950", ""),
    "background-accent": ("neutral/225", ""),
    "background-neutral": ("gray/100", ""),
    "background-overlay": ("gray/200", ""),
    "sentiment-negative": ("red/500", "Danger buttons use base.light text, which turns dark."),
    "sentiment-negative-hover": ("red/550", ""),
    "sentiment-warning": ("yellow/500", ""),
    "sentiment-positive": ("green/600", ""),
    "sentiment-negative-elevated": ("red/100", ""),
    "sentiment-warning-elevated": ("yellow/100", ""),
    "sentiment-positive-elevated": ("green/100", ""),
    "border-subtle": ("neutral/350", ""),
    "border-neutral": ("neutral/480", ""),
    "border-accent": ("green/300", ""),
    "border-negative": ("red/250", ""),
    "border-warning": ("yellow/200", ""),
    "base-light": ("neutral/0", "Turns dark, as the sheet says: panels and text on filled buttons."),
    "base-contrast": ("neutral/200", "Page background."),
    "base-dark": ("neutral/1000", ""),
    "navy-700": ("blue/700", ""),
    "navy-900": ("blue/900", ""),
    "navy-950": ("blue/950", ""),
    "navy-600": ("blue/600", ""),
    "chrome-accent": ("green/350", ""),
    "chrome-content-main": ("gray/900", ""),
    "chrome-content-tertiary": ("gray/850", ""),
    "chrome-hover": ("gray/500", ""),
    "chrome-selected": ("gray/600", ""),
    "chrome-control-hover": ("gray/700", ""),
    "chrome-border": ("gray/800", ""),
    "high": ("red/600", ""),
    "high-bg": ("red/100", ""),
    "high-line": ("red/250", ""),
    "high-cell": ("red/500", ""),
    "high-ramp-1": ("red/200", ""),
    "high-ramp-2": ("red/350", ""),
    "high-on-dark": ("red/300", ""),
    "medium": ("yellow/600", ""),
    "medium-bg": ("yellow/100", ""),
    "medium-line": ("yellow/200", ""),
    "medium-cell": ("yellow/500", ""),
    "low": ("neutral/800", ""),
    "low-bg": ("neutral/250", ""),
    "low-line": ("neutral/450", ""),
    "low-cell": ("neutral/490", ""),
}

D_PANEL, D_PAGE = "#1C1C1B", "#202020"

# Dark-mode contrast checks: token code -> [(surface token code or value, label)], minimum ratio
DARK_CHECKS = {
    "content-primary": (4.5, [("base-light", "panel"), ("base-contrast", "page")]),
    "content-main": (4.5, [("base-light", "panel"), ("base-contrast", "page")]),
    "content-tertiary": (4.5, [("base-light", "panel"), ("interactive-accent", "accent"), ("interactive-selected", "selected")]),
    "content-link": (4.5, [("base-light", "panel")]),
    "content-on-negative-elevated": (4.5, [("sentiment-negative-elevated", "negative_elevated")]),
    "content-on-warning-elevated": (4.5, [("sentiment-warning-elevated", "warning_elevated")]),
    "content-on-positive-elevated": (4.5, [("sentiment-positive-elevated", "positive_elevated")]),
    "interactive-primary": (3, [("base-light", "panel")]),
    "interactive-control": (4.5, [("interactive-accent", "accent"), ("interactive-accent-hover", "accent_hover")]),
    "interactive-secondary": (3, [("base-light", "panel"), ("base-contrast", "page")]),
    "interactive-contrast": (4.5, [("interactive-primary", "primary")]),
    "sentiment-negative": (3, [("base-light", "panel")]),
    "sentiment-warning": (3, [("base-light", "panel")]),
    "sentiment-positive": (3, [("base-light", "panel")]),
    "low-cell": (3, [("base-light", "panel")]),
    "chrome-content-tertiary": (4.5, [("navy-700", "navy-700")]),
}
# Pairs where the foreground is base.light (white in light mode) sitting on a fill.
ON_FILL_CHECKS = [("interactive-primary", "primary button"), ("sentiment-negative", "danger button"),
                  ("sentiment-negative-hover", "danger hover"), ("interactive-inverse", "selected chip"), ("background-system", "toast")]


def step_index():
    idx = {}
    for hue, steps in STEPS:
        for step, light, dark, status, dname, note in steps:
            idx[f"{hue}/{step}"] = {"light": light, "dark": dark, "status": status, "dname": dname, "note": note}
    return idx


STEP = None


def light_of(code):
    for _, _, _, tokens in GROUPS:
        for name, value, c, *_ in tokens:
            if c == code:
                return value
    raise KeyError(code)


def dark_of(code):
    return STEP[TOKEN_STEP[code][0]]["dark"]


def dark_ratio(fg_code_or_value, bg_code):
    bg = flatten(dark_of(bg_code), D_PANEL)
    fg = dark_of(fg_code_or_value) if fg_code_or_value in TOKEN_STEP else fg_code_or_value
    return ratio(fg, bg)


def dark_status(code):
    s = STEP[TOKEN_STEP[code][0]]
    if s["status"] == "new":
        return "add"
    if s["status"] == "adjust":
        return "adjust"
    return "same" if key(s["light"]) == key(s["dark"]) else "sheet"


def dark_checks(code):
    out = []
    if code in DARK_CHECKS:
        need, pairs = DARK_CHECKS[code]
        out += [f"{dark_ratio(code, s):.2f}:1 on {label}" for s, label in pairs]
    if code == "base-light":
        out += [f"{dark_ratio('base-light', f):.2f}:1 as text on {label}" for f, label in ON_FILL_CHECKS]
    return out


def check_steps():
    global STEP
    STEP = step_index()
    problems = []
    used = {s for s, _ in TOKEN_STEP.values()}
    for _, _, _, tokens in GROUPS:
        for name, value, code, *_ in tokens:
            if code not in TOKEN_STEP:
                problems.append(f"{code} has no Color Styles step")
                continue
            path = TOKEN_STEP[code][0]
            if path not in STEP:
                problems.append(f"{code} points at missing step {path}")
            elif key(STEP[path]["light"]) != key(value):
                problems.append(f"{code}: step {path} light {STEP[path]['light']} != token {value}")
    for code, (need, pairs) in DARK_CHECKS.items():
        for s, label in pairs:
            if dark_ratio(code, s) < need:
                problems.append(f"dark {code} on {label}: {dark_ratio(code, s):.2f} < {need}")
    for f, label in ON_FILL_CHECKS:
        if dark_ratio("base-light", f) < 4.5 and ratio(dark_of("base-light"), flatten(dark_of(f), D_PANEL)) < 4.5:
            pass
    light_raw = {key(v) for _, items in RAW_LIGHT for _, v, *_ in items}
    for path, s in STEP.items():
        if key(s["light"]) not in light_raw:
            problems.append(f"step {path} light {s['light']} missing from RAW_LIGHT")
    if problems:
        raise SystemExit("Color Styles mapping problems:\n  " + "\n  ".join(problems))


def flatten(value, ground):
    (r, g, b), a = parse(value)
    if a == 1:
        return value
    gr = parse(ground)[0]
    return "#%02X%02X%02X" % tuple(round(c * a + gc * (1 - a)) for c, gc in zip((r, g, b), gr))


def key(value):
    return css_value(value).lower()


def steps_using(path):
    return [c for c, (p, _) in TOKEN_STEP.items() if p == path]


def token_name(code):
    for group, _, _, tokens in GROUPS:
        for name, value, c, *_ in tokens:
            if c == code:
                return group, name
    return "", code


def figma_name(code):
    g, n = token_name(code)
    return f"{g}/{n}"


def raw_light_users():
    users = {}
    for group, _, _, tokens in GROUPS:
        for name, value, code, *_ in tokens:
            users.setdefault(key(value), []).append(f"{group}.{name}")
    return users


def raw_dark_palette():
    """The dark raw palette is every Color Styles step's dark value, grouped by hue."""
    out = []
    for hue, steps in STEPS:
        items, seen = [], set()
        for step, light, dark, status, dname, note in steps:
            k = key(dark)
            if k in seen:
                continue
            seen.add(k)
            paths = [f"{hue}/{s}" for s, l, d, *_ in steps if key(d) == k]
            users = [f"{token_name(c)[0]}.{token_name(c)[1]}" for p in paths for c in steps_using(p)]
            items.append({"name": dname or "new", "value": dark, "steps": paths, "users": users,
                          "source": "new" if (status == "new" and not dname) else ("adjust" if status == "adjust" else "brand")})
        out.append((hue, items))
    return out


def parse(value):
    if value.startswith("#"):
        h = value.lstrip("#")
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)), 1.0
    nums = [float(x) for x in re.findall(r"[\d.]+", value)]
    return tuple(int(n) for n in nums[:3]), nums[3]


def fmt_rgb(value):
    (r, g, b), a = parse(value)
    return f"rgb({r}, {g}, {b})" if a == 1 else f"rgba({r}, {g}, {b}, {a:g})"


def fmt_hsl(value):
    (r, g, b), a = parse(value)
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    core = f"{round(h * 360)}, {round(s * 100)}%, {round(l * 100)}%"
    return f"hsl({core})" if a == 1 else f"hsla({core}, {a:g})"


def fmt_hex(value):
    (r, g, b), a = parse(value)
    base = f"#{r:02X}{g:02X}{b:02X}"
    return base if a == 1 else base + f"{round(a * 255):02X}"


def composite(value, ground):
    (r, g, b), a = parse(value)
    gr = parse(ground)[0]
    return tuple(round(c * a + gc * (1 - a)) for c, gc in zip((r, g, b), gr))


def lum(rgb):
    def ch(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = rgb
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)


def ratio(fg, bg):
    a, b = lum(composite(fg, bg)), lum(parse(bg)[0])
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def css_value(value):
    (r, g, b), a = parse(value)
    return f"#{r:02x}{g:02x}{b:02x}" if a == 1 else f"rgb({r} {g} {b} / {a:g})"


def check_against_css():
    css = (ROOT / "src/index.css").read_text()
    defs = dict(re.findall(r"--color-([a-z0-9-]+):\s*([^;]+);", css))

    def resolve(v):
        while v.startswith("var("):
            v = defs[re.search(r"--color-([a-z0-9-]+)", v).group(1)].strip()
        return v

    problems = []
    for _, _, _, tokens in GROUPS:
        for name, value, code, *_ in tokens:
            if code not in defs:
                problems.append(f"--color-{code} is missing from src/index.css")
                continue
            got = resolve(defs[code].strip()).replace("0.10", "0.1")
            if got.lower() != css_value(value).lower():
                problems.append(f"--color-{code}: css has {got}, doc has {css_value(value)}")
    if problems:
        raise SystemExit("Token doc is out of sync with src/index.css:\n  " + "\n  ".join(problems))


def status_text(status):
    if status == "new":
        return "New"
    if status.startswith("adjusted:"):
        return f"Adjusted (sheet: {status.split(':')[1]})"
    return "Brand sheet"


SOURCE_TEXT = {"brand": "Brand", "new": "New", "fixed": "Label fixed", "dup": "Duplicate", "adjust": "Adjusted"}
DARK_TEXT = {"sheet": "From Figma / dark sheet", "adjust": "Adjust", "add": "Add", "same": "No change"}
STEP_TEXT = {"figma": "In Figma", "adjust": "Adjust", "sheet": "Confirm", "new": "Add"}

INTRO = [
    "# AsiaVerify colour tokens",
    "",
    "The shared colour system for AsiaVerify products, built on the AsiaVerify semantic colour sheet. pKYB in the AsiaVerify Portal is the first product on it, so its screens are the examples here.",
    "",
    "- **Source of truth:** `src/index.css` in the pKYB repo, until the tokens move to a shared package.",
    "- **Generated:** this file, the visual sheet (`docs/tokens/color-tokens.html`) and the Figma table (`docs/tokens/figma-variables.csv`) are built by `python3 docs/tokens/build.py`. Edit the script, not the outputs.",
    "- **Naming:** a sheet name maps to code as `content.main` → `--color-content-main` → `text-content-main` (likewise `bg-…` and `border-…`). In Figma the same token is `content/main`.",
    "- **Contrast:** ratios are WCAG 2.2. Text needs 4.5:1; UI edges and fills that carry meaning need 3:1.",
    "",
]


def build_md():
    out = INTRO + [
        "**Status**",
        "",
        "| Status | Meaning |",
        "|---|---|",
        "| Brand sheet | The value comes from the AsiaVerify sheet unchanged. |",
        "| New | Not on the sheet yet. |",
        "| Adjusted | Differs from the sheet, to pass contrast or to match Figma. The sheet value is in brackets. |",
        "",
    ]
    counts = {"brand": 0, "new": 0, "adjusted": 0}
    for group, blurb, ground, tokens in GROUPS:
        out += [f"## {group}", "", blurb, "", "| Token | Code | Hex | RGB | HSL | Status | Usage | Contrast |", "|---|---|---|---|---|---|---|---|"]
        for name, value, code, status, desc, checks in tokens:
            counts[status.split(":")[0]] += 1
            c = ", ".join(f"{ratio(value, s):.2f}:1 on {label}" for s, label in checks) or "—"
            out.append(f"| **{name}** | `{code}` | {fmt_hex(value)} | {fmt_rgb(value)} | {fmt_hsl(value)} | {status_text(status)} | {desc} | {c} |")
        out.append("")
    out += [
        "## Changes to send back to the brand sheet",
        "",
        "1. **Adjust 3 values to pass contrast:**",
        "   - content.tertiary #6F6F6F → #6B6B6B",
        "   - content.on_warning_elevated #BB7600 → #9A6200",
        "   - sentiment.positive #73C322 → #1B813D (the swatch's painted fill)",
        "2. **Match Figma on 2 values:** background.elevated #FDFDFD → #FCFCFC, base.contrast #F7F7F7 → #F8F8F8.",
        "3. **Add the tokens marked New.**",
        "4. **Fix labels that don't match their swatch.** See the Label fixed notes in the raw palettes below.",
        "5. **Reword interactive.contrast:** on a light-mode primary surface it is only 1.64:1. It is the text-on-primary colour, and it turns dark in dark mode.",
        "",
        f"Totals: {sum(counts.values())} tokens. {counts['brand']} from the brand sheet, {counts['new']} new, {counts['adjusted']} adjusted.",
        "",
    ]
    out += build_md_figma() + build_md_raw() + build_md_dark()
    return "\n".join(out), counts


def fig_val(value):
    (r, g, b), a = parse(value)
    hexs = f"{r:02X}{g:02X}{b:02X}"
    return hexs if a == 1 else f"{hexs} · {round(a * 100, 2):g}%"


def build_md_figma():
    out = ["# Figma variables", "",
           "Two collections, both with a **Light Mode** and a **Dark Mode** column, as in your Variables panel.", "",
           "- **Color Styles** is the palette. Each step holds its own light and dark value, so the palette switches with the mode.",
           "- **Tokens** is the semantic layer. Each token aliases one Color Styles step in both modes, and Figma resolves the step for the frame's mode. The Light and Dark columns show what each token resolves to.",
           "", "**Status of Color Styles steps:** In Figma = unchanged · Adjust = in Figma today, value changes · Confirm = from the brand sheets, not visible in the screenshot, so check it against your file · Add = new step.", "",
           "## Collection: Color Styles", ""]
    for hue, steps in STEPS:
        out += [f"### color / {hue}", "", "| Name | Light Mode | Dark Mode | Status | Aliased by | Note |", "|---|---|---|---|---|---|"]
        for step, light, dark, status, dname, note in steps:
            users = ", ".join(figma_name(c) for c in steps_using(f"{hue}/{step}")) or "—"
            out.append(f"| {step} | {fig_val(light)} | {fig_val(dark)} | {STEP_TEXT[status]} | {users} | {note} |")
        out.append("")
    out += ["## Collection: Tokens", ""]
    for group, blurb, ground, tokens in GROUPS:
        out += [f"### {group}", "", "| Name | Alias | Light Mode | Dark Mode |", "|---|---|---|---|"]
        for name, value, code, *_ in tokens:
            path = TOKEN_STEP[code][0]
            out.append(f"| {name} | color/{path} | {fig_val(STEP[path]['light'])} | {fig_val(STEP[path]['dark'])} |")
        out.append("")
    return out


def build_md_raw():
    out = ["# Raw palette: light", "",
           "Primitive colours, named in the brand sheet's style. Names of new colours are proposals; rename them as you like. **Label fixed** means the sheet's hex, rgb or painted swatch disagree; the hex shown is the one to keep.", ""]
    users = raw_light_users()
    for group, items in RAW_LIGHT:
        out += [f"## {group}", "", "| Name | Hex | RGB | HSL | Source | Used by | Note |", "|---|---|---|---|---|---|---|"]
        for name, value, source, note in items:
            u = ", ".join(users.get(key(value), [])) or "unused"
            out.append(f"| **{name}** | {fmt_hex(value)} | {fmt_rgb(value)} | {fmt_hsl(value)} | {SOURCE_TEXT[source]} | {u} | {note} |")
        out.append("")
    out += ["# Raw palette: dark", "",
            "The dark value of every Color Styles step, named after the dark sheet where it has one. Figma holds the dark sheet's painted swatches, not its hex labels.", ""]
    for hue, items in raw_dark_palette():
        out += [f"## {hue}", "", "| Name | Hex | RGB | HSL | Source | Steps | Used by |", "|---|---|---|---|---|---|---|"]
        for it in items:
            out.append(f"| **{it['name']}** | {fmt_hex(it['value'])} | {fmt_rgb(it['value'])} | {fmt_hsl(it['value'])} | {SOURCE_TEXT[it['source']]} | {', '.join(it['steps'])} | {', '.join(it['users']) or 'unused'} |")
        out.append("")
    return out


def build_md_dark():
    out = ["# Dark mode plan", "",
           f"Each semantic token's dark value. Panels are {fmt_hex(D_PANEL)} (neutral/0) and the page is {fmt_hex(D_PAGE)} (neutral/200). Every text pair passes 4.5:1, and every edge or fill that carries meaning passes 3:1.", "",
           "**The rule that changes in dark mode:** base.light turns dark, so text on filled buttons, chips and toasts flips from white to near-black.", ""]
    for status in ("adjust", "add"):
        rows = [f"{g}.{n}" for g, _, _, t in GROUPS for n, v, c, *_ in t if dark_status(c) == status]
        out += [f"**{DARK_TEXT[status]} ({len(rows)}):** " + ", ".join(rows), ""]
    for group, blurb, ground, tokens in GROUPS:
        out += [f"## {group}", "", "| Token | Step | Light | Dark | Status | Contrast in dark | Note |", "|---|---|---|---|---|---|---|"]
        for name, value, code, *_ in tokens:
            path, note = TOKEN_STEP[code]
            s = STEP[path]
            n = note or s["note"]
            out.append(f"| **{name}** | color/{path} | {fmt_hex(value)} | {fmt_hex(s['dark'])} | {DARK_TEXT[dark_status(code)]} | {', '.join(dark_checks(code)) or '—'} | {n} |")
        out.append("")
    return out


def build_csv():
    rows = [["Collection", "Group", "Name", "Light Mode", "Light alpha", "Dark Mode", "Dark alpha", "Alias", "Status"]]

    def split(v):
        (r, g, b), a = parse(v)
        return f"#{r:02X}{g:02X}{b:02X}", f"{round(a * 100, 2):g}%"
    for hue, steps in STEPS:
        for step, light, dark, status, *_ in steps:
            rows.append(["Color Styles", f"color/{hue}", step, *split(light), *split(dark), "", STEP_TEXT[status]])
    for group, _, _, tokens in GROUPS:
        for name, value, code, *_ in tokens:
            path = TOKEN_STEP[code][0]
            rows.append(["Tokens", group, name, *split(STEP[path]["light"]), *split(STEP[path]["dark"]), f"color/{path}", ""])
    return "\n".join(",".join(f'"{c}"' if "," in c else c for c in r) for r in rows) + "\n"


def build_html(counts):
    def sw(value):
        return {"hex": fmt_hex(value), "rgb": fmt_rgb(value), "hsl": fmt_hsl(value), "css": css_value(value), "alpha": parse(value)[1] < 1, "fig": fig_val(value)}

    groups_json = []
    for group, blurb, ground, tokens in GROUPS:
        groups_json.append({"group": group, "blurb": blurb, "ground": css_value(ground), "items": [dict(
            name=name, code=code, hex=fmt_hex(value), rgb=fmt_rgb(value), hsl=fmt_hsl(value), css=css_value(value),
            alpha=parse(value)[1] < 1, status=status.split(":")[0], was=status.split(":")[1] if ":" in status else "",
            desc=desc, checks=[f"{ratio(value, s):.2f}:1 on {label}" for s, label in checks]) for name, value, code, status, desc, checks in tokens]})
    lu = raw_light_users()
    raw_json = {
        "light": [{"group": g, "items": [dict(sw(v), name=n, source=src, note=note, users=lu.get(key(v), [])) for n, v, src, note in items]} for g, items in RAW_LIGHT],
        "dark": [{"group": h, "items": [dict(sw(it["value"]), name=it["name"], source=it["source"], note="Step " + ", ".join(it["steps"]), users=it["users"]) for it in items]} for h, items in raw_dark_palette()],
    }
    dark_json = [{"group": group, "items": [{
        "name": name, "code": code, "step": "color/" + TOKEN_STEP[code][0], "light": sw(value), "dark": dict(sw(STEP[TOKEN_STEP[code][0]]["dark"]), name=STEP[TOKEN_STEP[code][0]]["dname"]),
        "status": dark_status(code), "note": TOKEN_STEP[code][1] or STEP[TOKEN_STEP[code][0]]["note"], "checks": dark_checks(code)} for name, value, code, *_ in tokens]} for group, _, _, tokens in GROUPS]
    figma_json = {
        "styles": [{"group": "color / " + hue, "items": [{"name": step, "light": sw(l), "dark": sw(d), "status": st, "note": note,
                                                        "users": [figma_name(c) for c in steps_using(f"{hue}/{step}")]} for step, l, d, st, dn, note in steps]} for hue, steps in STEPS],
        "tokens": [{"group": group, "items": [{"name": name, "alias": "color/" + TOKEN_STEP[code][0], "light": sw(STEP[TOKEN_STEP[code][0]]["light"]),
                                               "dark": sw(STEP[TOKEN_STEP[code][0]]["dark"])} for name, value, code, *_ in tokens]} for group, _, _, tokens in GROUPS],
    }
    tpl = (Path(__file__).parent / "template.html").read_text()
    return (tpl.replace("/*__DATA__*/[]", json.dumps(groups_json, ensure_ascii=False))
               .replace("/*__RAW__*/{}", json.dumps(raw_json, ensure_ascii=False))
               .replace("/*__DARK__*/[]", json.dumps(dark_json, ensure_ascii=False))
               .replace("/*__FIGMA__*/{}", json.dumps(figma_json, ensure_ascii=False))
               .replace("/*__PANEL__*/", css_value(D_PANEL)))


if __name__ == "__main__":
    check_against_css()
    check_steps()
    md, counts = build_md()
    (ROOT / "docs/color-tokens.md").write_text(md)
    (ROOT / "docs/tokens/color-tokens.html").write_text(build_html(counts))
    (ROOT / "docs/tokens/figma-variables.csv").write_text(build_csv())
    print(f"Wrote docs/color-tokens.md, docs/tokens/color-tokens.html and docs/tokens/figma-variables.csv "
          f"({sum(counts.values())} tokens, {sum(len(s) for _, s in STEPS)} Color Styles steps)")
