// Regression tests for the split-by-audience affiliate card
// (engine/template.mjs affiliateSlot + pages.mjs affiliateAudience). The
// 43-tool spread is genuinely two audiences (writers vs. developers), so a
// wrong classification here means a UUID-generator page recommending
// Grammarly, or a word-counter page recommending a VPN — plausible but odd.
import { test } from "node:test";
import assert from "node:assert/strict";
import { affiliateSlot } from "../engine/template.mjs";
import { affiliateAudience, TRANSFORM_GROUPS } from "../pages.mjs";

const WRITING_CFG = { name: "Grammarly", url: "https://grammarly.com/", blurb: "Catches what a formatter can't." };
const DEV_CFG = { name: "NordVPN", url: "https://nordvpn.com/", blurb: "Keep your whole connection private." };
const EMPTY = { name: "", url: "", blurb: "" };

test("renders nothing when the relevant audience's config is empty", () => {
  assert.equal(affiliateSlot("writing", EMPTY), "");
  assert.equal(affiliateSlot("dev", EMPTY), "");
});

test("writing audience renders the writing partner, dev audience renders the dev partner", () => {
  const writingHtml = affiliateSlot("writing", WRITING_CFG);
  assert.match(writingHtml, /Grammarly/);
  const devHtml = affiliateSlot("dev", DEV_CFG);
  assert.match(devHtml, /NordVPN/);
});

test("passing an explicit cfg is audience-independent — cfg wins regardless of the audience label", () => {
  // Confirms the function actually uses the injected cfg rather than always
  // re-deriving from the real site.config.mjs writing/dev split.
  const html = affiliateSlot("dev", WRITING_CFG);
  assert.match(html, /Grammarly/);
});

test("with no cfg argument, falls back to real site.config.mjs values without throwing, for both audiences", () => {
  assert.doesNotThrow(() => affiliateSlot("writing"));
  assert.doesNotThrow(() => affiliateSlot("dev"));
});

// ── affiliateAudience() classification ──────────────────────────────────────

test("known dev-facing transforms classify as 'dev'", () => {
  for (const t of ["base64-encode", "json-format", "csv-to-json", "md5-hash", "uuid-generator"]) {
    assert.equal(affiliateAudience(t), "dev", `${t} should classify as dev`);
  }
});

test("known writing-facing transforms classify as 'writing'", () => {
  for (const t of ["none", "uppercase", "dedupe-lines", "sort-az", "extract-emails", "strikethrough-text"]) {
    assert.equal(affiliateAudience(t), "writing", `${t} should classify as writing`);
  }
});

test("an unrecognized transform value falls back to 'writing' rather than throwing", () => {
  assert.equal(affiliateAudience("not-a-real-transform"), "writing");
  assert.equal(affiliateAudience(undefined), "writing");
});

test("every transform in TRANSFORM_GROUPS classifies as exactly one of 'dev' or 'writing'", () => {
  for (const [, opts] of TRANSFORM_GROUPS) {
    for (const [value] of opts) {
      assert.ok(["dev", "writing"].includes(affiliateAudience(value)), `${value} classified as neither`);
    }
  }
});
