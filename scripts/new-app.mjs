#!/usr/bin/env node
/**
 * Stamp out a new boring app from this factory.
 *
 *   node scripts/new-app.mjs "AppName" ../app-name [domain.tld]
 *
 * Copies the reusable parts of the factory (engine, design system, assets,
 * scripts, the config/pages/content trio, package.json, .gitignore) into a
 * fresh, standalone directory, renames it, builds it, and prints next steps.
 * The new app has NO dependency back on the factory — like CountLink, it's a
 * self-contained static site you can `git init` and deploy on its own.
 *
 * What is intentionally NOT copied: this factory's own docs/ (the playbook,
 * next-ideas, etc.) and .git — those belong to the factory, not to each app.
 */
import { cp, rm, mkdir, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const [, , appName, destArg, domainArg] = process.argv;

if (!appName || !destArg) {
  console.error('Usage: node scripts/new-app.mjs "AppName" ../dest-dir [domain.tld]');
  process.exit(1);
}
const dest = resolve(ROOT, destArg);
if (existsSync(dest) && (await readdir(dest)).length) {
  console.error(`Destination ${dest} already exists and is not empty. Aborting.`);
  process.exit(1);
}

// Copied wholesale (the reusable machinery + a replaceable reference app).
const INCLUDE = [
  "engine", "design-system", "assets",
  "site.config.mjs", "pages.mjs", "content.mjs",
  "scripts", "package.json", ".gitignore",
];

await mkdir(dest, { recursive: true });
for (const item of INCLUDE) {
  const from = join(ROOT, item);
  if (!existsSync(from)) continue;
  await cp(from, join(dest, item), { recursive: true });
}

// A minimal app README (the factory's own README does not travel with the app).
await writeFile(
  join(dest, "README.md"),
  `# ${appName}\n\nA static, zero-backend utility built from the [boring-app-factory](../boring-app-factory).\n\n\`\`\`bash\nnode engine/build.mjs          # regenerate the whole site\nnode scripts/dev-server.mjs    # preview at http://localhost:4173\n\`\`\`\n\nEdit \`site.config.mjs\` (identity/IDs), \`pages.mjs\` (the tool + long-tail pages),\n\`content.mjs\` (home/about/legal), and \`assets/\` (styles + logic). Then rebuild.\n\nSee the factory's \`docs/playbook.md\` for the full build → monetize → SEO flow.\n`
);

console.log(`Copied factory into ${dest}. Renaming to "${appName}"…`);
execFileSync("node", ["scripts/rename-brand.mjs", appName, domainArg || `${appName.toLowerCase()}.example`], {
  cwd: dest,
  stdio: "inherit",
});

console.log(`\n✔ New app "${appName}" ready at ${dest}`);
console.log("Next:");
console.log(`  cd ${destArg}`);
console.log("  # replace pages.mjs + content.mjs + assets/app.js with your real tool");
console.log("  node engine/build.mjs && node scripts/dev-server.mjs");
console.log("  git init && git add -A && git commit -m 'initial'  # then push + deploy on Cloudflare Pages");
