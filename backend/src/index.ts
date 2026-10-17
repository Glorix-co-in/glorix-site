import { serve } from "@hono/node-server";
import { app } from "./app.js";

const port = Number(process.env.PORT ?? 3001);

const server = serve(
  { fetch: app.fetch, hostname: "127.0.0.1", port },
  (info) => {
    console.log(`T1 backend: http://127.0.0.1:${info.port}`);
  },
);

const shutdown = () => server.close(() => process.exit(0));
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
