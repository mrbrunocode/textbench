// Regression tests for the actual shipped transform functions (assets/app.js),
// not a reimplementation — see test/helpers/load-app.mjs for how it's loaded
// without a browser. Every transform must round-trip or match a known-good
// value exactly: these are advertised as always-correct, deterministic tools.
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTransforms, loadRegexWorker } from "./helpers/load-app.mjs";

const t = loadTransforms();

test("case conversions", () => {
  assert.equal(t.toTitleCase("the quick brown fox"), "The Quick Brown Fox");
  assert.equal(t.toSentenceCase("hello. world? yes! ok"), "Hello. World? Yes! Ok");
  assert.equal(t.toAlternatingCase("abcd"), "aBcD");
  assert.equal(t.toInverseCase("AbCd"), "aBcD");
});

test("line operations", () => {
  assert.equal(t.dedupeLines("a\nb\na\nc"), "a\nb\nc");
  assert.equal(t.removeExtraSpaces("a   b    c"), "a b c");
  assert.equal(t.removeLineBreaks("a\nb\nc"), "a b c");
  assert.equal(t.removeEmptyLines("a\n\nb\n\n\nc"), "a\nb\nc");
  assert.equal(t.sortLines("banana\napple\ncherry", "az"), "apple\nbanana\ncherry");
  assert.equal(t.sortLines("banana\napple\ncherry", "za"), "cherry\nbanana\napple");
  assert.equal(t.reverseText("abc"), "cba");
  assert.equal(t.reverseLines("a\nb\nc"), "c\nb\na");
  assert.equal(t.trimLines("  a  \n  b  "), "a\nb");
  assert.equal(t.addLineNumbers("a\nb"), "1. a\n2. b");
});

test("slugify", () => {
  assert.equal(t.slugify("Hello, World! 123"), "hello-world-123");
  assert.equal(t.slugify("  Multiple   Spaces  "), "multiple-spaces");
});

test("repeatText", () => {
  assert.equal(t.repeatText("ab", 3), "ab\nab\nab");
});

test("findReplace: plain text and regex", () => {
  assert.equal(t.findReplace("foo bar foo", "foo", "baz", false), "baz bar baz");
  assert.equal(t.findReplace("a1 b2 c3", "\\d", "#", true), "a# b# c#");
});

test("findReplace treats '.' literally when regex mode is off", () => {
  assert.equal(t.findReplace("a.b.c", ".", "X", false), "aXbXc");
  assert.equal(t.findReplace("axbxc", ".", "X", false), "axbxc"); // no literal '.' present
});

test("extraction: emails, URLs, numbers", () => {
  assert.equal(t.extractEmails("contact a@b.com or c@d.org, also a@b.com again"), "a@b.com\nc@d.org");
  assert.equal(t.extractUrls("visit https://example.com. and http://x.org/path,"), "https://example.com\nhttp://x.org/path");
  assert.equal(t.extractNumbers("pages 10-20, temp -5.5 degrees, id 555-1234"), "10\n20\n-5.5\n555\n1234");
});

test("base64 round-trips", () => {
  const s = "Hello, 世界! 🎉";
  assert.equal(t.base64Decode(t.base64Encode(s)), s);
});

test("base64Decode reports invalid input", () => {
  assert.equal(t.base64Decode("not valid base64!!!"), "Invalid Base64 input.");
});

test("URL encode/decode round-trips", () => {
  const s = "a b/c?d=e&f";
  assert.equal(t.urlDecode(t.urlEncode(s)), s);
});

