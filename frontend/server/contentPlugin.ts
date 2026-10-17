import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { createContentHandler } from "./content.ts";

export function contentApi(convexUrl: string | undefined): Plugin {
  const handler = createContentHandler(convexUrl);
  const middleware = async (
    request: IncomingMessage,
    response: ServerResponse,
    next: (error?: unknown) => void,
  ) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    if (url.pathname !== "/api/content") return next();
    try {
      const result = await handler(
        new Request(url, { method: request.method }),
      );
      response.statusCode = result.status;
      result.headers.forEach((value, name) => response.setHeader(name, value));
      response.end(await result.text());
    } catch (cause) {
      next(cause);
    }
  };

  return {
    name: "site-content-api",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
