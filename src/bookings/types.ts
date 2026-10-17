import type { Infer } from "convex/values";
import type {
  bookingStatus,
  bookingFlow,
  bookingOption,
  bookingAnnouncement,
  bookingDetails,
  bookingEvent,
} from "../../convex/validators";

export type BookingStatus = Infer<typeof bookingStatus>;
export type BookingFlow = Infer<typeof bookingFlow>;
export type BookingOption = Infer<typeof bookingOption>;
export type BookingAnnouncement = Infer<typeof bookingAnnouncement>;
export type BookingDetails = Infer<typeof bookingDetails>;
export type BookingEvent = Infer<typeof bookingEvent>;
