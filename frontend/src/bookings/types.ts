export interface BookingOption {
  date: string;
  time: string;
  detailsEventId?: string;
  link?: string;
  status: string;
}

// Mirrors data/events.json in glorix-main. Preserve additional details in the seed.
export interface BookingEvent {
  id: string;
  title: string;
  image: string;
  date: string;
  status: string;
  bookingLink: string | null;
  bookingFlow?: string;
  bookingOrder?: number;
  isFeatured?: boolean;
  hiddenFromBookings?: boolean;
  bookingOptions?: BookingOption[];
  details: {
    time?: string;
    tags?: string[];
    duration?: string;
    ageLimit?: string;
    languages?: string;
    genre?: string;
    venueLink?: string;
    artists?: string[];
    defaultArtists?: string[];
    hideArtists?: boolean;
    stageLayoutImage?: string;
    carouselSlides?: { desktopImage: string; mobileImage?: string }[];
    venue?: string;
    aboutEvent?: string;
    priceFrom?: number;
    bookingOpensAtISO?: string;
    bookingEndsAtISO?: string;
    eventStartsAtISO?: string;
    detailsImage?: { landscape?: string; portrait?: string };
    [key: string]: unknown;
  };
}
