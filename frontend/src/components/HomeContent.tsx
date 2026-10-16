import { createMemo, For } from "solid-js";
import { useBookings } from "../bookings/useBookings";
import carousel from "../data/carousel.json";
import gallery from "../data/gallery.json";
import brands from "../data/collaborations.json";
import MediaCarousel from "./MediaCarousel";
import GalleryGrid, { type GalleryItem } from "./GalleryGrid";
export function HomeCarousel() {
  const bookings = useBookings();
  const slides = createMemo(
    () => {
      const campaigns = bookings
        .campaigns()
        .map((campaign) => campaign.effects.homeCarousel);
      return [
        ...campaigns.filter((slide) => slide.position !== "last"),
        ...carousel,
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
  const items = (gallery as GalleryItem[])
    .filter(
      (item) => item.homeOrder && item.homeOrder >= 1 && item.homeOrder <= 11,
    )
    .sort((a, b) => a.homeOrder! - b.homeOrder!);
  return <GalleryGrid items={items} home />;
}
export function Collaborations() {
  return (
    <div class="marquee" id="collaborationMarquee">
      <For each={[0, 1]}>
        {() => (
          <div class="marquee-content">
            <For each={brands}>
              {(brand) => (
                <div class="collaboration-item">
                  <img
                    src={"/" + brand.logo}
                    alt={brand.name}
                    class="collab-logo"
                    loading="lazy"
                  />
                  <span class="collab-name">{brand.name}</span>
                </div>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
}
