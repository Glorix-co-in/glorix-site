import { createMemo, createStore } from "solid-js";
import type { Doc } from "../../convex/_generated/dataModel";
import type {
  BookingAnnouncement,
  BookingDetails,
  BookingEvent,
  BookingOption,
} from "../bookings/types";
import { canonical, eventData } from "../../shared/events";

export function createEventEditor() {
  const [form, setForm] = createStore<{
    original?: Doc<"events">;
    event?: BookingEvent;
  }>({}, { name: "admin-event-form" });
  const dirty = createMemo(
    () =>
      Boolean(
        form.event &&
        (!form.original ||
          canonical(form.event) !== canonical(eventData(form.original))),
      ),
    { name: "admin-event-dirty" },
  );
  const open = (event: Doc<"events">) =>
    setForm((draft) => {
      draft.original = JSON.parse(JSON.stringify(event));
      draft.event = eventData(event);
    });
  const change = <K extends keyof BookingEvent>(
    key: K,
    value: BookingEvent[K],
  ) =>
    setForm((draft) => {
      if (draft.event) draft.event[key] = value;
    });
  const detail = <K extends keyof BookingDetails>(
    key: K,
    value: BookingDetails[K],
  ) =>
    setForm((draft) => {
      if (draft.event) draft.event.details[key] = value;
    });
  const image = (
    key: keyof NonNullable<BookingDetails["detailsImage"]>,
    value: string,
  ) =>
    setForm((draft) => {
      if (!draft.event) return;
      draft.event.details.detailsImage ??= {};
      draft.event.details.detailsImage[key] = value || undefined;
    });
  const announcement = (key: keyof BookingAnnouncement, value: string) =>
    setForm((draft) => {
      if (!draft.event?.announcement) return;
      draft.event.announcement[key] = value || undefined;
    });
  const session = <K extends keyof BookingOption>(
    index: number,
    key: K,
    value: BookingOption[K],
  ) =>
    setForm((draft) => {
      const option = draft.event?.bookingOptions?.[index];
      if (option) option[key] = value;
    });
  const addSession = () =>
    setForm((draft) => {
      if (!draft.event) return;
      (draft.event.bookingOptions ??= []).push({
        date: "",
        time: "",
        status: "open",
      });
    });
  const removeSession = (index: number) =>
    setForm((draft) => {
      draft.event?.bookingOptions?.splice(index, 1);
    });
  const slide = (
    index: number,
    key: "desktopImage" | "mobileImage",
    value: string,
  ) =>
    setForm((draft) => {
      const item = draft.event?.details.carouselSlides?.[index];
      if (item) {
        if (key === "desktopImage") item.desktopImage = value;
        else item.mobileImage = value || undefined;
      }
    });
  const addSlide = () =>
    setForm((draft) => {
      if (draft.event)
        (draft.event.details.carouselSlides ??= []).push({ desktopImage: "" });
    });
  const removeSlide = (index: number) =>
    setForm((draft) => {
      draft.event?.details.carouselSlides?.splice(index, 1);
    });
  const reset = () => {
    if (form.original) open(form.original);
    else openNew();
  };
  const openNew = () =>
    setForm((draft) => {
      draft.original = undefined;
      draft.event = {
        id: "",
        title: "",
        image: "",
        date: "",
        status: "hidden",
        bookingLink: null,
        details: {},
      };
    });
  const clear = () =>
    setForm((draft) => {
      draft.original = undefined;
      draft.event = undefined;
    });

  return {
    form,
    dirty,
    open,
    openNew,
    change,
    detail,
    image,
    announcement,
    session,
    addSession,
    removeSession,
    slide,
    addSlide,
    removeSlide,
    reset,
    clear,
  };
}

export type EventEditorState = ReturnType<typeof createEventEditor>;
