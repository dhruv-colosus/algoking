# Shared components

The visual contracts below are extracted from the reference and adapted into small Algoking components. Reuse these before adding a new control. `lib/utils.ts` provides `cn` to merge conditional Tailwind classes without conflicting utilities.

## Button

`components/ui/button.tsx` is adapted from reference `components/_ui/button.tsx`. It exposes `buttonVariants`, a default `Button` export, normal button attributes, and an optional `href` that renders a Next.js `Link`. The default is `variant="secondary"`, `size="sm"`, and `type="button"`.

All variants are inline-flex, medium weight, no-wrap, with a 6px gap, pill corners, 150ms interaction transitions, a visible 2px focus ring, and disabled opacity of 50%. The navigation and item variants override alignment/corners as below.

| Variant | Appearance | Use |
| --- | --- | --- |
| `primary` | Golden yellow `primary` fill, dark text, layered inset shadow | Main page action |
| `secondary` | `secondary` fill, white text, subtle inset shadow | Neutral actions |
| `muted` | `muted` fill, white text, same inset shadow | Strong neutral controls |
| `subtle` | `#232323` fill, 1px `#333333` shadow outline | Quiet framed controls |
| `ghost` | `subtle` text, white/6 hover fill | Icon utilities |
| `nav` | Full width, left aligned, 8px corners; `data-active` selects raised muted fill | Sidebar navigation |
| `item` | Full width, top/left aligned, 12px gap, normal weight, wrapped text, 8px corners | Menu/list items |
| `link` | No rounding, underlined foreground text | Inline text action |

| Size | Geometry |
| --- | --- |
| `sm` | 9px padding, 12px type, 1 line height; normally 30px tall |
| `md` | 8px padding, 14px type, 1 line height; normally 30px tall |
| `icon` | 30×30px, no padding |
| `icon-sm` | 24×24px, no padding |
| `none` | No padding; size comes from the call site |

Use an `aria-label` for icon-only buttons. Keep links as links and state-changing controls as buttons. Prefer one primary action in a section. The home hero can apply a larger explicit layout size while retaining the primary visual variant.

```tsx
<Button href="/problems" variant="primary">Open problem sheet</Button>
<Button variant="secondary" onClick={resetFilters}>Reset filters</Button>
<Button size="icon" aria-label="Open navigation">...</Button>
```

## Tag

`components/ui/tag.tsx` is adapted from reference `components/_ui/tag.tsx`. It exports `tagVariants` and a default `Tag` wrapping a span. Defaults: `tone="neutral"`, `size="md"`.

