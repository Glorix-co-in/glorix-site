import type { BookingEvent } from "./types";
import { eventMedia, eventPrice } from "./formatters";
import { isSoldOut, safeExternalUrl } from "./rules";

interface Artist {
  name: string;
  image: string;
  link?: string;
}

interface BookingState {
  canBook: boolean;
  hasOpened: boolean;
  price: number | undefined;
}

function eventAvailability(event: BookingEvent, state: BookingState) {
  const soldOut = isSoldOut(event);
  const tone = state.canBook
    ? event.status === "filling-fast"
      ? "filling-fast"
      : "available"
    : soldOut
      ? "sold-out"
      : "closed";
  let label: string;
  if (soldOut) label = "Sold Out";
  else if (!state.hasOpened)
    label = event.details.bookingOpensAt
      ? "Bookings open " + event.details.bookingOpensAt
      : "Opening Soon";
  else if (state.canBook)
    label = event.status === "filling-fast" ? "Filling Fast" : "Available";
  else label = "Bookings Closed";

  return {
    canBook: state.canBook,
    tone,
    label,
    buttonLabel: state.canBook ? "Book Now" : label,
    price: eventPrice(state.price),
  };
}

export function toEventDetails(
  event: BookingEvent,
  artists: readonly Artist[],
  state: BookingState,
) {
  const details = event.details;
  const defaults = details.defaultArtists ?? ["Saksham", "Nagity", "DJ Rick"];
  const featuredArtists = [
    ...new Set([...defaults, ...(details.artists ?? [])]),
  ].flatMap((name) => {
    const artist = artists.find((item) => item.name === name);
    return artist ? [{ ...artist, featured: defaults.includes(name) }] : [];
  });

  return {
    title: event.title,
    tags: details.tags,
    description: details.aboutEvent,
    facts: {
      date: details.dateRange || event.date,
      time: details.time || "TBA",
      duration: details.duration,
      ageLimit: details.ageLimit,
      languages: details.languages,
      genre: details.genre,
      venue: details.venue,
      venueHref: safeExternalUrl(details.venueLink),
      showVenueLink: Boolean(details.venueLink),
    },
    artists: featuredArtists,
    showArtists: !details.hideArtists && featuredArtists.length > 0,
    stageImage: details.stageLayoutImage
      ? "/" + details.stageLayoutImage
      : undefined,
    slides: [
      { ...eventMedia(event), alt: event.title },
      ...(details.carouselSlides ?? []).map((slide) => ({
        ...slide,
        alt: event.title,
      })),
    ],
    booking: eventAvailability(event, state),
  };
}

export type EventDetailsView = ReturnType<typeof toEventDetails>;
