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
    <p>${C.NAME} is a collection of ${C.TOOL_COUNT} small, single-purpose text tools in one place: counters, case converters, cleaners, format converters, encoders and decoders, hashes, generators, and a few playful Unicode text styles. The idea is simple — the little text jobs everyone hits (check a length, clean up spacing, convert CSV to JSON, encode some Base64) shouldn't each mean hunting down a separate ad-choked website. They're gathered here, all working the same way: paste in, get the result, copy out.</p>

    <h2>Who makes it</h2>
    <p>${C.NAME} is built and maintained independently by a working developer — not a company or a funded startup — who uses tools like these constantly and wanted one clean, fast, privacy-respecting home for them. It's a focused side project, kept deliberately small and free of the signups, upsells and clutter that these utility sites usually accumulate. Bug reports and requests for new tools go straight to the person who maintains it, at <a href="mailto:${C.CONTACT_EMAIL}">${C.CONTACT_EMAIL}</a>.</p>

    <h2>How it works</h2>
    <p>Almost every tool here runs entirely in your browser using JavaScript — your text is processed on your own device and never sent to a server. That's not just a privacy nicety: it means you can safely paste things you shouldn't upload to a random website, like an API response with tokens in it, an internal document, or a config file. It also means the tools keep working offline once the page has loaded, and there's nothing for anyone to log or store. (A couple of tools that inherently need an external service, like fetching a QR image, say so on their own page.)</p>

    <h3>You don't have to take that on trust</h3>
    <p>Two ways to check it rather than believe it. Open your browser's Network tab while you use any tool: nothing carrying your text goes out. Or turn your connection off entirely — the tools keep working, which they couldn't if a server were doing the work.</p>
    <p>And if you'd rather read the code than test the behaviour, <a href="${C.REPO_URL}" rel="noopener" target="_blank">the whole site is open source on GitHub</a>. Every transform, every counter, the build that generates these pages — it's all there. A privacy claim you can't verify is just marketing.</p>

    <h2>Why it exists</h2>
    <p>Because the single-purpose versions of these tools are often worse than they need to be: covered in ads, gated behind a signup, or quietly uploading your input to a server to do work a browser can do locally. ${C.NAME} keeps the useful part — the tool — front and centre, adds a short guide to each one covering how it works and the gotchas worth knowing, and stays free by showing a single, unobtrusive ad and nothing more. No account, no daily limits, no data collection.</p>
    <p>Found a bug or want a tool added? <a href="/contact">Get in touch</a>.</p>
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

// Commercial-intent comparison page targeting "convertcase alternative" and
// "text mechanic alternative".
//
// Deliberately ONE page covering both rather than a near-duplicate page per
// competitor: two thin comparison pages built from the same template is the
// exact scaled-content pattern the rest of this repo works to avoid.
//
// Claims were checked against each site on 2026-07-24 and are dated in the
// copy. Note this comparison is genuinely narrower than it looks — Convert
// Case has a much larger catalogue than Textbench and the page says so.
// Re-verify before revising; competitors change.
export const alternatives = {
  path: "/alternatives",
  title: `Convert Case & Text Mechanic Alternatives — ${C.NAME} Compared`,
  description:
    "How Textbench compares with Convert Case and Text Mechanic: what runs in your browser, what's rate-limited, and which one to use for which job.",
  bodyHtml: `
  <section class="prose">
    <h1>Convert Case and Text Mechanic alternatives</h1>
    <p>If you've landed here you're probably using one of the long-standing online text-tool sites and wondering whether something else is better. This is an honest comparison, including the part where one of them beats ${C.NAME} outright.</p>
    <p><strong>Short version:</strong> ${C.NAME} runs every tool in your browser with no rate limit and no paid tier. Convert Case has a considerably bigger catalogue. Text Mechanic caps free use per hour.</p>

    <h2>Text Mechanic: the hourly cap</h2>
    <p>Text Mechanic offers roughly 30+ tools and needs no signup, but free use is metered — hit it enough in a session and you get "Limit of 4 free tasks per hour exceeded", with Text Mechanic Pro sold as the way to remove it (checked July 2026).</p>
    <p>That limit also tells you something about the architecture: work you can rate-limit per hour is work happening on a server, which means your pasted text is being sent to one. For a case conversion that's unremarkable; for an API response with a token in it, or an internal document, it's worth knowing.</p>
    <p>${C.NAME} has no per-hour cap because there's nothing to cap — the work happens on your machine, so there's no server cost to ration and no queue to stand in.</p>

    <h2>Convert Case: genuinely bigger</h2>
    <p>Convert Case is free, needs no signup, and covers roughly 150+ tools across case conversion, code and data formatting, image conversion, Unicode font styles and random generators. That is <strong>more than ${C.NAME}'s ${C.TOOL_COUNT}</strong>, and if you want image format conversion or a specific generator that isn't here, it may simply have it and ${C.NAME} won't. Both sites carry ads.</p>
    <p>Where ${C.NAME} differs is what happens to your text. Convert Case doesn't state whether it processes client- or server-side; ${C.NAME} does everything locally and you can verify it — open the Network tab while you use a tool and nothing carrying your text goes out, and the tools keep working with your connection off.</p>

    <h2>What ${C.NAME} does differently</h2>
    <ul>
      <li><strong>Everything client-side.</strong> Paste an API response, a config file, or an internal document without handing it to a third party. The one exception is documented on its own page: <a href="/tools/qr-code-generator">the QR generator</a> calls an external image service, and says so.</li>
      <li><strong>No caps, no Pro tier.</strong> No per-hour limit, no monthly counter, no feature held back for a paid plan.</li>
      <li><strong>Works offline.</strong> It's installable and the tools keep running with no connection.</li>
      <li><strong>A guide on every tool page</strong> covering the parts that actually bite — <a href="/tools/uppercase-converter">why uppercasing German ß isn't reversible</a>, <a href="/tools/md5-hash-generator">why MD5 isn't for passwords</a>, <a href="/tools/base64-encode">why Base64 isn't encryption</a>.</li>
      <li><strong>Fast to get around.</strong> Cmd/Ctrl+K opens a search over all ${C.TOOL_COUNT} tools from any page.</li>
    </ul>

    <h2>Which to use</h2>
    <ul>
      <li><strong>Sensitive text</strong> — anything with credentials, customer data or unreleased work in it: use a client-side tool. That's ${C.NAME}'s whole design.</li>
      <li><strong>A tool ${C.NAME} doesn't have</strong> — image conversion and some niche generators aren't here. Convert Case's catalogue is larger; use it.</li>
      <li><strong>Bulk or repetitive work</strong> — an hourly cap gets in the way fast, so a local tool suits better.</li>
      <li><strong>You just need one quick conversion</strong> — honestly, any of the three will do it. <a href="/">Start here</a> if you'd rather it not leave your browser.</li>
    </ul>
    <p class="note">${C.NAME} is not affiliated with Convert Case or Text Mechanic. Their features, limits and pricing were checked in July 2026 and may have changed since — the fastest way to be sure is to look at their sites.</p>
  </section>`,
};

