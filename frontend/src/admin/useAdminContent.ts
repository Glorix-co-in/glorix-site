import {
  createSignal,
  createStore,
  onCleanup,
  onSettled,
  reconcile,
  untrack,
} from "solid-js";
import type { FunctionReturnType } from "convex/server";
import type { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import type { BookingEvent } from "../bookings/types";
import { eventData } from "../../shared/events";
import {
  emptyContent,
  type Collection,
  type CollectionChange,
  type RecordSelection,
} from "../../shared/content";
import type { SiteContent } from "../../convex/validators";

type AdminContent = FunctionReturnType<typeof api.adminContent.get>;
type Operation =
  "loading" | "login" | "logout" | "save" | "publish" | "delete" | "order";

export function useAdminContent(onLoad: (content: SiteContent) => void) {
  const initial = () => ({
    content: emptyContent(),
    draftCounts: {},
    draftCount: 0,
    publishedAt: null,
  });
  const [state, setState] = createStore<AdminContent>(initial(), {
    name: "admin-content",
  });
  const [authenticated, setAuthenticated] = createSignal<boolean | undefined>(
    undefined,
    { name: "admin-authenticated" },
  );
  const [configured, setConfigured] = createSignal(true, {
    name: "admin-configured",
  });
  const [pending, setPending] = createSignal<Operation | null>(null, {
    name: "admin-pending",
  });
  const [error, setError] = createSignal<string | undefined>(undefined, {
    name: "admin-error",
  });
  const [notice, setNotice] = createSignal<string | undefined>(undefined, {
    name: "admin-notice",
  });
  const controller = new AbortController();
  onCleanup(() => controller.abort());

  async function request<T>(
    action: string,
    method = "GET",
    body?: unknown,
  ): Promise<T> {
    const response = await fetch(`/api/admin?action=${action}`, {
      method,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      ...(method !== "GET" && body !== undefined
        ? { body: JSON.stringify(body) }
        : {}),
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) setAuthenticated(false);
      throw new Error(data.error || "Unable to complete the request.");
    }
    return data;
  }

  async function run(operation: Operation, work: () => Promise<void>) {
    if (pending()) return false;
    setPending(operation);
    setError(undefined);
    setNotice(undefined);
    try {
      await work();
      return true;
    } catch (cause) {
      if (authenticated() === undefined) setAuthenticated(false);
      if (!controller.signal.aborted)
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to complete the request.",
        );
      return false;
    } finally {
      if (!controller.signal.aborted) setPending(null);
    }
  }

  async function load() {
    const content = await request<AdminContent>("content");
    if (controller.signal.aborted) return;
    setState(reconcile(content, "_id"));
    onLoad(content.content);
  }

  onSettled(() => {
    void run("loading", async () => {
      const session = await request<{
        configured: boolean;
        authenticated: boolean;
      }>("session");
      setConfigured(session.configured);
      setAuthenticated(session.authenticated);
      if (session.authenticated) await load();
    });
  });

  const login = (password: string) =>
    run("login", async () => {
      await request("session", "POST", { password });
      setAuthenticated(true);
      await load();
    });
  const logout = () =>
    run("logout", async () => {
      await request("session", "DELETE");
      setAuthenticated(false);
      setState(reconcile(initial(), "_id"));
    });
  const reload = () => run("loading", load);
  const saveEvent = async (
    original: Doc<"events"> | undefined,
    event: BookingEvent,
    publish: boolean,
  ) => {
    let id: string | undefined;
    const success = await run("save", async () => {
      const result = await request<{ id: string }>("events", "PATCH", {
        eventId: original?._id ?? null,
        expected: original ? eventData(original) : null,
        event,
        publish,
      });
      id = result.id;
      await load();
      setNotice(
        publish
          ? "Event saved and published. The live site is updating."
          : "Draft saved. Publish it when you’re ready.",
      );
    });
    return success ? id : undefined;
  };
  const saveRecord = async (change: CollectionChange, publish: boolean) => {
    let id: string | undefined;
    const success = await run("save", async () => {
      const result = await request<{ id: string }>("record", "PATCH", {
        change,
        publish,
      });
      id = result.id;
      await load();
      setNotice(
        publish
          ? "Content saved and published. The live site is updating."
          : "Draft saved. Publish it when you’re ready.",
      );
    });
    return success ? id : undefined;
  };
  const remove = (selection: RecordSelection) =>
    run("delete", async () => {
      await request("record", "DELETE", { selection });
      await load();
      setNotice(
        "Content removed from the draft. Publish to update the live site.",
      );
    });
  const reorder = (table: Collection, ids: string[]) =>
    run("order", async () => {
      const expected = untrack(() =>
        state.content[table].map((row) => ({
          id: row._id,
          position: row.position,
        })),
      );
      await request("order", "POST", { table, expected, ids });
      await load();
      setNotice("Order saved as a draft. Publish to update the live site.");
    });
  const publish = () =>
    run("publish", async () => {
      await request("publish", "POST", {});
      await load();
      setNotice("Saved changes published. The live site is updating.");
    });

  return {
    state,
    authenticated,
    configured,
    pending,
    error,
    notice,
    login,
    logout,
    reload,
    saveEvent,
    saveRecord,
    remove,
    reorder,
    publish,
  };
}
