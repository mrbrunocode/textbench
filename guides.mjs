/**
 * Per-page supporting content ("guide"), keyed by slug. Rendered on each tool
 * page between the tool and the FAQ (see engine/build.mjs, the
 * `${p.extra || GUIDES[p.slug] || ""}` line). Every block is written for its
 * specific tool — the point is that no two pages share this section, so each
 * URL stands on its own as a genuinely useful page rather than a thin variant
 * of the next. Keep them concrete: what the thing actually is, when you'd reach
 * for it, real examples, and honest limits. HTML is emitted as-is.
 *
 * Wrap each block in <section class="guide">…</section>; <h2> lead, <h3> subs.
 */
const g = (html) => `\n  <section class="guide">${html}\n  </section>`;

export const GUIDES = {
  "word-counter": g(`
    <h2>Why a live word count is handy</h2>
    <p>Word counts drive real limits everywhere: a 500-word college essay, a 300-word product description, a blog post targeting a length, a grant application with a hard cap. Seeing the number update as you type — rather than pasting into a document to check — keeps you writing to the target instead of overshooting and cutting back later.</p>
    <h3>How the count is worked out</h3>
    <p>Text is split on any run of whitespace and the non-empty chunks are counted, which matches how word count works in most writing tools. A hyphenated word like "well-known" counts as one; an em dash between words doesn't join them. Alongside words you get characters, sentences and an estimated reading time, so one paste answers several questions at once.</p>
    <p>Everything runs in your browser — nothing is uploaded — so it works offline and it's safe for a draft you'd rather not paste into someone else's site.</p>`),

  "readability-checker": g(`
    <h2>What these three scores actually measure</h2>
    <p>All three formulas here work from the same two raw ingredients: how long your sentences are, and how long your words are. Nothing else. That's worth knowing up front, because it explains both what they're good for and where they mislead. They can tell you that a passage is dense; they cannot tell you whether it's clear, accurate, well argued or worth reading.</p>
    <h3>Flesch Reading Ease</h3>
    <p>A 0–100 scale where higher is easier. Around 60–70 is "plain English" — roughly what a 13- to 15-year-old reads comfortably, and the usual target for writing aimed at a general audience. Newspapers typically land in the 60s. Insurance policies and academic papers sit in the 30s or below; several US states set a minimum Flesch score for consumer insurance documents, which is one of the few places these numbers carry legal weight.</p>
    <h3>Flesch–Kincaid Grade Level</h3>
    <p>The same inputs rearranged to output a US school grade instead of a 0–100 score. A result of 8.0 means an average American eighth-grader should follow it. It's the score most often quoted in style guides and government plain-language rules, largely because "aim for grade 8" is easier to act on than "aim for 65".</p>
    <h3>Gunning Fog</h3>
    <p>Estimates the years of formal education a reader needs. It works differently from the other two: instead of averaging syllables across every word, it counts what proportion of your words have three or more syllables and weights that. This is why the three scores sometimes disagree — a passage with short sentences but a handful of very long words scores badly on Fog while doing fine on Flesch. Read them together; the disagreement is information.</p>
    <h3>Why the syllable counts are estimates</h3>
    <p>Counting syllables exactly requires a pronunciation dictionary, because English spelling doesn't determine pronunciation ("houses" is two, "baked" is one, despite both ending in a consonant plus vowel plus s/d). Like most readability tools, this uses a vowel-group heuristic with corrections for silent endings. Across a paragraph it's reliable; on individual unusual words — especially names and loanwords — it can be out by one. That's also why nothing is scored until there are at least 20 words: below that, one long word or one missing full stop swings every formula wildly.</p>
    <h3>How to use them without being led astray</h3>
    <p>The failure mode is writing to the number. Because the formulas only see sentence and word length, you can improve every score by chopping sentences in half at arbitrary points and swapping precise terms for vague shorter ones — and end up with worse writing that scores better. Use the score as a smoke alarm: if a passage reads as far harder than your audience needs, something is worth looking at. Then fix it by restructuring the argument, not by hunting long words. It's all computed on your device; nothing you paste is uploaded.</p>`),

  "character-counter": g(`
    <h2>When characters matter more than words</h2>
    <p>Plenty of fields count characters, not words, and usually have a hard limit: a meta description (~155), an SMS (160 per segment), a database <code>VARCHAR</code>, a bio field, an ad headline. For those, the character count — and specifically whether you're under the cap — is the number that matters.</p>
    <h3>With or without spaces?</h3>
    <p>This shows both totals at once, because which one you need depends on the limit. Most platform limits (Twitter/X, meta descriptions) count spaces; a few technical contexts don't. When in doubt, use the "with spaces" figure — it's the conservative choice that keeps you safely under.</p>
    <p>A note on emoji and accents: a single emoji can be one code point or several joined ones (skin-tone and flag combinations), so an emoji-heavy string may count higher than it looks — leave a little headroom. It's all local; nothing you type is sent anywhere.</p>`),

  "twitter-character-counter": g(`
    <h2>Landing a post under 280</h2>
    <p>X's standard post limit is 280 characters, and this counter shows how many you have left, turning red the moment you go over — so you trim before pasting into X rather than after it rejects the post. Type or paste and watch the "left of 280" figure.</p>
    <h3>Two things X counts differently</h3>
    <ul>
      <li><b>Links</b> are always shortened to a fixed length (currently 23 characters) regardless of the real URL, so a link-heavy post may show as "over" here while actually fitting on X. Treat plain-text counts as exact and link-heavy ones as an estimate.</li>
      <li><b>Emoji</b> usually count as 2 characters on X's own counter (it counts UTF-16 code units), which can differ from a plain character count for emoji-heavy text.</li>
    </ul>
    <p>Some subscription tiers get a much higher limit — if that's you, use the plain character counter and track your own number. Nothing is uploaded; drafting happens entirely in your browser.</p>`),

  "meta-description-length-checker": g(`
    <h2>Writing a meta description that isn't truncated</h2>
    <p>Google typically shows around 155–160 characters of a meta description in search results before cutting it off with an ellipsis. Go over and your carefully-chosen call to action may be the part that disappears. This checker turns red once you pass ~155, so you can write to the visible window.</p>
    <h3>Getting the most from the space</h3>
    <ul>
      <li>Front-load the important words — the part most likely to survive truncation is the beginning.</li>
      <li>The real cutoff is by pixel width, not a fixed character count, so 155 is a safe conservative target rather than a precise rule.</li>
      <li>Going over doesn't hide your description entirely — Google may truncate it, or replace it with page text it judges more relevant to the query. Staying under just improves the odds your own wording shows.</li>
    </ul>
    <p>Title tags have a shorter effective limit (~50–60 characters) — use the plain character counter for those. Everything runs locally.</p>`),

  "youtube-title-length-checker": g(`
    <h2>Keeping a video title inside YouTube's limit</h2>
    <p>YouTube hard-stops title input at 100 characters — go over and the upload form simply cuts you off. This checker turns red as you approach the limit so you catch it before you're staring at a truncated title in the studio.</p>
    <h3>The stricter limit that actually matters</h3>
    <p>The 100-character cap is the technical ceiling, but search results, suggested-video rails and especially mobile show far fewer characters — often 60–70 — before truncating. So the practical target is tighter than 100: put the words that make someone click in the first ~60 characters, and treat the rest as bonus context that only shows on the watch page.</p>
    <p>Emoji count against the limit too, and a multi-part emoji can count as more than one character, so leave headroom if your title uses them. All counting is done in your browser; nothing is uploaded.</p>`),

  "reading-time-calculator": g(`
    <h2>Estimating how long a piece takes to read</h2>
    <p>"5 min read" labels on articles set expectations and, honestly, improve click-through — and if you're writing a speech or a script, knowing the spoken length in advance is the difference between finishing on time and being cut off. Paste your text to get an estimate.</p>
    <h3>Reading speed, and why aloud is slower</h3>
    <p>The estimate uses about 230 words per minute, a common average for silent adult reading. Reading <em>aloud</em> is much slower — nearer 130–150 wpm — so for a presentation or voice-over, expect it to take noticeably longer than shown. A useful rule for scripts: ~130 words per minute, so a 650-word script runs roughly five minutes spoken.</p>
    <p>Word, character and sentence counts update alongside the reading time, so you can tune length and pacing together. It's all local — paste an unpublished draft without it leaving your browser.</p>`),

  "word-frequency-counter": g(`
    <h2>Seeing which words you lean on</h2>
    <p>Every writer has crutch words — "just", "really", "actually", a favourite adjective — that pile up without you noticing. A frequency count surfaces them: paste a draft and get every distinct word back, sorted most-used first, so the overused ones rise to the top where you can catch and vary them.</p>
    <h3>Other uses</h3>
    <ul>
      <li>A quick, informal sense of what a piece of text is actually about (its most-frequent meaningful words).</li>
      <li>Rough keyword extraction from a page or transcript.</li>
    </ul>
    <p>It's case-insensitive, so "Word" and "word" count together, which matches how you'd judge repetition. There's no stop-word filtering — common words like "the" and "and" naturally top the list, so scan past them to the interesting part further down. Everything runs in your browser; your draft is never uploaded.</p>`),

  "compare-two-texts": g(`
    <h2>Spotting exactly what changed between two versions</h2>
    <p>When you have a "before" and an "after" — two drafts, an edited paragraph someone sent back, two copies of a list you suspect have drifted — reading them side by side and hunting for changes is slow and error-prone. This lines the two texts up and highlights precisely what was added and removed.</p>
    <h3>Getting a clean comparison</h3>
    <ul>
      <li>If one version was re-wrapped or re-indented, the spacing noise can drown out the real edits — strip that first with the extra-spaces or line-break tools if needed.</li>
      <li>Comparing two lists? Sort both the same way first, or every reordered line reads as a change.</li>
    </ul>
    <p>It's the fast way to answer "what actually changed here?" for prose, lists, or any two blocks of text. The comparison runs entirely in your browser — nothing is uploaded, so it's safe for private drafts.</p>`),

  "uppercase-converter": g(`
    <h2>Converting text to UPPERCASE</h2>
    <p>Retyping a line in capitals is tedious and error-prone; pasting it here and getting it back in UPPERCASE is instant. Handy for headings and labels, constants in code (<code>MAX_RETRIES</code>), spreadsheet columns that need normalising, or acronyms that got typed in lower case.</p>
    <h3>A couple of things to know</h3>
    <ul>
      <li>It's Unicode-aware, so accented letters uppercase correctly (é → É) rather than being stripped.</li>
      <li>Uppercasing is occasionally not perfectly reversible — the German ß becomes SS, and some scripts have context-specific rules — so convert <em>to</em> uppercase freely, but don't rely on uppercasing then lowercasing to recover the exact original.</li>
    </ul>
    <p>Need the opposite or something in between? There are matching lowercase, Title Case and Sentence case tools. Everything runs locally; nothing you paste is sent anywhere.</p>`),

  "lowercase-converter": g(`
    <h2>Converting text to lowercase</h2>
    <p>Text arrives shouting more often than you'd like — a headline pasted in caps, a spreadsheet column in mixed case, an email subject someone typed with caps lock on. Paste it here to get clean, all-lowercase text back instantly, no retyping.</p>
    <h3>Common uses</h3>
    <ul>
      <li>Normalising data before comparison or de-duplication (email addresses, tags, usernames), where <code>User@X.com</code> and <code>user@x.com</code> should be treated as the same.</li>
      <li>Toning down text that was written in all caps without losing the words.</li>
      <li>Preparing text for a slug or a case-insensitive key.</li>
    </ul>
    <p>It's Unicode-aware, so accented and non-Latin letters lowercase correctly. For the reverse or a proper heading style, see the UPPERCASE, Title Case and Sentence case tools. All local — nothing is uploaded.</p>`),

  "title-case-converter": g(`
    <h2>Putting headings into Title Case</h2>
    <p>Title Case capitalises the first letter of each significant word — the convention for headlines, titles and headings in most English style guides. Paste a line and get it back correctly capitalised without going word by word.</p>
    <h3>The small words question</h3>
    <p>Style guides differ on whether short words (a, an, the, and, or, of, in) get capitalised. The common rule is to lowercase articles, coordinating conjunctions and short prepositions <em>unless</em> they're the first or last word of the title — which is what most people mean by "title case." Proper nouns and the first word are always capitalised. It's a convention, not a law, so give the result a quick read against your own style guide for edge cases like hyphenated compounds.</p>
    <p>For all-caps or a single leading capital, use the UPPERCASE and Sentence case tools instead. Everything runs in your browser.</p>`),

  "sentence-case-converter": g(`
    <h2>Fixing text to Sentence case</h2>
    <p>Sentence case capitalises only the first letter of each sentence (and leaves proper nouns alone) — the natural style for body text, descriptions and UI copy. It's the fix for text that arrived IN ALL CAPS or with Random Capitalisation, and it's increasingly the preferred style for headings and buttons in modern interfaces.</p>
    <h3>What it does and doesn't catch</h3>
    <ul>
      <li>It capitalises the letter after sentence-ending punctuation (. ! ?), so multi-sentence paragraphs come out right.</li>
      <li>It can't know your proper nouns — names, brands, places written in lower case won't be re-capitalised automatically, so give the result a quick pass.</li>
    </ul>
    <p>For every-word capitalisation use Title Case; for shouting, UPPERCASE. All conversion happens locally — nothing you paste leaves the browser.</p>`),

  "remove-duplicate-lines": g(`
    <h2>Stripping duplicate lines from a list</h2>
    <p>Merge two mailing lists, paste a log, or export a column and you'll often end up with repeats. This removes duplicate lines and keeps one of each, in the order they first appeared — the quick fix for de-duplicating a list without a spreadsheet formula.</p>
    <h3>Watch for near-duplicates</h3>
    <p>Lines have to match exactly to count as duplicates, so two entries that look the same but differ by a trailing space, or by capitalisation (<code>Apple</code> vs <code>apple</code>), won't be collapsed. If your list has that problem, run it through the trim-whitespace and lowercase tools first, then de-duplicate — that normalises the entries so genuine duplicates actually match.</p>
    <p>Typical uses: cleaning an email list, collapsing a tag list, or reducing repeated log lines to unique ones. Everything runs in your browser, so a list of real addresses or IDs never gets uploaded.</p>`),

  "remove-extra-spaces": g(`
    <h2>Collapsing messy spacing</h2>
    <p>Copy text out of a PDF, an email, or a badly-formatted document and you get double spaces, runs of spaces used for fake alignment, and spaces hanging off the ends of lines. This collapses each run of spaces to a single one and trims the edges, leaving clean, evenly-spaced text.</p>
    <h3>What it fixes</h3>
    <ul>
      <li>Double (or triple) spaces between words — a common artefact of the old "two spaces after a period" habit and of PDF extraction.</li>
      <li>Leading and trailing spaces on lines that break alignment and sorting.</li>
    </ul>
    <p>It leaves line breaks alone — for those, use the remove-line-breaks or remove-empty-lines tools. And if the culprit is an invisible non-breaking space rather than a normal one, that's worth checking too. All processing is local; nothing is uploaded.</p>`),

  "remove-line-breaks": g(`
    <h2>Joining wrapped lines back into flowing text</h2>
    <p>Text copied from a PDF, an email, or a terminal often comes with a line break at the end of every visual line, so pasting it into a document leaves it broken up mid-sentence. This removes those breaks and joins the text into continuous paragraphs you can reflow.</p>
    <h3>Choosing what to keep</h3>
    <p>The usual goal is to remove the <em>hard wrap</em> within a paragraph while keeping the breaks <em>between</em> paragraphs. If you also want to drop blank lines, pair this with the remove-empty-lines tool; if you want to collapse the extra spaces that joining sometimes leaves, follow with remove-extra-spaces. Going the other way — turning flowing text into one line per sentence — is a different job the reverse tools handle.</p>
    <p>Everything runs in your browser, so a document you're cleaning up never leaves your machine.</p>`),

  "remove-empty-lines": g(`
    <h2>Deleting blank lines</h2>
    <p>Double-spaced exports, copied web text, and merged documents are full of empty lines that waste space and break up lists. This removes them, closing the gaps so your content is contiguous — useful before importing a list, tightening up a code block, or cleaning a data column.</p>
    <h3>Blank isn't always empty</h3>
    <p>A line that looks blank might actually contain spaces or tabs, which some tools don't treat as "empty." If a stubborn line survives, run the text through the trim-whitespace tool first so whitespace-only lines become genuinely empty, then remove them here. To collapse <em>runs</em> of blanks down to a single separator rather than removing all of them, that's a slightly different need — remove all, then re-add spacing where you want it.</p>
    <p>All processing happens locally; nothing you paste is uploaded.</p>`),

  "sort-lines-alphabetically": g(`
    <h2>Sorting a list A→Z</h2>
    <p>Alphabetising a list by hand is slow and mistake-prone. Paste one item per line and get it back sorted A to Z — for a bibliography, a glossary, an import file, a set of tags, or any list that's easier to scan (and easier to de-duplicate) in order.</p>
    <h3>How the sort behaves</h3>
    <ul>
      <li>It sorts by character, so numbers and symbols order before letters, and "10" sorts before "9" (as text, not as a number) — expected for text, surprising for numeric lists.</li>
      <li>Leading spaces affect position, so trim first if your lines have stray whitespace.</li>
    </ul>
    <p>Sorting also groups identical lines together, which makes de-duplication easy afterward. For the reverse order use the Z→A tool. Everything runs in your browser — a list of names or IDs is never uploaded.</p>`),

  "reverse-text": g(`
    <h2>Reversing text character by character</h2>
    <p>This flips a string end to end, so "hello" becomes "olleh." It's a small, specific tool with a few real uses: creating a playful reversed-text effect, a quick low-effort obfuscation, checking whether a string is a palindrome, or testing how software handles reversed input.</p>
    <h3>A note on emoji and accents</h3>
    <p>Naively reversing a string can break characters made of multiple code points — some emoji, flags, and accented letters built from combining marks — turning them into garbled fragments. Reversing works cleanly for plain text; if you reverse text with complex emoji and see odd results, that's why. To reverse the <em>order of lines</em> rather than characters, use the reverse-line-order tool instead. All local, nothing uploaded.</p>`),

  "reverse-line-order": g(`
    <h2>Flipping a list upside down</h2>
    <p>This reverses the order of lines — the last line becomes the first — without touching the text within each line. The classic use is putting a chronological list into reverse-chronological order: a log where the oldest entry is at the top, a changelog, or a chat export you'd rather read newest-first.</p>
    <h3>Reverse order vs. sort</h3>
    <p>Reversing is not the same as sorting Z→A. Reversing keeps your existing order and simply flips it, so a list that was in a meaningful sequence (by date, by steps) stays in that sequence, just backwards. Sorting Z→A re-orders alphabetically regardless of the original arrangement. Pick reverse when the current order matters; pick sort when you want alphabetical. To reverse the characters within a line instead, use the reverse-text tool. Everything runs in your browser.</p>`),

  "trim-whitespace-from-lines": g(`
    <h2>Trimming stray spaces off every line</h2>
    <p>Leading and trailing whitespace is invisible but troublesome: it breaks exact-match comparisons, throws off sorting, and creates "duplicates" that don't de-duplicate. This trims the spaces and tabs from the start and end of every line, leaving the content untouched.</p>
    <h3>Why it's often step one</h3>
    <p>Trimming is the cleanup that makes other operations work. Trim before de-duplicating, and entries that differed only by a trailing space finally collapse. Trim before sorting, and lines order by their real first character instead of by a hidden leading space. Trim before comparing two lists, and spurious "changes" disappear. It's the quiet fix behind a lot of "why don't these match?" puzzles. Spaces <em>between</em> words are left alone — for those, use remove-extra-spaces. All local, nothing uploaded.</p>`),

  "sort-lines-descending": g(`
    <h2>Sorting a list Z→A</h2>
    <p>Reverse-alphabetical sorting — Z to A. Paste one item per line and get it back in descending order. Useful when the entries near the end of the alphabet are the ones you want at the top, or simply to complement an A→Z sort when scanning a list from both ends.</p>
    <h3>How it orders</h3>
    <p>Like the A→Z tool, it sorts by character in reverse, so it's a true reverse of alphabetical order (letters, then numbers and symbols, mirrored). Because it's a text sort rather than a numeric one, a list of numbers won't come out in numeric order — "9" will sort before "10." Trim any leading whitespace first so lines order by their real first character. For ascending order, use the Sort A→Z tool; to simply flip an existing order without re-sorting, use reverse-line-order. Everything runs in your browser.</p>`),

  "add-line-numbers": g(`
    <h2>Numbering every line</h2>
    <p>Prefixing each line with its number is handy for referencing specific lines in a review ("see line 42"), turning a plain list into a numbered one, creating a numbered checklist, or making a code snippet easier to talk about in a message or issue.</p>
    <h3>Points to keep in mind</h3>
    <ul>
      <li>The numbers become part of the text, so if you later sort or de-duplicate, the numbers travel with the lines — number <em>after</em> you've finished reordering, not before.</li>
      <li>To remove numbering again, a find-and-replace with a regex (like <code>^\\d+\\.\\s*</code>) strips the prefix back off.</li>
    </ul>
    <p>It's a formatting step, so it pairs naturally with the other line tools — clean and sort first, then number. All processing is local; nothing you paste is uploaded.</p>`),

  "slugify-text": g(`
    <h2>Turning a title into a URL slug</h2>
    <p>A slug is the clean, hyphenated version of a title that goes in a URL: "My First Blog Post!" becomes <code>my-first-blog-post</code>. This does the conversion — lowercasing, replacing spaces with hyphens, and stripping punctuation — so your URLs are readable, consistent and safe.</p>
    <h3>What a good slug does</h3>
    <ul>
      <li>Lowercases everything (URLs are case-sensitive on many servers, so mixed case invites broken links).</li>
      <li>Replaces spaces and runs of punctuation with single hyphens, and trims hyphens off the ends.</li>
      <li>Removes characters that would need URL-encoding, keeping the slug human-readable.</li>
    </ul>
    <p>Slugs also matter for SEO and for anchor links — a descriptive slug tells both people and search engines what the page is about. For encoding a whole URL with its query string instead, use the URL-encode tool. Everything runs locally.</p>`),

  "text-repeater": g(`
    <h2>Repeating text without copy-pasting</h2>
    <p>Sometimes you need the same string many times — test data to fill a field, a separator line, a placeholder paragraph repeated to check a layout, or a bit of ASCII art. Type it once, set how many times, and get the whole block back rather than mashing Ctrl-V.</p>
    <h3>Handy options</h3>
    <ul>
      <li>Repeat on one line or one per line, depending on whether you're building a delimited string or a list.</li>
      <li>Great for generating quick filler: repeat a sentence to reach a rough word count, or a row to stress-test a table.</li>
    </ul>
    <p>For realistic placeholder prose rather than one repeated phrase, the Lorem Ipsum generator is a better fit; for repeated <em>unique</em> values like IDs, see the UUID generator. All local — nothing is uploaded.</p>`),

  "find-and-replace": g(`
    <h2>Find and replace across a whole block of text</h2>
    <p>Swap every occurrence of one string for another in a single pass — rename a variable throughout a snippet, fix a repeated typo, change a term across a document, or reformat data by replacing delimiters. Paste your text, enter what to find and what to replace it with, and it updates all matches at once.</p>
    <h3>Plain text or regex</h3>
    <p>For a literal swap, plain mode is safest — it treats your search exactly as typed. For patterns — "every number", "any whitespace", "lines starting with #" — switch on <b>regex mode</b> and you can match by rule and even reference captured groups in the replacement. Regex is powerful but easy to get subtly wrong, so test on a copy first if the text matters. Everything runs in your browser, so you can safely find-and-replace inside private documents or code.</p>`),

  "regex-tester": g(`
    <h2>Testing a regular expression as you write it</h2>
    <p>Regular expressions are famously easy to get almost right. This lets you write a pattern and see, live, exactly what it matches in your sample text — so you tune it against real input instead of guessing and deploying. Highlighted matches update as you type the pattern.</p>
    <h3>Getting the most out of it</h3>
    <ul>
      <li>Paste representative sample text, including the tricky edge cases you're worried about, and confirm the pattern catches (or avoids) each one.</li>
      <li>Use flags — global for all matches, case-insensitive, multiline — to match how your code will run it.</li>
      <li>Watch for greedy vs. lazy quantifiers (<code>.*</code> vs <code>.*?</code>), the classic source of "it matched too much."</li>
    </ul>
    <p>There are focused Email and Phone regex testers too if that's what you're validating. It all runs locally — your sample data is never uploaded.</p>`),

  "email-regex-tester": g(`
    <h2>Testing an email-matching pattern</h2>
    <p>Validating email addresses with a regex is a rite of passage — and a trap, because truly correct email syntax (RFC 5322) is far more complex than most patterns assume. This tester lets you try a pattern against real addresses and see what it accepts and rejects before you rely on it.</p>
    <h3>Pragmatism beats perfection</h3>
    <p>A "perfect" email regex is enormous and still can't confirm an address actually exists. For most real uses a simple, sensible pattern — something has an <code>@</code>, a domain, and a dot — plus an actual confirmation email is the right approach. Use this to check your pattern isn't rejecting valid addresses (plus-addressing like <code>you+tag@x.com</code>, new long TLDs, subdomains) or waving through obvious junk. Paste a batch of good and bad addresses and eyeball the matches. All local; nothing is uploaded.</p>`),

  "phone-number-regex-tester": g(`
    <h2>Testing a phone-number pattern</h2>
    <p>Phone numbers are deceptively messy: country codes, spaces, dashes, parentheses, dots, and leading + or 00 all vary by region and by how people type them. This tester lets you check a regex against a range of real formats so it doesn't silently reject valid numbers.</p>
    <h3>What to test against</h3>
    <ul>
      <li>The same number written several ways: <code>(555) 123-4567</code>, <code>555-123-4567</code>, <code>+1 555 123 4567</code>, <code>5551234567</code>.</li>
      <li>International formats if you accept them — the <code>+</code> prefix and variable-length country codes.</li>
    </ul>
    <p>A common, robust approach is to <em>strip</em> non-digits first and then validate the digit count, rather than trying to match every possible punctuation layout in one pattern. Use this to compare approaches on your real data. Everything runs in your browser — no upload.</p>`),

  "csv-to-json-converter": g(`
    <h2>Turning a CSV into JSON</h2>
    <p>CSV is how data leaves spreadsheets; JSON is what most APIs and JavaScript want. This converts one to the other in your browser: the header row becomes the object keys and each subsequent row becomes an object, giving you an array of records ready to paste into code or an API request.</p>
    <h3>CSV quirks to watch</h3>
    <ul>
      <li><b>The header row</b> becomes your keys, so make sure the first line is the column names, not data.</li>
      <li><b>Commas inside fields</b> must be quoted in the source CSV, or the columns will misalign.</li>
      <li><b>Types:</b> CSV has no types — everything is text — so numbers may come through as strings unless you convert them afterward.</li>
    </ul>
    <p>For the reverse, use JSON to CSV. Because it runs locally, you can convert a spreadsheet of real customer or financial data without uploading it anywhere.</p>`),

  "json-to-csv-converter": g(`
    <h2>Flattening JSON into a spreadsheet</h2>
    <p>When an API gives you JSON and you need it in Excel, Google Sheets, or a database import, CSV is the bridge. This takes an array of JSON objects and turns it into rows and columns — object keys become the header row, each object becomes a data row.</p>
    <h3>Where JSON and CSV don't line up</h3>
    <ul>
      <li><b>Nested objects and arrays</b> don't have a natural place in a flat table — they'll be stringified or flattened, so deeply nested JSON may need reshaping first.</li>
      <li><b>Inconsistent keys:</b> if some objects have fields others don't, the CSV needs every column, with blanks where a record lacks a value.</li>
    </ul>
    <p>It works best on a flat array of similar records — exactly what most "list" API responses return. For the reverse trip use CSV to JSON. All conversion happens in your browser, so private data stays local.</p>`),

  "yaml-to-json-converter": g(`
    <h2>Converting YAML to JSON</h2>
    <p>YAML is what people write (config files, CI pipelines, Kubernetes manifests) because it's readable; JSON is what programs often want. Since YAML is a superset of JSON, converting to JSON is a clean, well-defined operation — paste your YAML and get equivalent JSON back.</p>
    <h3>Things the conversion surfaces</h3>
    <ul>
      <li><b>Indentation is structure</b> in YAML, so a mis-indented source produces a different shape — the JSON output is a good way to <em>check</em> your YAML nests the way you intended.</li>
      <li><b>Type coercion:</b> YAML reads <code>yes</code>, <code>on</code> and <code>1.0</code> as a boolean, boolean and number unless quoted — the JSON makes those implicit types explicit, which sometimes reveals a surprise.</li>
    </ul>
    <p>For the reverse, use JSON to YAML. It runs locally, so config full of hostnames and settings never leaves your browser.</p>`),

  "json-to-yaml-converter": g(`
    <h2>Converting JSON to YAML</h2>
    <p>YAML is easier to read and edit by hand than JSON — no braces, no quotes on most keys, comments allowed — which is why config files favour it. This converts a JSON document into equivalent YAML so you can hand it to a tool that expects YAML, or just make a dense JSON blob human-friendly.</p>
    <h3>What changes and what to check</h3>
    <ul>
      <li>Braces and brackets become indentation, and most quotes disappear — much lighter to read.</li>
      <li>Strings that <em>look</em> like other types (<code>"yes"</code>, <code>"1.0"</code>, a version number) may need quoting in YAML to stay strings; give the output a scan if that matters.</li>
      <li>YAML can't be validated by eye as easily as you'd hope — the indentation is load-bearing, so keep it intact when you paste it onward.</li>
    </ul>
    <p>For the reverse use YAML to JSON. All local — nothing is uploaded.</p>`),

  "qr-code-generator": g(`
    <h2>Making a QR code</h2>
    <p>QR codes turn a URL (or any text) into something a phone camera can open in a tap — useful on posters, business cards, packaging, event signage, menus, or a Wi-Fi hand-off. Type or paste what you want encoded and get a scannable code you can download and drop into a design.</p>
    <h3>Tips for codes that actually scan</h3>
    <ul>
      <li><b>Keep the content short</b> — a long URL makes a denser, harder-to-scan code. Use a short link if you can.</li>
      <li><b>Print it big enough</b> and keep a quiet margin of empty space around it; tiny or crowded codes fail to scan.</li>
      <li><b>Test before you print a thousand copies</b> — scan the actual output with a couple of phones.</li>
    </ul>
    <p>Because a static QR code just encodes your text directly, it never expires and needs no service behind it.</p>`),

  "lorem-ipsum-generator": g(`
    <h2>Placeholder text, on demand</h2>
    <p>Lorem ipsum is scrambled Latin-looking filler that's been the standard placeholder for layout work since the 1500s. Designers use it because nonsense text lets you judge a layout's <em>shape</em> — spacing, line length, hierarchy — without getting distracted by reading real content that isn't ready yet.</p>
    <h3>Using it well</h3>
    <ul>
      <li>Generate the rough amount you need — a few words for a label, sentences for a caption, paragraphs for body copy.</li>
      <li>Placeholder text should be obviously fake so nobody mistakes it for final copy — that's a feature, not a bug. (More than one site has shipped "lorem ipsum" to production.)</li>
      <li>For repeating one specific phrase instead of varied filler, use the Text Repeater.</li>
    </ul>
    <p>It generates in your browser instantly, with no request to a server.</p>`),

  "alternating-case-converter": g(`
    <h2>tHe aLtErNaTiNg cAsE eFfEcT</h2>
    <p>This flips the case of every other letter, producing the "mocking SpongeBob" look that's become internet shorthand for sarcasm — quoting someone in alternating caps to signal you find the statement ridiculous. Type or paste and get the effect instantly, ready to drop into a chat or post.</p>
    <h3>Where it renders</h3>
    <p>Unlike the Unicode "font" generators here, alternating case uses ordinary letters (it just changes which are capital), so it works absolutely everywhere — every app, every platform, no risk of it showing as boxes. That universality is exactly why the meme spread. For other playful text effects that <em>do</em> use special Unicode characters — bold, strikethrough, upside-down — see the related generators. Everything runs locally; nothing you type is uploaded.</p>`),

  "inverse-case-converter": g(`
    <h2>Swapping every letter's case</h2>
    <p>Inverse case flips the case of every character: uppercase becomes lowercase and vice versa, so "Hello World" becomes "hELLO wORLD." It's the classic fix for text typed with Caps Lock accidentally on — where your capitalisation came out exactly backwards — and it's occasionally used as a quirky text effect.</p>
    <h3>Inverse vs. alternating</h3>
    <p>Don't confuse this with alternating case. Inverse case flips <em>every</em> letter based on its current case (a one-to-one swap), which perfectly undoes an accidental Caps Lock. Alternating case ignores the original and capitalises every <em>other</em> letter for the sarcastic-meme look. Pick inverse when you want to reverse a caps mistake; pick alternating for the effect. It uses ordinary letters, so it renders everywhere. All local — no upload.</p>`),

  "extract-emails-from-text": g(`
    <h2>Pulling every email address out of a block of text</h2>
    <p>Paste a wall of text — a document, a page's copied contents, a chat log, a dump of records — and get back just the email addresses, one per line. It saves scrolling and copying by hand when you need to collect the addresses buried in unstructured text.</p>
    <h3>Good to know</h3>
    <ul>
      <li>It finds anything matching the shape of an email, so give the results a quick scan — the odd false positive (a Twitter-style <code>@handle</code> next to a domain-like word) can slip in.</li>
      <li>Pair it with the remove-duplicate-lines and sort tools to turn the raw extraction into a clean, unique, ordered list.</li>
    </ul>
    <p>A privacy note that matters here: because everything runs in your browser and nothing is uploaded, you can extract contact details from private material without sending it to a third party. Only use collected addresses in line with anti-spam rules and consent.</p>`),

  "extract-urls-from-text": g(`
    <h2>Collecting every link from a block of text</h2>
    <p>When you need the links out of an article, an email, a Markdown file, or a page's copied source, this pulls every URL into a clean list, one per line — no clicking through and copying each one.</p>
    <h3>Handy follow-ups</h3>
    <ul>
      <li>De-duplicate the result (links often repeat) and sort it to make an audit or a link list easy to scan.</li>
      <li>Use it to inventory outbound links before a site migration, or to grab all the references from a document at once.</li>
    </ul>
    <p>It matches <code>http</code>/<code>https</code> URLs by their shape, so bare domains without a scheme may be missed and an occasional false positive can appear — a quick scan sorts it out. Everything runs in your browser, so you can pull links from private content without uploading it.</p>`),

  "extract-numbers-from-text": g(`
    <h2>Extracting just the numbers</h2>
    <p>Sometimes the useful part of a messy block of text is the numbers in it — prices in an email, figures in a report, quantities in a list, IDs in a log. This pulls them out into a clean list you can total, sort, or paste into a spreadsheet, instead of hunting through the prose.</p>
    <h3>Points to check</h3>
    <ul>
      <li>Decide how you want decimals and thousands separators handled — a value like <code>1,234.56</code> can be read as one number or several depending on the rules, so eyeball the output.</li>
      <li>Numbers embedded in words or IDs (like <code>abc123</code>) may or may not be what you want — scan the result.</li>
    </ul>
    <p>Follow up with the sort tools to order them numerically-ish, or paste into a spreadsheet to sum. All processing is local; nothing is uploaded.</p>`),

  "base64-encode": g(`
    <h2>Encoding text to Base64</h2>
    <p>Base64 turns arbitrary data into a safe set of ASCII characters (A–Z, a–z, 0–9, + and /), so it can travel through systems built for text. You'll see it embedding small images in CSS/HTML as data URIs, carrying binary-ish payloads inside JSON, in email attachments (MIME), and in some tokens.</p>
    <h3>The one thing to remember</h3>
    <p>Base64 is <b>encoding, not encryption</b>. It's trivially reversible by anyone — including this tool's own decode page — so it provides zero confidentiality. Never use it to "hide" a password or sensitive value; it only makes data transport-safe, not secret. Note also that Base64 makes data about a third larger, so it's for small payloads, not bulk storage. Unicode input is UTF-8 encoded first, so accents and emoji round-trip correctly. For the reverse, use Base64 Decode. Everything runs locally.</p>`),

  "base64-decode": g(`
    <h2>Decoding Base64 back to text</h2>
    <p>Paste a Base64 string and get the original text back. This is what you reach for when a config value, a token payload, an API field, or a data URI is Base64-encoded and you need to read what's actually inside it.</p>
    <h3>If decoding fails or looks wrong</h3>
    <ul>
      <li><b>It's not text:</b> Base64 often encodes binary (an image, a compressed blob), which won't render as readable characters — that's expected, not an error.</li>
      <li><b>URL-safe variant:</b> some systems use <code>-</code> and <code>_</code> in place of <code>+</code> and <code>/</code>; if a string won't decode, that's a common reason.</li>
      <li><b>Padding:</b> a truncated string missing its trailing <code>=</code> padding may fail.</li>
    </ul>
    <p>Remember Base64 isn't encryption — decoding needs no key, so anything "protected" only by Base64 isn't protected. All local; nothing uploaded.</p>`),

  "url-encode": g(`
    <h2>Making text safe for a URL</h2>
    <p>URLs can only contain a limited set of characters, so anything else — spaces, <code>&amp;</code>, <code>?</code>, <code>/</code>, <code>#</code>, accented letters, emoji — has to be percent-encoded (a space becomes <code>%20</code>) to travel safely in a query string or path. This does that encoding.</p>
    <h3>When you need it</h3>
    <ul>
      <li>Building a query string by hand, where a value contains a space, an ampersand, or a slash that would otherwise break the URL's structure.</li>
      <li>Passing a full URL as a <em>parameter</em> of another URL (a redirect target, a share link) — the inner URL's <code>?</code> and <code>&amp;</code> must be encoded so they're not read as part of the outer one.</li>
    </ul>
    <p>Encode the <em>values</em>, not the whole finished URL, or you'll double-encode the structural characters. For the reverse use URL Decode. Everything runs in your browser.</p>`),

  "url-decode": g(`
    <h2>Reading a percent-encoded URL</h2>
    <p>A URL full of <code>%20</code>, <code>%3D</code> and <code>%26</code> is hard to read. This decodes it back to plain text so you can see the real values — handy for debugging a link, reading a redirect target, or understanding what a query string actually contains.</p>
    <h3>Common sequences you'll see</h3>
    <ul>
      <li><code>%20</code> is a space, <code>%3D</code> is <code>=</code>, <code>%26</code> is <code>&amp;</code>, <code>%2F</code> is <code>/</code>, <code>%3F</code> is <code>?</code>.</li>
      <li>A <code>+</code> in a query string often means a space too (from form encoding) — worth knowing if a decode looks slightly off.</li>
    </ul>
    <p>Decoding a URL that was double-encoded may need two passes. For the reverse direction use URL Encode. It's all local, so you can decode links containing private tokens without uploading them.</p>`),

  "html-entity-encode": g(`
    <h2>Escaping text for safe HTML</h2>
    <p>Characters like <code>&lt;</code>, <code>&gt;</code> and <code>&amp;</code> have special meaning in HTML, so to show them as literal text you must replace them with entities (<code>&amp;lt;</code>, <code>&amp;gt;</code>, <code>&amp;amp;</code>). This encodes your text so it displays exactly as written instead of being interpreted as markup.</p>
    <h3>Two big reasons to encode</h3>
    <ul>
      <li><b>Showing code in a page:</b> to display an HTML example without the browser rendering it, the angle brackets have to be entities — otherwise your <code>&lt;div&gt;</code> vanishes into an actual div.</li>
      <li><b>Safety:</b> escaping user-supplied text before putting it in a page is a core defence against cross-site scripting (XSS). If you're inserting untrusted input into HTML, encoding it is not optional.</li>
    </ul>
    <p>For the reverse, use HTML Decode. All processing is local; nothing is uploaded.</p>`),

  "html-entity-decode": g(`
    <h2>Turning HTML entities back into characters</h2>
    <p>Paste text littered with <code>&amp;amp;</code>, <code>&amp;lt;</code>, <code>&amp;quot;</code> or numeric entities like <code>&amp;#39;</code> and get the real characters back. Useful when you've scraped or copied content out of HTML and it's full of escaped sequences instead of the punctuation it represents.</p>
    <h3>What it handles</h3>
    <ul>
      <li><b>Named entities</b> (<code>&amp;amp;</code> → &amp;, <code>&amp;nbsp;</code> → a space, <code>&amp;copy;</code> → ©).</li>
      <li><b>Numeric entities</b>, both decimal (<code>&amp;#169;</code>) and hex (<code>&amp;#xA9;</code>).</li>
    </ul>
    <p>A frequent culprit is double-encoding, where <code>&amp;amp;lt;</code> needs decoding twice to get back to <code>&lt;</code> — run it through again if one pass isn't enough. For the reverse, use HTML Encode. Everything runs in your browser.</p>`),

  "text-to-binary": g(`
    <h2>Converting text to binary</h2>
    <p>This shows the ones and zeros behind your text: each character is turned into its binary code (using its character-code value), so "Hi" becomes the two 8-bit groups that represent H and i. It's mostly a learning and curiosity tool — seeing how text is really stored — plus the odd puzzle or novelty use.</p>
    <h3>What's actually happening</h3>
    <p>Each character maps to a number (its Unicode code point); that number is written in base 2. Plain ASCII characters fit in 8 bits each; characters beyond ASCII (accents, emoji) use more, so their binary is longer. The result is space-separated groups so it's readable and reversible. To go back, use Binary to Text. If you want the more compact base-16 view instead, Text to Hex is the tool. All local — nothing is uploaded.</p>`),

  "binary-to-text": g(`
    <h2>Decoding binary back to text</h2>
    <p>Paste groups of ones and zeros and get the text they represent. Each binary group is read as a number and mapped back to its character — the reverse of turning text into binary. Handy for puzzles, coursework, or decoding a binary string someone sent you.</p>
    <h3>For a clean decode</h3>
    <ul>
      <li><b>Separate the groups</b> (usually with spaces) so the tool knows where one character ends and the next begins — a single unbroken run of bits is ambiguous unless it's neatly in 8-bit bytes.</li>
      <li><b>Standard bytes are 8 bits;</b> if the source used a different grouping, decoding may come out garbled.</li>
    </ul>
    <p>For the reverse direction use Text to Binary; for base-16 instead of base-2, see Hex to Text. Everything runs in your browser.</p>`),

  "text-to-hex": g(`
    <h2>Converting text to hexadecimal</h2>
    <p>Hex (base 16) is the compact, readable way developers view the byte values behind text — two hex digits per byte instead of eight binary ones. This converts each character of your text to its hex code, which is exactly what you see in a hex editor, in colour codes, and in a lot of debugging output.</p>
    <h3>Where hex shows up</h3>
    <ul>
      <li>Inspecting the actual bytes of a string when debugging an encoding problem.</li>
      <li>Reading or writing values that are conventionally hex — colour codes, byte offsets, some IDs.</li>
    </ul>
    <p>Non-ASCII characters (accents, emoji) are multiple bytes, so they produce more hex digits — a good illustration of how UTF-8 encodes them. For the reverse use Hex to Text; for base-2 instead, Text to Binary. All processing is local.</p>`),

  "hex-to-text": g(`
    <h2>Decoding hex back to readable text</h2>
    <p>Paste hexadecimal and get the text it represents. Each pair of hex digits is read as a byte and turned back into its character — the reverse of Text to Hex. It's the everyday move when a log, a debugger, or a data dump shows you hex and you need to know what it actually says.</p>
    <h3>If the result looks off</h3>
    <ul>
      <li><b>Grouping:</b> hex usually comes in pairs (one byte each). Stray spacing or an odd number of digits can throw the decode off.</li>
      <li><b>Multi-byte characters:</b> UTF-8 accents and emoji span several bytes, so a partial sequence decodes to gibberish — you need the whole run.</li>
      <li><b>0x prefixes</b> and separators may need stripping first.</li>
    </ul>
    <p>For the reverse use Text to Hex; for binary, Binary to Text. Everything runs in your browser.</p>`),

  "morse-code-translator": g(`
    <h2>Translating text into Morse code</h2>
    <p>Morse encodes each letter and digit as a pattern of dots and dashes. This converts your text to Morse instantly — for learning the code, a puzzle or escape-room clue, a themed message, or generating a pattern to key out with light or sound.</p>
    <h3>How it's written</h3>
    <ul>
      <li>Letters are separated by a space and words by a slash (<code>/</code>), the common written convention, so the boundaries stay clear.</li>
      <li>Morse covers A–Z, 0–9 and common punctuation; anything outside that set has no standard code and is skipped or left as-is.</li>
      <li>It's case-insensitive — Morse has no capitals.</li>
    </ul>
    <p>To go the other way, use Morse to Text. Everything runs in your browser, so it works offline once loaded — handy for a classroom.</p>`),

  "morse-code-to-text": g(`
    <h2>Decoding Morse code to text</h2>
    <p>Paste dots and dashes and get plain text back. This decodes standard Morse — useful for solving a puzzle, checking your own keying, or reading a message someone sent in code.</p>
    <h3>Formatting the input</h3>
    <ul>
      <li>Use <b>dots</b> (<code>.</code>) and <b>dashes</b> (<code>-</code>), with a <b>space between letters</b> and a <b>slash or double space between words</b> — the decoder relies on those separators to know where each character ends.</li>
      <li>Without the gaps, a run of dots and dashes is ambiguous (the same sequence can split several ways), so spacing is what makes the decode unambiguous.</li>
    </ul>
    <p>To encode text into Morse, use the Text → Morse tool. It all runs locally, so it works offline and nothing is uploaded.</p>`),

  "rot13-cipher": g(`
    <h2>ROT13: the reversible letter shift</h2>
    <p>ROT13 replaces each letter with the one 13 places along the alphabet (A↔N, B↔O, and so on). Because the alphabet has 26 letters, applying it twice returns the original — encoding and decoding are the same operation, which is its whole charm.</p>
    <h3>What it's for (and not for)</h3>
    <p>ROT13 is the classic way to hide a spoiler, a punchline, or a puzzle answer in plain sight — scrambled enough that you won't read it by accident, trivial to reveal on purpose. It is emphatically <b>not</b> security: there's no key and it's instantly reversible, so never use it to protect anything sensitive. Numbers and punctuation pass through unchanged. It's a close cousin of the Caesar cipher (which shifts by any amount); ROT13 just fixes the shift at 13 so the operation is its own inverse. All local — nothing uploaded.</p>`),

  "json-formatter": g(`
    <h2>Making minified JSON readable</h2>
    <p>API responses and config often arrive as one long unbroken line of JSON that's impossible to read. This pretty-prints it — proper indentation, one key per line, nested structure laid out visually — so you can actually see what's in it and where.</p>
    <h3>It also catches mistakes</h3>
    <p>Formatting only succeeds on valid JSON, so if the tool can't format your input, that's a signal it has a syntax error — a missing comma, a trailing comma (invalid in strict JSON), an unquoted key, or a mismatched bracket. In that sense it doubles as a quick validity check. Watch for the usual JSON gotchas: keys and strings need double quotes (not single), and there's no comment syntax. To go the other way and strip the whitespace out for transport, use the JSON Minifier; to check validity with an explicit error, the JSON Validator. Everything runs locally.</p>`),

  "json-validator": g(`
    <h2>Checking whether JSON is valid</h2>
    <p>Before you paste JSON into code or send it to an API, it's worth confirming it actually parses. This checks your input against the JSON spec and tells you whether it's valid — saving you from a runtime error later that just says "unexpected token."</p>
    <h3>The usual culprits</h3>
    <ul>
      <li><b>Trailing commas</b> after the last item — allowed in JavaScript, invalid in strict JSON.</li>
      <li><b>Single quotes</b> — JSON requires double quotes for strings and keys.</li>
      <li><b>Unquoted keys</b>, or <b>comments</b> (JSON has none).</li>
      <li><b>Mismatched or missing brackets/braces.</b></li>
    </ul>
    <p>If your data legitimately uses comments or trailing commas, it's really JSON5 or a config dialect, not strict JSON — worth knowing before you feed it to a strict parser. To reformat valid JSON nicely, use the JSON Formatter. All local; nothing is uploaded.</p>`),

  "json-minifier": g(`
    <h2>Shrinking JSON for transport</h2>
    <p>Minifying removes every non-essential space, newline and indent from JSON, collapsing it to the smallest valid representation. The data is identical — only the whitespace is gone — but the payload is smaller, which means faster transfers and less bandwidth when JSON goes over the wire or gets embedded somewhere size matters.</p>
    <h3>When to reach for it</h3>
    <ul>
      <li>Trimming an API request or response body, or a config you're embedding in a URL or a data attribute.</li>
      <li>Anywhere a few saved bytes per request add up at scale.</li>
    </ul>
    <p>Minified JSON is unreadable to humans — that's the point — so keep a formatted copy for editing and minify only the version you ship. To reverse it and make a minified blob readable again, use the JSON Formatter. Everything runs in your browser.</p>`),

  "markdown-to-html-converter": g(`
    <h2>Turning Markdown into HTML</h2>
    <p>Markdown is the easy way to write formatted text — <code>#</code> for headings, <code>**bold**</code>, <code>-</code> for lists — and this converts it to the HTML you need to paste into a web page, a CMS that wants raw HTML, or an email template. Write in Markdown, get clean HTML out.</p>
    <h3>Good to know</h3>
    <ul>
      <li>It handles the common Markdown — headings, bold/italic, links, lists, code blocks, blockquotes — which covers the vast majority of real writing.</li>
      <li>Markdown flavours differ slightly (tables, task lists, footnotes are extensions), so an exotic feature from one editor may not convert identically.</li>
    </ul>
    <p>If you want the <em>plain text</em> with formatting stripped rather than HTML, use Markdown to Plain Text instead. It all runs in your browser, so drafts stay private and it works offline.</p>`),

  "markdown-to-plain-text": g(`
    <h2>Stripping Markdown back to plain text</h2>
    <p>Sometimes you have Markdown but need clean, unformatted text — for an email that shouldn't show <code>**asterisks**</code> and <code>#</code> symbols, a plain-text field, a word count of the actual prose, or pasting somewhere that doesn't understand Markdown. This removes the syntax and leaves just the readable words.</p>
    <h3>What it removes and keeps</h3>
    <ul>
      <li>Strips heading <code>#</code>, emphasis <code>*</code>/<code>_</code>, list markers, code fences and link syntax.</li>
      <li>Keeps the actual content — for a link, that means the visible text, not the URL clutter.</li>
    </ul>
    <p>This is also the honest way to get a word count of Markdown: strip the syntax first, then count, so the markup characters don't inflate the total. For the opposite direction — Markdown to formatted HTML — use the Markdown to HTML tool. All local; nothing uploaded.</p>`),

  "markdown-table-generator": g(`
    <h2>From spreadsheet cells to a Markdown table</h2>
    <p>Markdown's table syntax — pipes for columns, a dashed row underneath the header — is simple once written, but tedious to type by hand for anything wider than three columns, and easy to get subtly wrong (a missing pipe, a separator row with the wrong column count). This builds it for you from data you already have: select a range in a spreadsheet, copy it, paste it here.</p>
    <h3>Comma or tab, either works</h3>
    <p>Pasting straight out of Excel, Google Sheets, or Numbers copies the cells as tab-separated values, which this detects automatically from the first line. Comma-separated (CSV) input works the same way. Either way you get a table with the header row, the required <code>---</code> separator, and every data row, escaped so a stray pipe character in a cell doesn't break the column boundaries.</p>
    <h3>Where this is useful</h3>
    <ul>
      <li>Documenting a config's options, a CLI's flags, or an API's parameters in a README.</li>
      <li>Turning a spreadsheet of test cases or comparison data into a table for a GitHub issue or pull request.</li>
      <li>Any place a Markdown renderer (GitHub, GitLab, most static-site generators, most wikis) is the target.</li>
    </ul>
    <p>Everything runs in your browser — nothing you paste is uploaded.</p>`),

  "markdown-to-confluence-converter": g(`
    <h2>Why Markdown and Confluence don't paste cleanly into each other</h2>
    <p>Confluence predates the Markdown-everywhere convention and has its own wiki markup: <code>h1.</code> for headings instead of <code>#</code>, a single asterisk for bold instead of two, <code>bq.</code> for a blockquote, <code>{code}</code> macros instead of triple-backtick fences. Paste raw Markdown into Confluence's source editor and none of that gets interpreted — you get literal asterisks and pound signs on the page.</p>
    <h3>What gets converted</h3>
    <ul>
      <li>Headings (<code>#</code> through <code>######</code>) become <code>h1.</code> through <code>h6.</code></li>
      <li>Bold and italic are remapped to Confluence's single-asterisk/underscore convention.</li>
      <li>Links, images, ordered and unordered lists, blockquotes, and fenced code blocks (with the language hint preserved) all get their Confluence equivalents.</li>
    </ul>
    <h3>Where to paste the result</h3>
    <p>This targets Confluence's classic wiki markup — the format used by the source/markup editor and the REST API's <code>wiki</code> body representation, not the newer default rich-text editor, which doesn't accept a markup paste mode. If your team writes specs or runbooks in Markdown first and only later moves them into Confluence, this is the step that closes that gap. Runs entirely in your browser.</p>`),

  "markdown-to-slack-converter": g(`
    <h2>Why a Markdown message looks broken when you paste it into Slack</h2>
    <p>Slack has its own lightweight formatting language (mrkdwn), and it overlaps with Markdown just enough to be misleading. Bold in Slack is a single asterisk, not two — so <code>**bold**</code> pasted straight in shows up as literal asterisks around plain text, not bold. Slack also has no heading syntax at all, so a <code>#</code> line renders as a literal pound sign followed by your text.</p>
    <h3>What this rewrites</h3>
    <ul>
      <li>Double-asterisk/underscore bold becomes single-asterisk bold; single-asterisk/underscore italic becomes underscore italic (Slack's own convention, the reverse of Markdown's default).</li>
      <li>A heading becomes bold text, the closest Slack equivalent.</li>
      <li>A <code>[text](url)</code> link becomes Slack's own clickable <code>&lt;url|text&gt;</code> format.</li>
      <li>List markers become a plain "•" bullet, since Slack doesn't render a leading <code>-</code> as a bullet the way Markdown does.</li>
    </ul>
    <p>Handy for pasting release notes, a changelog entry, or a doc excerpt into a Slack channel and having it actually look formatted instead of showing raw syntax. Runs entirely in your browser — nothing is sent anywhere.</p>`),

  "html-to-markdown-converter": g(`
    <h2>Turning HTML back into editable Markdown</h2>
    <p>The reverse direction from the Markdown to HTML tool: paste HTML — copied from a web page, exported from a CMS or word processor, or output by some other tool — and get back Markdown you can actually edit as plain text, rather than a wall of tags.</p>
    <h3>What it handles</h3>
    <ul>
      <li>Headings, paragraphs, bold/italic, inline and fenced code, links, images, ordered and unordered lists, blockquotes, and horizontal rules.</li>
      <li>Any tag outside that set — <code>div</code>, <code>span</code>, inline styling, tracked-changes markup — is stripped rather than left dangling in the output, so the result stays clean Markdown rather than half-converted HTML.</li>
    </ul>
    <h3>A one-way trip for styling</h3>
    <p>Markdown has no way to express arbitrary CSS — a specific font, a color, a custom size — so anything beyond structural formatting is necessarily lost in the conversion. That's expected: the point is recovering the content's structure as clean, editable Markdown, not a pixel-identical round trip. Nested lists convert but lose their indentation level, so this is best suited to typical article- or README-level HTML rather than deeply structured documents. Runs entirely in your browser; nothing you paste is uploaded.</p>`),

  "remove-invisible-characters": g(`
    <h2>The characters you can't see, but a parser can</h2>
    <p>Every character has a code point, even the ones with no visible glyph. A zero-width space (U+200B) takes up zero pixels but is still a real character sitting between two letters. Copy text from a web page, a PDF export, or a chat app's output and there's a decent chance a few of these hitchhike along without you ever noticing — until something downstream chokes on them.</p>
    <h3>What actually gets stripped</h3>
    <ul>
      <li>Zero-width space, zero-width non-joiner, zero-width joiner — commonly inserted by web typesetting or word-wrap logic.</li>
      <li>Byte-order mark (BOM) — a leftover from how some editors save UTF-8 files, sometimes ending up mid-document instead of only at the very start.</li>
      <li>Soft hyphen, left-to-right mark, right-to-left mark, word joiner — formatting/direction hints that carry no visible content of their own.</li>
    </ul>
    <h3>Why this bites specifically with AI tools</h3>
    <p>Paste a block of JSON that looks perfectly valid and a strict parser rejects it — nine times out of ten, an invisible character snuck in somewhere. The same goes for prompts: a zero-width character landing inside a word can change how a model tokenizes it, and two strings that look byte-for-byte identical on screen can fail a direct equality check if one has an invisible character the other doesn't. Running text through this first rules that whole category of bug out. Everything happens locally — nothing you paste is uploaded.</p>`),

  "smart-quotes-to-straight-quotes-converter": g(`
    <h2>Why your word processor is quietly rewriting your quotes</h2>
    <p>Word, Google Docs, Pages, and iOS/Android auto-correct all convert a plain straight quote (<code>"</code>) into a curly “smart” quote as you type — a small typographic nicety for reading prose, and a real problem the moment that text needs to be something other than prose.</p>
    <h3>Where curly quotes cause actual breakage</h3>
    <ul>
      <li><b>Code and config files:</b> a string literal delimited by a curly quote isn't valid syntax in virtually any programming language — you get a syntax error that's easy to stare at without seeing, since the character looks so close to the real thing.</li>
      <li><b>JSON:</b> the spec requires a literal straight double quote; a curly one fails to parse.</li>
      <li><b>Terminal commands:</b> a curly quote copied into a shell command isn't treated as a quote character at all, so the command breaks in a way that's often confusing to debug.</li>
      <li><b>AI prompts:</b> pasting auto-corrected prose into a prompt that expects a literal quoted string (a fenced code block, a JSON example) carries the same risk.</li>
    </ul>
    <p>This swaps every curly quote and apostrophe variant back to the plain straight character, leaving the rest of the text untouched. Runs entirely in your browser.</p>`),

  "wrap-text-in-xml-tags": g(`
    <h2>Why XML tags, of all things, help an AI prompt</h2>
    <p>It looks like an odd throwback in a plain-text prompt, but wrapping a section in a named tag — <code>&lt;context&gt;…&lt;/context&gt;</code> — gives a model an unambiguous boundary to key off, in a way a blank line or a "here's the document:" sentence doesn't as reliably. Anthropic's own prompting documentation specifically recommends this pattern for delimiting a document, a set of instructions, or examples inside a Claude prompt.</p>
    <h3>When this earns its keep</h3>
    <ul>
      <li>Pasting a document or article you want a model to reference, separate from your actual instructions.</li>
      <li>Giving a few examples of desired output, tagged distinctly from the task description.</li>
      <li>Any prompt assembled from multiple pasted chunks, where "which part is which" needs to survive being read by a model rather than a human skimming for paragraph breaks.</li>
    </ul>
    <h3>Naming and nesting</h3>
    <p>The default tag is <code>context</code>, but any name works — <code>document</code>, <code>instructions</code>, <code>example-1</code> — and an invalid character in the name you type is automatically cleaned up rather than rejected. To nest tags, run the tool once, then paste that output back in as the input for a second, outer tag name. Runs entirely in your browser; nothing you paste is uploaded.</p>`),

  "md5-hash-generator": g(`
    <h2>Generating an MD5 hash</h2>
    <p>MD5 turns any input into a fixed 32-character hex fingerprint. The same input always produces the same hash, so it's a fast way to make a checksum — verifying a file downloaded intact, generating a cache key, or spotting whether two blobs of data are identical.</p>
    <h3>Important: MD5 is not for security</h3>
    <p>MD5 is <b>cryptographically broken</b> — it's feasible to craft two different inputs with the same hash (a collision), so it must never be used for password storage, digital signatures, or anything an attacker could exploit. For those, use SHA-256 (or a purpose-built password hash like bcrypt). MD5 is still perfectly fine for its non-adversarial uses: checksums, deduplication, cache keys, where you're guarding against accidental corruption, not a malicious actor. The hashing runs entirely in your browser, so whatever you hash is never uploaded.</p>`),

  "sha256-hash-generator": g(`
    <h2>Generating a SHA-256 hash</h2>
    <p>SHA-256 produces a 64-character hex fingerprint and is part of the SHA-2 family — the current, trustworthy standard where MD5 has fallen. Same input, same hash, every time; change a single character and the output is completely different. This computes it in your browser.</p>
    <h3>What it's good for</h3>
    <ul>
      <li><b>Verifying integrity:</b> compare a file's SHA-256 against a published checksum to confirm it wasn't corrupted or tampered with.</li>
      <li><b>Fingerprinting data</b> where you need collision resistance a broken hash like MD5 can't offer.</li>
    </ul>
    <p>One caveat: for <em>password</em> storage, a plain fast hash like SHA-256 isn't enough on its own — passwords need a deliberately slow, salted hash (bcrypt, scrypt, Argon2) to resist brute-forcing. SHA-256 is the right tool for checksums and integrity, not raw password hashing. Everything runs locally — nothing is uploaded.</p>`),

  "uuid-generator": g(`
    <h2>Generating unique identifiers</h2>
    <p>A UUID (universally unique identifier) is a 128-bit value, written as 36 characters like <code>f47ac10b-58cc-4372-a567-0e02b2c3d479</code>, designed so you can generate one anywhere — on any machine, offline — and trust it won't collide with anyone else's. That's why they're everywhere as database keys, request IDs, and file names.</p>
    <h3>Why they don't collide</h3>
    <p>Version 4 UUIDs (the common kind) are almost entirely random — 122 random bits. The space is so vast that the practical chance of ever generating the same one twice is negligible, which is what lets distributed systems mint IDs independently without coordinating. Use them when you need a unique key without a central counter: primary keys, idempotency keys, correlation IDs across services. Need many at once? Generate a batch. It all runs in your browser using its secure random source; nothing is uploaded.</p>`),

  "random-password-generator": g(`
    <h2>Generating a strong password</h2>
    <p>The strength of a password comes from being long and unpredictable — not from clever letter-for-symbol swaps a cracker already expects. This builds a genuinely random password from the character sets you choose (uppercase, lowercase, numbers, symbols) at the length you set.</p>
    <h3>Making it strong and usable</h3>
    <ul>
      <li><b>Length beats complexity:</b> a longer password is exponentially harder to crack, so favour more characters over a shorter "tricky" one — aim for 16+ where allowed.</li>
      <li><b>Use a password manager</b> to store it, so length and uniqueness cost you nothing to remember.</li>
      <li><b>Unique per site:</b> the biggest real-world risk is reuse — one breach shouldn't unlock everything.</li>
    </ul>
    <p>Crucially, generation happens entirely in your browser using its secure random source — the password is never sent anywhere, so it's safe to use the one you generate here.</p>`),

  "strikethrough-text-generator": g(`
    <h2>Making t̶e̶x̶t̶ with a line through it</h2>
    <p>This produces strikethrough text that works in places with no formatting toolbar — Instagram bios, Twitter/X posts, some chat apps — where you can't normally cross words out. It does it by combining each character with a Unicode "combining" mark, so the struck-through text is just characters you can copy and paste anywhere.</p>
    <h3>How it works, and where it won't</h3>
    <p>Because it relies on special Unicode characters rather than real formatting, rendering depends on the app and font. Most modern platforms show it correctly; a few may display the line slightly off or, rarely, as a missing-glyph box. It's also worth knowing that screen readers and search may not interpret combined characters as normal letters, so use it for playful emphasis, not important content. For genuine strikethrough in a document, your editor's built-in formatting is better. All local — nothing uploaded.</p>`),

  "upside-down-text-generator": g(`
    <h2>Flipping text ˙uʍop ǝpısdn</h2>
    <p>This turns your text upside down by swapping each letter for a Unicode character that looks like its rotated twin, then reversing the order — so it reads as if flipped 180°. A fun effect for a bio, a username, a message, or just to catch someone's eye in a feed.</p>
    <h3>What to expect</h3>
    <ul>
      <li>It's not real rotation — it's a set of look-alike characters (many from other alphabets and phonetic symbols), so the match is close but not perfect for every letter.</li>
      <li>Rendering depends on the app and font; most places show it fine, but the odd character may not have a good upside-down twin and could look off.</li>
      <li>Since it's unusual Unicode, treat it as decorative — screen readers and search won't read it as normal words.</li>
    </ul>
    <p>Everything runs in your browser; nothing you type is uploaded.</p>`),

  "bold-text-generator": g(`
    <h2>𝗕𝗼𝗹𝗱 text for places without a bold button</h2>
    <p>Social bios, posts, and many chat apps don't offer real bold formatting — but you can fake it with Unicode. This converts your text into the mathematical bold characters (𝗕 𝗼 𝗹 𝗱), which are distinct Unicode code points that display as bold-looking letters you can paste anywhere plain text goes.</p>
    <h3>The trade-offs worth knowing</h3>
    <ul>
      <li><b>It renders widely</b> — these characters are well-supported — but on an unusual font or old device the odd glyph may fall back to a box.</li>
      <li><b>Accessibility:</b> screen readers may read these as separate math symbols or skip them, and search engines don't treat them as normal letters — so use bold Unicode for eye-catching bios and headers, not for body content or anything that needs to be searchable.</li>
    </ul>
    <p>For real bold in a document or web page, use actual formatting or HTML. It all runs locally — nothing is uploaded.</p>`),
};
