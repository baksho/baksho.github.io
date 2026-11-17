/* Theme support for the embedded playgrounds.
 *
 * The playgrounds were drawn for a white page. This script makes them follow the site's theme
 * (light / dark / system):
 *   1. it reads the theme from the parent page (the site) and keeps listening for changes;
 *   2. in dark mode it adds a mirrored copy of every colour rule in the page's CSS (html.sb-dark ...);
 *   3. it remaps greys, whites and dark inks used by canvas drawing (fillStyle, strokeStyle, gradients);
 *      saturated data colours (orange, blue, green, red, heat maps) are kept, only lightened if too dark;
 *   4. it fires a "sb-theme" event, so each playground can redraw (see the end of each file).
 * Pages that need other colours for pixel data (heat maps) read window.SBT.dark / SBT.bg.
 */
(function () {
  var root = document.documentElement;
  var BG = [11, 15, 21]; // dark page colour the playgrounds sit on (close to the site's dark background)

  // ---------- colour mapping ----------
  function rgb2hsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    var mx = Math.max(r, g, b),
      mn = Math.min(r, g, b),
      l = (mx + mn) / 2,
      h = 0,
      s = 0,
      d = mx - mn;
    if (d) {
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return [h, s, l];
  }
  function hsl2rgb(h, s, l) {
    function f(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    if (!s) return [l * 255, l * 255, l * 255];
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s,
      p = 2 * l - q;
    return [f(p, q, h + 1 / 3) * 255, f(p, q, h) * 255, f(p, q, h - 1 / 3) * 255];
  }
  // returns [r, g, b] for dark mode
  function mapRGB(r, g, b, a) {
    var hsl = rgb2hsl(r, g, b),
      h = hsl[0],
      s = hsl[1],
      l = hsl[2];
    if (s < 0.3) {
      // greys, whites, blacks and bluish-grey tints: flip the lightness and tint it a little cool
      if (l < 0.06 && a < 0.9) return [r, g, b]; // black with transparency = a shadow: keep
      var v = 0.045 + (1 - l) * 0.9;
      if (l > 0.93) v = 0.045 + (1 - l) * 0.5; // whites -> the page colour
      return [Math.min(255, v * 255 * 0.97), Math.min(255, v * 255 * 1.0), Math.min(255, v * 255 * 1.05)];
    }
    // saturated colours
    if (l > 0.8) return hsl2rgb(h, Math.min(0.5, s * 0.6), 0.14 + (1 - l) * 0.35); // pale tint (notice boxes): dark tint
    if (l < 0.3) return hsl2rgb(h, Math.min(1, s * 0.75), 0.78 - l * 0.4); // very dark ink colours (navy, brown): light
    if (l < 0.45) return hsl2rgb(h, s, l + 0.1); // dark data colours: a little brighter
    return [r, g, b];
  }

  var KEEP = { "#f0d9b5": 1, "#b58863": 1 }; // chess board squares keep their colours
  var cache = {};
  function mapCss(str) {
    // any CSS colour string -> dark-mode colour string
    if (cache[str]) return cache[str];
    if (KEEP[String(str).toLowerCase()]) return (cache[str] = str);
    var m = parseColor(str);
    if (!m) return (cache[str] = str);
    var c = mapRGB(m[0], m[1], m[2], m[3]);
    var out =
      m[3] < 1
        ? "rgba(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + "," + m[3] + ")"
        : "rgb(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + ")";
    return (cache[str] = out);
  }
  var probe = document.createElement("canvas").getContext("2d");
  var probeSet = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, "fillStyle");
  function parseColor(str) {
    if (typeof str !== "string") return null;
    var m = str.match(/^#([0-9a-f]{3,8})$/i);
    if (m) {
      var h = m[1];
      if (h.length === 3 || h.length === 4)
        h = h
          .split("")
          .map(function (c) {
            return c + c;
          })
          .join("");
      return [
        parseInt(h.substr(0, 2), 16),
        parseInt(h.substr(2, 2), 16),
        parseInt(h.substr(4, 2), 16),
        h.length === 8 ? parseInt(h.substr(6, 2), 16) / 255 : 1,
      ];
    }
    m = str.match(/^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+%?))?\s*\)$/i);
    if (m) {
      var al = m[4] === undefined ? 1 : m[4].slice(-1) === "%" ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
      return [+m[1], +m[2], +m[3], al];
    }
    // named colours, hsl(), ...: let the browser normalise them
    probeSet.set.call(probe, "#000");
    probeSet.set.call(probe, str);
    var norm = probeSet.get.call(probe);
    if (norm && norm !== str) return parseColor(norm);
    return null;
  }

  // ---------- state + parent theme ----------
  var T = (window.SBT = { dark: false, bg: BG, map: mapCss, mapRGB: mapRGB });
  function readTheme() {
    var t = null;
    try {
      if (window.parent !== window) t = window.parent.document.documentElement.getAttribute("data-theme");
    } catch (e) {}
    if (!t) {
      try {
        var s = localStorage.getItem("theme");
        if (s === "dark" || s === "light") t = s;
      } catch (e) {}
    }
    if (!t) t = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return t === "dark";
  }
  var first = true;
  function apply() {
    var d = readTheme();
    if (d === T.dark && !first) return;
    first = false;
    T.dark = d;
    root.classList.toggle("sb-dark", d);
    root.setAttribute("data-theme", d ? "dark" : "light");
    if (document.body) fixAll();
    try {
      window.dispatchEvent(new Event("sb-theme"));
    } catch (e) {}
  }

  // ---------- canvas: remap colours in dark mode ----------
  ["fillStyle", "strokeStyle"].forEach(function (prop) {
    var d = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, prop);
    Object.defineProperty(CanvasRenderingContext2D.prototype, prop, {
      configurable: true,
      get: d.get,
      set: function (v) {
        d.set.call(this, T.dark && typeof v === "string" ? mapCss(v) : v);
      },
    });
  });
  var acs = CanvasGradient.prototype.addColorStop;
  CanvasGradient.prototype.addColorStop = function (o, c) {
    return acs.call(this, o, T.dark && typeof c === "string" ? mapCss(c) : c);
  };
  var scd = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, "shadowColor");
  if (scd)
    Object.defineProperty(CanvasRenderingContext2D.prototype, "shadowColor", {
      configurable: true,
      get: scd.get,
      set: function (v) {
        scd.set.call(this, T.dark && typeof v === "string" ? mapCss(v) : v);
      },
    });

  // ---------- CSS: a dark copy of every colour rule ----------
  var COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g;
  function darkText(rule) {
    var st = rule.style,
      out = [],
      i;
    for (i = 0; i < st.length; i++) {
      var name = st[i],
        val = st.getPropertyValue(name);
      if (!val || !COLOR_RE.test(val)) {
        COLOR_RE.lastIndex = 0;
        continue;
      }
      COLOR_RE.lastIndex = 0;
      var mapped = val.replace(COLOR_RE, function (c) {
        return mapCss(c);
      });
      if (mapped !== val) out.push(name + ":" + mapped + (st.getPropertyPriority(name) ? " !important" : ""));
    }
    return out.length ? out.join(";") : "";
  }
  function prefix(sel) {
    return sel
      .split(",")
      .map(function (s) {
        s = s.trim();
        if (/^(html|:root)$/i.test(s)) return "html.sb-dark";
        return "html.sb-dark " + s.replace(/^(html|:root)\s+/i, "");
      })
      .join(",");
  }
  function walk(rules, out) {
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (r.type === 1 && r.selectorText) {
        if (/^(:root|html)$/.test(r.selectorText.trim()) && r.style.getPropertyValue("--bg")) continue; // the variable block is handled by hand
        var t = darkText(r);
        if (t) out.push(prefix(r.selectorText) + "{" + t + "}");
      } else if (r.type === 4 && r.cssRules) {
        var inner = [];
        walk(r.cssRules, inner);
        if (inner.length) out.push("@media " + r.conditionText + "{" + inner.join("\n") + "}");
      }
    }
  }
  function buildDarkSheet() {
    var out = [];
    for (var s = 0; s < document.styleSheets.length; s++) {
      var sh = document.styleSheets[s];
      if (sh.ownerNode && sh.ownerNode.id === "sb-dark-css") continue;
      try {
        walk(sh.cssRules, out);
      } catch (e) {}
    }
    var el = document.createElement("style");
    el.id = "sb-dark-css";
    // hand-written variable block (the inline colours above are mapped automatically)
    el.textContent =
      "html.sb-dark{--ink:#d7dee6;--muted:#93a1ad;--line:#27313c;--bg:transparent;--panel:#121820;--navy:#cfe0ec;--mid:#161d26;--blue:#3aa3e4;--orange:#f7a23b;--red:#f2742d;--green:#43bd78;color-scheme:dark}\n" +
      "html.sb-embedded body{background:transparent}\nhtml.sb-embedded h1{display:none}\nhtml.sb-embedded #app{padding-top:4px}\nhtml.sb-embedded .blurb{display:none}\n" +
      out.join("\n");
    document.head.appendChild(el);
  }

  // ---------- inline colours (style="..." and SVG fill/stroke attributes, also those created by scripts) ----------
  var HAS_COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\(/;
  function fixEl(el) {
    var attrs = ["style", "fill", "stroke"];
    for (var i = 0; i < attrs.length; i++) {
      var a = attrs[i],
        v = el.getAttribute(a),
        key = "data-sb-o-" + a;
      if (T.dark) {
        if (v && HAS_COLOR.test(v) && !el.hasAttribute(key)) {
          var m = v.replace(COLOR_RE, function (c) {
            return mapCss(c);
          });
          if (m !== v) {
            el.setAttribute(key, v);
            el.setAttribute(a, m);
          }
        }
      } else if (el.hasAttribute(key)) {
        el.setAttribute(a, el.getAttribute(key));
        el.removeAttribute(key);
      }
    }
  }
  function fixAll() {
    var els = document.querySelectorAll("[style],[fill],[stroke],[data-sb-o-style],[data-sb-o-fill],[data-sb-o-stroke]");
    for (var i = 0; i < els.length; i++) fixEl(els[i]);
  }
  var fixTimer = 0;
  function scheduleFix() {
    if (fixTimer) return;
    fixTimer = requestAnimationFrame(function () {
      fixTimer = 0;
      fixAll();
    });
  }

  // embedded in the site: no page chrome of its own
  try {
    if (window.parent !== window) root.classList.add("sb-embedded");
  } catch (e) {}

  function boot() {
    buildDarkSheet();
    apply();
    fixAll();
    new MutationObserver(scheduleFix).observe(document.body, { childList: true, subtree: true });
    try {
      if (window.parent !== window) {
        new MutationObserver(apply).observe(window.parent.document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      }
    } catch (e) {}
    window.addEventListener("storage", apply);
    if (window.matchMedia) window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", apply);
  }
  // tell the site page how tall this playground is, so that the frame can grow with it
  function reportHeight() {
    try {
      if (window.parent === window) return;
      var h = Math.ceil(root.getBoundingClientRect().height);
      window.parent.postMessage({ sbPlayground: true, height: h }, "*");
    } catch (e) {}
  }
  window.addEventListener("load", function () {
    reportHeight();
    if (window.ResizeObserver) new ResizeObserver(reportHeight).observe(document.body);
  });

  // set the theme class as early as possible (no flash), the CSS copy follows when the page is parsed
  apply();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
