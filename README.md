# T1: Glorix in Solid 2

A local learning experiment porting the original Glorix pages from `C:/Users/A5IN/Coding/projects/glorix-main`. The source project and SOM_Site remain unchanged.

## Run

In `frontend`, run `pnpm dev --port 3100 --strictPort`.
In `backend`, run `pnpm dev`.

Frontend: http://127.0.0.1:3100
Backend health: http://127.0.0.1:3001/api/health
The frontend development proxy forwards `/api` to port 3001.

## Pages and styling

File routes live in `frontend/src/routes`, using Solid Router and its filesystem-routing integration:

- `/`: home
- `/bookings`: upcoming and past events
- `/artists`, `/team`, `/gallery`
- `/events/:id`: event details
- `/events/:id/slots`: date and time selection
- `/details?id=...` and `/select-slot?id=...`: original query-style URL aliases

The seven original CSS files are preserved unchanged in `src/styles/original`. Route components retain the original HTML structure, classes, inline styles, assets, fonts, icons, and animations. `OriginalStyles` mounts each page's styles for the lifetime of that route so styles from standalone source pages do not leak across navigation.

`scripts/import-glorix.mjs` copies the original JSON data and referenced assets. `scripts/port-original-markup.mjs` ports source page markup; `scripts/port-original-animations.mjs` extracts the source GSAP animations with component cleanup. Fonts and Font Awesome retain the source CDN URLs.

## Data and temporary UI state

`src/bookings/useBookings.ts` creates the one domain `createStore`, seeded from `src/bookings/events.json`. App provides it through context; pages consume `useBookings()` without creating additional stores. Derived lists and booking availability use named memos and pure helpers in `rules.ts`.

Temporary UI state stays with its owning component: navigation, popup visibility, selected dates/times, carousel position, overlays, and music playback use local signals. These values are not mixed into the event records. A separate boundary clock updates booking availability when timestamps change; the announcement countdown owns its one-second clock.

The original event visibility, opening and closing gates, ordering, child events, slot availability, and external ticket links are preserved. Runtime data changes do not persist after reload.

## Backend

`backend/src/app.ts` contains minimal Hono routes; `backend/src/index.ts` starts the Node server. There is no database or bookings API yet. The experiment uses no Sanity integration.

## Scaffold and checks

The frontend started from the bare TypeScript template:

```powershell
pnpm create solid@latest frontend --solid --template bare --ts --no-ssr --no-devtools
```

Inside the frontend run `pnpm typecheck`, `pnpm test`, and `pnpm build`. Production files are written to `dist/client`. Inside the backend run `pnpm typecheck` and `pnpm build`.
