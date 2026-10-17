import styles from "./Collaborations.module.css";
import { createMemo, For } from "solid-js";
import { useBookings } from "../bookings/useBookings";
import { useContent } from "../content/useContent";
import MediaCarousel from "./MediaCarousel";
import GalleryGrid from "./GalleryGrid";
export function HomeCarousel() {
  const bookings = useBookings();
  const content = useContent();
  const slides = createMemo(
    () => {
      const campaigns = bookings
        .campaigns()
        .map((campaign) => campaign.effects.homeCarousel);
      return [
        ...campaigns.filter((slide) => slide.position !== "last"),
        ...content.carousel,
        ...campaigns.filter((slide) => slide.position === "last"),
      ].filter(
        (slide) =>
          !slide.showWhenBookingOpen ||
          ("eventId" in slide &&
            slide.eventId &&
            Boolean(
              bookings.getEvent(slide.eventId) &&
              bookings.canBook(bookings.getEvent(slide.eventId)!),
            )),
      );
    },
    { name: "home-slides" },
  );
  return <MediaCarousel slides={slides()} label="Featured events" home />;
}
export function HomeGallery() {
  const content = useContent();
  const items = createMemo(
    () =>
      content.gallery
        .filter(
          (item) =>
            item.homeOrder && item.homeOrder >= 1 && item.homeOrder <= 11,
        )
        .sort((a, b) => a.homeOrder! - b.homeOrder!),
    { name: "home-gallery" },
  );
  return <GalleryGrid items={items()} home />;
}
export function Collaborations() {
  const content = useContent();
  return (
    <div
      class={styles.marquee}
      id="collaborationMarquee"
      data-animate="collaborations"
    >
      <For each={[0, 1]}>
        {() => (
          <div class={styles.content}>
            <For each={content.collaborations}>
              {(brand) => (
                <div class={styles.item}>
                  <img
                    src={"/" + brand.logo}
                    alt={brand.name}
                    class={styles.logo}
                    loading="lazy"
                  />
                  <span class={styles.name}>{brand.name}</span>
                </div>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
}
