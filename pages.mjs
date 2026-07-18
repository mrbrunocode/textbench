/**
 * The programmatic-SEO collection: one row per indexed long-tail page, plus the
 * shared renderer for the tool body those pages embed.
 *
 * ── THIS IS THE GROWTH LEVER ──────────────────────────────────────────────
 * Add a row → `node engine/build.mjs` → commit. Each row is one page targeting
 * one search query, all funnelling into the same engine (assets/app.js) + the
 * same single ad slot. Every `title` / `description` / `intro` / `faq` MUST be
 * unique — copied boilerplate with one word swapped is the single most common
 * reason these get filtered out of Google's index instead of ranked.
 *
 * Fields per row:
 *   slug        URL segment → /<COLLECTION_DIR>/<slug>.html   (unique, kebab-case)
 *   eyebrow     short label (nav lists, breadcrumb leaf)
 *   title       <h1> + <title> — unique, keyword-leading
 *   description meta description + OG — unique, ~150 chars, reads like a sentence
 *   intro       lede paragraph under the h1 — unique, written from scratch
 *   transform   which transform this page is dedicated to (see assets/app.js TRANSFORMS)
 *   shape       "counter" | "simple" | "find-replace" | "repeater" | "lorem" | "uuid" | "password"
 *   faq         2–3 Q/A, unique per page (drives visible FAQ + FAQPage JSON-LD)
 */
import { esc } from "./engine/template.mjs";

