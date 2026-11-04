/*
  Selected publications on the homepage: the six most recent published studies in
  window.LAB_RESEARCH (assets/js/research-data.js), newest first.
*/
(function () {
  "use strict";

  var DATA = window.LAB_RESEARCH;
  var box = document.getElementById("selected-pubs");
  if (!DATA || !box) return;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  var list = DATA.studies
    .filter(function (s) { return s.status === "published" && s.year; })
    .map(function (s, i) { return { s: s, i: i }; })
    .sort(function (a, b) { return (b.s.year - a.s.year) || (a.i - b.i); })
    .slice(0, 6)
    .map(function (x) { return x.s; });

  box.textContent = "";
  list.forEach(function (s) {
    var li = el("li", "pub");
    li.append(el("span", "pub-year", String(s.year)));
    var main = el("div");
    var h = el("h4");
    if (s.url) {
      var a = el("a", null, s.title);
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener";
      h.append(a);
    } else h.textContent = s.title;
    main.append(h);
    if (s.authors) main.append(el("p", "pub-authors", s.authors));
    li.append(main);
    li.append(el("p", "pub-venue", s.venue || ""));
    box.append(li);
  });
})();
