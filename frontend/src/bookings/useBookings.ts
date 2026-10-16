import { createContext, createMemo, createStore, useContext } from "solid-js";
import eventSeed from "./events.json";
import campaignSeed from "../data/campaigns.json";
import type { BookingEvent, BookingOption } from "./types";
import {
  canBook,
  eventDate,
  hasBookingOpened,
  isUpcoming,
  isVisible,
  bookingUrl,
  slotAvailable,
} from "./rules";
import { useBoundaryClock } from "../lib/useBoundaryClock";

// The store contains domain records only. Time is managed by a separate helper.
export function createBookings() {
  const [state, setState] = createStore(
    { events: structuredClone(eventSeed) as BookingEvent[] },
    { name: "booking-data" },
  );
  const boundaries = createMemo(
    () =>
      [
        ...state.events.flatMap((event) => [
          Date.parse(event.details.bookingOpensAtISO || ""),
          Date.parse(event.details.bookingEndsAtISO || ""),
        ]),
        ...campaignSeed.flatMap((campaign) => [
          Date.parse(campaign.startsAt),
          Date.parse(campaign.endsAt),
        ]),
      ]
        .filter(Number.isFinite)
        .sort((a, b) => a - b),
    { name: "booking-boundaries" },
  );
  const now = useBoundaryClock(boundaries);
  const sameItems = <T>(a: T[], b: T[]) =>
    a.length === b.length && a.every((item, index) => item === b[index]);
  const visible = createMemo(
    () => state.events.filter((event) => isVisible(event, now())),
    { name: "visible-bookings", equals: sameItems },
  );
  const upcoming = createMemo(
    () =>
      visible()
        .filter((event) => isUpcoming(event, now()))
        .sort(
          (a, b) =>
            (a.bookingOrder ?? Infinity) - (b.bookingOrder ?? Infinity) ||
            eventDate(a) - eventDate(b),
        ),
    { name: "upcoming-bookings", equals: sameItems },
  );
  const past = createMemo(
    () =>
      visible()
        .filter((event) => !isUpcoming(event, now()))
        .sort((a, b) => eventDate(b) - eventDate(a)),
    { name: "past-bookings", equals: sameItems },
  );
  const campaigns = createMemo(
    () =>
      campaignSeed.filter(
        (campaign) =>
          campaign.enabled &&
          Date.parse(campaign.startsAt) <= now() &&
          now() < Date.parse(campaign.endsAt),
      ),
    { name: "active-campaigns", equals: sameItems },
  );

  return {
    state,
    upcoming,
    past,
    campaigns,
    getEvent: (id?: string) =>
      state.events.find(
        (event) => event.id === id && event.status !== "hidden",
      ),
    canBook: (event: BookingEvent) => canBook(event, now()),
    hasOpened: (event: BookingEvent) => hasBookingOpened(event, now()),
    bookingUrl: (event: BookingEvent) => bookingUrl(event, now()),
    slotAvailable: (option: BookingOption) =>
      slotAvailable(option, state.events, now()),
    price: (event: BookingEvent) =>
      campaigns().find((campaign) => campaign.eventIds.includes(event.id))
        ?.effects.priceFrom ?? event.details.priceFrom,
    // Future loading can replace data here; it has no navigation or dialog state.
    replaceEvents: (events: BookingEvent[]) =>
      setState((draft) => {
        draft.events = events;
      }),
  };
}
export type Bookings = ReturnType<typeof createBookings>;
export const BookingsContext = createContext<Bookings>();
export const useBookings = () => useContext(BookingsContext);
