# Textbench

A static, zero-backend utility built from the [boring-app-factory](../boring-app-factory).
61 text tools as of 2026-07-21.

**Not live yet** — pushed to GitHub, but the Cloudflare Worker isn't connected
(Workers & Pages → Create → Connect to Git). Everything below works locally;
textbench.app isn't serving this site until that one-time connect happens.
See the root `../CLAUDE.md` app roster for current status.

```bash
node engine/build.mjs          # regenerate the whole site
node scripts/dev-server.mjs    # preview at http://localhost:4173
```

Edit `site.config.mjs` (identity/IDs), `pages.mjs` (the tool + long-tail pages),
`content.mjs` (home/about/legal), and `assets/` (styles + logic). Then rebuild.

See the factory's `docs/playbook.md` for the full build → monetize → SEO flow.
