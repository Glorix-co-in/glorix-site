import { ConvexError } from "convex/values";

export function authorize(secret: string) {
  const expected = process.env.ADMIN_API_SECRET;
  if (!expected || expected.length < 32 || secret !== expected)
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Admin access denied.",
    });
}

export function invalid(message: string): never {
  throw new ConvexError({ code: "INVALID", message });
}

export function conflict(): never {
  throw new ConvexError({
    code: "CONFLICT",
    message:
      "This content changed since you opened it. Reload the content and try again.",
  });
}
