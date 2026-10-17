import { For, Show } from "solid-js";
import PageTitle from "../components/PageTitle";
import EventEditor, { statuses } from "../admin/EventEditor";
import CollectionEditor from "../admin/CollectionEditor";
import AdminLogin from "../admin/AdminLogin";
import { useAdminWorkspace } from "../admin/useAdminWorkspace";
import { collections, recordTitle, recordImage } from "../admin/collections";
import styles from "../admin/Admin.module.css";

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
  const selectedIndex = () =>
    workspace.rows().findIndex((row) => row._id === workspace.selectedId());
  const busy = () => Boolean(admin.pending());
  return (
    <div class={styles.root}>
      <PageTitle title="Content Manager" />
      <header class={styles.header}>
        <div class={styles.brand}>
          <img src="/assets/cropped_logo.avif" alt="GLORIX" />
          <span>CONTENT MANAGER</span>
        </div>
        <div class={styles.actions}>
          <a
            href="/"
            class={styles.textLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            View site ↗
          </a>
          <Show when={admin.authenticated()}>
            <button
              class={styles.secondary}
              type="button"
              disabled={busy()}
              onClick={() => void workspace.logout()}
            >
              Sign out
            </button>
          </Show>
        </div>
      </header>
      <main id="main-content" class={styles.main}>
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
            <div class={styles.toolbar}>
              <div>
                <p class={styles.eyebrow}>YOUR WORKSPACE</p>
                <h1>
                  Manage <span>content</span>
                </h1>
                <p class={styles.hint}>
                  {admin.state.draftCount
                    ? `${admin.state.draftCount} items with unpublished changes`
                    : "All content published"}
                </p>
                <Show when={admin.state.publishedAt}>
                  <p class={styles.timestamp}>
                    Last published{" "}
                    {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Kolkata",
                    }).format(admin.state.publishedAt!)}{" "}
                    IST
                  </p>
                </Show>
              </div>
              <div class={styles.publishActions}>
                <button
                  class={styles.secondary}
                  type="button"
                  disabled={busy()}
                  onClick={() => void workspace.reload()}
                >
                  {admin.pending() === "loading"
                    ? "Reloading…"
                    : "Reload content"}
                </button>
                <button
                  class={styles.primary}
                  type="button"
                  disabled={
                    busy() || workspace.dirty() || !admin.state.draftCount
                  }
                  onClick={() => void admin.publish()}
                >
                  {admin.pending() === "publish"
                    ? "Publishing…"
                    : "Publish saved changes"}
                </button>
                <small>Publishes all saved site content.</small>
              </div>
            </div>
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
                  <strong>{label()}</strong>
                  <button
                    class={styles.primary}
                    type="button"
                    disabled={busy()}
                    onClick={workspace.add}
                  >
                    + Add {singular()}
                  </button>
                </div>
                <label class={styles.search}>
                  <span class={styles.searchLabel}>Find {singular()}</span>
                  <input
                    type="search"
                    placeholder={`Search ${label().toLowerCase()}…`}
                    value={workspace.search()}
                    onInput={(event) =>
                      workspace.setSearch(event.currentTarget.value)
                    }
                  />
                </label>
                <div class={styles.eventList}>
                  <For
                    each={workspace.filtered()}
                    fallback={
                      <p class={styles.empty}>
                        No items found. Add your first {singular()}.
                      </p>
                    }
                  >
                    {(row) => (
                      <button
                        type="button"
                        class={[
                          styles.eventItem,
                          {
                            [styles.selected]:
                              workspace.selectedId() === row._id,
                          },
                        ]}
                        disabled={busy()}
                        aria-pressed={
                          workspace.selectedId() === row._id ? "true" : "false"
                        }
                        onClick={() => workspace.select(row)}
                      >
                        <Show when={recordImage(row)}>
                          {(image) => (
                            <img src={`/${image()}`} alt="" loading="lazy" />
                          )}
                        </Show>
                        <div>
                          <strong class={styles.recordTitle}>
                            {recordTitle(row)}
                          </strong>
                          <Show when={"date" in row && row.date}>
                            <span class={styles.eventDate}>
                              {"date" in row ? row.date : ""}
                            </span>
                          </Show>
                          <Show when={"status" in row}>
                            <span
                              class={styles.badge}
                              data-status={"status" in row ? row.status : ""}
                            >
                              {"status" in row
                                ? statuses.find(
                                    (item) => item.value === row.status,
                                  )?.label
                                : ""}
                            </span>
                          </Show>
                          <Show when={"enabled" in row}>
                            <span class={styles.badge}>
                              {"enabled" in row && row.enabled
                                ? "Enabled"
                                : "Disabled"}
                            </span>
                          </Show>
                        </div>
                      </button>
                    )}
                  </For>
                </div>
                <Show when={workspace.section() !== "events"}>
                  <div class={styles.orderTools}>
                    <button
                      class={styles.secondary}
                      type="button"
                      disabled={
                        busy() ||
                        Boolean(workspace.search()) ||
                        selectedIndex() <= 0
                      }
                      onClick={() => void workspace.move(-1)}
                    >
                      ↑ Move up
                    </button>
                    <button
                      class={styles.secondary}
                      type="button"
                      disabled={
                        busy() ||
                        Boolean(workspace.search()) ||
                        selectedIndex() < 0 ||
                        selectedIndex() >= workspace.rows().length - 1
                      }
                      onClick={() => void workspace.move(1)}
                    >
                      ↓ Move down
                    </button>
                    <small>
                      Clear search to reorder. Order changes are saved as
                      drafts.
                    </small>
                  </div>
                </Show>
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
                        saving={admin.pending() === "save"}
                        onSave={(publish) => void workspace.save(publish)}
                        onDelete={() => void workspace.remove()}
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
                      busy={busy()}
                      saving={admin.pending() === "save"}
                      isNew={!workspace.eventEditor.form.original}
                      onSave={(publish) => void workspace.save(publish)}
                      onDelete={() => void workspace.remove()}
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
