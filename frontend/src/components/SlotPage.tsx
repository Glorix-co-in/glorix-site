import { createMemo, createSignal, For, Show } from 'solid-js';
import { useNavigate, useSearchParams } from '@solidjs/router';
import { useBookings } from '../bookings/useBookings';
import { safeExternalUrl } from '../bookings/rules';
import type { BookingOption } from '../bookings/types';
import PageTitle from './PageTitle';
import NotFound from './NotFound';
import OriginalStyles from './OriginalStyles';
import globalCss from '../styles/original/global.css?raw';
import pageCss from '../styles/original/select-slot.css?raw';
import { useShare } from '../lib/useShare';
export default function SlotPage(props: { id?: string }) {
  const bookings=useBookings();const navigate=useNavigate();const [search,setSearch]=useSearchParams();
  const [dateChoice,setDateChoice]=createSignal<string|null>(null,{name:'slot-date'});
  const [timeChoice,setTimeChoice]=createSignal<BookingOption|null>(null,{name:'slot-time'});
  const event=createMemo(()=>bookings.getEvent(props.id),{name:'slot-event'});
  const options=createMemo(()=>event()?.bookingOptions || [],{name:'booking-options'});
  const dates=createMemo(()=>[...new Set(options().map(option=>option.date))],{name:'slot-dates'});
  const selectedDate=createMemo(()=>dates().includes(dateChoice() || '') ? dateChoice() : options().find(option=>option.detailsEventId===search.slot)?.date,{name:'selected-date'});
  const times=createMemo(()=>options().filter(option=>option.date===selectedDate()),{name:'slot-times'});
  const available=(option:BookingOption)=>Boolean(event()&&bookings.canBook(event()!)&&bookings.slotAvailable(option));
  const selectedTime=createMemo(()=>{const selected=timeChoice();return selected&&times().includes(selected)?selected:times().length===1&&available(times()[0])?times()[0]:undefined;},{name:'selected-time'});
  const dateStatus=(date:string)=>{const list=options().filter(option=>option.date===date);const enabled=list.filter(available);return enabled.length?enabled.some(option=>option.status!=='filling-fast')?'available':'filling-fast':list.every(option=>option.status==='sold-out')?'sold-out':'closed';};
  const selectDate=(date:string)=>{setDateChoice(date);setTimeChoice(null);setSearch({slot:options().find(option=>option.date===date)?.detailsEventId});};
  const formatDate=(date:string)=>{const d=new Date(date.replace(/(\d+)(st|nd|rd|th)/,'$1'));return Number.isFinite(d.getTime())?['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]+' '+String(d.getDate()).padStart(2,'0')+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]:date;};
  const confirm=()=>{const option=selectedTime();if(!option||!available(option))return;if(option.detailsEventId)navigate('/events/'+encodeURIComponent(option.detailsEventId));else{const url=safeExternalUrl(option.link);if(url)window.open(url,'_blank','noopener,noreferrer');}};
  const share=useShare();
  return <><OriginalStyles sheets={[globalCss,pageCss]} /><Show when={event()} fallback={<NotFound message="Event not found" />}>{(item)=><>
    <PageTitle title={item().title} />
    <header class="select-slot-header"><button class="back-btn" id="backBtn" aria-label="Go back" onClick={()=>window.history.length>1?window.history.back():navigate('/bookings')}><i class="fas fa-chevron-left" /></button><h1 class="header-title" id="headerTitle">{item().title}</h1><button class="share-btn" id="shareBtn" aria-label="Share event" onClick={()=>share.share(item().title)}><i class="fas fa-share-alt" /></button></header>
    <main class="select-slot-main" id="main-content">
      <div class="stepper"><div class="step active"><span class="step-num">1</span><span class="step-label">Date &amp; Time</span></div><i class="fas fa-chevron-right step-sep" /><div class="step"><span class="step-num">2</span><span class="step-label">Payment</span></div><i class="fas fa-chevron-right step-sep" /><div class="step"><span class="step-num">3</span><span class="step-label">Ticket</span></div></div>
      <div class="event-mini-info"><img src={'/'+item().image} alt={item().title} id="eventThumb" class="event-thumb" /><div class="event-text"><h2 id="eventTitle">{item().title}</h2><p id="eventVenue">{item().details.venue}</p></div></div>
      <div class="legend-container"><div class="legend-item"><span class="dot available" /> Available</div><div class="legend-item"><span class="dot filling-fast" /> Filling Fast</div><div class="legend-item"><span class="dot sold-out" /> Sold out</div></div>
      <div class="selection-card"><Show when={bookings.canBook(item())} fallback={<p class="booking-opening-notice">{bookings.hasOpened(item())?'Bookings are closed for this event.':'Bookings open '+item().details.bookingOpensAtISO+' IST.'}</p>}>
        <div class="selection-container"><section class="selection-section" id="dateSection"><h3 class="section-title">Select Date</h3><div class="slots-grid" id="dateSlots"><For each={dates()}>{(date)=><div class={['slot-card',dateStatus(date),{selected:selectedDate()===date}]} role="button" tabindex="0" onClick={()=>{if(dateStatus(date)!=='closed'&&dateStatus(date)!=='sold-out')selectDate(date);}}><span class="slot-date-full">{formatDate(date)}</span></div>}</For></div></section>
        <section class="selection-section" id="timeSection" style={{display:selectedDate()?undefined:'none'}}><h3 class="section-title">Select Time</h3><div class="slots-grid" id="timeSlots"><For each={times()}>{(option)=><div class={['slot-card',option.status,{closed:!available(option),selected:selectedTime()===option}]} role="button" tabindex="0" aria-disabled={available(option)?'false':'true'} onClick={()=>{if(available(option))setTimeChoice(option);}}><span class="slot-time">{option.time||'Time TBA'}</span><Show when={!available(option)}><span class="slot-status">{option.status==='sold-out'?'Sold Out':'Unavailable'}</span></Show></div>}</For></div></section></div>
      </Show></div>
      <div class="sticky-bottom-bar"><button class="confirm-btn" id="confirmBtn" disabled={!selectedTime()||!bookings.canBook(item())} onClick={confirm}>Continue to Booking</button></div>
    </main>
  </>}</Show></>;
}
