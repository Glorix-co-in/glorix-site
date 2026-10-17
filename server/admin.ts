import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { ConvexError } from "convex/values";
import { api } from "../convex/_generated/api.js";
import type { BookingEvent } from "../src/bookings/types.ts";
import type { Id } from "../convex/_generated/dataModel";
import type { FunctionArgs } from "convex/server";

export interface AdminConfig {
  convexUrl?: string;
  password?: string;
  secret?: string;
}

const sessionSeconds = 8 * 60 * 60;
const cookieName = "t1_admin";
const privateHeaders = {
  "Cache-Control": "no-store",
  "Netlify-CDN-Cache-Control": "no-store",
};
const equal = (a: string, b: string) =>
  timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );

export function createAdminHandler(config: AdminConfig) {
  const configured = Boolean(
    config.convexUrl &&
    config.password &&
    config.password.length >= 12 &&
    config.secret &&
    config.secret.length >= 32,
  );
  const client = config.convexUrl
    ? new ConvexHttpClient(config.convexUrl)
    : undefined;
  const sign = (value: string) =>
    createHmac("sha256", config.secret ?? "")
      .update(`${config.password}\0${value}`)
      .digest("base64url");
  const sessionValid = (request: Request) => {
    const value = request.headers
      .get("cookie")
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${cookieName}=`))
      ?.slice(cookieName.length + 1);
    if (!value) return false;
    const [expires, nonce, signature, extra] = value.split(".");
    return (
      !extra &&
      Boolean(nonce && signature) &&
      Number.isSafeInteger(Number(expires)) &&
      Number(expires) > Date.now() / 1000 &&
      equal(signature, sign(`${expires}.${nonce}`))
    );
  };

  return async (request: Request, ip = "unknown"): Promise<Response> => {
    const respond = (
      data: unknown,
      status = 200,
      headers?: Record<string, string>,
    ) =>
      Response.json(data, {
        status,
        headers: { ...privateHeaders, ...headers },
      });
    const fail = (
      error: string,
      status: number,
      headers?: Record<string, string>,
    ) => respond({ error }, status, headers);
    const url = new URL(request.url);
    const action = url.searchParams.get("action") ?? "session";
    if (
      request.method !== "GET" &&
      request.headers.get("origin") !== url.origin
    )
      return fail("Request origin is not allowed.", 403);
    if (request.method === "GET" && action === "session")
      return respond({
        configured,
        authenticated: configured && sessionValid(request),
      });
    if (!configured || !client || !config.secret || !config.password)
      return fail("Admin sign-in is not configured.", 503);

    const cookie = (value: string, age: number) =>
      `${cookieName}=${value}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${age}${url.protocol === "https:" ? "; Secure" : ""}`;
    if (action === "session" && request.method === "DELETE")
      return respond({ authenticated: false }, 200, {
        "Set-Cookie": cookie("", 0),
      });

    try {
      if (
        request.method !== "GET" &&
        !request.headers.get("content-type")?.startsWith("application/json")
      )
        return fail("Use a JSON request body.", 415);
      const bodyLimit = action === "drafts" ? 1024 * 1024 : 128 * 1024;
      if (Number(request.headers.get("content-length")) > bodyLimit)
        return fail("Request is too large.", 413);

      const secret = config.secret;
      if (action === "session" && request.method === "POST") {
        const body: unknown = await request.json();
        if (
          !body ||
          typeof body !== "object" ||
          !("password" in body) ||
          typeof body.password !== "string" ||
          body.password.length > 1024
        )
          return fail("Enter your admin password.", 400);
        const key = createHmac("sha256", secret).update(ip).digest("hex");
        const retryAfter = await client.mutation(api.admin.loginAttempt, {
          secret,
          key,
        });
        if (retryAfter)
          return fail(
            "Too many sign-in attempts. Try again in 15 minutes.",
            429,
            { "Retry-After": String(retryAfter) },
          );
        if (!equal(body.password, config.password))
          return fail("Incorrect password.", 401);
        const value = `${Math.floor(Date.now() / 1000) + sessionSeconds}.${randomBytes(16).toString("base64url")}`;
        return respond({ authenticated: true }, 200, {
          "Set-Cookie": cookie(`${value}.${sign(value)}`, sessionSeconds),
        });
      }

      if (!sessionValid(request))
        return fail("Your session expired. Sign in again.", 401);
      if (action === "content" && request.method === "GET")
        return respond(await client.query(api.adminContent.get, { secret }));
      if (action === "events" && request.method === "PATCH") {
        const input: unknown = await request.json();
        if (
          !input ||
          typeof input !== "object" ||
          !("eventId" in input) ||
          (input.eventId !== null && typeof input.eventId !== "string") ||
          !("expected" in input) ||
          (input.expected !== null && typeof input.expected !== "object") ||
          !("event" in input) ||
          !input.event ||
          typeof input.event !== "object" ||
          !("publish" in input) ||
          typeof input.publish !== "boolean"
        )
          return fail("Invalid event data.", 400);
        const body = input as {
          eventId: Id<"events"> | null;
          expected: BookingEvent | null;
          event: BookingEvent;
          publish: boolean;
        };
        const id = await client.mutation(api.admin.saveEvent, {
          secret,
          eventId: body.eventId,
          expected: body.expected,
          event: body.event,
          publish: body.publish,
        });
        return respond({ id });
      }
      if (action === "record" && request.method === "PATCH") {
        const input = (await request.json()) as Partial<
          FunctionArgs<typeof api.adminContent.save>
        >;
        if (!input || !input.change || typeof input.publish !== "boolean")
          return fail("Invalid content data.", 400);
        const id = await client.mutation(api.adminContent.save, {
          secret,
          change: input.change,
          publish: input.publish,
        });
        return respond({ id });
      }
      if (action === "record" && request.method === "DELETE") {
        const input = (await request.json()) as Partial<
          FunctionArgs<typeof api.adminContent.remove>
        >;
        if (!input?.selection)
          return fail("Select the content to delete.", 400);
        await client.mutation(api.adminContent.remove, {
          secret,
          selection: input.selection,
        });
        return respond({ deleted: true });
      }
      if (action === "order" && request.method === "POST") {
        const input = (await request.json()) as Partial<
          FunctionArgs<typeof api.adminContent.reorder>
        >;
        if (
          !input?.table ||
          !Array.isArray(input.ids) ||
          !Array.isArray(input.expected)
        )
          return fail("Invalid content order.", 400);
        await client.mutation(api.adminContent.reorder, {
          secret,
          table: input.table,
          ids: input.ids,
          expected: input.expected,
        });
        return respond({ reordered: true });
      }
      if (action === "publish" && request.method === "POST") {
        await client.mutation(api.admin.publish, { secret });
        return respond({ published: true });
      }
      if (action === "drafts" && request.method === "DELETE") {
        const input = (await request.json()) as Partial<
          FunctionArgs<typeof api.adminContent.discardDrafts>
        >;
        if (!input?.expected || !input.publishedVersion)
          return fail("Select the saved drafts to discard.", 400);
        await client.mutation(api.adminContent.discardDrafts, {
          secret,
          expected: input.expected,
          publishedVersion: input.publishedVersion,
        });
        return respond({ discarded: true });
      }
      return fail("Admin operation not found.", 404);
    } catch (cause) {
      if (cause instanceof SyntaxError)
        return fail("Invalid request body.", 400);
      if (
        cause instanceof ConvexError &&
        cause.data &&
        typeof cause.data === "object" &&
        "code" in cause.data &&
        "message" in cause.data &&
        typeof cause.data.message === "string"
      ) {
        const status =
          cause.data.code === "CONFLICT"
            ? 409
            : cause.data.code === "UNAUTHORIZED"
              ? 403
              : cause.data.code === "NOT_FOUND"
                ? 404
                : 400;
        return fail(cause.data.message, status);
      }
      console.error(
        "Admin request failed",
        cause instanceof Error ? cause.name : "Unknown error",
      );
      return fail("Unable to complete the request. Please try again.", 500);
    }
  };
}
