// Runs the actual generator and checks its output is complete and internally
// consistent — catches a PAGES row that breaks the build, or a page that
// silently isn't wired into the sitemap.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PAGES } from "../pages.mjs";
import * as C from "../site.config.mjs";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

test("engine/build.mjs runs to completion", () => {
  const out = execFileSync("node", ["engine/build.mjs"], { cwd: ROOT, encoding: "utf8" });
  assert.match(out, /Built:/);
});

test("every page slug has a generated HTML file", () => {
  for (const p of PAGES) {
    const file = join(ROOT, C.COLLECTION_DIR, `${p.slug}.html`);
    assert.ok(existsSync(file), `missing generated file for ${p.slug}`);
  }
});

test("sitemap.xml lists every page slug exactly once", () => {
  const sitemap = readFileSync(join(ROOT, "sitemap.xml"), "utf8");
  for (const p of PAGES) {
    const matches = sitemap.match(new RegExp(`/${C.COLLECTION_DIR}/${p.slug}<`, "g")) || [];
    assert.equal(matches.length, 1, `expected exactly one sitemap entry for ${p.slug}, found ${matches.length}`);
  }
});

test("generated page contains its own title and FAQ text", () => {
  const p = PAGES[0];
  const html = readFileSync(join(ROOT, C.COLLECTION_DIR, `${p.slug}.html`), "utf8");
  assert.ok(html.includes(p.title), "generated page missing its own <title>/heading text");
  assert.ok(html.includes(p.faq[0].q), "generated page missing its first FAQ question");
});

test("manifest.json is valid JSON with the current tool count, not a stale hand-typed one", () => {
  const manifest = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8"));
  assert.equal(manifest.name, C.NAME);
  assert.equal(manifest.start_url, "/");
  assert.ok(manifest.icons.length > 0, "manifest should list at least one icon");
  assert.ok(manifest.description.includes(String(PAGES.length)), "manifest description should mention the current tool count");
});

test("every generated page links the manifest and the app registers a service worker", () => {
  const p = PAGES[0];
  const html = readFileSync(join(ROOT, C.COLLECTION_DIR, `${p.slug}.html`), "utf8");
  assert.match(html, /<link rel="manifest" href="[^"]*manifest\.json">/);
  const appJs = readFileSync(join(ROOT, "assets", "app.js"), "utf8");
  assert.match(appJs, /serviceWorker/);
});

// ── Layout architecture ────────────────────────────────────────────────────
// The July 2026 redesign replaced a single centred `main.wrap` column — hero
// on top, sections stacked below, on all 74 pages — with two full-bleed
// shells. These tests exist because the 92 tests before them all checked
// behaviour and content, none checked structure, so nothing would have caught
// a page quietly reverting to the old skeleton.

test("every tool slug is filed under exactly one index heading", async () => {
  const { GROUPS } = await import("../pages.mjs");
  const filed = GROUPS.flatMap(([, slugs]) => slugs);
  const dupes = filed.filter((s, i) => filed.indexOf(s) !== i);
  assert.deepEqual(dupes, [], "a slug appears under more than one heading");
  for (const p of PAGES) {
    assert.ok(filed.includes(p.slug), `${p.slug} is not filed in GROUPS — it would vanish from the index rail`);
  }
  for (const slug of filed) {
    assert.ok(PAGES.some((p) => p.slug === slug), `GROUPS lists "${slug}", which is not a real page`);
  }
});

test("tool pages use the work shell, with the tool above the supporting prose", () => {
  const html = readFileSync(join(ROOT, C.COLLECTION_DIR, "base64-encode.html"), "utf8");
  assert.match(html, /class="sheet sheet--work/, "tool pages should use the work shell");
  assert.ok(
    html.indexOf('class="tool"') < html.indexOf('class="measure"'),
    "the tool must come before the supporting prose in source order",
  );
});

test("the index rail links every tool from every tool page", () => {
  for (const slug of ["word-counter", "rot13-cipher", "bold-text-generator"]) {
    const html = readFileSync(join(ROOT, C.COLLECTION_DIR, `${slug}.html`), "utf8");
    const rail = html.slice(html.indexOf('<nav class="index"'), html.indexOf("</nav>", html.indexOf('<nav class="index"')));
    for (const p of PAGES) {
      assert.ok(rail.includes(`/${C.COLLECTION_DIR}/${p.slug}"`), `${slug}'s rail is missing ${p.slug}`);
    }
    assert.match(html, new RegExp(`href="/${C.COLLECTION_DIR}/${slug}" aria-current="page"`),
      `${slug} should be marked as the current page in its own rail`);
  }
});

test("articles use the read shell and get an on-page contents in the margin", () => {
  const html = readFileSync(join(ROOT, "guides", "base64-explained.html"), "utf8");
  assert.match(html, /class="sheet sheet--read/);
  assert.match(html, /class="note note--contents"/, "an article should carry an on-page contents");
  // Every contents anchor must resolve to a heading id that exists.
  const contents = html.slice(html.indexOf('note--contents'), html.indexOf("</div>", html.indexOf("note--contents")));
  const anchors = [...contents.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  assert.ok(anchors.length >= 2, "contents should list at least two sections");
  for (const id of anchors) {
    assert.ok(html.includes(`id="${id}"`), `contents links #${id}, which no heading defines`);
  }
});

test("no page falls back to the old centred-column skeleton", () => {
  const files = [
    "index.html", "about.html", "guides.html", "alternatives.html",
    join(C.COLLECTION_DIR, "word-counter.html"),
    join("guides", "hashing-explained.html"),
  ];
  for (const f of files) {
    const html = readFileSync(join(ROOT, f), "utf8");
    assert.doesNotMatch(html, /<main class="wrap"/, `${f} still uses the old centred main.wrap`);
    assert.doesNotMatch(html, /class="hero/, `${f} still uses the old hero block`);
    assert.match(html, /class="sheet sheet--(work|read)/, `${f} declares no layout shell`);
  }
});
