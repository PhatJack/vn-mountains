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
pnpm run start        # start production build
pnpm run lint         # eslint (no --fix flag)
npx tsc --noEmit      # typecheck (not in scripts — run manually)
```

No test framework is configured. Run lint + typecheck before committing.

## Data & API architecture

- `app/page.tsx` fetches data **server-side** via `getMountainsData()` in `services/api/mountains/mountains.server.ts` — do NOT fetch client-side on the page.
- The server module calls `GET ${API_BASE_URL}/mountains` with ISR (`revalidate: 300`) and **falls back to `constant/data.json`** when the API is unreachable.
- The client re-fetches/hydrates through React Query: `useMountains(initialData)` in `mountains.hooks.ts` (queryKey `["mountains"]`, 5 min staleTime).
- `lib/overpass.ts` is dead code — not imported anywhere. Do not extend it.

## Env / config

- `NEXT_PUBLIC_API_URL` (default `http://localhost:7001`) — local API serving `/mountains`. No key needed to run; without an API server the app uses the `constant/data.json` fallback.
- `NEXT_PUBLIC_MAPTILER_KEY` is listed in `.env.example` but **unused by current code** — map tiles come from OpenFreeMap/CartoCDN via `stores/map-store.ts` (`MAP_STYLES`).

## Architecture

```
app/page.tsx                    → server component, calls getMountainsData()
app/_components/HomePage.tsx    → client page, React Query hydration, wires sidebar + map
components/VietNamMapNew.tsx    → map (NOT VietNamMap — renamed/stale)
components/ui/map.tsx           → MapLibre GL wrapper (Map/MapClusterLayer/MapControls, useMap())
components/map-components/      → mountain-layer.tsx (clusters + markers), map-terrain.tsx
components/MountainSidebar.tsx  → search/filter sidebar
components/MountainDetailSheet.tsx → peak detail sheet
components/{theme,query,sonner}-provider.tsx → providers (wired in app/layout.tsx)
services/api/                   → endpoints, types, mountains/{client,hooks,server,transform}
stores/map-store.ts             → Zustand store (map style, loading)
constant/data.json              → fallback JSON served by mountains.server.ts
lib/axios.ts                    → axios instance (baseURL from NEXT_PUBLIC_API_URL)
```

## shadcn/ui

Component skill: `.agents/skills/shadcn/SKILL.md` — read it before adding or modifying UI components.

- Add components via `pnpm dlx shadcn@latest add <name>` (not npx)
- Use `pnpm dlx shadcn@latest docs <component>` for API docs before using a component
- Check installed components in `components/ui/` before importing — don't import uninstalled components
- Installed: badge, button, card, carousel, checkbox, dialog, dropdown-menu, empty, input, map, scroll-area, select, separator, sheet, skeleton, switch, toast, tooltip
- Key rules: `flex flex-col gap-*` not `space-y-*`, semantic colors only, `cn()` for conditional classes, `truncate` shorthand, `size-*` for equal w/h
- Icons in buttons use `data-icon` attribute, no sizing classes on icons

## Key details

- Data flows are **server-first**: `mountains.server.ts` fetches with `cache: "force-cache"` + `revalidate`. Don't add client-side data fetching to the page.
- MapLibre GL (not Mapbox) for the map tile rendering
- Path alias: `@/*` maps to project root
- Fonts: Inter (main via `--font-sans`), Geist + Geist Mono
- Locale files: `constant/languages.ts`
