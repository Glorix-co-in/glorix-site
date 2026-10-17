import styles from "./PeopleGrid.module.css";
import { For } from "solid-js";
export interface Person {
  name: string;
  image: string;
  link?: string;
  role?: string;
  hidden?: boolean;
}
export default function PeopleGrid(props: {
  people: Person[];
  team?: boolean;
}) {
  return (
    <div
      class={[styles.grid, { [styles.team]: props.team }]}
      id={props.team ? "teamGrid" : "artistsGrid"}
      data-animate="people"
    >
      <For each={props.people.filter((person) => !person.hidden)}>
        {(person) => (
          <a
            href={person.link || "#"}
            class={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={"/" + person.image}
              alt={props.team ? person.role || person.name : person.name}
              loading="lazy"
            />
            <div class={styles.info}>
              <h3>{person.name}</h3>
            </div>
          </a>
        )}
      </For>
    </div>
  );
}
