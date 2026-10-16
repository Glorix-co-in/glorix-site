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
      class={props.team ? "team-grid" : "artists-grid"}
      id={props.team ? "teamGrid" : "artistsGrid"}
    >
      <For each={props.people.filter((person) => !person.hidden)}>
        {(person) => (
          <a
            href={person.link || "#"}
            class="artist-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={"/" + person.image}
              alt={props.team ? person.role || person.name : person.name}
              loading="lazy"
            />
            <div class="artist-info">
              <h3>{person.name}</h3>
            </div>
          </a>
        )}
      </For>
    </div>
  );
}
