/*******************************************************************************
 * Loss-landscape module (shared by the About page and the faint backdrop on
 * every other page).
 *
 *   SBL.getSeed(create)          -> the landscape seed for this browser session
 *   SBL.newSeed()                -> pick (and store) a fresh seed
 *   SBL.makeSurface(seed)        -> { f, grad, h01, ... }  the random loss surface
 *   SBL.makeView(W, H, dpr)      -> projection from surface space to screen pixels
 *   SBL.drawMesh(ctx, ...)       -> draw the wire mesh (+ optional vertex dots)
 *   SBL.tracePath(surface, x, y) -> steepest-descent / ascent path through (x, y)
 *   SBL.hueFor(h01)              -> hue for a height (same green -> purple range as the ring)
 *   SBL.cycleHue(ms)             -> the slow colour-cycle hue (12 s loop, same as the landing page)
 *
 * It also keeps the SB logo ring colour-cycling on every page.
 ******************************************************************************/
(function () {
  "use strict";

  var SEED_KEY = "sb.seed";
  var HALF = 1.5; // the surface covers x, y in [-HALF, HALF]
  var CYCLE_MS = 12000;

  // ---------- seed: one landscape per browser session ----------
  function rnd32() {
    if (window.crypto && crypto.getRandomValues) {
      var a = new Uint32Array(1);
      crypto.getRandomValues(a);
      return a[0];
    }
    return (Math.random() * 4294967296) >>> 0;
  }
  function newSeed() {
    var s = rnd32();
    try {
      sessionStorage.setItem(SEED_KEY, String(s));
    } catch (e) {}
    return s;
  }
  function getSeed(create) {
    try {
      var v = sessionStorage.getItem(SEED_KEY);
      if (v !== null && v !== "") return Number(v) >>> 0;
    } catch (e) {}
    return create === false ? null : newSeed();
  }
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------- the random loss surface ----------
  // a gentle bowl + a few wells (minima) and hills (maxima) + a couple of low waves, all from the seed
  function makeSurface(seed) {
    var r = mulberry32(seed);
    var rr = function (a, b) {
      return a + r() * (b - a);
    };
    var wells = 2 + Math.floor(r() * 3),
      hills = 2 + Math.floor(r() * 3);
    var bumps = [],
      i;
    for (i = 0; i < wells + hills; i++) {
      var well = i < wells;
      bumps.push({
        x: rr(-1.15, 1.15),
        y: rr(-1.15, 1.15),
        a: (well ? -1 : 1) * rr(0.45, 0.95),
        s: rr(0.26, 0.58),
        sy: rr(0.8, 1.25), // slightly elongated bumps
      });
    }
    var waves = [];
    for (i = 0; i < 2; i++) {
      var th = r() * Math.PI * 2;
      waves.push({ kx: Math.cos(th) * rr(1.8, 3.4), ky: Math.sin(th) * rr(1.8, 3.4), p: r() * 6.283, a: rr(0.05, 0.1) });
    }
    var bowl = rr(0.04, 0.1),
      tx = rr(-0.08, 0.08),
      ty = rr(-0.08, 0.08);

    function raw(x, y) {
      var z = bowl * (x * x + y * y) + tx * x + ty * y,
        k;
      for (k = 0; k < bumps.length; k++) {
        var b = bumps[k],
          dx = x - b.x,
          dy = (y - b.y) * b.sy;
        z += b.a * Math.exp(-(dx * dx + dy * dy) / (b.s * b.s));
      }
      for (k = 0; k < waves.length; k++) z += waves[k].a * Math.sin(waves[k].kx * x + waves[k].ky * y + waves[k].p);
      return z;
    }
    // normalise the height range once
    var zmin = Infinity,
      zmax = -Infinity,
      n = 48,
      j;
    for (i = 0; i <= n; i++)
      for (j = 0; j <= n; j++) {
        var z = raw(-HALF + (2 * HALF * i) / n, -HALF + (2 * HALF * j) / n);
        if (z < zmin) zmin = z;
        if (z > zmax) zmax = z;
      }
    var span = zmax - zmin || 1,
      ZH = 0.95; // world height of the full range
    function f(x, y) {
      return ((raw(x, y) - zmin) / span - 0.5) * ZH;
    }
    function h01(x, y) {
      return (raw(x, y) - zmin) / span;
    }
    var e = 0.004;
    function grad(x, y, out) {
      out[0] = (f(x + e, y) - f(x - e, y)) / (2 * e);
      out[1] = (f(x, y + e) - f(x, y - e)) / (2 * e);
      return out;
    }
    return { seed: seed, f: f, h01: h01, grad: grad, half: HALF };
  }

  // ---------- colours ----------
  function hueFor(h01) {
    return 150 + Math.min(1, Math.max(0, h01)) * 125;
  } // low = green, high = purple (the ring's range)
  function cycleHue(ms) {
    var m = 0.5 - 0.5 * Math.cos(((ms % CYCLE_MS) / CYCLE_MS) * Math.PI * 2);
    return 150 + 125 * m;
  }

  // ---------- projection ----------
  // A tilted, slightly perspective view that fills the right side of the screen and runs off its edges.
  function makeView(W, H, dpr, seed) {
    var narrow = W / dpr < 760;
    var r = mulberry32((seed || 1) ^ 0x9e3779b9);
    var yaw = -0.56 + (r() - 0.5) * 0.22;
    var cyw = Math.cos(yaw),
      syw = Math.sin(yaw);
    var elev = 0.62; // how far the surface is tilted towards the viewer
    var ce = Math.cos(elev),
      se = Math.sin(elev);
    var s, cx, cy, persp;
    if (narrow) {
      s = W * 0.34;
      cx = W * 0.56;
      cy = H * 0.66;
      persp = 0.1;
    } else {
      s = Math.min(W * 0.235, H * 0.46);
      cx = W * 0.835;
      cy = H * 0.565;
      persp = 0.12;
    }
    function proj(x, y, z, out) {
      var X = x * cyw - y * syw,
        Y = x * syw + y * cyw;
      var p = 1 / (1 - persp * Y * 0.5); // nearer (lower on screen) = a little bigger
      out[0] = cx + X * s * p;
      out[1] = cy + (Y * se - z * ce) * s * p; // the ground is foreshortened, height lifts the point up the screen
      return out;
    }
    return { proj: proj, W: W, H: H, dpr: dpr, s: s, narrow: narrow };
  }

  // ---------- drawing ----------
  function lineColor(light, h01, a) {
    var h = hueFor(h01);
    return light ? "hsla(" + h.toFixed(0) + ",85%,40%," + a + ")" : "hsla(" + h.toFixed(0) + ",90%,64%," + a + ")";
  }
  // opts: { light, alpha (0..1), nodes (0..1 share of vertex dots), n (grid lines per axis) }
  function drawMesh(ctx, surf, view, opts) {
    opts = opts || {};
    var n = opts.n || 64,
      steps = n,
      light = !!opts.light,
      alpha = opts.alpha == null ? 1 : opts.alpha;
    var dpr = view.dpr,
      p = [0, 0],
      q = [0, 0],
      i,
      j,
      axis;
    var base = (light ? 0.5 : 0.42) * alpha;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(0.6, 0.85 * dpr);
    for (axis = 0; axis < 2; axis++) {
      for (j = 0; j <= n; j++) {
        var fixed = -HALF + (2 * HALF * j) / n;
        var px = 0,
          py = 0,
          ph = 0;
        for (i = 0; i <= steps; i++) {
          var mv = -HALF + (2 * HALF * i) / steps;
          var x = axis ? fixed : mv,
            y = axis ? mv : fixed;
          var h = surf.h01(x, y);
          view.proj(x, y, surf.f(x, y), q);
          if (i) {
            ctx.strokeStyle = lineColor(light, (h + ph) * 0.5, base);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(q[0], q[1]);
            ctx.stroke();
          }
          px = q[0];
          py = q[1];
          ph = h;
        }
      }
    }
    if (opts.nodes > 0) {
      // small bright dots where the lines cross
      var stride = Math.max(1, Math.round(1 / Math.max(0.05, opts.nodes)));
      var rad = Math.max(0.8, 1.0 * dpr);
      for (i = 0; i <= n; i += stride)
        for (j = 0; j <= n; j += stride) {
          var x2 = -HALF + (2 * HALF * i) / n,
            y2 = -HALF + (2 * HALF * j) / n;
          view.proj(x2, y2, surf.f(x2, y2), p);
          if (p[0] < -4 || p[1] < -4 || p[0] > view.W + 4 || p[1] > view.H + 4) continue;
          ctx.fillStyle = lineColor(light, surf.h01(x2, y2), Math.min(1, base * 1.9));
          ctx.beginPath();
          ctx.arc(p[0], p[1], rad, 0, 6.2832);
          ctx.fill();
        }
    }
    ctx.restore();
  }

  // ---------- path: steepest descent / ascent through a surface point ----------
  // returns { pts: [[x, y, z], ...] from the minimum, through the start point, to the maximum, iStart, iMin, iMax }
  function tracePath(surf, x0, y0) {
    var g = [0, 0],
      step = 0.02,
      max = 260;
    function walk(dir) {
      var x = x0,
        y = y0,
        out = [],
        k;
      for (k = 0; k < max; k++) {
        surf.grad(x, y, g);
        var m = Math.sqrt(g[0] * g[0] + g[1] * g[1]);
        if (m < 0.012) break; // flat: a minimum / maximum (or a plateau)
        var nx = x + (dir * step * g[0]) / m,
          ny = y + (dir * step * g[1]) / m;
        if (nx < -HALF || nx > HALF || ny < -HALF || ny > HALF) break;
        x = nx;
        y = ny;
        out.push([x, y, surf.f(x, y)]);
      }
      return out;
    }
    var up = walk(1),
      down = walk(-1),
      pts = [],
      i;
    for (i = down.length - 1; i >= 0; i--) pts.push(down[i]);
    var iStart = pts.length;
    pts.push([x0, y0, surf.f(x0, y0)]);
    for (i = 0; i < up.length; i++) pts.push(up[i]);
    return { pts: pts, iStart: iStart };
  }

  // ---------- keep the logo ring cycling on every page ----------
  function startLogoCycle() {
    var root = document.documentElement;
    function tick() {
      var h = cycleHue(performance.now());
      var light = root.getAttribute("data-theme") === "light";
      var l = light ? 40 : 62;
      root.style.setProperty("--sb-c1", "hsl(" + h.toFixed(1) + " 95% " + l + "%)");
      root.style.setProperty("--sb-c2", "hsl(" + ((h + 70) % 360).toFixed(1) + " 95% " + l + "%)");
      root.style.setProperty("--sb-glow", "hsla(" + h.toFixed(1) + ",95%," + l + "%,.35)");
    }
    tick();
    if (!window.matchMedia || !window.matchMedia("(prefers-reduced-motion: reduce)").matches) setInterval(tick, 120);
  }

  // ---------- backdrop for the secondary pages: fixed, follows the cursor over the whole page ----------
  // The mesh is painted once to an off-screen canvas; each frame only copies it and draws the
  // steepest-descent / ascent path through the point under the cursor (same idea as the About hero).
  function startBackdrop() {
    var cv = document.getElementById("sb-backdrop");
    if (!cv) return;
    var ctx = cv.getContext("2d"),
      mesh = document.createElement("canvas"),
      reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var surf = null,
      view = null,
      dpr = 1,
      W = 0,
      H = 0,
      light = false;
    var GRID = 40,
      VX = new Float32Array((GRID + 1) * (GRID + 1)),
      VY = new Float32Array((GRID + 1) * (GRID + 1));
    var mx = 0,
      my = 0,
      active = false,
      pt = null,
      pathAlpha = 0,
      path = null,
      pathPts = [],
      lastKey = "",
      raf = 0,
      timer = 0,
      tp = [0, 0];

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.floor(innerWidth * dpr);
      H = Math.floor(innerHeight * dpr);
      cv.width = mesh.width = W;
      cv.height = mesh.height = H;
      light = document.documentElement.getAttribute("data-theme") === "light";
      var seed = getSeed(true);
      surf = makeSurface(seed);
      view = makeView(W, H, dpr, seed);
      var mctx = mesh.getContext("2d");
      mctx.clearRect(0, 0, W, H);
      drawMesh(mctx, surf, view, { light: light, alpha: 1, n: 44, nodes: 0.25 });
      var cell = (2 * HALF) / GRID,
        a,
        b,
        k = 0;
      for (a = 0; a <= GRID; a++)
        for (b = 0; b <= GRID; b++, k++) {
          var x = -HALF + cell * a,
            y = -HALF + cell * b;
          view.proj(x, y, surf.f(x, y), tp);
          VX[k] = tp[0];
          VY[k] = tp[1];
        }
      path = null;
      pathPts = [];
      lastKey = "";
      pathAlpha = 0;
      paint();
    }

    function pick(px, py) {
      var best = -1,
        bd = Infinity,
        n = VX.length,
        i;
      for (i = 0; i < n; i++) {
        var dx = VX[i] - px,
          dy = VY[i] - py,
          d = dx * dx + dy * dy;
        if (d < bd) {
          bd = d;
          best = i;
        }
      }
      if (best < 0) return null;
      var cell = (2 * HALF) / GRID,
        x = -HALF + cell * Math.floor(best / (GRID + 1)),
        y = -HALF + cell * (best % (GRID + 1)),
        step = cell * 0.6,
        bestD = bd;
      for (var it = 0; it < 7; it++) {
        var improved = false;
        for (var k = 0; k < 8; k++) {
          var ang = k * 0.7853982,
            nx = x + Math.cos(ang) * step,
            ny = y + Math.sin(ang) * step;
          if (nx < -HALF || nx > HALF || ny < -HALF || ny > HALF) continue;
          view.proj(nx, ny, surf.f(nx, ny), tp);
          var d2 = (tp[0] - px) * (tp[0] - px) + (tp[1] - py) * (tp[1] - py);
          if (d2 < bestD) {
            bestD = d2;
            x = nx;
            y = ny;
            improved = true;
          }
        }
        if (!improved) step *= 0.5;
      }
      var reach = 90 * dpr; // the cursor has to be near the surface
      return bestD < reach * reach ? { x: x, y: y } : null;
    }

    function step() {
      var target = active ? pick(mx * dpr, my * dpr) : null;
      if (target) {
        if (!pt) pt = { x: target.x, y: target.y };
        else {
          pt.x += (target.x - pt.x) * 0.3;
          pt.y += (target.y - pt.y) * 0.3;
        }
        pathAlpha += (1 - pathAlpha) * 0.2;
        var key = pt.x.toFixed(3) + "," + pt.y.toFixed(3);
        if (key !== lastKey) {
          lastKey = key;
          path = tracePath(surf, pt.x, pt.y);
          pathPts = path.pts.map(function (q) {
            view.proj(q[0], q[1], q[2], tp);
            return [tp[0], tp[1], surf.h01(q[0], q[1])];
          });
        }
      } else {
        pathAlpha *= 0.86;
        if (pathAlpha < 0.01) {
          pathAlpha = 0;
          pt = null;
          path = null;
          pathPts = [];
          lastKey = "";
        }
      }
      paint();
      raf = active || pathAlpha > 0 ? requestAnimationFrame(step) : 0;
    }

    function paint() {
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(mesh, 0, 0);
      if (!path || pathPts.length < 2 || pathAlpha <= 0.003) return;
      var n = pathPts.length,
        i,
        hc = cycleHue(performance.now());
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = pathAlpha * (light ? 0.5 : 0.65);
      ctx.shadowColor = "hsla(" + hc.toFixed(0) + ",100%," + (light ? 42 : 60) + "%,0.95)";
      ctx.shadowBlur = (light ? 14 : 22) * dpr;
      ctx.strokeStyle = "hsla(" + hc.toFixed(0) + ",100%," + (light ? 42 : 62) + "%,0.9)";
      ctx.lineWidth = 3.4 * dpr;
      ctx.beginPath();
      ctx.moveTo(pathPts[0][0], pathPts[0][1]);
      for (i = 1; i < n; i++) ctx.lineTo(pathPts[i][0], pathPts[i][1]);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
      ctx.globalAlpha = pathAlpha;
      ctx.lineWidth = 2.1 * dpr;
      for (i = 1; i < n; i++) {
        var h = hueFor((pathPts[i][2] + pathPts[i - 1][2]) * 0.5);
        ctx.strokeStyle = light ? "hsl(" + h.toFixed(0) + ",92%,34%)" : "hsl(" + h.toFixed(0) + ",100%,72%)";
        ctx.beginPath();
        ctx.moveTo(pathPts[i - 1][0], pathPts[i - 1][1]);
        ctx.lineTo(pathPts[i][0], pathPts[i][1]);
        ctx.stroke();
      }
      function dot(q, hue) {
        ctx.fillStyle = light ? "hsl(" + hue + ",92%,36%)" : "hsl(" + hue + ",100%,70%)";
        ctx.beginPath();
        ctx.arc(q[0], q[1], 3.6 * dpr, 0, 6.2832);
        ctx.fill();
        ctx.strokeStyle = light ? "hsla(" + hue + ",92%,36%,.55)" : "hsla(" + hue + ",100%,75%,.6)";
        ctx.lineWidth = 1.2 * dpr;
        ctx.beginPath();
        ctx.arc(q[0], q[1], 7.6 * dpr, 0, 6.2832);
        ctx.stroke();
      }
      dot(pathPts[0], 150);
      dot(pathPts[n - 1], 275);
      var mid = pathPts[path.iStart] || pathPts[0];
      ctx.fillStyle = light ? "#0a0e14" : "#ffffff";
      ctx.beginPath();
      ctx.arc(mid[0], mid[1], 3.2 * dpr, 0, 6.2832);
      ctx.fill();
      ctx.restore();
    }

    function kick() {
      if (!raf && !reduce) raf = requestAnimationFrame(step);
    }
    window.addEventListener(
      "pointermove",
      function (e) {
        if (e.pointerType === "touch") return;
        mx = e.clientX;
        my = e.clientY;
        active = true;
        kick();
      },
      { passive: true }
    );
    document.addEventListener("pointerleave", function () {
      active = false;
      kick();
    });
    window.addEventListener(
      "touchmove",
      function (e) {
        if (!e.touches[0]) return;
        mx = e.touches[0].clientX;
        my = e.touches[0].clientY;
        active = true;
        kick();
      },
      { passive: true }
    );
    window.addEventListener(
      "touchend",
      function () {
        setTimeout(function () {
          active = false;
          kick();
        }, 900);
      },
      { passive: true }
    );
    build();
    window.addEventListener("resize", function () {
      clearTimeout(timer);
      timer = setTimeout(build, 150);
    });
    new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(build, 30);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  window.SBL = {
    HALF: HALF,
    getSeed: getSeed,
    newSeed: newSeed,
    mulberry32: mulberry32,
    makeSurface: makeSurface,
    makeView: makeView,
    drawMesh: drawMesh,
    tracePath: tracePath,
    hueFor: hueFor,
    cycleHue: cycleHue,
    lineColor: lineColor,
  };

  function boot() {
    startLogoCycle();
    startBackdrop();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
