import process from "node:process";
import { createContentHandler } from "../../server/content.ts";

export default createContentHandler(
  process.env.CONVEX_URL ?? process.env.VITE_CONVEX_URL,
);
