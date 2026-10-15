import { createEffect, createMemo, createSignal, For, onSettled } from 'solid-js';
import { useBookings } from '../bookings/useBookings';
import carousel from '../data/carousel.json';
import gallery from '../data/gallery.json';
import brands from '../data/collaborations.json';
import reviews from '../data/testimonials.json';
import MediaCarousel from './MediaCarousel';
import GalleryGrid, { type GalleryItem } from './GalleryGrid';
import { useMediaQuery } from '../lib/useMediaQuery';
export function HomeCarousel() {
  const bookings = useBookings();
  const slides = createMemo(() => {
    const campaigns = bookings.campaigns().map((campaign) => campaign.effects.homeCarousel);
    return [...campaigns.filter((slide) => slide.position !== 'last'), ...carousel, ...campaigns.filter((slide) => slide.position === 'last')]
      .filter((slide) => !slide.showWhenBookingOpen || ('eventId' in slide && slide.eventId && Boolean(bookings.getEvent(slide.eventId) && bookings.canBook(bookings.getEvent(slide.eventId)!))));
  }, { name: 'home-slides' });
  return <MediaCarousel slides={slides()} label="Featured events" home />;
}
export function HomeGallery() {
  const items = (gallery as GalleryItem[]).filter((item) => item.homeOrder && item.homeOrder >= 1 && item.homeOrder <= 11).sort((a,b) => a.homeOrder! - b.homeOrder!);
  return <GalleryGrid items={items} home />;
}
export function Collaborations() {
  return <div class="marquee" id="collaborationMarquee"><For each={[0,1]}>{() => <div class="marquee-content"><For each={brands}>{(brand) => <div class="collaboration-item"><img src={'/' + brand.logo} alt={brand.name} class="collab-logo" loading="lazy" /><span class="collab-name">{brand.name}</span></div>}</For></div>}</For></div>;
}
export function Testimonials() {
  const mobile = useMediaQuery('(max-width: 768px)');
  const [page,setPage] = createSignal(0,{name:'testimonial-page'});
  const [paused,setPaused] = createSignal(false,{name:'testimonials-paused'});
  const pages = createMemo(() => Array.from({length:Math.ceil(reviews.length / (mobile()?1:2))},(_,i)=>i),{name:'testimonial-pages'});
  let wrapper!:HTMLDivElement;
  createEffect(page,(value)=>{wrapper.scrollTo({left:value*wrapper.clientWidth,behavior:'smooth'});},{name:'testimonial-scroll'});
  onSettled(()=>{const timer=setInterval(()=>{if(!paused()&&!document.hidden)setPage((value)=>(value+1)%pages().length);},4000);return()=>clearInterval(timer);});
  return <><div class="review-slider-wrapper" ref={(el)=>{wrapper=el;}} onTouchStart={()=>setPaused(true)} onMouseDown={()=>setPaused(true)}><div class="review-slides" id="testimonialSlides"><For each={reviews}>{(review)=><div class="review-item"><div class="review-box"><div><img src={'/'+review.image} alt={review.name} class="reviewer-img" loading="lazy" /><p class="review-text">"{review.text}"</p></div><div><h4 class="reviewer-name">{review.name}</h4><span class="reviewer-role">{review.role}</span></div></div></div>}</For></div></div><div class="slider-dots" id="testimonialDots"><For each={pages()}>{(item)=><span role="button" tabindex="0" class={{dot:true,active:page()===item}} aria-label={'Go to testimonial page '+(item+1)} onClick={()=>setPage(item)} />}</For></div></>;
}
