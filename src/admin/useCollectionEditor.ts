import { createMemo, createStore } from "solid-js";
import type { Doc } from "../../convex/_generated/dataModel";
import {
  recordData,
  type Collection,
  type CollectionChange,
  type ContentData,
} from "../../shared/content";
import { canonical } from "../../shared/events";
import { collections } from "./collections";

export function createCollectionEditor() {
  const [form, setForm] = createStore<{ draft?: CollectionChange }>(
    {},
    { name: "admin-collection-form" },
  );
  const dirty = createMemo(
    () =>
      Boolean(
        form.draft &&
        (!form.draft.original ||
          canonical(form.draft.data) !==
            canonical(recordData(form.draft.original))),
      ),
    { name: "admin-collection-dirty" },
  );
  function open<K extends Collection>(table: K, original: Doc<K> | null) {
    const next = {
      table,
      original: original ? JSON.parse(JSON.stringify(original)) : null,
      data: original ? recordData(original) : collections[table].blank(),
    } as CollectionChange;
    setForm((draft) => {
      draft.draft = next;
    });
  }
  const field = (key: string, value: string | number | boolean | undefined) =>
    setForm((draft) => {
      const item = draft.draft;
      if (
        !item ||
        !collections[item.table].fields.some((field) => field.key === key)
      )
        return;
      (item.data as Record<string, unknown>)[key] = value;
    });
  const campaign = (edit: (campaign: ContentData<"campaigns">) => void) =>
    setForm((draft) => {
      if (draft.draft?.table === "campaigns") edit(draft.draft.data);
    });
  const clear = () =>
    setForm((draft) => {
      draft.draft = undefined;
    });
  const reset = () => {
    const draft = form.draft;
    if (draft) open(draft.table, draft.original);
  };
  const rebasePosition = (position: number) =>
    setForm((draft) => {
      if (draft.draft?.original) draft.draft.original.position = position;
    });
  return { form, dirty, open, field, campaign, clear, reset, rebasePosition };
}
export type CollectionEditorState = ReturnType<typeof createCollectionEditor>;
