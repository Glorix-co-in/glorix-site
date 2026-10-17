import { createEffect, createSignal, onSettled, type Accessor } from "solid-js";
import type { BookingEvent } from "../../bookings/types";

export function useAnnouncementDialog(
  event: Accessor<BookingEvent | undefined>,
) {
  const [open, setOpen] = createSignal(false, { name: "announcement-open" });
  let dialog!: HTMLDialogElement;
  const close = () => setOpen(false);

  createEffect(
    open,
    (visible) => {
      if (visible && !dialog.open) dialog.showModal();
      if (!visible && dialog.open) dialog.close();
    },
    { name: "announcement-visibility" },
  );
  createEffect(
    event,
    (item) => {
      close();
      if (!item) return;
      try {
        const key = "announcement:" + item.id;
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "seen");
      } catch {}
      setOpen(true);
    },
    { name: "announcement-session" },
  );
  onSettled(() => () => {
    if (dialog.open) dialog.close();
  });

  return {
    open,
    close,
    ref: (element: HTMLDialogElement) => {
      dialog = element;
    },
  };
}
