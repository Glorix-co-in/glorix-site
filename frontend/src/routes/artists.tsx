import PageTitle from '../components/PageTitle';
import OriginalStyles from '../components/OriginalStyles';
import globalCss from '../styles/original/global.css?raw';
import { useOriginalAnimations } from '../lib/useOriginalAnimations';
import pageCss from '../styles/original/index.css?raw';
import PeopleGrid from '../components/PeopleGrid';
import people from '../data/artists.json';

// Original Glorix markup retained; dynamic slots are Solid components.
export default function Page() {
useOriginalAnimations('artists');
return <><PageTitle title="Our Artists" /><OriginalStyles sheets={[globalCss, pageCss]} inline={"\r\n      .artists-page-header {\r\n        padding-top: 0px;\r\n        padding-bottom: 40px;\r\n        text-align: center;\r\n      }\r\n      .artists-grid {\r\n        padding-bottom: 100px;\r\n      }\r\n    "} /><main id="main-content" class="main-content">
      <section class="artists-page-header">
        <h2 class="section-title"><span>OUR</span> ARTISTS</h2>
        <p style="color: #888; max-width: 600px; margin: 0 auto">
          Discover the talented artists who bring the GLORIX vision to life.
        </p>
      </section>

      <section id="artists" class="artists-section" style="padding-top: 0">
        <PeopleGrid people={people}  />
      </section>
    </main></>;
}
