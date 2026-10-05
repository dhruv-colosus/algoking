# Algoking

A minimal DSA study dashboard built with Next.js App Router, TypeScript, React, and Tailwind CSS. The home view combines a sidebar dashboard, a concise text-only hero, supplied topic illustrations, and featured questions. Study routes contain realistic dummy content for reviewing the first version.

## Run locally

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). The scripts also include:

```bash
npm run lint
npm run typecheck
npm run build
npm run start
```

`npm run start` serves a completed production build. Geist and Geist Mono are bundled locally, so the app does not fetch its font at build time.

## Mock content and interactions

Study topics, problems, sample acceptance rates, and algorithms live in `lib/data.ts`. Search, difficulty filters, topic links, bookmarks, and solved toggles work with this mock data. Bookmarks and solved overrides persist in the current browser's local storage; there is no backend or sign-in. Dashboard counts and learning content are sample data.

The preview includes the problem sheet, problem/topic details, algorithms, roadmap, bookmarks, progress, and settings routes. Progress derives from the sample problems plus local solved changes. Settings controls are session-only placeholders.

Topic illustrations live in `public/illustrations`. The home hero is text-only.

## Visual system

The visual system is adapted from [kargulstudio/sales-crm](https://github.com/kargulstudio/sales-crm), with its compact dark dashboard surfaces, Geist typography, pill buttons, tag palette, and inset shadows. Only the primitives and relevant styling are reused for the study product.

- [Design tokens and geometry](docs/design-system.md)
- [Shared component contracts](docs/components.md)
- [Reference snapshot and adaptation](docs/reference.md)
- [Project-local design skill](skills/algoking-design/SKILL.md)

The skill is included in the repository as reusable guidance; it is not installed globally.

## Validation

Lint, TypeScript, and the production Webpack build pass. The main routes return HTTP 200; unsupported topic and problem slugs return 404. Desktop and mobile views, search/filtering, and bookmark/solved persistence were checked in the browser.

The production build uses Next.js's Webpack option because Turbopack's local worker port was restricted in this environment. npm currently reports five high-severity entries in the development linter dependency chain, all stemming from the `braces` advisory. The registry's current `braces` release has no patched version for that advisory; a forced downgrade of Next.js lint tooling was not applied.

Style tokens and shell/home styles live in `app/globals.css`; study-page compositions live in `app/secondary.css`. The retained source primitives and the current Algoking additions are distinguished in the design documentation.
