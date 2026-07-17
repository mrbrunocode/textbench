#!/usr/bin/env node
/**
 * Rename the app (name + domain) in one command.
 *
 *   node scripts/rename-brand.mjs "NewName" newname.tld
 *
 * newname.tld can be a real domain once bought, or left off to get a
 * <newname>.example placeholder to try a name on before buying.
 *
 * Because the whole site is generated from site.config.mjs, this only edits
 * that one file (NAME / NAME_LOWER / SITE_URL / CONTACT_EMAIL) and rebuilds —
 * every page, the sitemap, llms.txt and the JSON-LD update automatically.
 * (Your own prose in content.mjs/pages.mjs references the name via imports, so
 * it updates too — never hardcode the brand there.)
 */
import { execFileSync } from "node:child_process";
import { ROOT, readConfig, setConst, writeConfig } from "./_config-io.mjs";
import { NAME as OLD_NAME, SITE_URL as OLD_URL } from "../site.config.mjs";

const [, , newName, newDomainArg] = process.argv;
if (!newName) {
  console.error('Usage: node scripts/rename-brand.mjs "NewName" [newdomain.tld]');
  console.error(`Current: ${OLD_NAME} <${OLD_URL}>`);
  process.exit(1);
}
const nameLower = newName.toLowerCase();
const host = newDomainArg || `${nameLower}.example`;
const url = `https://${host}`;

let src = await readConfig();
src = setConst(src, "NAME", newName);
src = setConst(src, "NAME_LOWER", nameLower);
src = setConst(src, "SITE_URL", url);
src = setConst(src, "CONTACT_EMAIL", `hello@${host}`);
await writeConfig(src);
console.log(`site.config.mjs → NAME="${newName}", SITE_URL="${url}", CONTACT_EMAIL="hello@${host}"`);

execFileSync("node", ["engine/build.mjs"], { cwd: ROOT, stdio: "inherit" });
console.log(`\nRenamed ${OLD_NAME} → ${newName}. Review with \`git diff\`, then commit.`);
console.log("Remember to also update the two <text> lines in assets/og-image.svg and re-rasterize it.");
