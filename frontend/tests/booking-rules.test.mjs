import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bookingUrl, canBook, eventDate, eventHref, hasBookingEnded, isUpcoming, isVisible, slotAvailable } from '../src/bookings/rules.ts';

const now = Date.parse('2026-10-15T12:00:00+05:30');
const event = (overrides = {}) => ({ id: 'example', title: 'Example', date: '17th & 18th October 2026', status: 'available', image: 'poster.avif', bookingLink: 'https://tickets.example/event', details: {}, ...overrides });

test('opening gate excludes an event until its opening timestamp', () => {
  const item = event({ details: { bookingOpensAtISO: '2026-10-16T12:00:00+05:30' } });
  assert.equal(isVisible(item, now), false);
  assert.equal(canBook(item, now), false);
  assert.equal(isVisible(item, now + 86400000), true);
});
test('hidden date-specific events remain bookable through their parent', () => {
  const child = event({ hiddenFromBookings: true });
  assert.equal(isVisible(child, now), false);
  assert.equal(slotAvailable({ detailsEventId: child.id, status: 'available' }, [child], now), true);
});
test('explicit booking end closes a listing even if its status is active', () => {
  const item = event({ details: { bookingEndsAtISO: '2026-10-14T12:00:00+05:30' } });
  assert.equal(hasBookingEnded(item, now), true);
  assert.equal(isUpcoming(item, now), false);
  assert.equal(bookingUrl(item, now), undefined);
});
test('sold-out remains listed but has no actionable booking URL', () => {
  const item = event({ status: 'sold-out' });
  assert.equal(isUpcoming(item, now), true);
  assert.equal(bookingUrl(item, now), undefined);
});
test('null strings and unsafe ticket URLs cannot become checkout links', () => {
  for (const bookingLink of ['null', null, 'javascript:alert(1)', 'http://tickets.example']) assert.equal(bookingUrl(event({ bookingLink }), now), undefined);
});
test('slot status and child availability both gate confirmation', () => {
  const child = event({ status: 'closed' });
  assert.equal(slotAvailable({ detailsEventId: child.id, status: 'available' }, [child], now), false);
  assert.equal(slotAvailable({ detailsEventId: 'missing', status: 'available' }, [], now), false);
  assert.equal(slotAvailable({ link: 'https://tickets.example', status: 'sold-out' }, [], now), false);
});
test('date ranges retain their month and year for ordering', () => {
  assert.equal(eventDate(event()), Date.parse('17 October 2026'));
});
test('event links choose routed details or date selection', () => {
  assert.equal(eventHref(event()), '/events/example');
  assert.equal(eventHref(event({ bookingFlow: 'date-first' })), '/events/example/slots');
});
