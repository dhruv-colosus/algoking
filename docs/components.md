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

`components/problems/problem-list.tsx` provides the reusable published problem sheet/list. It uses compact dashboard rows, styled difficulty labels, meaningful problem links, and study-related columns. Its `compact` prop shows up to five featured entries without the toolbar; `topic` filters by topic; `savedOnly` limits the list to bookmarks. The sheet route shows published problems with search and difficulty filters. Binary Search is the first published tutorial. Sample entries and fabricated acceptance rates have been removed. Counts derive from `lib/data.ts`; unpopulated topics show an empty state.

`components/problems/use-problem-state.ts` stores bookmarks and solved overrides in browser local storage and synchronizes subscribed lists. `components/problems/problem-actions.tsx` reuses that state on a detail page. Static surrounding page content remains server-rendered where practical. If a list is filtered to no results, show a helpful empty state. New visitors start without seeded bookmarks or completions. Local state should not suggest a real backend account.

Problem panels have no enclosing rounded border or raised background. Tables extend to both workspace edges using the main scroll container width, while headings and filters retain their page inset. The labeled table region supports keyboard focus and horizontal scrolling on mobile.

The problem title's native link stretches over the entire row, so clicking row space or difficulty opens the problem and supports opening in a new tab. Solved/bookmark buttons and topic links sit above that target and retain their own behavior. Keyboard focus on the problem link outlines the full row.

The table preserves the reference's 38px header / 42px row heights and 12px cell padding. Body type is 14px on wide desktops and 12px at ≤1200px. `components/problems/progress-overview.tsx` derives sheet/topic completion from the same local solved state, using real progressbar semantics. Empty topics have a zero-width bar without division by zero.

## Tutorial layout

`app/tutorial.css` extends the shared tokens with a 42px desktop / 34px mobile title, an adjacent icon-only back link, difficulty/topic tags below, 20px card padding (16px on mobile), and 18–23px section headings. The shared root shell and actions remain in place.

`components/tutorials/binary-search-walkthrough.tsx` renders an SVG array in 2:1 dimetric projection with consistent face shading. Numbered steps and next/previous controls expose the range, midpoint, comparison, and boundary update. The target selector offers successful and missing-target searches. `lib/binary-search.ts` computes the trace. The diagram has an accessible description; reduced-motion preferences disable transitions.

`components/tutorials/code-tabs.tsx` defaults to Python and supports C++, arrow/Home/End keyboard navigation, and copying the active source. Pass the lesson’s `source` object, server-highlighted `python`/`cpp` nodes, and optional `filename` and `label`; copying always uses that lesson’s selected language. Shiki generates highlighted snippets on the server; the highlighter stays out of the browser bundle. Code scrolls inside its panel on narrow screens.

## Graph tutorials

`components/tutorials/graph-library.tsx` renders `/algorithms/graphs`: 15 published lessons grouped by traversal, shortest paths, ordering, spanning trees, and connectivity. Topic collections for graphs, sliding windows, linked lists, and trees use `components/problems/algorithm-problem-table.tsx`: semantic tables with problem, difficulty, time complexity, and practice columns. Titles open the local lesson; labeled LeetCode/GFG links open the matching practice problem in a new tab. Destinations live in `lib/practice-links.ts`, shared with the practice column on other topic pages. Practice links sit above the stretched row link and retain their own keyboard focus. Tables extend to the workspace edges and scroll horizontally within a labeled, keyboard-focusable region on mobile. The Algorithms overview and sidebar quick links lead to this collection; the seven illustrated home tiles and original roadmap remain intact.

`components/tutorials/graph-tutorial.tsx` composes the same challenge → walkthrough → code/pattern/complexity layout as Binary Search. Each lesson has solved/bookmark actions and previous/next links. Metadata in `lib/graph-catalog.ts` also populates the problem sheet, quick search, and local progress. Explanations and source code stay in server-imported `lib/graph-lessons.ts` and `lib/graph-code.ts`.

`lib/graph-traces.ts` executes the algorithms and records independent state snapshots for two scenarios per lesson. `components/tutorials/graph-walkthrough.tsx` receives only the selected lesson’s serialized scenarios. The SVG graph marks the current vertices/edges, visited or accepted state, and labeled components or colors. Distances, indegrees, discovery/low-link values, queue/stack contents, and Floyd–Warshall’s matrix appear as accessible text and tables where relevant. An expandable edge list exposes the exact input in adjacency insertion order.

The example selector resets the walkthrough. Previous/next, show-result/restart controls, and a native keyboard-operable range slider support long traces without dozens of pagination buttons. The current explanation is a polite live region. Negative-cycle estimates and incomplete topological orders are identified explicitly; disconnected minimum spanning forests are supported. Mobile stacks the graph above its explanation and keeps code/matrix overflow within their panels. Run `npm run test:graphs` for fixture checks and randomized comparisons against reachability, exhaustive coloring, and brute-force deletion.

