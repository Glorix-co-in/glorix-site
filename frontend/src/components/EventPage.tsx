import { createEffect,createMemo,createSignal,For,Show,onSettled } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useBookings } from '../bookings/useBookings';
import { safeExternalUrl } from '../bookings/rules';
import artists from '../data/artists.json';
import pageCss from '../styles/original/details.css?raw';
import globalCss from '../styles/original/global.css?raw';
import eventCss from '../styles/original/event-card.css?raw';
import OriginalStyles from './OriginalStyles';
import MediaCarousel from './MediaCarousel';
import PageTitle from './PageTitle';
import NotFound from './NotFound';
import { useShare } from '../lib/useShare';
export default function EventPage(props:{id?:string}) {
 const bookings=useBookings();const navigate=useNavigate();const event=createMemo(()=>bookings.getEvent(props.id),{name:'event-details'});
 const [expanded,setExpanded]=createSignal(false,{name:'about-expanded'});const [readMore,setReadMore]=createSignal(false,{name:'about-read-more'});const [modal,setModal]=createSignal<'terms'|'stage'|null>(null,{name:'event-modal'});let about:HTMLParagraphElement|undefined;
 const share=useShare(); const back=()=>window.history.length>1 ? window.history.back() : navigate('/bookings');
 const defaultArtists=createMemo(()=>event()?.details.defaultArtists || ['Saksham','Nagity','DJ Rick'],{name:'default-artists'});
 const featuredArtists=createMemo(()=>[...new Set([...defaultArtists(),...(event()?.details.artists || [])])].map((name)=>artists.find((artist)=>artist.name===name)).filter((artist):artist is typeof artists[number]=>Boolean(artist)),{name:'event-artists'});
 const slides=createMemo(()=>{const item=event();return item ? [{desktopImage:item.details.detailsImage?.portrait || item.image,mobileImage:item.details.detailsImage?.landscape || item.image,alt:item.title},...(item.details.carouselSlides || []).map((slide)=>({...slide,alt:item.title}))] : [];},{name:'event-media'});
 const availability=createMemo(()=>{const item=event();if(!item)return 'Bookings Closed';if(item.status==='sold-out')return 'Sold Out';if(!bookings.hasOpened(item))return item.details.bookingOpensAt ? 'Bookings open '+item.details.bookingOpensAt : 'Opening Soon';if(bookings.canBook(item))return item.status==='filling-fast'?'Filling Fast':'Available';return 'Bookings Closed';},{name:'event-availability'});
 const book=()=>{const item=event();if(!item||!bookings.canBook(item))return;if(item.bookingOptions?.length)navigate('/events/'+encodeURIComponent(item.id)+'/slots');else {const url=bookings.bookingUrl(item);if(url)window.open(url,'_blank','noopener,noreferrer');}};
 createEffect(()=>event()?.details.aboutEvent,()=>{setExpanded(false);const frame=requestAnimationFrame(()=>{if(about)setReadMore(Math.round(about.scrollHeight/parseFloat(getComputedStyle(about).lineHeight))>5);});return()=>cancelAnimationFrame(frame);},{name:'about-measure'});
 createEffect(modal,(value)=>{document.body.classList.toggle('modal-open',Boolean(value));return()=>document.body.classList.remove('modal-open');},{name:'event-modal-scroll'});
 onSettled(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setModal(null);};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);});
 return <><OriginalStyles sheets={[globalCss,eventCss,pageCss]} /><Show when={event()} fallback={<NotFound message="Event not found" />}>{(item)=><><PageTitle title={item().title} /><header class="details-header">
      <button class="back-btn" id="backBtn" onClick={back} aria-label="Go back">
        <i class="fas fa-chevron-left"></i>
      </button>
      <h1 class="header-title" id="headerTitle">{item().title}</h1>
      <button class="share-btn" id="shareBtn" onClick={() => share.share(item().title)} aria-label="Share event">
        <i class="fas fa-share-alt"></i>
      </button>
    </header><main id="main-content" class="details-main">
      <section
        id="splitVariantSection"
        class="events-section"
        style="display: none; padding-top: 20px"
      >
        <h2 class="section-title">Select Event Volume</h2>
        <div id="splitVariantContainer" class="events-container"></div>
      </section>

      <MediaCarousel slides={slides()} label={item().title} /><div class="details-content-wrapper">
        <div class="details-scroll-content">
          
          <div class="event-tags" id="eventTags"><For each={item().details.tags}>{(tag) => <span class="event-tag">{tag}</span>}</For></div>

          
          <div class="event-details-list">
            <div class="detail-item" id="dateItem">
              <i class="far fa-calendar"></i>
              <span id="eventDate">{item().details.dateRange || item().date}</span>
            </div>
            <div class="detail-item" id="timeItem">
              <i class="far fa-clock"></i>
              <span id="eventTime">{item().details.time || "TBA"}</span>
            </div>
            <div class="detail-item" id="durationItem">
              <i class="fas fa-hourglass-half"></i>
              <span id="eventDuration">{item().details.duration}</span>
            </div>
            <div class="detail-item" id="ageItem">
              <i class="fas fa-users"></i>
              <span>Age Limit - <span id="eventAge">{item().details.ageLimit}</span></span>
            </div>
            <div class="detail-item" id="languageItem">
              <i class="fas fa-language"></i>
              <span id="eventLanguage">{item().details.languages}</span>
            </div>
            <div class="detail-item" id="genreItem">
              <i class="fas fa-music"></i>
              <span id="eventGenre">{item().details.genre}</span>
            </div>
            <div class="detail-item venue-item" id="venueItem">
              <i class="fas fa-location-dot"></i>
              <span id="eventVenue">{item().details.venue}</span>
              <a href={safeExternalUrl(item().details.venueLink)} id="venueLink" style={{display:item().details.venueLink ? undefined : "none"}}
                class="venue-direction"
                target="_blank"
                aria-label="Get directions"
              >
                <i class="fas fa-location-arrow"></i>
              </a>
            </div>
          </div>

          
          <div class="about-section">
            <h2 class="about-title">About The Event</h2>
            <p class={{"about-text":true,"is-collapsed":!expanded()}} id="aboutText" ref={(el)=>{about=el;}}>{item().details.aboutEvent}</p>
            <button class={{"about-read-more":true,"is-visible":readMore()}} id="aboutReadMore" onClick={()=>setExpanded(!expanded())} type="button">{expanded() ? "READ LESS" : "READ MORE"}</button>
          </div>

          
          <div
            class="artists-section"
            id="artistsSection" style={{display:!item().details.hideArtists && featuredArtists().length ? "block" : "none"}}
          >
            <h2 class="about-title">Featured Artists</h2>
            <div class="artists-carousel-wrapper">
              <div class="artists-grid" id="eventArtists"><For each={featuredArtists()}>{(artist)=><a href={artist.link || "#"} class="event-artist-card" target="_blank" rel="noopener noreferrer"><div class={{"artist-img-wrapper":true,featured:defaultArtists().includes(artist.name)}}><img src={"/"+artist.image} alt={artist.name} loading="lazy" /></div><span class="artist-name">{artist.name}</span></a>}</For></div>
            </div>
          </div>

          
          <div
            class="terms-section"
            id="stageLayoutSection" style={{display:item().details.stageLayoutImage ? "flex" : "none"}} onClick={()=>setModal("stage")}
          >
            <span class="terms-text">Stage Layout</span>
            <i class="fas fa-chevron-right"></i>
          </div>

          
          <div class="terms-section" id="termsSection" onClick={()=>setModal("terms")}>
            <span class="terms-text">Terms & Conditions</span>
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>

        <div class="sticky-bottom-bar">
          <div class="price-info">
            <span class="price-label">
              <span class="currency-symbol" style={{display:bookings.price(item())===0 ? "none" : undefined}}>₹</span>
              <span id="priceFrom">{bookings.price(item()) === 0 ? "Free Entry" : bookings.price(item()) ?? "TBA"}</span>
              <span class="price-suffix" style={{display:bookings.price(item())===0 ? "none" : undefined}}> onwards</span>
            </span>
            <span class={"availability "+(bookings.canBook(item()) ? item().status === "filling-fast" ? "filling-fast" : "available" : item().status === "sold-out" ? "sold-out" : "closed")} id="availability">{availability()}</span>
          </div>
          <div class="booking-action-wrapper">
            <button class={{"book-now-btn":true,disabled:!bookings.canBook(item())}} id="bookNowBtn" disabled={!bookings.canBook(item())} onClick={book}>{availability() === "Available" || availability() === "Filling Fast" ? "Book Now" : availability()}</button>
            <div id="razorpayButtonContainer" style="display:none;">
              <form id="razorpayForm">
                
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
    <div class={{"modal-overlay":true,active:modal()==="terms"}} id="termsModal" onClick={(e)=>{if(e.target===e.currentTarget)setModal(null);}}>
      <div class="bottom-sheet">
        <div class="bottom-sheet__header">
          <h2 class="bottom-sheet__title">Terms & Conditions</h2>
          <button class="bottom-sheet__close" id="closeTerms" onClick={()=>setModal(null)}>
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="bottom-sheet__content">
          <ol class="terms-list">
            <li>
              Tickets are valid only for the date, time, and event mentioned.
            </li>
            <li>
              Each ticket is non-transferable and meant for single-person use.
            </li>
            <li>Tickets once booked cannot be refunded or exchanged.</li>
            <li>
              In case of event cancellation or rescheduling, updates will be
              sent via registered email or phone.
            </li>
            <li>Entry is allowed only with a valid ticket.</li>
            <li>
              Organizers reserve the right to deny entry for security or policy
              reasons.
            </li>
            <li>
              Outside food, drinks, alcohol, and prohibited items are not
              allowed inside the venue.
            </li>
            <li>
              Late entry may be restricted or delayed as per event guidelines.
            </li>
            <li>
              Misbehavior, damage, or misconduct may lead to removal without
              refund.
            </li>
            <li>
              Glorix is not responsible for loss or theft of personal belongings
              at the venue.
            </li>
            <li>
              Unauthorized resale or duplication of tickets is strictly
              prohibited.
            </li>
            <li>
              Attendees must follow all event and venue safety instructions.
            </li>
            <li>
              Terms are subject to change without prior notice at the discretion
              of Glorix.
            </li>
          </ol>
        </div>
        <div class="bottom-sheet__footer">
          <button class="got-it-btn" id="gotItBtn" onClick={()=>setModal(null)}>Okay, Got It</button>
        </div>
      </div>
    </div>

    
    <div class={{"modal-overlay":true,active:modal()==="stage"}} id="stageLayoutModal" onClick={(e)=>{if(e.target===e.currentTarget)setModal(null);}}>
      <div class="bottom-sheet bottom-sheet--tall">
        <div class="bottom-sheet__header">
          <h2 class="bottom-sheet__title">Stage Layout</h2>
          <button class="bottom-sheet__close" id="closeStageLayout" onClick={()=>setModal(null)}>
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="bottom-sheet__content">
          <img
            id="stageLayoutImage"
            class="stage-layout-image"
            src=""
            alt="Stage Layout"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </>}</Show></>;
}
