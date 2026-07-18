/* Regex matching runs off the main thread so a catastrophic-backtracking
 * pattern (e.g. /^(a+)+$/ against a long non-matching string) freezes only
 * this worker, not the tab — the main thread in app.js pairs this with a
 * timeout that terminates and restarts the worker if it doesn't answer in
 * time. Still runs entirely in the browser: a Worker is a separate JS
 * thread in the same browser process, not a network request, so this
 * doesn't change the "nothing ever leaves your device" guarantee.
 */
(function () {
  "use strict";

  var MAX_MATCHES = 10000; // guards a global zero-length-match loop, same cap as before

  function runRegexMatch(pattern, flags, text) {
    var re = new RegExp(pattern, flags); // throws SyntaxError for an invalid pattern — caller catches
    var matches = [];
    if (flags.indexOf("g") !== -1) {
      var m, guard = 0;
      while ((m = re.exec(text)) && guard++ < MAX_MATCHES) {
        matches.push({ index: m.index, groups: Array.prototype.slice.call(m) });
        if (m[0] === "") re.lastIndex++; // step past a zero-length match so exec() can't loop forever
      }
    } else {
      var single = re.exec(text);
      if (single) matches.push({ index: single.index, groups: Array.prototype.slice.call(single) });
    }
    return matches;
  }

  // Exposes runRegexMatch to Node's test runner (see test/transforms.test.mjs)
  // without a real Worker environment — same shim pattern as assets/app.js.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { runRegexMatch: runRegexMatch };
    return;
  }

  self.onmessage = function (e) {
    var id = e.data.id;
    try {
      self.postMessage({ id: id, ok: true, matches: runRegexMatch(e.data.pattern, e.data.flags, e.data.text) });
    } catch (err) {
      self.postMessage({ id: id, ok: false, error: err.message });
    }
  };
})();
