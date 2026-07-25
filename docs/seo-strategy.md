# Textbench — competitive SEO strategy

Researched 2026-07-24/25 against live SERPs. Companion to
`countlink/docs/seo-strategy.md` and `diffhero/docs/seo-strategy.md`.

Read the verdict first: this is the **weakest competitive position of the
three**, despite having the best content metrics.

## The SERP for "free online text tools / word counter / case converter"

A single search returned **ten** direct competitors, all positioned
identically:

best.free · wordcounttool.com · texttoolshub.net · wordcounter.ai ·
textlytools.com · filator.com · webtoolkit.tech · cooltextool.com ·
easywordtools.com · freetextutils.com

Plus the established players already compared on `/alternatives`:
**convertcase.net** (~150+ tools) and **textmechanic.com**.

## Finding 1 — Textbench's entire pitch is the category's boilerplate

Every one of those ten advertises some combination of *free, no signup, runs in
your browser, nothing stored*. That is verbatim Textbench's tagline and About
page. In this category those claims are not a differentiator — they are the
price of entry. This is more acute here than for CountLink or Diffhero.

## Finding 2 — the tool-count race is already lost

- convertcase.net: ~150+ tools
- wordcounttool.com: 80+ tools
- Textbench: 64

Adding tools to catch up would be the exact scaled-content failure mode the
family guardrails warn about, and would still lose. **Do not compete on
count.** `/alternatives` already concedes this honestly, which is correct.

## Finding 3 — two concrete feature gaps worth closing

Unlike the count race, these are real and winnable:

1. **Readability scoring.** wordcounttool.com offers Flesch Reading Ease,
   Flesch–Kincaid, Gunning Fog, SMOG, ARI and Coleman–Liau, plus syllable
   counts, reading time and speaking time. Textbench has word/character/
   sentence/reading-time only. Readability is a genuinely useful,
   high-search-volume feature that fits the existing client-side architecture
   perfectly (pure computation, no server). **This is the single best feature
   addition available to Textbench.**
2. **Embeddable widgets.** wordcounttool.com offers free iframe widgets — a
   deliberate backlink engine, since every embedding site links back. CountLink
   has embeds; Textbench doesn't. Given backlinks are the family's binding
   constraint, an embeddable word counter is worth more than several new tools.

## Finding 4 — the competitor field looks low-quality

Most of those ten domains are thin, spun "tool hub" sites with minimal per-tool
content. Textbench genuinely beats them on things Google claims to reward:

- 83.9% unique content per page (highest of the three apps)
- A real guide on every tool page covering actual gotchas (ß not round-tripping
  through uppercase; MD5 not being for passwords; Base64 not being encryption)
- PWA/offline support and a Cmd/Ctrl+K command palette
- 7 long-form editorial guides with a named author

This is the strategic bet: **the field is crowded but weak.** Quality can win
here over a long horizon — but only with authority signals, which is exactly
what the site lacks.

## Finding 5 — verified competitor limits to keep exploiting

Already on `/alternatives`, still the best material:
- **Text Mechanic: 4 free tasks per hour**, with Pro sold to lift it. A
  per-hour cap only makes sense for server-side work — worth stating.
- **Convert Case: larger catalogue, also free, also ad-supported.** The page
  concedes this and recommends them for image conversion. Keep that honesty; it
  is the page's credibility.

## Priorities

**P0 — same as the family:** AdSense and backlinks. Textbench already has one
merged backlink (NwabKhan/awesome-web-tools) shared with Diffhero.

**P1 — close the two real gaps.**
1. **Add readability scoring** to the word counter (Flesch, Flesch–Kincaid,
   Gunning Fog at minimum). Pure client-side computation, fits the
   architecture, closes the clearest feature gap, and targets real volume.
2. **Ship an embeddable word-counter widget** with an attribution backlink.
   Best backlink-per-effort available to this site.

**P2 — lean on quality, not quantity.**
3. Keep the tool count flat. Deepen existing pages instead.
4. Consider making the repo's quality legible — it's already public, which for
   a site whose core claim is "nothing is uploaded" is verifiable proof rather
   than an assertion. Link it prominently.

**P3 — don't.**
- Don't chase convertcase.net on tool count.
- Don't add thin tool variants for keyword coverage.
- Don't restate "free, no signup, client-side" as the headline — ten
  competitors say it identically.

## Honest verdict

Best content quality of the three, worst competitive position. The category is
saturated with functionally identical free tools, the incumbents have 1.5–2.5×
the catalogue, and Textbench has no feature nobody else has.

Its realistic path is slower than the other two: close the readability gap, use
embeds to manufacture backlinks, and let genuine per-page quality compound
against thin competitors. Expect the longest payback period of the three, and
prioritise CountLink or Diffhero if effort has to be split.
