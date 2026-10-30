/*
  Research globe on the homepage. Reads window.LAB_RESEARCH (assets/js/research-data.js) and draws
  a slowly turning globe with a point for each place. Needs d3, topojson-client and world-110m.js
  from assets/vendor/. Colours come from the --globe-* tokens in styles.css.

  - The globe runs off the right edge of the section and turns on its own; the card shows the place
    in the visible part nearest the front.
  - Each point links to that place's research page (place.href), or to its section on research.html.
  - Hovering or focusing a point pauses on it. Dragging turns the globe.
  - With reduced motion requested, the globe stays still unless the visitor turns it.
*/
(function () {
  "use strict";

  var DATA = window.LAB_RESEARCH;
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STATUS = { published: "Published", review: "Under review", working: "Working paper", ongoing: "In progress", planned: "Planned", proposed: "Under discussion", project: "Funded project", tbd: "Details to add" };
  var SPEED = 0.0045;          // degrees per millisecond, about 80 s per turn
  var LEAD = 32;               // degrees: chosen places sit left of the globe centre, in the visible part
  var HOLD_AFTER_SELECT = 9000; // ms the globe waits on a chosen place
  var HOLD_AFTER_DRAG = 3000;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }
  function studiesAt(p) { return DATA.studies.filter(function (s) { return s.place === p.id; }); }
  function nameOf(p) { return p.label || p.country; }
  function hrefOf(p) { return p.href || "research.html#place-" + p.id; }
  function linkTextOf(p) { return p.linkText || "See the research in " + nameOf(p); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function init(root) {
    var viewport = root.querySelector(".globe-viewport");
    var canvas = root.querySelector(".globe-canvas");
    var pointsBox = root.querySelector(".globe-points");
    var card = root.querySelector(".globe-card");
    var chipsBox = root.querySelector(".globe-places");
    var statsBox = root.querySelector(".globe-stats");

    if (!DATA || !window.d3 || !window.topojson || !window.WORLD_110M || !canvas || !canvas.getContext) {
      if (card) card.innerHTML = '<p class="globe-fallback">The globe could not load. The studies are listed on the <a href="research.html">Research page</a>.</p>';
      return;
    }

    var css = getComputedStyle(root);
    var C = {};
    ["ocean-hi", "ocean", "land", "study", "active", "border", "grid", "rim", "shadow", "arc", "arc-active"].forEach(function (k) {
      C[k] = css.getPropertyValue("--globe-" + k).trim();
    });

    var ctx = canvas.getContext("2d");
    var world = topojson.feature(WORLD_110M, WORLD_110M.objects.countries);
    var borders = topojson.mesh(WORLD_110M, WORLD_110M.objects.countries, function (a, b) { return a !== b; });
    var places = DATA.places.filter(function (p) { return studiesAt(p).length; });
    var mapped = places.filter(function (p) { return !p.online; });
    var home = mapped.find(function (p) { return p.home; });
    var studyNames = new Set(mapped.map(function (p) { return p.atlas || p.country; }));
    var studyLand = { type: "FeatureCollection", features: world.features.filter(function (f) { return studyNames.has(f.properties.name); }) };
    var arcs = home ? mapped.filter(function (p) { return !p.home; }).map(function (p) {
      return { id: p.id, line: { type: "LineString", coordinates: [[home.lon, home.lat], [p.lon, p.lat]] } };
    }) : [];

    var projection = d3.geoOrthographic().clipAngle(90).precision(0.6);
    var path = d3.geoPath(projection, ctx);
    var graticule = d3.geoGraticule10();
    var sphere = { type: "Sphere" };

    var state = {
      rot: [-20, -14, 0],    // starts with Africa in the visible part
      featured: null,        // place shown in the card
      chosen: null,          // place picked with a button
      hover: null,
      holdUntil: 0,
      anim: null,
      drag: null,
      running: false,
      dash: 0
    };
    var W = 0, H = 0, R = 0, cx = 0, cy = 0, dpr = 1;

    /* ---------- stats ---------- */
    if (statsBox) {
      var countries = new Set(mapped.map(function (p) { return p.country; }));
      [[countries.size, countries.size === 1 ? "country" : "countries"], [DATA.studies.length, DATA.studies.length === 1 ? "study" : "studies"]].forEach(function (s) {
        var d = el("div", "globe-stat");
        d.append(el("b", null, String(s[0])), el("span", null, s[1]));
        statsBox.append(d);
      });
    }

    /* ---------- points ---------- */
    var points = {};
    mapped.forEach(function (p) {
      var a = el("a", "globe-point" + (p.home ? " is-home" : ""));
      a.href = hrefOf(p);
      a.dataset.place = p.id;
      a.setAttribute("aria-label", nameOf(p) + ", " + plural(studiesAt(p).length, "study", "studies") + ". " + linkTextOf(p));
      a.append(el("span", "dot"), el("span", "label", nameOf(p)));
      a.hidden = true;
      a.addEventListener("pointerenter", function () { state.hover = p.id; feature(p.id); });
      a.addEventListener("pointerleave", function () { state.hover = null; state.holdUntil = performance.now() + 1500; });
      a.addEventListener("focus", function () { choose(p.id, true); });
      pointsBox.append(a);
      points[p.id] = a;
    });

    /* ---------- optional place buttons (.globe-places; not used on the homepage) ---------- */
    var chips = {};
    if (chipsBox) {
      places.slice().sort(function (a, b) { return studiesAt(b).length - studiesAt(a).length; }).forEach(function (p) {
        var b = el("button", "globe-chip" + (p.home ? " is-home" : "") + (p.online ? " is-online" : ""));
        b.type = "button";
        b.dataset.place = p.id;
        b.setAttribute("aria-pressed", "false");
        b.append(el("i"), el("span", null, p.chip || nameOf(p)));
        chips[p.id] = b;
        chipsBox.append(b);
      });
      chipsBox.addEventListener("click", function (ev) {
        var b = ev.target.closest(".globe-chip");
        if (b) choose(b.dataset.place, true);
      });
    }

    /* ---------- card ---------- */
    var cardTimer = null;
    function renderCard(id) {
      var p = DATA.places.find(function (x) { return x.id === id; });
      card.textContent = "";
      if (!p) {
        card.append(el("h3", null, "Research around the world"));
        card.append(el("p", "more", "The globe turns on its own. Select a point to go to that place's research."));
        return;
      }
      var list = studiesAt(p);
      card.append(el("h3", null, nameOf(p)));
      card.append(el("p", "globe-card-sub", [p.where, p.headline].filter(Boolean).join(" · ")));
      var ul = el("ul");
      list.slice(0, 2).forEach(function (s) {
        var li = el("li");
        li.append(el("span", "t", s.title));
        li.title = s.title + (STATUS[s.status] ? " (" + STATUS[s.status] + ")" : "");
        ul.append(li);
      });
      card.append(ul);
      if (list.length > 2) card.append(el("p", "more", "and " + plural(list.length - 2, "more study", "more studies")));
      var a = el("a", "text-link", linkTextOf(p) + " ");
      a.href = hrefOf(p);
      var arrow = el("span", null, "→");
      arrow.setAttribute("aria-hidden", "true");
      a.append(arrow);
      card.append(a);
    }
    function feature(id) {
      if (id === state.featured) return;
      state.featured = id;
      Object.keys(points).forEach(function (k) { points[k].classList.toggle("is-active", k === id); });
      if (REDUCED) { renderCard(id); requestDraw(); return; }
      card.classList.add("is-swapping");
      clearTimeout(cardTimer);
      cardTimer = setTimeout(function () { renderCard(id); card.classList.remove("is-swapping"); }, 180);
    }

    /* ---------- choosing and turning ---------- */
    function targetRotation(p) { return [-(p.lon + LEAD), clamp(-p.lat, -32, 32), 0]; }
    function choose(id, animate) {
      var p = DATA.places.find(function (x) { return x.id === id; });
      if (!p) return;
      state.chosen = id;
      state.holdUntil = performance.now() + HOLD_AFTER_SELECT;
      Object.keys(chips).forEach(function (k) { chips[k].setAttribute("aria-pressed", String(k === id)); });
      feature(id);
      if (p.online) return;
      var to = targetRotation(p);
      var from = state.rot.slice();
      to[0] = from[0] + (((to[0] - from[0]) % 360) + 540) % 360 - 180;
      if (!animate || REDUCED) { state.rot = to; requestDraw(); return; }
      state.anim = { from: from, to: to, start: performance.now(), dur: 1300 };
      start();
    }

    /* ---------- drawing ---------- */
    function layout() {
      var r = viewport.getBoundingClientRect();
      W = r.width; H = r.height;
      if (!W || !H) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      var wide = getComputedStyle(viewport).position === "absolute";
      // A large globe that runs off the right edge (and a little off the top and bottom).
      if (wide) { R = Math.min(H * 0.54, W * 0.31); cx = W - R * 0.5; cy = H * 0.5; }
      else { R = W * 0.52; cx = W - R * 0.35; cy = H * 0.5; }
      projection.translate([cx, cy]).scale(R);
      draw();
    }

    function draw() {
      if (!W || !H) return;
      projection.rotate(state.rot);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      var halo = ctx.createRadialGradient(cx, cy + R * 0.03, R * 0.92, cx, cy + R * 0.03, R * 1.14);
      halo.addColorStop(0, C.shadow);
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy + R * 0.03, R * 1.14, 0, 2 * Math.PI); ctx.fill();

      var sea = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.08, cx, cy, R);
      sea.addColorStop(0, C["ocean-hi"]);
      sea.addColorStop(1, C.ocean);
      ctx.beginPath(); path(sphere); ctx.fillStyle = sea; ctx.fill();

      ctx.beginPath(); path(graticule); ctx.strokeStyle = C.grid; ctx.lineWidth = 0.7; ctx.stroke();
      ctx.beginPath(); path(world); ctx.fillStyle = C.land; ctx.fill();
      ctx.beginPath(); path(studyLand); ctx.fillStyle = C.study; ctx.fill();
      var fp = state.featured && mapped.find(function (p) { return p.id === state.featured; });
      if (fp) {
        var f = world.features.find(function (x) { return x.properties.name === (fp.atlas || fp.country); });
        if (f) { ctx.beginPath(); path(f); ctx.fillStyle = C.active; ctx.fill(); }
      }
      ctx.beginPath(); path(borders); ctx.strokeStyle = C.border; ctx.lineWidth = 0.6; ctx.stroke();

      arcs.forEach(function (a) {
        var on = a.id === state.featured;
        ctx.beginPath(); path(a.line);
        ctx.strokeStyle = on ? C["arc-active"] : C.arc;
        ctx.lineWidth = on ? 1.8 : 1.1;
        ctx.setLineDash(REDUCED ? [] : [5, 7]);
        ctx.lineDashOffset = -state.dash;
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.beginPath(); path(sphere); ctx.strokeStyle = C.rim; ctx.lineWidth = 1; ctx.stroke();

      placePoints();
    }

    function placePoints() {
      var center = [-state.rot[0], -state.rot[1]];
      mapped.forEach(function (p) {
        var a = points[p.id];
        var d = d3.geoDistance([p.lon, p.lat], center);
        var room = Math.PI / 2 - d;
        if (room < 0.12) { if (!a.hidden) a.hidden = true; return; }
        if (a.hidden) a.hidden = false;
        var xy = projection([p.lon, p.lat]);
        a.style.transform = "translate(" + xy[0].toFixed(1) + "px," + xy[1].toFixed(1) + "px)";
        a.style.opacity = Math.min(1, (room - 0.12) / 0.3).toFixed(2);
      });
    }

    function nearestToFront() {
      // The "front" is the visible left part of the globe, LEAD degrees west of its centre.
      var center = [-state.rot[0] - LEAD, -state.rot[1]], best = null, bestD = Math.PI / 2 - 0.2;
      mapped.forEach(function (p) {
        var d = d3.geoDistance([p.lon, p.lat], center);
        if (d < bestD) { bestD = d; best = p.id; }
      });
      return best;
    }

    /* ---------- animation loop ---------- */
    var last = 0, raf = 0, drawQueued = false, lastFeatureCheck = 0;
    function frame(now) {
      raf = 0;
      var dt = last ? Math.min(64, now - last) : 16;
      last = now;
      if (state.anim) {
        var t = Math.min(1, (now - state.anim.start) / state.anim.dur), k = ease(t);
        state.rot = state.anim.from.map(function (v, i) { return v + (state.anim.to[i] - v) * k; });
        if (t >= 1) state.anim = null;
      } else if (!REDUCED && !state.drag && !state.hover && now > state.holdUntil) {
        if (state.chosen) {
          state.chosen = null;
          Object.keys(chips).forEach(function (k) { chips[k].setAttribute("aria-pressed", "false"); });
        }
        state.rot[0] -= dt * SPEED;
        state.rot[1] += (-14 - state.rot[1]) * 0.01;
      }
      if (!REDUCED) state.dash += dt * 0.012;
      draw();
      if (!state.chosen && !state.hover && now - lastFeatureCheck > 300) {
        lastFeatureCheck = now;
        var n = nearestToFront();
        if (n) feature(n);
      }
      if (state.running && (!REDUCED || state.anim || state.drag)) raf = requestAnimationFrame(frame);
    }
    function start() {
      state.running = true;
      if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
    }
    function stop() {
      state.running = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    function requestDraw() {
      if (drawQueued) return;
      drawQueued = true;
      requestAnimationFrame(function () { drawQueued = false; draw(); });
    }

    /* ---------- dragging ---------- */
    canvas.addEventListener("pointerdown", function (ev) {
      state.drag = { x: ev.clientX, y: ev.clientY, rot: state.rot.slice() };
      state.anim = null;
      canvas.setPointerCapture(ev.pointerId);
      start();
    });
    canvas.addEventListener("pointermove", function (ev) {
      if (!state.drag) return;
      var s = 90 / R;
      state.rot = [state.drag.rot[0] + (ev.clientX - state.drag.x) * s, clamp(state.drag.rot[1] - (ev.clientY - state.drag.y) * s, -55, 55), 0];
      if (REDUCED) requestDraw();
    });
    function endDrag() {
      if (!state.drag) return;
      state.drag = null;
      state.holdUntil = performance.now() + HOLD_AFTER_DRAG;
      var n = nearestToFront();
      if (n) feature(n);
    }
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);

    /* ---------- start ---------- */
    renderCard(null);
    layout();
    var first = nearestToFront();
    if (first) { state.featured = null; feature(first); }
    if (window.ResizeObserver) new ResizeObserver(layout).observe(viewport);
    else window.addEventListener("resize", layout);
    if (!REDUCED) {
      if (window.IntersectionObserver) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting && !document.hidden) start(); else stop(); });
        }, { threshold: 0.05 }).observe(viewport);
      } else start();
      document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
    }
  }

  function boot() { document.querySelectorAll("[data-research-globe]").forEach(init); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
