import { createEffect, For, Show } from 'solid-js';
import type { Bookings } from '../bookings/useBookings';

export default function EventDetails(props: { bookings: Bookings }) {
  let dialog!: HTMLDialogElement;
  createEffect(
    () => props.bookings.state.selectedId,
    (id) => {
      if (id && !dialog.open) dialog.showModal();
      else if (!id && dialog.open) dialog.close();
    },
  );

  return (
    <dialog ref={(element) => { dialog = element; }} class="event-dialog" aria-labelledby="event-title"
      onClose={() => props.bookings.closeEvent()} onCancel={() => props.bookings.closeEvent()}>
      <Show when={props.bookings.selected()}>
        {(event) => (
          <>
            <button class="dialog-close" onClick={() => props.bookings.closeEvent()} aria-label="Close event details">×</button>
            <img class="dialog-poster" src={'/' + (event().details.detailsImage?.landscape || event().image)} alt={event().title} />
            <div class="dialog-content">
              <h2 id="event-title">{event().title}</h2>
              <p>{event().date} · {event().details.time}</p>
              <p>{event().details.venue}</p>
              <p class="event-description">{event().details.aboutEvent}</p>
              <Show when={event().bookingOptions?.length}>
                <h3>Choose your date</h3>
                <div class="date-options">
                  <For each={event().bookingOptions}>
                    {(option) => <button onClick={() => props.bookings.openEvent(option.detailsEventId)}>{option.date}<small>{option.time}</small></button>}
                  </For>
                </div>
              </Show>
              <Show when={props.bookings.bookingUrl()}>
                {(url) => <a class="booking-link" href={url()} target="_blank" rel="noopener noreferrer">Continue to ticket provider ↗</a>}
              </Show>
              <Show when={!event().bookingOptions?.length && !props.bookings.bookingUrl()}>
                <p class="booking-unavailable">Tickets are not currently available for this event.</p>
              </Show>
            </div>
          </>
        )}
      </Show>
    </dialog>
  );
}
