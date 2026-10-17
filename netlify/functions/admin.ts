import process from "node:process";
import { createAdminHandler } from "../../server/admin.ts";

const handler = createAdminHandler({
  convexUrl: process.env.CONVEX_URL ?? process.env.VITE_CONVEX_URL,
  password: process.env.ADMIN_PASSWORD,
  secret: process.env.ADMIN_API_SECRET,
});

export default (request: Request, context: { ip: string }) =>
  handler(request, context.ip);
