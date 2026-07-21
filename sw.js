/* Textbench service worker — caches the static app shell (CSS/JS/icon) so the
 * tools themselves work offline once a page has loaded. Deliberately does
 * NOT cache HTML pages: they're what actually change (new tool pages,
 * content edits), and a stale cached page here could show old copy or a
 * missing new tool — network-first for those, cache is only the shell.
 *
 * Network-first for the shell too, even though Textbench's asset URLs carry
 * a content-hash ?v= (see engine/template.mjs's assetV()) that changes
 * automatically whenever the file changes — a cache-first strategy would
 * still be safe under that scheme, but network-first costs nothing extra
 * and needs zero reasoning about whether the hash always gets recomputed on
 * every deploy path, same "belt and suspenders" call CountLink's sw.js makes.
 */
const CACHE_NAME = "textbench-shell-v1";
const SHELL_ASSETS = ["/assets/style.css", "/assets/app.js", "/assets/regex-worker.js", "/assets/favicon.svg", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return; // never intercept Google Fonts/AdSense calls
  const isShellAsset = SHELL_ASSETS.some((p) => url.pathname === p || url.pathname.startsWith(p.split("?")[0]));
  if (!isShellAsset) return; // let HTML pages hit the network normally

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
