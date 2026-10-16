import { createMemo, createSignal, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useBookings } from "../bookings/useBookings";
import { safeExternalUrl } from "../bookings/rules";
import artists from "../data/artists.json";
import "../styles/pages/event-details.css";
import MediaCarousel from "./MediaCarousel";
import PageTitle from "./PageTitle";
import NotFound from "./NotFound";
import EventHeader from "./EventHeader";
import BottomSheet from "./BottomSheet";
import EventDescription from "./EventDescription";
import terms from "../data/terms.json";
import "../styles/controls.css";
export default function EventPage(props: { id?: string }) {
  const bookings = useBookings();
  const navigate = useNavigate();
  const event = createMemo(() => bookings.getEvent(props.id), {
    name: "event-details",
  });
  const [modal, setModal] = createSignal<"terms" | "stage" | null>(null, {
    name: "event-modal",
  });
  const defaultArtists = createMemo(
    () => event()?.details.defaultArtists || ["Saksham", "Nagity", "DJ Rick"],
    { name: "default-artists" },
  );
  const featuredArtists = createMemo(
    () =>
      [...new Set([...defaultArtists(), ...(event()?.details.artists || [])])]
        .map((name) => artists.find((artist) => artist.name === name))
        .filter((artist): artist is (typeof artists)[number] =>
          Boolean(artist),
        ),
    { name: "event-artists" },
  );
  const slides = createMemo(
    () => {
      const item = event();
      return item
        ? [
            {
              desktopImage: item.details.detailsImage?.portrait || item.image,
              mobileImage: item.details.detailsImage?.landscape || item.image,
              alt: item.title,
            },
            ...(item.details.carouselSlides || []).map((slide) => ({
              ...slide,
              alt: item.title,
            })),
          ]
        : [];
    },
    { name: "event-media" },
  );
  const availability = createMemo(
    () => {
      const item = event();
      if (!item) return "Bookings Closed";
      if (item.status === "sold-out") return "Sold Out";
      if (!bookings.hasOpened(item))
        return item.details.bookingOpensAt
          ? "Bookings open " + item.details.bookingOpensAt
          : "Opening Soon";
      if (bookings.canBook(item))
        return item.status === "filling-fast" ? "Filling Fast" : "Available";
      return "Bookings Closed";
    },
    { name: "event-availability" },
  );
  const book = () => {
    const item = event();
    if (!item || !bookings.canBook(item)) return;
    if (item.bookingOptions?.length)
      navigate("/events/" + encodeURIComponent(item.id) + "/slots");
    else {
      const url = bookings.bookingUrl(item);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    }
  };
  return (
    <>
      <Show when={event()} fallback={<NotFound message="Event not found" />}>
        {(item) => (
          <>
            <PageTitle title={item().title} />
            <EventHeader title={item().title} />
            <main id="main-content" class="details-main event-details-page">
              <MediaCarousel slides={slides()} label={item().title} />
              <div class="details-content-wrapper">
                <div class="details-scroll-content">
                  <div class="event-tags" id="eventTags">
                    <For each={item().details.tags}>
                      {(tag) => <span class="event-tag">{tag}</span>}
                    </For>
                  </div>

                  <div class="event-details-list">
                    <div class="detail-item" id="dateItem">
                      <i class="far fa-calendar" />
                      <span id="eventDate">
                        {item().details.dateRange || item().date}
                      </span>
                    </div>
                    <div class="detail-item" id="timeItem">
                      <i class="far fa-clock" />
                      <span id="eventTime">{item().details.time || "TBA"}</span>
                    </div>
                    <div class="detail-item" id="durationItem">
                      <i class="fas fa-hourglass-half" />
                      <span id="eventDuration">{item().details.duration}</span>
                    </div>
                    <div class="detail-item" id="ageItem">
                      <i class="fas fa-users" />
                      <span>
                        Age Limit -{" "}
                        <span id="eventAge">{item().details.ageLimit}</span>
                      </span>
                    </div>
                    <div class="detail-item" id="languageItem">
                      <i class="fas fa-language" />
                      <span id="eventLanguage">{item().details.languages}</span>
                    </div>
                    <div class="detail-item" id="genreItem">
                      <i class="fas fa-music" />
                      <span id="eventGenre">{item().details.genre}</span>
                    </div>
                    <div class="detail-item venue-item" id="venueItem">
                      <i class="fas fa-location-dot" />
                      <span id="eventVenue">{item().details.venue}</span>
                      <a
                        href={safeExternalUrl(item().details.venueLink)}
                        id="venueLink"
                        style={{
                          display: item().details.venueLink
                            ? undefined
                            : "none",
                        }}
                        class="venue-direction"
                        target="_blank"
                        aria-label="Get directions"
                      >
                        <i class="fas fa-location-arrow" />
                      </a>
                    </div>
                  </div>

                  <EventDescription text={item().details.aboutEvent} />

                  <div
                    class="artists-section"
                    id="artistsSection"
                    style={{
                      display:
                        !item().details.hideArtists && featuredArtists().length
                          ? "block"
                          : "none",
                    }}
                  >
                    <h2 class="about-title">Featured Artists</h2>
                    <div class="artists-carousel-wrapper">
                      <div class="artists-grid" id="eventArtists">
                        <For each={featuredArtists()}>
                          {(artist) => (
                            <a
                              href={artist.link || "#"}
                              class="event-artist-card"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <div
                                class={{
                                  "artist-img-wrapper": true,
                                  featured: defaultArtists().includes(
                                    artist.name,
                                  ),
                                }}
                              >
                                <img
                                  src={"/" + artist.image}
                                  alt={artist.name}
                                  loading="lazy"
                                />
                              </div>
                              <span class="artist-name">{artist.name}</span>
                            </a>
                          )}
                        </For>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="terms-section"
                    id="stageLayoutSection"
                    aria-haspopup="dialog"
                    style={{
                      display: item().details.stageLayoutImage
                        ? "flex"
                        : "none",
                    }}
                    onClick={() => setModal("stage")}
                  >
                    <span class="terms-text">Stage Layout</span>
                    <i class="fas fa-chevron-right" />
                  </button>

                  <button
                    type="button"
                    class="terms-section"
                    id="termsSection"
                    aria-haspopup="dialog"
                    onClick={() => setModal("terms")}
                  >
                    <span class="terms-text">Terms & Conditions</span>
                    <i class="fas fa-chevron-right" />
                  </button>
                </div>

                <div class="sticky-bottom-bar">
                  <div class="price-info">
                    <span class="price-label">
                      <span
                        class="currency-symbol"
                        style={{
                          display:
                            bookings.price(item()) === 0 ? "none" : undefined,
                        }}
                      >
                        ₹
                      </span>
                      <span id="priceFrom">
                        {bookings.price(item()) === 0
                          ? "Free Entry"
                          : (bookings.price(item()) ?? "TBA")}
                      </span>
                      <span
                        class="price-suffix"
                        style={{
                          display:
                            bookings.price(item()) === 0 ? "none" : undefined,
                        }}
                      >
                        {" "}
                        onwards
                      </span>
                    </span>
                    <span
                      class={[
                        "availability",
                        bookings.canBook(item())
                          ? item().status === "filling-fast"
                            ? "filling-fast"
                            : "available"
                          : item().status === "sold-out"
                            ? "sold-out"
                            : "closed",
                      ]}
                      id="availability"
                    >
                      {availability()}
                    </span>
                  </div>
                  <div class="booking-action-wrapper">
                    <button
                      class={{
                        "book-now-btn": true,
                        disabled: !bookings.canBook(item()),
                      }}
                      id="bookNowBtn"
                      disabled={!bookings.canBook(item())}
                      onClick={book}
                    >
                      {availability() === "Available" ||
                      availability() === "Filling Fast"
                        ? "Book Now"
                        : availability()}
                    </button>
                  </div>
                </div>
              </div>
            </main>
            <BottomSheet
              id="termsModal"
              title="Terms & Conditions"
              closeId="closeTerms"
              open={modal() === "terms"}
              onClose={() => setModal(null)}
              footer={
                <button
                  type="button"
                  class="got-it-btn"
                  id="gotItBtn"
                  onClick={() => setModal(null)}
                >
                  Okay, Got It
                </button>
              }
            >
              <ol class="terms-list">
                <For each={terms}>{(term) => <li>{term}</li>}</For>
              </ol>
            </BottomSheet>
            <BottomSheet
              id="stageLayoutModal"
              title="Stage Layout"
              closeId="closeStageLayout"
              tall
              open={modal() === "stage"}
              onClose={() => setModal(null)}
            >
              <img
                id="stageLayoutImage"
                class="stage-layout-image"
                src={
                  item().details.stageLayoutImage
                    ? "/" + item().details.stageLayoutImage
                    : undefined
                }
                alt="Stage Layout"
                loading="lazy"
              />
            </BottomSheet>
          </>
        )}
      </Show>
    </>
  );
}
