# T1: Glorix bookings in Solid 2

A local learning experiment. The public bookings listing is ported from `C:/Users/A5IN/Coding/projects/glorix-main/bookings.html`. This does not change SOM_Site or Glorix.

## Run

Open two terminals:

```powershell
cd C:\Users\A5IN\Coding\learning\SolidJS\experiments\T1\frontend
pnpm dev --port 3100 --strictPort
```

```powershell
cd C:\Users\A5IN\Coding\learning\SolidJS\experiments\T1\backend
pnpm dev
```

Frontend: http://127.0.0.1:3100
Backend health: http://127.0.0.1:3001/api/health
The frontend development proxy forwards `/api` to port 3001.

## Data and UI

- `frontend/src/bookings/events.json`: original Glorix event records, copied as the initial seed.
- `frontend/src/bookings/types.ts`: types for the original event structure.
- `frontend/src/bookings/useBookings.ts`: the only `createStore`, derived lists, clock, event selection, and actions. Call it once in App and pass its result down; calling it again would create a separate store.
- `frontend/src/App.tsx`: page composition, navigation, and upcoming/past sections.
- `frontend/src/components/EventCard.tsx`: presentation of an event.
- `frontend/src/components/EventDetails.tsx`: native dialog with event details and date options.
- `backend/src/app.ts`: minimal Hono routes.
- `backend/src/index.ts`: Node server entry.

The bookings data stays in the frontend store for T1. The backend is intentionally a separate starter, with no database or bookings API yet. No Sanity integration is used. Edits to runtime state do not persist across reloads.

The listing preserves hidden-event and booking-opening rules, booking-end timestamps, explicit order, and past-event sorting. Hidden date-specific records can be selected from their parent event's date options. Tickets continue to the original external ticket provider when available. This experiment does not implement checkout or payments. Other navigation links point to the existing Glorix site.

The source marquee data is empty, so no offer ticker is displayed. The learning page omits the original analytics, music player, and GSAP animations.

## Solid 2 concepts

`createStore` holds nested state with draft setters. `createMemo` derives visible/upcoming/past/selected data without duplicating it into another store. `For` renders lists. `Show` narrows optional event data. `createEffect` synchronizes selected state with the native dialog. `onSettled` installs and cleans up the booking clock.

## Scaffold

The frontend was generated non-interactively from the official bare template:

```powershell
pnpm create solid@latest frontend --solid --template bare --ts --no-ssr --no-devtools
```

Backend was initialized with `pnpm init --yes --init-type module`, then `pnpm add hono @hono/node-server` and `pnpm add -D typescript tsx @types/node`.

`bare` has the same Solid primitives as every other Solid 2 template. Router, styling, testing, and server features can be added independently later.

## Checks

Run `pnpm typecheck` and `pnpm build` inside either folder. The frontend production files are in `dist/client`; the backend compiles to `dist` and runs with `pnpm start`.
