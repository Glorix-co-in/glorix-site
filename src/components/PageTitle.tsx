import { createEffect } from "solid-js";
export default function PageTitle(props: { title: string }) {
  createEffect(
    () => props.title,
    (title) => {
      document.title = title + " — GLORIX";
    },
    { name: "page-title" },
  );
  return null;
}
