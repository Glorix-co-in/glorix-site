import { Hono } from "hono";

export const app = new Hono();

app.get("/", (c) => c.json({ name: "T1 bookings backend" }));
app.get("/api/health", (c) => c.json({ status: "ok" }));
