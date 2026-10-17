import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const noCacheHeaders = {
  "Cache-Control": "no-store",
  "Netlify-CDN-Cache-Control": "no-store",
  "Netlify-Vary": "query=version",
};

export function createContentHandler(convexUrl: string | undefined) {
  const client = convexUrl ? new ConvexHttpClient(convexUrl) : undefined;

  return async (request: Request): Promise<Response> => {
    const fail = (
      error: string,
      status: number,
      headers?: Record<string, string>,
    ) =>
      Response.json(
        { error },
        { status, headers: { ...noCacheHeaders, ...headers } },
      );

    if (request.method !== "GET")
      return fail("Method not allowed.", 405, { Allow: "GET" });

    const params = new URL(request.url).searchParams;
    const version = params.get("version");
    if (
      !version ||
      version.length > 128 ||
      params.getAll("version").length !== 1
    )
      return fail("A single content version is required.", 400);
    if (!client) return fail("Site content is not configured.", 503);

    try {
      const content = await client.query(api.publishing.snapshot, { version });
      if (!content) return fail("Content version not found.", 404);
      return Response.json(content, {
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          "Netlify-CDN-Cache-Control": "public, durable, max-age=31536000",
          "Netlify-Vary": "query=version",
        },
      });
    } catch (cause) {
      console.error("Unable to retrieve published content", cause);
      return fail("Unable to load site content.", 502);
    }
  };
}
