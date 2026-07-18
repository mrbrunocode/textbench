// Content-integrity checks for the programmatic-SEO page collection.
// Duplicated title/description/intro text across pages is the #1 reason
// these pages get filtered from Google's index instead of ranked (see
// boring-app-factory/docs/seo-manual-steps.md) — these tests catch that
// regression class, plus basic structural mistakes (bad slugs, missing FAQ).
import { test } from "node:test";
import assert from "node:assert/strict";
import { PAGES } from "../pages.mjs";

test("every page has a unique slug", () => {
  const slugs = PAGES.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "duplicate slug found");
});

test("every slug is URL-safe (lowercase, digits, hyphens only)", () => {
  for (const p of PAGES) {
    assert.match(p.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `bad slug: ${p.slug}`);
  }
});

test("titles are unique across the collection", () => {
  const titles = PAGES.map((p) => p.title);
  assert.equal(new Set(titles).size, titles.length, "duplicate title found");
});

test("descriptions are unique across the collection", () => {
  const descriptions = PAGES.map((p) => p.description);
  assert.equal(new Set(descriptions).size, descriptions.length, "duplicate description found");
});

test("description stays within a reasonable meta-description length", () => {
  for (const p of PAGES) {
    assert.ok(p.description.length <= 200, `${p.slug} description is ${p.description.length} chars, too long for a meta description`);
  }
});

test("intros are unique across the collection", () => {
  const intros = PAGES.map((p) => p.intro);
  assert.equal(new Set(intros).size, intros.length, "duplicate intro found");
});

test("every page has a non-empty FAQ with 2+ entries", () => {
  for (const p of PAGES) {
    assert.ok(Array.isArray(p.faq) && p.faq.length >= 2, `${p.slug} needs at least 2 FAQ entries`);
    for (const { q, a } of p.faq) {
      assert.ok(q && q.trim().length > 0, `${p.slug} has an empty FAQ question`);
      assert.ok(a && a.trim().length > 0, `${p.slug} has an empty FAQ answer`);
    }
  }
});

test("every page's transform key exists in the shared TRANSFORMS table", async () => {
  const { loadTransforms } = await import("./helpers/load-app.mjs");
  loadTransforms(); // just to ensure app.js parses; TRANSFORMS itself isn't exported
  // TRANSFORMS keys are the shape/transform identifiers used in pages.mjs — cross-check
  // against the raw source since the object itself isn't part of the test export surface.
  const { readFileSync } = await import("node:fs");
  const { fileURLToPath } = await import("node:url");
  const { dirname, join } = await import("node:path");
  const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "app.js"), "utf8");
  for (const p of PAGES) {
    assert.ok(src.includes(`"${p.transform}"`), `${p.slug} references unknown transform key "${p.transform}"`);
  }
});