export const PAGES = [
  {
    slug: "word-counter",
    eyebrow: "Word Counter",
    title: "Word Counter — Free, Instant, In Your Browser",
    description:
      "A free word counter that updates as you type. See words, characters, sentences and reading time live — no signup, nothing uploaded, everything stays in your browser.",
    intro:
      "Paste or type below and the word count updates on every keystroke. Nothing is sent anywhere — the counting happens entirely on your device, so it works offline and your text never leaves the page.",
    transform: "none",
    shape: "counter",
    faq: [
      { q: "How does it count words?", a: "It splits your text on any run of whitespace and counts the non-empty chunks, which matches how word-count works in most writing tools. Hyphenated words count as one." },
      { q: "Is my text uploaded anywhere?", a: "No. All counting runs in your browser with JavaScript — nothing is sent to a server, so it works offline and there is nothing for us to store." },
      { q: "Is there a length limit?", a: "No hard limit. Very large documents (hundreds of thousands of words) may slow down slightly because it recounts on every keystroke, but there is no cap." },
    ],
  },
  {
    slug: "character-counter",
    eyebrow: "Character Counter",
    title: "Character Counter — Count Characters With & Without Spaces",
    description:
      "A free character counter showing characters with and without spaces, live as you type. Ideal for meta descriptions, bios and anywhere a character limit matters.",
    intro:
      "Type or paste your text to see the character count update instantly — both with and without spaces. Useful whenever something has a hard character limit and you need to land just under it.",
    transform: "none",
    shape: "counter",
    faq: [
      { q: "Does it count spaces as characters?", a: "It shows both totals: characters including spaces, and characters excluding spaces. Which one you want depends on the limit you're targeting." },
      { q: "Can I use this for meta descriptions or SEO titles?", a: "Yes — that's a common use. Google typically shows about 155–160 characters of a meta description, so keeping under ~155 is a safe target." },
      { q: "Do emoji count as one character?", a: "Some emoji are a single code point and count as one; others (skin-tone or flag combinations) are several joined code points and may count as more, which mirrors how many platform limits actually treat them." },
    ],
  },
  {
    slug: "twitter-character-counter",
    eyebrow: "X / Twitter Counter",
    title: "Twitter / X Character Counter — 280 Character Limit",
    description:
      "Count characters against X's 280-character post limit, live as you type, with the number remaining turning red once you go over. Free, instant, browser-only.",
    intro:
      "Type or paste your post below and watch the \"left of 280\" counter — it turns red the moment you go over, so you know exactly how much to trim before you paste it into X.",
    transform: "none",
    shape: "counter",
    limit: 280,
    faq: [
      { q: "Does X count links and mentions differently?", a: "Yes — X shortens URLs to a fixed length (currently 23 characters) regardless of the real link length, and this counter can't know that, so a post full of links may show as \"over\" here while actually fitting on X. Treat plain text counts as exact and link-heavy posts as an estimate." },
      { q: "Do emoji count as one character on X?", a: "Most single emoji count as 2 characters on X's own counter (it counts in UTF-16 code units), which can differ from this tool's count for emoji-heavy text — for plain text they'll match." },
      { q: "Is 280 the limit for everyone?", a: "280 is the standard limit for most accounts. Some subscription tiers get a much higher limit, in which case this specific page isn't the right target — use the plain character counter instead and track your own limit." },
    ],
  },
  {
    slug: "meta-description-length-checker",
    eyebrow: "Meta Description",
    title: "Meta Description Length Checker — Stay Under ~155 Characters",
    description:
      "Check a meta description against the ~155-character length Google typically shows in search results, live as you type. Free, instant, browser-only.",
    intro:
      "Paste a draft meta description below and watch the \"left of 155\" counter — it turns red once you're past the length Google typically displays before truncating with an ellipsis in search results.",
    transform: "none",
    shape: "counter",
    limit: 155,
    faq: [
      { q: "Why 155 and not some other number?", a: "155–160 characters is the commonly cited safe zone for Google's search snippet before it starts truncating, though the exact cutoff varies by pixel width, font, and device rather than a fixed character count — 155 is a reliable, conservative target." },
      { q: "Does going over 155 mean Google won't show my description?", a: "No — Google may still display it, sometimes rewriting or truncating it with an ellipsis, or replacing it entirely with page text it judges more relevant to the search query. Staying under the limit just improves the odds your own wording is what shows." },
      { q: "Should title tags use this same limit?", a: "No — title tags have their own, shorter effective limit (closer to 50–60 characters). Use the plain character counter for titles and treat this page's 155 target as meta-description-specific." },
    ],
  },
  {
    slug: "youtube-title-length-checker",
    eyebrow: "YouTube Title",
    title: "YouTube Title Length Checker — Stay Under 100 Characters",
    description:
      "Check a video title against YouTube's 100-character title limit, live as you type, with the remaining count turning red once you go over. Free, browser-only.",
    intro:
      "Paste a draft video title below — the \"left of 100\" counter turns red the moment you exceed YouTube's hard title limit, so you catch it before the upload form does.",
    transform: "none",
    shape: "counter",
    limit: 100,
    faq: [
      { q: "Is 100 characters a hard limit on YouTube?", a: "Yes — YouTube's title field hard-stops accepting input at 100 characters, so a title that goes over this limit will simply get cut off at upload rather than rejected with a warning." },
      { q: "Does YouTube truncate titles shorter than that in search results?", a: "Yes — search and suggested-video listings typically show far fewer characters (often 60–70) before truncating with an ellipsis, especially on mobile, even though the full 100 are stored and shown on the watch page itself." },
      { q: "Do emoji in titles count against the limit?", a: "Yes, and similarly to other platforms a multi-part emoji (skin tone or flag combinations) can count as more than one character — leave a little headroom if your title is emoji-heavy." },
    ],
  },
  {
    slug: "reading-time-calculator",
    eyebrow: "Reading Time",
    title: "Reading Time Calculator — How Long To Read This?",
    description:
      "Estimate reading time from your text. Paste an article or script and see how many minutes it takes to read aloud or silently, at your chosen pace.",
    intro:
      "Paste your text to estimate how long it takes to read. Silent reading averages about 230 words per minute; reading aloud is slower, nearer 150 — the estimate below uses a silent-reading pace, so allow extra if you're presenting it live.",
    transform: "none",
    shape: "counter",
    faq: [
      { q: "What reading speed does this assume?", a: "About 230 words per minute, a common average for silent adult reading. Reading aloud is slower (~130–150 wpm), so for a speech or presentation, expect it to take longer than shown." },
      { q: "Is this good for estimating a speech length?", a: "It's a starting point. Spoken pace varies a lot with pauses and emphasis; a safe rule for scripts is ~130 words per minute, so a 650-word script is roughly five minutes aloud." },
      { q: "Does it count words too?", a: "Yes — reading time is highlighted here, but the word, character and sentence counts update alongside it." },
    ],
  },
  {
    slug: "uppercase-converter",
    eyebrow: "UPPERCASE",
    title: "Uppercase Converter — Convert Text to ALL CAPS",
    description:
      "Convert any text to UPPERCASE instantly. Paste your text, copy the result — no signup, runs entirely in your browser.",
    intro:
      "Paste text below and it's converted to uppercase instantly. Handy for headlines, CSS text-transform testing, or just yelling politely in an email.",
    transform: "uppercase",
    shape: "simple",
    faq: [
      { q: "Does it handle accented letters?", a: "Yes — it uses the browser's built-in uppercase conversion, which correctly handles accented Latin characters (é → É) and most non-English alphabets." },
      { q: "Will this affect numbers or punctuation?", a: "No — only letters change case. Numbers, spaces and punctuation pass through unchanged." },
      { q: "Can I use this instead of CSS text-transform?", a: "For display purposes, CSS `text-transform: uppercase` is usually better since it doesn't change the underlying text. Use this converter when you need the actual characters changed — for a title, a filename, or copy you're pasting elsewhere." },
    ],
  },
  {
    slug: "lowercase-converter",
    eyebrow: "lowercase",
    title: "Lowercase Converter — Convert Text to lower case",
    description:
      "Convert any text to lowercase instantly. Paste your text, copy the result — no signup, runs entirely in your browser.",
    intro:
      "Paste text below to convert it to lowercase. Useful for cleaning up ALL-CAPS text someone sent you, normalizing usernames or slugs, or prepping text for case-insensitive comparison.",
    transform: "lowercase",
    shape: "simple",
    faq: [
      { q: "Why would I need this?", a: "Common cases: someone pastes text with Caps Lock stuck on, you're normalizing data for a spreadsheet, or you need lowercase input for a slug or username field." },
      { q: "Does it change accented characters correctly?", a: "Yes, it uses standard lowercase conversion which handles accented and most non-English letters correctly." },
      { q: "Is this the same as a case-insensitive search?", a: "No — this actually rewrites the text. A case-insensitive search compares text without changing it. Lowercasing both sides is one way to implement that comparison yourself." },
    ],
  },
  {
    slug: "title-case-converter",
    eyebrow: "Title Case",
    title: "Title Case Converter — Capitalize Each Word",
    description:
      "Convert text to Title Case, capitalizing the first letter of each word. Free, instant, runs in your browser.",
    intro:
      "Paste your text to capitalize the first letter of every word — the format used for headlines, book titles and proper nouns in many style guides.",
    transform: "titlecase",
    shape: "simple",
    faq: [
      { q: "Does it skip small words like \"the\" or \"of\"?", a: "No — this is a simple every-word converter, which is what most people searching \"title case converter\" actually want for a quick pass. Formal style guides (AP, Chicago) have exception lists for articles and short prepositions; this tool doesn't apply those rules, so review headline-critical text afterward." },
      { q: "What happens to acronyms like \"NASA\"?", a: "Because every word is re-capitalized from its first letter, an acronym like NASA becomes Nasa. Check acronym-heavy text after converting and fix those by hand." },
      { q: "Can I undo this?", a: "There's no built-in undo — copy your original text somewhere safe first if you might need it back exactly as typed." },
    ],
  },
  {
    slug: "sentence-case-converter",
    eyebrow: "Sentence case",
    title: "Sentence Case Converter — Capitalize the First Letter of Each Sentence",
    description:
      "Convert text to sentence case: lowercase throughout, with the first letter of each sentence capitalized. Free, instant, browser-only.",
    intro:
      "Paste text below to convert it to sentence case — the rest of each sentence is lowercased, and only the first letter after a period, question mark or exclamation point is capitalized, matching normal prose formatting.",
    transform: "sentencecase",
    shape: "simple",
    faq: [
      { q: "Does it capitalize proper nouns like names?", a: "No — it only capitalizes the first letter of each sentence, the definition of sentence case. Names and other proper nouns that should stay capitalized (e.g. \"London\", \"Sarah\") will need a manual fix afterward, since the tool can't tell a proper noun from a regular word." },
      { q: "How does it detect sentence boundaries?", a: "It looks for a period, question mark, or exclamation point followed by whitespace, then capitalizes the next letter. Abbreviations like \"Dr.\" or \"e.g.\" can occasionally trigger a false sentence break — spot-check the result on text with a lot of abbreviations." },
      { q: "Is this different from just capitalizing the first letter of the whole text?", a: "Yes — this capitalizes after every sentence-ending punctuation mark, not just once at the very start, so a multi-sentence paragraph gets every sentence capitalized correctly." },
    ],
  },
  {
    slug: "remove-duplicate-lines",
    eyebrow: "Remove Duplicates",
    title: "Remove Duplicate Lines — Deduplicate a List Online",
    description:
      "Remove duplicate lines from a list or block of text, keeping the first occurrence of each. Free, instant, nothing uploaded.",
    intro:
      "Paste a list below and any line that repeats later in the text is removed, keeping only the first occurrence — useful for cleaning up email lists, keyword lists, or any pasted data with repeats.",
    transform: "dedupe-lines",
    shape: "simple",
    faq: [
      { q: "Is the comparison case-sensitive?", a: "Yes — \"Apple\" and \"apple\" are treated as different lines. Run a lowercase or uppercase conversion first if you need case-insensitive deduplication." },
      { q: "Does it ignore leading/trailing spaces when comparing?", a: "Yes — two lines that are identical except for surrounding whitespace are treated as duplicates, since that's almost always the intent." },
      { q: "What happens to blank lines?", a: "Blank lines are left alone rather than treated as \"duplicates\" of each other, so your paragraph spacing isn't collapsed to a single blank line." },
    ],
  },
  {
    slug: "remove-extra-spaces",
    eyebrow: "Extra Spaces",
    title: "Remove Extra Spaces — Collapse Multiple Spaces Into One",
    description:
      "Remove extra spaces and tabs from text, collapsing runs of whitespace into a single space per line. Free, instant, browser-only.",
    intro:
      "Paste text that has extra spaces or tabs scattered through it — often from copy-pasting out of a PDF or spreadsheet — and each line is cleaned up to single spaces between words, with leading and trailing whitespace trimmed.",
    transform: "remove-extra-spaces",
    shape: "simple",
    faq: [
      { q: "Does this remove line breaks too?", a: "No — line breaks are preserved; only the spacing within each line is cleaned up. Use the separate \"remove line breaks\" tool if you also want to join everything into one paragraph." },
      { q: "Does it fix spacing caused by copying from a PDF?", a: "In most cases, yes — PDF copy-paste often leaves runs of spaces or tabs where columns lined up visually. This collapses those runs to single spaces." },
      { q: "Will it remove blank lines?", a: "No — blank lines (paragraph breaks) are left as-is. Use \"remove empty lines\" if you want those gone too." },
    ],
  },
  {
    slug: "remove-line-breaks",
    eyebrow: "Line Breaks",
    title: "Remove Line Breaks — Join Text Into One Paragraph",
    description:
      "Remove line breaks from text, joining everything into a single paragraph with spaces between what used to be separate lines. Free, instant.",
    intro:
      "Paste text that's broken across many short lines — often from a PDF, an old email, or OCR output — and every line break is replaced with a single space, joining it into one continuous paragraph.",
    transform: "remove-line-breaks",
    shape: "simple",
    faq: [
      { q: "Why would text have unwanted line breaks?", a: "Common sources: text copied from a PDF (which often has a line break at every visual line wrap), an email formatted for a narrow width, or OCR output that follows the original page layout instead of paragraph structure." },
      { q: "Will paragraph breaks be preserved as anything?", a: "No — this joins everything into one continuous paragraph. If you need paragraph breaks preserved as double line breaks, edit those back in manually after joining, since automatically telling a \"paragraph break\" from a \"wrapped line\" isn't reliable." },
      { q: "Does it add extra spaces where lines join?", a: "No — each join is a single space, and any pre-existing extra spaces are trimmed, so you won't end up with doubled gaps." },
    ],
  },
  {
    slug: "remove-empty-lines",
    eyebrow: "Empty Lines",
    title: "Remove Empty Lines — Strip Blank Lines From Text",
    description:
      "Remove all empty and blank lines from a block of text or a list. Free, instant, runs entirely in your browser.",
    intro:
      "Paste text with blank lines scattered through it — common in exported lists, code, or spreadsheet pastes — and every empty or whitespace-only line is removed, leaving the remaining lines packed together.",
    transform: "remove-empty-lines",
    shape: "simple",
    faq: [
      { q: "What counts as an \"empty\" line?", a: "A line that's completely blank, or contains only spaces/tabs, is removed. A line with any visible character stays." },
      { q: "Will this affect paragraph spacing I want to keep?", a: "Yes — this removes every blank line, including ones you're using as paragraph breaks. If you only want to collapse multiple consecutive blank lines down to one, do that manually, since this tool removes them all." },
      { q: "Does the line order change?", a: "No — the remaining lines stay in their original order, just with the blank ones removed." },
    ],
  },
  {
    slug: "sort-lines-alphabetically",
    eyebrow: "Sort Lines",
    title: "Sort Lines Alphabetically — A to Z or Z to A",
    description:
      "Sort a list of lines alphabetically, A→Z or Z→A. Free, instant, works entirely in your browser — paste a list and get it sorted.",
    intro:
      "Paste a list, one item per line, and it's sorted alphabetically. Use the toggle below to switch between A→Z and Z→A order.",
    transform: "sort-az",
    shape: "simple",
    faq: [
      { q: "Is the sort case-sensitive?", a: "No — it sorts case-insensitively (\"apple\" and \"Apple\" sort the same way), which matches how most people expect an alphabetical list to behave." },
      { q: "How are numbers sorted?", a: "Numbers sort as text by default, so \"10\" comes before \"2\" (because \"1\" < \"2\" as characters). For numeric sorting, pad numbers with leading zeros first, or sort in a spreadsheet instead." },
      { q: "What happens to blank lines?", a: "Blank lines sort to wherever an empty string would fall — typically first — so you may want to remove empty lines before sorting if that's not what you want." },
    ],
  },
  {
    slug: "reverse-text",
    eyebrow: "Reverse Text",
    title: "Reverse Text — Flip Text Backwards, Character by Character",
    description:
      "Reverse text character by character — turn 'hello' into 'olleh'. Free, instant, runs entirely in your browser.",
    intro:
      "Paste text below and it's reversed character by character, right to left — useful for palindrome checks, backwards-text jokes, or testing how something handles reversed input.",
    transform: "reverse-text",
    shape: "simple",
    faq: [
      { q: "Does this reverse word order or every character?", a: "Every character, including spaces — so \"hello world\" becomes \"dlrow olleh\", not \"world hello\". Use the line-reverser tool if you want to reverse the order of lines instead." },
      { q: "Can I use this to check if something is a palindrome?", a: "Yes — reverse your text and compare it to the original (ignoring spaces/punctuation/case if needed); if they match, it's a palindrome." },
      { q: "Does it handle emoji correctly?", a: "Multi-character emoji (like flags or skin-tone variants) may split apart when reversed character-by-character, since they're made of several joined code points — this is a known limitation of simple text reversal, not specific to this tool." },
    ],
  },
  {
    slug: "reverse-line-order",
    eyebrow: "Reverse Line Order",
    title: "Reverse Line Order — Flip a List Top to Bottom",
    description:
      "Reverse the order of lines in a list, keeping each line's text intact — the last line becomes the first. Free, instant, runs entirely in your browser.",
    intro:
      "Paste a list below and the order of the lines flips top to bottom — the last line becomes the first, and so on — while the text inside each line stays exactly as typed. That's different from reversing every character: use the character reverser instead if you want \"hello\" to become \"olleh\".",
    transform: "reverse-lines",
    shape: "simple",
    faq: [
      { q: "Does this reverse the letters in each line too?", a: "No — only the order of the lines changes. Each line's own text stays exactly as you typed it; only which line comes first, second, and so on gets flipped." },
      { q: "What's this useful for?", a: "Flipping a chronological log so the newest entry reads first, reversing a numbered list before renumbering it, or undoing an accidental reverse-order paste." },
      { q: "What happens to blank lines?", a: "They're kept in place and flip along with everything else — a blank line at the end of your list ends up at the start of the result." },
    ],
  },
  {
    slug: "trim-whitespace-from-lines",
    eyebrow: "Trim Lines",
    title: "Trim Whitespace From Lines — Clean Leading & Trailing Spaces",
    description:
      "Strip leading and trailing whitespace from every line in a block of text, without touching spacing in the middle of a line. Free, instant, browser-only.",
    intro:
      "Paste text below and every line has its leading and trailing whitespace stripped — the stray spaces and tabs at the start or end of a line that sneak in from copy-pasting between apps. Spacing in the middle of a line is left untouched, so this won't collapse a deliberate double space inside a sentence.",
    transform: "trim-lines",
    shape: "simple",
    faq: [
      { q: "How is this different from \"remove extra spaces\"?", a: "This only trims the start and end of each line. \"Remove extra spaces\" instead collapses repeated spaces anywhere in a line, including the middle of a sentence — pick trim if you only want the edges cleaned." },
      { q: "Does it remove blank lines?", a: "No — a blank line stays blank (and stays in place). Use the \"remove empty lines\" tool afterward if you also want blank lines gone entirely." },
      { q: "Does it affect tabs as well as spaces?", a: "Yes — any whitespace character at the start or end of a line (spaces, tabs) is trimmed, matching how most editors define \"whitespace\"." },
    ],
  },
  {
    slug: "sort-lines-descending",
    eyebrow: "Sort Z to A",
    title: "Sort Lines Z to A — Reverse Alphabetical Order",
    description:
      "Sort a list of lines in reverse alphabetical order, Z to A. Free, instant, works entirely in your browser — paste a list and get it sorted.",
    intro:
      "Paste a list, one item per line, and it comes back sorted in reverse alphabetical order — Z to A. Useful when you want the end of the alphabet first, or just want to flip a list you already sorted the other way.",
    transform: "sort-za",
    shape: "simple",
    faq: [
      { q: "Is this just the A-Z sort reversed?", a: "For most lists, yes — the result reads the same as taking an A-to-Z sort and flipping it top to bottom. Ties (identical lines) may order slightly differently, but the overall Z-to-A ordering is the same either way." },
      { q: "Is the sort case-sensitive?", a: "No — it sorts case-insensitively, so \"apple\" and \"Apple\" are treated as equal for ordering purposes, matching how most people expect an alphabetical list to behave." },
      { q: "How are numbers handled?", a: "Numbers sort as text, so \"9\" comes before \"10\" here (because \"9\" > \"1\" as a character) — the opposite of what numeric sorting would give. For numeric order, pad numbers with leading zeros first." },
    ],
  },
  {
    slug: "add-line-numbers",
    eyebrow: "Line Numbers",
    title: "Add Line Numbers — Number Every Line of Text",
    description:
      "Add sequential line numbers to a block of text, one per line. Free, instant, runs entirely in your browser.",
    intro:
      "Paste text below and each line gets a sequential number prefix — useful for referencing specific lines in code, scripts, or a list when you're discussing it with someone else.",
    transform: "add-line-numbers",
    shape: "simple",
    faq: [
      { q: "What format are the numbers in?", a: "Each line is prefixed with \"1. \", \"2. \", and so on. If you need a different format (like \"[1]\" or just \"1\"), do a quick find-and-replace on the result." },
      { q: "Does numbering restart for blank lines?", a: "No — blank lines get a number too, counted the same as any other line, so the numbering stays continuous and matches what you'd see in a code editor's gutter." },
      { q: "Can I remove the numbers later?", a: "Yes — paste the numbered text into the \"remove line breaks\" or a find-and-replace tool with a pattern like \"^\\d+\\. \" if you need to strip them back out." },
    ],
  },
  {
    slug: "slugify-text",
    eyebrow: "Slugify",
    title: "Slugify Text — Convert Text to a URL-Safe Slug",
    description:
      "Convert any text into a clean, URL-safe slug: lowercase, hyphens instead of spaces, no special characters. Free, instant.",
    intro:
      "Paste a title or phrase and get back a URL-safe slug — lowercase, spaces replaced with hyphens, and anything that isn't a letter, number or hyphen stripped out. The exact transform most static site generators and CMSs apply to page titles.",
    transform: "slugify",
    shape: "simple",
    faq: [
      { q: "What exactly gets removed?", a: "Everything except letters, numbers, spaces and hyphens is stripped; spaces become hyphens; multiple hyphens collapse to one; and any leading or trailing hyphen is trimmed." },
      { q: "Does it handle accented characters?", a: "Accented letters (é, ñ, etc.) are currently stripped rather than transliterated to their plain equivalent — a straightforward title works best; a heavily accented one may need a manual check afterward." },
      { q: "Is this the same slug format WordPress or Jekyll use?", a: "It matches the common convention (lowercase-with-hyphens) used by most blogging platforms and static site generators, so it should drop straight into a URL or filename." },
    ],
  },
  {
    slug: "text-repeater",
    eyebrow: "Text Repeater",
    title: "Text Repeater — Repeat Text a Set Number of Times",
    description:
      "Repeat a word, phrase or block of text any number of times, one copy per line. Free, instant, runs entirely in your browser.",
    intro:
      "Type or paste text below, set how many times you want it repeated, and get every copy back at once — one per line, ready to copy.",
    transform: "text-repeater",
    shape: "repeater",
    faq: [
      { q: "Is there a limit on how many times I can repeat something?", a: "The repeat count is capped at 1000 per run, which keeps the browser responsive — for larger volumes, run it a few times and combine the results." },
      { q: "What's this actually used for?", a: "Common uses: generating filler/test data, padding a message for a character-limit test, or creating repeated placeholder rows for a spreadsheet or mockup." },
      { q: "Are the repeats separated by anything?", a: "Each repeat is on its own line. If you need them separated a different way (commas, no separator), copy the result into the find-and-replace tool and swap the line breaks for whatever you need." },
    ],
  },
  {
    slug: "find-and-replace",
    eyebrow: "Find & Replace",
    title: "Find and Replace Text Online — With Optional Regex",
    description:
      "Find and replace text online, with an optional regular-expression mode for pattern matching. Free, instant, nothing uploaded.",
    intro:
      "Paste your text, enter what to find and what to replace it with, and every match updates live. Turn on regex mode for pattern-based find-and-replace instead of a plain literal match.",
    transform: "find-replace",
    shape: "find-replace",
    faq: [
      { q: "Is the search case-sensitive?", a: "Yes, by default. There's no separate case-insensitive toggle yet — for a case-insensitive replace, run it twice with different capitalizations of your search term, or use a regex like \"(?i)word\" isn't supported, so instead try a character-class pattern in regex mode." },
      { q: "What does regex mode add?", a: "With regex mode on, the \"find\" field is treated as a JavaScript regular expression (e.g. \\d+ for any number) instead of a literal string, so you can match patterns rather than exact text. All matches are replaced (equivalent to the /g flag)." },
      { q: "What happens if my regex is invalid?", a: "If the pattern doesn't parse, the text is left unchanged rather than throwing an error onscreen — check your pattern for unescaped special characters if the replace doesn't seem to do anything." },
    ],
  },
  {
    slug: "regex-tester",
    eyebrow: "Regex Tester",
    title: "Regex Tester — Test Regular Expressions Online",
    description:
      "Test a regular expression against real text with live match highlighting and capture groups shown per match. Free, instant, runs entirely in your browser.",
    intro:
      "Enter a pattern and paste text to test it against — every match highlights inline as you type, and the list below shows each match with its capture groups. No signup, and nothing you paste ever leaves your browser.",
    transform: "none",
    shape: "regex",
    faq: [
      { q: "What regex flavor does this use?", a: "JavaScript's own regular expression engine — the same one running in every browser and in Node.js. Patterns that rely on features JavaScript doesn't support (like PCRE's recursive patterns) won't work here." },
      { q: "What do the flag checkboxes do?", a: "Global (g) finds every match instead of stopping at the first; Ignore case (i) makes matching case-insensitive; Multiline (m) makes ^ and $ match at line boundaries instead of only the start/end of the whole string; Dot-all (s) makes . also match newlines." },
      { q: "How do capture groups show up?", a: "Each match in the list shows its full matched text, plus any parenthesized capture groups numbered in order — group 1, group 2, and so on. Groups that didn't participate in a particular match show as empty." },
      { q: "Is my pattern or test text sent anywhere?", a: "No. Matching runs entirely in your browser using JavaScript's built-in RegExp — nothing is uploaded, so it's safe to test patterns against real, private data." },
    ],
  },
  {
    slug: "qr-code-generator",
    eyebrow: "QR Code Generator",
    title: "QR Code Generator — Text or URL to QR, Free",
    description:
      "Turn any text or URL into a scannable QR code, generated entirely in your browser. Free, instant, downloadable as a PNG.",
    intro:
      "Type or paste text — a URL, Wi-Fi password, contact info, anything — and a QR code appears instantly. Generated entirely client-side, so nothing you type is sent anywhere; download the result as a PNG when you're happy with it.",
    transform: "none",
    shape: "qrcode",
    faq: [
      { q: "Is the text sent to a server to generate the QR code?", a: "No — the QR code library runs entirely in your browser (loaded once from a CDN, the same way this page's fonts are), and the encoding itself happens locally. Nothing you type is uploaded." },
      { q: "Is there a length limit?", a: "QR codes have a real capacity limit that grows with the code's density — a short URL fits easily, but a very long block of text may fail to encode. If that happens, shorten the text or split it." },
      { q: "Can I scan this with any phone?", a: "Yes — any modern phone's camera app reads standard QR codes directly, no separate scanner app needed." },
    ],
  },
  {
    slug: "lorem-ipsum-generator",
    eyebrow: "Lorem Ipsum",
    title: "Lorem Ipsum Generator — Placeholder Text, Any Length",
    description:
      "Generate lorem ipsum placeholder text, any number of paragraphs. Free, instant, runs entirely in your browser.",
    intro:
      "Set how many paragraphs you need and get classic lorem-ipsum-style placeholder text instantly — for mockups, layout testing, or filling a design where the real copy isn't ready yet.",
    transform: "lorem-ipsum",
    shape: "lorem",
    faq: [
      { q: "Is this the traditional Lorem Ipsum passage?", a: "It's generated from the same classic Latin-look word set, but sentences and paragraph lengths are randomized on each run rather than reusing the fixed traditional passage — so you get fresh, varied-length placeholder copy every time instead of the same block." },
      { q: "How many paragraphs can I generate?", a: "Up to 50 in one go, which comfortably covers most mockups and layout tests." },
      { q: "Why use placeholder text instead of real content?", a: "Placeholder text lets you judge layout, type scale and spacing without being distracted by (or waiting on) real copy — standard practice in design mockups." },
    ],
  },
  {
    slug: "alternating-case-converter",
    eyebrow: "aLtErNaTiNg cAsE",
    title: "Alternating Case Converter — aLtErNaTiNg CaSe",
    description:
      "Convert text to aLtErNaTiNg CaSe, flipping upper and lower case letter by letter. Free, instant, browser-only.",
    intro:
      "Paste text below to convert it to alternating case — the sarcastic-meme style where every other letter is capitalized, ignoring the original casing.",
    transform: "alternating-case",
    shape: "simple",
    faq: [
      { q: "Is this the \"mocking spongebob\" meme format?", a: "Yes — this is the same alternating-caps style used in that meme, sometimes also called sarcasm case." },
      { q: "Does spacing affect the pattern?", a: "No — only letters are counted for the alternation, so spaces and punctuation pass through without shifting the upper/lower pattern of the surrounding letters." },
      { q: "Can I convert it back to normal text?", a: "Not automatically — alternating case discards the original casing, so there's no reliable way to reconstruct exactly what you started with. Keep a copy of the original if you'll need it again." },
    ],
  },
  {
    slug: "inverse-case-converter",
    eyebrow: "InVeRsE cAsE",
    title: "Inverse Case Converter — Swap Upper and Lower Case",
    description:
      "Invert the case of every letter in your text — uppercase becomes lowercase and lowercase becomes uppercase. Free, instant, browser-only.",
    intro:
      "Paste text below and every letter's case is flipped: what was uppercase becomes lowercase, and what was lowercase becomes uppercase — unlike alternating case, this respects your original casing and just inverts it.",
    transform: "inverse-case",
    shape: "simple",
    faq: [
      { q: "How is this different from alternating case?", a: "Alternating case ignores your original casing and applies a fresh upper/lower pattern by position. Inverse case looks at each letter's actual current case and flips only that one letter — so \"Hello World\" becomes \"hELLO wORLD\", not a positional pattern." },
      { q: "Is inverting twice the same as the original?", a: "Yes — running inverse case on the result gives you back the exact original text, since every letter's case is simply toggled." },
      { q: "Does it affect numbers or symbols?", a: "No — only alphabetic characters have a case to invert; numbers, spaces and punctuation are left unchanged." },
    ],
  },
  {
    slug: "extract-emails-from-text",
    eyebrow: "Extract Emails",
    title: "Extract Email Addresses From Text",
    description:
      "Pull every email address out of a block of text or a document, one per line, with duplicates removed. Free, instant, nothing uploaded.",
    intro:
      "Paste text, an exported document, or a page of scraped content, and every email address found in it is pulled out and listed one per line — useful for cleaning up a contact list or auditing what addresses appear in a document.",
    transform: "extract-emails",
    shape: "simple",
    faq: [
      { q: "Does it remove duplicate addresses?", a: "Yes — each unique email address appears once in the result, even if it occurs multiple times in the source text." },
      { q: "Will it catch every valid email format?", a: "It matches the common pattern (local-part@domain.tld) that covers the vast majority of real-world addresses. Extremely unusual formats (quoted local parts, IP-literal domains) may not match." },
      { q: "Is my text uploaded to check it?", a: "No — the matching runs entirely in your browser with a regular expression; nothing is sent anywhere." },
    ],
  },
  {
    slug: "extract-urls-from-text",
    eyebrow: "Extract URLs",
    title: "Extract URLs From Text",
    description:
      "Pull every http/https URL out of a block of text, one per line, with duplicates removed. Free, instant, browser-only.",
    intro:
      "Paste text — an email, a document, scraped page content — and every URL found in it is pulled out and listed one per line, ready to copy or check.",
    transform: "extract-urls",
    shape: "simple",
    faq: [
      { q: "Does it work for URLs without \"http://\"?", a: "It matches URLs that start with http:// or https://. A bare domain like \"example.com\" with no protocol won't be picked up, since that's indistinguishable from ordinary text without a protocol prefix." },
      { q: "Are duplicate URLs removed?", a: "Yes — each unique URL appears once, even if it's repeated multiple times in the source." },
      { q: "Does it follow the links to check if they work?", a: "No — this only extracts the text of the URLs found; it doesn't make any network requests to verify them." },
    ],
  },
  {
    slug: "extract-numbers-from-text",
    eyebrow: "Extract Numbers",
    title: "Extract Numbers From Text",
    description:
      "Pull every number out of a block of text, one per line, in the order they appear. Free, instant, browser-only.",
    intro:
      "Paste text and every number in it — whole or decimal, including negatives — is pulled out and listed one per line, in the order it appeared in the source.",
    transform: "extract-numbers",
    shape: "simple",
    faq: [
      { q: "Does it handle decimals and negative numbers?", a: "Yes — decimals (3.14) and negative numbers (-42) are both matched correctly." },
      { q: "What about numbers with commas, like \"1,000\"?", a: "The comma breaks the match into \"1\" and \"000\" separately, since comma-formatted thousands separators aren't part of the number pattern. Remove thousands separators first if you need the full figure as one number." },
      { q: "Are duplicates removed?", a: "No — every occurrence is listed, in order, since repeated numbers are often meaningful (e.g. the same total appearing twice)." },
    ],
  },
  {
    slug: "base64-encode",
    eyebrow: "Base64 Encode",
    title: "Base64 Encode Text Online",
    description:
      "Encode text to Base64 instantly. Free, browser-only — nothing you paste is uploaded anywhere.",
    intro:
      "Paste text below to encode it to Base64 — the ASCII-safe encoding commonly used for embedding binary-ish data in JSON, URLs, or email attachments.",
    transform: "base64-encode",
    shape: "simple",
    faq: [
      { q: "Is Base64 encryption?", a: "No — Base64 is an encoding, not encryption. It's trivially reversible by anyone (including this same tool's decode page) and provides no confidentiality. Don't use it to protect sensitive data." },
      { q: "Does it handle Unicode text correctly?", a: "Yes — the input is UTF-8 encoded before Base64 conversion, so accented letters, emoji and non-Latin scripts round-trip correctly through encode and decode." },
      { q: "What's Base64 commonly used for?", a: "Embedding small binary data in text-only formats like JSON or XML, encoding images inline in CSS/HTML (data URIs), and email attachment encoding (MIME)." },
    ],
  },
  {
    slug: "base64-decode",
    eyebrow: "Base64 Decode",
    title: "Base64 Decode Text Online",
    description:
      "Decode a Base64 string back to readable text instantly. Free, browser-only, nothing uploaded.",
    intro:
      "Paste a Base64-encoded string below to decode it back to plain text.",
    transform: "base64-decode",
    shape: "simple",
    faq: [
      { q: "What happens if the input isn't valid Base64?", a: "The result area shows \"Invalid Base64 input\" rather than garbled output, so you know immediately that the string wasn't decodable as-is." },
      { q: "Does it handle padding characters (=)?", a: "Yes — standard Base64 padding is handled automatically; you don't need to strip or add \"=\" characters yourself." },
      { q: "Can I decode a data: URI directly?", a: "Strip the \"data:...;base64,\" prefix first — only the Base64 portion after the comma should be pasted in." },
    ],
  },
  {
    slug: "url-encode",
    eyebrow: "URL Encode",
    title: "URL Encode Text Online (Percent-Encoding)",
    description:
      "Percent-encode text for safe use in a URL — spaces, symbols and special characters are escaped. Free, instant, browser-only.",
    intro:
      "Paste text below to URL-encode it — spaces become %20, and other characters that aren't safe in a URL are escaped to their percent-encoded form.",
    transform: "url-encode",
    shape: "simple",
    faq: [
      { q: "Is this the same as encoding a full URL?", a: "This encodes a single value (like a query parameter), escaping characters such as spaces, &, = and ? that would otherwise break a URL's structure. Don't run a whole URL through this or you'll also encode its own \"://\" and \"/\" separators." },
      { q: "Why does a space become %20 and not +?", a: "%20 is the standard percent-encoding for a space (used in URL paths and most contexts); \"+\" is a legacy convention specific to form-encoded query strings. This tool uses the standard %20 form." },
      { q: "Is my text sent anywhere to encode it?", a: "No — it uses the browser's built-in encodeURIComponent, entirely client-side." },
    ],
  },
  {
    slug: "url-decode",
    eyebrow: "URL Decode",
    title: "URL Decode Text Online (Percent-Decoding)",
    description:
      "Decode a percent-encoded URL string back to readable text. Free, instant, browser-only.",
    intro:
      "Paste a percent-encoded string (like a URL query parameter) below to decode it back to its original, readable form.",
    transform: "url-decode",
    shape: "simple",
    faq: [
      { q: "What if the string isn't validly encoded?", a: "You'll see \"Invalid URL-encoded input\" rather than a broken partial result, so a malformed % sequence is obvious immediately." },
      { q: "Does it decode + as a space?", a: "No — this decodes standard percent-encoding only. If your string uses \"+\" for spaces (form-encoding), replace \"+\" with a space or %20 first." },
      { q: "Can I decode an entire URL, not just one parameter?", a: "Yes, though be aware structural characters like \"/\" and \":\" that weren't actually percent-encoded will simply pass through unchanged." },
    ],
  },
  {
    slug: "html-entity-encode",
    eyebrow: "HTML Encode",
    title: "HTML Entity Encoder — Escape Special Characters",
    description:
      "Escape text for safe use inside HTML — converts <, >, &, quotes and apostrophes to their HTML entity equivalents. Free, instant, browser-only.",
    intro:
      "Paste text below to escape it for safe embedding inside HTML — the characters that would otherwise be interpreted as markup (<, >, &, \", ') are converted to their entity codes.",
    transform: "html-entities-encode",
    shape: "simple",
    faq: [
      { q: "Why would I need to escape text before putting it in HTML?", a: "If user-provided or arbitrary text is inserted into an HTML page without escaping, characters like < and > can be interpreted as markup — at best breaking the layout, at worst creating an XSS vulnerability. Escaping neutralizes that." },
      { q: "Does this escape every possible character?", a: "It escapes the five characters that matter for HTML safety: <, >, &, \" and '. That covers the standard XSS-prevention case; it doesn't transliterate accented letters or emoji, which don't need escaping in HTML." },
      { q: "Is this a substitute for proper server-side sanitization?", a: "For anything security-sensitive (rendering user input in a real application), use your framework's built-in escaping at the point of output — this tool is for one-off manual encoding, not a runtime security control." },
    ],
  },
  {
    slug: "html-entity-decode",
    eyebrow: "HTML Decode",
    title: "HTML Entity Decoder — Unescape HTML Entities",
    description:
      "Decode HTML entities (&amp;, &lt;, &#39;, and more) back to their original characters. Free, instant, browser-only.",
    intro:
      "Paste text containing HTML entities below to decode them back to normal readable characters — handles named entities like &amp; and numeric entities like &#39; alike.",
    transform: "html-entities-decode",
    shape: "simple",
    faq: [
      { q: "Which entities does it support?", a: "All of them — decoding is done by the browser's own HTML parser, so every named entity (&amp;, &copy;, &hearts;, etc.) and every numeric entity (&#39;, &#x27;) is handled correctly, not just a hand-picked list." },
      { q: "Is this safe to use on untrusted HTML?", a: "The decoding itself doesn't execute anything — it only converts entity text to characters. It doesn't render the HTML, so no scripts run." },
      { q: "Why would text have HTML entities in it in the first place?", a: "Common sources: copying text out of a web page's source, an RSS/XML feed, or an export from a CMS that stores content with entities encoded." },
    ],
  },
  {
    slug: "text-to-binary",
    eyebrow: "Text to Binary",
    title: "Text to Binary Converter",
    description:
      "Convert text to binary code (8-bit bytes, space-separated). Free, instant, browser-only.",
    intro:
      "Paste text below to convert each character to its binary (base-2) representation, shown as space-separated 8-bit bytes.",
    transform: "binary-encode",
    shape: "simple",
    faq: [
      { q: "How is each character converted?", a: "Text is first encoded as UTF-8 bytes, then each byte is shown as an 8-digit binary number — this correctly handles accented letters, emoji and non-English text, not just basic ASCII." },
      { q: "Can I convert the binary back to text?", a: "Yes — use the binary-to-text converter, which reverses this exact process." },
      { q: "Why 8 digits per byte?", a: "A byte is 8 bits, so padding every binary number to 8 digits (e.g. 01000001 for \"A\") keeps every byte the same width and makes the output easy to split back apart." },
    ],
  },
  {
    slug: "binary-to-text",
    eyebrow: "Binary to Text",
    title: "Binary to Text Converter",
    description:
      "Convert binary code (space-separated 8-bit bytes) back to readable text. Free, instant, browser-only.",
    intro:
      "Paste space-separated binary bytes below (like 01001000 01101001) to convert them back to readable text.",
    transform: "binary-decode",
    shape: "simple",
    faq: [
      { q: "What format does the binary need to be in?", a: "Space-separated groups of 0s and 1s, one group per byte — the same format this tool's text-to-binary converter produces. Other separators (commas, no spaces) won't parse correctly." },
      { q: "What happens with invalid binary input?", a: "You'll see \"Invalid binary input\" rather than garbled text, so a malformed byte is obvious." },
      { q: "Does it handle multi-byte characters like emoji?", a: "Yes — the bytes are decoded as UTF-8, so multi-byte characters reconstruct correctly as long as all their bytes are present and in order." },
    ],
  },
  {
    slug: "text-to-hex",
    eyebrow: "Text to Hex",
    title: "Text to Hexadecimal Converter",
    description:
      "Convert text to hexadecimal byte values, space-separated. Free, instant, browser-only.",
    intro:
      "Paste text below to convert it to hexadecimal — each byte of the UTF-8 encoded text shown as a two-digit hex value.",
    transform: "hex-encode",
    shape: "simple",
    faq: [
      { q: "Why hex instead of binary?", a: "Hex is a more compact, common way to represent byte values — two hex digits per byte instead of eight binary digits — and is the standard format used in debuggers, network dumps and color codes." },
      { q: "Does it handle non-ASCII text?", a: "Yes — text is UTF-8 encoded first, so accented characters and emoji convert to their correct multi-byte hex sequences." },
      { q: "Can I convert this back to text?", a: "Yes, with the hex-to-text converter." },
    ],
  },
  {
    slug: "hex-to-text",
    eyebrow: "Hex to Text",
    title: "Hexadecimal to Text Converter",
    description:
      "Convert hexadecimal byte values back to readable text. Free, instant, browser-only.",
    intro:
      "Paste hex byte values below (spaces, commas or a continuous string all work) to convert them back to readable text.",
    transform: "hex-decode",
    shape: "simple",
    faq: [
      { q: "What hex formats are accepted?", a: "Space-separated (\"48 69\"), comma-separated, or one continuous string (\"4869\") — all are accepted; a leading \"0x\" on values is also stripped automatically." },
      { q: "What if the hex is invalid?", a: "You'll see \"Invalid hex input\" if the string contains non-hex characters or an odd number of hex digits (which can't form complete bytes)." },
      { q: "Does this handle Unicode text correctly?", a: "Yes, as long as the hex represents valid UTF-8 bytes — which is exactly what this tool's text-to-hex converter produces." },
    ],
  },
  {
    slug: "morse-code-translator",
    eyebrow: "Text → Morse",
    title: "Morse Code Translator — Text to Morse",
    description:
      "Translate text into Morse code — letters, numbers and basic punctuation. Free, instant, browser-only.",
    intro:
      "Paste text below to translate it into Morse code — dots and dashes for each letter and number, with \"/\" separating words.",
    transform: "morse-encode",
    shape: "simple",
    faq: [
      { q: "What characters does it support?", a: "Letters A–Z, digits 0–9, and basic punctuation (period, comma, question mark). Other characters are silently dropped, since standard International Morse Code doesn't define a symbol for them." },
      { q: "How are words separated?", a: "Letters within a word are space-separated; a forward slash (/) marks the boundary between words, which is the standard written convention for Morse code." },
      { q: "Can I convert Morse code back to text?", a: "Yes, with the Morse-to-text translator." },
    ],
  },
  {
    slug: "morse-code-to-text",
    eyebrow: "Morse → Text",
    title: "Morse Code to Text Translator",
    description:
      "Translate Morse code (dots and dashes) back into readable text. Free, instant, browser-only.",
    intro:
      "Paste Morse code below — letters space-separated, words separated by \"/\" — to translate it back into readable text.",
    transform: "morse-decode",
    shape: "simple",
    faq: [
      { q: "What format does the Morse code need to be in?", a: "Each letter's dots/dashes separated by a space, and \"/\" between words — the same format produced by this tool's text-to-Morse translator." },
      { q: "What happens with a code that doesn't match a known letter?", a: "Unrecognized groups are skipped, so a typo in the Morse (an extra dot, a missing dash) will drop that one letter rather than corrupt the whole result." },
      { q: "Is Morse code still used for anything today?", a: "Mainly amateur radio, some aviation/maritime signaling, and accessibility tools — but it's also a common puzzle/learning exercise, which is the more typical use for a tool like this." },
    ],
  },
  {
    slug: "rot13-cipher",
    eyebrow: "ROT13",
    title: "ROT13 Encoder/Decoder — Encode or Decode Text",
    description:
      "Encode or decode text with the ROT13 cipher — a simple letter-rotation cipher that's its own inverse. Free, instant, browser-only.",
    intro:
      "Paste text below to run it through ROT13 — each letter is shifted 13 places through the alphabet. Since 13 is half of 26, running the same text through ROT13 twice returns the original — so this one page both encodes and decodes.",
    transform: "rot13",
    shape: "simple",
    faq: [
      { q: "Is ROT13 secure encryption?", a: "No — it's a simple obfuscation cipher historically used to hide spoilers or punchlines from casual glance, not a security mechanism. It provides no real protection against anyone who wants to read it." },
      { q: "Why does the same page both encode and decode?", a: "Because ROT13 is symmetric: applying it twice returns the original text, so encoding and decoding are literally the same operation." },
      { q: "Does it affect numbers or symbols?", a: "No — only the 26 letters (A–Z, a–z) are rotated; numbers, spaces and punctuation pass through unchanged." },
    ],
  },
  {
    slug: "json-formatter",
    eyebrow: "JSON Formatter",
    title: "JSON Formatter — Pretty-Print JSON Online",
    description:
      "Paste minified or messy JSON and get it pretty-printed with 2-space indentation, instantly. Free, browser-only, catches syntax errors as it formats.",
    intro:
      "Paste minified, single-line, or inconsistently-indented JSON below and it comes back cleanly indented and readable. If the JSON has a syntax error, the exact parser error shows instead of a formatted result, so you know precisely what to fix.",
    transform: "json-format",
    shape: "simple",
    faq: [
      { q: "What indentation does it use?", a: "A consistent 2-space indent, applied recursively through nested objects and arrays — the standard, compact style used by most JSON tooling and linters." },
      { q: "What happens if my JSON has a syntax error?", a: "Instead of a formatted result, you'll see \"Invalid JSON:\" followed by the JavaScript parser's own error message (often naming the character position), which is usually enough to find a missing comma, quote, or bracket." },
      { q: "Does it change the data, like sorting keys?", a: "No — keys keep their original order and values are untouched. Only whitespace changes: every nested level gets consistent indentation." },
    ],
  },
  {
    slug: "json-validator",
    eyebrow: "JSON Validator",
    title: "JSON Validator — Check JSON Syntax Online",
    description:
      "Paste JSON and instantly see whether it's valid — and exactly where the syntax error is if it isn't. Free, browser-only, nothing uploaded.",
    intro:
      "Paste JSON below to check it's syntactically valid. Valid input comes back cleanly formatted as confirmation; invalid input shows the parser's own error message instead, naming what's wrong so you don't have to eyeball hundreds of lines for a stray comma.",
    transform: "json-format",
    shape: "simple",
    faq: [
      { q: "How is this different from the JSON formatter?", a: "Nothing under the hood — validating and formatting are the same operation (parse, then re-print). This page is aimed at \"is this valid?\" checks; the formatter page is aimed at \"make this readable.\" Use whichever framing matches what you're doing." },
      { q: "Does it check my data against a schema?", a: "No — it only checks that the JSON is syntactically well-formed (correct brackets, quotes, commas), not that it matches a particular shape or set of required fields. That needs a JSON Schema validator, which is a different tool." },
      { q: "Is my JSON uploaded anywhere?", a: "No. Parsing happens entirely in your browser via the same JSON.parse every JavaScript environment uses — nothing is sent to a server." },
    ],
  },
  {
    slug: "json-minifier",
    eyebrow: "JSON Minifier",
    title: "JSON Minifier — Compact JSON to One Line",
    description:
      "Strip all whitespace from JSON down to the smallest valid form, in one line. Free, browser-only, useful before pasting JSON into a size-limited field.",
    intro:
      "Paste readable, indented JSON below and get back the smallest valid form — every non-essential space, tab and newline removed. Useful when a config field, URL parameter, or API payload has a size limit and the pretty-printed version won't fit.",
    transform: "json-minify",
    shape: "simple",
    faq: [
      { q: "Does minifying change the data?", a: "No — only whitespace between tokens is removed. Every key, value, bracket and comma stays exactly as parsed; the data is identical, just smaller in byte size." },
      { q: "Will this break string values that contain spaces?", a: "No — whitespace is only stripped between JSON's structural tokens (commas, colons, brackets). Spaces that are part of an actual string value, like \"New York\", are preserved untouched." },
      { q: "What if I paste invalid JSON?", a: "You'll see \"Invalid JSON:\" and the parser's error message instead of a minified result — minifying requires parsing first, so broken JSON can't be minified until the syntax error is fixed." },
    ],
  },
  {
    slug: "markdown-to-html-converter",
    eyebrow: "Markdown to HTML",
    title: "Markdown to HTML Converter — Online, Instant",
    description:
      "Convert Markdown to clean HTML — headers, bold/italic, links, lists, code blocks and blockquotes. Free, instant, runs entirely in your browser.",
    intro:
      "Paste Markdown below and get back the equivalent HTML, ready to paste into a CMS or static site. Covers the everyday subset — headers, bold/italic, inline and fenced code, links, images, lists, blockquotes and horizontal rules.",
    transform: "markdown-to-html",
    shape: "simple",
    faq: [
      { q: "Does it support the full CommonMark spec?", a: "No — it covers the commonly-used subset (headers, bold/italic, code, links, images, lists, blockquotes, horizontal rules, paragraphs), which is enough for READMEs and notes, but not every CommonMark edge case (nested blockquotes, footnotes, tables aren't supported)." },
      { q: "Is raw HTML in my Markdown passed through untouched?", a: "No — for safety, any HTML you paste is escaped rather than passed through raw, so the output can't include arbitrary injected markup. Use standard Markdown syntax for formatting instead." },
      { q: "Does it handle fenced code blocks with triple backticks?", a: "Yes — content between a pair of \\`\\`\\` lines is treated as a code block and rendered inside <pre><code>, with the code's own contents escaped rather than interpreted as Markdown." },
    ],
  },
  {
    slug: "md5-hash-generator",
    eyebrow: "MD5 Hash",
    title: "MD5 Hash Generator",
    description:
      "Generate the MD5 hash of any text, entirely in your browser. Free, instant, nothing uploaded.",
    intro:
      "Type or paste text below to generate its MD5 hash — a 32-character hexadecimal fingerprint of the input, computed entirely on your device.",
    transform: "md5-hash",
    shape: "simple",
    faq: [
      { q: "Is MD5 secure for passwords?", a: "No — MD5 is cryptographically broken and unsuitable for password storage or security purposes; it's kept here for legacy compatibility checks (verifying old checksums, matching a known MD5 value) rather than as a security recommendation." },
      { q: "What is MD5 still reasonably used for?", a: "Non-security checksums — quickly checking whether two files or strings are identical, or matching against a legacy system that stores MD5 hashes." },
      { q: "Does the hash change if I add a single space?", a: "Yes — MD5 is extremely sensitive to input; even one extra character produces a completely different hash, which is expected and by design." },
    ],
  },
  {
    slug: "sha256-hash-generator",
    eyebrow: "SHA-256 Hash",
    title: "SHA-256 Hash Generator",
    description:
      "Generate the SHA-256 hash of any text using your browser's built-in Web Crypto API. Free, instant, nothing uploaded.",
    intro:
      "Type or paste text below to generate its SHA-256 hash — a 64-character hexadecimal digest, computed using your browser's native cryptography engine rather than a hand-rolled implementation.",
    transform: "sha256-hash",
    shape: "simple",
    faq: [
      { q: "Why SHA-256 instead of MD5?", a: "SHA-256 is cryptographically strong and still considered secure for integrity checks and many security use cases, unlike MD5 or SHA-1, both of which have known collision weaknesses." },
      { q: "How is this computed — is it really running locally?", a: "Yes — it uses the Web Crypto API (crypto.subtle.digest) built into your browser, the same engine used by real cryptographic applications, entirely on your device." },
      { q: "Is this suitable for hashing passwords?", a: "Not on its own — a raw SHA-256 hash of a password is vulnerable to precomputed lookup-table attacks. Real password storage needs a slow, salted algorithm designed for that purpose (bcrypt, Argon2, scrypt), not a fast general-purpose hash like this." },
    ],
  },
  {
    slug: "uuid-generator",
    eyebrow: "UUID Generator",
    title: "UUID Generator — Random UUID v4",
    description:
      "Generate random UUID v4 identifiers, one or many at once. Free, instant, cryptographically random, browser-only.",
    intro:
      "Set how many UUIDs you need and get random, version-4 UUIDs instantly — generated using your browser's cryptographically secure random number generator.",
    transform: "uuid-generator",
    shape: "uuid",
    faq: [
      { q: "Are these UUIDs actually unique?", a: "Version-4 UUIDs are randomly generated from 122 bits of randomness, making a collision astronomically unlikely — the same standard used by most databases and programming language UUID libraries." },
      { q: "Is the randomness cryptographically secure?", a: "Yes — it uses crypto.randomUUID() (or crypto.getRandomValues() as a fallback), the browser's cryptographically secure random source, not Math.random()." },
      { q: "How many can I generate at once?", a: "Up to 200 per run — enough for seeding test data or filling out a batch of records." },
    ],
  },
  {
    slug: "random-password-generator",
    eyebrow: "Password Generator",
    title: "Random Password Generator",
    description:
      "Generate a strong, random password with your choice of length and character types. Free, cryptographically random, browser-only — your password is never sent anywhere.",
    intro:
      "Choose a length and which character types to include, and get a random password generated entirely on your device using a cryptographically secure random source.",
    transform: "password-generator",
    shape: "password",
    faq: [
      { q: "Is the password sent anywhere?", a: "No — it's generated entirely in your browser using crypto.getRandomValues() and never transmitted. Nobody but you ever sees it, including us." },
      { q: "How random is it really?", a: "It uses the Web Crypto API's cryptographically secure random number generator — the same class of randomness used for real security purposes — not Math.random(), which many simpler password generators rely on and which isn't designed to be unpredictable." },
      { q: "What length should I use?", a: "16 characters or more is a reasonable modern default for most accounts; use the maximum your target service allows for anything sensitive, and rely on a password manager rather than memorizing it." },
    ],
  },
  {
    slug: "strikethrough-text-generator",
    eyebrow: "Strikethrough",
    title: "Strikethrough Text Generator",
    description:
      "Generate strikethrough text you can paste anywhere — social media, chat apps, anywhere plain Unicode text is accepted. Free, instant.",
    intro:
      "Type text below to get a strikethrough version using a Unicode combining character — it works anywhere plain text is accepted, including places that don't support HTML or Markdown formatting.",
    transform: "strikethrough-text",
    shape: "simple",
    faq: [
      { q: "How does this work without HTML?", a: "Each character is followed by a Unicode \"combining long stroke overlay\" mark, which visually draws a line through the previous character — it's real text, not an image or HTML tag, so it works in plain-text contexts like social media bios or chat." },
      { q: "Will it display correctly everywhere?", a: "Almost everywhere modern — most apps and platforms render combining characters correctly, though very old or minimal text renderers occasionally show it inconsistently." },
      { q: "Can I copy this into a Word document?", a: "Yes — since it's just Unicode text, it pastes like any other text." },
    ],
  },
  {
    slug: "upside-down-text-generator",
    eyebrow: "Upside Down",
    title: "Upside Down Text Generator",
    description:
      "Flip your text upside down using Unicode look-alike characters — paste it anywhere plain text works. Free, instant.",
    intro:
      "Type text below to flip it upside down — each character is swapped for a Unicode character that looks like it, rotated 180°, and the whole string is reversed so it reads correctly when flipped.",
    transform: "upside-down-text",
    shape: "simple",
    faq: [
      { q: "Does every character have an upside-down equivalent?", a: "Most common letters and numbers do, using look-alike Unicode characters from various scripts. A few uncommon symbols don't have a good match and are left as-is." },
      { q: "Is this real text or an image?", a: "Real Unicode text — it copies and pastes like normal text anywhere, including social media bios, usernames and chat apps." },
      { q: "Why is the string reversed too?", a: "Flipping each character upside down without reversing the order would put the last letter first when read normally — reversing the order as well makes the whole word read correctly when the page (or your head) is turned upside down." },
    ],
  },
  {
    slug: "bold-text-generator",
    eyebrow: "Bold Unicode",
    title: "Bold Text Generator — Unicode Bold, No Formatting Needed",
    description:
      "Generate bold-looking text using Unicode mathematical bold characters — works anywhere plain text is accepted, including places without bold formatting. Free, instant.",
    intro:
      "Type text below to convert it to Unicode mathematical bold characters — real bold-looking text that works in plain-text fields (bios, usernames, captions) that don't support markdown or HTML bold formatting.",
    transform: "bold-text",
    shape: "simple",
    faq: [
      { q: "How is this different from HTML <b> or markdown **bold**?", a: "Those rely on the app rendering formatting tags. This uses separate Unicode characters that are already bold-shaped, so it displays as bold in plain-text contexts (social bios, some chat apps) where formatting tags aren't rendered at all." },
      { q: "Does it work for numbers too?", a: "Yes — digits 0–9 have Unicode bold equivalents as well as letters." },
      { q: "Will screen readers read this correctly?", a: "Not reliably — because these are different Unicode code points rather than the original letters with a style applied, some screen readers may mispronounce or skip them. Avoid this for anything accessibility-critical." },
    ],
  },
];

