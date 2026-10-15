import PageTitle from '../components/PageTitle';
import OriginalStyles from '../components/OriginalStyles';
import globalCss from '../styles/original/global.css?raw';
import { useOriginalAnimations } from '../lib/useOriginalAnimations';
import pageCss from '../styles/original/gallery.css?raw';
import GalleryGrid from '../components/GalleryGrid';
import gallery from '../data/gallery.json';

// Original Glorix markup retained; dynamic slots are Solid components.
export default function Page() {
useOriginalAnimations('gallery');
return <><PageTitle title="Our Gallery" /><OriginalStyles sheets={[globalCss, pageCss]} inline={""} /><main id="main-content" class="main-content">
      <section class="gallery-page-section">
        <h2 class="section-title"><span>OUR</span> GALLERY</h2>
        <GalleryGrid items={gallery} />
      </section>
    </main></>;
}
