export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  const eventId = url.searchParams.get("id");

  // No event id → normal page
  if (!eventId) {
    return context.next();
  }

  try {
    const origin = url.origin;

    // Get current static event data
    const eventsRes = await fetch(`${origin}/data/events.json`);
    const events = await eventsRes.json();

    const event = events.find((e: any) => e.id === eventId);

    if (!event) {
      return context.next();
    }

    // Get the normal details.html response
    const response = await context.next();
    let html = await response.text();

    const title = `${event.title} | GLORIX`;

    const description =
      event.details?.description ||
      `${event.title} by GLORIX. View event details, venue, timings and tickets.`;

    // Prefer landscape event image for social preview
    const imagePath =
      event.details?.detailsImage?.landscape ||
      event.image ||
      "assets/Poster.avif";

    const imageUrl = new URL(imagePath, `${origin}/`).href;
    const pageUrl = url.href;

    const escapeHtml = (value: string) =>
      String(value)
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

    const safeTitle = escapeHtml(title);
    const safeDescription = escapeHtml(description);
    const safeImage = escapeHtml(imageUrl);
    const safeUrl = escapeHtml(pageUrl);

    html = html
      .replace(
        /<title>[\s\S]*?<\/title>/i,
        `<title>${safeTitle}</title>`,
      )

      .replace(
        /<meta\s+name="description"[\s\S]*?>/i,
        `<meta name="description" content="${safeDescription}" />`,
      )

      .replace(
        /<meta\s+property="og:url"[\s\S]*?>/i,
        `<meta property="og:url" content="${safeUrl}" />`,
      )

      .replace(
        /<meta\s+property="og:title"[\s\S]*?>/i,
        `<meta property="og:title" content="${safeTitle}" />`,
      )

      .replace(
        /<meta\s+property="og:description"[\s\S]*?>/i,
        `<meta property="og:description" content="${safeDescription}" />`,
      )

      .replace(
        /<meta\s+property="og:image"[\s\S]*?>/i,
        `<meta property="og:image" content="${safeImage}" />`,
      )

      .replace(
        /<meta\s+name="twitter:url"[\s\S]*?>/i,
        `<meta name="twitter:url" content="${safeUrl}" />`,
      )

      .replace(
        /<meta\s+name="twitter:title"[\s\S]*?>/i,
        `<meta name="twitter:title" content="${safeTitle}" />`,
      )

      .replace(
        /<meta\s+name="twitter:description"[\s\S]*?>/i,
        `<meta name="twitter:description" content="${safeDescription}" />`,
      )

      .replace(
        /<meta\s+name="twitter:image"[\s\S]*?>/i,
        `<meta name="twitter:image" content="${safeImage}" />`,
      );

    return new Response(html, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers),

        // Browser/CDN can cache the generated page.
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Netlify-CDN-Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",

        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Event metadata edge function failed:", error);

    // Never break the actual website because SEO generation failed.
    return context.next();
  }
};