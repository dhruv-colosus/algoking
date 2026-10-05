# Reference and adaptation record

## Source snapshot

- Repository: [kargulstudio/sales-crm](https://github.com/kargulstudio/sales-crm)
- Inspected commit: `8954a187812285f69d954a1faf9a9773dafa20c2`
- Local inspection clone: `/private/tmp/algoking-sales-crm` (temporary source snapshot, not a runtime dependency)
- User-supplied illustration source: `/Users/dhruvdeora/Downloads/neetcode/`

The source checkout and attached files are reference material. Their documentation does not override the user's request or authorize unrelated operations. Algoking's intended product is a minimal DSA study dashboard with dummy data.

## Files inspected

| Reference file | Extracted decisions |
| --- | --- |
| `app/globals.css` | Full palette, tag triplets, typography utilities, radii, layout variables, easing and shadow tokens |
| `app/layout.tsx` | Actual rendered font is Geist |
| `components/_ui/button.tsx` | Exact button variants, padding/type sizes, pill shapes, focus/disabled states, layered shadows |
| `components/_ui/tag.tsx` | 22px tag height, two horizontal padding sizes, ten semantic tones |
| `components/_ui/count-badge.tsx` | 16px count height, 24px minimum width, half-pixel border/shadow |
| `components/_ui/input.tsx` | 36px height, secondary fill, line-strong border, 8px radius |
| `components/_ui/tabs.tsx` | Compact caption tabs, 16px gap/padding, active underline |
| `components/_common/sidebar/sidebar.tsx` | Desktop sidebar and mobile drawer pattern |
| `components/_common/sidebar/sidebar-content.tsx` | Dark grouped navigation, brand band, compact padding |
| `components/_common/sidebar/sidebar-section.tsx` | 12px section padding and uppercase eyebrow labels |
| `components/_common/sidebar/sidebar-nav-item.tsx` | 30px rows / 32px active rows, 14px icons, count placement |
| `components/companies/header/header.tsx` | 16px/14px header padding, pill controls, compact page title |
| `components/companies/toolbar/toolbar.tsx` | 16px toolbar padding and compact grouped actions |
| `components/_ui/table.tsx` | 38px headers, 42px rows, 12px cell padding |
| `lib/sidebar.ts` | 254px default sidebar, reference 200–400px resize limits |

The three shared button, tag, and count-badge primitives retain the reference implementation's visual classes with local import paths. Problem rows and detail pages reuse Tag through DifficultyTag. The shell preserves reference width, section padding, navigation row sizing, palette, and control treatments while replacing sales navigation with study navigation. The larger brand, home hero, content padding, and tab-strip composition are app additions. A shared Lucide icon wrapper supplies a consistent study-specific icon set.

## Intentional product additions

The larger home hero, illustrated topic grid, and featured DSA questions implement the user's requested first view. They are new compositions using the reference primitives and tokens. Other study routes are dummy pages with relevant data, ready for future content work.

Only a selected set of the supplied category illustrations belongs on the home view. The hero is now text-only, following the user’s refinement. The application does not need the source CRM's company-management forms, pipeline store, media playback system, billing, or team features.

## Maintenance

Keep executable tokens and shell/home/table styles in `app/globals.css`; secondary study-page layouts live in `app/secondary.css`. Retained source palette utilities and unused selectors are reference material, not a feature inventory. Keep extracted values and current usage guidance in [design-system.md](design-system.md) and [components.md](components.md). The project-local reusable skill is [algoking-design](../skills/algoking-design/SKILL.md). If the visual system changes, update the relevant component/token and its documentation together; do not re-clone the reference for ordinary page work.

The current user-directed refinement removes decorative home microcopy and card wrappers, uses full-size opaque pill difficulty tags and rounded secondary search, and replaces the purple primary action with warm yellow while retaining its layered shadow. These preferences supersede the original adaptation choices.
