# T1 frontend

Solid 2 with Solid Router file routes, porting the original Glorix home, bookings, artists, team, gallery, event details, and slot-selection pages.

Run `pnpm dev --port 3100 --strictPort`. Validate with `pnpm typecheck`, `pnpm lint`, and `pnpm build`.

Shared base CSS loads once from `src/styles/base.css`. Page styles use native CSS scopes in `src/styles/pages` and normal imports managed by Vite; event-card, announcement, and bottom-sheet styles live in `src/components/styles`. The source declarations and visual design are retained. Booking data lives in one store, slot selection lives in the URL, and temporary UI state stays in component signals.

See [the experiment guide](../README.md) for routes, source imports, state ownership, and backend commands.
