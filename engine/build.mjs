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
import { PAGES, renderTool, affiliateAudience, GROUPS, GROUP_OF } from "../pages.mjs";
import { GUIDES } from "../guides.mjs";
import { ARTICLES } from "../articles.mjs";
import { home, about, privacy, terms, contact, alternatives, embed } from "../content.mjs";
import { EMBEDDABLE, embedPage } from "./embed.mjs";
import { makeDateTracker } from "./content-dates.mjs";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

// dateModified per page, changing only when that page's content changes.
// See engine/content-dates.mjs for why this is not just the build date.
const dates = makeDateTracker(join(ROOT, "content-dates.json"), new Date().toISOString().slice(0, 10));
const COLL = join(ROOT, C.COLLECTION_DIR);

// Internal linking, in two distinct jobs that used to be one.
//
// The index rail (below) is NAVIGATION: all 65 tools under their GROUPS
// headings, in the same position on every page. It is deliberately complete —
// a reader should never have to go back to the homepage to find out what else
// is here — and because it is site furniture in a consistent position, it is
// read as navigation rather than as an in-content link wall.
//
// relatedNote() is CONTEXT: a curated window of ~12 thematically adjacent
// tools (PAGES is ordered so neighbours are related), rendered as a margin
// note on the page it belongs to. Full crawl coverage comes from the rail and
// the sitemap, so this never needs to be the whole catalogue.
const RELATED_WINDOW = 12;

// ── The index rail ─────────────────────────────────────────────────────────
const bySlug = Object.fromEntries(PAGES.map((p) => [p.slug, p]));

