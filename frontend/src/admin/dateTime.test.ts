import assert from "node:assert/strict";
import { test } from "node:test";
import {
  dateInputValue,
  dateLabel,
  istInputValue,
  istTimestamp,
  timeInputValue,
  timeLabel,
} from "./dateTime.ts";

test("calendar controls accept existing ordinal dates without treating ranges as one day", () => {
  assert.equal(dateInputValue("17th January 2026"), "2026-01-17");
  assert.equal(dateInputValue("31 July 2026"), "2026-07-31");
  assert.equal(dateLabel("2026-10-18"), "18 October 2026");
  assert.equal(dateInputValue("17th & 18th October 2026"), "");
  assert.equal(dateInputValue("Coming soon"), "");
});

test("invalid calendar dates cannot silently roll into a different month", () => {
  assert.equal(dateInputValue("2026-02-29"), "");
  assert.equal(dateInputValue("31 April 2026"), "");
  assert.equal(dateInputValue("2028-02-29"), "2028-02-29");
  assert.equal(dateLabel(""), "");
});

test("time pickers preserve the surrounding public display label", () => {
  assert.equal(timeInputValue("Gates Open at 4:00 PM"), "16:00");
  assert.equal(
    timeLabel("17:30", "Gates Open at 4:00 PM"),
    "Gates Open at 5:30 PM",
  );
  assert.equal(timeLabel("18:15", "6:00 PM onwards"), "6:15 PM onwards");
  assert.equal(timeInputValue("12:00 AM"), "00:00");
  assert.equal(timeInputValue("12:00 PM"), "12:00");
  assert.equal(timeInputValue("25:00"), "");
  assert.equal(timeLabel(""), "");
});

test("IST datetime conversion preserves instants across date boundaries and offsets", () => {
  assert.equal(istInputValue("2026-10-16T21:30:15Z"), "2026-10-17T03:00:15");
  assert.equal(
    istInputValue("2026-07-11T23:11:00+05:30"),
    "2026-07-11T23:11:00",
  );
  const input = istInputValue("2026-10-17T06:45:22-04:00");
  assert.equal(
    Date.parse(istTimestamp(input)),
    Date.parse("2026-10-17T06:45:22-04:00"),
  );
  assert.equal(istTimestamp("2026-10-17T18:00"), "2026-10-17T18:00:00+05:30");
  assert.equal(istInputValue("invalid"), "");
  assert.equal(istTimestamp(""), "");
});
