import styles from "./Announcement.module.css";
import { createMemo, For } from "solid-js";
import { useClock } from "../../lib/useClock";

const units = [
  { id: "countdownDays", label: "DAYS", divisor: 86400000 },
  { id: "countdownHours", label: "HRS", divisor: 3600000, modulo: 24 },
  { id: "countdownMins", label: "MINS", divisor: 60000, modulo: 60 },
  { id: "countdownSecs", label: "SECS", divisor: 1000, modulo: 60 },
];

function countdownValue(remaining: number, unit: (typeof units)[number]) {
  const value = Math.floor(remaining / unit.divisor);
  return String(unit.modulo ? value % unit.modulo : value).padStart(2, "0");
}

export default function AnnouncementCountdown(props: {
  startsAt?: string;
  enabled: boolean;
}) {
  const now = useClock(() => props.enabled);
  const remaining = createMemo(
    () => Math.max(0, Date.parse(props.startsAt ?? "") - now()) || 0,
    { name: "announcement-countdown" },
  );
  return (
    <div class={styles.countdown} id="eventCountdown">
      <For each={units}>
        {(unit) => (
          <div class={styles.countdownItem}>
            <div class={styles.countdownValue} id={unit.id}>
              {countdownValue(remaining(), unit)}
            </div>
            <div class={styles.countdownLabelSmall}>{unit.label}</div>
          </div>
        )}
      </For>
    </div>
  );
}
