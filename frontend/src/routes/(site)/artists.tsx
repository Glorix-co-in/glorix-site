import "../../styles/pages/people.css";
import PageTitle from "../../components/PageTitle";
import { useOriginalAnimations } from "../../lib/useOriginalAnimations";
import "../../styles/pages/home.css";
import PeopleGrid from "../../components/PeopleGrid";
import people from "../../data/artists.json";

export default function Page() {
  useOriginalAnimations("artists");
  return (
    <>
      <PageTitle title="Our Artists" />

      <main id="main-content" class="main-content artists-page">
        <section class="artists-page-header">
          <h2 class="section-title">
            <span>OUR</span> ARTISTS
          </h2>
          <p style={{ color: "#888", "max-width": "600px", margin: "0 auto" }}>
            Discover the talented artists who bring the GLORIX vision to life.
          </p>
        </section>

        <section
          id="artists"
          class="artists-section"
          style={{ "padding-top": "0" }}
        >
          <PeopleGrid people={people} />
        </section>
      </main>
    </>
  );
}
