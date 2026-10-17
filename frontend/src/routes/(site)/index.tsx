import styles from "./Home.module.css";
import layout from "../../styles/site.module.css";
import PageTitle from "../../components/PageTitle";
import { useHomeAnimations } from "../../lib/animations/home";
import {
  HomeCarousel,
  HomeGallery,
  Collaborations,
} from "../../components/HomeContent";
import HomeAnnouncement from "../../components/HomeAnnouncement";
import Testimonials from "../../components/Testimonials";

export default function Page() {
  let root!: HTMLElement;
  useHomeAnimations(() => root);
  return (
    <>
      <PageTitle title="Glorix Entertainment" />

      <main
        ref={(element) => {
          root = element;
        }}
        id="main-content"
        class={[layout.page, layout.spacious]}
      >
        <HomeCarousel />
        <section class={[styles.join, layout.fullBleed]}>
          <div class={styles.joinContent}>
            <p class={styles.joinText}>
              Wanna Join Glorix Family?
              <a
                href="https://forms.gle/d5zTQz5ffnKdGnLf6"
                class={styles.joinLink}
                target="_blank"
              >
                Apply Now
              </a>
            </p>
          </div>
        </section>

        <section id="about" class={styles.about}>
          <div class={styles.aboutContent}>
            <div class={[styles.stats, styles.statsLeft]}>
              <div class={styles.stat} data-animate="stat">
                <div class={styles.statIcon}>
                  <i class="fas fa-microphone-alt" />
                </div>
                <h3 class={styles.statNumber}>100+</h3>
                <p class={styles.statLabel}>
                  Artists in collaboration during our journey
                </p>
              </div>
              <div class={styles.stat} data-animate="stat">
                <div class={styles.statIcon}>
                  <i class="fas fa-city" />
                </div>
                <h3 class={styles.statNumber}>10+</h3>
                <p class={styles.statLabel}>Cities covered nationwide</p>
              </div>
            </div>

            <div class={styles.aboutCard} data-animate="about-card">
              <h2
                class={[layout.sectionTitle, styles.title]}
                data-animate="about-title"
              >
                <span>ABOUT</span> US
              </h2>
              <p class={styles.aboutDescription} data-animate="about-copy">
                Glorix Entertainment is a creative collective redefining the
                underground music and event scene. We bridge artists, audiences,
                and brands through immersive cultural experiences. Fusing music,
                fashion, and art, Glorix embodies raw expression and
                originality.
              </p>
            </div>

            <div class={[styles.stats, styles.statsRight]}>
              <div class={styles.stat} data-animate="stat">
                <div class={styles.statIcon}>
                  <i class="fas fa-ticket-alt" />
                </div>
                <h3 class={styles.statNumber}>1000+</h3>
                <p class={styles.statLabel}>Tickets sold and counting</p>
              </div>
              <div class={styles.stat} data-animate="stat">
                <div class={styles.statIcon}>
                  <i class="fas fa-building" />
                </div>
                <h3 class={styles.statNumber}>15+</h3>
                <p class={styles.statLabel}>Brand partners and counting</p>
              </div>
            </div>
          </div>
        </section>

        <section id="youtube-original" class={styles.video}>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/agFeZEmPKL4"
            title="YouTube video player"
            frameborder="0"
            allow="
            accelerometer;
            clipboard-write;
            encrypted-media;
            gyroscope;
            picture-in-picture;
            web-share;
          "
            allowfullscreen
            loading="lazy"
          />
        </section>

        <section id="gallery" class={styles.gallery}>
          <div class={styles.sectionHeader}>
            <h2
              class={[layout.sectionTitle, styles.title]}
              data-animate="title"
            >
              <span>OUR</span> GALLERY
            </h2>
            <a href="/gallery" class={styles.seeAll}>
              See All <i class="fas fa-arrow-right" />
            </a>
          </div>
          <HomeGallery />
        </section>

        <section
          id="collaboration"
          class={[styles.collaborations, layout.fullBleed]}
          data-animate="collaboration-section"
        >
          <h2 class={[layout.sectionTitle, styles.title]} data-animate="title">
            <span>OUR</span> COLLABORATION
          </h2>
          <Collaborations />
        </section>

        <section
          class={[styles.testimonials, layout.fullBleed]}
          id="testimonials"
        >
          <h2 class={[layout.sectionTitle, styles.title]} data-animate="title">
            <span>TESTIMONIALS</span>
          </h2>
          <Testimonials />
        </section>

        <section
          id="email-subscription"
          class={[styles.contact, layout.fullBleed]}
        >
          <div class={styles.contactContent} data-animate="contact">
            <h2
              class={[layout.sectionTitle, styles.title]}
              data-animate="title"
            >
              <span>EMAIL</span> US
            </h2>
            <p class={styles.contactDescription}>Mail Us For Any Query.</p>
            <div class={styles.contactLinks}>
              <div class={styles.email}>queries.glorix@gmail.com</div>
              <a
                href="mailto:queries.glorix@gmail.com"
                class={styles.emailLink}
              >
                EMAIL
              </a>
            </div>
          </div>
        </section>
      </main>
      <HomeAnnouncement />
    </>
  );
}
