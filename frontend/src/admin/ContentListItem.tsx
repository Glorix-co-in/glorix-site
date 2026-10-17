import { createSignal, createUniqueId, Show } from "solid-js";
import type { Doc } from "../../convex/_generated/dataModel";
import type { ContentTable } from "../../shared/content";
import { recordImage, recordTitle } from "./collections";
import { statuses } from "./EventEditor";
import styles from "./Admin.module.css";
import { safeExternalUrl } from "../bookings/rules";

export default function ContentListItem(props: {
  row: Doc<ContentTable>;
  selected: boolean;
  busy: boolean;
  onSelect: () => void;
  onDelete: (row: Doc<ContentTable>) => void;
  compact?: boolean;
  roundImage?: boolean;
  wrapTitle?: boolean;
  itemLabel?: string;
  onMove?: (row: Doc<ContentTable>, direction: -1 | 1) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  searching?: boolean;
}) {
  const menuId = createUniqueId();
  const [expanded, setExpanded] = createSignal(false, {
    name: "admin-row-actions",
  });
  let menu!: HTMLDivElement;
  const profile = () =>
    "link" in props.row ? safeExternalUrl(props.row.link) : undefined;
  return (
    <div
      class={[
        styles.eventItem,
        {
          [styles.selected]: props.selected,
          [styles.compactItem]: props.compact,
          [styles.roundImage]: props.roundImage,
          [styles.wrapTitle]: props.wrapTitle,
        },
      ]}
    >
      <button
        class={styles.recordButton}
        type="button"
        disabled={props.busy}
        aria-pressed={props.selected ? "true" : "false"}
        onClick={() => props.onSelect()}
      >
        <Show when={recordImage(props.row)}>
          {(image) => <img src={`/${image()}`} alt="" loading="lazy" />}
        </Show>
        <div class={styles.recordInfo}>
          <strong class={styles.recordTitle}>{recordTitle(props.row)}</strong>
          <Show when={"date" in props.row && props.row.date}>
            <span class={styles.eventDate}>
              {"date" in props.row ? props.row.date : ""}
            </span>
          </Show>
          <Show when={"status" in props.row}>
            <span
              class={styles.badge}
              data-status={"status" in props.row ? props.row.status : ""}
            >
              {
                statuses.find(
                  (item) =>
                    item.value ===
                    ("status" in props.row ? props.row.status : ""),
                )?.label
              }
            </span>
          </Show>
          <Show when={"enabled" in props.row}>
            <span class={styles.badge}>
              {"enabled" in props.row && props.row.enabled
                ? "Enabled"
                : "Disabled"}
            </span>
          </Show>
          <Show
            when={props.compact && "hidden" in props.row && props.row.hidden}
          >
            <span class={styles.badge}>Hidden</span>
          </Show>
        </div>
      </button>
      <Show when={"status" in props.row || props.onMove}>
        <button
          type="button"
          class={styles.rowActions}
          disabled={props.busy}
          aria-label={`Actions for ${recordTitle(props.row)}`}
          aria-expanded={expanded() ? "true" : "false"}
          popovertarget={menuId}
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            menu.style.left = `${Math.max(8, Math.min(rect.right - 180, window.innerWidth - 188))}px`;
            menu.style.top = `${Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - (props.onMove ? 190 : 110)))}px`;
          }}
        >
          <span aria-hidden="true">⋯</span>
        </button>
        <div
          ref={(element) => {
            menu = element;
          }}
          id={menuId}
          popover="auto"
          class={styles.rowMenu}
          aria-label={`${props.itemLabel ?? "Event"} actions`}
          onToggle={(event) => setExpanded(event.newState === "open")}
        >
          <Show when={"status" in props.row}>
            <a
              href={
                "id" in props.row
                  ? `/events/${encodeURIComponent(props.row.id)}`
                  : undefined
              }
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => menu.hidePopover()}
            >
              View live page <span aria-hidden="true">↗</span>
            </a>
          </Show>
          <Show when={props.onMove}>
            <Show when={profile()}>
              {(url) => (
                <a
                  href={url()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => menu.hidePopover()}
                >
                  View profile <span aria-hidden="true">↗</span>
                </a>
              )}
            </Show>
            <button
              type="button"
              disabled={props.busy || !props.canMoveUp}
              title={props.searching ? "Clear search to reorder" : undefined}
              onClick={() => {
                menu.hidePopover();
                props.onMove?.(props.row, -1);
              }}
            >
              ↑ Move up
            </button>
            <button
              type="button"
              disabled={props.busy || !props.canMoveDown}
              title={props.searching ? "Clear search to reorder" : undefined}
              onClick={() => {
                menu.hidePopover();
                props.onMove?.(props.row, 1);
              }}
            >
              ↓ Move down
            </button>
          </Show>
          <button
            type="button"
            class={styles.danger}
            disabled={props.busy}
            onClick={() => {
              menu.hidePopover();
              props.onDelete(props.row);
            }}
          >
            Delete {props.itemLabel ?? "event"}
          </button>
        </div>
      </Show>
    </div>
  );
}
