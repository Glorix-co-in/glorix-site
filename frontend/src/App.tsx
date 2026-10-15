import { For } from 'solid-js';
import { useBookings } from './bookings/useBookings';
import EventCard from './components/EventCard';
import EventDetails from './components/EventDetails';
import './App.css';

export default function App() {
  const bookings = useBookings();
  return (
    <>
      <a class="skip-link" href="#bookings">Skip to events</a>
      <header class="navbar">
        <button class="menu-toggle" aria-label="Toggle navigation" aria-expanded={bookings.state.menuOpen ? 'true' : 'false'} aria-controls="navigation" onClick={bookings.toggleMenu}>☰</button>
        <a class="brand" href="https://glorix.in/">
          <img src="/assets/cropped_logo.avif" alt="GLORIX" width="146" height="54" />
          <span>The X Factor In Everything !</span>
        </a>
        <nav id="navigation" class={{ navigation: true, 'navigation--open': bookings.state.menuOpen }} aria-label="Main navigation">
          <a href="https://glorix.in/">Home</a>
          <a href="https://glorix.in/gallery.html">Gallery</a>
          <a href="#bookings" aria-current="page" onClick={bookings.closeMenu}>Bookings</a>
          <a href="https://glorix.in/artists.html">Artists</a>
          <a href="https://glorix.in/team.html">Team</a>
          <a href="https://glorix.in/#email-subscription">Contact</a>
        </nav>
        <a class="book-now" href="#bookings">Book Now</a>
      </header>
      <main id="bookings">
        <div class="bookings-hero"><h1>BOOK YOUR TICKETS NOW!</h1></div>
        <section class="events-section" aria-labelledby="upcoming-heading">
          <h2 id="upcoming-heading" class="section-title"><span>UPCOMING</span> EVENTS</h2>
          <div class="events-container">
            <For each={bookings.upcoming()} fallback={<p class="empty-state">No upcoming events at the moment. Stay tuned!</p>}>
              {(event) => <EventCard event={event} upcoming={true} onOpen={bookings.openEvent} />}
            </For>
          </div>
          <h2 class="section-title past-title"><span>PAST</span> EVENTS</h2>
          <div class="events-container">
            <For each={bookings.past()} fallback={<p class="empty-state">No past events to show.</p>}>
              {(event) => <EventCard event={event} upcoming={false} onOpen={bookings.openEvent} />}
            </For>
          </div>
        </section>
      </main>
      <footer>
        <nav class="social-links" aria-label="Social media">
          <a href="https://www.linkedin.com/company/glorix-events/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://www.instagram.com/_glorix._" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.youtube.com/@GLORIX_events" target="_blank" rel="noopener noreferrer">YouTube</a>
        </nav>
        <p>Copyright © 2026 GLORIX — All Rights Reserved.</p>
      </footer>
      <EventDetails bookings={bookings} />
    </>
  );
}
