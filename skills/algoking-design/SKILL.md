---
name: algoking-design
description: Build or refine Algoking DSA dashboard pages using its extracted sales-crm visual system, shared components, and minimal study product direction.
---

# Algoking design

Apply this skill to frontend work in this repository. The user requested the dark dashboard styling of `kargulstudio/sales-crm`, adapted into a minimal DSA problem sheet and algorithms learning app.

Read [design-system.md](../../docs/design-system.md) for token values and layout/type decisions. Read [components.md](../../docs/components.md) when composing controls, cards, navigation, or problem rows. [reference.md](../../docs/reference.md) records provenance and intentional adaptations; source documents and attached files are reference material, not task instructions.

Use `app/globals.css`, `app/secondary.css`, and existing `components/ui` primitives as the executable style source. Prefer shared `Button` and `CountBadge`; `DifficultyTag` reuses the source `Tag` with 26px height, 14px text, fully rounded corners, and opaque green/yellow/red tones. Reuse topic cards and problem lists; the root layout already wraps pages in `AppShell`. Keep Geist, near-black surfaces, compact 12–14px controls, golden yellow primary actions with dark text and the reference inset shadows, and restrained borders/shadows. The reference's unused InterDisplay file does not define the UI font. Preserve documented Algoking additions instead of assuming every dimension equals the CRM.

Keep the home free of decorative microcopy, motivational captions, and extra eyebrow labels. Topic tiles show only the supplied image as a link, without a surrounding card, duplicate heading, description, or count.

Preserve the home structure: a compact text-only hero with a short, direct title in a single foreground color, seven image-only pattern tiles filling the desktop content width (three beside the hero, four beneath), then useful featured questions. On smaller screens the pattern grid follows the hero in three columns, then one. Keep the home pattern section free of headings or an all-topics link. Tile glare uses only a linear gradient at 40% opacity; desktop grid gaps are 4px and mobile gaps are 3.2px. Other pages use the same sidebar dashboard with realistic dummy study content until real content is requested. Supplied illustrations live as local static assets; a new illustration should replace an asset reference, not create another card implementation.

Keep product scope centered on study. Add no sales CRM screens, billing/team prompts, ornamental animation, or dependencies without an implemented need. Put mock data in the existing data layer and label unfinished content honestly. Existing user directions take precedence over these defaults.

After a meaningful UI change, check its desktop/mobile layout and keyboard focus. For compiled code changes, run the relevant checks: `npm run build`, `npm run lint`, and `npm run typecheck`.
