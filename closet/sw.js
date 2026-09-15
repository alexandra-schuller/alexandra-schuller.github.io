/* The Closet — offline shell.
   Bump CACHE when index.html changes so installed copies pick it up. */
var CACHE = "closet-v2";
var SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg",
             "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () {
    return self.skipWaiting();
  }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  var isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";

  if (isFont) {
    // Fonts rarely change: serve from cache, refill in the background.
    e.respondWith(caches.open(CACHE).then(function (c) {
      return c.match(e.request).then(function (hit) {
        var live = fetch(e.request).then(function (res) {
          if (res && (res.ok || res.type === "opaque")) c.put(e.request, res.clone());
          return res;
        }).catch(function () { return hit; });
        return hit || live;
      });
    }));
    return;
  }

  if (url.origin !== self.location.origin) return;

  // App shell: always revalidate HTML, or GitHub's CDN cache pins the app to
  // an old version long after a deploy.
  var wantsHTML = e.request.mode === "navigate" ||
                  (e.request.headers.get("accept") || "").indexOf("text/html") !== -1;
  var net = wantsHTML ? fetch(e.request.url, { cache: "no-store" }) : fetch(e.request);

  e.respondWith(net.then(function (res) {
    if (res && res.ok) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(e.request).then(function (hit) {
      return hit || caches.match("./index.html");
    });
  }));
});
