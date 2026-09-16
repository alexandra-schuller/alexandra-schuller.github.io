/* One Day Per Page — sync.

   Firestore holds one document per day under the signed-in account:
       users/{uid}/days/{YYYY-MM-DD}

   The page keeps working with no account and no signal; this only adds a
   second copy. Everything here degrades to "off" rather than throwing, so a
   missing config or a blocked network never stops you writing.

   Merging, not overwriting. Every stroke carries its own id and erasing
   records a tombstone, so two devices that both wrote to the same day end up
   with the union of the strokes minus the ones either device rubbed out.
   Last-writer-wins would silently eat handwriting; this doesn't.
*/
(function () {
  "use strict";

  var SDK = "https://www.gstatic.com/firebasejs/10.14.1/";

  var api = {
    state: "off",            // off | signed-out | signing-in | on | error
    user: null,
    detail: "",
    onState: null,
    signIn: function () {},
    signOut: function () {},
    push: function () { return Promise.resolve(); },
    pullAll: function () { return Promise.resolve([]); },
    watch: function () {}
  };
  window.PlannerSync = api;

  function setState(s, detail) {
    api.state = s;
    api.detail = detail || "";
    if (typeof api.onState === "function") api.onState(api);
  }

  var cfg = window.PLANNER_FIREBASE;
  if (!cfg || !cfg.apiKey || String(cfg.apiKey).indexOf("PASTE") === 0) {
    setState("off", "not configured");
    return;
  }

  Promise.all([
    import(SDK + "firebase-app.js"),
    import(SDK + "firebase-auth.js"),
    import(SDK + "firebase-firestore.js")
  ]).then(function (mods) {
    var A = mods[0], U = mods[1], F = mods[2];

    var app = A.initializeApp(cfg);
    var auth = U.getAuth(app);
    var db;
    try {
      // Offline cache, so edits made with no signal go up when there is some.
      db = F.initializeFirestore(app, { localCache: F.persistentLocalCache({}) });
    } catch (e) {
      db = F.getFirestore(app);
    }

    var uid = null, unwatch = null, watcher = null;

    function daysCol() { return F.collection(db, "users", uid, "days"); }

    api.signIn = function () {
      setState("signing-in");
      var provider = new U.GoogleAuthProvider();
      U.signInWithPopup(auth, provider).catch(function (e) {
        var code = (e && e.code) || "";
        // A standalone home-screen app often can't open a popup; redirect works.
        if (code.indexOf("popup") !== -1 || code.indexOf("operation-not-supported") !== -1) {
          U.signInWithRedirect(auth, provider).catch(function (e2) {
            setState("error", readable(e2));
          });
        } else {
          setState("error", readable(e));
        }
      });
    };

    api.signOut = function () {
      if (unwatch) { unwatch(); unwatch = null; }
      U.signOut(auth).catch(function () {});
    };

    api.push = function (ymd, rec) {
      if (!uid) return Promise.resolve();
      return F.setDoc(F.doc(db, "users", uid, "days", ymd), rec);
    };

    api.pullAll = function () {
      if (!uid) return Promise.resolve([]);
      return F.getDocs(daysCol()).then(function (snap) {
        var out = [];
        snap.forEach(function (d) { out.push(d.data()); });
        return out;
      }, function () { return []; });
    };

    api.watch = function (cb) {
      watcher = cb;
      if (uid) startWatch();
    };

    function startWatch() {
      if (unwatch || !watcher) return;
      unwatch = F.onSnapshot(daysCol(), function (snap) {
        snap.docChanges().forEach(function (ch) {
          if (ch.type === "removed") return;
          // Skip our own not-yet-acknowledged writes; we already have them.
          if (ch.doc.metadata.hasPendingWrites) return;
          watcher(ch.doc.data());
        });
      }, function () { /* a dropped listener is not worth shouting about */ });
    }

    U.getRedirectResult(auth).catch(function () {});

    U.onAuthStateChanged(auth, function (user) {
      if (user) {
        uid = user.uid;
        api.user = { email: user.email || "", name: user.displayName || "" };
        setState("on");
        startWatch();
      } else {
        uid = null;
        api.user = null;
        if (unwatch) { unwatch(); unwatch = null; }
        setState("signed-out");
      }
    });
  }, function () {
    setState("error", "couldn't load the sync library");
  });

  function readable(e) {
    var c = (e && e.code) || "";
    if (c.indexOf("network") !== -1) return "no connection";
    if (c.indexOf("unauthorized-domain") !== -1) return "this site isn't on Firebase's allowed list";
    if (c.indexOf("cancelled") !== -1 || c.indexOf("closed-by-user") !== -1) return "sign-in cancelled";
    return (e && e.message) ? String(e.message).slice(0, 90) : "sign-in failed";
  }
})();
