import { createEffect, createMemo, createSignal, onSettled } from 'solid-js';
import { useBookings } from '../bookings/useBookings';
import { useClock } from '../lib/useClock';
export default function HomeAnnouncement() {
const bookings=useBookings(); const now=useClock(); const event=createMemo(()=>bookings.getEvent('glorix-dandiya-night-2026'),{name:'announcement-event'});
const [open,setOpen]=createSignal(false,{name:'announcement-open'}); let dialog!:HTMLDialogElement;
const remaining=createMemo(()=>Math.max(0,Date.parse(event()?.details.eventStartsAtISO || '')-now()) || 0,{name:'announcement-countdown'});
createEffect(open,(value)=>{if(value&&!dialog.open)dialog.showModal();if(!value&&dialog.open)dialog.close();},{name:'announcement-visibility'});
onSettled(()=>{const item=event();if(!item||!bookings.canBook(item))return;try{if(sessionStorage.getItem('announcement:'+item.id))return;sessionStorage.setItem('announcement:'+item.id,'seen');}catch{}setOpen(true);});
return (<dialog
      id="eventPopup" ref={(el) => { dialog = el; }} onClose={() => setOpen(false)} onCancel={() => setOpen(false)}
      class="event-popup"
      aria-labelledby="eventPopupTitle"
    >
      <div class="event-popup__content">
        <button
          class="event-popup__close"
          id="closeEventPopup" onClick={() => setOpen(false)}
          type="button"
          aria-label="Close event announcement"
        >
          <i class="fas fa-times"></i>
        </button>

        <div class="event-popup__left">
          <picture>
            <source
              srcset="/assets/events/glorix_dandiya_night_2026_landscape.avif"
              media="(max-width: 640px)"
            />
            <img
              src="/assets/events/glorix_dandiya_night_2026_portrait.avif"
              alt="Glorix Dandiya Night 2026"
              class="event-popup__image"
            />
          </picture>
        </div>

        <div class="event-popup__right">
          <h2 class="event-popup__title" id="eventPopupTitle">
            <span>GLORIX</span><br /><span
              class="event-popup__title-highlight"
              >DANDIYA NIGHT 2026</span
            >
          </h2>

          <p class="event-popup__description">
            Celebrate with live DJxDhol, Garba, and authentic Indian food across
            two nights in Faridabad. Choose your date to see that night's venue.
          </p>

          <div class="event-popup__meta">
            <div class="event-popup__meta-item">
              <i class="fas fa-calendar"></i>
              <div class="event-popup__meta-copy">
                <div class="event-popup__meta-label">17th &amp; 18th October 2026</div>
              </div>
              <div class="event-popup__meta-time">6:00 PM onwards</div>
            </div>

            <div class="event-popup__meta-item">
              <i class="fas fa-map-marker-alt"></i>
              <div class="event-popup__meta-copy">
                <div class="event-popup__meta-label">
                  17 Oct: Immense Residency, Sec-28<br />18 Oct: Rosewood Grand Hotel, Sec-34
                </div>
              </div>
            </div>

            <div class="event-popup__meta-item">
              <i class="fas fa-clock"></i>
              <div class="event-popup__meta-copy">
                <div class="event-popup__meta-label" id="bookingOpenLabel">
                  Starting price
                </div>
              </div>
              <div class="event-popup__meta-highlight" id="bookingOpenDate">
                {event() ? "₹" + bookings.price(event()!) : ""}
              </div>
            </div>
          </div>

          <div class="event-popup__countdown-container">
            <div class="event-popup__countdown-icon">
              <i class="fas fa-bolt"></i>
            </div>
            <div class="event-popup__countdown-copy">
              <div class="event-popup__countdown-label">DANDIYA NIGHT COUNTDOWN</div>
              <div
                class="event-popup__countdown-label-sub"
                id="countdownLabelSub"
              >
                Until the first night
              </div>
            </div>
            <div class="event-popup__countdown" id="eventCountdown">
              <div class="event-popup__countdown-item">
                <div class="event-popup__countdown-value" id="countdownDays">{String(Math.floor(remaining() / 86400000)).padStart(2, '0')}</div>
                <div class="event-popup__countdown-label-small">DAYS</div>
              </div>
              <div class="event-popup__countdown-item">
                <div class="event-popup__countdown-value" id="countdownHours">{String(Math.floor(remaining() / 3600000) % 24).padStart(2, '0')}</div>
                <div class="event-popup__countdown-label-small">HRS</div>
              </div>
              <div class="event-popup__countdown-item">
                <div class="event-popup__countdown-value" id="countdownMins">{String(Math.floor(remaining() / 60000) % 60).padStart(2, '0')}</div>
                <div class="event-popup__countdown-label-small">MINS</div>
              </div>
              <div class="event-popup__countdown-item">
                <div class="event-popup__countdown-value" id="countdownSecs">{String(Math.floor(remaining() / 1000) % 60).padStart(2, '0')}</div>
                <div class="event-popup__countdown-label-small">SECS</div>
              </div>
            </div>
          </div>

          <div class="event-popup__buttons">
            <a
              href="/events/glorix-dandiya-night-2026/slots"
              id="eventPopupBookBtn"
              class="event-popup__btn event-popup__btn--primary"
            >
              <span id="eventPopupBookBtnText">BOOK NOW</span>
              <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    </dialog>);
}
