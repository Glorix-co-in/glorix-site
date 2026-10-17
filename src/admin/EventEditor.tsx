import { createMemo, For, Show, onSettled, type ParentProps } from "solid-js";
import type {
  BookingEvent,
  BookingFlow,
  BookingStatus,
  BookingOption,
} from "../bookings/types";
import type { Doc } from "../../convex/_generated/dataModel";
import {
  editorTabs,
  type EditorTab,
  type EventEditorState,
} from "./useEventEditor";
import {
  CalendarField,
  DateTimeField,
  CheckField,
  ToggleField,
  Section,
  TextField,
} from "./EventFields";
import styles from "./Admin.module.css";
import { fallbackArtists } from "../../shared/content";
import TagInput from "./TagInput";

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
  artists: Doc<"artists">[];
  busy: boolean;
  onSave: (publish: boolean) => void;
  isNew?: boolean;
}) {
  let form!: HTMLFormElement;
  const Panel = (panel: ParentProps<{ id: EditorTab }>) => (
    <div
      id={`event-panel-${panel.id}`}
      role="tabpanel"
      aria-labelledby={`event-tab-${panel.id}`}
      data-editor-tab={panel.id}
      hidden={props.editor.tab() !== panel.id}
    >
      {panel.children}
    </div>
  );
  // Required fields in another tab still participate in native form validation.
  onSettled(() => {
    const revealInvalid = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (
        input !==
        form.querySelector("input:invalid, select:invalid, textarea:invalid")
      )
        return;
      const panel = input.closest<HTMLElement>("[data-editor-tab]");
      if (panel) props.editor.setTab(panel.dataset.editorTab as EditorTab);
      for (
        let detail = input.closest("details");
        detail;
        detail = detail.parentElement?.closest("details") ?? null
      )
        detail.open = true;
      requestAnimationFrame(() => input.focus());
    };
    form.addEventListener("invalid", revealInvalid, true);
    return () => form.removeEventListener("invalid", revealInvalid, true);
  });
  const times = () => {
    const value = props.event.details.time;
    return Array.isArray(value) ? value : [value ?? ""];
  };
  const artistOptions = createMemo(
    () =>
      props.artists.map((artist) => ({
        value: artist.name,
        image: artist.image,
      })),
    { name: "admin-artist-options" },
  );
  const tagOptions = createMemo(
    () =>
      props.events.flatMap((event) =>
        (event.details.tags ?? []).map((value) => ({ value })),
      ),
    { name: "admin-tag-options" },
  );
  return (
    <form
      ref={(element) => {
        form = element;
      }}
      id="content-form"
      class={styles.editor}
      onSubmit={(event) => {
        event.preventDefault();
        props.onSave(false);
      }}
    >
      <div
        class={styles.editorTabs}
        role="tablist"
        aria-label="Event settings"
        onKeyDown={(event) => {
          const index = editorTabs.findIndex(
            (tab) => tab.id === props.editor.tab(),
          );
          const next =
            event.key === "ArrowRight"
              ? (index + 1) % editorTabs.length
              : event.key === "ArrowLeft"
                ? (index + editorTabs.length - 1) % editorTabs.length
                : event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? editorTabs.length - 1
                    : -1;
          if (next < 0) return;
          event.preventDefault();
          props.editor.setTab(editorTabs[next].id);
          event.currentTarget
            .querySelectorAll<HTMLButtonElement>("[role=tab]")
            [next].focus();
        }}
      >
        <For each={editorTabs}>
          {(tab) => (
            <button
              type="button"
              role="tab"
              id={`event-tab-${tab.id}`}
              aria-controls={`event-panel-${tab.id}`}
              aria-selected={props.editor.tab() === tab.id ? "true" : "false"}
              tabindex={props.editor.tab() === tab.id ? 0 : -1}
              onClick={() => props.editor.setTab(tab.id)}
            >
              {tab.label}
            </button>
          )}
        </For>
      </div>
      <fieldset class={styles.formFields} disabled={props.busy}>
        <Panel id="overview">
          <Section fieldsClass={styles.overviewFields}>
            <div class={styles.eventCopy}>
              <TextField
                label="Event title"
                value={props.event.title}
                required
                onChange={(value) => props.editor.change("title", value)}
              />
              <TextField
                label="About the event"
                multiline
                rows={8}
                value={props.event.details.aboutEvent}
                onChange={(value) =>
                  props.editor.detail("aboutEvent", optional(value))
                }
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
              <div class={styles.overviewLinks}>
                <TextField
                  label="Venue"
                  value={props.event.details.venue}
                  onChange={(value) =>
                    props.editor.detail("venue", optional(value))
                  }
                />
                <TextField
                  label="Venue map link"
                  type="url"
                  value={props.event.details.venueLink}
                  onChange={(value) =>
                    props.editor.detail("venueLink", optional(value))
                  }
                />
              </div>
            </div>
            <div class={styles.eventSettings}>
              <CalendarField
                label="Display date"
                value={props.event.date}
                required
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
                hint="Active offers can override this price."
                onChange={(value) =>
                  props.editor.detail(
                    "priceFrom",
                    value === "" ? undefined : Number(value),
                  )
                }
              />
              <TextField
                label="Event URL"
                required
                readOnly={!props.isNew}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                value={props.event.id}
                placeholder="my-event-2026"
                hint={
                  props.isNew
                    ? "Lowercase letters, numbers, and hyphens. Fixed after saving."
                    : "Fixed after saving."
                }
                onChange={(value) => props.editor.change("id", value)}
              />
              <div class={styles.eventVisibility}>
                <ToggleField
                  label="Featured event"
                  checked={props.event.isFeatured}
                  onChange={(value) => props.editor.change("isFeatured", value)}
                />
                <ToggleField
                  label="Hide from booking listings"
                  checked={props.event.hiddenFromBookings}
                  onChange={(value) =>
                    props.editor.change("hiddenFromBookings", value)
                  }
                />
              </div>
            </div>
          </Section>
          <Section>
            <TagInput
              label="Artists"
              wide
              value={props.event.details.artists ?? []}
              options={artistOptions()}
              disabled={props.busy}
              placeholder="Search artists…"
              onChange={(value) =>
                props.editor.detail("artists", value.length ? value : undefined)
              }
            />
            <TagInput
              label="Default artists"
              value={props.event.details.defaultArtists ?? fallbackArtists}
              options={artistOptions()}
              disabled={props.busy}
              placeholder="Search artists…"
              onChange={(value) => props.editor.detail("defaultArtists", value)}
            />
            <TagInput
              label="Tags"
              value={props.event.details.tags ?? []}
              options={tagOptions()}
              allowCreate
              disabled={props.busy}
              placeholder="Type a tag and press Enter…"
              onChange={(value) =>
                props.editor.detail("tags", value.length ? value : undefined)
              }
            />
            <div class={styles.wide}>
              <CheckField
                label="Hide artist section"
                checked={props.event.details.hideArtists}
                onChange={(value) => props.editor.detail("hideArtists", value)}
              />
            </div>
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
        </Panel>
        <Panel id="schedule">
          <Section fieldsClass={styles.scheduleFields}>
            <DateTimeField
              label="Event starts at"
              value={props.event.details.eventStartsAtISO}
              onChange={(value) =>
                props.editor.detail("eventStartsAtISO", optional(value))
              }
            />
            <div class={styles.timeFields}>
              <For each={times()} keyed={false}>
                {(time, index) => (
                  <div class={styles.timeRow}>
                    <CalendarField
                      label={
                        times().length > 1
                          ? `Display time ${index + 1}`
                          : "Display time"
                      }
                      type="time"
                      value={time()}
                      onChange={(value) => {
                        const next = [...times()];
                        next[index] = value;
                        props.editor.detail(
                          "time",
                          Array.isArray(props.event.details.time)
                            ? next
                            : optional(value),
                        );
                      }}
                    />
                    <Show when={times().length > 1}>
                      <button
                        type="button"
                        class={styles.textButton}
                        aria-label={`Remove display time ${index + 1}`}
                        onClick={() =>
                          props.editor.detail(
                            "time",
                            times().filter((_, i) => i !== index),
                          )
                        }
                      >
                        <span aria-hidden="true">×</span>
                      </button>
                    </Show>
                  </div>
                )}
              </For>
              <button
                type="button"
                class={styles.timeAdd}
                aria-label="Add display time"
                title="Add display time"
                onClick={() => props.editor.detail("time", [...times(), ""])}
              >
                <span aria-hidden="true">+</span>
              </button>
            </div>
            <div class={[styles.wide, styles.scheduleFacts]}>
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
                onChange={(value) =>
                  props.editor.detail("genre", optional(value))
                }
              />
            </div>
          </Section>
          <Section fieldsClass={styles.bookingFields}>
            <div class={styles.bookingRouting}>
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
            </div>
            <div class={styles.bookingDates}>
              <DateTimeField
                label="Bookings open at"
                value={props.event.details.bookingOpensAtISO}
                onChange={(value) =>
                  props.editor.detail("bookingOpensAtISO", optional(value))
                }
              />
              <DateTimeField
                label="Bookings close at"
                value={props.event.details.bookingEndsAtISO}
                onChange={(value) =>
                  props.editor.detail("bookingEndsAtISO", optional(value))
                }
              />
            </div>
          </Section>
          <Show
            when={props.event.bookingOptions?.length}
            fallback={
              <button
                class={[styles.secondary, styles.addSession]}
                type="button"
                onClick={() => props.editor.addSession()}
              >
                + Add session
              </button>
            }
          >
            <Section>
              <div class={styles.wide}>
                <For each={props.event.bookingOptions ?? []}>
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
                        <CalendarField
                          label="Date"
                          required
                          value={option.date}
                          onChange={(value) =>
                            props.editor.session(index(), "date", value)
                          }
                        />
                        <CalendarField
                          label="Time"
                          type="time"
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
                                <option value={status.value}>
                                  {status.label}
                                </option>
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
                            props.editor.session(
                              index(),
                              "link",
                              optional(value),
                            )
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
          </Show>
        </Panel>
        <Panel id="media">
          <Section description="Use paths to assets already available on the site.">
            <TextField
              label="Poster asset path"
              value={props.event.image}
              required
              wide
              placeholder="assets/events/poster.avif"
              onChange={(value) => props.editor.change("image", value)}
            />
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
          <Section>
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
        </Panel>
      </fieldset>
    </form>
  );
}
