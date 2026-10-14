import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const illustrations = [
  ["kerala-students", "../index.html", "intro-art", "Kerala engineering students"],
  ["global-community", "../index.html", "chapter-art", "global technical community"],
  ["membership-card", "../index.html", "chapter-art", "IEEE membership card"],
  ["funding-growth", "../funding/index.html", "subpage-hero-art", "seedling growing into a rocket"],
  ["community-solar", "../funding/index.html", "chapter-art", "solar panels"],
  ["branch-planning", "../events/index.html", "subpage-hero-art", "planning an activity around a board"],
];

test("six illustrations are present as WebP images with accessible placements", async () => {
  for (const [name, page, className, altText] of illustrations) {
    const html = await readFile(new URL(page, import.meta.url), "utf8");
    const image = await readFile(new URL(`../images/illustrations/${name}.webp`, import.meta.url));
    assert.equal(image.toString("ascii", 0, 4), "RIFF");
    assert.equal(image.toString("ascii", 8, 12), "WEBP");
    assert.equal(image.toString("ascii", 12, 16), "VP8X");
    assert.ok(image[20] & 0x10, `${name} should preserve transparency`);
    assert.match(html, new RegExp(`class="${className}" src="/images/illustrations/${name}\\.webp" alt="[^"]*${altText}`));
  }
});
