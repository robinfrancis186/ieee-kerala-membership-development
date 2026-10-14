import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { opportunities } from "../opportunities.mjs";
import { eventExamples } from "../events.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("home page links to dedicated IEEE Day, funding, and event guides", async () => {
  const html = await read("../index.html");
  assert.match(html, /href="\/ieee-day-2026\/"/);
  assert.match(html, /href="\/funding\/"/);
  assert.match(html, /href="\/events\/"/);
  assert.doesNotMatch(html, /id="(?:ieee-day|opportunities|events)"/);
  assert.doesNotMatch(html.match(/<header class="site-header">[\s\S]*?<\/header>/)?.[0] ?? "", /class="brand-mark"/);
});

test("each dedicated page keeps its content and has a crawlable canonical route", async () => {
  const [offers, funding, events, sitemap] = await Promise.all([
    read("../ieee-day-2026/index.html"),
    read("../funding/index.html"),
    read("../events/index.html"),
    read("../sitemap.xml"),
  ]);
  assert.match(offers, /id="ieee-day"/);
  assert.match(offers, /rel="canonical" href="https:\/\/ieee-kerala-membership-development\.vercel\.app\/ieee-day-2026\/"/);
  assert.match(funding, /id="dues"/);
  assert.match(funding, /id="opportunities"/);
  assert.match(funding, /id="humanitarian"/);
  assert.match(events, /id="events"/);
  assert.match(events, /id="branch"/);
  for (const route of ["ieee-day-2026", "funding", "events"]) assert.ok(sitemap.includes(`/${route}/`));
});

test("the rebate page no longer asks for core dues or shows the 12% pool estimate", async () => {
  const [funding, app] = await Promise.all([read("../funding/index.html"), read("../app.mjs")]);
  assert.doesNotMatch(funding, /Optional: IEEE core dues paid|Add core dues to see the illustrative 12% MGA pool share/);
  assert.doesNotMatch(app, /core-dues|pool-result|updatePoolEstimate/);
  assert.match(funding, /id="branch-members"/);
  assert.match(app, /branchMembers\.addEventListener\("input", updateRebateEstimate\)/);
});

test("funding additions and recent event inspirations link to primary IEEE sources", () => {
  for (const id of ["comsoc-sbc-funding-2026", "comsoc-twin-chapter-2026"]) {
    const item = opportunities.find((entry) => entry.id === id);
    assert.ok(item, `missing funding entry ${id}`);
    assert.match(item.source, /^https:\/\//);
  }
  for (const id of ["pes-sbc-slt-meetup-2026", "catalyst-lbscek-2026", "sdlp-marian-llm-2026"]) {
    const item = eventExamples.find((entry) => entry.id === id);
    assert.ok(item, `missing event example ${id}`);
    assert.match(item.source, /^https:\/\/events\.vtools\.ieee\.org\//);
  }
});
