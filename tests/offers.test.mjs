import test from "node:test";
import assert from "node:assert/strict";
import { IEEE_DAY, ieeeDayOffers, filterOffers, ieeeDayStatus } from "../offers.mjs";

test("every IEEE Day offer has at least one deal with a promo code", () => {
  assert.equal(ieeeDayOffers.length, 17);
  assert.ok(ieeeDayOffers.every((offer) => offer.society && offer.deals.length > 0));
  const codes = ieeeDayOffers.flatMap((offer) => offer.deals.map((deal) => deal.code));
  assert.ok(codes.every((code) => /^[A-Z0-9-]+$/.test(code)));
  assert.equal(new Set(codes).size, codes.length);
});

test("offer filters match the deal audience and kind", () => {
  assert.equal(filterOffers(ieeeDayOffers).length, ieeeDayOffers.length);
  assert.ok(filterOffers(ieeeDayOffers, "student-free").every((offer) => offer.deals.some((deal) => deal.kind === "free" && ["student", "both"].includes(deal.audience))));
  assert.ok(filterOffers(ieeeDayOffers, "student-free").some((offer) => offer.id === "computer-society"));
  assert.ok(!filterOffers(ieeeDayOffers, "student-free").some((offer) => offer.id === "pes"));
  assert.ok(filterOffers(ieeeDayOffers, "discount").every((offer) => offer.deals.some((deal) => deal.kind === "discount")));
});

test("offer window opens on 4 October and closes after 17 October", () => {
  assert.equal(IEEE_DAY.opens, "2026-10-04");
  assert.equal(ieeeDayStatus(new Date("2026-10-03T23:00:00")).state, "upcoming");
  assert.deepEqual(ieeeDayStatus(new Date("2026-10-14T12:00:00")), { state: "active", daysLeft: 4 });
  assert.equal(ieeeDayStatus(new Date("2026-10-17T22:00:00")).daysLeft, 1);
  assert.equal(ieeeDayStatus(new Date("2026-10-18T00:30:00")).state, "ended");
});
