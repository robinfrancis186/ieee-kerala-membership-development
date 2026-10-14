import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("opening session guide includes a scannable live-site QR code", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const qr = await readFile(new URL("../images/follow-session-qr.png", import.meta.url));

  assert.match(html, /class="follow-qr" href="https:\/\/ieee-kerala-membership-development\.vercel\.app\//);
  assert.match(html, /src="\/images\/follow-session-qr\.png" alt="QR code linking to the IEEE Kerala Membership Development guide"/);
  assert.deepEqual([...qr.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
});
