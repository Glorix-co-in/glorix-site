# T1

A Glorix UI experiment with Solid 2 and Convex.

```sh
pnpm install
pnpm dev --port 3100 --strictPort
```

Frontend: http://127.0.0.1:3100

After editing content in Convex, run `publishing:publish` with `{}` in the dashboard.

Manage all site content at `/admin`. The local password is `ADMIN_PASSWORD` in `.env.local`.

For Netlify, set `VITE_CONVEX_URL` for both builds and functions. Deployment settings are in `netlify.toml`.

Admin functions also need `ADMIN_PASSWORD` and `ADMIN_API_SECRET`. Set the same `ADMIN_API_SECRET` in Convex.

Run `pnpm typecheck`, `pnpm build`, and `pnpm lint` from the project root.
