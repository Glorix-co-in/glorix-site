# T1

A Glorix UI experiment with Solid 2 and Hono.

Run each service in a separate terminal:

```sh
cd frontend
pnpm install
pnpm dev --port 3100 --strictPort
```

```sh
cd backend
pnpm install
pnpm dev
```

Frontend: http://127.0.0.1:3100  
Backend: http://127.0.0.1:3001

After editing content in Convex, run `publishing:publish` with `{}` in the dashboard.

For Netlify, set `VITE_CONVEX_URL` for both builds and functions. Deployment settings are in `netlify.toml`.

Run `pnpm typecheck` and `pnpm build` in either folder. The frontend also supports `pnpm lint`.
