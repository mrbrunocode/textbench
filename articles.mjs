/**
 * Editorial articles — the "proof" layer a tool site needs for AdSense /
 * E-E-A-T: standalone, long-form, genuinely useful pieces separate from the
 * tool pages. Each renders at /guides/<slug> with an author byline (see
 * engine/build.mjs) and is listed on /guides. Written to be genuinely helpful
 * and original, and to link naturally into the tools.
 *
 * Fields: slug, title, description, date (ISO), read (min), excerpt, bodyHtml.
 */
const T = "tools"; // COLLECTION_DIR, local so links read clearly below

export const ARTICLES = [
  {
    slug: "base64-explained",
    title: "Base64, explained: what it is, what it isn't, and when to use it",
    description:
      "A clear explanation of Base64 encoding: what problem it solves, why it makes data bigger, and the crucial reason it is not — and never should be used as — encryption.",
    date: "2026-07-23",
    read: 6,
    excerpt:
      "Base64 turns data into safe text — but people constantly mistake it for encryption. Here's what it actually is, and the one thing to never use it for.",
    bodyHtml: `
    <p>Base64 is one of those things that's everywhere once you notice it: in data URIs embedding an image straight into a stylesheet, in the middle of a JWT, in an email's raw source, in a config value that looks like line noise. It's genuinely useful and genuinely simple — but it's also one of the most misunderstood tools in a developer's kit, because people keep mistaking it for something it isn't. Let's fix that.</p>

    <h2>The problem Base64 solves</h2>
    <p>Computers store everything as bytes, and a byte can be any of 256 values. But a lot of systems were built to carry <em>text</em> — specifically, a limited set of printable ASCII characters — and they choke on, or silently mangle, arbitrary bytes. Email was designed for text. URLs have a restricted character set. JSON strings can't hold raw binary. So how do you send an image, or any binary data, through a channel that only reliably handles text?</p>
    <p>Base64 is the answer. It takes arbitrary bytes and re-expresses them using only 64 safe characters: <code>A–Z</code>, <code>a–z</code>, <code>0–9</code>, and <code>+</code> and <code>/</code> (with <code>=</code> as padding). Every 3 bytes of input become 4 of these safe characters. The result is pure, portable text that survives any text-only pipe — and can be decoded back into the exact original bytes on the other end.</p>

    <h2>Why it makes things bigger</h2>
    <p>That 3-bytes-to-4-characters ratio has a cost: Base64 output is about 33% larger than the input. It's spending size to buy safety. That's fine for small payloads — a little inline icon, a token, a short binary field — but it's the reason you don't Base64-encode large files for storage or transfer when you have a binary-safe channel available. Use it to make small data <em>portable</em>, not to store bulk data.</p>

    <h2>The big misconception: Base64 is not encryption</h2>
    <p>This is the one to burn into memory. <strong>Base64 is encoding, not encryption.</strong> There is no key and no secret involved. Anyone who sees a Base64 string can decode it back to the original in one step — including with the very same <a href="/${T}/base64-decode">decode tool</a> that reverses this site's <a href="/${T}/base64-encode">encoder</a>. It provides exactly zero confidentiality.</p>
    <p>Despite that, Base64 gets misused as if it hides something. "I'll Base64 the password in the config so it's not in plain text" offers no protection whatsoever — it's a trivial, keyless transformation an attacker undoes instantly. If data needs to be secret, it needs real encryption (with a key you protect). Base64 makes data <em>transport-safe</em>, never <em>secret</em>. The two are completely different jobs, and conflating them is how sensitive values end up effectively exposed.</p>

    <h2>Where you'll legitimately use it</h2>
    <ul>
      <li><strong>Data URIs:</strong> embedding a small image or font directly in HTML/CSS as <code>data:image/png;base64,…</code>, avoiding a separate request.</li>
      <li><strong>Email attachments:</strong> MIME encodes attachments in Base64 so binary files survive the text-based mail system.</li>
      <li><strong>Binary inside JSON/XML:</strong> when a text-only format needs to carry bytes (a small blob, a signature), Base64 is the standard wrapper.</li>
      <li><strong>Tokens:</strong> JWTs and many API tokens Base64-encode their parts — which, note, means anyone can read a JWT's contents; that's why the signature, not the encoding, is what makes it trustworthy.</li>
    </ul>

    <h2>A couple of practical notes</h2>
    <p>There's a <strong>URL-safe variant</strong> that swaps <code>+</code> and <code>/</code> for <code>-</code> and <code>_</code>, because <code>+</code> and <code>/</code> have meaning in URLs. If a Base64 string won't decode, a mismatch between the standard and URL-safe alphabets is a common cause. And when encoding text with accents or emoji, the text is UTF-8 encoded first, so it round-trips correctly through encode and decode.</p>
    <p>Base64 is a small, honest tool: it makes bytes safe to send as text, nothing more. Understand that it adds size and adds no secrecy, and you'll reach for it in exactly the right places — and never in the wrong one.</p>`,
  },
  {
    slug: "how-to-choose-a-strong-password",
    title: "How to choose (and manage) a strong password",
    description:
      "What actually makes a password strong in 2026 — why length beats complexity, why reuse is the real risk, and how a password manager makes both problems disappear.",
    date: "2026-07-23",
    read: 6,
    excerpt:
      "Most password advice is outdated. What really matters is length and never reusing them — and here's why, plus how to make it effortless.",
    bodyHtml: `
    <p>Most of the password advice people absorbed a decade ago is now actively counterproductive. The "at least one uppercase, one number, one symbol, change it every 90 days" ritual produces passwords that are hard for humans and easy for computers — the worst combination. Here's what actually makes a password strong, and how to make strong passwords cost you nothing to use.</p>

    <h2>Length beats complexity</h2>
    <p>A password's real strength is its <em>entropy</em> — how many guesses an attacker would need to try. And entropy grows far faster with length than with a wider character set. Adding one more character multiplies the search space; swapping an <code>a</code> for an <code>@</code> barely changes it, because cracking software knows every one of those "clever" substitutions and tries them first.</p>
    <p>This is why a longer password wins. A 16-character password drawn from a decent character set is astronomically harder to brute-force than an 8-character one, no matter how many symbols the 8-character one crams in. If a site lets you, favour length: aim for 16 characters or more. When you <a href="/${T}/random-password-generator">generate a password</a>, the length slider is the single most important control on it.</p>

    <h2>Random beats memorable-with-tricks</h2>
    <p>Human-chosen passwords are predictable in ways we don't notice. We pick words, names, dates, and keyboard patterns, and we apply the same handful of "tricks" (capital at the start, number at the end, <code>!</code> for good measure) that attackers model precisely. A genuinely <em>random</em> string has no such patterns to exploit. That's the advantage of a generated password: it's drawn from real randomness, so there's no structure for cracking tools to lean on.</p>
    <p>The obvious objection — "I can't remember a random 20-character string" — is real, and it's exactly what the next section solves.</p>

    <h2>The real risk isn't weak passwords — it's reused ones</h2>
    <p>Here's the thing most people underestimate: the biggest practical danger isn't that one password gets brute-forced. It's <strong>reuse</strong>. When a website is breached (and websites are breached constantly), the leaked email-and-password pairs get fed into automated tools that try them on hundreds of other sites — "credential stuffing". If you used the same password on your email, your bank, and the forum that just got hacked, one breach unlocks all three.</p>
    <p>So the rule that matters most: <strong>every account gets its own unique password.</strong> A breach of one site should compromise exactly one account and no others. This single habit protects you more than any amount of per-password complexity.</p>

    <h2>How to make all of this effortless: a password manager</h2>
    <p>"Long, random, and unique for every site" is impossible to do in your head — and you're not supposed to. A password manager makes it trivial: it generates long random passwords, stores them encrypted, and fills them in for you, so you only ever remember one strong master password (or unlock with your device's biometrics). With one in place, the cost of a 24-character unique password per site drops to zero.</p>
    <p>A few extra layers worth adding on top:</p>
    <ul>
      <li><strong>Turn on two-factor authentication (2FA)</strong> wherever it's offered, especially for email and banking. Even a leaked password can't get in without the second factor.</li>
      <li><strong>Protect your email account hardest</strong> — it's the master key, because password resets for everything else land there.</li>
      <li><strong>Stop routinely rotating passwords</strong> for no reason. Forced periodic changes push people toward weak, incrementing patterns (<code>Spring2026!</code> → <code>Summer2026!</code>). Change a password when there's a reason to — a breach, a suspicion — not on a calendar.</li>
    </ul>

    <h2>The short version</h2>
    <p>Make each password long and random, never reuse one, let a password manager carry the load, and add 2FA on the accounts that matter. Do that and you've closed off the ways passwords actually fail in the real world — which is a lot more than a mandatory exclamation mark ever did. When you need a strong one right now, generate it, store it in your manager, and move on.</p>`,
  },
  {
    slug: "regex-for-non-programmers",
    title: "Regular expressions for non-programmers: a gentle introduction",
    description:
      "Regex looks like line noise but the core ideas are simple. A friendly introduction to matching patterns in text, with practical examples you can use today.",
    date: "2026-07-23",
    read: 7,
    excerpt:
      "Regex looks terrifying and is genuinely useful. You don't need to be a programmer — here are the handful of ideas that unlock 90% of the value.",
    bodyHtml: `
    <p>A regular expression — "regex" — is a way of describing a <em>pattern</em> in text, so software can find, extract, or replace anything matching that pattern. It has a reputation for being impenetrable, and a dense regex genuinely is. But the core ideas are simple, and you don't need to be a programmer to get real value from them: they show up in the find-and-replace of many editors, in spreadsheets, in search boxes, and in text tools. Here's the gentle version.</p>

    <h2>The one idea: describe, don't spell out</h2>
    <p>Ordinary find-and-replace makes you type the exact text you want. Regex lets you describe it instead — "any three digits", "a word starting with a capital", "anything between two brackets". That shift from spelling out to describing is the whole point, and it's what lets one pattern match thousands of different specific strings.</p>

    <h2>The building blocks worth knowing</h2>
    <p>You can do a lot with just these:</p>
    <ul>
      <li><strong>Literal characters</strong> match themselves. <code>cat</code> matches "cat".</li>
      <li><code>.</code> (a dot) matches <strong>any single character</strong>. <code>c.t</code> matches "cat", "cot", "c9t".</li>
      <li><code>\\d</code> matches <strong>any digit</strong>, <code>\\w</code> any "word" character (letter, digit, underscore), <code>\\s</code> any whitespace.</li>
      <li><strong>Quantifiers</strong> say how many: <code>+</code> means "one or more", <code>*</code> means "zero or more", <code>?</code> means "optional". So <code>\\d+</code> matches a run of digits of any length.</li>
      <li><strong>Character sets</strong> in square brackets match any one of the listed characters: <code>[aeiou]</code> matches any vowel; <code>[A-Z]</code> any capital letter.</li>
      <li><strong>Anchors:</strong> <code>^</code> means "start of the line", <code>$</code> means "end of the line".</li>
    </ul>
    <p>Put a few together and patterns start to read: <code>^\\d+</code> means "a line that starts with one or more digits"; <code>[A-Z]\\w+</code> means "a capital letter followed by more word characters" (roughly, a capitalised word).</p>

    <h2>A worked example</h2>
    <p>Say you have a list and you want to pull out every price. Prices look like a dollar sign, some digits, a dot, and two more digits: <code>\\$\\d+\\.\\d\\d</code>. Reading it left to right: a literal <code>$</code> (escaped with a backslash because <code>$</code> normally means "end of line"), one or more digits, a literal dot (escaped, because a bare dot means "any character"), then two digits. That pattern finds "$4.99" and "$1250.00" wherever they appear. The escaping — putting a backslash before a character that normally has special meaning, to match it literally — is the part that trips up beginners most, so it's worth remembering that <code>.</code>, <code>$</code>, <code>+</code>, <code>*</code>, <code>?</code> and brackets are "special" and need escaping to match literally.</p>

    <h2>The classic trap: greedy matching</h2>
    <p>Quantifiers are "greedy" by default — they match as much as they possibly can. If you write <code>&lt;.*&gt;</code> hoping to match one HTML tag in <code>&lt;b&gt;hi&lt;/b&gt;</code>, the <code>.*</code> greedily gobbles everything from the first <code>&lt;</code> to the <em>last</em> <code>&gt;</code>, matching the whole string. Adding a <code>?</code> after the quantifier makes it "lazy" — match as little as possible — so <code>&lt;.*?&gt;</code> matches just <code>&lt;b&gt;</code>. "It matched way more than I wanted" almost always means a greedy quantifier.</p>

    <h2>Test as you build</h2>
    <p>Nobody writes a non-trivial regex correctly first try, and you shouldn't expect to. The reliable way to build one is incrementally, watching what it matches against real sample text — including the awkward edge cases — and adjusting. That's exactly what a live <a href="/${T}/regex-tester">regex tester</a> is for: paste representative text, type the pattern, and see the matches light up as you refine it. For two common jobs there are focused testers for <a href="/${T}/email-regex-tester">email</a> and <a href="/${T}/phone-number-regex-tester">phone-number</a> patterns.</p>

    <h2>When not to reach for regex</h2>
    <p>A fair warning: regex is a pattern-matcher, not a parser. It's brilliant for finding phone-number-shaped strings or reformatting a list, and a poor fit for anything with nested structure — HTML, deeply nested JSON, matched brackets. For those, a real parser is the right tool. But for the everyday "find all the X" and "reformat every Y" jobs, a handful of the building blocks above will take you a remarkably long way.</p>`,
  },
  {
    slug: "character-encoding-explained",
    title: "Character encoding explained: Unicode, UTF-8, and why text breaks",
    description:
      "Why does text sometimes turn into question marks or gibberish? A clear explanation of character encoding, Unicode and UTF-8 — and how to avoid the mess.",
    date: "2026-07-23",
    read: 7,
    excerpt:
      "Ever seen “café” turn into “cafÃ©”? That's a character-encoding mismatch. Here's what Unicode and UTF-8 actually are, and why text breaks.",
    bodyHtml: `
    <p>You've seen it: a perfectly normal "café" shows up as "cafÃ©", an apostrophe becomes "â€™", or names full of accents dissolve into question marks and boxes. It looks like corruption, but it usually isn't — it's a <em>character encoding</em> mismatch, and once you understand what's happening, both the cause and the fix become obvious. This is one of those topics that quietly underlies a huge amount of "why is my text broken" frustration.</p>

    <h2>Computers store numbers, not letters</h2>
    <p>A computer has no idea what an "A" is. It stores numbers. So to store text, there has to be an agreed mapping from characters to numbers — "A is 65, B is 66", and so on. That mapping is a <em>character set</em>, and the rules for turning those numbers into actual bytes on disk or on the wire is an <em>encoding</em>. Text breaks when the thing writing the bytes and the thing reading them disagree about which mapping is in use.</p>

    <h2>From ASCII's 128 characters to Unicode's universe</h2>
    <p>The original standard, ASCII, mapped 128 characters — enough for English letters, digits, and basic punctuation. That was fine until the rest of the world needed computers. Accented letters, Cyrillic, Arabic, Chinese, and eventually emoji have no place in 128 slots. For a while, everyone invented their own incompatible extensions, which is precisely why text moved between systems and shattered.</p>
    <p><strong>Unicode</strong> is the fix: one giant, universal character set with a unique number (a "code point") for every character in every writing system — over a million slots, covering essentially all human text plus emoji. Unicode says "the letter é is code point U+00E9, the emoji 😀 is U+1F600." It's the agreed-upon map everyone can share.</p>

    <h2>UTF-8: how Unicode becomes bytes</h2>
    <p>Unicode assigns the numbers; it doesn't say how to store them as bytes. That's an encoding's job, and the one that won — used by the vast majority of the web — is <strong>UTF-8</strong>. Its clever trick is being variable-width: the common ASCII characters still take a single byte (so plain English text is identical to old ASCII, and files stay small), while less common characters take two, three, or four bytes as needed. It's efficient, backwards-compatible, and universal. If you get to choose an encoding, the answer is UTF-8, essentially always.</p>

    <h2>So why does text still break?</h2>
    <p>The gibberish happens when bytes written as UTF-8 are <em>read</em> as if they were some other encoding (often the old Windows "Latin-1"), or vice versa. "café" in UTF-8 stores the é as two bytes; a reader that thinks each byte is one Latin-1 character shows those two bytes as two characters — "Ã©" — and you get "cafÃ©". The bytes are fine; the <em>interpretation</em> is wrong. The question-marks-and-boxes version happens when a character has no representation in the encoding or font being used to display it, so it's replaced with a placeholder.</p>
    <p>The practical fixes follow directly:</p>
    <ul>
      <li><strong>Declare UTF-8 everywhere</strong> — in your HTML (<code>&lt;meta charset="utf-8"&gt;</code>), your database, your file saves, your API headers. Most "mojibake" is a missing or wrong declaration.</li>
      <li><strong>Save and export as UTF-8.</strong> A CSV that opens fine in one program and breaks in another is often an encoding mismatch on export.</li>
      <li><strong>Watch invisible impostors.</strong> A "non-breaking space" or a smart quote pasted from a word processor looks normal but is a different character underneath, which can break exact matches and comparisons.</li>
    </ul>

    <h2>Seeing the bytes for yourself</h2>
    <p>When encoding is the suspect, it helps to look at what's actually there. Converting a snippet of text <a href="/${T}/text-to-hex">to hexadecimal</a> or <a href="/${T}/text-to-binary">to binary</a> shows you the real bytes — you can see an accented character take several bytes in UTF-8, which is a concrete way to understand what's happening under the surface. The takeaway: text is numbers-plus-an-agreement, Unicode is the agreement, UTF-8 is how to store it, and "broken" text is almost always a disagreement about which encoding is in play. Standardise on UTF-8 and most of the mess simply never happens.</p>`,
  },
  {
    slug: "json-yaml-csv-which-format",
    title: "JSON, YAML and CSV: which data format should you use?",
    description:
      "The three formats you'll meet most for structured data — what each is good and bad at, when to pick which, and how to convert cleanly between them.",
    date: "2026-07-23",
    read: 6,
    excerpt:
      "JSON, YAML and CSV all hold structured data, but they're good at different things. A practical guide to picking the right one — and converting between them.",
    bodyHtml: `
    <p>If you work with data, you'll meet JSON, YAML and CSV constantly, and they're not interchangeable — each was designed for a different job and each is genuinely bad at the others' jobs. Knowing which to reach for (and when to convert) saves a surprising amount of friction. Here's a practical comparison.</p>

    <h2>CSV: flat, tabular, spreadsheet-native</h2>
    <p>CSV (comma-separated values) is the simplest: rows and columns, one record per line, a header row of column names. Its whole strength is that it's <em>tabular</em> and universal — every spreadsheet and database reads and writes it, and it's compact.</p>
    <p>Its weakness is that it's <em>only</em> tabular. CSV has no way to express nesting — a record can't contain a list or a sub-record — so anything hierarchical doesn't fit. It also has no types (everything is text) and a surprising number of edge cases: commas inside a field need quoting, quotes need escaping, and line endings and encodings vary between the systems that produced the file. Use CSV when your data is genuinely a flat table and it's headed for a spreadsheet or a bulk import.</p>

    <h2>JSON: the lingua franca of APIs</h2>
    <p>JSON (JavaScript Object Notation) is the default for data exchanged between programs, especially over the web. Unlike CSV it handles <em>nesting</em> naturally — objects inside objects, lists of things — and it has basic types (strings, numbers, booleans, null). It's strict and unambiguous, which is exactly what you want when a machine is parsing it: double-quoted keys and strings, no trailing commas, no comments.</p>
    <p>That strictness is also its weakness for humans. JSON is fiddly to write by hand — easy to drop a comma or a brace — and can't carry comments, which config files often need. It's a format optimised for machines to exchange, not for people to author. When you're staring at a wall of minified JSON, a <a href="/${T}/json-formatter">formatter</a> makes it readable, and a <a href="/${T}/json-validator">validator</a> pinpoints the missing comma when it won't parse.</p>

    <h2>YAML: for humans to write</h2>
    <p>YAML was designed to be the format people write by hand — which is why configuration files (CI pipelines, Kubernetes, app config) so often use it. It expresses the same nested structures as JSON but with far less punctuation: indentation instead of braces, no quotes on most strings, and comments allowed. In fact YAML is a superset of JSON, so any JSON is valid YAML.</p>
    <p>YAML's readability comes at a price: <strong>indentation is structural</strong>, so a misplaced space can change the meaning or break the file entirely, and it has some famous gotchas (the word <code>no</code> can be read as the boolean <code>false</code>; <code>1.0</code> as a number). It's wonderful for hand-edited config and a poor choice for data flying between machines, where JSON's strictness is safer.</p>

    <h2>Choosing quickly</h2>
    <ul>
      <li><strong>Flat, tabular data → CSV.</strong> Especially anything bound for a spreadsheet.</li>
      <li><strong>Data exchanged between programs / APIs → JSON.</strong> Strict, typed, universally supported.</li>
      <li><strong>Configuration a human edits → YAML.</strong> Readable, comment-friendly — just mind the indentation.</li>
    </ul>

    <h2>Converting between them</h2>
    <p>You'll often need to move data from one to another: an API gives you JSON but you need it in a spreadsheet; a config is JSON but you'd rather hand-edit YAML. The conversions are well-defined, with one caveat worth remembering — going from a nested format (JSON/YAML) to a flat one (CSV) loses structure, because a table has nowhere to put nesting, so flatten or reshape first. The tools handle the common directions cleanly: <a href="/${T}/csv-to-json-converter">CSV↔JSON</a>, <a href="/${T}/yaml-to-json-converter">YAML↔JSON</a>, and <a href="/${T}/json-to-yaml-converter">JSON↔YAML</a>. Pick the format that fits the job at each stage, and convert at the boundaries — that's the whole art of it.</p>`,
  },
  {
    slug: "hashing-explained",
    title: "Hashing explained: what MD5 and SHA-256 are actually for",
    description:
      "What a hash function is, why the same input always gives the same fingerprint, and the critical differences between MD5, SHA-256 and password hashing.",
    date: "2026-07-23",
    read: 6,
    excerpt:
      "Hashes turn any input into a fixed fingerprint. But using the wrong one — MD5 for security, SHA-256 for passwords — causes real damage. Here's the map.",
    bodyHtml: `
    <p>Hashing sounds arcane but the idea is simple, and it's worth understanding because the wrong choice of hash function causes real security problems. A hash function takes any input — a word, a file, a gigabyte of data — and produces a fixed-size string of characters, its "fingerprint". This article covers what that's for, and the crucial distinctions between the hashes you'll meet: MD5, SHA-256, and the special case of password hashing.</p>

    <h2>What a hash function does</h2>
    <p>Three properties define a useful hash:</p>
    <ul>
      <li><strong>Deterministic:</strong> the same input always produces the same hash. "hello" hashed today and next year gives the identical result.</li>
      <li><strong>Fixed size:</strong> the output is always the same length regardless of input size. A three-letter word and a huge file both produce, say, a 64-character SHA-256 hash.</li>
      <li><strong>Avalanche effect:</strong> change the input even slightly — one character — and the output changes completely and unpredictably. There's no "similar input, similar hash".</li>
    </ul>
    <p>Crucially, hashing is <strong>one-way</strong>: you can't reverse a hash back to its input. That's what separates it from encoding (like Base64, which reverses trivially) and from encryption (which reverses with a key). A hash is a fingerprint, not a container — the original isn't "inside" it.</p>

    <h2>What hashes are used for</h2>
    <ul>
      <li><strong>Integrity checking.</strong> Publish a file's hash; anyone who downloads the file can hash their copy and compare. Match means the file arrived intact and untampered. This is the "checksum" you sometimes see next to a download.</li>
      <li><strong>Deduplication and caching.</strong> Two pieces of data with the same hash are (essentially certainly) identical, so hashes make quick keys for "have I seen this before?"</li>
      <li><strong>Verifying without storing.</strong> Systems can check whether you know a secret by comparing hashes, without keeping the secret itself — the idea behind (careful) password storage.</li>
    </ul>

    <h2>MD5: fine for checksums, broken for security</h2>
    <p>MD5 produces a 32-character hash and is fast — but it's <strong>cryptographically broken</strong>. Researchers can deliberately construct two <em>different</em> inputs that produce the <em>same</em> MD5 hash (a "collision"). That destroys any security use: if an attacker can make a malicious file hash the same as a legitimate one, the hash no longer proves integrity against a determined adversary.</p>
    <p>So the rule: never use <a href="/${T}/md5-hash-generator">MD5</a> for anything an attacker might exploit — signatures, security tokens, tamper-proofing. It's still perfectly fine for its <em>non-adversarial</em> uses, though: a quick checksum against accidental corruption, a cache key, deduplication. There, you're guarding against random error, not a malicious collision, and MD5's speed is an asset.</p>

    <h2>SHA-256: the current standard</h2>
    <p>When you need a hash to be secure, <a href="/${T}/sha256-hash-generator">SHA-256</a> (part of the SHA-2 family) is the trustworthy default. It produces a 64-character hash and has no known practical collision attacks. Use it for integrity verification that needs to resist tampering, and anywhere you'd have reached for MD5 but the threat model includes someone actively trying to cheat.</p>

    <h2>The password special case: don't use a plain fast hash</h2>
    <p>Here's a subtlety that catches people out: for storing passwords, even SHA-256 isn't the right tool <em>on its own</em>. The problem is that SHA-256 is fast — and fast is exactly wrong for passwords, because it lets an attacker who steals your hash database try billions of guesses per second. Password storage needs a <strong>deliberately slow, salted</strong> hash designed for the purpose: bcrypt, scrypt, or Argon2. These add a per-user random "salt" (so identical passwords don't share a hash, defeating precomputed "rainbow tables") and are tuned to be slow enough to make mass guessing impractical.</p>
    <p>So the full map: MD5 for non-security checksums; SHA-256 for secure integrity checking and fingerprints; a purpose-built slow hash (bcrypt/scrypt/Argon2) for passwords. Reaching for the wrong one — MD5 where security matters, or a plain fast hash for passwords — is a genuinely common and genuinely damaging mistake, and now it's one you won't make.</p>`,
  },
  {
    slug: "cleaning-messy-text",
    title: "Cleaning up messy text: a practical workflow",
    description:
      "Text copied from PDFs, emails and the web arrives full of junk. A step-by-step workflow for turning a mess into clean, usable text, in the right order.",
    date: "2026-07-23",
    read: 5,
    excerpt:
      "Pasted text from a PDF or email is full of broken line breaks, double spaces and invisible junk. Here's a repeatable order of operations to clean it fast.",
    bodyHtml: `
    <p>Copy text out of a PDF, an email, a chat log, or a web page and you rarely get clean text. You get line breaks in the middle of sentences, double spaces, blank lines everywhere, stray tabs, invisible non-breaking spaces, and duplicates. Cleaning it up by hand is tedious and error-prone. The good news is that text cleanup is a solved problem if you do the steps in the right order — and order matters more than you'd think, because some steps undo or interfere with others.</p>

    <h2>Diagnose before you clean</h2>
    <p>First, work out what's actually wrong, because different messes need different fixes. Is the text broken into short lines mid-sentence (a PDF or email hard-wrap)? Riddled with double spaces (old typing habits, or PDF extraction)? Full of blank lines (double-spaced source)? Are there duplicates (a merged list)? Is something matching that shouldn't, hinting at invisible characters? Naming the problem tells you which tools to use.</p>

    <h2>A reliable order of operations</h2>
    <p>The sequence below works because each step sets up the next. Skip around and you'll fight yourself — for example, sorting before trimming leaves lines mis-ordered by invisible leading spaces.</p>
    <ol>
      <li><strong>Fix line breaks first.</strong> If the text is wrongly wrapped mid-sentence, <a href="/${T}/remove-line-breaks">remove the line breaks</a> to rejoin paragraphs before doing anything else, so later steps operate on whole lines that mean something.</li>
      <li><strong>Trim each line.</strong> <a href="/${T}/trim-whitespace-from-lines">Strip leading and trailing whitespace</a> from every line. This is the quiet prerequisite for sorting and de-duplication working correctly, because it removes the invisible differences that make identical-looking lines behave differently.</li>
      <li><strong>Collapse internal spaces.</strong> <a href="/${T}/remove-extra-spaces">Reduce runs of spaces</a> to single spaces — the double-spaces and fake-alignment padding that PDF copies love.</li>
      <li><strong>Drop blank lines.</strong> If empty lines are cluttering things, <a href="/${T}/remove-empty-lines">remove them</a> now that real content lines are clean.</li>
      <li><strong>De-duplicate.</strong> With lines trimmed and normalised, <a href="/${T}/remove-duplicate-lines">removing duplicates</a> actually catches the genuine repeats (before trimming, "apple " and "apple" wouldn't have matched).</li>
      <li><strong>Sort, if useful.</strong> Finally, <a href="/${T}/sort-lines-alphabetically">sort the list</a> — which is also a great way to eyeball any remaining near-duplicates, since they'll sit next to each other.</li>
    </ol>

    <h2>The invisible-character gotcha</h2>
    <p>Sometimes text refuses to behave — two entries look identical but won't de-duplicate, or a comparison insists two "same" strings differ. The usual culprit is an invisible character: a non-breaking space (which looks exactly like a space but isn't), a zero-width character, a smart quote from a word processor, or a Windows line ending mixed in with Unix ones. When cleanup isn't working and you can't see why, that's the thing to suspect — rendering the invisibles or normalising them is what unsticks it.</p>

    <h2>Why order beats effort</h2>
    <p>The reason this workflow feels almost effortless is that each step is trivial on its own — the skill is doing them in a sequence where they cooperate rather than interfere. Trim before you sort. Rejoin lines before you collapse spaces. De-duplicate after you've normalised, not before. Follow that order and a genuinely horrible paste — the kind that would take ten minutes of manual fiddling — becomes clean, consistent text in under a minute, every time.</p>`,
  },
];
