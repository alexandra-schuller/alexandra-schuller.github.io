(function () {
  var STORAGE_KEY = "site-lang";

  function currentLang() {
    return localStorage.getItem(STORAGE_KEY) || "fr";
  }

  function applyLang(lang) {
    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll("[data-en]").forEach(function (el) {
      if (!el.hasAttribute("data-fr")) {
        el.setAttribute("data-fr", el.textContent);
      }
      el.textContent = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-fr");
    });

    var btn = document.getElementById("lang-toggle");
    if (btn) {
      btn.textContent = lang === "fr" ? "English" : "Français";
      btn.setAttribute("aria-label", lang === "fr" ? "Switch to English" : "Passer au français");
    }

    localStorage.setItem(STORAGE_KEY, lang);
  }

  function createToggleButton() {
    var btn = document.createElement("button");
    btn.id = "lang-toggle";
    btn.type = "button";
    btn.className = "lang-toggle";
    btn.addEventListener("click", function () {
      applyLang(currentLang() === "fr" ? "en" : "fr");
    });
    document.body.appendChild(btn);
  }

  document.addEventListener("DOMContentLoaded", function () {
    createToggleButton();
    applyLang(currentLang());
  });
})();