Tags are 22px tall, 14px type at line height 1, pill-shaped, with a 1px border. Size `md` uses 8px horizontal padding and `sm` uses 6px. Available tones are `blue`, `purple`, `green`, `moss`, `red`, `orange`, `amber`, `teal`, `yellow`, and `neutral`; exact triplets are in [design-system.md](design-system.md#tag-tones).

Problem rows and detail headers reuse this primitive through `DifficultyTag`, which uses 20.8px height, 11.2px text, and 8px horizontal padding. Use text plus tone for difficulty and category labels. Tags are metadata, not controls; if a label filters data, provide a real button with selected state.

```tsx
<Tag tone="green">Easy</Tag>
<Tag tone="amber">Medium</Tag>
<Tag tone="red">Hard</Tag>
```

## CountBadge

`components/ui/count-badge.tsx` is adapted from reference `components/_ui/count-badge.tsx`. It wraps a span and accepts normal span props and `className`.

It uses 12px caption type, 16px height, at least 24px width, 4px horizontal padding, full rounding, a 0.5px `#414141` border, muted background, chip text, and a 0.5px dark outline shadow. Use it for sidebar counts and short totals; use a normal text label when the number needs explanation.

## Icon

`components/ui/icon.tsx` exposes a small named selection of Lucide SVG icons with a consistent 1.65 stroke width. Reuse its names and stroke treatment so new pages match the shell. Navigation icons inherit compact source sizing; larger editorial icons can use explicit classes. Decorative icons are hidden from assistive technology; icon-only controls carry the accessible name.

## AppShell

`components/layout/app-shell.tsx` owns the persistent sidebar, page header, quick search, guidance dialog, and mobile navigation. The root `app/layout.tsx` wraps every route with it; do not add a nested shell in a page. Desktop navigation uses the reference's 254px width, dark sidebar surface, 12px section padding, and 30px rows with a 32px raised active row. Algoking adds an 18px brand and custom crown mark. The 56px header has 16px/14px padding; its 38px tab strip uses 12px labels with 16px gaps. The reference's sidebar resizing is not implemented.

Use route-aware active links with `aria-current="page"`. Keep sidebar groups short and useful for study. The mobile trigger exposes its expanded state; navigation closes through the backdrop or a destination link. Quick search opens via its button or Cmd/Ctrl+K and uses a native dialog, as does guidance. Avoid adding CRM account, billing, or team sections.

## TopicCard

`components/home/topic-card.tsx` renders a topic link under `/algorithms/[slug]` using the supplied illustration. Its existing heading identifies the category; add no duplicate title, description, or wrapper boundary. The optional `lessonCount` prop adds a plain-text label below the image and includes the count in the accessible practice label. Home passes the existing mock topic totals as lesson counts; these are sample curriculum totals, not a count of implemented lesson pages. Roadmap reuse omits the count.

Home shows all seven topics beneath a centered heading, description, and action group. Four equal columns fill the desktop content width with 8px horizontal and 20px vertical gaps; at ≤1100px there are two columns and at ≤560px one full-width column. Home crops only the artwork's outer padding, making its visible edges fill each grid cell while keeping the illustration and title intact. Home artwork loads eagerly. The Linked Lists illustration is served directly from its local PNG because its optimized image request failed in the preview browser. Pointer movement updates CSS variables for subtle 3D tilt and a linear glare at 20% opacity, reduced from 40%. Touch input skips the effect, reduced motion disables tilt, and keyboard focus remains visible. Optional image dimensions, sizes, and loading behavior support reuse with the exported roadmap artwork.

## DifficultyTag

`components/ui/difficulty-tag.tsx` wraps the source `Tag`: 20.8px height, 11.2px text, fully rounded corners, and 8px horizontal padding. Easy uses the full green palette, Medium yellow, and Hard red. The opaque reference backgrounds and borders are retained, with slightly brighter text for contrast (`#baedcc`, `#fde99a`, `#fec7cd`). Both problem tables and detail pages use this component.

## ProblemList

`components/problems/problem-list.tsx` provides the reusable dummy problem sheet/list. It uses compact dashboard rows, styled difficulty labels, meaningful problem links, and study-related columns. Its `compact` prop shows a five-row featured subset without the toolbar; `topic` filters by topic; `savedOnly` limits the list to bookmarks. The sheet route shows the full mock list with search and difficulty filters.

`components/problems/use-problem-state.ts` stores bookmarks and solved overrides in browser local storage and synchronizes subscribed lists. `components/problems/problem-actions.tsx` reuses that state on a detail page. Static surrounding page content remains server-rendered where practical. If a list is filtered to no results, show a helpful empty state. Mock completion/saved state should not suggest a real backend account.

Problem panels have no enclosing rounded border or raised background. Tables extend to both workspace edges using the main scroll container width, while headings and filters retain their page inset. The labeled table region supports keyboard focus and horizontal scrolling on mobile.

The table preserves the reference's 38px header / 42px row heights and 12px cell padding. Body type is 14px on wide desktops and 12px at ≤1200px. `components/problems/progress-overview.tsx` derives sheet/topic completion from the same local solved state, using real progressbar semantics.

## Route and stylesheet map

| Route | Composition |
| --- | --- |
| `/` | Centered text-only hero, seven TopicCards in four desktop columns with lesson totals, five-row compact ProblemList |
| `/problems` | Searchable/filterable mock problem sheet |
| `/problems/[slug]` | Sample statement/example when supplied, hint, next problem, solved/bookmark actions |
| `/algorithms/[slug]` | Illustrated topic intro, pattern note, topic-filtered ProblemList; Algorithms stays selected in both navigation areas |
| `/topics/[slug]` | Permanent redirect to the matching `/algorithms/[slug]`; unknown topics return 404 |
| `/algorithms` | Mock algorithm cards and complexity labels |
| `/roadmap` | Proportional branching Figma map with seven clickable TopicCards and dotted connectors |
| `/bookmarks` | ProblemList with `savedOnly` |
| `/progress` | ProgressOverview based on mock defaults plus local solved overrides |
| `/settings` | Session-only preference controls; no account/backend behavior |

`app/globals.css` holds extracted tokens, source primitive utilities, and the app shell/home/table rules. Final rules and media queries override some earlier declarations, so check the actual cascade. `app/secondary.css`, imported after globals in the root layout, provides algorithms, roadmap, progress, settings, and detail layouts. Retained source selectors for sidebar resizing or PhotoSwipe do not imply those features exist in this app.

## Adding a page

Read the existing route and data conventions, then compose a page with these primitives inside the root shell. Keep placeholder pages modest and populated with realistic dummy study content. Use the color/type/spacing roles in [design-system.md](design-system.md); avoid introducing a separate palette or rebuilding button styles inline. Check layout at desktop and narrow mobile widths, along with keyboard focus and visible active navigation.