const idFor = (s) => s.toLowerCase().replace(/&[a-z]+;/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Group labels are navigation furniture, NOT document structure. They were
// <h2> at first, which put eleven headings ahead of every page's real content
// headings — bad for anyone navigating by heading, and boilerplate in a signal
// that should be page-specific. A <p> plus aria-labelledby on the list keeps
// the grouping announced ("list, Change case, 6 items") without the outline.
function toolIndex(currentSlug) {
  const groups = GROUPS.map(([heading, slugs]) => {
    const items = slugs.map((slug) => {
      const p = bySlug[slug];
      const here = slug === currentSlug;
      return `<li><a href="/${C.COLLECTION_DIR}/${slug}"${here ? ' aria-current="page"' : ""}>${esc(p.eyebrow || p.title)}</a></li>`;
    }).join("\n          ");
    return `
      <section class="index-group">
        <p class="index-head" id="idx-${idFor(heading)}">${esc(heading)}</p>
        <ul class="index-list" aria-labelledby="idx-${idFor(heading)}">
          ${items}
        </ul>
      </section>`;
  }).join("");
  return `
  <nav class="index" aria-label="All tools">
    <div class="index-in">
      <p class="index-title"><a href="/">All ${PAGES.length} tools</a></p>${groups}
    </div>
  </nav>`;
}

// The reading pages get their own index — articles and site pages rather than
// the tool list, which would be noise next to a guide.
function readingIndex(currentPath) {
  const link = (href, label) =>
    `<li><a href="${href}"${href === currentPath ? ' aria-current="page"' : ""}>${esc(label)}</a></li>`;
  return `
  <nav class="index" aria-label="Guides and site">
    <div class="index-in">
      <p class="index-title"><a href="/${GUIDES_DIR}">Guides</a></p>
      <section class="index-group">
        <p class="index-head" id="idx-reading">Reading</p>
        <ul class="index-list" aria-labelledby="idx-reading">
          ${ARTICLES.map((a) => link(`/${GUIDES_DIR}/${a.slug}`, a.title)).join("\n          ")}
        </ul>
      </section>
      <section class="index-group">
        <p class="index-head" id="idx-site">Site</p>
        <ul class="index-list" aria-labelledby="idx-site">
          ${[alternatives, about, privacy, terms, contact, embed].map((p) => link(p.path, p.title.replace(new RegExp(`\\s*[—|]\\s*.*$`), "").replace(`${C.NAME} `, ""))).join("\n          ")}
        </ul>
      </section>
      <section class="index-group">
        <p class="index-head" id="idx-tools">Tools</p>
        <ul class="index-list" aria-labelledby="idx-tools">
          ${GROUPS.slice(0, 6).map(([heading, slugs]) =>
            `<li><a href="/${C.COLLECTION_DIR}/${slugs[0]}">${esc(heading)}</a></li>`).join("\n          ")}
          <li><a class="index-more" href="/">All ${PAGES.length} tools →</a></li>
        </ul>
      </section>
    </div>
  </nav>`;
}

/**
 * Marginalia: the editorial device this layout is built around. Notes sit in
 * the outer column beside the measure rather than interrupting it — so a page
 * can carry its context (what this is, what's related, what to read next)
 * without the reader having to scroll past it to reach the text.
 *
 * Returns "" when there is nothing worth putting there, and the shell then
 * drops the column entirely rather than leaving a gutter of white.
 */
function marginNotes(blocks) {
  const kept = blocks.filter(Boolean);
  if (!kept.length) return "";
  return `
  <aside class="margin">
    <div class="margin-in">
      ${kept.join("\n      ")}
    </div>
  </aside>`;
}

const marginNote = (head, html) => `
      <div class="note">
        <p class="note-head">${esc(head)}</p>
        ${html}
      </div>`;

/** On-page contents, built from the page's own h2s (reading pages only). */
function withContents(html) {
  const heads = [];
  const withIds = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (m, attrs, inner) => {
    if (/\bid=/.test(attrs)) return m;
    const text = inner.replace(/<[^>]*>/g, "").trim();
    const id = text.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
    if (!id || heads.some((h) => h.id === id)) return m;
    heads.push({ id, text });
    return `<h2${attrs} id="${id}">${inner}</h2>`;
  });
  if (heads.length < 2) return { html, contents: "" };
  const items = heads.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("\n          ");
  return {
    html: withIds,
    contents: `
      <div class="note note--contents">
        <p class="note-head">On this page</p>
        <ul class="note-list">
          ${items}
        </ul>
      </div>`,
  };
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

/** Related tools as a margin note rather than a footer grid. */
function relatedNote(currentSlug) {
  const i = PAGES.findIndex((x) => x.slug === currentSlug);
  const chosen = [];
  for (let off = 1; chosen.length < RELATED_WINDOW && off < PAGES.length; off++) {
    const after = PAGES[(i + off) % PAGES.length];
    const before = PAGES[(i - off + PAGES.length) % PAGES.length];
    if (after.slug !== currentSlug && !chosen.includes(after)) chosen.push(after);
    if (chosen.length < RELATED_WINDOW && before.slug !== currentSlug && !chosen.includes(before)) chosen.push(before);
  }
  if (!chosen.length) return "";
  return `
      <div class="note">
        <p class="note-head">Related tools</p>
        <ul class="note-list">
          ${chosen.map((x) => `<li><a href="/${C.COLLECTION_DIR}/${x.slug}">${esc(x.eyebrow || x.title)}</a></li>`).join("\n          ")}
          <li><a class="index-more" href="/">All ${PAGES.length} tools →</a></li>
        </ul>
      </div>`;
}

function collectionPage(p) {
  const group = GROUP_OF[p.slug];
  const body = `
  <header class="standfirst">
    <p class="kicker"><a href="/">Tools</a>${group ? ` <span aria-hidden="true">/</span> ${esc(group)}` : ""}</p>
    <h1>${esc(p.h1 || p.title)}</h1>
  </header>
  <p class="lede">${esc(p.intro || p.description)}</p>
  ${renderTool(p)}
  ${adSlot()}
  <div class="measure">
    ${p.extra || GUIDES[p.slug] || ""}
    ${faqHtml(p.faq)}
  </div>`;
  return renderDocument({
    title: p.h1 || p.title,
    description: p.description,
    canonicalPath: `/${C.COLLECTION_DIR}/${p.slug}`,
    eyebrow: p.eyebrow || p.title,
    faq: p.faq,
    depth: 1,
    layout: "work",
    index: toolIndex(p.slug),
    margin: marginNotes([
      relatedNote(p.slug),
      affiliateSlot(affiliateAudience(p.transform)),
    ]),
    bodyHtml: body,
    headExtra: toolsIndexScript(),
    dateModified: dates.dateFor(`${C.COLLECTION_DIR}/${p.slug}`, [
      p.title, p.h1, p.description, p.intro, p.faq,
      p.extra || GUIDES[p.slug] || "",
    ]),
  });
}

function proseDocument(page) {
  // about/privacy/terms/contact/alternatives: prose bodies from content.mjs,
  // no ad slot. Reading layout — the measure leads, contents sit in the margin.
  const { html, contents } = withContents(page.bodyHtml);
  return renderDocument({
    title: page.title,
    description: page.description,
    canonicalPath: page.path,
    dateModified: dates.dateFor(page.path, [page.title, page.description, page.bodyHtml]),
    eyebrow: page.title,
    depth: 0,
    layout: "read",
    index: readingIndex(page.path),
    margin: marginNotes([contents]),
    bodyHtml: html,
    headExtra: toolsIndexScript(),
  });
}

function homeDocument() {
  // The homepage is a work page: the tool leads, the index rail carries the
  // full catalogue, and the supporting prose sits below at a reading measure.
  const body = `${home.bodyHtml}
  ${adSlot()}
  <div class="measure">${home.belowHtml || ""}</div>`;
  return renderDocument({
    title: home.title,
    description: home.description || C.DESCRIPTION,
    canonicalPath: "/",
    depth: 0,
    layout: "work",
    index: toolIndex(null),
    margin: marginNotes([home.marginHtml || ""]),
    bodyHtml: body,
    headExtra: toolsIndexScript(),
  });
}

// ── Editorial articles (/guides) ───────────────────────────────────────────
const GUIDES_DIR = "guides";
const fmtDate = (iso) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

// Author byline — a real, named person linking to their own site is the
// E-E-A-T "Who" signal AdSense and Google's quality raters look for.
function byline(a) {
  return `
  <p class="byline">By <a href="${C.AUTHOR_URL}" rel="author noopener" target="_blank">${esc(C.AUTHOR_NAME)}</a>
    · <time datetime="${a.date}">${fmtDate(a.date)}</time>
    · ${a.read} min read</p>`;
}

function authorBox() {
  return `
  <aside class="author-box">
    <p class="author-box-name">${esc(C.AUTHOR_NAME)}</p>
    <p>${esc(C.AUTHOR_BIO)} <a href="${C.AUTHOR_URL}" rel="author noopener" target="_blank">${esc(C.AUTHOR_NAME.replace(/ FK$/, ""))}'s site →</a></p>
  </aside>`;
}

function articleSchema(a) {
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    author: { "@type": "Person", name: C.AUTHOR_NAME, url: C.AUTHOR_URL },
    publisher: { "@type": "Organization", name: C.NAME },
    datePublished: a.date,
    dateModified: a.date,
    mainEntityOfPage: `${C.SITE_URL}/${GUIDES_DIR}/${a.slug}`,
  })}</script>`;
}

function articleDocument(a) {
  const { html, contents } = withContents(a.bodyHtml);
  const body = `
  <article class="prose article">
    <p class="kicker"><a href="/${GUIDES_DIR}">Guides</a></p>
    <h1>${esc(a.title)}</h1>
    ${byline(a)}
    ${html}
    ${authorBox()}
    <p class="article-back"><a href="/${GUIDES_DIR}">← All guides</a></p>
  </article>`;
  return renderDocument({
    title: a.title,
    description: a.description,
    canonicalPath: `/${GUIDES_DIR}/${a.slug}`,
    eyebrow: "Guides",
    depth: 1,
    layout: "read",
    index: readingIndex(`/${GUIDES_DIR}/${a.slug}`),
    margin: marginNotes([contents]),
    bodyHtml: body,
    headExtra: articleSchema(a) + toolsIndexScript(),
  });
}

function guidesIndexDocument() {
  const cards = ARTICLES.map(
    (a) => `
    <a class="guide-card" href="/${GUIDES_DIR}/${a.slug}">
      <h2>${esc(a.title)}</h2>
      <p>${esc(a.excerpt)}</p>
      <span class="guide-card-meta">${a.read} min read</span>
    </a>`
  ).join("\n");
  const body = `
  <header class="standfirst">
    <p class="kicker">${esc(C.NAME)}</p>
    <h1>Guides</h1>
    <p class="lede">Plain-English writing on text, encoding, data formats and the tools here — what these concepts actually are, and how to use them well.</p>
  </header>
  <div class="guide-list">${cards}
  </div>`;
  return renderDocument({
    title: `${C.NAME} Guides — Text, Encoding & Data Formats Explained`,
    description: `In-depth guides on working with text: Base64, character encoding, regular expressions, hashing, JSON vs YAML vs CSV, strong passwords, and cleaning up messy text.`,
    canonicalPath: `/${GUIDES_DIR}`,
    eyebrow: "Guides",
    depth: 0,
    layout: "read",
    index: readingIndex(`/${GUIDES_DIR}`),
    bodyHtml: body,
    headExtra: toolsIndexScript(),
  });
}

function sitemap() {
  const all = [
    "/",
    `/${GUIDES_DIR}`,
    ...[about, privacy, terms, contact, alternatives, embed].map((p) => p.path),
    ...ARTICLES.map((a) => `/${GUIDES_DIR}/${a.slug}`),
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
- [Guides](${C.SITE_URL}/${GUIDES_DIR})
- [About](${C.SITE_URL}/about)
- [Privacy policy](${C.SITE_URL}/privacy)
- [Terms of Service](${C.SITE_URL}/terms)
- [Contact](${C.SITE_URL}/contact)
- [Convert Case & Text Mechanic alternatives compared](${C.SITE_URL}/alternatives)
- [Embed a tool on your site](${C.SITE_URL}/embed)

## Guides
${ARTICLES.map((a) => `- [${a.title}](${C.SITE_URL}/${GUIDES_DIR}/${a.slug}): ${a.description}`).join("\n")}

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
  for (const page of [about, privacy, terms, contact, alternatives, embed]) {
    await writeFile(join(ROOT, page.path.replace(/^\//, "") + ".html"), proseDocument(page));
  }

  // Editorial articles: /guides index + /guides/<slug> pages.
  const guidesOut = join(ROOT, GUIDES_DIR);
  await rm(guidesOut, { recursive: true, force: true });
  await mkdir(guidesOut, { recursive: true });
  await writeFile(join(ROOT, `${GUIDES_DIR}.html`), guidesIndexDocument());
  for (const a of ARTICLES) {
    await writeFile(join(guidesOut, `${a.slug}.html`), articleDocument(a));
  }

  const embedOut = join(ROOT, "embed");
  await mkdir(embedOut, { recursive: true });
  for (const item of EMBEDDABLE) {
    await writeFile(join(embedOut, `${item.slug}.html`), embedPage(item));
  }
  console.log(`Wrote ${EMBEDDABLE.length} embed widget(s) to embed/ (noindex, not in sitemap).`);

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

  const d = dates.save();
  console.log(`Built: index + ${[about, privacy, terms, contact, alternatives].length} prose pages + ${n} ${C.COLLECTION_DIR} page(s) + sitemap/robots/llms/manifest.`);
  console.log(`dateModified: ${d.total} pages tracked, ${d.changed.length} changed this build.`);
  console.log(`Site: ${C.NAME} <${C.SITE_URL}>`);
  if (!C.ADSENSE_PUB) console.log("Note: AdSense not configured yet — ad slot renders as a reserved placeholder. See scripts/enable-adsense.mjs.");
}

main();
