# Textbench

A static, zero-backend utility built from the [boring-app-factory](../boring-app-factory).

```bash
node engine/build.mjs          # regenerate the whole site
node scripts/dev-server.mjs    # preview at http://localhost:4173
```

Edit `site.config.mjs` (identity/IDs), `pages.mjs` (the tool + long-tail pages),
`content.mjs` (home/about/legal), and `assets/` (styles + logic). Then rebuild.

See the factory's `docs/playbook.md` for the full build → monetize → SEO flow.
