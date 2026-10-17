import { createContext, createMemo, createStore, useContext } from "solid-js";
import eventSeed from "./events";
import campaignSeed from "../data/campaigns.json";
import type { BookingEvent, BookingOption } from "./types";
import {
  canBook,
  eventDate,
  hasBookingOpened,
  hasBookingEnded,
  isUpcoming,
  isVisible,
  bookingUrl,
  slotAvailable,
} from "./rules";
import { useBoundaryClock } from "../lib/useBoundaryClock";

export function createBookings() {
  const [state, setState] = createStore<{ events: BookingEvent[] }>(
    { events: structuredClone(eventSeed) },
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

  const announcement = createMemo(
    () =>
      visible().find((event) => event.announcement && isUpcoming(event, now())),
    { name: "announcement-event" },
  );

  return {
    state,
    upcoming,
    past,
    campaigns,
    announcement,
    getEvent: (id?: string) =>
      state.events.find(
        (event) => event.id === id && event.status !== "hidden",
      ),
    canBook: (event: BookingEvent) => canBook(event, now()),
    hasOpened: (event: BookingEvent) => hasBookingOpened(event, now()),
    hasEnded: (event: BookingEvent) => hasBookingEnded(event, now()),
    bookingUrl: (event: BookingEvent) => bookingUrl(event, now()),
    slotAvailable: (option: BookingOption) =>
      slotAvailable(option, state.events, now()),
    price: (event: BookingEvent) =>
      campaigns().find((campaign) => campaign.eventIds.includes(event.id))
        ?.effects.priceFrom ?? event.details.priceFrom,
    replaceEvents: (events: BookingEvent[]) =>
      setState((draft) => {
        draft.events = events;
      }),
  };
}
export type Bookings = ReturnType<typeof createBookings>;
export const BookingsContext = createContext<Bookings>();
export const useBookings = () => useContext(BookingsContext);
