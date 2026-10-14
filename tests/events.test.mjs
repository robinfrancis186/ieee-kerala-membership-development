import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { eventExamples, filterEventExamples } from "../events.mjs";

test("event filters return examples for each organizer scope", () => {
  assert.equal(filterEventExamples(eventExamples).length, eventExamples.length);
  assert.ok(filterEventExamples(eventExamples, "student-branch").every((event) => event.categories.includes("student-branch")));
  assert.ok(filterEventExamples(eventExamples, "society").every((event) => event.categories.includes("society")));
  assert.ok(filterEventExamples(eventExamples, "kerala-wide").every((event) => event.categories.includes("kerala-wide")));
  assert.equal(filterEventExamples(eventExamples, "unknown").length, 0);
});

test("every event example includes a useful takeaway and official HTTPS source", () => {
  assert.ok(eventExamples.length >= 8);
  assert.ok(eventExamples.every((event) => event.title && event.organizers && event.summary && event.takeaway));
  assert.ok(eventExamples.every((event) => new URL(event.source).protocol === "https:"));
});

test("deck photos are attached only to the matching documented event and load as WebP", async () => {
  const aksc2018 = eventExamples.find((event) => event.id === "aksc-2018");
  const aksc2023 = eventExamples.find((event) => event.id === "aksc-2023");
  const yess2025 = eventExamples.find((event) => event.id === "yess-2025");

  assert.equal(aksc2018.photo, undefined);
  assert.equal(aksc2023.photo.src, "/images/events/aksc-2023.webp");
  assert.equal(yess2025.photo.src, "/images/events/yess-2025.webp");

  for (const event of [aksc2023, yess2025]) {
    assert.ok(event.photo.alt);
    assert.ok(event.photo.credit);
    const image = await readFile(new URL(`../${event.photo.src.slice(1)}`, import.meta.url));
    assert.equal(image.toString("ascii", 0, 4), "RIFF");
    assert.equal(image.toString("ascii", 8, 12), "WEBP");
  }
});
