export interface BookingOption {
  date: string;
  time: string;
  detailsEventId: string;
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
