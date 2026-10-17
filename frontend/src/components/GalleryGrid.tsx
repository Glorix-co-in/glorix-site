import styles from "./GalleryGrid.module.css";
import { For } from "solid-js";
export interface GalleryItem {
  src: string;
  alt: string;
  homeOrder?: number;
  homeObjectPosition?: string;
}
const homeClasses = [
  styles.leftOne,
  styles.leftTwo,
  styles.leftThree,
  styles.leftFour,
  styles.logo,
  styles.middle,
  styles.tall,
  styles.rightOne,
  styles.rightTwo,
  styles.rightThree,
  styles.rightFour,
];
export default function GalleryGrid(props: {
  items: GalleryItem[];
  home?: boolean;
}) {
  return (
    <div
      class={[styles.grid, props.home ? styles.home : styles.gallery]}
      id={props.home ? "homeGalleryGrid" : "galleryGrid"}
      data-animate="gallery"
    >
      <For each={props.items}>
        {(item) => (
          <div
            class={[
              styles.item,
              props.home && item.homeOrder
                ? homeClasses[item.homeOrder - 1]
                : "",
            ]}
            data-animate="gallery-item"
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
