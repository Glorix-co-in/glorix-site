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

Run `pnpm typecheck` and `pnpm build` in either folder. The frontend also supports `pnpm lint`.
