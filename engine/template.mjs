/**
 * The shared page shell: <head> (SEO + JSON-LD + analytics + ads loader),
 * header, nav, ad slot, and footer. Every collection page and — via the same
 * helpers — every hand-written page renders through here, so the chrome and
 * the SEO/structured-data scaffolding live in exactly one place.
 *
 * The proven structure this encodes (from the CountLink/vClock build):
 *   - unique <title>/<meta description>/canonical per page (duplicate meta is
 *     the #1 reason programmatic pages get filtered out of Google's index),
 *   - Open Graph + Twitter card so shared links preview well,
 *   - three JSON-LD blocks: WebApplication, BreadcrumbList, and (if the page
 *     has FAQs) FAQPage — the visible FAQ HTML is generated from the SAME
 *     array so structured data can never drift from what's on screen,
 *   - exactly ONE ad slot, in the vClock-proven position (directly below the
 *     tool, above supporting content), that reserves its height (no layout
 *     shift) and only renders when AdSense is configured.
 *
 * Analytics and ads are DATA-DRIVEN off site.config.mjs (GA_ID / ADSENSE_PUB /
 * ADSENSE_SLOT). An unconfigured app emits no dead tags; wiring them up is a
 * one-line config change (see scripts/enable-adsense.mjs), not an HTML edit.
 */
import * as C from "../site.config.mjs";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { esc } from "./esc.mjs";

// Content-hash version stamp for asset URLs. _headers caches /assets/* for
// 24h while HTML revalidates hourly — without a version query, a deploy can
// pair fresh HTML with day-old JS/CSS (new controls present but dead). The
// hash changes only when the file does, so unchanged assets stay cached.
const assetV = (name) => {
  try {
    return createHash("md5")
      .update(readFileSync(new URL("../assets/" + name, import.meta.url)))
      .digest("hex")
      .slice(0, 8);
  } catch {
    return "0";
  }
};
const CSS_V = assetV("style.css");
const JS_V = assetV("app.js");
const WORKER_V = assetV("regex-worker.js");

// Depth-aware relative prefix so /tools/foo can reach ../assets while / uses
// ./assets. depth 0 = repo root page, depth 1 = a collection page.
const rel = (depth) => (depth > 0 ? "../".repeat(depth) : "./");

