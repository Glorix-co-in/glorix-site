import type { BookingEvent } from '../bookings/types';

export default function EventCard(props: {
  event: BookingEvent;
  upcoming: boolean;
  onOpen: (id: string) => void;
}) {
  const featured = () => props.upcoming && props.event.isFeatured;
  const image = () => featured()
    ? props.event.details.detailsImage?.landscape || props.event.image
    : props.event.details.detailsImage?.portrait || props.event.image;

  return (
    <article class={{ 'event-card': true, 'event-card--featured': featured() }}>
      <button class="event-card__poster" onClick={() => props.onOpen(props.event.id)} aria-label={'View ' + props.event.title}>
        <img src={'/' + image()} alt={props.event.title} loading={featured() ? 'eager' : 'lazy'} />
      </button>
      <div class="event-card__content">
        <div class="event-card__text">
          <h3>{props.event.title}</h3>
          <p>{props.event.date}</p>
        </div>
        <button class="event-card__view" onClick={() => props.onOpen(props.event.id)} aria-label={'View details for ' + props.event.title}>
          View <span class="desktop-only">Details</span>
        </button>
      </div>
    </article>
  );
}
