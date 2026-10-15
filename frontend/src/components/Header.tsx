import { createEffect, createSignal, onSettled } from 'solid-js';
import { useLocation } from '@solidjs/router';

export default function Header() {
  const [open, setOpen] = createSignal(false, { name: 'navigation-open' });
  const location = useLocation();
  createEffect(() => location.pathname, () => { setOpen(false); }, { name: 'close-navigation-on-route' });
  createEffect(open, (value) => { document.body.classList.toggle('no-scroll', value); return () => document.body.classList.remove('no-scroll'); }, { name: 'navigation-scroll-lock' });
  onSettled(() => {
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  });
  const home = () => location.pathname === '/';
  return <header class="navbar">
    <div class={{ hamburger: true, active: open() }} id="hamburger" role="button" tabindex="0" aria-label="Toggle navigation" aria-expanded={open() ? 'true' : 'false'} aria-controls="navMenu" onClick={() => setOpen(!open())} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open()); } }}>
      <span style={{ transform: open() ? 'translateY(6px) rotate(45deg)' : undefined }} /><span style={{ opacity: open() ? 0 : 1 }} /><span style={{ transform: open() ? 'translateY(-6px) rotate(-45deg)' : undefined }} />
    </div>
    <div class="logo"><a href="/"><img src="/assets/cropped_logo.avif" alt="GLORIX Logo" height="100%" loading="eager" fetchpriority="high" /></a><p>&nbsp;The X Factor In Everything !</p></div>
    <nav class={{ 'nav-center': true, active: open() }} id="navMenu" onClick={()=>setOpen(false)}><ul>
      <li><a href="/#home" class={{ active: home() && (!location.hash || location.hash === '#home') }}>Home</a></li>
      <li><a href={home() ? '/#gallery' : '/gallery'} class={{ active: location.pathname === '/gallery' || (home() && location.hash === '#gallery') }}>Gallery</a></li>
      <li><a href="/bookings" class={{ active: location.pathname === '/bookings' }}>Bookings</a></li>
      <li><a href="/artists" class={{ active: location.pathname === '/artists' }}>Artists</a></li>
      <li><a href="/team" class={{ active: location.pathname === '/team' }}>Team</a></li>
      <li><a href="/#email-subscription" class={{active:home() && location.hash === '#email-subscription'}}>Contact</a></li>
    </ul></nav>
    <a href="/bookings" class="call-btn">Book Now</a>
  </header>;
}
