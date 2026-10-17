import layout from "../../styles/site.module.css";
import styles from "./People.module.css";
import PageTitle from "../../components/PageTitle";
import { usePeopleAnimations } from "../../lib/animations/people";
import PeopleGrid from "../../components/PeopleGrid";
import people from "../../data/teams.json";

export default function Page() {
  let root!: HTMLElement;
  usePeopleAnimations(() => root);
  return (
    <>
      <PageTitle title="Our Team" />

      <main
        ref={(element) => {
          root = element;
        }}
        id="main-content"
        class={[layout.page, layout.spacious]}
      >
        <section class={styles.header}>
          <h2 class={[layout.sectionTitle, styles.title]} data-animate="title">
            <span>OUR</span> TEAM
          </h2>
          <p class={styles.intro}>
            Meet the dedicated professionals behind the GLORIX vision.
          </p>
        </section>

        <section id="team" class={[styles.section, styles.team]}>
          <PeopleGrid people={people} team />
        </section>
      </main>
    </>
  );
}
