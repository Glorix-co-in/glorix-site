## INDEX PAGE

1. Home
2. About (scroll) -> text copy from original nd design be from
   https://orioleentertainment.com/
3. Gallery (scroll)
   inspired from https://orioleentertainment.com/
4. Bookings (link in mobile nav)
5. testimonials (dont want seperate pages cut and paste on main index)
6. artists
7. teams (about page se our team starting 3 copy img and name and designation same as artists) -> clickable link card
8. contact
9. Footer page

## File Organization

### Core Files (Used)

- [index.html](index.html): Main landing page containing Home, About, Testimonials, Contact, and Artists sections.
- [bookings.html](bookings.html): Page for event bookings and inquiries.
- [style.css](style.css): Global stylesheet for all pages.
- [script.js](script.js): Main JavaScript file handling navbar toggles, carousels, testimonial sliders, music player, and dynamic artist loading.

### Data (in `data/` folder)

- [data/artists.json](data/artists.json): JSON data source for the dynamic Artists section.
- [data/carousel.json](data/carousel.json): JSON data source for the Hero Carousel.
- [data/testimonials.json](data/testimonials.json): JSON data source for the Testimonials section.

### Assets (Used - in `assets/` folder)

## DONE

BOOK NOW size increase in desktop view
The X Factor In Everything! font change to times new roman
Hamburger lines animate to form a X when toggled (using GSAP)
Artists and team seperate page par (main page se remove)
colloboration name and logo in a box put in marquee
gap decrease overall -> spaces decrease fully
header spacing issue fix i want equal spacing on both sides of the logo

<!-- 30/12/2025 -->

gallery ka new page added
about us centered on laptop
hide the scrollbar when phone mobile nav is opened
TEAMS wala data update
nav mai active state for gallery and contact and home fix
Laptop Booking wala photo
Artists json still has some fixes with LINKs insta ke

Gallery -> Bali ki shows, seasons ki shows -> more priority photos
Bali ki photo replace in artists from new drive link

<!-- 31/12/2025 -->

home poster loading fix
BOOKING PAGE CARD SIZE HEIGHT SHORT HO JAYE more small
EMAIL US BOX MAI HO JAISE PHELE THA
GALLERY MAI BAKI IMAGES ADD KARDO

## TODO

## THINK FOR FUTURE

RAZORPAY SETUP
BACKEND INTEGRATION FOR TICKET BOOKING

### Razorpay Integration Logic (Testing Phase)

Currently testing an invisible overlay method for the Razorpay Payment Button.
The container is styled in `details.css` to be an invisible overlay (opacity 0) that sits
directly on top of the "Book Now" button.
When a user clicks "Book Now", they are actually clicking the hidden Razorpay button.
This is a temporary solution until a full backend/API integration is ready.

**Code removed from details.js (for future reference):**

```javascript
} else if (event.id === "gulabi-kafan") {
  // Test mode for Gulabi Kafan: Use the invisible Razorpay Button overlay
  bookNowBtn.textContent = "Book Now";
  bookNowBtn.disabled = false;
  bookNowBtn.classList.remove("disabled");
  bookNowBtn.style.display = "block";
  if (rzpContainer) rzpContainer.style.display = "block";
}
```
