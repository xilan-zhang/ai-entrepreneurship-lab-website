/*
  Studies by place on research.html. Renders window.LAB_RESEARCH into #study-list.
  Each place gets the anchor #place-<id>, which the homepage globe links to.
*/
(function () {
  "use strict";

  var DATA = window.LAB_RESEARCH;
  var box = document.getElementById("study-list");
  if (!DATA || !box) return;
  var STATUS = { published: "Published", review: "Under review", working: "Working paper", ongoing: "In progress", planned: "Planned", proposed: "Under discussion", project: "Funded project", tbd: "Details to add" };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }
  function link(text, href) {
    var a = el("a", null, text);
    a.href = href;
    if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
    return a;
  }
  function studiesAt(p) { return DATA.studies.filter(function (s) { return s.place === p.id; }); }

  box.textContent = "";
  DATA.places.filter(function (p) { return studiesAt(p).length; })
    .sort(function (a, b) { return studiesAt(b).length - studiesAt(a).length; })
    .forEach(function (p) {
      var list = studiesAt(p);
      var sec = el("section", "study-place");
      sec.id = "place-" + p.id;
      var head = el("div");
      head.append(el("h3", null, p.label || p.country));
      if (p.where) head.append(el("p", "where", p.where));
      head.append(el("span", "count", plural(list.length, "study", "studies")));
      if (p.href && !/^#/.test(p.href)) {
        var more = el("p", "where");
        more.append(link((p.linkText || "Read more") + " →", p.href));
        head.append(more);
      }
      var ul = el("ul", "study-items");
      list.forEach(function (s) {
        var li = el("li", "study-item");
        var tags = el("div", "tags");
        tags.append(el("span", "tag s-" + s.status, STATUS[s.status] || s.status));
        if (s.method) tags.append(el("span", "tag", s.method));
        if (s.confirm) tags.append(el("span", "tag confirm", "To confirm"));
        li.append(tags);
        var h = el("h4");
        if (s.url) h.append(link(s.title, s.url)); else h.textContent = s.title;
        li.append(h);
        li.append(el("p", "meta", [s.authors, s.year, s.venue].filter(Boolean).join(" · ")));
        if (s.summary) li.append(el("p", "summary", s.summary));
        if (s.evidence && s.evidence !== s.url) {
          var src = el("p", "src", "Setting confirmed by ");
          src.append(link(s.evidenceLabel || "source", s.evidence));
          li.append(src);
        }
        ul.append(li);
      });
      sec.append(head, ul);
      box.append(sec);
    });

  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView();
  }
})();
