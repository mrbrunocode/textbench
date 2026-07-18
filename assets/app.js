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

  var editor = document.getElementById("editor");
  if (!editor) return; // prose pages have no editor

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
  function reverseText(s) { return s.split("").reverse().join(""); }
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
  function strikethroughText(s) { return s.split("").map(function (c) { return c + "̶"; }).join(""); }
  var UPSIDE_MAP = { a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", h: "ɥ",
    i: "ı", j: "ɾ", k: "ʞ", l: "l", m: "ɯ", n: "u", o: "o", p: "d", q: "b", r: "ɹ",
    s: "s", t: "ʇ", u: "n", v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z",
    A: "∀", B: "၁2", C: "Ɔ", D: "ᗡ", E: "Ǝ", F: "Ⅎ", G: "⅁", H: "H",
    I: "I", J: "ſ", K: "⋊", L: "˥", M: "W", N: "N", O: "O", P: "Ԁ", Q: "Ό",
    R: "ᴚ", S: "S", T: "⊥", U: "∩", V: "Λ", W: "M", X: "X", Y: "⅄", Z: "Z",
    "0": "0", "1": "⇂", "2": "ᄅ", "3": "Ɛ", "4": "ㄣ", "5": "ϛ", "6": "9", "9": "6",
    "7": "ㄥ", "8": "8", ".": "˙", ",": "'", "'": ",", "?": "¿", "!": "¡", "(": ")", ")": "(" };
  function upsideDownText(s) {
    return s.split("").map(function (c) { return UPSIDE_MAP[c] !== undefined ? UPSIDE_MAP[c] : c; }).reverse().join("");
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
      loremSentence: loremSentence, loremParagraph: loremParagraph, loremIpsum: loremIpsum,
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
  function renderRegexTester() {
    var text = editor.value;
    var pattern = regexPatternEl.value;
    if (!pattern) {
      regexErrorEl.textContent = "";
      regexHighlightEl.textContent = text || "Matches appear highlighted here…";
      regexSummaryEl.textContent = "";
      regexMatchesEl.innerHTML = "";
      return;
    }
    var flags = (regexFlagG.checked ? "g" : "") + (regexFlagI.checked ? "i" : "") + (regexFlagM.checked ? "m" : "") + (regexFlagS.checked ? "s" : "");
    var re;
    try { re = new RegExp(pattern, flags); }
    catch (e) {
      regexErrorEl.textContent = "Invalid pattern: " + e.message;
      regexHighlightEl.textContent = text;
      regexSummaryEl.textContent = "";
      regexMatchesEl.innerHTML = "";
      return;
    }
    regexErrorEl.textContent = "";
    var matches = [];
    if (flags.indexOf("g") !== -1) {
      var m, guard = 0;
      while ((m = re.exec(text)) && guard++ < 10000) {
        matches.push(m);
        if (m[0] === "") re.lastIndex++; // step past a zero-length match so exec() can't loop forever
      }
    } else {
      var single = re.exec(text);
      if (single) matches.push(single);
    }
    var html = "", cursor = 0;
    matches.forEach(function (m) {
      html += htmlEntitiesEncode(text.slice(cursor, m.index));
      html += "<mark>" + htmlEntitiesEncode(m[0]) + "</mark>";
      cursor = m.index + m[0].length;
    });
    html += htmlEntitiesEncode(text.slice(cursor));
    regexHighlightEl.innerHTML = text ? html : "Matches appear highlighted here…";
    regexSummaryEl.textContent = matches.length + " match" + (matches.length === 1 ? "" : "es");
    regexMatchesEl.innerHTML = matches.map(function (m, i) {
      var groups = m.length > 1
        ? " — groups: " + m.slice(1).map(function (g, gi) { return (gi + 1) + "=“" + (g === undefined ? "" : htmlEntitiesEncode(g)) + "”"; }).join(", ")
        : "";
      return "<li>" + (i + 1) + ". “" + htmlEntitiesEncode(m[0]) + "”" + groups + "</li>";
    }).join("");
  }

  var renderToken = 0;
  function render() {
    if (regexPatternEl) { renderRegexTester(); return; }
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
    regexPatternEl, regexFlagG, regexFlagI, regexFlagM, regexFlagS].forEach(function (el) {
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
      transformSel.value = chip.getAttribute("data-value");
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
    clearBtn.addEventListener("click", function () { editor.value = ""; render(); editor.focus(); });
  }
})();
