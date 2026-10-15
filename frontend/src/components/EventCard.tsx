import { Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import type { BookingEvent } from '../bookings/types';
import { eventHref } from '../bookings/rules';
import { useMediaQuery } from '../lib/useMediaQuery';
export default function EventCard(props: { event: BookingEvent; upcoming: boolean }) {
  const navigate = useNavigate();
  const mobile = useMediaQuery('(max-width: 768px)');
  const featured = () => Boolean(props.upcoming && props.event.isFeatured);
  const image = () => featured() ? props.event.details.detailsImage?.landscape || props.event.image
    : !props.upcoming ? props.event.details.detailsImage?.portrait || props.event.image : props.event.image;
  const shortDate = () => {
    const match = props.event.date.match(/(\d+(?:st|nd|rd|th)(?:\s*(?:&|-)?\s*\d+(?:st|nd|rd|th))?)\s+([A-Za-z]+)/);
    return match ? match[1] + ' ' + match[2].slice(0,3) : props.event.date;
  };
  const open = () => navigate(eventHref(props.event));
  return <Show when={mobile()} fallback={
    <div class={{ 'event-card': true, 'event-card--featured': featured() }} style={{ cursor: 'pointer' }} onClick={open}>
      <div class="event-card__image" style={{ '--bg-image': 'url("/' + image() + '")' }}><img src={'/' + image()} alt={props.event.title} loading="lazy" /></div>
      <div class="event-card__content"><h3 class="event-card__title">{props.event.title}</h3><p class="event-card__date">{props.event.date}</p><button class="event-card__btn event-card__btn--view">View Details</button></div>
    </div>
  }>
    <div class={{ 'event-card-mobile': true, 'event-card--featured': featured() }} style={{ cursor: 'pointer' }} onClick={open}>
      <div class="event-card-mobile__image" style={{ '--bg-image': 'url("/' + image() + '")' }}><img src={'/' + image()} alt={props.event.title} loading="lazy" /></div>
      <div class="event-card-mobile__info"><div class="event-card-mobile__text"><h3 class="event-card-mobile__title">{props.event.title}</h3><p class="event-card-mobile__date">{shortDate()}</p></div><button class="event-card-mobile__btn event-card-mobile__btn--view">View</button></div>
    </div>
  </Show>;
}