## Route and stylesheet map

| Route | Composition |
| --- | --- |
| `/` | Centered text-only hero, seven TopicCards in four desktop columns with lesson totals, five-row compact ProblemList |
| `/problems` | Searchable/filterable published problem sheet |
| `/problems/[slug]` | Binary Search, graph, tree, linked list, or sliding window lesson: challenge/example, interactive walkthrough, Python/C++ code, complexity, solved/bookmark actions |
| `/algorithms/[slug]` | Illustrated topic intro, pattern note, topic-filtered ProblemList; Algorithms stays selected in both navigation areas |
| `/topics/[slug]` | Permanent redirect to the matching `/algorithms/[slug]`; unknown topics return 404 |
| `/algorithms` | Pattern cards and links to published algorithm collections |
| `/algorithms/graphs` | 15 published graph lessons grouped by purpose |
| `/algorithms/trees` | 28 published tree lessons across six categories |
| `/algorithms/sliding-window` | 15 published sliding window lessons grouped by window strategy |
| `/roadmap` | Proportional branching Figma map with seven clickable TopicCards and dotted connectors |
| `/bookmarks` | ProblemList with `savedOnly` |
| `/progress` | ProgressOverview based on published problems plus local solved state |
| `/settings` | Session-only preference controls; no account/backend behavior |

`app/globals.css` holds extracted tokens, source primitive utilities, and the app shell/home/table rules. Final rules and media queries override some earlier declarations, so check the actual cascade. `app/secondary.css`, imported after globals in the root layout, provides algorithms, roadmap, progress, settings, and detail layouts. Retained source selectors for sidebar resizing or PhotoSwipe do not imply those features exist in this app.

## Adding a page

Read the existing route and data conventions, then compose a page with these primitives inside the root shell. Keep placeholder pages modest and populated with realistic dummy study content. Use the color/type/spacing roles in [design-system.md](design-system.md); avoid introducing a separate palette or rebuilding button styles inline. Check layout at desktop and narrow mobile widths, along with keyboard focus and visible active navigation.

## Sliding window tutorials

`components/tutorials/sliding-window-library.tsx` renders 15 lessons at `/algorithms/sliding-window`, grouped into fixed windows, longest windows, smallest windows, counting windows, and a monotonic deque. The illustrated home tile, Algorithms overview, and sidebar lead to the collection. `lib/sliding-window-catalog.ts` adds published lessons to the problem sheet, quick search, bookmarks, and progress through the shared data layer.

`sliding-window-tutorial.tsx` preserves the graph tutorial’s challenge, walkthrough, Python/C++ code, pattern, complexity, edge cases, and previous/next lesson layout. Notes, source, highlighting, and trace generation stay on the server; the client receives only the selected lesson’s two computed scenarios.

`sliding-window-walkthrough.tsx` shows indexed array or string blocks, current left/right boundaries, a separate recorded-answer bracket, maintained counters, frequency maps or deque candidates, and the answer. Native example selection resets the trace; previous/next, result/restart, and a keyboard range slider support inspection. Current explanations use a polite live region, exact input and active values have a text disclosure, and narrow diagrams scroll inside their panel. No automatic playback is used.

`lib/sliding-window-traces.ts` executes each algorithm and snapshots independent states. Counting lessons explicitly show two at-most passes and their subtraction. Contracts distinguish positive-only sum/product windows, binary sums, ASCII strings, and fixed alphabets. The replacement lesson recomputes the exact maximum frequency. `npm run test:sliding-window` checks all fixtures, 2,100 deterministic inputs against exhaustive range enumeration, empty/zero-budget edge cases. `npm run test:sliding-window-code` additionally runs the published Python and C++17 snippets against 2,130 oracle results each (requires Python 3 and a C++ compiler; honors `CXX` and `SDKROOT`). On this machine, the compatible installed SDK is `/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX26.2.sdk`; set `SDKROOT` to that path for the snippet check if the default SDK reports unsupported architectures.

## Linked list lessons

`LinkedListLibrary` reuses the graph collection layout at `/algorithms/linked-list`, with 18 lessons across five categories. The home topic tile, algorithm collection banner, quick link, and published problem sheet all lead to the same lessons. `LinkedListTutorial` keeps the graph tutorial structure, shared `CodeTabs`, bookmark/solved controls, and previous/next lesson navigation. Sources and syntax highlighting stay on the server.

`LinkedListWalkthrough` is the client interaction boundary. Each lesson offers multiple computed examples, previous/next controls, a step scrubber, a result shortcut, and restart. Stable node IDs distinguish shared identity from equal values. Solid arrows show current next links; yellow marks a changed next link, and dashed purple arrows show random links. Pointer values, an expandable node-link table, and live step narration provide the diagram state as text. The diagram scrolls internally on narrow screens while lesson content stacks. New allocations keep the same canvas dimensions throughout an example.

