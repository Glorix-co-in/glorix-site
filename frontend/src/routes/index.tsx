import PageTitle from '../components/PageTitle';
import OriginalStyles from '../components/OriginalStyles';
import globalCss from '../styles/original/global.css?raw';
import { useOriginalAnimations } from '../lib/useOriginalAnimations';
import pageCss from '../styles/original/index.css?raw';
import { HomeCarousel, HomeGallery, Collaborations, Testimonials } from '../components/HomeContent';
import HomeAnnouncement from '../components/HomeAnnouncement';

// Original Glorix markup retained; dynamic slots are Solid components.
export default function Page() {
useOriginalAnimations('index');
return <><PageTitle title="Glorix Entertainment" /><OriginalStyles sheets={[globalCss, pageCss]} inline={""} /><main id="main-content" class="main-content">
      <HomeCarousel />
      <section class="join-banner full-bleed">
        <div class="join-container">
          <p class="join-text">
            Wanna Join Glorix Family?
            <a
              href="https://forms.gle/d5zTQz5ffnKdGnLf6"
              class="join-link"
              target="_blank"
              >Apply Now</a
            >
          </p>
        </div>
      </section>

      
      <section id="about" class="about">
        <div class="about-container">
          <div class="about-side about-left">
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-microphone-alt"></i></div>
              <h3 class="stat-number">100+</h3>
              <p class="stat-label">
                Artists in collaboration during our journey
              </p>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-city"></i></div>
              <h3 class="stat-number">10+</h3>
              <p class="stat-label">Cities covered nationwide</p>
            </div>
          </div>

          
          <div class="about-main-card">
            <h2 class="section-title"><span>ABOUT</span> US</h2>
            <p class="about-description">
              Glorix Entertainment is a creative collective redefining the underground music
              and event scene. We bridge artists, audiences, and brands through
              immersive cultural experiences. Fusing music, fashion, and art,
              Glorix embodies raw expression and originality.
            </p>
          </div>

          <div class="about-side about-right">
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-ticket-alt"></i></div>
              <h3 class="stat-number">1000+</h3>
              <p class="stat-label">Tickets sold and counting</p>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-building"></i></div>
              <h3 class="stat-number">15+</h3>
              <p class="stat-label">Brand partners and counting</p>
            </div>
          </div>
        </div>
      </section>

      
      <section
        id="youtube-original"
        class="youtube-original"
        style="display: flex; justify-content: center; margin: 20px 0"
      >
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
          style="max-width: 100%; width: 560px; height: 315px"
        ></iframe>
      </section>

      
      <section id="gallery" class="gallery-section">
        <div class="section-header">
          <h2 class="section-title"><span>OUR</span> GALLERY</h2>
          <a href="/gallery" class="see-all-btn"
            >See All <i class="fas fa-arrow-right"></i
          ></a>
        </div>
        <HomeGallery />
      </section>

      
      <section id="collaboration" class="collaboration-section full-bleed">
        <h2 class="section-title"><span>OUR</span> COLLABORATION</h2>
        <Collaborations />
      </section>

      
      <section class="testimonials full-bleed" id="testimonials">
        <h2 class="section-title"><span>TESTIMONIALS</span></h2>
        <Testimonials />
      </section>

      
      <section id="email-subscription" class="email-section full-bleed">
        <div class="email-container">
          <h2 class="section-title"><span>EMAIL</span> US</h2>
          <p class="email-description">Mail Us For Any Query.</p>
          <div class="email-form">
            <div class="email-display">queries.glorix@gmail.com</div>
            <a href="mailto:queries.glorix@gmail.com" class="email-btn"
              >EMAIL</a
            >
          </div>
        </div>
      </section>
    </main><HomeAnnouncement /></>;
}
