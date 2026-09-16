/* One Day Per Page has moved to planner.alexschuller.com.

   This address used to install the planner as an app, so a browser here may
   still hold a worker that serves the old copy from its cache. This replaces
   it with one that removes itself, hands every request straight to the
   network, and lets the page at / do the redirecting. */

self.addEventListener("install", function () { self.skipWaiting(); });

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (names) { return Promise.all(names.map(function (n) { return caches.delete(n); })); })
      .then(function () { return self.registration.unregister(); })
      .then(function () { return self.clients.matchAll({ type: "window" }); })
      .then(function (clients) { clients.forEach(function (c) { c.navigate(c.url); }); })
  );
});
