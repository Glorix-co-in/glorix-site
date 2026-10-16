import "./styles/bottom-sheet.css";
import { createEffect, type ParentProps } from "solid-js";
import { Portal } from "@solidjs/web";

interface Props extends ParentProps {
  id: string;
  title: string;
  open: boolean;
  closeId: string;
  tall?: boolean;
  footer?: ParentProps["children"];
  onClose: () => void;
}

export default function BottomSheet(props: Props) {
  let panel!: HTMLDivElement;
  createEffect(
    () => props.open,
    (open) => {
      if (!open) return;
      const previous =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : undefined;
      const bodyOverflow = document.body.style.overflow;
      const targets = [...document.body.children].filter(
        (node): node is HTMLElement =>
          node instanceof HTMLElement && !node.contains(panel),
      );
      const inert = targets.map((node) => node.inert);
      targets.forEach((node) => {
        node.inert = true;
      });
      document.body.style.overflow = "hidden";
      const focusable = () =>
        [
          ...panel.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], [tabindex="0"]',
          ),
        ].filter((node) => node.getClientRects().length);
      (focusable()[0] ?? panel).focus({ preventScroll: true });
      const keydown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          props.onClose();
        }
        if (event.key !== "Tab") return;
        const nodes = focusable();
        const first = nodes[0] ?? panel;
        const last = nodes.at(-1) ?? panel;
        if (
          !nodes.length ||
          (event.shiftKey &&
            (document.activeElement === first ||
              document.activeElement === panel))
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last || document.activeElement === panel)
        ) {
          event.preventDefault();
          first.focus();
        }
      };
      document.addEventListener("keydown", keydown);
      return () => {
        document.removeEventListener("keydown", keydown);
        document.body.style.overflow = bodyOverflow;
        targets.forEach((node, index) => {
          node.inert = inert[index];
        });
        if (previous?.isConnected) previous.focus({ preventScroll: true });
      };
    },
    { name: "bottom-sheet-focus" },
  );

  return (
    <Portal>
      <div
        class={{ "modal-overlay": true, active: props.open }}
        id={props.id}
        inert={!props.open}
        aria-hidden={props.open ? "false" : "true"}
        onClick={(event) => {
          if (event.target === event.currentTarget) props.onClose();
        }}
      >
        <div
          class={{ "bottom-sheet": true, "bottom-sheet--tall": props.tall }}
          ref={(node) => {
            panel = node;
          }}
          role="dialog"
          aria-modal={props.open ? "true" : "false"}
          aria-labelledby={props.id + "-title"}
          tabindex="-1"
        >
          <div class="bottom-sheet__header">
            <h2 class="bottom-sheet__title" id={props.id + "-title"}>
              {props.title}
            </h2>
            <button
              type="button"
              class="bottom-sheet__close"
              id={props.closeId}
              aria-label={"Close " + props.title}
              onClick={() => props.onClose()}
            >
              <i class="fas fa-times" />
            </button>
          </div>
          <div class="bottom-sheet__content">{props.children}</div>
          {props.footer && (
            <div class="bottom-sheet__footer">{props.footer}</div>
          )}
        </div>
      </div>
    </Portal>
  );
}
