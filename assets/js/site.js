/* Header over the homepage photo: stays below the preview note, turns solid after scrolling. */
(function () {
  "use strict";
  var header = document.querySelector(".site-header.is-overlay");
  if (!header) return;
  var note = document.querySelector(".preview-note");
  var ticking = false;
  function update() {
    ticking = false;
    var nh = note ? note.offsetHeight : 0;
    header.style.top = Math.max(0, nh - window.scrollY) + "px";
    header.classList.toggle("is-scrolled", window.scrollY > nh + 40);
  }
  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
})();