Catalog metadata, lesson notes, standalone Python/C++17 code, and pointer traces live in `lib/linked-list-*.ts`. `npm run test:linked-lists` checks all examples, randomized pointer invariants, identity and palindrome restoration. `npm run test:linked-lists-code` also executes both languages against independent expected results. Python 3 and a C++17 compiler (`clang++` by default, or `CXX`) are required for snippet verification; `SDKROOT` can select a compatible macOS SDK when needed.

## Tree lessons

`TreeLibrary` renders 28 lessons at `/algorithms/trees`, grouped into traversals, tree properties, paths and ancestors, views, BST operations, and construction. The existing Trees home tile, quick link, Algorithms collection banner, and published problem sheet lead to the collection. Lesson metadata in `lib/tree-catalog.ts` feeds the shared search, bookmarks, and local progress state.

`TreeTutorial` keeps the graph lesson’s challenge → walkthrough → Python/C++ source → pattern/complexity layout and previous/next navigation. Explanations, source code, syntax highlighting, and trace generation stay on the server. Only the current lesson’s two scenarios cross into the `TreeWalkthrough` client component.

`lib/tree-traces.ts` executes the algorithms and records independent snapshots. The rooted SVG uses stable node IDs alongside values, labeled left/right edges, current/processed states, and dashed temporary Morris threads. Mutating algorithms update the child pointers and root in the diagram. Expandable input and pointer tables provide text equivalents; removed nodes remain in the table for reference. Call paths, explicit stacks, BFS queues, computed heights/gains/bounds, and partial output appear where relevant. Native example selection resets the trace; previous/next, result/restart, and a keyboard range slider support inspection. Explanations use a polite live region. Mobile stacks the diagram and explanation, with code and tables scrolling inside their panels.

Contracts state node-versus-edge height conventions, complete-tree and valid-traversal preconditions, strict BST duplicate handling, node identity for LCA/distance queries, empty results, and recursion limits. `npm run test:trees` checks fixtures, randomized traversal and pointer invariants, brute-force path metrics, complete-tree counts, BST updates, and executes all 28 Python/C++17 snippets on published and empty inputs. It requires Python 3 and a C++ compiler, honors `CXX` and `SDKROOT`, and can use the compatible SDK path documented above when the default macOS SDK and linker disagree.

## Stack lessons

`StackLibrary` publishes 20 lessons at `/algorithms/stacks`, grouped into foundations, expressions and parsing, monotonic stacks, areas and contributions, and simulation and greedy algorithms. The existing Stacks tile, roadmap, Algorithms banner, and sidebar link lead to this collection. Metadata in `lib/stack-catalog.ts` feeds the problem sheet, quick search, bookmarks, and local progress.

`StackTutorial` reuses the graph lesson layout, server-highlighted Python/C++17 sources, complexity notes, edge cases, solved/bookmark controls, and previous/next navigation. Only the selected lesson’s two computed scenarios cross into `StackWalkthrough`. The input strip highlights the current index; labeled main and auxiliary stacks show bottom-to-top order, with a distinct top. Index stacks display `index: value`; min-stack minima, outgoing queue contents, decode contexts, and matrix histograms expose their relevant auxiliary state. Every diagram has a text equivalent, and long values remain available in the state text. Example selection resets the trace; a keyboard slider, previous/next, result, and restart controls allow inspection. Diagrams scroll internally on mobile and keep fixed height within each example.

`lib/stack-traces.ts` executes the algorithms and snapshots independent arrays. Contracts specify strict versus non-strict comparisons, duplicate minima ownership, zero-based indices, virtual histogram boundaries, integer division toward zero, valid parser inputs, empty-operation behavior, and decoded output limits. `npm run test:stacks` checks 2,200 fixtures and generated inputs against exhaustive scans, range enumeration, queue simulation, and repeated collision reduction. `npm run test:stacks-code` also executes all published Python/C++17 snippets against those answers; it requires Python 3 and a C++ compiler and honors `CXX`/`SDKROOT`.


## Binary search lessons

`SearchLibrary` uses the shared algorithm collection layout and category navigation for 20 lessons. `SearchTutorial` renders the shared challenge, server-highlighted code tabs, pattern notes, complexity, local problem actions, and previous/next navigation. `SearchWalkthrough` receives only the current lesson’s server-generated scenarios, with index-based shaded arrays, matrix tables, answer-range diagrams, or two-array partition cuts. Examples, a keyboard-operable step slider, Previous/Next, Show result, and restart share the graph controls. Candidate bounds and comparisons have text labels; exact inputs remain available in a disclosure.