// The public "embed this" page. Its job is to make embedding easy enough that
// people actually do it — each embed places a real link on someone else's site,
// which is the family's binding constraint (see docs/seo-strategy.md).
export const embed = {
  path: "/embed",
  title: `Embed a free text tool on your site — ${C.NAME}`,
  description:
    "Put a live word counter on your own page for free. One line of HTML, no account, no tracking, nothing to maintain.",
  bodyHtml: `
  <section class="prose">
    <h1>Embed a text tool on your site</h1>
    <p>If you run a writing blog, a course page, a style guide or a submission-guidelines page, you can drop a working ${C.NAME} tool straight into it. It's free, there's no account, and there's nothing to keep updated — the widget improves whenever ${C.NAME} does.</p>

    <h2>Word counter</h2>
    <p>A live word, character, sentence and reading-time counter. Everything runs in the reader's own browser, exactly as it does here, so nothing your visitors type is sent anywhere — not to us, and not to you.</p>
    <p>Paste this where you want it to appear:</p>
    <pre class="embed-code"><code>&lt;iframe src="${C.SITE_URL}/embed/word-counter" width="100%" height="320"
        style="border:1px solid #ddd;border-radius:8px;max-width:640px"
        title="Word counter by ${C.NAME}" loading="lazy"&gt;&lt;/iframe&gt;
&lt;p style="font-size:13px"&gt;&lt;a href="${C.SITE_URL}/${C.COLLECTION_DIR}/word-counter"&gt;Word counter&lt;/a&gt;
   by &lt;a href="${C.SITE_URL}"&gt;${C.NAME}&lt;/a&gt;&lt;/p&gt;</code></pre>
    <p><a href="/embed/word-counter" target="_blank" rel="noopener">Preview the widget →</a></p>

    <h2>Why the snippet includes a credit line</h2>
    <p>The second half of that snippet — the small line under the widget — is the only thing we ask for, and it's deliberately plain HTML rather than something hidden. A link inside an iframe belongs to the iframe, not to your page, so without that visible line an embed gives us nothing at all. If you'd rather not include it, the widget will still work; we'd just quietly appreciate it if you did.</p>

    <h2>The details</h2>
    <ul>
      <li><strong>No tracking of your visitors.</strong> The widget runs the same client-side code as the rest of the site. Nothing typed into it leaves the reader's browser.</li>
      <li><strong>No account, no key, no rate limit.</strong> Embed it on as many pages as you like.</li>
      <li><strong>Resize it freely.</strong> Adjust <code>width</code> and <code>height</code> to suit your layout; the widget is responsive down to narrow columns.</li>
      <li><strong>It won't break.</strong> The embed URL is stable. If we change the tool, your embed picks it up automatically.</li>
    </ul>
    <p>Want a different tool embeddable — a character counter for a submissions page, or the <a href="/${C.COLLECTION_DIR}/readability-checker">readability checker</a> for an editorial style guide? <a href="/contact">Ask</a> and it'll likely get added.</p>
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
