/* Sunrise — offline shell. Weather itself is fetched live and cached in
   localStorage by the page; this only keeps the app openable with no signal. */
var CACHE = "sunrise-v1";
var SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); })
    .then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);

  // never cache the forecast — stale weather is worse than none
  if (url.hostname.indexOf("open-meteo.com") !== -1) return;

  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
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

  e.respondWith(fetch(e.request).then(function (res) {
    if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(e.request).then(function (hit) { return hit || caches.match("./index.html"); });
  }));
});
