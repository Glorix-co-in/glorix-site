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

export function useAdminWorkspace() {
  const eventEditor = createEventEditor();
  const collectionEditor = createCollectionEditor();
  const [section, setSection] = createSignal<ContentTable>("events", {
    name: "admin-section",
  });
  const [search, setSearch] = createSignal("", {
    name: "admin-content-search",
  });
  const admin = useAdminContent((content) => {
    const table = section();
    if (table === "events" && !eventEditor.form.event && content.events[0])
      eventEditor.open(content.events[0]);
    else if (
      table !== "events" &&
      !collectionEditor.form.draft &&
      content[table][0]
    )
      collectionEditor.open(table, content[table][0]);
  });
  const rows = createMemo(() => admin.state.content[section()], {
    name: "admin-section-rows",
  });
  const filtered = createMemo(
    () => {
      const query = search().trim().toLowerCase();
      return rows().filter((row) =>
        `${recordTitle(row)} ${"date" in row ? row.date : ""}`
          .toLowerCase()
          .includes(query),
      );
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
    const first = admin.state.content[table][0];
    if (first) open(first, table);
  };
  const add = () => {
    if (!canDiscard()) return;
    clear();
    const table = section();
    if (table === "events") eventEditor.openNew();
    else collectionEditor.open(table, null);
  };
  const reload = async () => {
    if (canDiscard()) {
      const id = selectedId();
      if (await admin.reload()) reopen(id);
    }
  };
  const save = async (publish: boolean) => {
    if (section() === "events") {
      const event = eventEditor.form.event;
      if (!event) return;
      const id = await admin.saveEvent(
        eventEditor.form.original,
        event,
        publish,
      );
      if (id) reopen(id);
    } else {
      const draft = collectionEditor.form.draft;
      if (!draft) return;
      const id = await admin.saveRecord(draft, publish);
      if (id) reopen(id);
    }
  };
  const remove = async () => {
    const table = section();
    const original =
      table === "events"
        ? eventEditor.form.original
        : collectionEditor.form.draft?.original;
    if (
      !original ||
      !window.confirm(
        "Delete this saved item? Unsaved edits will be discarded. The live site changes only after publishing.",
      )
    )
      return;
    if (await admin.remove({ table, original } as RecordSelection)) reopen();
  };
  const move = async (direction: -1 | 1) => {
    const table = section();
    if (table === "events" || !canDiscard()) return;
    const id = selectedId();
    const ids = rows().map((row) => String(row._id));
    const index = ids.findIndex((value) => value === id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= ids.length) return;
    [ids[index], ids[next]] = [ids[next], ids[index]];
    if (await admin.reorder(table, ids)) reopen(id);
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
    rows,
    filtered,
    dirty,
    selectedId,
    select,
    switchSection,
    add,
    reload,
    save,
    remove,
    move,
    logout,
    tables: contentTables,
  };
}