/**
 * The tool body embedded on every collection page. `shape` determines which
 * controls render; `transform` (for non-home pages) is baked in as a fixed
 * data attribute — the page always performs that one operation. The home
 * page (p.home = true) instead renders every extra-control row and a
 * transform dropdown, letting assets/app.js switch shapes client-side.
 */
export function renderTool(p = {}) {
  const isHome = !!p.home;
  const transform = p.transform || "none";
  const shape = isHome ? "simple" : (p.shape || "simple");

  const stat = (key, label) =>
    `<div class="stat" data-stat="${key}">
        <span class="stat-num" data-count="${key}">0</span>
        <span class="stat-label">${label}</span>
      </div>`;

  // A page-specific character limit (e.g. a platform's post length cap) adds
  // one extra stat card showing how much room is left, going red past zero.
  // Purely additive: pages with no `limit` render the stats bar exactly as
  // before. See assets/app.js's render() for the data-limit read.
  const limitStat = p.limit
    ? `<div class="stat stat--limit" data-stat="remaining">
        <span class="stat-num" data-count="remaining">${p.limit}</span>
        <span class="stat-label">left of ${p.limit}</span>
      </div>`
    : "";

  const statsBar = `
    <div class="stats" role="status" aria-live="polite"${p.limit ? ` data-limit="${p.limit}"` : ""}>
      ${stat("words", "words")}
      ${stat("characters", "characters")}
      ${limitStat}
      ${stat("charactersNoSpaces", "no spaces")}
      ${stat("sentences", "sentences")}
      ${stat("reading", "min read")}
    </div>`;

  // Grouped into optgroups — 40+ flat options in one dropdown is unusable;
  // grouping by what the tool DOES (not the underlying implementation) is
  // how a visitor actually thinks about picking one.
  const transformGroups = [
    ["Count & analyze", [
      ["none", "Word / character counter"],
    ]],
    ["Change case", [
      ["uppercase", "UPPERCASE"],
      ["lowercase", "lowercase"],
      ["titlecase", "Title Case"],
      ["sentencecase", "Sentence case"],
      ["alternating-case", "aLtErNaTiNg CaSe"],
      ["inverse-case", "InVeRsE Case"],
    ]],
    ["Clean & format", [
      ["dedupe-lines", "Remove duplicate lines"],
      ["remove-extra-spaces", "Remove extra spaces"],
      ["remove-line-breaks", "Remove line breaks"],
      ["remove-empty-lines", "Remove empty lines"],
      ["trim-lines", "Trim each line"],
    ]],
    ["Reorganize", [
      ["sort-az", "Sort lines A → Z"],
      ["sort-za", "Sort lines Z → A"],
      ["reverse-text", "Reverse text"],
      ["reverse-lines", "Reverse line order"],
      ["add-line-numbers", "Add line numbers"],
    ]],
    ["Extract", [
      ["extract-emails", "Extract email addresses"],
      ["extract-urls", "Extract URLs"],
      ["extract-numbers", "Extract numbers"],
    ]],
    ["Encode & decode", [
      ["base64-encode", "Base64 encode"],
      ["base64-decode", "Base64 decode"],
      ["url-encode", "URL encode"],
      ["url-decode", "URL decode"],
      ["html-entities-encode", "HTML entity encode"],
      ["html-entities-decode", "HTML entity decode"],
      ["binary-encode", "Text to binary"],
      ["binary-decode", "Binary to text"],
      ["hex-encode", "Text to hex"],
      ["hex-decode", "Hex to text"],
      ["morse-encode", "Text to Morse code"],
      ["morse-decode", "Morse code to text"],
      ["rot13", "ROT13 cipher"],
    ]],
    ["Format & validate", [
      ["json-format", "Format / validate JSON"],
      ["json-minify", "Minify JSON"],
      ["markdown-to-html", "Markdown to HTML"],
    ]],
    ["Hash", [
      ["md5-hash", "MD5 hash"],
      ["sha256-hash", "SHA-256 hash"],
    ]],
    ["Generate", [
      ["slugify", "Slugify / URL slug"],
      ["text-repeater", "Repeat text"],
      ["find-replace", "Find & replace"],
      ["lorem-ipsum", "Lorem ipsum generator"],
      ["uuid-generator", "UUID generator"],
      ["password-generator", "Random password generator"],
    ]],
    ["Fun text styles", [
      ["strikethrough-text", "Strikethrough text"],
      ["upside-down-text", "Upside down text"],
      ["bold-text", "Bold Unicode text"],
    ]],
  ];

  // The picker: a native <select> remains the source of truth (app.js reads
  // transformSel.value directly, unchanged) but is visually hidden — sighted
  // users get category tabs + a chip grid instead of a 43-item flat dropdown,
  // one click to a category, one click to a tool. Keyboard/screen-reader users
  // still get the plain, fully-operable native select.
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const transformDropdown = isHome
    ? `<div class="tool-picker">
      <label class="sr-only" for="transformSel">Choose a tool</label>
      <select id="transformSel" class="transform-sel sr-only">
        ${transformGroups.map(([group, opts]) => `<optgroup label="${group}">${opts.map(([v, label]) => `<option value="${v}"${v === "none" ? " selected" : ""}>${label}</option>`).join("")}</optgroup>`).join("")}
      </select>
      <div class="picker-tabs" role="tablist" aria-label="Tool categories">
        ${transformGroups.map(([group], i) => `<button type="button" class="tab${i === 0 ? " is-active" : ""}" role="tab" aria-selected="${i === 0}" data-group-tab="${slug(group)}">${esc(group)}</button>`).join("\n        ")}
      </div>
      <div class="picker-panels">
        ${transformGroups.map(([group, opts], i) => `<div class="chip-grid" data-group-panel="${slug(group)}"${i === 0 ? "" : " hidden"}>
          ${opts.map(([v, label]) => `<button type="button" class="chip${v === "none" ? " is-active" : ""}" data-value="${v}">${esc(label)}</button>`).join("\n          ")}
        </div>`).join("\n        ")}
      </div>
    </div>`
    : "";

  const findReplaceRow = `
    <div class="extra-row" data-for="find-replace"${isHome ? " hidden" : ""}${!isHome && shape !== "find-replace" ? " hidden" : ""}>
      <label class="field"><span>Find</span><input type="text" id="findInput" placeholder="text or pattern"></label>
      <label class="field"><span>Replace with</span><input type="text" id="replaceInput" placeholder="replacement"></label>
      <label class="check"><input type="checkbox" id="regexToggle"> Regex mode</label>
    </div>`;

  const repeaterRow = `
    <div class="extra-row" data-for="text-repeater"${isHome ? " hidden" : ""}${!isHome && shape !== "repeater" ? " hidden" : ""}>
      <label class="field field--num"><span>Repeat</span><input type="number" id="repeatCount" min="1" max="1000" value="5"></label>
    </div>`;

  const loremRow = `
    <div class="extra-row" data-for="lorem-ipsum"${isHome ? " hidden" : ""}${!isHome && shape !== "lorem" ? " hidden" : ""}>
      <label class="field field--num"><span>Paragraphs</span><input type="number" id="loremCount" min="1" max="50" value="3"></label>
    </div>`;

  const uuidRow = `
    <div class="extra-row" data-for="uuid-generator"${isHome ? " hidden" : ""}${!isHome && shape !== "uuid" ? " hidden" : ""}>
      <label class="field field--num"><span>How many</span><input type="number" id="uuidCount" min="1" max="200" value="5"></label>
    </div>`;

  const passwordRow = `
    <div class="extra-row" data-for="password-generator"${isHome ? " hidden" : ""}${!isHome && shape !== "password" ? " hidden" : ""}>
      <label class="field field--num"><span>Length</span><input type="number" id="pwLength" min="4" max="128" value="16"></label>
      <label class="check"><input type="checkbox" id="pwUpper" checked> Uppercase</label>
      <label class="check"><input type="checkbox" id="pwNumbers" checked> Numbers</label>
      <label class="check"><input type="checkbox" id="pwSymbols"> Symbols</label>
    </div>`;

  const NO_INPUT_SHAPES = ["lorem", "uuid", "password"];

  if (shape === "counter" && !isHome) {
    return `
  <section class="tool" data-transform="none" data-shape="counter">
    ${statsBar}
    <label class="sr-only" for="editor">Your text</label>
    <textarea id="editor" class="editor" placeholder="Type or paste your text here…" spellcheck="true"></textarea>
    <div class="tool-actions">
      <button type="button" class="btn" id="copyBtn">Copy text</button>
      <button type="button" class="btn" id="clearBtn">Clear</button>
    </div>
  </section>`;
  }

  // The regex tester is its own tool shape, not a text-in/text-out transform
  // like the rest of the family — the "result" is highlighted matches inside
  // the original test string plus a match list, not a transformed string.
  // Standalone-page only (same reasoning as the counter shape above): it
  // doesn't fit the home page's swap-a-transform workbench model.
  if (shape === "regex" && !isHome) {
    return `
  <section class="tool tool--regex" data-transform="none" data-shape="regex">
    <div class="regex-controls">
      <label class="field field--pattern">
        <span>Pattern</span>
        <div class="pattern-row">
          <span class="pattern-slash" aria-hidden="true">/</span>
          <input type="text" id="regexPattern" placeholder="e.g. \\d{3}-\\d{4}" autocomplete="off" spellcheck="false">
          <span class="pattern-slash" aria-hidden="true">/</span>
        </div>
      </label>
      <div class="regex-flags" role="group" aria-label="Regex flags">
        <label class="check"><input type="checkbox" id="regexFlagG" checked> Global (g)</label>
        <label class="check"><input type="checkbox" id="regexFlagI" checked> Ignore case (i)</label>
        <label class="check"><input type="checkbox" id="regexFlagM"> Multiline (m)</label>
        <label class="check"><input type="checkbox" id="regexFlagS"> Dot-all (s)</label>
      </div>
    </div>
    <p class="regex-error" id="regexError" role="alert"></p>
    <label for="editor">Test string</label>
    <textarea id="editor" class="editor" placeholder="Paste the text to test your pattern against…" spellcheck="false"></textarea>
    <label for="regexHighlight">Matches</label>
    <div class="editor editor--output regex-highlight" id="regexHighlight" aria-live="polite">Matches appear highlighted here…</div>
    <div class="regex-summary" id="regexSummary" role="status" aria-live="polite"></div>
    <ol class="regex-matches" id="regexMatches"></ol>
    <div class="tool-actions">
      <button type="button" class="btn" id="copyBtn">Copy match list</button>
      <button type="button" class="btn" id="clearBtn">Clear</button>
    </div>
  </section>`;
  }

  // QR code generator: a distinct shape, standalone-page only, same reasoning
  // as counter/regex above. Renders client-side via a small library (qrcodejs)
  // loaded lazily on first use, so an empty page load costs nothing extra.
  if (shape === "qrcode" && !isHome) {
    return `
  <section class="tool tool--qrcode" data-transform="none" data-shape="qrcode">
    <label for="editor">Text or URL</label>
    <textarea id="editor" class="editor" placeholder="Type or paste text or a URL here…" spellcheck="false"></textarea>
    <div class="qr-output-row">
      <div class="qr-canvas" id="qrCanvas"></div>
      <p class="qr-hint" id="qrHint">Type something above to generate a QR code.</p>
    </div>
    <div class="tool-actions">
      <button type="button" class="btn" id="qrDownloadBtn">Download PNG</button>
      <button type="button" class="btn" id="clearBtn">Clear</button>
    </div>
  </section>`;
  }

  const editorHidden = !isHome && NO_INPUT_SHAPES.indexOf(shape) !== -1 ? " hidden" : "";

  return `
  <section class="tool" data-transform="${isHome ? "none" : transform}" data-shape="${isHome ? "home" : shape}">
    ${transformDropdown}
    ${findReplaceRow}
    ${repeaterRow}
    ${loremRow}
    ${uuidRow}
    ${passwordRow}
    <label for="editor"${editorHidden}>Your text</label>
    <textarea id="editor" class="editor" placeholder="Type or paste your text here…" spellcheck="true"${editorHidden}></textarea>
    <label for="output">Result</label>
    <textarea id="output" class="editor editor--output" readonly aria-live="polite" placeholder="Result appears here…"></textarea>
    ${statsBar}
    <div class="tool-actions">
      <button type="button" class="btn" id="copyBtn">Copy result</button>
      <button type="button" class="btn" id="downloadBtn">Download .txt</button>
      <button type="button" class="btn" id="clearBtn">Clear</button>
    </div>
  </section>`;
}
