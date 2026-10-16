import { createMemo, type Accessor } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { useBookings } from "./useBookings";
import {
  selectedSlotDate,
  selectedSlotTime,
  slotDateStatus,
} from "./selection";
import type { BookingEvent, BookingOption } from "./types";

export function useSlotSelection(event: Accessor<BookingEvent | undefined>) {
  const bookings = useBookings();
  const [query, setQuery] = useSearchParams();
  const options = createMemo(() => event()?.bookingOptions ?? [], {
    name: "booking-options",
  });
  const dates = createMemo(
    () => [...new Set(options().map((option) => option.date))],
    { name: "slot-dates" },
  );
  const available = (option: BookingOption) => {
    const item = event();
    return Boolean(
      item && bookings.canBook(item) && bookings.slotAvailable(option),
    );
  };
  const date = createMemo(() => selectedSlotDate(options(), query), {
    name: "selected-date",
  });
  const times = createMemo(
    () => options().filter((option) => option.date === date()),
    { name: "slot-times" },
  );
  const time = createMemo(() => selectedSlotTime(options(), query, available), {
    name: "selected-time",
  });
  const dateStatus = (value: string) =>
    slotDateStatus(
      options().filter((option) => option.date === value),
      available,
    );
  const selectDate = (value: string) => {
    const day = options().filter((option) => option.date === value);
    const first = day.find(available);
    const slot = day.length === 1 ? first?.detailsEventId : undefined;
    if (first)
      setQuery(
        { slot, date: slot ? undefined : value, time: undefined },
        { scroll: false },
      );
  };
  const selectTime = (option: BookingOption) => {
    if (available(option))
      setQuery(
        {
          slot: option.detailsEventId,
          date: option.detailsEventId ? undefined : option.date,
          time: option.time,
        },
        { scroll: false },
      );
  };
  return {
    dates,
    date,
    times,
    time,
    available,
    dateStatus,
    selectDate,
    selectTime,
  };
}
