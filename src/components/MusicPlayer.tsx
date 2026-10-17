import styles from "./MusicPlayer.module.css";
import { createSignal } from "solid-js";
export default function MusicPlayer() {
  const [playing, setPlaying] = createSignal(false, { name: "music-playing" });
  const [error, setError] = createSignal("", { name: "music-error" });
  let audio!: HTMLAudioElement;
  const toggle = async () => {
    if (!audio.paused) audio.pause();
    else
      try {
        await audio.play();
        setError("");
      } catch {
        setError("Audio could not play. Try again.");
      }
  };
  return (
    <div class={styles.player}>
      <button
        id="musicBtn"
        class={styles.button}
        onClick={toggle}
        aria-label={playing() ? "Pause music" : "Play music"}
      >
        {playing() ? "Ⅱ" : "▶"}
      </button>
      <audio
        ref={(el) => {
          audio = el;
        }}
        src="/assets/glorix music.mp3"
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <span role="status">{error()}</span>
    </div>
  );
}
