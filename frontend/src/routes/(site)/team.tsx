import "../../styles/pages/people.css";
import PageTitle from "../../components/PageTitle";
import { useOriginalAnimations } from "../../lib/useOriginalAnimations";
import "../../styles/pages/home.css";
import PeopleGrid from "../../components/PeopleGrid";
import people from "../../data/teams.json";

export default function Page() {
  useOriginalAnimations("team");
  return (
    <>
      <PageTitle title="Our Team" />

      <main id="main-content" class="main-content team-page">
        <section class="team-page-header">
          <h2 class="section-title">
            <span>OUR</span> TEAM
          </h2>
          <p style={{ color: "#888", "max-width": "600px", margin: "0 auto" }}>
            Meet the dedicated professionals behind the GLORIX vision.
          </p>
        </section>

        <section id="team" class="team-section" style={{ "padding-top": "0" }}>
          <PeopleGrid people={people} team />
        </section>
      </main>
    </>
  );
}
