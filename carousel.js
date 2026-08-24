(function () {
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".carousel").forEach(function (carousel) {
      var slides = carousel.querySelectorAll(".carousel-slide");
      if (slides.length === 0) return;
      var i = 0;
      slides[0].classList.add("is-active");
      if (slides.length < 2) return;

      var isFr = (localStorage.getItem("site-lang") || "fr") === "fr";
      var timer = null;

      function go(next) {
        slides[i].classList.remove("is-active");
        i = (next + slides.length) % slides.length;
        slides[i].classList.add("is-active");
      }

      function start() {
        timer = setInterval(function () { go(i + 1); }, 4500);
      }

      function restart() {
        clearInterval(timer);
        start();
      }

      var prevBtn = document.createElement("button");
      prevBtn.type = "button";
      prevBtn.className = "carousel-arrow carousel-prev";
      prevBtn.setAttribute("aria-label", isFr ? "Image précédente" : "Previous image");
      prevBtn.innerHTML = "&#10094;";
      prevBtn.addEventListener("click", function () { go(i - 1); restart(); });

      var nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "carousel-arrow carousel-next";
      nextBtn.setAttribute("aria-label", isFr ? "Image suivante" : "Next image");
      nextBtn.innerHTML = "&#10095;";
      nextBtn.addEventListener("click", function () { go(i + 1); restart(); });

      carousel.appendChild(prevBtn);
      carousel.appendChild(nextBtn);

      start();
    });
  });
})();
