export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  const eventId = url.searchParams.get("id");
  const slotEventId = url.searchParams.get("slot");

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

    // A slot may point at a date-specific detail record. Use it for social
    // metadata while leaving the page's `id` as the parent booking event.
    const slotEvent = slotEventId
      ? events.find((e: any) =>
          e.id === slotEventId &&
          (event.bookingOptions || []).some(
            (option: any) => option.detailsEventId === e.id,
          ),
        )
      : undefined;
    const metadataEvent = slotEvent || event;
    const title = `${metadataEvent.title} | GLORIX`;

    const description =
      metadataEvent.details?.description ||
      `${metadataEvent.title} by GLORIX. View event details, venue, timings and tickets.`;

    // Use the specially cropped Dandiya poster for social cards; it is separate
    // from the images used in the event pages and booking cards.
    const isDandiyaParent = event.id === "glorix-dandiya-night-2026";
    const imagePath = slotEvent
      ? slotEvent.details?.detailsImage?.landscape || slotEvent.image
      : isDandiyaParent
      ? "assets/events/glorix_dandiya_night_2026_landscape_cropped.avif"
      : metadataEvent.details?.detailsImage?.landscape ||
        metadataEvent.image ||
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
