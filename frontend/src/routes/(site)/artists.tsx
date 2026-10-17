import layout from "../../styles/site.module.css";
import styles from "./People.module.css";
import PageTitle from "../../components/PageTitle";
import { usePeopleAnimations } from "../../lib/animations/people";
import PeopleGrid from "../../components/PeopleGrid";
import people from "../../data/artists.json";

export default function Page() {
  let root!: HTMLElement;
  usePeopleAnimations(() => root);
  return (
    <>
      <PageTitle title="Our Artists" />

      <main
        ref={(element) => {
          root = element;
        }}
        id="main-content"
        class={[layout.page, layout.spacious]}
      >
        <section class={styles.header}>
          <h2 class={[layout.sectionTitle, styles.title]} data-animate="title">
            <span>OUR</span> ARTISTS
          </h2>
          <p class={styles.intro}>
            Discover the talented artists who bring the GLORIX vision to life.
          </p>
        </section>

        <section id="artists" class={styles.section}>
          <PeopleGrid people={people} />
        </section>
      </main>
    </>
  );
}
