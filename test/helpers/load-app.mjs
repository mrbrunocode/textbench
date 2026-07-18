// assets/app.js is a classic (non-module) browser script, and this package
// is "type": "module", so it can't be `import`ed or `require()`d directly.
// Wrap its source in a CJS function shell instead — the same trick Node
// itself uses to load CommonJS files — so its own `module.exports` shim
// (placed after all transform data tables are initialized, see app.js)
// populates a real module object we can inspect.
//
// app.js starts with `if (!document.getElementById("editor")) return;` (real
// pages without an editor, like prose pages, skip all of this) and reaches
// its export point via more DOM reads before touching module.exports — so
// this needs a minimal `document` stub: just enough to report an "editor"
// exists and let every other lookup return null harmlessly, all the way
// down to the export point. A couple of transforms (sha256Async, uuidV4)
// also reference `window.crypto` directly rather than the bare global
// `crypto` — aliasing `window` to globalThis is enough for them to find
// Node's built-in Web Crypto, with zero change to the shipped browser code.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appJsPath = join(__dirname, "..", "..", "assets", "app.js");
const regexWorkerPath = join(__dirname, "..", "..", "assets", "regex-worker.js");

export function loadTransforms() {
  if (typeof globalThis.window === "undefined") globalThis.window = globalThis;
  // Predefining this avoids Node's noisy "localStorage is not available"
  // experimental-global warning; app.js already wraps its use in try/catch.
  if (typeof globalThis.localStorage === "undefined") {
    globalThis.localStorage = { getItem() { return null; }, setItem() {} };
  }
  if (typeof globalThis.document === "undefined") {
    globalThis.document = {
      documentElement: {},
      getElementById(id) { return id === "editor" ? {} : null; },
      querySelector() { return null; },
      querySelectorAll() { return []; },
    };
  }
  const src = readFileSync(appJsPath, "utf8");
  const mod = { exports: {} };
  const fn = new Function("module", "exports", "require", "__filename", "__dirname", src);
  fn(mod, mod.exports, createRequire(import.meta.url), appJsPath, dirname(appJsPath));
  return mod.exports;
}

// regex-worker.js needs no DOM at all — its module.exports shim is reached
// immediately, before any `self`/`postMessage` reference (see the file).
export function loadRegexWorker() {
  const src = readFileSync(regexWorkerPath, "utf8");
  const mod = { exports: {} };
  const fn = new Function("module", "exports", "require", "__filename", "__dirname", src);
  fn(mod, mod.exports, createRequire(import.meta.url), regexWorkerPath, dirname(regexWorkerPath));
  return mod.exports;
}
