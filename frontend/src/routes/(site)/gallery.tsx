import layout from "../../styles/site.module.css";
import styles from "./Gallery.module.css";
import PageTitle from "../../components/PageTitle";
import { useGalleryAnimations } from "../../lib/animations/gallery";
import GalleryGrid from "../../components/GalleryGrid";
import gallery from "../../data/gallery.json";

export default function Page() {
  let root!: HTMLElement;
  useGalleryAnimations(() => root);
  return (
    <>
      <PageTitle title="Our Gallery" />

      <main
        ref={(element) => {
          root = element;
        }}
        id="main-content"
        class={layout.page}
      >
        <section class={styles.section}>
          <h2 class={[layout.sectionTitle, styles.title]} data-animate="title">
            <span>OUR</span> GALLERY
          </h2>
          <GalleryGrid items={gallery} />
        </section>
      </main>
    </>
  );
}
