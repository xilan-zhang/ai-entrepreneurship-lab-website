/*
  Publications and working papers on research.html. Renders window.LAB_RESEARCH into #study-list.
  Two arrangements: by year (default) and by place. In the place view each place gets the anchor
  #place-<id>, which the homepage globe links to; arriving with such a hash opens the place view.
  Status filters narrow either view.
*/
(function () {
  "use strict";

  var DATA = window.LAB_RESEARCH;
  var box = document.getElementById("study-list");
  var filtersBox = document.querySelector("[data-filters]");
  var viewButtons = document.querySelectorAll("[data-view]");
  if (!DATA || !box) return;

  var STATUS = { published: "Published", review: "Under review", working: "Working paper", ongoing: "In progress", planned: "Planned", proposed: "Under discussion", project: "Funded project", tbd: "Details to add" };
  var FILTERS = [
    { id: "all", label: "All", test: function () { return true; } },
    { id: "published", label: "Published", test: function (s) { return s.status === "published"; } },
    { id: "working", label: "Working papers", test: function (s) { return s.status === "working" || s.status === "review"; } },
    { id: "current", label: "In progress and planned", test: function (s) { return ["ongoing", "planned", "proposed", "project", "tbd"].indexOf(s.status) !== -1; } }
  ];
  var state = { filter: "all", view: /^#place-/.test(location.hash) ? "place" : "year" };

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
  function placesOf(s) { return [s.place].concat(s.alsoPlaces || []); }
  function placeName(id) {
    var p = DATA.places.find(function (x) { return x.id === id; });
    return p ? (p.label || p.country) : id;
  }
  function visible() {
    var f = FILTERS.find(function (x) { return x.id === state.filter; });
    return DATA.studies.filter(f.test);
  }

  function item(s) {
    var li = el("li", "study-item");
    var tags = el("div", "tags");
    tags.append(el("span", "tag s-" + s.status, STATUS[s.status] || s.status));
    if (s.method) tags.append(el("span", "tag", s.method));
    if (state.view === "year") placesOf(s).forEach(function (id) { tags.append(el("span", "tag place", placeName(id))); });
    if (s.confirm) tags.append(el("span", "tag confirm", "To confirm"));
    li.append(tags);
    var h = el("h4");
    if (s.url) h.append(link(s.title, s.url)); else h.textContent = s.title;
    li.append(h);
    var meta = el("p", "meta");
    if (s.authors) meta.append(document.createTextNode(s.authors + ". "));
    if (s.venue) {
      if (s.status === "published") meta.append(el("em", null, s.venue));
      else meta.append(document.createTextNode(s.venue.charAt(0).toUpperCase() + s.venue.slice(1)));
    }
    if (s.year) meta.append(document.createTextNode((s.venue ? ", " : "") + s.year));
    li.append(meta);
    if (s.summary) li.append(el("p", "summary", s.summary));
    if (s.page) {
      var pg = el("p", "page-link");
      pg.append(link(s.pageText || "Read about this research", s.page));
      li.append(pg);
    }
    if (s.evidence && s.evidence !== s.url) {
      var src = el("p", "src", "Setting confirmed by ");
      src.append(link(s.evidenceLabel || "source", s.evidence));
      li.append(src);
    }
    return li;
  }

  function group(id, title, sub, list, extraLink) {
    var sec = el("section", "study-group");
    if (id) sec.id = id;
    var head = el("div");
    head.append(el("h3", null, title));
    if (sub) head.append(el("p", "where", sub));
    if (extraLink) {
      var more = el("p", "where");
      more.append(link(extraLink[0], extraLink[1]));
      head.append(more);
    }
    var ul = el("ul", "study-items");
    list.forEach(function (s) { ul.append(item(s)); });
    sec.append(head, ul);
    return sec;
  }

  function render() {
    var list = visible();
    box.textContent = "";
    if (!list.length) { box.append(el("p", "pub-count", "No studies match this filter.")); return; }

    if (state.view === "place") {
      DATA.places
        .map(function (p) { return { p: p, list: list.filter(function (s) { return placesOf(s).indexOf(p.id) !== -1; }) }; })
        .filter(function (g) { return g.list.length; })
        .sort(function (a, b) { return b.list.length - a.list.length; })
        .forEach(function (g) {
          var p = g.p;
          var sub = [p.where, plural(g.list.length, "study", "studies")].filter(Boolean).join(", ");
          var extra = p.href && !/^#/.test(p.href) ? [p.linkText || "Read more", p.href] : null;
          box.append(group("place-" + p.id, p.label || p.country, sub, g.list, extra));
        });
    } else {
      var current = list.filter(function (s) { return !s.year; });
      if (current.length) box.append(group(null, "Current work", plural(current.length, "study", "studies"), current));
      var years = Array.from(new Set(list.filter(function (s) { return s.year; }).map(function (s) { return s.year; }))).sort(function (a, b) { return b - a; });
      years.forEach(function (y) {
        var ys = list.filter(function (s) { return s.year === y; });
        box.append(group(null, String(y), plural(ys.length, "study", "studies"), ys));
      });
    }
  }

  function syncButtons() {
    if (filtersBox) filtersBox.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.filter === state.filter)); });
    viewButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.view === state.view)); });
  }

  if (filtersBox) {
    FILTERS.forEach(function (f) {
      var n = DATA.studies.filter(f.test).length;
      if (!n) return;
      var b = el("button", "chip");
      b.type = "button";
      b.dataset.filter = f.id;
      b.append(document.createTextNode(f.label + " "), el("span", "n", String(n)));
      filtersBox.append(b);
    });
    filtersBox.addEventListener("click", function (ev) {
      var b = ev.target.closest("button[data-filter]");
      if (!b) return;
      state.filter = b.dataset.filter;
      syncButtons(); render();
    });
  }
  viewButtons.forEach(function (b) {
    b.addEventListener("click", function () {
      state.view = b.dataset.view;
      syncButtons(); render();
    });
  });

  syncButtons();
  render();

  function goToHash() {
    if (!/^#place-/.test(location.hash)) return;
    if (state.view !== "place" || state.filter !== "all") { state.view = "place"; state.filter = "all"; syncButtons(); render(); }
    var target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView();
  }
  goToHash();
  window.addEventListener("hashchange", goToHash);
})();