test("html entity encoding escapes the five reserved characters", () => {
  assert.equal(t.htmlEntitiesEncode(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
});

test("binary round-trips and rejects garbage", () => {
  const s = "Hi!";
  assert.equal(t.binaryToText(t.textToBinary(s)), s);
  assert.equal(t.binaryToText("hello 01100001"), "Invalid binary input.");
  assert.equal(t.binaryToText("111111111"), "Invalid binary input."); // > 255
});

test("hex round-trips and rejects garbage", () => {
  const s = "Hi!";
  assert.equal(t.hexToText(t.textToHex(s)), s);
  assert.equal(t.hexToText("not hex"), "Invalid hex input.");
  assert.equal(t.hexToText("abc"), "Invalid hex input."); // odd length
});

test("morse round-trips", () => {
  assert.equal(t.morseToText(t.textToMorse("SOS HELLO")), "SOS HELLO");
});

test("rot13 is its own inverse", () => {
  const s = "The Quick Brown Fox 123";
  assert.equal(t.rot13(t.rot13(s)), s);
  assert.notEqual(t.rot13(s), s);
});

test("md5 matches known test vectors", () => {
  assert.equal(t.md5(""), "d41d8cd98f00b204e9800998ecf8427e");
  assert.equal(t.md5("abc"), "900150983cd24fb0d6963f7d28e17f72");
});

test("sha256Async matches a known test vector", async () => {
  assert.equal(await t.sha256Async("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("uuidV4 produces well-formed v4 UUIDs", () => {
  const id = t.uuidV4();
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});

test("uuidGenerator produces the requested count of unique UUIDs, clamped to [1,200]", () => {
  const ten = t.uuidGenerator(10).split("\n");
  assert.equal(ten.length, 10);
  assert.equal(new Set(ten).size, 10);
  assert.equal(t.uuidGenerator(0).split("\n").length, 1);
  assert.equal(t.uuidGenerator(500).split("\n").length, 200);
});

test("randomPassword respects requested length and character-set flags", () => {
  const pw = t.randomPassword(20, false, false, false);
  assert.equal(pw.length, 20);
  assert.ok(/^[a-z]+$/.test(pw), "lowercase-only password should contain only a-z");
  const clamped = t.randomPassword(1000, true, true, true);
  assert.equal(clamped.length, 128);
});

test("strikethrough and upside-down and bold produce non-empty, transformed output", () => {
  assert.notEqual(t.strikethroughText("abc"), "abc");
  assert.ok(t.strikethroughText("abc").length > 3);
  assert.notEqual(t.upsideDownText("abc"), "abc");
  assert.notEqual(t.boldUnicodeText("abc"), "abc");
});

test("lorem generators respect their length/count arguments", () => {
  assert.equal(t.loremIpsum(2).split("\n\n").length, 2);
  assert.equal(t.loremIpsum(0).split("\n\n").length, 3); // 0 is falsy -> falls back to the default of 3
  assert.equal(t.loremIpsum(999).split("\n\n").length, 50); // clamped to maximum 50
});

test("count() reports characters, words and reading time consistently", () => {
  const stats = t.count("one two three four five");
  assert.equal(stats.words, 5);
  assert.equal(stats.characters, 23);
  assert.equal(stats.charactersNoSpaces, 19);
  assert.equal(stats.sentences, 1);
});

test("jsonFormat pretty-prints valid JSON with 2-space indent", () => {
  assert.equal(t.jsonFormat('{"a":1,"b":[2,3]}'), '{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}');
});

test("jsonFormat preserves key order and does not touch values", () => {
  const out = t.jsonFormat('{"z":1,"a":"hello world"}');
  assert.ok(out.indexOf('"z"') < out.indexOf('"a"'));
  assert.ok(out.includes('"hello world"'));
});

test("jsonFormat reports a parse error for invalid JSON instead of throwing", () => {
  assert.match(t.jsonFormat("{not valid}"), /^Invalid JSON:/);
});

test("jsonFormat returns empty string for empty input", () => {
  assert.equal(t.jsonFormat(""), "");
  assert.equal(t.jsonFormat("   "), "");
});

test("jsonMinify strips whitespace but keeps string contents intact", () => {
  assert.equal(t.jsonMinify('{\n  "a": 1,\n  "b": "has spaces"\n}'), '{"a":1,"b":"has spaces"}');
});

test("jsonMinify reports a parse error for invalid JSON instead of throwing", () => {
  assert.match(t.jsonMinify("[1, 2,"), /^Invalid JSON:/);
});

test("jsonFormat and jsonMinify round-trip to the same parsed value", () => {
  const input = '{"nested":{"list":[1,2,3],"flag":true},"n":null}';
  assert.deepEqual(JSON.parse(t.jsonFormat(input)), JSON.parse(input));
  assert.deepEqual(JSON.parse(t.jsonMinify(input)), JSON.parse(input));
});

test("markdownToHtml converts headers, bold, italic, inline code and links", () => {
  const out = t.markdownToHtml("# Title\n\nSome **bold** and *italic* and `code` and [a link](https://x.com).");
  assert.ok(out.includes("<h1>Title</h1>"));
  assert.ok(out.includes("<strong>bold</strong>"));
  assert.ok(out.includes("<em>italic</em>"));
  assert.ok(out.includes("<code>code</code>"));
  assert.ok(out.includes('<a href="https://x.com">a link</a>'));
});

test("markdownToHtml converts an unordered list", () => {
  const out = t.markdownToHtml("- one\n- two\n- three");
  assert.equal(out, "<ul>\n<li>one</li>\n<li>two</li>\n<li>three</li>\n</ul>");
});

test("markdownToHtml converts a fenced code block without interpreting its contents as markdown", () => {
  const out = t.markdownToHtml("```\n**not bold**\n```");
  assert.ok(out.includes("<pre><code>**not bold**</code></pre>"));
});

test("markdownToHtml escapes raw HTML instead of passing it through", () => {
  const out = t.markdownToHtml("<script>alert(1)</script>");
  assert.ok(!out.includes("<script>"));
  assert.ok(out.includes("&lt;script&gt;"));
});

test("markdownToHtml wraps a plain paragraph in <p>", () => {
  assert.equal(t.markdownToHtml("just some text"), "<p>just some text</p>");
});

test("csvToJson converts rows to an array of objects keyed by header", () => {
  const out = JSON.parse(t.csvToJson("name,age\nAda,30\nGrace,45"));
  assert.deepEqual(out, [{ name: "Ada", age: "30" }, { name: "Grace", age: "45" }]);
});

test("csvToJson handles quoted fields with embedded commas", () => {
  const out = JSON.parse(t.csvToJson('name,note\n"Smith, John",ok'));
  assert.deepEqual(out, [{ name: "Smith, John", note: "ok" }]);
});

test("jsonToCsv converts an array of objects to CSV with a header row", () => {
  const out = t.jsonToCsv(JSON.stringify([{ name: "Ada", age: 30 }, { name: "Grace", age: 45 }]));
  assert.equal(out, "name,age\nAda,30\nGrace,45");
});

test("jsonToCsv quotes fields containing a comma", () => {
  const out = t.jsonToCsv(JSON.stringify([{ name: "Smith, John", note: "ok" }]));
  assert.equal(out, 'name,note\n"Smith, John",ok');
});

test("jsonToCsv rejects non-array input with a clear message", () => {
  assert.match(t.jsonToCsv('{"a":1}'), /^Invalid input: expected a JSON array/);
});

test("csvToJson and jsonToCsv round-trip a simple table", () => {
  const csv = "name,age\nAda,30\nGrace,45";
  assert.equal(t.jsonToCsv(t.csvToJson(csv)), csv);
});

test("csvToJson keeps a quoted field's embedded newline inside a single row", () => {
  // Regression test: a quoted CSV field is allowed to contain a literal "\n"
  // (a multi-line address or note is the common real case) — splitting the
  // input into lines before parsing quotes used to tear that field in two,
  // producing an extra bogus row instead of one row with a multi-line value.
  const csv = 'name,note\nAda,"line1\nline2"\nGrace,simple';
  const out = JSON.parse(t.csvToJson(csv));
  assert.deepEqual(out, [
    { name: "Ada", note: "line1\nline2" },
    { name: "Grace", note: "simple" },
  ]);
});

test("jsonToCsv and csvToJson round-trip a value with an embedded newline", () => {
  const data = [{ name: "Ada", note: "line1\nline2" }, { name: "Grace", note: "simple" }];
  const roundTripped = JSON.parse(t.csvToJson(t.jsonToCsv(JSON.stringify(data))));
  assert.deepEqual(roundTripped, data);
});

test("jsonToCsv unions keys across all rows instead of only the first row's", () => {
  // Regression test: a header built from data[0]'s keys alone silently
  // dropped any field present only on a later object — real-world JSON
  // arrays commonly have sparse/optional fields, so this is the normal case,
  // not an edge case.
  const data = [{ name: "Ada" }, { name: "Grace", extra: "keep me" }];
  const out = t.jsonToCsv(JSON.stringify(data));
  assert.equal(out, "name,extra\nAda,\nGrace,keep me");
});

test("reverseText, strikethroughText and upsideDownText keep surrogate-pair characters intact", () => {
  // Regression test: iterating with split("") (or reversing char-by-char)
  // operates on UTF-16 code units, not Unicode code points — a surrogate-pair
  // character (most emoji, e.g. the globe below) got torn into two lone
  // surrogates, producing invalid text (encodeURIComponent throws on it).
  const emoji = "🌍";
  assert.doesNotThrow(() => encodeURIComponent(t.reverseText("Hi " + emoji + "!")));
  assert.doesNotThrow(() => encodeURIComponent(t.strikethroughText("Hi " + emoji + "!")));
  assert.doesNotThrow(() => encodeURIComponent(t.upsideDownText("Hi " + emoji + "!")));
  assert.equal(t.reverseText("a" + emoji + "b"), "b" + emoji + "a");
});

test("nextChipValue toggles the same chip back to \"none\", switches chip otherwise", () => {
  // Regression test: clicking an already-active picker chip used to be a
  // no-op, leaving no way back to the default word/character counter view
  // short of manually switching tabs and clicking that chip directly.
  assert.equal(t.nextChipValue("upside-down-text", "upside-down-text"), "none");
  assert.equal(t.nextChipValue("none", "uppercase"), "uppercase");
  assert.equal(t.nextChipValue("uppercase", "lowercase"), "lowercase");
  assert.equal(t.nextChipValue("none", "none"), "none");
});

// regex-worker.js — runs off the main thread specifically so a catastrophic-
// backtracking pattern can't freeze the tab (see assets/regex-worker.js);
// this tests the actual matching logic the worker runs, not the postMessage
// plumbing (which needs a real Worker environment to exercise).
const rw = loadRegexWorker();

test("runRegexMatch finds a single non-global match with its index and groups", () => {
  const matches = rw.runRegexMatch("(\\d+)-(\\d+)", "", "id 12-34 end");
  assert.equal(matches.length, 1);
  assert.equal(matches[0].index, 3);
  assert.deepEqual(matches[0].groups, ["12-34", "12", "34"]);
});

test("runRegexMatch finds every match with the global flag", () => {
  const matches = rw.runRegexMatch("\\d+", "g", "a1 b22 c333");
  assert.deepEqual(matches.map((m) => m.groups[0]), ["1", "22", "333"]);
});

test("runRegexMatch steps past zero-length global matches instead of looping forever", () => {
  const matches = rw.runRegexMatch("a*", "g", "bbb");
  assert.ok(matches.length > 0 && matches.length < 100, "should terminate with a small, sane match count");
});

test("runRegexMatch throws for an invalid pattern, for the caller to report", () => {
  assert.throws(() => rw.runRegexMatch("(", "", "text"));
});

test("runRegexMatch returns no matches when the pattern doesn't match", () => {
  assert.deepEqual(rw.runRegexMatch("xyz", "", "abc"), []);
});

test("markdownToText strips headers, emphasis, links, images, lists and blockquotes", () => {
  const out = t.markdownToText(
    "# Title\n\nSome **bold** and *italic* and `code` and [a link](https://x.com) and ![alt](img.png).\n\n- one\n- two\n\n> a quote"
  );
  assert.ok(!out.includes("#"));
  assert.ok(!out.includes("**"));
  assert.ok(!out.includes("`"));
  assert.ok(!out.includes("["));
  assert.ok(!out.includes("]("));
  assert.ok(out.includes("Title"));
  assert.ok(out.includes("bold"));
  assert.ok(out.includes("italic"));
  assert.ok(out.includes("code"));
  assert.ok(out.includes("a link"));
  assert.ok(out.includes("alt"));
  assert.ok(out.includes("one"));
  assert.ok(out.includes("a quote"));
});

test("markdownToText keeps fenced code block content but drops the fence markers", () => {
  const out = t.markdownToText("```\nconst x = 1;\n```");
  assert.equal(out, "const x = 1;");
});

test("markdownToText does not interpret markdown syntax inside a fenced code block", () => {
  const out = t.markdownToText("```\n**not bold**\n```");
  assert.equal(out, "**not bold**");
});

test("markdownToText collapses runs of blank lines down to one", () => {
  const out = t.markdownToText("one\n\n\n\n\ntwo");
  assert.equal(out, "one\n\ntwo");
});

test("csvToMarkdownTable converts comma-separated rows into a piped table", () => {
  const out = t.csvToMarkdownTable("Name,Role\nAda,Engineer\nGrace,Admiral");
  assert.equal(out, "| Name | Role |\n| --- | --- |\n| Ada | Engineer |\n| Grace | Admiral |");
});

test("csvToMarkdownTable auto-detects tab-separated input", () => {
  const out = t.csvToMarkdownTable("Name\tRole\nAda\tEngineer");
  assert.equal(out, "| Name | Role |\n| --- | --- |\n| Ada | Engineer |");
});

test("csvToMarkdownTable escapes a literal pipe in a cell", () => {
  const out = t.csvToMarkdownTable("A,B\none|two,three");
  assert.ok(out.includes("one\\|two"));
});

test("csvToMarkdownTable pads short rows to the header's column count", () => {
  const out = t.csvToMarkdownTable("A,B,C\n1,2");
  assert.equal(out, "| A | B | C |\n| --- | --- | --- |\n| 1 | 2 |  |");
});

test("csvToMarkdownTable returns empty string for empty input", () => {
  assert.equal(t.csvToMarkdownTable(""), "");
  assert.equal(t.csvToMarkdownTable("   "), "");
});

test("markdownToConfluence converts headings, bold, italic, code and links", () => {
  const out = t.markdownToConfluence("# Title\n\nSome **bold** and *italic* and `code` and [a link](https://x.com).");
  assert.ok(out.includes("h1. Title"));
  assert.ok(out.includes("*bold*"));
  assert.ok(out.includes("_italic_"));
  assert.ok(out.includes("{{code}}"));
  assert.ok(out.includes("[a link|https://x.com]"));
});

test("markdownToConfluence converts lists, blockquotes and horizontal rules", () => {
  const out = t.markdownToConfluence("- one\n- two\n\n1. first\n2. second\n\n> a quote\n\n---");
  assert.ok(out.includes("* one"));
  assert.ok(out.includes("* two"));
  assert.ok(out.includes("# first"));
  assert.ok(out.includes("# second"));
  assert.ok(out.includes("bq. a quote"));
  assert.ok(out.includes("----"));
});

test("markdownToConfluence converts a fenced code block into a {code} macro, keeping the language hint", () => {
  const out = t.markdownToConfluence("```js\nconst x = 1;\n```");
  assert.equal(out, "{code:js}\nconst x = 1;\n{code}");
});

test("markdownToConfluence does not interpret markdown syntax inside a fenced code block", () => {
  const out = t.markdownToConfluence("```\n**not bold**\n```");
  assert.equal(out, "{code}\n**not bold**\n{code}");
});

test("markdownToSlack converts bold and italic to Slack's single-asterisk/underscore convention", () => {
  const out = t.markdownToSlack("Some **bold** and *italic* and __also bold__ and _also italic_.");
  assert.ok(out.includes("*bold*"));
  assert.ok(out.includes("_italic_"));
  assert.ok(out.includes("*also bold*"));
  assert.ok(out.includes("_also italic_"));
});

test("markdownToSlack converts strikethrough, links and headings", () => {
  const out = t.markdownToSlack("# Title\n\n~~gone~~ and [a link](https://x.com).");
  assert.ok(out.includes("*Title*"));
  assert.ok(out.includes("~gone~"));
  assert.ok(out.includes("<https://x.com|a link>"));
});

test("markdownToSlack converts list markers to a bullet and keeps ordered-list numbers", () => {
  const out = t.markdownToSlack("- one\n- two\n\n1. first\n2. second");
  assert.ok(out.includes("• one"));
  assert.ok(out.includes("• two"));
  assert.ok(out.includes("1. first"));
  assert.ok(out.includes("2. second"));
});

test("markdownToSlack does not interpret markdown syntax inside a fenced code block", () => {
  const out = t.markdownToSlack("```\n**not bold**\n```");
  assert.equal(out, "```\n**not bold**\n```");
});

test("htmlToMarkdown converts headings, bold, italic, code and links", () => {
  const out = t.htmlToMarkdown('<h1>Title</h1><p>Some <strong>bold</strong> and <em>italic</em> and <code>code</code> and <a href="https://x.com">a link</a>.</p>');
  assert.ok(out.includes("# Title"));
  assert.ok(out.includes("**bold**"));
  assert.ok(out.includes("*italic*"));
  assert.ok(out.includes("`code`"));
  assert.ok(out.includes("[a link](https://x.com)"));
});

test("htmlToMarkdown converts lists, blockquotes and images", () => {
  const out = t.htmlToMarkdown('<ul><li>one</li><li>two</li></ul><ol><li>first</li><li>second</li></ol><blockquote>a quote</blockquote><img src="a.png" alt="alt text">');
  assert.ok(out.includes("- one"));
  assert.ok(out.includes("- two"));
  assert.ok(out.includes("1. first"));
  assert.ok(out.includes("2. second"));
  assert.ok(out.includes("> a quote"));
  assert.ok(out.includes("![alt text](a.png)"));
});

test("htmlToMarkdown converts a <pre><code> block into a fenced code block", () => {
  const out = t.htmlToMarkdown("<pre><code>const x = 1;</code></pre>");
  assert.ok(out.includes("```\nconst x = 1;\n```"));
});

test("htmlToMarkdown decodes HTML entities and strips unknown tags", () => {
  const out = t.htmlToMarkdown('<div class="wrapper"><span>a &amp; b &lt;tag&gt;</span></div>');
  assert.ok(out.includes("a & b <tag>"));
  assert.ok(!out.includes("<div"));
  assert.ok(!out.includes("<span>"));
});

test("removeInvisibleCharacters strips zero-width and formatting characters", () => {
  const out = t.removeInvisibleCharacters("a​b‌‍﻿c­d‎‏⁠e");
  assert.equal(out, "abcde");
});

test("removeInvisibleCharacters converts a non-breaking space to a regular space instead of deleting it", () => {
  const out = t.removeInvisibleCharacters("a b");
  assert.equal(out, "a b");
});

test("removeInvisibleCharacters leaves ordinary text untouched", () => {
  assert.equal(t.removeInvisibleCharacters("hello world"), "hello world");
});

test("smartQuotesToStraight converts curly single and double quotes", () => {
  const out = t.smartQuotesToStraight("‘hi’ said “she” and ‚he‛, „then‟");
  assert.equal(out, "'hi' said \"she\" and 'he', \"then\"");
});

test("smartQuotesToStraight leaves straight quotes and other punctuation untouched", () => {
  assert.equal(t.smartQuotesToStraight("already \"straight\" and 'fine'."), "already \"straight\" and 'fine'.");
});

test("wrapInXmlTags wraps text in the given tag with newlines", () => {
  assert.equal(t.wrapInXmlTags("hello", "context"), "<context>\nhello\n</context>");
});

test("wrapInXmlTags defaults to \"context\" for an empty tag name", () => {
  assert.equal(t.wrapInXmlTags("hello", ""), "<context>\nhello\n</context>");
});

test("wrapInXmlTags sanitizes an invalid tag name instead of producing malformed output", () => {
  assert.equal(t.wrapInXmlTags("hello", "Document 1!"), "<document-1>\nhello\n</document-1>");
  assert.equal(t.wrapInXmlTags("hello", "123"), "<context>\nhello\n</context>");
});

test("wordFrequency counts case-insensitively and sorts by count descending", () => {
  const out = t.wordFrequency("the cat sat on the mat. The Cat ran.");
  const lines = out.split("\n");
  assert.equal(lines[0], "the — 3");
  assert.equal(lines[1], "cat — 2");
});

test("wordFrequency breaks ties alphabetically", () => {
  const out = t.wordFrequency("zebra apple");
  assert.deepEqual(out.split("\n"), ["apple — 1", "zebra — 1"]);
});

test("wordFrequency returns empty string for empty input", () => {
  assert.equal(t.wordFrequency(""), "");
});

test("compareTexts reports identical word/char counts and 100% overlap for identical texts", () => {
  const c = t.compareTexts("hello world", "hello world");
  assert.equal(c.wordsA, 2);
  assert.equal(c.wordsB, 2);
  assert.equal(c.wordDelta, 0);
  assert.equal(c.charDelta, 0);
  assert.equal(c.overlapPct, 100);
});

test("compareTexts reports 0% overlap for completely disjoint vocabularies", () => {
  const c = t.compareTexts("apple banana", "xyz qrs");
  assert.equal(c.overlapPct, 0);
});

test("compareTexts computes word and character deltas as B minus A", () => {
  const c = t.compareTexts("one two", "one two three");
  assert.equal(c.wordDelta, 1);
  assert.equal(c.charDelta, "one two three".length - "one two".length);
});

test("compareTexts treats two empty texts as fully overlapping (not a division-by-zero NaN)", () => {
  const c = t.compareTexts("", "");
  assert.equal(c.overlapPct, 100);
  assert.equal(c.wordDelta, 0);
});

// Readability: the syllable heuristic is the load-bearing part — every one of
// the three scores divides by it, so a regression here silently skews all of
// them. These are the cases the first implementation got wrong: unbounded
// vowel runs ("beautiful" is 3, not 4) and -es after a sibilant, which IS a
// syllable ("houses" is 2, not 1) unlike a silent -e ("baked" is 1).
test("syllable counting handles vowel runs and sibilant -es", () => {
  const cases = [["cat", 1], ["running", 2], ["beautiful", 3], ["implementation", 5],
                 ["baked", 1], ["houses", 2], ["boxes", 2], ["watches", 2],
                 ["the", 1], ["yes", 1], ["queue", 1], ["idea", 2]];
  for (const [word, expected] of cases) {
    assert.equal(t.syllablesIn(word), expected, `${word} should be ${expected} syllables`);
  }
});

test("readability returns null below the 20-word floor, scores above it", () => {
  assert.equal(t.readability(""), null);
  assert.equal(t.readability("Too short to score reliably."), null);
  const simple = "The cat sat on the mat. It was a warm day. The sun was out. " +
                 "Birds sang in the tree. A dog ran past. The cat did not move.";
  const r = t.readability(simple);
  assert.ok(r, "should score text over 20 words");
  assert.ok(r.flesch > 80, `simple prose should read as easy, got ${r.flesch}`);
  assert.ok(r.gunningFog < 8, `simple prose should have a low fog index, got ${r.gunningFog}`);
});

test("harder prose scores worse than simple prose on every measure", () => {
  const simple = "The cat sat on the mat. It was a warm day. The sun was out. " +
                 "Birds sang in the tree. A dog ran past. The cat did not move.";
  const hard = "The implementation of comprehensive methodological frameworks necessitates " +
               "considerable organisational restructuring. Consequently, administrators must " +
               "systematically evaluate infrastructural dependencies before authorising expenditure.";
  const s = t.readability(simple), h = t.readability(hard);
  assert.ok(h.flesch < s.flesch, "Flesch ease should be lower for harder prose");
  assert.ok(h.fleschKincaid > s.fleschKincaid, "grade level should be higher for harder prose");
  assert.ok(h.gunningFog > s.gunningFog, "fog index should be higher for harder prose");
});

test("Flesch is clamped to the reported 0-100 range", () => {
  const trivial = ("a b c d e f g h i j k l m n o p q r s t u v w x y z. ").repeat(3);
  const r = t.readability(trivial);
  assert.ok(r.flesch <= 100 && r.flesch >= 0, `expected 0-100, got ${r.flesch}`);
});

test("fleschBand labels the standard ranges", () => {
  assert.match(t.fleschBand(95), /Very easy/);
  assert.match(t.fleschBand(65), /Plain English/);
  assert.match(t.fleschBand(20), /Very difficult/);
});

test("jsonToCsv's own page copy doesn't claim the old, now-false first-object-only behaviour", async () => {
  // Regression: the code was changed to union every row's keys (see the
  // comment above jsonToCsv in assets/app.js and the "unions keys across all
  // rows" test above), but the page's FAQ/description/intro text still said
  // "only the first object's keys become columns" for weeks afterward —
  // actively wrong documentation is its own kind of bug. Importing pages.mjs
  // directly (not scraping built HTML) so this fails the moment the claim
  // regresses, in either direction, regardless of what CI step runs it.
  const { PAGES } = await import("../pages.mjs");
  const page = PAGES.find((p) => p.slug === "json-to-csv-converter");
  const copy = [page.description, page.intro, ...page.faq.map((f) => f.a)].join(" ");
  assert.doesNotMatch(copy, /only the first object.?s keys/i,
    "page copy must not claim only the first object's keys are used — the code unions all of them");
  assert.match(copy, /union/i, "page copy should actually say it unions every object's keys");
});
