/* Textbench engine — every transform is a pure text -> text function, run
 * entirely client-side. Collection pages render ONE fixed transform (the
 * page's SEO target); the home page is the flexible "workbench" with a
 * dropdown that switches between all of them, using the exact same
 * functions so behaviour can never drift between the two.
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
  };

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

  function currentTransform() {
    if (transformSel) return transformSel.value;
    return transform;
  }

  function apply(text) {
    var t = currentTransform();
    if (t === "find-replace") return findReplace(text, findEl ? findEl.value : "", replEl ? replEl.value : "", !!(regexEl && regexEl.checked));
    if (t === "text-repeater") return repeatText(text, repeatEl ? parseInt(repeatEl.value, 10) : 1);
    if (t === "lorem-ipsum") return loremIpsum(loremEl ? parseInt(loremEl.value, 10) : 3);
    var fn = TRANSFORMS[t] || TRANSFORMS.none;
    return fn(text);
  }

  function render() {
    var t = currentTransform();
    var resultText = (t === "lorem-ipsum") ? apply("") : apply(editor.value);
    var statsSource = (shape === "counter") ? editor.value : resultText;
    var c = count(statsSource);
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var key = el.getAttribute("data-count");
      if (key in c) el.textContent = fmt(c[key]);
    });
    if (output) output.value = resultText;
  }

  editor.addEventListener("input", render);
  [findEl, replEl, regexEl, repeatEl, loremEl].forEach(function (el) {
    if (el) el.addEventListener("input", render);
  });
  if (transformSel) {
    transformSel.addEventListener("change", function () {
      if (toolEl) toolEl.setAttribute("data-transform", transformSel.value);
      syncShapeVisibility();
      render();
    });
  }
  // Home page only: extra-control rows are tagged data-for="<transform-list>";
  // show only the ones relevant to the currently selected transform.
  function syncShapeVisibility() {
    if (!transformSel) return;
    var t = transformSel.value;
    document.querySelectorAll("[data-for]").forEach(function (row) {
      var list = row.getAttribute("data-for").split(" ");
      row.hidden = list.indexOf(t) === -1;
    });
    if (editor) editor.hidden = t === "lorem-ipsum";
    var editorLabel = document.querySelector('label[for="editor"]');
    if (editorLabel && !editorLabel.classList.contains("sr-only")) editorLabel.hidden = t === "lorem-ipsum";
  }
  syncShapeVisibility();
  render();

  var copyBtn = document.getElementById("copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var val = output ? output.value : editor.value;
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
