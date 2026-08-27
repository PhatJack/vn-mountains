## Project

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Package manager:** pnpm — never use npm/yarn
- **UI:** shadcn/ui (base-vega style, `@base-ui/react` primitives — NOT radix)
- **Styling:** Tailwind v4, CSS variables in `app/globals.css`
- **Icons:** lucide-react — never assume a different icon library
- **React Compiler:** enabled in `next.config.ts` (`reactCompiler: true`)

## Commands

```bash
pnpm run dev          # dev server
pnpm run build        # production build
pnpm run lint         # eslint (no --fix flag)
npx tsc --noEmit      # typecheck (not in scripts — run manually)
```

No test framework is configured. Run lint + typecheck before committing.

## shadcn/ui

Component skill: `.claude/skills/shadcn/SKILL.md` — read it before adding or modifying UI components.

- Add components via `pnpm dlx shadcn@latest add <name>` (not npx)
- Use `pnpm dlx shadcn@latest docs <component>` for API docs before using a component
- Check installed components in `components/ui/` before importing — don't import uninstalled components
- Installed: badge, button, card, checkbox, dialog, empty, input, scroll-area, select, separator, skeleton, sheet, switch, toast, tooltip
- Key rules: `flex flex-col gap-*` not `space-y-*`, semantic colors only, `cn()` for conditional classes, `truncate` shorthand, `size-*` for equal w/h
- Icons in buttons use `data-icon` attribute, no sizing classes on icons

## Architecture

```
app/page.tsx                → client component, fetches data, wires sidebar + map
app/layout.tsx              → root layout, loads Inter + Geist fonts
components/VietNamMap.tsx   → MapLibre GL map with Overpass API data, clustering
components/MountainSidebar.tsx → search/filter sidebar using shadcn components
lib/overpass.ts             → Overpass API queries, GeoJSON conversion (data fetched client-side)
lib/utils.ts                → cn() utility
```

## Key details

- Data is fetched **client-side** from the Overpass API (OpenStreetMap peaks in Vietnam bounding box) — no server-side data fetching or caching
- MapLibre GL (not Mapbox) for the map tile rendering
- Path alias: `@/*` maps to project root
- Fonts: Inter (main via `--font-sans`), Geist + Geist Mono
