import { v, type Infer, type PropertyValidators } from "convex/values";

export const slotStatus = v.union(
  v.literal("open"),
  v.literal("available"),
  v.literal("filling-fast"),
  v.literal("sold-out"),
  v.literal("soon"),
  v.literal("closed"),
);
export const bookingStatus = v.union(slotStatus, v.literal("hidden"));
export const bookingFlow = v.union(
  v.literal("direct"),
  v.literal("date-first"),
);
export const bookingOption = v.object({
  date: v.string(),
  time: v.string(),
  detailsEventId: v.optional(v.string()),
  link: v.optional(v.string()),
  status: slotStatus,
});
export const bookingAnnouncement = v.object({
  description: v.optional(v.string()),
  countdownLabel: v.optional(v.string()),
  countdownDescription: v.optional(v.string()),
});
export const bookingDetails = v.object({
  date: v.optional(v.string()),
  dateRange: v.optional(v.union(v.string(), v.null())),
  time: v.optional(v.union(v.string(), v.array(v.string()))),
  tags: v.optional(v.array(v.string())),
  duration: v.optional(v.string()),
  ageLimit: v.optional(v.string()),
  languages: v.optional(v.string()),
  genre: v.optional(v.string()),
  venue: v.optional(v.string()),
  venueLink: v.optional(v.string()),
  artists: v.optional(v.array(v.string())),
  defaultArtists: v.optional(v.array(v.string())),
  hideArtists: v.optional(v.boolean()),
  stageLayoutImage: v.optional(v.string()),
  carouselSlides: v.optional(
    v.array(
      v.object({
        desktopImage: v.string(),
        mobileImage: v.optional(v.string()),
      }),
    ),
  ),
  aboutEvent: v.optional(v.string()),
  description: v.optional(v.string()),
  highlights: v.optional(v.array(v.string())),
  priceFrom: v.optional(v.number()),
  bookingOpensAt: v.optional(v.string()),
  bookingOpensAtISO: v.optional(v.string()),
  bookingEndsAtISO: v.optional(v.string()),
  eventStartsAtISO: v.optional(v.string()),
  detailsImage: v.optional(
    v.object({
      landscape: v.optional(v.string()),
      portrait: v.optional(v.string()),
      mobile: v.optional(v.string()),
      desktop: v.optional(v.string()),
    }),
  ),
});
export const bookingEvent = v.object({
  id: v.string(),
  title: v.string(),
  image: v.string(),
  date: v.string(),
  status: bookingStatus,
  bookingLink: v.union(v.string(), v.null()),
  bookingFlow: v.optional(bookingFlow),
  bookingOrder: v.optional(v.number()),
  isFeatured: v.optional(v.boolean()),
  hiddenFromBookings: v.optional(v.boolean()),
  bookingOptions: v.optional(v.array(bookingOption)),
  announcement: v.optional(bookingAnnouncement),
  details: bookingDetails,
});

const person = v.object({
  name: v.string(),
  image: v.string(),
  link: v.optional(v.string()),
  role: v.optional(v.string()),
  hidden: v.optional(v.boolean()),
});
const slide = v.object({
  desktopImage: v.string(),
  mobileImage: v.optional(v.string()),
  alt: v.string(),
  eventId: v.optional(v.string()),
  showWhenBookingOpen: v.optional(v.boolean()),
});

export const contentValidators = {
  events: bookingEvent,
  artists: person,
  teams: person,
  gallery: v.object({
    src: v.string(),
    alt: v.string(),
    homeOrder: v.optional(v.number()),
    homeObjectPosition: v.optional(v.string()),
  }),
  carousel: slide,
  collaborations: v.object({ name: v.string(), logo: v.string() }),
  campaigns: v.object({
    id: v.string(),
    enabled: v.boolean(),
    startsAt: v.string(),
    endsAt: v.string(),
    eventIds: v.array(v.string()),
    effects: v.object({
      priceFrom: v.optional(v.number()),
      homeCarousel: v.object({
        ...slide.fields,
        position: v.union(v.literal("first"), v.literal("last")),
      }),
      homePopup: slide,
    }),
  }),
  marquee: v.object({ text: v.string() }),
  testimonials: v.object({
    name: v.string(),
    role: v.string(),
    image: v.string(),
    text: v.string(),
  }),
  terms: v.object({ text: v.string() }),
};
export type ContentTable = keyof typeof contentValidators;

const document = <
  Table extends ContentTable,
  Fields extends PropertyValidators,
>(
  table: Table,
  fields: Fields,
) =>
  v.object({
    ...fields,
    _id: v.id(table),
    _creationTime: v.number(),
    position: v.number(),
  });

export const siteContent = v.object({
  events: v.array(document("events", contentValidators.events.fields)),
  artists: v.array(document("artists", contentValidators.artists.fields)),
  teams: v.array(document("teams", contentValidators.teams.fields)),
  gallery: v.array(document("gallery", contentValidators.gallery.fields)),
  carousel: v.array(document("carousel", contentValidators.carousel.fields)),
  collaborations: v.array(
    document("collaborations", contentValidators.collaborations.fields),
  ),
  campaigns: v.array(document("campaigns", contentValidators.campaigns.fields)),
  marquee: v.array(document("marquee", contentValidators.marquee.fields)),
  testimonials: v.array(
    document("testimonials", contentValidators.testimonials.fields),
  ),
  terms: v.array(document("terms", contentValidators.terms.fields)),
  seeded: v.boolean(),
});

export type SiteContent = Infer<typeof siteContent>;
