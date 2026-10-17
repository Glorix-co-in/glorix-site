import {
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  For,
  onSettled,
  Show,
} from "solid-js";
import styles from "./Admin.module.css";
import a11y from "../styles/accessibility.module.css";

export interface TagOption {
  value: string;
  label?: string;
  image?: string;
}
const optionLabel = (option: TagOption) => option.label ?? option.value;

const normalize = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
const key = (value: string) =>
  normalize(value).replace(/\s/g, "") || value.trim().toLowerCase();

function distance(left: string, right: string) {
  let row = Array.from({ length: right.length + 1 }, (_, i) => i);
  for (let i = 0; i < left.length; i++) {
    const next = [i + 1];
    for (let j = 0; j < right.length; j++) {
      next.push(
        Math.min(
          next[j] + 1,
          row[j + 1] + 1,
          row[j] + Number(left[i] !== right[j]),
        ),
      );
    }
    row = next;
  }
  return row[right.length];
}

function fuzzyScore(query: string, candidate: string) {
  const text = key(candidate);
  if (!query) return 0;
  if (text === query) return 1000;
  if (text.startsWith(query)) return 900 - (text.length - query.length);
  const position = text.indexOf(query);
  if (position >= 0) return 800 - position * 2 - text.length;
  let previous = -1;
  let gaps = 0;
  for (const letter of query) {
    const next = text.indexOf(letter, previous + 1);
    if (next < 0) {
      previous = -1;
      break;
    }
    gaps += next - previous - 1;
    previous = next;
  }
  if (previous >= 0) return 600 - gaps * 3 - text.length;
  if (query.length < 3) return -1;
  const edits = Math.min(
    ...[
      text,
      text.slice(0, query.length),
      ...normalize(candidate).split(" "),
    ].map((word) => distance(query, word)),
  );
  return edits <= (query.length < 6 ? 1 : 2)
    ? 400 - edits * 40 - text.length
    : -1;
}

