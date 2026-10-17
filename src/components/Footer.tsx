import styles from "./Footer.module.css";
export default function Footer() {
  return (
    <footer class={styles.footer}>
      <div class={styles.links}>
        <a
          href="https://www.linkedin.com/company/glorix-events/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <i class="fab fa-linkedin" />
        </a>
        <a
          href="https://www.instagram.com/_glorix._"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <i class="fab fa-instagram" />
        </a>
        <a
          href="https://www.facebook.com/share/1DJfPiCgjS/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <i class="fab fa-facebook" />
        </a>
        <a
          href="https://www.youtube.com/@GLORIX_events"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
        >
          <i class="fab fa-youtube" />
        </a>
      </div>
      <p class={styles.copyright}>
        Copyright © 2026 GLORIX - All Rights Reserved.
      </p>
    </footer>
  );
}
