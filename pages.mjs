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
 *   shape       "counter" | "simple" | "find-replace" | "repeater" | "lorem"
 *   faq         2–3 Q/A, unique per page (drives visible FAQ + FAQPage JSON-LD)
 */

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

  const statsBar = `
    <div class="stats" role="status" aria-live="polite">
      ${stat("words", "words")}
      ${stat("characters", "characters")}
      ${stat("charactersNoSpaces", "no spaces")}
      ${stat("sentences", "sentences")}
      ${stat("reading", "min read")}
    </div>`;

  const transformOptions = [
    ["none", "No transform (just count)"],
    ["uppercase", "UPPERCASE"],
    ["lowercase", "lowercase"],
    ["titlecase", "Title Case"],
    ["sentencecase", "Sentence case"],
    ["dedupe-lines", "Remove duplicate lines"],
    ["remove-extra-spaces", "Remove extra spaces"],
    ["remove-line-breaks", "Remove line breaks"],
    ["remove-empty-lines", "Remove empty lines"],
    ["sort-az", "Sort lines A → Z"],
    ["sort-za", "Sort lines Z → A"],
    ["reverse-text", "Reverse text"],
    ["reverse-lines", "Reverse line order"],
    ["trim-lines", "Trim each line"],
    ["add-line-numbers", "Add line numbers"],
    ["slugify", "Slugify / URL slug"],
    ["text-repeater", "Repeat text"],
    ["find-replace", "Find & replace"],
    ["lorem-ipsum", "Lorem ipsum generator"],
  ];

  const transformDropdown = isHome
    ? `<label class="sr-only" for="transformSel">Choose a tool</label>
       <select id="transformSel" class="transform-sel">
         ${transformOptions.map(([v, label]) => `<option value="${v}"${v === "none" ? " selected" : ""}>${label}</option>`).join("")}
       </select>`
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

  const editorHidden = !isHome && shape === "lorem" ? " hidden" : "";

  return `
  <section class="tool" data-transform="${isHome ? "none" : transform}" data-shape="${isHome ? "home" : shape}">
    ${transformDropdown}
    ${findReplaceRow}
    ${repeaterRow}
    ${loremRow}
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
