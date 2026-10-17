import { For, Show } from "solid-js";
import type {
  BookingEvent,
  BookingFlow,
  BookingStatus,
  BookingOption,
} from "../bookings/types";
import type { Doc } from "../../convex/_generated/dataModel";
import type { EventEditorState } from "./useEventEditor";
import { CheckField, Section, TextField } from "./EventFields";
import styles from "./Admin.module.css";
import EditorActions from "./EditorActions";
import { fallbackArtists } from "../../shared/content";

export const statuses: { value: BookingStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "available", label: "Available" },
  { value: "filling-fast", label: "Filling fast" },
  { value: "sold-out", label: "Sold out" },
  { value: "soon", label: "Coming soon" },
  { value: "closed", label: "Closed" },
  { value: "hidden", label: "Hidden" },
];
const lines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
const optional = (value: string) => value || undefined;

export default function EventEditor(props: {
  event: BookingEvent;
  editor: EventEditorState;
  events: Doc<"events">[];
  busy: boolean;
  saving: boolean;
  onSave: (publish: boolean) => void;
  isNew?: boolean;
  onDelete?: () => void;
}) {
  return (
    <form
      class={styles.editor}
      onSubmit={(event) => {
        event.preventDefault();
        props.onSave(
          event.submitter instanceof HTMLButtonElement &&
            event.submitter.value === "publish",
        );
      }}
    >
      <div class={styles.editorHeading}>
        <div>
          <p class={styles.eyebrow}>EVENT DETAILS</p>
          <h2>{props.event.title || "New event"}</h2>
          <code>/{props.event.id}</code>
        </div>
        <Show when={!props.isNew}>
          <div class={styles.actions}>
            <a
              class={styles.textLink}
              href={`/events/${encodeURIComponent(props.event.id)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View live page <span aria-hidden="true">↗</span>
            </a>
            <button
              class={styles.danger}
              type="button"
              disabled={props.busy}
              onClick={() => props.onDelete?.()}
            >
              Delete event
            </button>
          </div>
        </Show>
      </div>
      <fieldset class={styles.formFields} disabled={props.busy}>
        <Section title="The essentials">
          <Show when={props.isNew}>
            <TextField
              label="Event URL"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              value={props.event.id}
              placeholder="my-event-2026"
              hint="Use lowercase letters, numbers, and hyphens. The URL stays fixed after saving."
              onChange={(value) => props.editor.change("id", value)}
            />
          </Show>
          <TextField
            label="Event title"
            value={props.event.title}
            required
            onChange={(value) => props.editor.change("title", value)}
          />
          <TextField
            label="Display date"
            value={props.event.date}
            required
            placeholder="17 October 2026"
            onChange={(value) => props.editor.change("date", value)}
          />
          <label class={styles.field}>
            <span>Booking status</span>
            <select
              value={props.event.status}
              onChange={(event) =>
                props.editor.change(
                  "status",
                  event.currentTarget.value as BookingStatus,
                )
              }
            >
              <For each={statuses}>
                {(status) => (
                  <option value={status.value}>{status.label}</option>
                )}
              </For>
            </select>
          </label>
          <TextField
            label="Starting price (₹)"
            type="number"
            min={0}
            step="any"
            value={props.event.details.priceFrom}
            hint="An active offer may override this price on the live site."
            onChange={(value) =>
              props.editor.detail(
                "priceFrom",
                value === "" ? undefined : Number(value),
              )
            }
          />
          <TextField
            label="Poster asset path"
            value={props.event.image}
            required
            placeholder="assets/events/poster.avif"
            onChange={(value) => props.editor.change("image", value)}
          />
          <TextField
            label="Booking link"
            type="url"
            value={props.event.bookingLink}
            placeholder="https://…"
            onChange={(value) =>
              props.editor.change("bookingLink", value || null)
            }
          />
          <TextField
            label="About the event"
            multiline
            value={props.event.details.aboutEvent}
            onChange={(value) =>
              props.editor.detail("aboutEvent", optional(value))
            }
          />
          <TextField
            label="Short description"
            multiline
            value={props.event.details.description}
            onChange={(value) =>
              props.editor.detail("description", optional(value))
            }
          />
        </Section>
        <Section title="Schedule & venue">
          <TextField
            label="Detail page date"
            value={props.event.details.date}
            onChange={(value) => props.editor.detail("date", optional(value))}
          />
          <TextField
            label="Date range"
            value={props.event.details.dateRange}
            placeholder="17–18 October 2026"
            onChange={(value) =>
              props.editor.detail("dateRange", value || null)
            }
          />
          <TextField
            label="Display time"
            multiline
            value={
              Array.isArray(props.event.details.time)
                ? props.event.details.time.join("\n")
                : props.event.details.time
            }
            hint="Use one line per time when there are multiple sessions."
            onChange={(value) =>
              props.editor.detail(
                "time",
                Array.isArray(props.event.details.time) || value.includes("\n")
                  ? lines(value)
                  : optional(value),
              )
            }
          />
          <TextField
            label="Venue"
            value={props.event.details.venue}
            onChange={(value) => props.editor.detail("venue", optional(value))}
          />
          <TextField
            label="Venue map link"
            type="url"
            value={props.event.details.venueLink}
            onChange={(value) =>
              props.editor.detail("venueLink", optional(value))
            }
          />
          <TextField
            label="Duration"
            value={props.event.details.duration}
            onChange={(value) =>
              props.editor.detail("duration", optional(value))
            }
          />
          <TextField
            label="Age limit"
            value={props.event.details.ageLimit}
            onChange={(value) =>
              props.editor.detail("ageLimit", optional(value))
            }
          />
          <TextField
            label="Languages"
            value={props.event.details.languages}
            onChange={(value) =>
              props.editor.detail("languages", optional(value))
            }
          />
          <TextField
            label="Genre"
            value={props.event.details.genre}
            onChange={(value) => props.editor.detail("genre", optional(value))}
          />
        </Section>
        <Section
          title="Booking schedule"
          description="Timestamps include the timezone. Example: 2026-10-17T18:00:00+05:30"
        >
          <TextField
            label="Bookings open at"
            value={props.event.details.bookingOpensAtISO}
            onChange={(value) =>
              props.editor.detail("bookingOpensAtISO", optional(value))
            }
          />
          <TextField
            label="Bookings close at"
            value={props.event.details.bookingEndsAtISO}
            onChange={(value) =>
              props.editor.detail("bookingEndsAtISO", optional(value))
            }
          />
          <TextField
            label="Event starts at"
            value={props.event.details.eventStartsAtISO}
            onChange={(value) =>
              props.editor.detail("eventStartsAtISO", optional(value))
            }
          />
          <TextField
            label="Booking opening label"
            value={props.event.details.bookingOpensAt}
            placeholder="17 October, 6 PM"
            onChange={(value) =>
              props.editor.detail("bookingOpensAt", optional(value))
            }
          />
          <label class={styles.field}>
            <span>Booking flow</span>
            <select
              value={props.event.bookingFlow ?? ""}
              onChange={(event) =>
                props.editor.change(
                  "bookingFlow",
                  optional(event.currentTarget.value) as
                    BookingFlow | undefined,
                )
              }
            >
              <option value="">Default</option>
              <option value="direct">Direct booking</option>
              <option value="date-first">Choose a date first</option>
            </select>
          </label>
          <TextField
            label="Listing order"
            type="number"
            min={0}
            step="1"
            value={props.event.bookingOrder}
            onChange={(value) =>
              props.editor.change(
                "bookingOrder",
                value === "" ? undefined : Number(value),
              )
            }
          />
          <CheckField
            label="Featured event"
            checked={props.event.isFeatured}
            onChange={(value) => props.editor.change("isFeatured", value)}
          />
          <CheckField
            label="Hide from booking listings"
            checked={props.event.hiddenFromBookings}
            onChange={(value) =>
              props.editor.change("hiddenFromBookings", value)
            }
          />
        </Section>
        <Section
          title="Sessions"
          description="Control the status, booking link, and linked event for each date and time."
        >
          <div class={styles.wide}>
            <For
              each={props.event.bookingOptions ?? []}
              fallback={
                <p class={styles.hint}>This event has no separate sessions.</p>
              }
            >
              {(option, index) => (
                <div class={styles.repeatCard}>
                  <div class={styles.repeatHeading}>
                    <h4>Session {index() + 1}</h4>
                    <button
                      class={styles.danger}
                      type="button"
                      onClick={() => props.editor.removeSession(index())}
                    >
                      Remove
                    </button>
                  </div>
                  <div class={styles.fields}>
                    <TextField
                      label="Date"
                      required
                      value={option.date}
                      onChange={(value) =>
                        props.editor.session(index(), "date", value)
                      }
                    />
                    <TextField
                      label="Time"
                      required
                      value={option.time}
                      onChange={(value) =>
                        props.editor.session(index(), "time", value)
                      }
                    />
                    <label class={styles.field}>
                      <span>Status</span>
                      <select
                        value={option.status}
                        onChange={(event) =>
                          props.editor.session(
                            index(),
                            "status",
                            event.currentTarget
                              .value as BookingOption["status"],
                          )
                        }
                      >
                        <For
                          each={statuses.filter(
                            (status) => status.value !== "hidden",
                          )}
                        >
                          {(status) => (
                            <option value={status.value}>{status.label}</option>
                          )}
                        </For>
                      </select>
                    </label>
                    <label class={styles.field}>
                      <span>Linked event</span>
                      <select
                        value={option.detailsEventId ?? ""}
                        onChange={(event) =>
                          props.editor.session(
                            index(),
                            "detailsEventId",
                            optional(event.currentTarget.value),
                          )
                        }
                      >
                        <option value="">No linked event</option>
                        <For
                          each={props.events.filter(
                            (event) => event.id !== props.event.id,
                          )}
                        >
                          {(event) => (
                            <option value={event.id}>
                              {event.title} · {event.date}
                            </option>
                          )}
                        </For>
                      </select>
                    </label>
                    <TextField
                      label="Booking link"
                      type="url"
                      value={option.link}
                      onChange={(value) =>
                        props.editor.session(index(), "link", optional(value))
                      }
                    />
                  </div>
                </div>
              )}
            </For>
            <button
              class={styles.secondary}
              type="button"
              onClick={() => props.editor.addSession()}
            >
              + Add session
            </button>
          </div>
        </Section>
        <details class={styles.advanced}>
          <summary>Artists, images & announcement</summary>
          <Section
            title="Artists & highlights"
            description="Enter one item per line. Artist names should match the existing artist catalogue."
          >
            <TextField
              label="Artists"
              multiline
              value={props.event.details.artists?.join("\n")}
              onChange={(value) =>
                props.editor.detail("artists", value ? lines(value) : undefined)
              }
            />
            <TextField
              label="Default artists"
              multiline
              value={(
                props.event.details.defaultArtists ?? fallbackArtists
              ).join("\n")}
              onChange={(value) =>
                props.editor.detail("defaultArtists", lines(value))
              }
            />
            <CheckField
              label="Hide artist section"
              checked={props.event.details.hideArtists}
              onChange={(value) => props.editor.detail("hideArtists", value)}
            />
            <TextField
              label="Tags"
              multiline
              value={props.event.details.tags?.join("\n")}
              onChange={(value) =>
                props.editor.detail("tags", value ? lines(value) : undefined)
              }
            />
            <TextField
              label="Highlights"
              multiline
              value={props.event.details.highlights?.join("\n")}
              onChange={(value) =>
                props.editor.detail(
                  "highlights",
                  value ? lines(value) : undefined,
                )
              }
            />
          </Section>
          <Section
            title="Event images"
            description="Use paths to assets already available on the site."
          >
            <TextField
              label="Landscape image"
              value={props.event.details.detailsImage?.landscape}
              onChange={(value) => props.editor.image("landscape", value)}
            />
            <TextField
              label="Portrait image"
              value={props.event.details.detailsImage?.portrait}
              onChange={(value) => props.editor.image("portrait", value)}
            />
            <TextField
              label="Desktop image"
              value={props.event.details.detailsImage?.desktop}
              onChange={(value) => props.editor.image("desktop", value)}
            />
            <TextField
              label="Mobile image"
              value={props.event.details.detailsImage?.mobile}
              onChange={(value) => props.editor.image("mobile", value)}
            />
            <TextField
              label="Stage layout image"
              value={props.event.details.stageLayoutImage}
              onChange={(value) =>
                props.editor.detail("stageLayoutImage", optional(value))
              }
            />
            <div class={styles.wide}>
              <For each={props.event.details.carouselSlides ?? []}>
                {(slide, index) => (
                  <div class={styles.repeatCard}>
                    <div class={styles.repeatHeading}>
                      <h4>Carousel image {index() + 1}</h4>
                      <button
                        class={styles.danger}
                        type="button"
                        onClick={() => props.editor.removeSlide(index())}
                      >
                        Remove
                      </button>
                    </div>
                    <div class={styles.fields}>
                      <TextField
                        label="Desktop asset"
                        required
                        value={slide.desktopImage}
                        onChange={(value) =>
                          props.editor.slide(index(), "desktopImage", value)
                        }
                      />
                      <TextField
                        label="Mobile asset"
                        value={slide.mobileImage}
                        onChange={(value) =>
                          props.editor.slide(index(), "mobileImage", value)
                        }
                      />
                    </div>
                  </div>
                )}
              </For>
              <button
                class={styles.secondary}
                type="button"
                onClick={() => props.editor.addSlide()}
              >
                + Add carousel image
              </button>
            </div>
          </Section>
          <Section title="Home announcement">
            <CheckField
              label="Enable announcement for this event"
              checked={Boolean(props.event.announcement)}
              onChange={(value) =>
                props.editor.change("announcement", value ? {} : undefined)
              }
            />
            <Show when={props.event.announcement}>
              <TextField
                label="Announcement description"
                multiline
                value={props.event.announcement?.description}
                onChange={(value) =>
                  props.editor.announcement("description", value)
                }
              />
              <TextField
                label="Countdown label"
                value={props.event.announcement?.countdownLabel}
                onChange={(value) =>
                  props.editor.announcement("countdownLabel", value)
                }
              />
              <TextField
                label="Countdown description"
                value={props.event.announcement?.countdownDescription}
                onChange={(value) =>
                  props.editor.announcement("countdownDescription", value)
                }
              />
            </Show>
          </Section>
        </details>
      </fieldset>
      <EditorActions
        dirty={props.editor.dirty()}
        busy={props.busy}
        saving={props.saving}
        onReset={() => props.editor.reset()}
      />
    </form>
  );
}
