import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { createContentHandler } from "./content.ts";
import { createAdminHandler, type AdminConfig } from "./admin.ts";

export function siteApi(config: AdminConfig): Plugin {
  const content = createContentHandler(config.convexUrl);
  const admin = createAdminHandler(config);
  const middleware = async (
    request: IncomingMessage,
    response: ServerResponse,
    next: (error?: unknown) => void,
  ) => {
    const url = new URL(
      request.url ?? "/",
      `http://${request.headers.host ?? "localhost"}`,
    );
    if (url.pathname !== "/api/content" && url.pathname !== "/api/admin")
      return next();
    try {
      const headers = new Headers();
      for (const [name, value] of Object.entries(request.headers)) {
        if (value)
          for (const item of Array.isArray(value) ? value : [value])
            headers.append(name, item);
      }
      const chunks: Buffer[] = [];
      let size = 0;
      if (request.method !== "GET" && request.method !== "HEAD") {
        for await (const chunk of request) {
          const bytes = Buffer.from(chunk);
          size += bytes.length;
          if (size > 128 * 1024) {
            response.writeHead(413, { "Cache-Control": "no-store" });
            response.end("Request is too large.");
            return;
          }
          chunks.push(bytes);
        }
      }
      const webRequest = new Request(url, {
        method: request.method,
        headers,
        body: chunks.length
          ? Buffer.concat(chunks).toString("utf8")
          : undefined,
      });
      const result =
        url.pathname === "/api/admin"
          ? await admin(webRequest, request.socket.remoteAddress)
          : await content(webRequest);
      response.statusCode = result.status;
      result.headers.forEach((value, name) => response.setHeader(name, value));
      response.end(await result.text());
    } catch (cause) {
      next(cause);
    }
  };

  return {
    name: "site-api",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
