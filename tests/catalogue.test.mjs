import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, filterCatalogue } from "../catalogue.mjs";
import { logoFor, abbreviationFor } from "../logos.mjs";
import { opportunities } from "../opportunities.mjs";

test("catalogue listings link to the official IEEE Students site", () => {
  assert.equal(catalogue.length, 80);
  assert.ok(catalogue.every((item) => item.title && item.unit && item.type));
  assert.ok(catalogue.every((item) => new URL(item.link).hostname === "students.ieee.org"));
  assert.equal(new Set(catalogue.map((item) => item.link)).size, catalogue.length);
});

test("catalogue filters combine type, unit, and search", () => {
  const travel = filterCatalogue(catalogue, { type: "Travel grant" });
  assert.ok(travel.length > 0 && travel.every((item) => item.type === "Travel grant"));
  const pels = filterCatalogue(catalogue, { unit: "IEEE Power Electronics Society" });
  assert.ok(pels.length >= 5 && pels.every((item) => item.unit === "IEEE Power Electronics Society"));
  assert.ok(filterCatalogue(catalogue, { query: "  merwin " }).some((item) => item.title.includes("Merwin")));
  assert.equal(filterCatalogue(catalogue, { type: "Scholarship", query: "not a real listing" }).length, 0);
});

test("logos resolve for common units and fall back to abbreviations", () => {
  assert.equal(logoFor("IEEE Computer Society Kerala Chapter").src, "/logos/computer-society.png");
  assert.equal(logoFor("IEEE Power & Energy Society").src, "/logos/pes.png");
  assert.equal(logoFor("IEEE Power Electronics Society").src, "/logos/pels.png");
  assert.equal(logoFor("IEEE Industrial Electronics Society"), null);
  assert.equal(abbreviationFor("IEEE Power Electronics Society"), "PELS");
  assert.equal(abbreviationFor("IEEE Nuclear & Plasma Sciences Society"), "NPSS");
  assert.ok(opportunities.every((item) => logoFor(item.organization) || abbreviationFor(item.organization)));
});
