import test from "node:test";
import assert from "node:assert/strict";
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