export default function TagInput(props: {
  label: string;
  value: readonly string[];
  options: readonly TagOption[];
  onChange: (value: string[]) => void;
  allowCreate?: boolean;
  disabled?: boolean;
  placeholder?: string;
  wide?: boolean;
}) {
  const id = createUniqueId();
  const [query, setQuery] = createSignal("", { name: "tag-input-query" });
  const [open, setOpen] = createSignal(false, { name: "tag-input-open" });
  const [active, setActive] = createSignal(0, {
    name: "tag-input-active-option",
  });
  const [notice, setNotice] = createSignal("", {
    name: "tag-input-announcement",
  });
  let input!: HTMLInputElement;
  let control!: HTMLDivElement;
  let popup!: HTMLDivElement;

  const catalogue = createMemo(
    () => {
      const unique = new Map<string, TagOption>();
      for (const option of props.options) {
        if (option.value.trim() && !unique.has(key(option.value)))
          unique.set(key(option.value), option);
      }
      return [...unique.values()].sort((a, b) =>
        optionLabel(a).localeCompare(optionLabel(b)),
      );
    },
    { name: "tag-input-catalogue" },
  );
  const selected = createMemo(() => new Set(props.value.map(key)), {
    name: "tag-input-selected",
  });
  const displayValue = (value: string) => {
    const option = catalogue().find((item) => item.value === value);
    return option ? optionLabel(option) : value;
  };
  const choices = createMemo(
    () => {
      const search = key(query());
      const matches = catalogue()
        .filter((option) => !selected().has(key(option.value)))
        .map((option) => ({
          ...option,
          create: false,
          score: Math.max(
            fuzzyScore(search, optionLabel(option)),
            fuzzyScore(search, option.value),
          ),
        }))
        .filter((option) => option.score >= 0)
        .sort(
          (a, b) =>
            b.score - a.score || optionLabel(a).localeCompare(optionLabel(b)),
        )
        .slice(0, 10);
      const value = query().trim();
      if (
        props.allowCreate &&
        value &&
        !selected().has(key(value)) &&
        !catalogue().some((option) => key(option.value) === search)
      ) {
        matches.unshift({ value, image: undefined, create: true, score: 1001 });
      }
      return matches;
    },
    { name: "tag-input-suggestions" },
  );
  const expanded = () => open() && !props.disabled;
  const activeIndex = () =>
    Math.min(active(), Math.max(0, choices().length - 1));

  const positionPopup = () => {
    if (!popup?.matches(":popover-open")) return;
    const rect = control.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - 8;
    const above = rect.top - 8;
    const upward = below < 180 && above > below;
    popup.style.width = `${Math.min(rect.width, window.innerWidth - 16)}px`;
    popup.style.maxHeight = `${Math.max(60, Math.min(280, upward ? above : below))}px`;
    popup.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8))}px`;
    popup.style.top = `${upward ? Math.max(8, rect.top - popup.getBoundingClientRect().height - 4) : rect.bottom + 4}px`;
  };
  createEffect(
    () => ({
      expanded: expanded(),
      count: choices().length,
      active: activeIndex(),
    }),
    (state) => {
      if (state.expanded) {
        if (!popup.matches(":popover-open")) popup.showPopover();
        positionPopup();
        popup
          .querySelector<HTMLElement>(`[data-option-index="${state.active}"]`)
          ?.scrollIntoView({ block: "nearest" });
      } else if (popup.matches(":popover-open")) popup.hidePopover();
    },
    { name: "tag-input-popup" },
  );
  onSettled(() => {
    const reposition = (event: Event) => {
      if (event.target instanceof Node && popup.contains(event.target)) return;
      positionPopup();
    };
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  });

  const commit = (value: string) => {
    if (props.disabled) return;
    const option = catalogue().find((item) => key(item.value) === key(value));
    const next = option?.value ?? (props.allowCreate ? value.trim() : "");
    if (!next) return;
    if (!selected().has(key(next))) {
      props.onChange([...props.value, next]);
      setNotice(`${displayValue(next)} added.`);
    } else setNotice(`${displayValue(next)} is already added.`);
    setQuery("");
    setActive(0);
    setOpen(false);
    input.focus();
  };
  const remove = (index: number) => {
    if (props.disabled) return;
    const value = props.value[index];
    props.onChange(props.value.filter((_, i) => i !== index));
    setNotice(`${displayValue(value)} removed.`);
    input.focus();
  };

  return (
    <div class={[styles.field, { [styles.wide]: props.wide }]}>
      <label for={`${id}-input`}>{props.label}</label>
      <div
        ref={(element) => {
          control = element;
        }}
        class={styles.tagControl}
        data-disabled={props.disabled ? "true" : undefined}
        onClick={(event) => {
          if (event.target === event.currentTarget) input.focus();
        }}
      >
        <For each={props.value}>
          {(value, index) => (
            <span class={styles.tagPill}>
              <span>{displayValue(value)}</span>
              <button
                type="button"
                disabled={props.disabled}
                aria-label={`Remove ${displayValue(value)} from ${props.label}`}
                onClick={() => remove(index())}
              >
                <span aria-hidden="true">×</span>
              </button>
            </span>
          )}
        </For>
        <input
          ref={(element) => {
            input = element;
          }}
          id={`${id}-input`}
          type="text"
          role="combobox"
          autocomplete="off"
          spellcheck="false"
          disabled={props.disabled}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={expanded() ? "true" : "false"}
          aria-controls={`${id}-list`}
          aria-activedescendant={
            expanded() && choices().length
              ? `${id}-option-${activeIndex()}`
              : undefined
          }
          aria-describedby={`${id}-hint`}
          value={query()}
          placeholder={
            props.value.length
              ? "Add more…"
              : (props.placeholder ?? "Type to search…")
          }
          onFocus={() => {
            setOpen(true);
            setActive(0);
          }}
          onBlur={() => setOpen(false)}
          onInput={(event) => {
            setQuery(event.currentTarget.value);
            setActive(0);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.isComposing || event.keyCode === 229) return;
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              const count = choices().length;
              setActive(
                !expanded()
                  ? event.key === "ArrowDown"
                    ? 0
                    : Math.max(0, count - 1)
                  : count
                    ? (activeIndex() +
                        (event.key === "ArrowDown" ? 1 : count - 1)) %
                      count
                    : 0,
              );
              setOpen(true);
            } else if (event.key === "Enter") {
              event.preventDefault();
              const choice = choices()[activeIndex()];
              if (query().trim() && selected().has(key(query())))
                commit(query());
              else if (choice && (expanded() || query().trim()))
                commit(choice.value);
            } else if (event.key === "Escape") {
              if (expanded()) {
                event.preventDefault();
                event.stopPropagation();
                setOpen(false);
              }
            } else if (
              event.key === "Backspace" &&
              !query() &&
              props.value.length
            ) {
              event.preventDefault();
              remove(props.value.length - 1);
            }
          }}
        />
      </div>
      <div
        ref={(element) => {
          popup = element;
        }}
        popover="manual"
        class={styles.tagPopup}
      >
        <div
          id={`${id}-list`}
          role="listbox"
          aria-label={`${props.label} suggestions`}
        >
          <For
            each={choices()}
            fallback={
              <p class={styles.tagEmpty}>
                {query().trim() && selected().has(key(query()))
                  ? "Already added."
                  : query().trim()
                    ? "No matches found."
                    : "No more suggestions."}
              </p>
            }
          >
            {(option, index) => (
              <div
                id={`${id}-option-${index()}`}
                role="option"
                aria-selected={activeIndex() === index() ? "true" : "false"}
                data-option-index={index()}
                class={[
                  styles.tagOption,
                  { [styles.tagOptionActive]: activeIndex() === index() },
                ]}
                onPointerDown={(event) => event.preventDefault()}
                onPointerMove={() => setActive(index())}
                onClick={() => commit(option.value)}
              >
                <Show when={option.image}>
                  {(image) => (
                    <img
                      src={`/${image().replace(/^\//, "")}`}
                      alt=""
                      loading="lazy"
                    />
                  )}
                </Show>
                <span>
                  {option.create
                    ? `Add “${option.value}”`
                    : optionLabel(option)}
                </span>
                <Show when={activeIndex() === index()}>
                  <span class={styles.tagEnter} aria-hidden="true">
                    ↵
                  </span>
                </Show>
              </div>
            )}
          </For>
        </div>
      </div>
      <span id={`${id}-hint`} class={a11y.srOnly}>
        Use arrow keys to choose a suggestion and Enter to add. Backspace
        removes the last pill.
      </span>
      <span class={a11y.srOnly} role="status" aria-live="polite">
        {notice()}
      </span>
    </div>
  );
}
