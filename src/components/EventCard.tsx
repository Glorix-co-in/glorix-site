import styles from "./EventCard.module.css";
import { Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import type { BookingEvent } from "../bookings/types";
import { eventHref } from "../bookings/rules";
import { eventMedia, shortEventDate } from "../bookings/formatters";
import { useMediaQuery } from "../lib/useMediaQuery";
export default function EventCard(props: {
  event: BookingEvent;
  upcoming: boolean;
}) {
  const navigate = useNavigate();
  const mobile = useMediaQuery("(max-width: 768px)");
  const featured = () => Boolean(props.upcoming && props.event.isFeatured);
  const image = () =>
    featured()
      ? eventMedia(props.event).mobileImage
      : !props.upcoming
        ? eventMedia(props.event).desktopImage
        : props.event.image;
  const open = () => navigate(eventHref(props.event));
  return (
    <Show
      when={mobile()}
      fallback={
        <div
          class={{
            [styles.card]: true,
            [styles.desktop]: true,
            [styles.featured]: featured(),
          }}
          onClick={open}
          data-animate="event-card"
        >
          <div
            class={styles.image}
            style={{ "--bg-image": 'url("/' + image() + '")' }}
          >
            <img src={"/" + image()} alt={props.event.title} loading="lazy" />
          </div>
          <div class={styles.content}>
            <h3 class={styles.title}>{props.event.title}</h3>
            <p class={styles.date}>{props.event.date}</p>
            <button class={styles.button}>View Details</button>
          </div>
        </div>
      }
    >
      <div
        class={{
          [styles.card]: true,
          [styles.mobile]: true,
          [styles.featured]: featured(),
        }}
        onClick={open}
        data-animate="event-card"
      >
        <div
          class={styles.image}
          style={{ "--bg-image": 'url("/' + image() + '")' }}
        >
          <img src={"/" + image()} alt={props.event.title} loading="lazy" />
        </div>
        <div class={styles.info}>
          <div class={styles.text}>
            <h3 class={styles.title}>{props.event.title}</h3>
            <p class={styles.date}>{shortEventDate(props.event.date)}</p>
          </div>
          <button class={styles.button}>View</button>
        </div>
      </div>
    </Show>
  );
}
