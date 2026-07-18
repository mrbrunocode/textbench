// Split out from template.mjs so pages.mjs can use esc() without pulling in
// template.mjs's site.config.mjs import — that chain would make site.config.mjs
// circularly depend on itself via pages.mjs (site.config -> pages -> template
// -> site.config), which needed to work once site.config started reading
// PAGES.length to keep its tool-count copy in sync automatically.
export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
