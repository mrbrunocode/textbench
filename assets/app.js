/* Textbench engine — every transform is a pure text -> text function (or an
 * async one for the two hash transforms), run entirely client-side.
 * Collection pages render ONE fixed transform (the page's SEO target); the
 * home page is the flexible "workbench" with a dropdown that switches
 * between all of them, using the exact same functions so behaviour can
 * never drift between the two.
 */
(function () {
  "use strict";

  // ── Theme toggle (shared across every app in the family) ──────────────────
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}
  if (stored) root.setAttribute("data-theme", stored);
  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      var next = current === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  // Installable/offline shell: registers the service worker that caches
  // style.css/app.js/regex-worker.js/the icon (see sw.js) so the tools
  // themselves work offline once a page has loaded once. Deliberately placed
  // before the "prose pages have no editor" bail-out below, unlike most of
  // this file, so it runs site-wide (about/privacy/contact/terms included),
  // not just on tool pages — the `typeof navigator` guard keeps this safe
  // under the Node test harness, which stubs `document` but not `navigator`.
  // Deliberately never caches HTML pages — see sw.js's own comment for why.
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {});
    });
  }

  // ── Cmd+K command palette: jump to any of the tools from anywhere ─────────
  // Placed before the "prose pages have no editor" bail-out below, same
  // reasoning as the service worker registration above — this should work
  // from every page, not just tool pages. Guarded on both #cmdkTrigger and
  // #toolsIndex existing, which the Node test stub never provides, so this
  // whole block is a safe no-op under `npm test`.
  (function () {
    var trigger = document.getElementById("cmdkTrigger");
    var toolsIndexEl = document.getElementById("toolsIndex");
    if (!trigger || !toolsIndexEl) return;
    var items = [];
    try { items = JSON.parse(toolsIndexEl.textContent); } catch (e) {}
    if (!items.length) return;

    // ── Recently used tools: a localStorage-only, per-browser list — no
    // backend, never synced. Doubles as the Cmd+K palette's empty-query
    // view (jump back to what you were just using) and feeds the home
    // page's "Recently used" chip row (see below and pages.mjs).
    var RECENT_KEY = "textbench_recent";
    var MAX_RECENT = 6;
    function getRecent() {
      try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch (e) { return []; }
    }
    function recordVisit(path, title) {
      var list = getRecent().filter(function (r) { return r.path !== path; });
      list.unshift({ path: path, title: title });
      if (list.length > MAX_RECENT) list.length = MAX_RECENT;
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch (e) {}
    }
    var currentPath = location.pathname.replace(/\/$/, "") || "/";
    var currentItem = null;
    for (var ci = 0; ci < items.length; ci++) { if (items[ci].path === currentPath) { currentItem = items[ci]; break; } }
    if (currentItem) recordVisit(currentItem.path, currentItem.title);

    // Home page's "Recently used" chip row — same data, a second surface.
    // Hidden by default in the markup (pages.mjs); only unhidden here if
    // there's actually something to show.
    var recentBox = document.getElementById("recentTools");
    var recentChipsEl = document.getElementById("recentToolsChips");
    if (recentBox && recentChipsEl) {
      var homeRecent = getRecent();
      if (homeRecent.length) {
        recentChipsEl.innerHTML = homeRecent.map(function (item) {
          return '<a class="recent-tools-chip" href="' + item.path.replace(/"/g, "&quot;") + '">' +
            item.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</a>";
        }).join("");
        recentBox.hidden = false;
      }
    }

    var overlay = null, input, resultsEl, filtered = items, activeIndex = 0, showingRecent = false;

    function render() {
      var heading = showingRecent ? '<li class="cmdk-heading">Recently used</li>' : "";
      resultsEl.innerHTML = heading + filtered.map(function (item, i) {
        return '<li class="cmdk-item' + (i === activeIndex ? " is-active" : "") + '" data-path="' + item.path.replace(/"/g, "&quot;") + '">' +
          item.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</li>";
      }).join("");
      var activeEl = resultsEl.querySelector(".is-active");
      if (activeEl && activeEl.scrollIntoView) activeEl.scrollIntoView({ block: "nearest" });
    }

    function filter(query) {
      var q = query.trim().toLowerCase();
      if (!q) {
        var recent = getRecent();
        showingRecent = recent.length > 0;
        filtered = showingRecent ? recent : items;
      } else {
        showingRecent = false;
        filtered = items.filter(function (item) { return item.title.toLowerCase().indexOf(q) !== -1; });
      }
      activeIndex = 0;
      render();
    }

    function open() {
      if (!overlay) build();
      overlay.hidden = false;
      input.value = "";
      filter("");
      input.focus();
    }
    function close() {
      if (overlay) overlay.hidden = true;
    }

    function go(path) { if (path) location.href = path; }

    function onKeydown(e) {
      if (e.key === "Escape") { close(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, filtered.length - 1); render(); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); render(); return; }
      if (e.key === "Enter") { e.preventDefault(); var item = filtered[activeIndex]; if (item) go(item.path); }
    }

    function build() {
      overlay = document.createElement("div");
      overlay.className = "cmdk-overlay";
      overlay.hidden = true;
      overlay.innerHTML =
        '<div class="cmdk-panel" role="dialog" aria-modal="true" aria-label="Search tools">' +
        '<input type="text" class="cmdk-input" placeholder="Search tools…" autocomplete="off" spellcheck="false" aria-label="Search tools">' +
        '<ul class="cmdk-results"></ul>' +
        "</div>";
      document.body.appendChild(overlay);
      input = overlay.querySelector(".cmdk-input");
      resultsEl = overlay.querySelector(".cmdk-results");
      overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
      resultsEl.addEventListener("click", function (e) {
        var li = e.target.closest ? e.target.closest(".cmdk-item") : null;
        if (li) go(li.getAttribute("data-path"));
      });
      input.addEventListener("input", function () { filter(input.value); });
      input.addEventListener("keydown", onKeydown);
    }

    trigger.addEventListener("click", open);
    document.addEventListener("keydown", function (e) {
      var isK = e.key === "k" || e.key === "K";
      if (isK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (overlay && !overlay.hidden) close(); else open();
      }
    });
  })();

  var editor = document.getElementById("editor");
  if (!editor) return; // prose pages have no editor

  // Picker chips act like radio buttons with one exception: clicking the
  // already-active chip toggles back to "none" (the word/character counter)
  // instead of doing nothing — without this, picking any chip other than
  // "none" left no way back to the default view except switching tabs and
  // clicking "Word / character counter" directly.
  function nextChipValue(currentValue, clickedValue) {
    return clickedValue === currentValue ? "none" : clickedValue;
  }

  var WPM = 230;
  function count(text) {
    var trimmed = text.trim();
    var words = trimmed ? trimmed.split(/\s+/).length : 0;
    var characters = text.length;
    var charactersNoSpaces = text.replace(/\s/g, "").length;
    var sentences = (trimmed.match(/[^.!?]+[.!?]+(\s|$)/g) || []).length;
    if (trimmed && sentences === 0) sentences = 1;
    var reading = Math.max(words ? 1 : 0, Math.round(words / WPM));
    return { words: words, characters: characters, charactersNoSpaces: charactersNoSpaces, sentences: sentences, reading: reading };
  }
  function fmt(n) { return n.toLocaleString("en-US"); }

  // ── Transform library — pure functions, text in, text out ──────────────────
  function toTitleCase(s) {
    return s.replace(/\w\S*/g, function (t) { return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase(); });
  }
  function toSentenceCase(s) {
    var lower = s.toLowerCase();
    return lower.replace(/(^\s*[a-z0-9]|[.!?]\s+[a-z0-9])/g, function (c) { return c.toUpperCase(); });
  }
  function toAlternatingCase(s) {
    var i = -1;
    return s.replace(/[A-Za-z]/g, function (c) { i++; return i % 2 === 0 ? c.toLowerCase() : c.toUpperCase(); });
  }
  function toInverseCase(s) {
    return s.replace(/[A-Za-z]/g, function (c) { return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase(); });
  }
  function dedupeLines(s) {
    var seen = Object.create(null);
    return s.split("\n").filter(function (l) { var k = l.trim(); if (!k) return true; if (seen[k]) return false; seen[k] = 1; return true; }).join("\n");
  }
  function removeExtraSpaces(s) {
    return s.split("\n").map(function (l) { return l.replace(/[ \t]+/g, " ").trim(); }).join("\n");
  }
  function removeLineBreaks(s) {
    return s.split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean).join(" ");
  }
  function removeEmptyLines(s) {
    return s.split("\n").filter(function (l) { return l.trim() !== ""; }).join("\n");
  }
  function sortLines(s, dir) {
    var lines = s.split("\n");
    lines.sort(function (a, b) { return a.localeCompare(b, undefined, { sensitivity: "base" }); });
    if (dir === "za") lines.reverse();
    return lines.join("\n");
  }
  // Array.from (not split("")) so a surrogate-pair character — most emoji,
  // e.g. "🌍" — is treated as one Unicode code point and reversed as a whole
  // unit, instead of being torn into two lone surrogates that recombine into
  // invalid text (encodeURIComponent throws on the result, and it renders as
  // mojibake/replacement glyphs).
  function reverseText(s) { return Array.from(s).reverse().join(""); }
  function reverseLines(s) { return s.split("\n").reverse().join("\n"); }
  function trimLines(s) { return s.split("\n").map(function (l) { return l.trim(); }).join("\n"); }
  function addLineNumbers(s) { return s.split("\n").map(function (l, i) { return (i + 1) + ". " + l; }).join("\n"); }
  function slugify(s) {
    return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }
  function repeatText(s, n) {
    n = Math.max(1, Math.min(1000, n || 1));
    var out = []; for (var i = 0; i < n; i++) out.push(s);
    return out.join("\n");
  }
  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function findReplace(s, find, repl, useRegex) {
    if (!find) return s;
    try {
      var re = new RegExp(useRegex ? find : escapeRe(find), "g");
      return s.replace(re, repl || "");
    } catch (e) { return s; }
  }

  // ── Extraction ───────────────────────────────────────────────────────────
  function extractEmails(s) {
    var m = s.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    return Array.from(new Set(m)).join("\n");
  }
  function extractUrls(s) {
    var m = s.match(/\bhttps?:\/\/[^\s<>"')\]]+/g) || [];
    // A URL immediately followed by whitespace/EOL usually has trailing
    // sentence punctuation swept in ("visit https://x.com." → "…com."), which
    // isn't part of the URL — trim it off (mid-URL punctuation is untouched).
    var trimmed = m.map(function (u) { return u.replace(/[.,!?;:'"]+$/, ""); });
    return Array.from(new Set(trimmed)).join("\n");
  }
  function extractNumbers(s) {
    // A hyphen right after a digit/word char is a range or hyphenated ID
    // ("pages 10-20", "phone 555-1234"), not a minus sign — only treat "-" as
    // a sign when nothing word-like immediately precedes it.
    var m = s.match(/(?<!\w)-?\d+(?:\.\d+)?/g) || [];
    return m.join("\n");
  }

  // ── Encoding / decoding ─────────────────────────────────────────────────
  function base64Encode(s) { try { return btoa(unescape(encodeURIComponent(s))); } catch (e) { return "Could not encode this input."; } }
  function base64Decode(s) { try { return decodeURIComponent(escape(atob(s.trim()))); } catch (e) { return "Invalid Base64 input."; } }
  function urlEncode(s) { return encodeURIComponent(s); }
  function urlDecode(s) { try { return decodeURIComponent(s); } catch (e) { return "Invalid URL-encoded input."; } }
  function htmlEntitiesEncode(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function htmlEntitiesDecode(s) {
    var ta = document.createElement("textarea");
    ta.innerHTML = s;
    return ta.value;
  }
  function textToBinary(s) {
    return Array.from(new TextEncoder().encode(s)).map(function (b) { return b.toString(2).padStart(8, "0"); }).join(" ");
  }
  function binaryToText(s) {
    var tokens = s.trim().split(/\s+/).filter(Boolean);
    try {
      // Validate before building the Uint8Array — the typed array coerces
      // NaN/out-of-range values to 0 on construction, so checking bytes
      // *after* that point can never see an invalid token.
      var nums = tokens.map(function (t) { return parseInt(t, 2); });
      if (nums.some(function (n) { return isNaN(n) || n < 0 || n > 255; })) return "Invalid binary input.";
      var bytes = new Uint8Array(nums);
      return new TextDecoder().decode(bytes);
    } catch (e) { return "Invalid binary input."; }
  }
  function textToHex(s) {
    return Array.from(new TextEncoder().encode(s)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join(" ");
  }
  function hexToText(s) {
    var clean = s.trim().replace(/0x/gi, "").replace(/[\s,]+/g, "");
    if (clean.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(clean)) return "Invalid hex input.";
    try {
      var bytes = new Uint8Array(clean.match(/.{2}/g).map(function (h) { return parseInt(h, 16); }));
      return new TextDecoder().decode(bytes);
    } catch (e) { return "Invalid hex input."; }
  }
  function jsonFormat(s) {
    if (!s.trim()) return "";
    try { return JSON.stringify(JSON.parse(s), null, 2); }
    catch (e) { return "Invalid JSON: " + e.message; }
  }
  function jsonMinify(s) {
    if (!s.trim()) return "";
    try { return JSON.stringify(JSON.parse(s)); }
    catch (e) { return "Invalid JSON: " + e.message; }
  }
  // A small, dependency-free Markdown-to-HTML converter covering the
  // commonly-used subset (headers, bold/italic, inline/fenced code, links,
  // lists, blockquotes, horizontal rules, paragraphs) — not a full CommonMark
  // implementation, but enough for READMEs, notes and comments.
  function mdInline(s) {
    s = htmlEntitiesEncode(s);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, function (m, a, b) { return "<strong>" + (a || b) + "</strong>"; });
    s = s.replace(/\*([^*]+)\*|_([^_]+)_/g, function (m, a, b) { return "<em>" + (a || b) + "</em>"; });
    s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">');
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    return s;
  }
  function markdownToHtml(s) {
    var lines = normalizeMd(s).split("\n");
    var html = [], i = 0, para = [];
    function flushPara() {
      if (para.length) { html.push("<p>" + mdInline(para.join(" ")) + "</p>"); para = []; }
    }
    var listStack = []; // stack of "ul" | "ol" currently open
    function closeLists() { while (listStack.length) { html.push("</" + listStack.pop() + ">"); } }
    while (i < lines.length) {
      var line = lines[i];
      var h = line.match(/^(#{1,6})\s+(.*)$/);
      var fence = line.match(/^```/);
      var quote = line.match(/^>\s?(.*)$/);
      var ul = line.match(/^[-*]\s+(.*)$/);
      var ol = line.match(/^\d+\.\s+(.*)$/);
      var hr = line.match(/^(-{3,}|\*{3,}|_{3,})\s*$/);
      if (fence) {
        flushPara(); closeLists();
        var codeLines = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) { codeLines.push(lines[i]); i++; }
        html.push("<pre><code>" + htmlEntitiesEncode(codeLines.join("\n")) + "</code></pre>");
        i++; continue;
      }
      if (h) { flushPara(); closeLists(); html.push("<h" + h[1].length + ">" + mdInline(h[2]) + "</h" + h[1].length + ">"); i++; continue; }
      if (hr) { flushPara(); closeLists(); html.push("<hr>"); i++; continue; }
      if (quote) { flushPara(); closeLists(); html.push("<blockquote>" + mdInline(quote[1]) + "</blockquote>"); i++; continue; }
      if (ul) {
        flushPara();
        if (listStack[listStack.length - 1] !== "ul") { closeLists(); html.push("<ul>"); listStack.push("ul"); }
        html.push("<li>" + mdInline(ul[1]) + "</li>"); i++; continue;
      }
      if (ol) {
        flushPara();
        if (listStack[listStack.length - 1] !== "ol") { closeLists(); html.push("<ol>"); listStack.push("ol"); }
        html.push("<li>" + mdInline(ol[1]) + "</li>"); i++; continue;
      }
      if (line.trim() === "") { flushPara(); closeLists(); i++; continue; }
      para.push(line.trim()); i++;
    }
    flushPara(); closeLists();
    return html.join("\n");
  }
  function normalizeMd(s) { return s.replace(/\r\n?/g, "\n"); }

  // Strips Markdown syntax down to clean prose — the inverse direction from
  // markdownToHtml above, for pasting Markdown-formatted text (a README, a
  // changelog) somewhere that wants plain text instead (an email, a plain
  // textarea). Line-based like markdownToHtml, but each line just has its
  // markup removed rather than replaced with a tag.
  function markdownToText(s) {
    var lines = normalizeMd(s).split("\n");
    var out = [];
    var inFence = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (/^```/.test(line)) { inFence = !inFence; continue; } // fence markers themselves are dropped, code content kept
      if (inFence) { out.push(line); continue; }
      var t = line
        .replace(/^(#{1,6})\s+/, "") // headers
        .replace(/^>\s?/, "") // blockquote
        .replace(/^[-*]\s+/, "") // unordered list marker
        .replace(/^\d+\.\s+/, "") // ordered list marker
        .replace(/^(-{3,}|\*{3,}|_{3,})\s*$/, "") // horizontal rule
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images -> alt text
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> link text
        .replace(/(\*\*\*|___)(.*?)\1/g, "$2") // bold+italic
        .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
        .replace(/(\*|_)(.*?)\1/g, "$2") // italic
        .replace(/`([^`]*)`/g, "$1"); // inline code
      out.push(t);
    }
    // Collapse 3+ blank lines down to a single blank line between paragraphs.
    return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  // Sorted "word — count" list, most-frequent first (ties broken
  // alphabetically for a stable, predictable order). Punctuation-stripped,
  // case-insensitive — "Word," and "word" are the same word.
  function wordFrequency(s) {
    var words = (s.toLowerCase().match(/[a-z0-9']+/g) || []);
    var counts = {};
    for (var i = 0; i < words.length; i++) counts[words[i]] = (counts[words[i]] || 0) + 1;
    var entries = Object.keys(counts).map(function (w) { return [w, counts[w]]; });
    entries.sort(function (a, b) { return b[1] - a[1] || (a[0] < b[0] ? -1 : 1); });
    return entries.map(function (e) { return e[0] + " — " + e[1]; }).join("\n");
  }

  // Lightweight stats comparison between two texts — word/character count
  // deltas plus a bag-of-words overlap percentage (Jaccard similarity on the
  // unique lowercase word sets). Deliberately NOT a line-by-line diff — that's
  // Diffhero's job; this answers "how different are these, roughly" in one
  // glance, not "which exact lines changed".
  function compareTexts(a, b) {
    var wa = count(a).words, wb = count(b).words;
    var ca = a.length, cb = b.length;
    var setA = {}, setB = {};
    (a.toLowerCase().match(/[a-z0-9']+/g) || []).forEach(function (w) { setA[w] = true; });
    (b.toLowerCase().match(/[a-z0-9']+/g) || []).forEach(function (w) { setB[w] = true; });
    var keysA = Object.keys(setA), keysB = Object.keys(setB);
    var shared = keysA.filter(function (w) { return setB[w]; }).length;
    var union = keysA.length + keysB.length - shared;
    var overlapPct = union > 0 ? Math.round((shared / union) * 100) : (keysA.length === 0 && keysB.length === 0 ? 100 : 0);
    return {
      wordsA: wa, wordsB: wb, wordDelta: wb - wa,
      charsA: ca, charsB: cb, charDelta: cb - ca,
      overlapPct: overlapPct,
    };
  }

  // ── CSV <-> JSON (hand-rolled; no library needed for this pair) ──────────
  // Parses the WHOLE input at once, quote-state carried across the entire
  // string, rather than splitting into lines first — a quoted CSV field is
  // allowed to contain a literal newline (e.g. a multi-line address or note),
  // and splitting on "\n" before parsing quotes tears that field in two,
  // producing extra bogus rows. This is also what jsonToCsv's own csvCell()
  // produces for a value containing "\n" (it quotes the whole field), so
  // splitting into lines first broke the JSON -> CSV -> JSON round-trip for
  // any value with an embedded newline.
  function parseCsvRecords(s) {
    var text = s.replace(/\r\n?/g, "\n");
    var rows = [], row = [], cur = "", inQuotes = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQuotes) {
        if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else inQuotes = false; }
        else cur += c;
      } else {
        if (c === '"') inQuotes = true;
        else if (c === ",") { row.push(cur); cur = ""; }
        else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
        else cur += c;
      }
    }
    if (cur.length > 0 || row.length > 0) { row.push(cur); rows.push(row); }
    // A raw blank source line (nothing between two newlines) parses to a
    // single empty-string cell — drop it, matching the previous behaviour of
    // filtering zero-length lines before parsing (a genuine single-column
    // row with an empty value still has a non-empty line, so is unaffected).
    return rows.filter(function (r) { return !(r.length === 1 && r[0] === ""); });
  }
  function csvToJson(s) {
    var records = parseCsvRecords(s);
    if (!records.length) return "[]";
    var header = records[0];
    var rows = records.slice(1).map(function (cells) {
      var obj = {};
      header.forEach(function (h, i) { obj[h] = cells[i] !== undefined ? cells[i] : ""; });
      return obj;
    });
    return JSON.stringify(rows, null, 2);
  }
  function csvCell(v) {
    var s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function jsonToCsv(s) {
    if (!s.trim()) return "";
    var data;
    try { data = JSON.parse(s); } catch (e) { return "Invalid JSON: " + e.message; }
    if (!Array.isArray(data)) return "Invalid input: expected a JSON array of objects.";
    if (!data.length) return "";
    // Union of every row's keys, not just data[0]'s — objects further down
    // the array commonly have extra/optional fields the first one lacks
    // (sparse data is the normal case for real-world JSON), and using only
    // the first row's keys as the header silently dropped that data instead
    // of at least surfacing an empty cell for it.
    var header = [], seen = Object.create(null);
    data.forEach(function (row) {
      Object.keys(row || {}).forEach(function (k) { if (!seen[k]) { seen[k] = 1; header.push(k); } });
    });
    var lines = [header.map(csvCell).join(",")];
    data.forEach(function (row) { lines.push(header.map(function (h) { return csvCell(row[h]); }).join(",")); });
    return lines.join("\n");
  }

  // ── YAML <-> JSON (via js-yaml, loaded lazily on first use) ──────────────
  var yamlLibPromise = null;
  function loadYamlLib() {
    if (yamlLibPromise) return yamlLibPromise;
    yamlLibPromise = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.1/js-yaml.min.js";
      s.onload = resolve;
      s.onerror = function () { reject(new Error("Could not load the YAML library.")); };
      document.head.appendChild(s);
    });
    return yamlLibPromise;
  }
  function yamlToJson(s) {
    if (!s.trim()) return "";
    return loadYamlLib().then(function () {
      try { return JSON.stringify(window.jsyaml.load(s), null, 2); }
      catch (e) { return "Invalid YAML: " + e.message; }
    });
  }
  function jsonToYaml(s) {
    if (!s.trim()) return "";
    var data;
    try { data = JSON.parse(s); } catch (e) { return Promise.resolve("Invalid JSON: " + e.message); }
    return loadYamlLib().then(function () { return window.jsyaml.dump(data); });
  }
  var MORSE = { A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
    K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
    U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
    "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....",
    "6": "-....", "7": "--...", "8": "---..", "9": "----.", ".": ".-.-.-", ",": "--..--", "?": "..--.." };
  var MORSE_REV = (function () { var r = {}; for (var k in MORSE) r[MORSE[k]] = k; return r; })();
  function textToMorse(s) {
    return s.toUpperCase().split(" ").map(function (word) {
      return word.split("").map(function (c) { return MORSE[c] || ""; }).filter(Boolean).join(" ");
    }).join(" / ");
  }
  function morseToText(s) {
    return s.trim().split(" / ").map(function (word) {
      return word.trim().split(/\s+/).map(function (code) { return MORSE_REV[code] || ""; }).join("");
    }).join(" ");
  }
  function rot13(s) {
    return s.replace(/[a-zA-Z]/g, function (c) {
      var base = c <= "Z" ? 65 : 97;
      return String.fromCharCode((c.charCodeAt(0) - base + 13) % 26 + base);
    });
  }

  // ── Hashing ──────────────────────────────────────────────────────────────
  function md5(s) {
    // Compact, standard RFC 1321 MD5 — pure JS, no dependency.
    function rotl(x, c) { return (x << c) | (x >>> (32 - c)); }
    function toBytesUtf8(str) { return new TextEncoder().encode(str); }
    var K = [], i;
    for (i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) | 0;
    var S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
      5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
      4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
      6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
    var msg = toBytesUtf8(s);
    var origLenBits = msg.length * 8;
    var withOne = new Uint8Array(((msg.length + 8) >> 6) * 64 + 64);
    withOne.set(msg); withOne[msg.length] = 0x80;
    var totalLen = withOne.length;
    var view = new DataView(withOne.buffer);
    view.setUint32(totalLen - 8, origLenBits >>> 0, true);
    view.setUint32(totalLen - 4, Math.floor(origLenBits / 4294967296), true);
    var a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
    for (var chunkStart = 0; chunkStart < totalLen; chunkStart += 64) {
      var M = [];
      for (i = 0; i < 16; i++) M[i] = view.getUint32(chunkStart + i * 4, true);
      var A = a0, B = b0, C = c0, D = d0, F, g;
      for (i = 0; i < 64; i++) {
        if (i < 16) { F = (B & C) | (~B & D); g = i; }
        else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
        else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
        else { F = C ^ (B | ~D); g = (7 * i) % 16; }
        F = (F + A + K[i] + M[g]) | 0;
        A = D; D = C; C = B;
        B = (B + rotl(F, S[i])) | 0;
      }
      a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
    }
    function toHexLE(n) {
      var bytes = [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];
      return bytes.map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    }
    return toHexLE(a0) + toHexLE(b0) + toHexLE(c0) + toHexLE(d0);
  }
  function sha256Async(s) {
    if (!(window.crypto && window.crypto.subtle)) return Promise.resolve("SHA-256 requires a secure (HTTPS) context.");
    return window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    });
  }

  // ── Generators (no source text needed) ──────────────────────────────────
  function uuidV4() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    var bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; bytes[8] = (bytes[8] & 0x3f) | 0x80;
    var hex = Array.from(bytes).map(function (b) { return b.toString(16).padStart(2, "0"); });
    return hex.slice(0, 4).join("") + "-" + hex.slice(4, 6).join("") + "-" + hex.slice(6, 8).join("") + "-" + hex.slice(8, 10).join("") + "-" + hex.slice(10, 16).join("");
  }
  function uuidGenerator(n) {
    n = Math.max(1, Math.min(200, n || 1));
    var out = []; for (var i = 0; i < n; i++) out.push(uuidV4());
    return out.join("\n");
  }
  function randomPassword(length, useUpper, useNumbers, useSymbols) {
    length = Math.max(4, Math.min(128, length || 16));
    var pool = "abcdefghijklmnopqrstuvwxyz";
    if (useUpper) pool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useNumbers) pool += "0123456789";
    if (useSymbols) pool += "!@#$%^&*()-_=+[]{}";
    var bytes = new Uint8Array(length);
    window.crypto.getRandomValues(bytes);
    var out = "";
    for (var i = 0; i < length; i++) out += pool[bytes[i] % pool.length];
    return out;
  }

  // ── Fun text styles (Unicode tricks) ────────────────────────────────────
  // Array.from, same reasoning as reverseText above: a combining strikethrough
  // mark must land after the whole code point, not after half a surrogate pair.
  function strikethroughText(s) { return Array.from(s).map(function (c) { return c + "̶"; }).join(""); }
  var UPSIDE_MAP = { a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", h: "ɥ",
    i: "ı", j: "ɾ", k: "ʞ", l: "l", m: "ɯ", n: "u", o: "o", p: "d", q: "b", r: "ɹ",
    s: "s", t: "ʇ", u: "n", v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z",
    A: "∀", B: "၁2", C: "Ɔ", D: "ᗡ", E: "Ǝ", F: "Ⅎ", G: "⅁", H: "H",
    I: "I", J: "ſ", K: "⋊", L: "˥", M: "W", N: "N", O: "O", P: "Ԁ", Q: "Ό",
    R: "ᴚ", S: "S", T: "⊥", U: "∩", V: "Λ", W: "M", X: "X", Y: "⅄", Z: "Z",
    "0": "0", "1": "⇂", "2": "ᄅ", "3": "Ɛ", "4": "ㄣ", "5": "ϛ", "6": "9", "9": "6",
    "7": "ㄥ", "8": "8", ".": "˙", ",": "'", "'": ",", "?": "¿", "!": "¡", "(": ")", ")": "(" };
  function upsideDownText(s) {
    // Array.from, same reasoning as reverseText above — otherwise reversing
    // a surrogate-pair character (most emoji) splits it into two lone
    // surrogates before either half can be reunited.
    return Array.from(s).map(function (c) { return UPSIDE_MAP[c] !== undefined ? UPSIDE_MAP[c] : c; }).reverse().join("");
  }
  var BOLD_MAP = (function () {
    var m = {}, i;
    for (i = 0; i < 26; i++) { m[String.fromCharCode(97 + i)] = String.fromCodePoint(0x1D41A + i); m[String.fromCharCode(65 + i)] = String.fromCodePoint(0x1D400 + i); }
    for (i = 0; i < 10; i++) m[String(i)] = String.fromCodePoint(0x1D7CE + i);
    return m;
  })();
  function boldUnicodeText(s) { return s.split("").map(function (c) { return BOLD_MAP[c] || c; }).join(""); }

  var LOREM_WORDS = ("lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt " +
    "ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi " +
    "aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat " +
    "nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit " +
    "anim id est laborum").split(" ");
  function loremSentence(len) {
    var w = [];
    for (var i = 0; i < len; i++) w.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
    var s = w.join(" ");
    return s.charAt(0).toUpperCase() + s.slice(1) + ".";
  }
  function loremParagraph() {
    var sentences = 3 + Math.floor(Math.random() * 4), out = [];
    for (var i = 0; i < sentences; i++) out.push(loremSentence(6 + Math.floor(Math.random() * 10)));
    return out.join(" ");
  }
  function loremIpsum(n) {
    n = Math.max(1, Math.min(50, n || 3));
    var paras = []; for (var i = 0; i < n; i++) paras.push(loremParagraph());
    return paras.join("\n\n");
  }

  var TRANSFORMS = {
    "none": function (s) { return s; },
    "uppercase": function (s) { return s.toUpperCase(); },
    "lowercase": function (s) { return s.toLowerCase(); },
    "titlecase": toTitleCase,
    "sentencecase": toSentenceCase,
    "alternating-case": toAlternatingCase,
    "inverse-case": toInverseCase,
    "dedupe-lines": dedupeLines,
    "remove-extra-spaces": removeExtraSpaces,
    "remove-line-breaks": removeLineBreaks,
    "remove-empty-lines": removeEmptyLines,
    "sort-az": function (s) { return sortLines(s, "az"); },
    "sort-za": function (s) { return sortLines(s, "za"); },
    "reverse-text": reverseText,
    "reverse-lines": reverseLines,
    "trim-lines": trimLines,
    "add-line-numbers": addLineNumbers,
    "slugify": slugify,
    "extract-emails": extractEmails,
    "extract-urls": extractUrls,
    "extract-numbers": extractNumbers,
    "base64-encode": base64Encode,
    "base64-decode": base64Decode,
    "url-encode": urlEncode,
    "url-decode": urlDecode,
    "html-entities-encode": htmlEntitiesEncode,
    "html-entities-decode": htmlEntitiesDecode,
    "binary-encode": textToBinary,
    "binary-decode": binaryToText,
    "hex-encode": textToHex,
    "hex-decode": hexToText,
    "morse-encode": textToMorse,
    "morse-decode": morseToText,
    "rot13": rot13,
    "md5-hash": md5,
    "strikethrough-text": strikethroughText,
    "upside-down-text": upsideDownText,
    "bold-text": boldUnicodeText,
    "json-format": jsonFormat,
    "json-minify": jsonMinify,
    "markdown-to-html": markdownToHtml,
    "markdown-to-text": markdownToText,
    "word-frequency": wordFrequency,
    "csv-to-json": csvToJson,
    "json-to-csv": jsonToCsv,
    "yaml-to-json": yamlToJson,
    "json-to-yaml": jsonToYaml,
  };

  // Exposes the pure transform functions to Node's test runner (see
  // test/transforms.test.mjs and test/helpers/load-app.mjs — the latter
  // stubs just enough of `document` to reach this point without a real
  // page). Placed here, after every transform and its data table (MORSE,
  // LOREM_WORDS, BOLD_MAP, TRANSFORMS, ...) is fully initialized, and before
  // the DOM wiring below that a test environment has no elements for.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      count: count, toTitleCase: toTitleCase, toSentenceCase: toSentenceCase,
      toAlternatingCase: toAlternatingCase, toInverseCase: toInverseCase,
      dedupeLines: dedupeLines, removeExtraSpaces: removeExtraSpaces,
      removeLineBreaks: removeLineBreaks, removeEmptyLines: removeEmptyLines,
      sortLines: sortLines, reverseText: reverseText, reverseLines: reverseLines,
      trimLines: trimLines, addLineNumbers: addLineNumbers, slugify: slugify,
      repeatText: repeatText, findReplace: findReplace, extractEmails: extractEmails,
      extractUrls: extractUrls, extractNumbers: extractNumbers,
      base64Encode: base64Encode, base64Decode: base64Decode,
      urlEncode: urlEncode, urlDecode: urlDecode,
      htmlEntitiesEncode: htmlEntitiesEncode,
      textToBinary: textToBinary, binaryToText: binaryToText,
      textToHex: textToHex, hexToText: hexToText,
      textToMorse: textToMorse, morseToText: morseToText, rot13: rot13,
      md5: md5, sha256Async: sha256Async, uuidV4: uuidV4, uuidGenerator: uuidGenerator,
      randomPassword: randomPassword, strikethroughText: strikethroughText,
      upsideDownText: upsideDownText, boldUnicodeText: boldUnicodeText,
      jsonFormat: jsonFormat, jsonMinify: jsonMinify, markdownToHtml: markdownToHtml,
      markdownToText: markdownToText, wordFrequency: wordFrequency, compareTexts: compareTexts,
      csvToJson: csvToJson, jsonToCsv: jsonToCsv, yamlToJson: yamlToJson, jsonToYaml: jsonToYaml,
      loremSentence: loremSentence, loremParagraph: loremParagraph, loremIpsum: loremIpsum,
      nextChipValue: nextChipValue,
    };
    return;
  }

  var toolEl = document.querySelector(".tool");
  var transform = (toolEl && toolEl.getAttribute("data-transform")) || "none";
  var shape = (toolEl && toolEl.getAttribute("data-shape")) || "simple";
  var output = document.getElementById("output");
  var transformSel = document.getElementById("transformSel"); // home page only

  var findEl = document.getElementById("findInput");
  var replEl = document.getElementById("replaceInput");
  var regexEl = document.getElementById("regexToggle");
  var repeatEl = document.getElementById("repeatCount");
  var loremEl = document.getElementById("loremCount");
  var uuidCountEl = document.getElementById("uuidCount");
  var pwLenEl = document.getElementById("pwLength");
  var pwUpperEl = document.getElementById("pwUpper");
  var pwNumbersEl = document.getElementById("pwNumbers");
  var regexPatternEl = document.getElementById("regexPattern");
  var regexErrorEl = document.getElementById("regexError");
  var regexHighlightEl = document.getElementById("regexHighlight");
  var regexSummaryEl = document.getElementById("regexSummary");
  var regexMatchesEl = document.getElementById("regexMatches");
  var regexFlagG = document.getElementById("regexFlagG");
  var regexFlagI = document.getElementById("regexFlagI");
  var regexFlagM = document.getElementById("regexFlagM");
  var regexFlagS = document.getElementById("regexFlagS");
  var pwSymbolsEl = document.getElementById("pwSymbols");
  var compareBEl = document.getElementById("compareB");
  var compareWordsAEl = document.getElementById("compareWordsA");
  var compareWordsBEl = document.getElementById("compareWordsB");
  var compareWordDeltaEl = document.getElementById("compareWordDelta");
  var compareCharDeltaEl = document.getElementById("compareCharDelta");
  var compareOverlapEl = document.getElementById("compareOverlap");

  var NO_INPUT = { "lorem-ipsum": 1, "uuid-generator": 1, "password-generator": 1 };

  function currentTransform() {
    if (transformSel) return transformSel.value;
    return transform;
  }

  // Returns a string OR a Promise<string> — render() awaits either uniformly.
  function apply(text) {
    var t = currentTransform();
    if (t === "find-replace") return findReplace(text, findEl ? findEl.value : "", replEl ? replEl.value : "", !!(regexEl && regexEl.checked));
    if (t === "text-repeater") return repeatText(text, repeatEl ? parseInt(repeatEl.value, 10) : 1);
    if (t === "lorem-ipsum") return loremIpsum(loremEl ? parseInt(loremEl.value, 10) : 3);
    if (t === "uuid-generator") return uuidGenerator(uuidCountEl ? parseInt(uuidCountEl.value, 10) : 1);
    if (t === "password-generator") return randomPassword(
      pwLenEl ? parseInt(pwLenEl.value, 10) : 16,
      pwUpperEl ? pwUpperEl.checked : true,
      pwNumbersEl ? pwNumbersEl.checked : true,
      pwSymbolsEl ? pwSymbolsEl.checked : false
    );
    if (t === "sha256-hash") return sha256Async(text);
    var fn = TRANSFORMS[t] || TRANSFORMS.none;
    return fn(text);
  }

  var statsEl = document.querySelector(".stats");
  var limitVal = statsEl && statsEl.getAttribute("data-limit") ? parseInt(statsEl.getAttribute("data-limit"), 10) : null;
  var limitNumEl = document.querySelector('[data-count="remaining"]');
  var limitCardEl = document.querySelector(".stat--limit");

  // Regex tester: not a text-in/text-out transform, so it bypasses apply()/
  // TRANSFORMS entirely — the "result" is the test string with matches
  // wrapped in <mark>, plus a separate match list with capture groups.
  //
  // Matching runs in a Worker (assets/regex-worker.js), not inline, so a
  // catastrophic-backtracking pattern (e.g. /^(a+)+$/ against a long
  // non-matching string) can't freeze the tab: if the worker doesn't answer
  // within REGEX_TIMEOUT_MS, it's terminated and replaced, and the tester
  // shows a clear message instead of hanging. Still 100% client-side — a
  // Worker is a separate thread in the same browser process, not a network
  // request.
  var REGEX_TIMEOUT_MS = 1500;
  var regexWorker = null, regexReqId = 0, regexPendingTimeout = null;
  function getRegexWorker() {
    if (!regexWorker) {
      regexWorker = new Worker(window.REGEX_WORKER_URL || "assets/regex-worker.js");
      regexWorker.onmessage = handleRegexWorkerMessage;
    }
    return regexWorker;
  }
  function clearRegexTimeout() {
    if (regexPendingTimeout) { clearTimeout(regexPendingTimeout); regexPendingTimeout = null; }
  }
  function handleRegexWorkerMessage(e) {
    if (e.data.id !== regexReqId) return; // a stale response from a superseded request
    clearRegexTimeout();
    var text = editor.value;
    if (!e.data.ok) {
      regexErrorEl.textContent = "Invalid pattern: " + e.data.error;
      regexHighlightEl.textContent = text;
      regexSummaryEl.textContent = "";
      regexMatchesEl.innerHTML = "";
      return;
    }
    regexErrorEl.textContent = "";
    renderRegexMatches(e.data.matches, text);
  }
  function renderRegexMatches(matches, text) {
    var html = "", cursor = 0;
    matches.forEach(function (m) {
      html += htmlEntitiesEncode(text.slice(cursor, m.index));
      html += "<mark>" + htmlEntitiesEncode(m.groups[0]) + "</mark>";
      cursor = m.index + m.groups[0].length;
    });
    html += htmlEntitiesEncode(text.slice(cursor));
    regexHighlightEl.innerHTML = text ? html : "Matches appear highlighted here…";
    regexSummaryEl.textContent = matches.length + " match" + (matches.length === 1 ? "" : "es");
    regexMatchesEl.innerHTML = matches.map(function (m, i) {
      var groups = m.groups.length > 1
        ? " — groups: " + m.groups.slice(1).map(function (g, gi) { return (gi + 1) + "=“" + (g === undefined ? "" : htmlEntitiesEncode(g)) + "”"; }).join(", ")
        : "";
      return "<li>" + (i + 1) + ". “" + htmlEntitiesEncode(m.groups[0]) + "”" + groups + "</li>";
    }).join("");
  }
  function renderRegexTester() {
    var text = editor.value;
    var pattern = regexPatternEl.value;
    clearRegexTimeout();
    if (!pattern) {
      regexReqId++; // supersede any in-flight request so its response is ignored
      regexErrorEl.textContent = "";
      regexHighlightEl.textContent = text || "Matches appear highlighted here…";
      regexSummaryEl.textContent = "";
      regexMatchesEl.innerHTML = "";
      return;
    }
    var flags = (regexFlagG.checked ? "g" : "") + (regexFlagI.checked ? "i" : "") + (regexFlagM.checked ? "m" : "") + (regexFlagS.checked ? "s" : "");
    var myId = ++regexReqId;
    var worker;
    try { worker = getRegexWorker(); }
    catch (e) {
      // Worker construction itself failed (e.g. blocked by an extension) —
      // nothing safe to fall back to inline without reintroducing the freeze
      // risk, so surface it rather than silently hang.
      regexErrorEl.textContent = "Couldn't start the regex tester in this browser.";
      return;
    }
    worker.postMessage({ id: myId, pattern: pattern, flags: flags, text: text });
    regexPendingTimeout = setTimeout(function () {
      if (myId !== regexReqId) return;
      if (regexWorker) { regexWorker.terminate(); regexWorker = null; } // a hung worker can't be reused — replace it
      regexErrorEl.textContent = "This pattern is taking too long to run (it may be causing catastrophic backtracking) — try a simpler pattern or shorter test string.";
      regexHighlightEl.textContent = text;
      regexSummaryEl.textContent = "";
      regexMatchesEl.innerHTML = "";
    }, REGEX_TIMEOUT_MS);
  }

  // QR code generator: renders entirely client-side via a small library
  // (qrcodejs, loaded lazily from a CDN on first use — same trust model as
  // the fonts already loaded this way) rather than an external QR API, so
  // it stays consistent with "nothing leaves your browser".
  var qrCanvasEl = document.getElementById("qrCanvas");
  var qrHintEl = document.getElementById("qrHint");
  var qrDownloadBtn = document.getElementById("qrDownloadBtn");
  var qrLib = null, qrInstance = null;
  function loadQrLib() {
    if (qrLib) return qrLib;
    qrLib = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      s.onload = resolve;
      s.onerror = function () { reject(new Error("Could not load the QR code library.")); };
      document.head.appendChild(s);
    });
    return qrLib;
  }
  function renderQr() {
    var text = editor.value;
    if (!text) {
      qrCanvasEl.innerHTML = "";
      qrHintEl.textContent = "Type something above to generate a QR code.";
      qrHintEl.hidden = false;
      return;
    }
    qrHintEl.textContent = "Generating…";
    qrHintEl.hidden = false;
    loadQrLib().then(function () {
      if (editor.value !== text) return; // input changed again while the library was loading
      qrCanvasEl.innerHTML = "";
      // The QR library throws (a raw, technical exception, e.g. "Cannot read
      // properties of undefined") once text exceeds the format's real
      // capacity, rather than returning an error — surfacing that message
      // as-is contradicts this page's own FAQ ("if that happens, shorten the
      // text"), so catch it here and show that same actionable guidance.
      try {
        qrInstance = new window.QRCode(qrCanvasEl, { text: text, width: 200, height: 200 });
        qrHintEl.hidden = true;
      } catch (e) {
        qrHintEl.textContent = "This text is too long to fit in a QR code — try shortening it.";
        qrHintEl.hidden = false;
      }
    }).catch(function (e) {
      qrHintEl.textContent = e.message;
      qrHintEl.hidden = false;
    });
  }
  if (qrDownloadBtn) qrDownloadBtn.addEventListener("click", function () {
    var img = qrCanvasEl.querySelector("img");
    var canvas = qrCanvasEl.querySelector("canvas");
    var url = img ? img.src : (canvas ? canvas.toDataURL("image/png") : null);
    if (!url) return;
    var a = document.createElement("a");
    a.href = url; a.download = "qr-code.png";
    document.body.appendChild(a); a.click(); a.remove();
  });

  function fmtDelta(n) { return (n > 0 ? "+" : "") + fmt(n); }
  function renderCompare() {
    var c = compareTexts(editor.value, compareBEl.value);
    compareWordsAEl.textContent = fmt(c.wordsA);
    compareWordsBEl.textContent = fmt(c.wordsB);
    compareWordDeltaEl.textContent = fmtDelta(c.wordDelta);
    compareCharDeltaEl.textContent = fmtDelta(c.charDelta);
    compareOverlapEl.textContent = c.overlapPct + "%";
  }

  var renderToken = 0;
  function render() {
    if (regexPatternEl) { renderRegexTester(); return; }
    if (qrCanvasEl) { renderQr(); return; }
    if (compareBEl) { renderCompare(); return; }
    var myToken = ++renderToken;
    var t = currentTransform();
    var result = apply(NO_INPUT[t] ? "" : editor.value);
    Promise.resolve(result).then(function (resultText) {
      if (myToken !== renderToken) return; // a newer render started; drop this stale async result
      var statsSource = (shape === "counter") ? editor.value : resultText;
      var c = count(statsSource);
      document.querySelectorAll("[data-count]").forEach(function (el) {
        var key = el.getAttribute("data-count");
        if (key in c) el.textContent = fmt(c[key]);
      });
      if (limitVal !== null && limitNumEl) {
        var remaining = limitVal - c.characters;
        limitNumEl.textContent = fmt(remaining);
        if (limitCardEl) limitCardEl.classList.toggle("is-over", remaining < 0);
      }
      if (output) output.value = resultText;
    });
  }

  editor.addEventListener("input", render);
  [findEl, replEl, regexEl, repeatEl, loremEl, uuidCountEl, pwLenEl, pwUpperEl, pwNumbersEl, pwSymbolsEl,
    regexPatternEl, regexFlagG, regexFlagI, regexFlagM, regexFlagS, compareBEl].forEach(function (el) {
    if (el) el.addEventListener("input", render);
  });
  if (regexPatternEl) render(); // show the empty-pattern placeholder immediately, not a blank box
  // Tool picker: category tabs + chip grid drive the (visually hidden)
  // transformSel select, which stays the single source of truth. Any change
  // to it — a chip click, but also a keyboard/screen-reader user operating
  // the select directly — must resync which tab/panel/chip LOOKS active, or
  // the visible picker silently disagrees with the tool that's actually
  // running (exactly for the audience the accessible <select> path exists for).
  var pickerTabs = document.querySelectorAll(".tab[data-group-tab]");
  var pickerPanels = document.querySelectorAll(".chip-grid[data-group-panel]");
  function syncPickerUI() {
    if (!pickerTabs.length || !transformSel) return;
    var chip = document.querySelector('.chip[data-value="' + transformSel.value + '"]');
    var panel = chip && chip.closest(".chip-grid");
    var group = panel && panel.getAttribute("data-group-panel");
    pickerTabs.forEach(function (t) {
      var active = t.getAttribute("data-group-tab") === group;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
    });
    pickerPanels.forEach(function (p) { p.hidden = p.getAttribute("data-group-panel") !== group; });
    document.querySelectorAll(".chip[data-value]").forEach(function (c) { c.classList.toggle("is-active", c === chip); });
  }
  if (transformSel) {
    transformSel.addEventListener("change", function () {
      if (toolEl) toolEl.setAttribute("data-transform", transformSel.value);
      syncShapeVisibility();
      syncPickerUI();
      render();
    });
  }
  pickerTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      pickerTabs.forEach(function (t) { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      var group = tab.getAttribute("data-group-tab");
      pickerPanels.forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-group-panel") !== group;
      });
    });
  });
  document.querySelectorAll(".chip[data-value]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      transformSel.value = nextChipValue(transformSel.value, chip.getAttribute("data-value"));
      transformSel.dispatchEvent(new Event("change"));
    });
  });
  // Home page only: extra-control rows are tagged data-for="<transform-list>";
  // show only the ones relevant to the currently selected transform.
  function syncShapeVisibility() {
    if (!transformSel) return;
    var t = transformSel.value;
    document.querySelectorAll("[data-for]").forEach(function (row) {
      var list = row.getAttribute("data-for").split(" ");
      row.hidden = list.indexOf(t) === -1;
    });
    var noInput = !!NO_INPUT[t];
    if (editor) editor.hidden = noInput;
    var editorLabel = document.querySelector('label[for="editor"]');
    if (editorLabel && !editorLabel.classList.contains("sr-only")) editorLabel.hidden = noInput;
  }
  syncShapeVisibility();
  syncPickerUI();
  render();

  var copyBtn = document.getElementById("copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var val = regexMatchesEl ? regexMatchesEl.textContent : (output ? output.value : editor.value);
      if (!val) return;
      var done = function () { var t = copyBtn.textContent; copyBtn.textContent = "Copied ✓"; setTimeout(function () { copyBtn.textContent = t; }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(val).then(done, function () {});
      } else if (output) {
        output.select(); try { document.execCommand("copy"); done(); } catch (e) {}
      }
    });
  }

  var downloadBtn = document.getElementById("downloadBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      var val = output ? output.value : editor.value;
      if (!val) return;
      var blob = new Blob([val], { type: "text/plain" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "textbench.txt";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
    });
  }

  var clearBtn = document.getElementById("clearBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () { editor.value = ""; if (compareBEl) compareBEl.value = ""; render(); editor.focus(); });
  }
})();
