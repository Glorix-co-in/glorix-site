import { readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const source = 'C:/Users/A5IN/Coding/projects/glorix-main';
const target = resolve(import.meta.dirname, '../src');
function jsx(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<template\b[\s\S]*?<\/template>/g, '')
    .replace(/<(img|input|br|hr|source|link|meta)\b([^>]*?)(?<!\/)\s*>/g, '<$1$2 />')
    .replace(/src="assets\//g, 'src="/assets/').replace(/srcset="assets\//g, 'srcset="/assets/')
    .replace(/href="index.html/g, 'href="/').replace(/href="(gallery|artists|team|bookings).html/g, 'href="/$1');
}
for (const page of ['index','bookings','artists','team','gallery']) {
  const html = await readFile(join(source, page + '.html'), 'utf8');
  let main = html.match(/<main\b[\s\S]*?<\/main>/)[0].replace('<main ', '<main id="main-content" ');
  let imports = `import PageTitle from '../components/PageTitle';\nimport OriginalStyles from '../components/OriginalStyles';\nimport globalCss from '../styles/original/global.css?raw';\nimport { useOriginalAnimations } from '../lib/useOriginalAnimations';\n`;
  let setup = `useOriginalAnimations('${page}');`;
  let sheets = 'globalCss';
  const title = { index:'Glorix Entertainment',bookings:'Book Event Tickets',artists:'Our Artists',team:'Our Team',gallery:'Our Gallery' }[page];
  if (page === 'index' || page === 'artists' || page === 'team') { imports += `import pageCss from '../styles/original/index.css?raw';\n`; sheets += ', pageCss'; }
  if (page === 'index') {
    imports += `import { HomeCarousel, HomeGallery, Collaborations, Testimonials } from '../components/HomeContent';\nimport HomeAnnouncement from '../components/HomeAnnouncement';\n`;
    main = main.replace(/<!-- Hero Carousel - Full Bleed -->[\s\S]*?<!-- Join Family Banner -->/, '<HomeCarousel />');
    main = main.replace(/<div class="gallery-grid" id="homeGalleryGrid">[\s\S]*?<\/div>/, '<HomeGallery />');
    main = main.replace(/<div class="marquee" id="collaborationMarquee">[\s\S]*?<\/div>/, '<Collaborations />');
    main = main.replace(/<div class="review-slider-wrapper">[\s\S]*?<div class="slider-dots" id="testimonialDots">[\s\S]*?<\/div>/, '<Testimonials />');
    main = main.replace('display: none; justify-content: center;', 'display: flex; justify-content: center;');
  } else if (page === 'bookings') {
    imports += `import { For } from 'solid-js';\nimport { useBookings } from '../bookings/useBookings';\nimport EventCard from '../components/EventCard';\nimport ticker from '../data/marquee.json';\nimport eventCss from '../styles/original/event-card.css?raw';\nimport pageCss from '../styles/original/bookings.css?raw';\n`;
    sheets += ', eventCss, pageCss'; setup += '\nconst bookings = useBookings();';
    main = main.replace(/<div class="offer-ticker__track" id="marqueeTrack">[\s\S]*?<\/div>/, '<div class="offer-ticker__track" id="marqueeTrack"><For each={[0,1]}>{() => <div class="offer-ticker__content"><For each={[0,1,2,3]}>{() => <For each={ticker as {text:string}[]}>{(item) => <span>{item.text}</span>}</For>}</For></div>}</For></div>');
    main = main.replace(/<div class="events-container" id="upcomingEventsContainer">[\s\S]*?<\/div>/, '<div class="events-container" id="upcomingEventsContainer"><For each={bookings.upcoming()} fallback={<p style="color:#666;text-align:center;grid-column:1/-1;padding:40px;">No upcoming events at the moment. Stay tuned!</p>}>{(event) => <EventCard event={event} upcoming />}</For></div>');
    main = main.replace(/<div class="events-container" id="pastEventsContainer">[\s\S]*?<\/div>/, '<div class="events-container" id="pastEventsContainer"><For each={bookings.past()}>{(event) => <EventCard event={event} upcoming={false} />}</For></div>');
  } else if (page === 'artists' || page === 'team') {
    imports += `import PeopleGrid from '../components/PeopleGrid';\nimport people from '../data/${page === 'team' ? 'teams' : 'artists'}.json';\n`;
    main = main.replace(/<div class="(?:artists-grid|team-grid)" id="(?:artistsGrid|teamGrid)">[\s\S]*?<\/div>/, `<PeopleGrid people={people} ${page === 'team' ? 'team' : ''} />`);
  } else {
    imports += `import pageCss from '../styles/original/gallery.css?raw';\nimport GalleryGrid from '../components/GalleryGrid';\nimport gallery from '../data/gallery.json';\n`;
    sheets += ', pageCss';
    main = main.replace(/<div class="gallery-grid" id="galleryGrid">[\s\S]*?<\/div>/, '<GalleryGrid items={gallery} />');
  }
  const inline = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
  await writeFile(join(target, 'routes', page + '.tsx'), `${imports}\n// Original Glorix markup retained; dynamic slots are Solid components.\nexport default function Page() {\n${setup}\nreturn <><PageTitle title=${JSON.stringify(title)} /><OriginalStyles sheets={[${sheets}]} inline={${JSON.stringify(inline)}} />${jsx(main)}${page === 'index' ? '<HomeAnnouncement />' : ''}</>;\n}\n`);
}

const home = await readFile(join(source, 'index.html'), 'utf8');
let popup = jsx(home.match(/<dialog\s[\s\S]*?<\/dialog>/)[0]);
popup = popup.replace('id="eventPopup"', 'id="eventPopup" ref={(el) => { dialog = el; }} onClose={() => setOpen(false)} onCancel={() => setOpen(false)}');
popup = popup.replace('id="closeEventPopup"', 'id="closeEventPopup" onClick={() => setOpen(false)}');
popup = popup.replace('href="select-slot.html?id=glorix-dandiya-night-2026"', 'href="/events/glorix-dandiya-night-2026/slots"');
popup = popup.replace('Loading price…', '{event() ? "₹" + bookings.price(event()!) : ""}');
for (const [name, divisor, modulo] of [['Days',86400000,Infinity],['Hours',3600000,24],['Mins',60000,60],['Secs',1000,60]]) {
  popup = popup.replace(new RegExp(`(<div[^>]*id="countdown${name}"[^>]*>)[\\s\\S]*?(<\\/div>)`), `$1{String(Math.floor(remaining() / ${divisor})${Number.isFinite(modulo) ? ' % ' + modulo : ''}).padStart(2, '0')}$2`);
}
await writeFile(join(target,'components/HomeAnnouncement.tsx'), `import { createEffect, createMemo, createSignal, onSettled } from 'solid-js';\nimport { useBookings } from '../bookings/useBookings';\nimport { useClock } from '../lib/useClock';\nexport default function HomeAnnouncement() {\nconst bookings=useBookings(); const now=useClock(); const event=createMemo(()=>bookings.getEvent('glorix-dandiya-night-2026'),{name:'announcement-event'});\nconst [open,setOpen]=createSignal(false,{name:'announcement-open'}); let dialog!:HTMLDialogElement;\nconst remaining=createMemo(()=>Math.max(0,Date.parse(event()?.details.eventStartsAtISO || '')-now()) || 0,{name:'announcement-countdown'});\ncreateEffect(open,(value)=>{if(value&&!dialog.open)dialog.showModal();if(!value&&dialog.open)dialog.close();},{name:'announcement-visibility'});\nonSettled(()=>{const item=event();if(!item||!bookings.canBook(item))return;try{if(sessionStorage.getItem('announcement:'+item.id))return;sessionStorage.setItem('announcement:'+item.id,'seen');}catch{}setOpen(true);});\nreturn (${popup});\n}\n`);
console.log('Ported original main markup for five pages and the announcement dialog.');

// Details keeps the original standalone header, split layout and bottom sheets.
const detailsHtml = await readFile(join(source,'details.html'),'utf8');
let detailsHeader = detailsHtml.match(/<header class="details-header">[\s\S]*?<\/header>/)[0];
let detailsMain = detailsHtml.match(/<main class="details-main">[\s\S]*?<\/main>/)[0].replace('<main ', '<main id="main-content" ');
let modals = detailsHtml.slice(detailsHtml.indexOf('<!-- Terms & Conditions Modal -->'), detailsHtml.indexOf('</body>'));
const fill = (html, id, expression) => html.replace(new RegExp(`(<(\\w+)[^>]*id="${id}"[^>]*>)[\\s\\S]*?(<\\/\\2>)`), `$1{${expression}}$3`);
detailsHeader = fill(detailsHeader,'headerTitle','item().title').replace('id="backBtn"','id="backBtn" onClick={back}').replace('id="shareBtn"','id="shareBtn" onClick={() => share.share(item().title)}');
detailsMain = detailsMain.replace(/<!-- Event Media Carousel -->[\s\S]*?<div class="details-content-wrapper">/, '<MediaCarousel slides={slides()} label={item().title} /><div class="details-content-wrapper">');
detailsMain = detailsMain.replace(/<div class="event-tags" id="eventTags">[\s\S]*?<\/div>/, '<div class="event-tags" id="eventTags"><For each={item().details.tags}>{(tag) => <span class="event-tag">{tag}</span>}</For></div>');
for (const [id,expression] of Object.entries({eventDate:'item().details.dateRange || item().date',eventTime:'item().details.time || "TBA"',eventDuration:'item().details.duration',eventAge:'item().details.ageLimit',eventLanguage:'item().details.languages',eventGenre:'item().details.genre',eventVenue:'item().details.venue'})) detailsMain=fill(detailsMain,id,expression);
detailsMain=detailsMain.replace('href=""\n                id="venueLink"','href={safeExternalUrl(item().details.venueLink)}\n                id="venueLink" style={{display:item().details.venueLink ? undefined : "none"}}');
detailsMain=fill(detailsMain,'aboutText','item().details.aboutEvent').replace('class="about-text" id="aboutText"','class={{"about-text":true,"is-collapsed":!expanded()}} id="aboutText" ref={(el)=>{about=el;}}');
detailsMain=detailsMain.replace('class="about-read-more" id="aboutReadMore"','class={{"about-read-more":true,"is-visible":readMore()}} id="aboutReadMore" onClick={()=>setExpanded(!expanded())}').replace('READ MORE\n            </button>','{expanded() ? "READ LESS" : "READ MORE"}\n            </button>');
detailsMain=detailsMain.replace(/>\s*READ MORE\s*<\/button>/, '>{expanded() ? "READ LESS" : "READ MORE"}</button>');
detailsMain=detailsMain.replace(/<a\s+href=""\s+id="venueLink"/, '<a href={safeExternalUrl(item().details.venueLink)} id="venueLink" style={{display:item().details.venueLink ? undefined : "none"}}');
detailsMain=detailsMain.replace(/id="artistsSection"\s*style="display: none"/, 'id="artistsSection" style={{display:!item().details.hideArtists && featuredArtists().length ? "block" : "none"}}');
detailsMain=detailsMain.replace(/<div class="artists-grid" id="eventArtists">[\s\S]*?<\/div>/, '<div class="artists-grid" id="eventArtists"><For each={featuredArtists()}>{(artist)=><a href={artist.link || "#"} class="event-artist-card" target="_blank" rel="noopener noreferrer"><div class={{"artist-img-wrapper":true,featured:defaultArtists().includes(artist.name)}}><img src={"/"+artist.image} alt={artist.name} loading="lazy" /></div><span class="artist-name">{artist.name}</span></a>}</For></div>');
detailsMain=detailsMain.replace(/id="stageLayoutSection"\s*style="display: none"/, 'id="stageLayoutSection" style={{display:item().details.stageLayoutImage ? "flex" : "none"}} onClick={()=>setModal("stage")}');
detailsMain=detailsMain.replace('id="termsSection"','id="termsSection" onClick={()=>setModal("terms")}');
detailsMain=fill(detailsMain,'priceFrom','bookings.price(item()) === 0 ? "Free Entry" : bookings.price(item()) ?? "TBA"');
detailsMain=detailsMain.replace('class="currency-symbol"','class="currency-symbol" style={{display:bookings.price(item())===0 ? "none" : undefined}}').replace('class="price-suffix"','class="price-suffix" style={{display:bookings.price(item())===0 ? "none" : undefined}}');
detailsMain=fill(detailsMain,'availability','availability()').replace('class="availability" id="availability"','class={"availability "+(bookings.canBook(item()) ? item().status === "filling-fast" ? "filling-fast" : "available" : item().status === "sold-out" ? "sold-out" : "closed")} id="availability"');
detailsMain=fill(detailsMain,'bookNowBtn','availability() === "Available" || availability() === "Filling Fast" ? "Book Now" : availability()').replace('class="book-now-btn" id="bookNowBtn"','class={{"book-now-btn":true,disabled:!bookings.canBook(item())}} id="bookNowBtn" disabled={!bookings.canBook(item())} onClick={book}');
detailsMain=detailsMain.replace('id="razorpayButtonContainer"','id="razorpayButtonContainer" style="display:none;"').replace(/<script\b[\s\S]*?<\/script>/g,'');
modals=modals.replace('class="modal-overlay" id="termsModal"','class={{"modal-overlay":true,active:modal()==="terms"}} id="termsModal" onClick={(e)=>{if(e.target===e.currentTarget)setModal(null);}}');
modals=modals.replace('class="modal-overlay" id="stageLayoutModal"','class={{"modal-overlay":true,active:modal()==="stage"}} id="stageLayoutModal" onClick={(e)=>{if(e.target===e.currentTarget)setModal(null);}}');
for(const id of ['closeTerms','gotItBtn','closeStageLayout'])modals=modals.replace(`id="${id}"`,`id="${id}" onClick={()=>setModal(null)}`);
modals=modals.replace('src=""\n            alt="Stage Layout"','src={item().details.stageLayoutImage ? "/"+item().details.stageLayoutImage : undefined}\n            alt="Stage Layout"');
await writeFile(join(target,'components/EventPage.tsx'), `import { createEffect,createMemo,createSignal,For,Show,onSettled } from 'solid-js';
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
 return <><OriginalStyles sheets={[globalCss,eventCss,pageCss]} /><Show when={event()} fallback={<NotFound message="Event not found" />}>{(item)=><><PageTitle title={item().title} />${jsx(detailsHeader)}${jsx(detailsMain)}${jsx(modals)}</>}</Show></>;
}
`);
console.log('Ported original detail markup, header, booking bar and bottom sheets.');
