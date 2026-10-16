import { For } from "solid-js";
export interface GalleryItem {
  src: string;
  alt: string;
  homeOrder?: number;
  homeObjectPosition?: string;
}
const homeClasses = [
  "item-l1",
  "item-l2",
  "item-l3",
  "item-l4",
  "gallery-logo",
  "item-m1",
  "item-tall",
  "item-r1",
  "item-r2",
  "item-r3",
  "item-r4",
];
export default function GalleryGrid(props: {
  items: GalleryItem[];
  home?: boolean;
}) {
  return (
    <div
      class="gallery-grid"
      id={props.home ? "homeGalleryGrid" : "galleryGrid"}
    >
      <For each={props.items}>
        {(item) => (
          <div
            class={[
              "gallery-item",
              props.home && item.homeOrder
                ? homeClasses[item.homeOrder - 1]
                : "",
            ]}
          >
            <img
              src={"/" + item.src}
              alt={item.alt}
              loading="lazy"
              style={{
                "object-position": props.home
                  ? item.homeObjectPosition
                  : undefined,
              }}
            />
          </div>
        )}
      </For>
    </div>
  );
}
