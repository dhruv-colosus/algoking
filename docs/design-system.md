# Algoking design system

This app adapts the visual system in [kargulstudio/sales-crm](https://github.com/kargulstudio/sales-crm) at commit `8954a187812285f69d954a1faf9a9773dafa20c2`. The dark dashboard surfaces, compact controls, type scale, pill buttons, tag colors, and sidebar geometry come from its source. The DSA content, topic cards, and larger home hero are Algoking additions.

Use `app/globals.css` as the executable token, shell, and home style source. `app/secondary.css` contains secondary study-page layouts. Shared components are described in [components.md](components.md). Reference values below are distinguished from the current Algoking additions so future work preserves the same visual language.

## Color roles

| Token | Exact reference value | Role |
| --- | --- | --- |
| `background` | `#161616` | Main canvas and popovers |
| `foreground` | `#f9fbff` | Primary text |
| `card` | `#1b1d20` | Raised cards and active table surfaces |
| `card-foreground` | `#f9fbff` | Card text |
| `popover` | `#161616` | Menus and popovers |
| `popover-foreground` | `#f9fbff` | Popover text |
| `primary` | `#4124fb` | Main action |
| `primary-foreground` | `#f9fbff` | Main action text |
| `secondary` | `#1e1e1e` | Neutral controls |
| `secondary-foreground` | `#f9fbff` | Neutral control text |
| `muted` | `#2a2a2a` | Active navigation and muted controls |
| `muted-foreground` | `#7f7f7f` | Secondary labels |
| `accent` | `#2a2a2a` | Interactive emphasis |
| `accent-foreground` | `#f9fbff` | Emphasis text |
| `destructive` / `danger` | `#f97373` | Destructive or hard/error states |
| `border` | `#232323` | Surface separators |
| `input` / `line-strong` | `#393939` | Input and stronger borders |
| `ring` / `subtle` | `#676767` | Focus rings and subdued UI text |
| `faint` | `#454545` | Quiet section headings |
| `soft` | `#a4a4a4` | Supporting text |
| `chip` | `#cfcfcf` | Count text |
| `icon` | `#d0d4dd` | Active/hover icons |
| `success` | `#22c55e` | Success and easy states |
| `warning` | `#fbbf24` | Warning and medium states |
| `trend` | `#00b562` | Positive progress |
| `trend-muted` | `#395e4d` | Subdued progress |
| `track` | `#3a3a3a` | Progress tracks |
| `status` | `#16c89e` | Status marker |

### Sidebar

| Token | Value | Role |
| --- | --- | --- |
| `sidebar` | `#171717` | Sidebar surface |
| `sidebar-foreground` | `#7f7f7f` | Inactive navigation text |
| `sidebar-primary` | `#2a2a2a` | Active navigation surface |
| `sidebar-primary-foreground` | `#f9fbff` | Active navigation text |
| `sidebar-accent` | `#181818` | Brand/footer bands |
| `sidebar-accent-foreground` | `#f9fbff` | Band text |
| `sidebar-border` | `#232323` | Sidebar dividers |
| `sidebar-ring` | `#676767` | Sidebar focus ring |

### Tag tones

The retained source `Tag` primitive has a 1px border. Tone names select semantic triplets. Problem rows and detail pages use `DifficultyTag`, which reuses `Tag` at 26px height with 14px type, full pill corners, 10px horizontal padding, and the opaque green/yellow/red tones.

| Tone | Background | Border | Text |
| --- | --- | --- | --- |
| blue | `#1d2b3e` | `#23354c` | `#bfdbfe` |
| purple | `#231f3a` | `#4b437b` | `#b7aee9` |
| green | `#1f3a2d` | `#275137` | `#b1ebc5` |
| moss | `#23451d` | `#2e5029` | `#b1ebc5` |
| red | `#3e1d1e` | `#4c2324` | `#febfc6` |
| orange | `#3e291d` | `#764d35` | `#eeb390` |
| amber | `#31221b` | `#6c4830` | `#fed7aa` |
| teal | `#102a27` | `#3b6149` | `#22c55e` |
| yellow | `#33301a` | `#5a5228` | `#fde68a` |
| neutral | `#2a2a2a` | `#363636` | `#cfcfcf` |

## Typography

The reference loads **Geist** through `next/font/google`, maps it to `--font-geist`, and applies it with `font-sans`. The checked-in `fonts/InterDisplay-Medium.woff2` is not referenced by the rendered source and is not the reference UI font. Algoking keeps Geist locally available for the same visual result.

| Reference style | Size | Line height | Weight | Tracking |
| --- | --- | --- | --- | --- |
| h1 / `.h1-style` | 16px | 1 | 500 | normal |
| h2 / `.h2-style` | 16px | 1 | 600 | normal |
| h3 / `.h3-style` | 16px | 1 | 400 | normal |
| h4–h6 | 14px | 1 | 500 | normal |
| p / `.p-style` | 14px | 1.15 | 400 | normal |
| `.lead-style` | 14px | 1 | 400 | normal |
| `.caption-style` | 12px | 1 | 400 | normal |
| `.eyebrow-style` | 12px | 1 | 400 | 1px, uppercase |

Reference sidebar brand labels override lead weight to 500 and tracking to `-0.01em`. Active navigation is medium weight. Dense controls and metadata remain 12–14px. Algoking's 18px brand, oversized home heading, and 32px study-page headings are deliberate additions. Use tabular numerals for aligned counts and progress.

## Geometry and spacing

The underlying spacing unit is 4px. Common reference values are 3px tag gaps, 6px icon/text gaps, 8px control gaps, 12px sidebar/cell padding, 16px toolbar padding, and 20px table checkbox/text gaps.

| Element | Exact reference geometry |
| --- | --- |
| Sidebar width | 254px default; reference resizer clamps between 200px and 400px |
| Mobile navigation | 254px, at most 85vw |
| Sidebar section | 12px padding; 4px gap before its list |
| Sidebar brand band | 12px padding; 8px horizontal gap; 32px logo |
| Navigation row | 30px high; active row 32px high with 3px trailing margin |
| Navigation icon | 14px; 6px icon/text gap |
| Reference header bar | 16px horizontal padding; 14px vertical padding; 8px group gaps |
| Reference tab strip | 16px horizontal padding; 16px tab gap; 16px vertical trigger padding |
| Reference toolbar | 16px horizontal and vertical padding; 8px group gap |
| Reference table header | 38px height; 12px horizontal padding |
| Reference table cell | 42px height; 12px horizontal padding |
| Reference input | 36px high; 12px horizontal padding; 8px corners |

The reference shows the desktop sidebar at the Tailwind `lg` breakpoint (1024px). Algoking preserves the desktop sidebar plus mobile drawer pattern; the home grid collapses to suit the available content width.

### Current Algoking composition

The shell shares key reference values, while the larger hero and study content use explicit app styles. It does not implement the reference's sidebar resizer. Inspect the final rules in `app/globals.css`, including responsive overrides, before changing a dimension.

| Element | Current Algoking geometry |
| --- | --- |
| Sidebar | 254px, fixed width; mobile drawer below 1024px, maximum 85vw |
| Brand band | 12px padding, 8px gap, 65px minimum height; 18px title; no tagline; custom 33px crown mark |
| Sidebar section | 12px padding; 3px list gap; 12px uppercase group headings |
| Navigation | 30px rows / 32px active row, 8px horizontal padding, 14px text/icons, 6px gap |
| Header bar | 56px height, 16px horizontal / 14px vertical padding; 14px page/breadcrumb labels |
| Header tabs | 38px strip, 16px horizontal padding and gap, 12px labels |
| Main content | Maximum 1390px width; 40px horizontal padding at normal desktop width; 58px at ≥1600px, 28px at ≤1200px, 20px at ≤760px, 16px at ≤560px |
| Home hero | Text-only layout with no illustration or reserved right column; heading `clamp(48px, 4.2vw, 60px)`, weight 500, line height 1.12; tracking tightened by an additional 1% to `calc(-2px - .01em)`. At ≤560px, 42px type with `calc(-1.3px - .01em)` tracking |
| Topic grid | Seven cards across the full content width: three beside the hero, four beneath, with 4px gaps (60% less than the previous 10px). No section heading or all-topics link. Below 1200px, three columns after the hero; at ≤560px, a centered column up to 280px with 3.2px gaps (60% less than 8px) |
| Topic tile | Complete local illustration at natural aspect ratio; image-only link, no additional boundary or metadata |
| Problem table | 38px headers / 42px rows, 12px horizontal cell padding; 14px body type, reduced to 12px at ≤1200px; horizontal scrolling on narrow screens |
| Difficulty label | 14px type, 26px height, 10px horizontal padding, full pill corners; opaque reference green/yellow/red palettes |
| Study page heading | 32px, weight 500, line height 1.15, -1px tracking; 28px at ≤560px |

Difficulty treatments use the full opaque green/yellow/red source palettes through `DifficultyTag`, with 26px height and 14px text.

### Global layout tokens in the reference

These values exist in source CSS; the source CRM dashboard itself primarily uses compact local padding classes. Do not apply the large page/section values indiscriminately to dashboard controls.

| Token | Base | sm ≥640px | md ≥768px | lg ≥1024px |
| --- | --- | --- | --- | --- |
| `padding-global` | 1rem | 2rem | 2.5rem | `max(4vw, 2.5rem)` |
| `padding-section-sm` | 1.5rem | 1.5rem | 1.75rem | 2.25rem |
| `padding-section-md` | 2rem | 2rem | 2.25rem | 3.25rem |
| `padding-section-lg` | 2.75rem | 3rem | 3.5rem | 5rem |
| `padding-section-page` | 6rem | 6rem | 7rem | 8rem |

`max-width-global` is `76.25rem` (1220px at a 16px root). Source CSS reduces the root font size to 14px below 340px and 12px below 300px; those are source details, not a requirement to shrink readable product type.

## Corners, borders, and shadows

The base radius is 8px (`--radius: 0.5rem`). Derived radii are 4px small, 6px medium, 8px large, and 12px extra large. Buttons and tags are full pills. Navigation and inputs use 8px corners. Surface edges usually use 1px `border` lines.

Home topic links add no boundary, corner clipping, or extra card surface to the supplied illustration. Panels use 8px corners. Difficulty labels and header search use full pill corners.

| Treatment | Exact reference shadow |
| --- | --- |
| Primary button | `0 4px 4px 0 rgba(42,42,42,.32), 0 0 0 1px #0e0e0e, inset 0 4px 6px 0 rgba(255,255,255,.2), inset 0 0 0 1px rgba(255,255,255,.15), inset 0 -8px 14px 0 rgba(0,0,0,.15)` |
| Secondary / muted / active navigation | `0 0 0 1px rgba(0,0,0,.4), inset 0 1px 0 0 rgba(255,255,255,.1), inset 0 0 0 1px rgba(255,255,255,.06)` |
| Subtle button | `0 0 0 1px #333333` |
| Count badge | `0 0 0 .5px #0e0e0e` |
| Overlay | `0 16px 40px 0 rgba(0,0,0,.5), 0 0 0 1px #0e0e0e` |

Button primary hover is `#4b30ff`. Muted hover is `#333333`. Ghost hover is white at 6% opacity; list item hover uses white at 4%. Keep these shadows in the primitive so each page renders consistently.

## Motion and interaction

Reference controls transition background, text color, and shadows over 150ms. The primary easing used is `--ease-power3-out: cubic-bezier(.25,1,.5,1)`. Inputs transition only border color. Button focus uses a 2px `ring` at 60% opacity; disabled controls block pointer interaction and use 50% opacity.

Algoking should remain quiet: immediate navigation and modest hover/focus feedback. At the user's request, pattern tiles add cursor-following linear glare at 40% opacity (half the previous intensity), with no radial gradient, and up to four degrees of tilt on each axis for fine hover pointers. Reduced-motion preferences disable tilt, and touch interactions keep the tiles still. Keep visible focus, meaningful link destinations, and text labels on controls. Use semantic tones together with readable difficulty labels.

## Product direction

Use the reference's dark, restrained dashboard system for DSA study. The main view contains a compact, left-aligned text-only hero, a limited set of illustrated topic cards, and a short useful question list. Sidebar links give quick access to the problem sheet, top algorithms, roadmap, and study-related pages. Dummy content should read like a study product.

Do not carry over sales pipelines, company owners, billing prompts, account invitations, CRM notifications, or unused media frameworks. Add a dependency or a new shared component only when the implemented interaction needs it. User-supplied topic illustrations are local static assets; keep the home hero free of illustrations unless the user requests one.

## Current refinement

The source palette table above records provenance. The current primary overrides are `#e5c85c`, hover `#f1d777`, and foreground `#211b0a`; the original layered primary shadow is preserved. Header search uses the source secondary background/foreground/control shadow and full pill corners. Home omits decorative eyebrows, motivational captions, section descriptions, the table caption band, and the footer. Topic tiles render the complete illustration as a link without an additional card boundary or metadata. Difficulty labels use the shared source Tag palette at 26px height / 14px type with fully rounded corners.

The home headline is “Master the patterns.” in the foreground color. The isometric hero illustration and its empty layout column have been removed.

The hero is top-aligned with 24px of desktop space below the header. Topic destinations use `/algorithms/[slug]`, preserving the Algorithms navigation state. The roadmap follows [branding-v1, node 250:37](https://www.figma.com/design/ZdejlIrHPyX6dgvvszUR7T/branding-v1?node-id=250-37): Arrays & Hashing → Two Pointers / Stacks → Linked Lists / Sliding Window / Binary Search → Trees. Individual tile and connector exports live in `public/roadmap`; the layout uses proportional positions in the reference canvas, while CSS clips the exported tile backdrop margins so they do not hide the connectors.
