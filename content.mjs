/**
 * Hand-written prose pages: home, about, privacy, terms, contact.
 *
 * These are content, not chrome — the engine wraps each `bodyHtml` in the
 * shared shell (head/nav/footer/SEO), so you only ever write the middle. All
 * brand/domain/email values interpolate from site.config.mjs, so a rename
 * updates them automatically; never hardcode the name or domain here.
 *
 * privacy.html + terms.html are deliberately real and specific (AdSense review
 * expects a genuine, linked privacy policy). Edit the text to match what your
 * app actually does, then bump LAST_UPDATED in site.config.mjs.
 */
import * as C from "./site.config.mjs";
import { renderTool, TRANSFORM_GROUPS } from "./pages.mjs";

export const home = {
  title: `${C.NAME} — ${C.TAGLINE}`,
  description: C.DESCRIPTION,
  bodyHtml: `
  <section class="hero hero--home">
    <h1>Paste in. Nothing leaves your browser.</h1>
    <p class="lede">${C.DESCRIPTION}</p>
    <div class="hero-facts">
      <span><strong>${C.TOOL_COUNT}</strong> tools</span>
      <span><strong>${TRANSFORM_GROUPS.length}</strong> categories</span>
      <span><strong>0</strong> uploads</span>
    </div>
  </section>
  ${renderTool({ home: true })}

  <section class="guide">
    <h2>One place for the small text jobs</h2>
    <p>Everyone hits these tasks: a block of text that needs cleaning up, a count to check against a limit, a format to convert, something to encode or decode. Individually they're tiny — but hunting down a separate single-purpose site for each, half of them plastered in ads or asking you to sign up, wastes more time than the task itself. ${C.NAME} puts ${C.TOOL_COUNT} of them in one place, all working the same way: paste in, get the result, copy out.</p>

    <h2>What you'll find here</h2>
    <ul>
      <li><strong>Counting &amp; checking</strong> — <a href="/${C.COLLECTION_DIR}/word-counter">word</a> and <a href="/${C.COLLECTION_DIR}/character-counter">character</a> counters, plus limit checkers for <a href="/${C.COLLECTION_DIR}/twitter-character-counter">X posts</a>, <a href="/${C.COLLECTION_DIR}/meta-description-length-checker">meta descriptions</a> and <a href="/${C.COLLECTION_DIR}/reading-time-calculator">reading time</a>.</li>
      <li><strong>Cleaning &amp; reorganising</strong> — change <a href="/${C.COLLECTION_DIR}/uppercase-converter">case</a>, <a href="/${C.COLLECTION_DIR}/remove-duplicate-lines">remove duplicate lines</a>, <a href="/${C.COLLECTION_DIR}/sort-lines-alphabetically">sort</a>, <a href="/${C.COLLECTION_DIR}/remove-extra-spaces">strip extra spaces</a>, and <a href="/${C.COLLECTION_DIR}/find-and-replace">find &amp; replace</a>.</li>
      <li><strong>Converting</strong> — <a href="/${C.COLLECTION_DIR}/csv-to-json-converter">CSV↔JSON</a>, <a href="/${C.COLLECTION_DIR}/yaml-to-json-converter">YAML↔JSON</a>, <a href="/${C.COLLECTION_DIR}/markdown-to-html-converter">Markdown to HTML</a>, and <a href="/${C.COLLECTION_DIR}/json-formatter">JSON formatting</a>.</li>
      <li><strong>Encoding &amp; hashing</strong> — <a href="/${C.COLLECTION_DIR}/base64-encode">Base64</a>, <a href="/${C.COLLECTION_DIR}/url-encode">URL</a> and <a href="/${C.COLLECTION_DIR}/html-entity-encode">HTML-entity</a> encoding, plus <a href="/${C.COLLECTION_DIR}/md5-hash-generator">MD5</a> / <a href="/${C.COLLECTION_DIR}/sha256-hash-generator">SHA-256</a> hashes.</li>
      <li><strong>Generating</strong> — <a href="/${C.COLLECTION_DIR}/uuid-generator">UUIDs</a>, <a href="/${C.COLLECTION_DIR}/random-password-generator">passwords</a>, <a href="/${C.COLLECTION_DIR}/lorem-ipsum-generator">lorem ipsum</a> and <a href="/${C.COLLECTION_DIR}/qr-code-generator">QR codes</a>.</li>
    </ul>

    <h2>Why "nothing leaves your browser" is the point</h2>
    <p>Almost every tool here runs entirely on your device in JavaScript — your text is processed in the page and never sent to a server. That's not just a privacy nicety: it means you can safely paste things you shouldn't upload to a random website, like an API response with tokens in it, a config file, or an internal document. It also means the tools keep working offline once the page has loaded, and there's nothing for anyone to log or store. No account, no daily limits, no paywall — open a tool and use it.</p>
    <p>Each tool has its own page with a short guide covering how it works and the gotchas worth knowing — because a password generator, a Base64 encoder and a Unicode "bold" text trick each come with their own things you'd want to get right.</p>
  </section>`,
};

