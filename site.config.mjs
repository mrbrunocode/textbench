/**
 * SINGLE SOURCE OF TRUTH for this app's identity, domain, and monetization IDs.
 *
 * This is the one file to edit when the brand changes — but don't hand-edit it
 * for a rename; run `node scripts/rename-brand.mjs "NewName" newname.tld`, which
 * updates this file AND every hand-written page that embeds these values, then
 * regenerates everything built from it (collection pages, sitemap, llms.txt).
 *
 * Every engine module and script imports from here rather than hardcoding the
 * name/domain locally, so there is exactly one place that can drift.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * This is the FACTORY's reference app: a plain word & character counter. It
 * exists to prove the engine end-to-end and to show the design language in a
 * real, runnable tool. When you spin up a real app (`node scripts/new-app.mjs`),
 * you replace pages.mjs + assets/app.js + this config — the engine below stays.
 * ──────────────────────────────────────────────────────────────────────────
 */

// Tool count is derived from pages.mjs (not hand-typed) so this never drifts
// out of sync as pages are added/removed — see TOOL_COUNT below.
import { PAGES } from "./pages.mjs";
export const TOOL_COUNT = PAGES.length;

export const NAME = "Textbench";                 // prose, titles, wordmark text
export const NAME_LOWER = "textbench";            // URLs, slugs, footer mentions
export const TAGLINE = `${TOOL_COUNT} text tools, one page, nothing uploaded.`;
export const SITE_URL = "https://textbench.app"; // set to the real domain once bought (keep .example until then — IndexNow/rename tooling keys off it)
export const CONTACT_EMAIL = "hello@textbench.app";
export const DESCRIPTION =
  `Case conversion, cleanup, encoding, hashing, generators, JSON/YAML/CSV conversion, regex testing and more — ${TOOL_COUNT} free text tools that run entirely ` +
  "in your browser. No signup, no upload, nothing ever leaves your device.";

// The one subdirectory that holds the programmatic-SEO collection pages.
// CountLink used "timers"; a text-tool app might use "tools", a calculator app
// "calculators", etc. One word, lowercase, no slashes.
export const COLLECTION_DIR = "tools";

// Top-nav links shown on every page (order matters). Keep it short.
export const NAV = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
];

// Dates used in legal pages + JSON-LD. Bump CONTENT_DATE when page copy
// actually changes (drives datePublished/dateModified); bump LAST_UPDATED by
// hand only when the privacy/terms text itself changes.
export const LAST_UPDATED = "July 17, 2026";
export const CONTENT_DATE = "2026-07-17";

// ── Monetization / analytics IDs ──────────────────────────────────────────
// All empty until you wire them up. The engine renders each snippet ONLY when
// its value is set, so an unconfigured app ships clean with no dead tags.
//   GA_ID:        "G-XXXXXXXXXX"  — from Google Analytics (Admin → Data streams)
//   ADSENSE_PUB:  "ca-pub-…16 digits" — from AdSense once you apply
//   ADSENSE_SLOT: "…numeric…"     — from AdSense after approval (one ad unit)
// Set these with `node scripts/enable-adsense.mjs …` rather than by hand so
// ads.txt is written in the same step.
export const GA_ID = "G-LJCXH0BF41";
export const ADSENSE_PUB = "ca-pub-2653891546345771";
export const ADSENSE_SLOT = "";

// Affiliate recommendation card, split by audience: "writing" tools (case
// converters, counters, cleanup) get a writing-tool partner; "dev" tools
// (encode/decode, hash, JSON/YAML/CSV, generators) get a dev-tool partner.
// Both empty until real affiliate accounts exist — see engine/template.mjs
// affiliateSlot() for the off-by-default rendering rule.
export const AFFILIATE_WRITING_NAME = "";
export const AFFILIATE_WRITING_URL = "";
export const AFFILIATE_WRITING_BLURB = "";
export const AFFILIATE_DEV_NAME = "";
export const AFFILIATE_DEV_URL = "";
export const AFFILIATE_DEV_BLURB = "";

// Google Fonts to preload/link in every <head>. Inter (UI) + JetBrains Mono
// (the big number/output display) is the design system's pairing — see
// design-system/tokens/typography.css.
export const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800&family=Fira+Code:wght@400;500;600;700&display=swap";

// Default browser-chrome color (matches the dark app background token).
export const THEME_COLOR = "#0a0d12";
