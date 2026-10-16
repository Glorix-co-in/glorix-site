import PageTitle from "../components/PageTitle";
import { useOriginalAnimations } from "../lib/useOriginalAnimations";
import "../styles/pages/gallery.css";
import GalleryGrid from "../components/GalleryGrid";
import gallery from "../data/gallery.json";

// Original Glorix markup retained; dynamic slots are Solid components.
export default function Page() {
  useOriginalAnimations("gallery");
  return (
    <>
      <PageTitle title="Our Gallery" />

      <main id="main-content" class="main-content gallery-page">
        <section class="gallery-page-section">
          <h2 class="section-title">
            <span>OUR</span> GALLERY
          </h2>
          <GalleryGrid items={gallery} />
        </section>
      </main>
    </>
  );
}
