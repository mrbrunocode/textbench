#!/usr/bin/env node
/**
 * The generator. Regenerates the WHOLE static site from one command:
 *
 *     node engine/build.mjs
 *
 * Outputs, all from the same sources so nothing can drift:
 *   - index.html                          (home / the tool)                ← content.mjs `home`
 *   - about/privacy/terms/contact .html   (hand-written prose pages)       ← content.mjs
 *   - <COLLECTION_DIR>/<slug>.html        (programmatic long-tail pages)   ← pages.mjs `PAGES`
 *   - sitemap.xml, robots.txt, llms.txt   (crawl surface, generated last)
 *
 * Why generate the legal/about pages too (CountLink hand-wrote them)? Because
 * then a rename or an AdSense switch is a single config change that propagates
 * everywhere — no per-file HTML patching, no page left with a stale <head>.
 * This is the main lesson baked back in from the CountLink build.
 *
 * The GROWTH LEVER is PAGES in pages.mjs: each row is one indexed page
 * targeting one long-tail query, all funnelling into the same tool with the
 * same single ad slot. That page-volume shape — not one homepage — is what
 * earns. Add rows (unique title/description/intro/faq each — never boilerplate),
 * re-run this, commit. See docs/monetization.md.
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import * as C from "../site.config.mjs";
import { renderDocument, adSlot, affiliateSlot, faqHtml, esc } from "./template.mjs";
import { PAGES, renderTool, affiliateAudience } from "../pages.mjs";
import { GUIDES } from "../guides.mjs";
import { home, about, privacy, terms, contact } from "../content.mjs";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const COLL = join(ROOT, C.COLLECTION_DIR);

// Internal linking: every page lists the others in the collection. This is the
// crawl-and-rank engine — hundreds of pages each one click from every other.
// On a tool page we show a CURATED window of ~12 thematically-adjacent tools
// (PAGES is ordered so neighbours are related), not the full wall of 64 — a
// giant identical link list on every page is a classic doorway/low-value
// signal and buries the page's own content. Full crawl coverage still comes
// from the homepage (which lists all) and the sitemap. On the homepage
// (currentSlug === null) we list everything, since that page IS the index.
const RELATED_WINDOW = 12;
function relatedLinks(currentSlug) {
  let chosen;
  if (currentSlug == null) {
    chosen = PAGES;
  } else {
    const i = PAGES.findIndex((p) => p.slug === currentSlug);
    chosen = [];
    for (let off = 1; chosen.length < RELATED_WINDOW && off < PAGES.length; off++) {
      const after = PAGES[(i + off) % PAGES.length];
      const before = PAGES[(i - off + PAGES.length) % PAGES.length];
      if (after.slug !== currentSlug && !chosen.includes(after)) chosen.push(after);
      if (chosen.length < RELATED_WINDOW && before.slug !== currentSlug && !chosen.includes(before)) chosen.push(before);
    }
  }
  const links = chosen
    .filter((p) => p.slug !== currentSlug)
    .map((p) => `<a href="/${C.COLLECTION_DIR}/${p.slug}">${esc(p.eyebrow || p.title)}</a>`)
    .join("\n      ");
  if (!links) return "";
  const browseAll =
    currentSlug == null ? "" : `\n      <a class="related-all" href="/">Browse all ${PAGES.length} tools →</a>`;
  return `
  <nav class="related" aria-label="More tools">
    <h2>${currentSlug == null ? "All tools" : "Related tools"}</h2>
    <div class="related-grid">
      ${links}${browseAll}
    </div>
  </nav>`;
}

// Site-wide tools index for the Cmd+K command palette (see assets/app.js).
// A JSON data island, not an executed script — the palette reads it via
// JSON.parse(textContent), so this is inert data even if a title ever
// contained something script-like. Present on every page (via headExtra
// below) so the palette works the same from any page, including the four
// prose pages.
function toolsIndexScript() {
  // Full absolute paths baked in at build time (not reconstructed client-side
  // from a bare slug) so the palette never has to guess the collection dir
  // or the current page's depth — it just navigates to item.path directly.
  const items = PAGES.map((p) => ({ title: p.eyebrow || p.title, path: `/${C.COLLECTION_DIR}/${p.slug}` }));
  return `<script id="toolsIndex" type="application/json">${JSON.stringify(items)}</script>`;
}

function collectionPage(p) {
  const body = `
  <section class="hero">
    <span class="eyebrow">${esc(p.eyebrow || "")}</span>
    <h1>${esc(p.h1 || p.title)}</h1>
    <p class="lede">${esc(p.intro || p.description)}</p>
  </section>
  ${renderTool(p)}
  ${adSlot()}
  ${p.extra || GUIDES[p.slug] || ""}
  ${faqHtml(p.faq)}
  ${affiliateSlot(affiliateAudience(p.transform))}
  ${relatedLinks(p.slug)}`;
  return renderDocument({
    title: p.h1 || p.title,
    description: p.description,
    canonicalPath: `/${C.COLLECTION_DIR}/${p.slug}`,
    eyebrow: p.eyebrow || p.title,
    faq: p.faq,
    depth: 1,
    bodyHtml: body,
    headExtra: toolsIndexScript(),
  });
}

function proseDocument(page) {
  // about/privacy/terms/contact: prose bodies from content.mjs, no ad slot.
  return renderDocument({
    title: page.title,
    description: page.description,
    canonicalPath: page.path,
    eyebrow: page.title,
    depth: 0,
    bodyHtml: page.bodyHtml,
    headExtra: toolsIndexScript(),
  });
}

function homeDocument() {
  const body = `${home.bodyHtml}
  ${adSlot()}
  ${relatedLinks(null)}`;
  return renderDocument({
    title: home.title,
    description: home.description || C.DESCRIPTION,
    canonicalPath: "/",
    depth: 0,
    bodyHtml: body,
    headExtra: toolsIndexScript(),
  });
}

function sitemap() {
  const all = [
    "/",
    ...[about, privacy, terms, contact].map((p) => p.path),
    ...PAGES.map((p) => `/${C.COLLECTION_DIR}/${p.slug}`),
  ];
  const urls = all
    .map((path) => `  <url><loc>${C.SITE_URL}${path}</loc><lastmod>${C.CONTENT_DATE}</lastmod></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

// manifest.json — generated from the same config as everything else, so its
// description/theme-color/name can never drift out of sync with the rest of
// the site the way a hand-maintained static copy would (it previously said
// "61 free text tools" after the count had grown to 64).
function manifest() {
  return JSON.stringify(
    {
      name: C.NAME,
      short_name: C.NAME,
      description: C.DESCRIPTION,
      start_url: "/",
      display: "standalone",
      background_color: C.THEME_COLOR,
      theme_color: C.THEME_COLOR,
      icons: [{ src: "/assets/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
    },
    null,
    2
  );
}

function robots() {
  return `User-agent: *
Allow: /

Sitemap: ${C.SITE_URL}/sitemap.xml
`;
}

// llms.txt — a Markdown index for LLM/agent crawlers, generated from the same
// PAGES array as the sitemap so it can never go stale independently.
function llmsTxt() {
  const list = PAGES.map((p) => `- [${p.eyebrow || p.title}](${C.SITE_URL}/${C.COLLECTION_DIR}/${p.slug}): ${p.description}`).join("\n");
  return `# ${C.NAME}

> ${C.DESCRIPTION}

${C.NAME} is a static web app: no signup, no backend, no per-visitor cost. Everything runs client-side.

## Primary pages
- [Home / the tool](${C.SITE_URL}/)
- [About](${C.SITE_URL}/about)
- [Privacy policy](${C.SITE_URL}/privacy)
- [Terms of Service](${C.SITE_URL}/terms)
- [Contact](${C.SITE_URL}/contact)

## ${C.COLLECTION_DIR}
${list}
`;
}

async function main() {
  await rm(COLL, { recursive: true, force: true });
  await mkdir(COLL, { recursive: true });

  let n = 0;
  for (const p of PAGES) {
    await writeFile(join(COLL, `${p.slug}.html`), collectionPage(p));
    n++;
  }

  await writeFile(join(ROOT, "index.html"), homeDocument());
  for (const page of [about, privacy, terms, contact]) {
    await writeFile(join(ROOT, page.path.replace(/^\//, "") + ".html"), proseDocument(page));
  }

  await writeFile(join(ROOT, "sitemap.xml"), sitemap());
  await writeFile(join(ROOT, "robots.txt"), robots());
  await writeFile(join(ROOT, "llms.txt"), llmsTxt());
  await writeFile(join(ROOT, "manifest.json"), manifest());

  // Keep package.json's description in sync with the live tool count —
  // it's npm metadata only (nothing in the build reads it back), but it's
  // easy to let it drift out of sync with the real PAGES count otherwise.
  const pkgPath = join(ROOT, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  if (pkg.description !== C.DESCRIPTION) {
    pkg.description = C.DESCRIPTION;
    await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }

  console.log(`Built: index + 4 prose pages + ${n} ${C.COLLECTION_DIR} page(s) + sitemap/robots/llms/manifest.`);
  console.log(`Site: ${C.NAME} <${C.SITE_URL}>`);
  if (!C.ADSENSE_PUB) console.log("Note: AdSense not configured yet — ad slot renders as a reserved placeholder. See scripts/enable-adsense.mjs.");
}

main();
