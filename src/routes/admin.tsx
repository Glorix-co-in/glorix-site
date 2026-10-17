import { For, Show } from "solid-js";
import PageTitle from "../components/PageTitle";
import EventEditor from "../admin/EventEditor";
import ContentListItem from "../admin/ContentListItem";
import CollectionEditor from "../admin/CollectionEditor";
import AdminLogin from "../admin/AdminLogin";
import { eventFilters, useAdminWorkspace } from "../admin/useAdminWorkspace";
import { collections } from "../admin/collections";
import styles from "../admin/Admin.module.css";
import a11y from "../styles/accessibility.module.css";

export default function AdminPage() {
  const workspace = useAdminWorkspace();
  const admin = workspace.admin;
  const label = () =>
    workspace.section() === "events"
      ? "Events"
      : collections[workspace.section() as keyof typeof collections].label;
  const singular = () =>
    workspace.section() === "events"
      ? "event"
      : collections[workspace.section() as keyof typeof collections].singular;
  const busy = () => Boolean(admin.pending());
  const saving = () => admin.pending() === "save";
  const editorOpen = () =>
    workspace.section() === "events"
      ? Boolean(workspace.eventEditor.form.event)
      : Boolean(workspace.collectionEditor.form.draft);
  const editorDirty = () =>
    workspace.section() === "events"
      ? workspace.eventEditor.dirty()
      : workspace.collectionEditor.dirty();
  return (
    <div class={styles.root}>
      <PageTitle title="Content Manager" />
      <header class={styles.header}>
        <div class={styles.brand}>
          <img src="/assets/cropped_logo.avif" alt="GLORIX" />
          <span>CONTENT MANAGER</span>
        </div>
        <Show when={admin.authenticated()}>
          <div class={styles.headerMeta}>
            <Show when={editorDirty()}>
              <span class={styles.unsaved}>Unsaved changes</span>
            </Show>
            <Show when={admin.state.publishedAt}>
              <span class={styles.timestamp}>
                Last published{" "}
                {new Intl.DateTimeFormat("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Kolkata",
                }).format(admin.state.publishedAt!)}{" "}
                IST
              </span>
            </Show>
          </div>
        </Show>
        <div class={styles.actions}>
          <Show when={admin.authenticated()}>
            <Show when={editorOpen()}>
              <button
                class={styles.textButton}
                type="button"
                disabled={busy() || !editorDirty()}
                onClick={workspace.reset}
              >
                Discard
              </button>
              <button
                class={styles.primary}
                type="submit"
                form="content-form"
                value="draft"
                disabled={busy() || !editorDirty()}
              >
                {saving() ? "Saving…" : "Save changes"}
              </button>
            </Show>
            <Show when={admin.state.draftCount > 0}>
              <button
                class={[styles.textButton, styles.danger]}
                type="button"
                disabled={busy() || !admin.state.publishedVersion}
                title="Discard saved drafts across all sections and restore the published version"
                onClick={() => void workspace.discardDrafts()}
              >
                {admin.pending() === "discard"
                  ? "Discarding…"
                  : "Discard saved drafts"}
              </button>
            </Show>
            <button
              class={styles.secondary}
              type="button"
              title={
                editorDirty()
                  ? "Save your changes before publishing"
                  : "Publishes all saved changes across every content section"
              }
              disabled={busy() || editorDirty() || !admin.state.draftCount}
              onClick={() => void admin.publish()}
            >
              {admin.pending() === "publish"
                ? "Publishing…"
                : `Publish saved changes (${admin.state.draftCount})`}
            </button>
            <button
              class={styles.iconButton}
              type="button"
              aria-label="Sign out"
              title="Sign out"
              disabled={busy()}
              onClick={() => void workspace.logout()}
            >
              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                aria-hidden="true"
              >
                <path
                  d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4v-2h3V5h-3V3Z"
                  fill="currentColor"
                />
                <path
                  d="M10.5 7.5 14 11l-3.5 3.5V12H3v-2h7.5V7.5Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </Show>
        </div>
      </header>
      <main
        id="main-content"
        class={[styles.main, { [styles.authenticated]: admin.authenticated() }]}
      >
        <Show when={admin.error()}>
          <p class={styles.error} role="alert">
            {admin.error()}
          </p>
        </Show>
        <Show when={admin.notice()}>
          <p class={styles.notice} role="status">
            {admin.notice()}
          </p>
        </Show>
        <Show
          when={admin.authenticated() !== undefined}
          fallback={
            <p class={styles.empty} role="status">
              Loading your workspace…
            </p>
          }
        >
          <Show
            when={admin.authenticated()}
            fallback={<AdminLogin admin={admin} />}
          >
            <h1 class={a11y.srOnly}>Manage content</h1>
            <nav class={styles.tabs} aria-label="Content sections">
              <For each={workspace.tables}>
                {(table) => (
                  <button
                    type="button"
                    class={{
                      [styles.activeTab]: workspace.section() === table,
                    }}
                    aria-current={
                      workspace.section() === table ? "page" : undefined
                    }
                    disabled={busy()}
                    onClick={() => workspace.switchSection(table)}
                  >
                    {table === "events" ? "Events" : collections[table].label}
                    <span>{admin.state.content[table].length}</span>
                    <Show when={admin.state.draftCounts[table]}>
                      <span
                        class={styles.draftDot}
                        title="Unpublished changes"
                        aria-label="Unpublished changes"
                      />
                    </Show>
                  </button>
                )}
              </For>
            </nav>
            <div class={styles.workspace}>
              <aside class={styles.sidebar} aria-label={label()}>
                <div class={styles.collectionTools}>
                  <label class={styles.search}>
                    <input
                      type="search"
                      aria-label={`Search ${label().toLowerCase()}`}
                      placeholder={`Search ${label().toLowerCase()}…`}
                      value={workspace.search()}
                      onInput={(event) =>
                        workspace.setSearch(event.currentTarget.value)
                      }
                    />
                  </label>
                  <button
                    class={[styles.primary, styles.addButton]}
                    type="button"
                    aria-label={`Add ${singular()}`}
                    title={`Add ${singular()}`}
                    disabled={busy()}
                    onClick={workspace.add}
                  >
                    <span aria-hidden="true">+</span>
                  </button>
                </div>
                <Show when={workspace.section() === "events"}>
                  <div
                    class={styles.filters}
                    role="group"
                    aria-label="Filter events"
                  >
                    <For each={eventFilters}>
                      {(filter) => (
                        <button
                          type="button"
                          aria-pressed={
                            workspace.eventFilter() === filter
                              ? "true"
                              : "false"
                          }
                          onClick={() => workspace.setEventFilter(filter)}
                        >
                          {filter[0].toUpperCase() + filter.slice(1)}
                        </button>
                      )}
                    </For>
                  </div>
                </Show>
                <p class={styles.resultCount} role="status">
                  {workspace.filtered().length} of {workspace.rows().length}{" "}
                  {label().toLowerCase()}
                </p>
                <div class={styles.eventList}>
                  <For
                    each={workspace.filtered()}
                    fallback={
                      <p class={styles.empty}>
                        {workspace.rows().length
                          ? "No matches. Try another search or filter."
                          : `No items yet. Use + to add a ${singular()}.`}
                      </p>
                    }
                  >
                    {(row) => (
                      <ContentListItem
                        row={row}
                        selected={workspace.selectedId() === row._id}
                        busy={busy()}
                        compact={workspace.section() !== "events"}
                        roundImage={[
                          "artists",
                          "teams",
                          "testimonials",
                        ].includes(workspace.section())}
                        wrapTitle={[
                          "gallery",
                          "carousel",
                          "marquee",
                          "terms",
                        ].includes(workspace.section())}
                        itemLabel={singular()}
                        searching={Boolean(workspace.search().trim())}
                        onMove={
                          workspace.section() !== "events"
                            ? (item, direction) =>
                                void workspace.move(direction, item._id)
                            : undefined
                        }
                        canMoveUp={
                          !workspace.search().trim() &&
                          workspace
                            .rows()
                            .findIndex((item) => item._id === row._id) > 0
                        }
                        canMoveDown={
                          !workspace.search().trim() &&
                          workspace
                            .rows()
                            .findIndex((item) => item._id === row._id) <
                            workspace.rows().length - 1
                        }
                        onSelect={() => workspace.select(row)}
                        onDelete={(event) => void workspace.remove(event)}
                      />
                    )}
                  </For>
                </div>
              </aside>
              <Show
                when={workspace.section() === "events"}
                fallback={
                  <Show
                    when={workspace.collectionEditor.form.draft}
                    keyed
                    fallback={
                      <section class={styles.card}>
                        <p class={styles.empty}>
                          Select an item or add a new {singular()}.
                        </p>
                      </section>
                    }
                  >
                    {(draft) => (
                      <CollectionEditor
                        draft={draft}
                        editor={workspace.collectionEditor}
                        events={admin.state.content.events}
                        busy={busy()}
                        onSave={(publish) => void workspace.save(publish)}
                      />
                    )}
                  </Show>
                }
              >
                <Show
                  when={workspace.eventEditor.form.event}
                  keyed
                  fallback={
                    <section class={styles.card}>
                      <p class={styles.empty}>
                        Select an event or add a new one.
                      </p>
                    </section>
                  }
                >
                  {(event) => (
                    <EventEditor
                      event={event}
                      editor={workspace.eventEditor}
                      events={admin.state.content.events}
                      artists={admin.state.content.artists}
                      busy={busy()}
                      isNew={!workspace.eventEditor.form.original}
                      onSave={(publish) => void workspace.save(publish)}
                    />
                  )}
                </Show>
              </Show>
            </div>
          </Show>
        </Show>
      </main>
    </div>
  );
}
