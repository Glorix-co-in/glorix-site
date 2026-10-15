# T1 frontend

Solid 2 with Solid Router file routes, porting the original Glorix home, bookings, artists, team, gallery, event details, and slot-selection pages.

Run `pnpm dev --port 3100 --strictPort`. Validate with `pnpm typecheck`, `pnpm test`, and `pnpm build`.

Original page CSS is preserved in `src/styles/original`. Booking domain data lives in one store; temporary UI state stays in component signals.

See [the experiment guide](../README.md) for routes, source imports, state ownership, and backend commands.
