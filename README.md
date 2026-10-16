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

Shared CSS in `src/styles/base.css` loads once in App, including on missing routes. Page styles in `src/styles/pages` use native CSS `@scope` with page classes on the existing main elements; normal CSS imports let Vite manage loading. Body-based scope roots include the shared shell and portalled overlays. Component styles use distinct class names; event-card, announcement, and bottom-sheet styles live in `src/components/styles`. Original style declarations are retained to preserve the Glorix design. Native controls use a small typography reset in `src/styles/controls.css`.

The original JSON data and referenced assets were copied into the frontend. Components are maintained directly under `src`; the one-off import tools have been removed. Fonts and Font Awesome retain the source CDN URLs.

## Data and temporary UI state

`src/bookings/useBookings.ts` creates the one domain `createStore`, seeded from `src/bookings/events.json`. App provides it through context; pages consume `useBookings()` without creating additional stores. Derived lists and booking availability use named memos and pure helpers in `rules.ts`.

Temporary UI state stays with its owning component: navigation, popup visibility, carousel position, overlays, and music playback use local signals. Selected dates and times have a single source of truth in URL search parameters, managed by `useSlotSelection`, so deep links and browser history agree. These values are not mixed into the event records. A separate boundary clock updates booking availability when timestamps change; the announcement countdown runs its one-second clock only while open.

`EventHeader`, `EventDescription`, `BottomSheet`, and `Testimonials` own their respective presentation and interaction behavior. Bottom sheets trap focus, make the background inert, close with Escape, and restore focus. Router pending state provides navigation feedback.

The original event visibility, opening and closing gates, ordering, child events, slot availability, and external ticket links are preserved. Runtime data changes do not persist after reload.

## Backend

`backend/src/app.ts` contains minimal Hono routes; `backend/src/index.ts` starts the Node server. There is no database or bookings API yet. The experiment uses no Sanity integration.

## Scaffold and checks

The frontend started from the bare TypeScript template:

```powershell
pnpm create solid@latest frontend --solid --template bare --ts --no-ssr --no-devtools
```

Inside the frontend run `pnpm typecheck`, `pnpm lint`, and `pnpm build`. Production files are written to `dist/client`. Inside the backend run `pnpm typecheck` and `pnpm build`.
