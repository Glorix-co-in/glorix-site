export type BookingStatus =
  | "open"
  | "available"
  | "filling-fast"
  | "sold-out"
  | "soon"
  | "closed"
  | "hidden";
export type BookingFlow = "direct" | "date-first";
export interface BookingOption {
  date: string;
  time: string;
  detailsEventId?: string;
  link?: string;
  status: Exclude<BookingStatus, "hidden">;
}
export interface BookingAnnouncement {
  description?: string;
  countdownLabel?: string;
  countdownDescription?: string;
}
export interface BookingDetails {
  date?: string;
  dateRange?: string | null;
  time?: string | string[];
  tags?: string[];
  duration?: string;
  ageLimit?: string;
  languages?: string;
  genre?: string;
  venue?: string;
  venueLink?: string;
  artists?: string[];
  defaultArtists?: string[];
  hideArtists?: boolean;
  stageLayoutImage?: string;
  carouselSlides?: { desktopImage: string; mobileImage?: string }[];
  aboutEvent?: string;
  description?: string;
  highlights?: string[];
  priceFrom?: number;
  bookingOpensAt?: string;
  bookingOpensAtISO?: string;
  bookingEndsAtISO?: string;
  eventStartsAtISO?: string;
  detailsImage?: {
    landscape?: string;
    portrait?: string;
    mobile?: string;
    desktop?: string;
  };
}
export interface BookingEvent {
  id: string;
  title: string;
  image: string;
  date: string;
  status: BookingStatus;
  bookingLink: string | null;
  bookingFlow?: BookingFlow;
  bookingOrder?: number;
  isFeatured?: boolean;
  hiddenFromBookings?: boolean;
  bookingOptions?: BookingOption[];
  announcement?: BookingAnnouncement;
  details: BookingDetails;
}
