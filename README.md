# Textbench

A static, zero-backend utility built from the [boring-app-factory](../boring-app-factory).
61 text tools as of 2026-07-21.

**Live at [textbench.app](https://textbench.app)** (confirmed 2026-07-21).
AdSense ad slot isn't wired in yet (application status unclear — check the
dashboard); GA4/Search Console/Bing setup should be double-checked in their
respective dashboards. See the root `../CLAUDE.md` app roster for current status.

```bash
node engine/build.mjs          # regenerate the whole site
node scripts/dev-server.mjs    # preview at http://localhost:4173
```

Edit `site.config.mjs` (identity/IDs), `pages.mjs` (the tool + long-tail pages),
`content.mjs` (home/about/legal), and `assets/` (styles + logic). Then rebuild.

See the factory's `docs/playbook.md` for the full build → monetize → SEO flow.