export const about = {
  path: "/about",
  title: `About ${C.NAME}`,
  description: `What ${C.NAME} is, who makes it, and why it's free.`,
  bodyHtml: `
  <section class="prose">
    <h1>About ${C.NAME}</h1>
    <p>${C.NAME} is a small, single-purpose tool: ${C.DESCRIPTION.charAt(0).toLowerCase() + C.DESCRIPTION.slice(1)}</p>
    <p>It's deliberately simple. There's no account to make, nothing to install, and no data to hand over — the whole thing runs in your browser. It stays free by showing a single, unobtrusive ad, and nothing more.</p>
    <p>Found a bug or want a feature? <a href="/contact">Get in touch</a>.</p>
  </section>`,
};

export const privacy = {
  path: "/privacy",
  title: `Privacy Policy — ${C.NAME}`,
  description: `How ${C.NAME} handles your data (short version: it stays in your browser).`,
  bodyHtml: `
  <section class="prose">
    <h1>Privacy policy</h1>
    <p class="muted">Last updated: ${C.LAST_UPDATED}</p>

    <h2>The short version</h2>
    <p>Whatever you type into ${C.NAME} is processed entirely in your own browser. It is never uploaded, stored, or sent to us. Close the tab and it's gone.</p>

    <h2>What we collect</h2>
    <p><strong>Your text: nothing.</strong> The tool runs client-side; your content never reaches a server we control.</p>
    <p><strong>Analytics:</strong> ${C.GA_ID
      ? `We use Google Analytics to understand aggregate, anonymous usage (pages viewed, rough country, device type). It does not see the text you enter.`
      : `We do not currently run analytics.`}</p>
    <p><strong>Advertising:</strong> ${C.ADSENSE_PUB
      ? `We show ads via Google AdSense. Google and its partners may use cookies to serve ads based on your prior visits to this and other sites. You can opt out of personalized advertising at <a href="https://www.google.com/settings/ads" rel="noopener" target="_blank">Google Ads Settings</a>. Visitors in the EEA/UK are shown a consent choice before any personalized ads load.`
      : `We do not currently show ads.`}</p>

    <h2>Cookies</h2>
    <p>${C.ADSENSE_PUB || C.GA_ID
      ? `Third-party cookies may be set by Google (for the services named above). The tool itself sets no tracking cookies of its own; any preferences (like light/dark theme) are stored locally in your browser and never transmitted.`
      : `The tool sets no tracking cookies. Any preferences (like light/dark theme) are stored locally in your browser and never transmitted.`}</p>

    <h2>Your rights</h2>
    <p>Because we don't hold your content or a profile of you, there's nothing on our side to access, export, or delete. For the third-party services above, refer to <a href="https://policies.google.com/privacy" rel="noopener" target="_blank">Google's privacy policy</a>.</p>

    <h2>Contact</h2>
    <p>Questions about this policy: <a href="mailto:${C.CONTACT_EMAIL}">${C.CONTACT_EMAIL}</a>.</p>
  </section>`,
};

export const terms = {
  path: "/terms",
  title: `Terms of Service — ${C.NAME}`,
  description: `The terms for using ${C.NAME}.`,
  bodyHtml: `
  <section class="prose">
    <h1>Terms of service</h1>
    <p class="muted">Last updated: ${C.LAST_UPDATED}</p>

    <h2>Use of the service</h2>
    <p>${C.NAME} is provided free of charge, as-is, for your personal or professional use. You may use it for any lawful purpose.</p>

    <h2>No warranty</h2>
    <p>The tool is provided without warranties of any kind. While it aims to be accurate, results are estimates and you are responsible for verifying anything you rely on. We are not liable for any loss arising from use of the tool.</p>

    <h2>Availability</h2>
    <p>We may change, suspend, or discontinue the service at any time without notice. Because the tool runs in your browser, a page you already have open will keep working even if the site changes.</p>

    <h2>Third-party services</h2>
    <p>Pages may include Google AdSense and Google Analytics, which are governed by <a href="https://policies.google.com/terms" rel="noopener" target="_blank">Google's terms</a>.</p>

    <h2>Contact</h2>
    <p><a href="mailto:${C.CONTACT_EMAIL}">${C.CONTACT_EMAIL}</a></p>
  </section>`,
};

export const contact = {
  path: "/contact",
  title: `Contact — ${C.NAME}`,
  description: `Get in touch about ${C.NAME}.`,
  bodyHtml: `
  <section class="prose">
    <h1>Contact</h1>
    <p>Bug reports, feature ideas, or anything else — email <a href="mailto:${C.CONTACT_EMAIL}">${C.CONTACT_EMAIL}</a> and you'll get a reply.</p>
    <p>There's no contact form here on purpose: a form would need a backend, and part of the point of ${C.NAME} is that there isn't one.</p>
  </section>`,
};
