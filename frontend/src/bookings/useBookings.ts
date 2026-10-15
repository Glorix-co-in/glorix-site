import { createMemo, createStore, onSettled } from 'solid-js';
import eventSeed from './events.json';
import type { BookingEvent } from './types';

const activeStatuses = new Set(['open', 'available', 'filling-fast', 'sold-out', 'soon']);
const timestamp = (value?: string) => value ? Date.parse(value) : NaN;

// Match Glorix: a start time alone does not close bookings.
export function hasBookingEnded(event: BookingEvent, now: number) {
  const end = timestamp(event.details.bookingEndsAtISO);
  return Number.isFinite(end) && now >= end;
}

function isVisible(event: BookingEvent, now: number) {
  if (event.hiddenFromBookings || event.status === 'hidden') return false;
  const opens = event.details.bookingOpensAtISO;
  return !opens || now >= timestamp(opens);
}

function eventDate(event: BookingEvent) {
  const start = timestamp(event.details.eventStartsAtISO);
  if (Number.isFinite(start)) return start;
  const date = event.date.replace(/(\d+)(st|nd|rd|th)/g, '$1')
    .replace(/(\d+)\s*(?:&|-)\s*\d+/, '$1');
  return Date.parse(date) || 0;
}

export function useBookings() {
  // The JSON is an initial seed; this is the single mutable source of state.
  const [state, setState] = createStore({
    events: structuredClone(eventSeed) as BookingEvent[],
    now: Date.now(),
    selectedId: null as string | null,
    menuOpen: false,
  }, { name: 'bookings' });

  const visible = createMemo(
    () => state.events.filter((event) => isVisible(event, state.now)),
    { name: 'visible-bookings' },
  );
  const upcoming = createMemo(
    () => visible().filter((event) => activeStatuses.has(event.status) && !hasBookingEnded(event, state.now))
      .sort((a, b) => (a.bookingOrder ?? Infinity) - (b.bookingOrder ?? Infinity) || eventDate(a) - eventDate(b)),
    { name: 'upcoming-bookings' },
  );
  const past = createMemo(
    () => visible().filter((event) => !activeStatuses.has(event.status) || hasBookingEnded(event, state.now))
      .sort((a, b) => eventDate(b) - eventDate(a)),
    { name: 'past-bookings' },
  );
  const selected = createMemo(
    () => state.events.find((event) => event.id === state.selectedId),
    { name: 'selected-booking' },
  );
  const bookingUrl = createMemo(() => {
    const event = selected();
    if (!event || !activeStatuses.has(event.status) || hasBookingEnded(event, state.now)) return undefined;
    if (event.details.bookingOpensAtISO && state.now < timestamp(event.details.bookingOpensAtISO)) return undefined;
    if (event.status === 'sold-out' || !event.bookingLink) return undefined;
    try {
      const url = new URL(event.bookingLink);
      return url.protocol === 'https:' ? url.href : undefined;
    } catch { return undefined; }
  }, { name: 'booking-url' });

  onSettled(() => {
    const updateClock = () => setState((draft) => { draft.now = Date.now(); });
    const timer = setInterval(updateClock, 1000);
    window.addEventListener('focus', updateClock);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', updateClock);
    };
  });

  return {
    state, upcoming, past, selected, bookingUrl,
    openEvent: (id: string) => setState((draft) => { draft.selectedId = id; }),
    closeEvent: () => setState((draft) => { draft.selectedId = null; }),
    toggleMenu: () => setState((draft) => { draft.menuOpen = !draft.menuOpen; }),
    closeMenu: () => setState((draft) => { draft.menuOpen = false; }),
  };
}

export type Bookings = ReturnType<typeof useBookings>;
