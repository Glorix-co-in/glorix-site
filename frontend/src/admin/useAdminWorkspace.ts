import { createMemo, createSignal, onSettled } from "solid-js";
import { useBeforeLeave } from "@solidjs/router";
import type { Doc } from "../../convex/_generated/dataModel";
import {
  contentTables,
  type CollectionDocument,
  type ContentTable,
  type RecordSelection,
} from "../../shared/content";
import { createEventEditor } from "./useEventEditor";
import { createCollectionEditor } from "./useCollectionEditor";
import { useAdminContent } from "./useAdminContent";
import { recordTitle } from "./collections";
import { eventDate, isUpcoming } from "../bookings/rules";
import { useBoundaryClock } from "../lib/useBoundaryClock";

export const eventFilters = ["all", "upcoming", "past", "hidden"] as const;
export type EventFilter = (typeof eventFilters)[number];

const newestFirst = (events: readonly Doc<"events">[]) =>
  [...events].sort((a, b) => eventDate(b) - eventDate(a));

export function useAdminWorkspace() {
  const eventEditor = createEventEditor();
  const collectionEditor = createCollectionEditor();
  const [section, setSection] = createSignal<ContentTable>("events", {
    name: "admin-section",
  });
  const [search, setSearch] = createSignal("", {
    name: "admin-content-search",
  });
  const [eventFilter, setEventFilter] = createSignal<EventFilter>("all", {
    name: "admin-event-filter",
  });
  const admin = useAdminContent((content) => {
    const table = section();
    if (table === "events" && !eventEditor.form.event && content.events[0])
      eventEditor.open(newestFirst(content.events)[0]);
    else if (
      table !== "events" &&
      !collectionEditor.form.draft &&
      content[table][0]
    )
      collectionEditor.open(table, content[table][0]);
  });
  const rows = createMemo(
    () =>
      section() === "events" && eventFilter() === "all"
        ? newestFirst(admin.state.content.events)
        : admin.state.content[section()],
    { name: "admin-section-rows" },
  );
  const boundaries = createMemo(
    () =>
      admin.state.content.events
        .map((event) => Date.parse(event.details.bookingEndsAtISO ?? ""))
        .filter(Number.isFinite)
        .sort((a, b) => a - b),
    { name: "admin-event-boundaries" },
  );
  const now = useBoundaryClock(boundaries);
  const filtered = createMemo(
    () => {
      const query = search().trim().toLowerCase();
      return rows().filter((row) => {
        if (section() === "events" && "status" in row) {
          const hidden = row.status === "hidden" || row.hiddenFromBookings;
          if (eventFilter() === "hidden" && !hidden) return false;
          if (
            eventFilter() === "upcoming" &&
            (hidden || !isUpcoming(row, now()))
          )
            return false;
          if (eventFilter() === "past" && (hidden || isUpcoming(row, now())))
            return false;
        }
        return `${recordTitle(row)} ${"date" in row ? row.date : ""}`
          .toLowerCase()
          .includes(query);
      });
    },
    { name: "admin-filtered-content" },
  );
  const dirty = createMemo(
    () =>
      section() === "events" ? eventEditor.dirty() : collectionEditor.dirty(),
    { name: "admin-workspace-dirty" },
  );
  const selectedId = () =>
    section() === "events"
      ? eventEditor.form.original?._id
      : collectionEditor.form.draft?.original?._id;
  const canDiscard = () =>
    !dirty() || window.confirm("Discard your unsaved changes?");
  const clear = () => {
    eventEditor.clear();
    collectionEditor.clear();
  };
  function open(row: Doc<ContentTable>, table = section()) {
    if (table === "events") eventEditor.open(row as Doc<"events">);
    else collectionEditor.open(table, row as CollectionDocument);
  }
  const reopen = (id?: string) => {
    const row = rows().find((row) => row._id === id) ?? rows()[0];
    clear();
    if (row) open(row);
  };
  const select = (row: Doc<ContentTable>) => {
    if (row._id !== selectedId() && canDiscard()) open(row);
  };
  const switchSection = (table: ContentTable) => {
    if (table === section() || !canDiscard()) return;
    clear();
    setSection(table);
    setSearch("");
    setEventFilter("all");
    const first =
      table === "events"
        ? newestFirst(admin.state.content.events)[0]
        : admin.state.content[table][0];
    if (first) open(first, table);
  };
  const add = () => {
    if (!canDiscard()) return;
    clear();
    setSearch("");
    setEventFilter("all");
    const table = section();
    if (table === "events") eventEditor.openNew();
    else collectionEditor.open(table, null);
  };
  const reset = () => {
    if (section() === "events") {
      if (!eventEditor.form.original) return reopen();
      const tab = eventEditor.tab();
      eventEditor.reset();
      eventEditor.setTab(tab);
    } else if (collectionEditor.form.draft?.original) collectionEditor.reset();
    else reopen();
  };
  const reload = async () => {
    if (canDiscard()) {
      const id = selectedId();
      if (await admin.reload()) reopen(id);
    }
  };
  const discardDrafts = async () => {
    if (
      admin.pending() ||
      !admin.state.draftCount ||
      !admin.state.publishedVersion ||
      !window.confirm(
        `Discard all ${admin.state.draftCount} saved unpublished changes across every section? New unpublished items will be removed, and edited or deleted items will return to their published version.${dirty() ? " Your unsaved edits will also be cleared." : ""} The live site will stay unchanged.`,
      )
    )
      return;
    const id = selectedId();
    if (await admin.discardDrafts()) reopen(id);
  };
  const save = async (publish: boolean) => {
    if (section() === "events") {
      const tab = eventEditor.tab();
      const event = eventEditor.form.event;
      if (!event) return;
      const id = await admin.saveEvent(
        eventEditor.form.original,
        event,
        publish,
      );
      if (id) {
        reopen(id);
        eventEditor.setTab(tab);
      }
    } else {
      const draft = collectionEditor.form.draft;
      if (!draft) return;
      const id = await admin.saveRecord(draft, publish);
      if (id) reopen(id);
    }
  };
  const remove = async (row?: Doc<ContentTable>) => {
    const table = section();
    const original =
      row ??
      (table === "events"
        ? eventEditor.form.original
        : collectionEditor.form.draft?.original);
    if (
      !original ||
      !window.confirm(
        `Delete “${recordTitle(original)}”? The live site changes only after publishing.${original._id === selectedId() && dirty() ? " Unsaved edits to this item will be discarded." : ""}`,
      )
    )
      return;
    const deletingSelected = original._id === selectedId();
    if (await admin.remove({ table, original } as RecordSelection)) {
      if (deletingSelected) reopen();
    }
  };
  const move = async (direction: -1 | 1, id = selectedId()) => {
    const table = section();
    if (table === "events") return;
    const ids = rows().map((row) => String(row._id));
    const index = ids.findIndex((value) => value === id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= ids.length) return;
    [ids[index], ids[next]] = [ids[next], ids[index]];
    if (await admin.reorder(table, ids)) {
      const selected = rows().find((row) => row._id === selectedId());
      if (selected) collectionEditor.rebasePosition(selected.position);
    }
  };
  const logout = async () => {
    if (canDiscard() && (await admin.logout())) clear();
  };
  useBeforeLeave((event) => {
    if (!canDiscard()) event.preventDefault();
  });
  onSettled(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty()) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  });
  return {
    admin,
    eventEditor,
    collectionEditor,
    section,
    search,
    setSearch,
    eventFilter,
    setEventFilter,
    rows,
    filtered,
    dirty,
    selectedId,
    select,
    switchSection,
    add,
    reset,
    reload,
    discardDrafts,
    save,
    remove,
    move,
    logout,
    tables: contentTables,
  };
}