function analytics() {
  if (!C.GA_ID) return "";
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${C.GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('js',new Date());gtag('config','${C.GA_ID}');</script>`;
}

/**
 * Mediavine Grow loader. Renders nothing until GROW_SITE_ID is set, same
 * contract as analytics()/adsenseLoader() above.
 *
 * Grow is a prerequisite for Journey by Mediavine, which requires it to have
 * been running for 30+ days before a site is evaluated — so this goes in early,
 * at zero traffic, to start that clock. See site.config.mjs for the full note
 * and boring-app-factory/docs/monetization.md for why Journey matters.
 *
 * This reproduces Grow's documented non-WordPress loader. The Publisher Portal
 * is the source of truth: check the snippet it shows matches this before
 * relying on it.
 */
function growScript() {
  if (!C.GROW_SITE_ID) return "";
  return `<script data-grow-initializer="">
!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","${C.GROW_SITE_ID}");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();
</script>`;
}

function adsenseLoader() {
  if (!C.ADSENSE_PUB) return "";
  return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${C.ADSENSE_PUB}" crossorigin="anonymous"></script>`;
}

/**
 * The single ad slot. Renders the live AdSense unit when both PUB and SLOT are
 * set; a reserved, non-rendering placeholder otherwise (so the layout is
 * identical before and after monetization is switched on — no CLS surprise on
 * launch day). `.ad-slot` is hidden in any fullscreen/overlay mode via CSS, so
 * an ad can never end up on a projector or in a stream.
 */
export function adSlot() {
  if (C.ADSENSE_PUB && C.ADSENSE_SLOT) {
    return `<div class="ad-slot">
    <ins class="adsbygoogle" style="display:block;min-height:90px"
         data-ad-client="${C.ADSENSE_PUB}" data-ad-slot="${C.ADSENSE_SLOT}"
         data-ad-format="auto" data-full-width-responsive="true"></ins>
    <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
  </div>`;
  }
  return `<div class="ad-slot ad-slot--placeholder" aria-hidden="true"><!-- one ad unit renders here once AdSense is configured (scripts/enable-adsense.mjs); reserved so the layout never shifts on launch --></div>`;
}

/**
 * A single, clearly-labeled affiliate recommendation card, split by audience
 * ("writing" vs "dev" — see pages.mjs affiliateAudience()). Renders nothing
 * until the matching pair of config vars is set (same off-by-default pattern
 * as adSlot()) — never a dead or placeholder link. One partner, one line of
 * copy, no banner imagery, positioned AFTER the ad slot and FAQ so it never
 * competes with the paid ad or the tool itself.
 */
// cfg defaults to the real site.config.mjs values, keyed by audience; tests
// pass an explicit pair so both the "off" and "configured" branches are
// checkable without mocking a module of `const` bindings.
export function affiliateSlot(audience, cfg) {
  const writing = { name: C.AFFILIATE_WRITING_NAME, url: C.AFFILIATE_WRITING_URL, blurb: C.AFFILIATE_WRITING_BLURB };
  const dev = { name: C.AFFILIATE_DEV_NAME, url: C.AFFILIATE_DEV_URL, blurb: C.AFFILIATE_DEV_BLURB };
  const { name, url, blurb } = cfg || (audience === "dev" ? dev : writing);
  if (!name || !url || !blurb) return "";
  return `
  <aside class="affiliate-card">
    <p class="affiliate-label">Sponsored</p>
    <p>${esc(blurb)}</p>
    <a href="${esc(url)}" rel="sponsored noopener" target="_blank">Try ${esc(name)} →</a>
  </aside>`;
}

export const faqSchema = (faq) =>
  faq && faq.length
    ? `<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      })}</script>`
    : "";

export const faqHtml = (faq) =>
  faq && faq.length
    ? `
  <section class="faq">
    <h2>Common questions</h2>
    <div class="faq-grid">
      ${faq.map((f) => `<div class="faq-item"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`).join("\n      ")}
    </div>
  </section>`
    : "";

/**
 * Build a full HTML document.
 *
 * @param {object}   o
 * @param {string}   o.title            page <title> (without the brand suffix)
 * @param {string}   o.description      meta description + OG/Twitter description
 * @param {string}   o.canonicalPath    path after the origin, e.g. "/tools/word-counter" or "/"
 * @param {string}   o.bodyHtml         the page's <main> inner content (tool UI, prose, FAQ…)
 * @param {number}  [o.depth=0]         directory depth for relative asset URLs (0=root, 1=/collection/)
 * @param {string}  [o.eyebrow]         breadcrumb leaf name (defaults to title)
 * @param {Array}   [o.faq]             FAQ array → FAQPage JSON-LD (visible HTML is your responsibility via faqHtml)
 * @param {string}  [o.themeColor]      override the browser-chrome color
 * @param {string}  [o.bodyClass]       extra class on <body>
 * @param {string}  [o.headExtra]       extra markup injected at end of <head>
 */
export function renderDocument(o) {
  const {
    title,
    description,
    canonicalPath,
    bodyHtml,
    depth = 0,
    eyebrow,
    faq,
    themeColor = C.THEME_COLOR,
    bodyClass = "",
    headExtra = "",
    // Last time this page's content actually changed (see content-dates.mjs).
    // Falls back to the site-wide constant for pages not yet tracked.
    dateModified = C.CONTENT_DATE,
  } = o;
  const r = rel(depth);
  const canonical = `${C.SITE_URL}${canonicalPath}`;
  const ogImage = `${C.SITE_URL}/assets/og-image.png`;
  const isHome = canonicalPath === "/";

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: C.NAME,
    url: canonical,
    description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (web browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    // Named maintainer on every tool page, not just the guide articles.
    // Google's "Who created it?" test is applied per page, and the tool pages
    // are the overwhelming majority of the site — leaving them anonymous made
    // the whole domain read as unattributed.
    author: { "@type": "Person", name: C.AUTHOR_NAME, url: C.AUTHOR_URL },
    datePublished: C.CONTENT_DATE,
    dateModified,
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: isHome
      ? [{ "@type": "ListItem", position: 1, name: C.NAME, item: `${C.SITE_URL}/` }]
      : [
          { "@type": "ListItem", position: 1, name: C.NAME, item: `${C.SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: eyebrow || title, item: canonical },
        ],
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}${isHome ? "" : ` | ${esc(C.NAME)}`}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${ogImage}">
<link rel="icon" type="image/svg+xml" href="${r}assets/favicon.svg">
<link rel="manifest" href="${r}manifest.json">
<meta name="theme-color" content="${themeColor}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${C.FONT_HREF}" rel="stylesheet">
<link rel="stylesheet" href="${r}assets/style.css?v=${CSS_V}">
${analytics()}
<script type="application/ld+json">${JSON.stringify(webApp)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
${faqSchema(faq)}
${adsenseLoader()}
${growScript()}
${headExtra}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ""}>
<a class="skip-link" href="#main">Skip to content</a>
<header>
  <a class="logo" href="/">
    <svg class="logo-mark" width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><rect width="22" height="22" rx="5" fill="currentColor" opacity="0.14"/><text x="11" y="15.5" font-family="Fira Code, monospace" font-size="13" font-weight="700" fill="currentColor" text-anchor="middle">#</text></svg>
    ${esc(C.NAME)}
  </a>
  <div class="header-actions">
    <button type="button" class="cmdk-trigger" id="cmdkTrigger" aria-label="Search tools">
      <span>Search tools</span><kbd>⌘K</kbd>
    </button>
    <button type="button" class="theme-toggle" id="themeToggle" aria-label="Toggle light/dark">◐</button>
  </div>
</header>
<nav class="main-nav" aria-label="Site">
  ${C.NAV.map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join("\n  ")}
</nav>
<main class="wrap" id="main">
${bodyHtml}
</main>
<footer>
  <div class="wrap">
    <div class="foot-in">
      <div><span class="fb">${esc(C.NAME)}</span> — ${esc(C.TAGLINE)} · ${C.NAV.map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join(" · ")} · <a href="mailto:${C.CONTACT_EMAIL}">${esc(C.CONTACT_EMAIL)}</a></div>
      <div>Free. No signup, no upload — everything runs in your browser.<br>
      Built and maintained by <a href="${C.AUTHOR_URL}" rel="author noopener" target="_blank">${esc(C.AUTHOR_NAME)}</a>, an independent developer in Edinburgh.<br>
      <a href="${C.REPO_URL}" rel="noopener" target="_blank">Source on GitHub</a> — check the privacy claim yourself.</div>
    </div>
  </div>
</footer>
<script>window.REGEX_WORKER_URL = "${r}assets/regex-worker.js?v=${WORKER_V}";</script>
<script src="${r}assets/app.js?v=${JS_V}" defer></script>
</body>
</html>
`;
}

export { C as config, esc };
