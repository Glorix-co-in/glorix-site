import PageTitle from '../components/PageTitle';
import OriginalStyles from '../components/OriginalStyles';
import globalCss from '../styles/original/global.css?raw';
import { useOriginalAnimations } from '../lib/useOriginalAnimations';
import pageCss from '../styles/original/index.css?raw';
import PeopleGrid from '../components/PeopleGrid';
import people from '../data/teams.json';

// Original Glorix markup retained; dynamic slots are Solid components.
export default function Page() {
useOriginalAnimations('team');
return <><PageTitle title="Our Team" /><OriginalStyles sheets={[globalCss, pageCss]} inline={"\r\n      .team-page-header {\r\n        padding-top: 0px;\r\n        padding-bottom: 40px;\r\n        text-align: center;\r\n      }\r\n      .team-grid {\r\n        padding-bottom: 100px;\r\n      }\r\n    "} /><main id="main-content" class="main-content">
      <section class="team-page-header">
        <h2 class="section-title"><span>OUR</span> TEAM</h2>
        <p style="color: #888; max-width: 600px; margin: 0 auto">
          Meet the dedicated professionals behind the GLORIX vision.
        </p>
      </section>

      <section id="team" class="team-section" style="padding-top: 0">
        <PeopleGrid people={people} team />
      </section>

      
    </main></>;
}
