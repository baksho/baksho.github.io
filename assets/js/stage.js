/*******************************************************************************
 * About page stage
 *
 *   1. the particle-ring landing page (shown once per browser session)
 *   2. on "enter": the ring's particles fly into a randomly generated loss landscape
 *   3. the landscape: hover to highlight a path from a minimum, through the cursor, to a maximum
 *   4. scrolling: the name, role line and icons dock into the page header
 *
 * The ring renderer below is the locked landing page, unchanged except for how it
 * hands over to the landscape (and that it reads the site's theme).
 * Needs landscape.js (window.SBL).
 ******************************************************************************/
(function () {
  "use strict";
  var SBL = window.SBL;
  var canvas = document.getElementById("sbStage");
  var hero = document.getElementById("sbHero");
  if (!SBL || !canvas || !hero) return;

  var root = document.documentElement;
  var landingEl = document.getElementById("sbLanding");
  var ENTERED_KEY = "sb.entered";
  var alreadyEntered = false;
  try {
    alreadyEntered = sessionStorage.getItem(ENTERED_KEY) === "1";
  } catch (e) {}
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // ---------- Tunable settings ----------
  var CFG = {
    leaveMs: 750, // the ring swells for this long, then the particles take off
    holdMs: 1200, // how long to press and hold to enter
    command: "cd suvinava", // typed command that enters
    cycleMs: 12000, // label color cycle length

    flyMs: reduceMotion ? 500 : 2600, // particles travelling into the landscape
    linesAt: 0.72, // (share of flyMs) when the mesh lines start to fade in
    settleMs: reduceMotion ? 300 : 1100, // fade-in of the lines / fade-out of the travelling particles
    gridLines: 64, // landscape grid lines per direction

    layers: 3,
    rows: 44,
    cols: 330,
    dust: 3000,
    ringScale: 0.31, // overall ring size
    speed: 1.0,

    gain: 2.3, // overall brightness of the particles
    bloom: 1.0, // glow strength

    mouseRadius: 0.13, // size of the void around the cursor (smaller = tighter)
    mouseForce: 0.45, // how hard the cursor pushes particles
    mouseLight: 2.2, // how much particles brighten near the cursor
    mouseGlow: 0.12, // soft light halo at the cursor

    inkGlow: 1.0, // LIGHT MODE only: strength of the colored glow around the dots (0 = off)
    inkMouseGlow: 0.14, // LIGHT MODE only: colored glow at the cursor
  };

  var ctx = canvas.getContext("2d");

  // bloom levels (1/4, 1/8, 1/16 resolution)
  var levels = [2, 3, 4].map(function (sh) {
    var c = document.createElement("canvas");
    return { c: c, x: c.getContext("2d"), sh: sh };
  });
  var BLOOM_W = [0.55, 0.7, 0.85];

  var W, H, dpr, img, bytes, u32, baseScale, cx, cy;
  var isLight = function () {
    return root.getAttribute("data-theme") === "light";
  };
  var light = isLight();
  var pendingResize = false,
    lastResizeAt = 0;
  // user settings from the slider panels: 0..1, where 1 (slider at 100) is the original look
  var DEF = { glow: 0.75, density: 0.7, brightness: 0.95, detail: 0.85 }; // default slider positions (100 = the full original look)
  var S = Object.assign({}, DEF);
  try {
    var saved = JSON.parse(localStorage.getItem("ringSettings") || "{}");
    for (var key in S) if (typeof saved[key] === "number" && isFinite(saved[key])) S[key] = Math.min(1, Math.max(0, saved[key]));
  } catch (_) {}
  var detailScale = function () {
    return 1 - (1 - S.detail) * 0.5;
  }; // detail: render resolution 100% .. 50%
  var cycH = 150; // current hue of the label color cycle
  var BG = ((255 << 24) | (10 << 16) | (6 << 8) | 4) >>> 0;
  var BG_CSS_DARK = "#04060a",
    BG_CSS_LIGHT = "#f8fafc";
  // light mode: the dots are painted on a transparent layer, so their colored glow can be blurred separately
  var ink = document.createElement("canvas");
  var inkCtx = ink.getContext("2d");
  var mkLayer = function () {
    var c = document.createElement("canvas");
    return { c: c, x: c.getContext("2d") };
  };
  var lHalf = mkLayer(),
    lA = mkLayer(),
    lB = mkLayer(),
    lC = mkLayer(),
    lGlow = mkLayer(); // 1/2, 1/4, 1/8, 1/16, combined 1/4

  // phases: 'ring' (the landing page) -> 'capture' (one frame: remember where every particle is)
  //         -> 'morph' (particles fly to the landscape) -> 'land' (the interactive landscape)
  var phase = alreadyEntered ? "land" : "ring";
  var morphStart = 0,
    landSince = 0;
  var tmx = -9999,
    tmy = -9999,
    mx = -9999,
    my = -9999; // pointer in canvas pixels

  function resize() {
    var oldDpr = dpr;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5) * detailScale();
    if (oldDpr && oldDpr !== dpr && tmx > -9000) {
      // keep the cursor where it is when the render scale changes
      var r = dpr / oldDpr;
      tmx *= r;
      tmy *= r;
      mx *= r;
      my *= r;
    }
    var cw = hero.clientWidth || innerWidth,
      ch = hero.clientHeight || innerHeight;
    W = Math.floor(cw * dpr);
    H = Math.floor(ch * dpr);
    canvas.width = W;
    canvas.height = H;
    ink.width = W;
    ink.height = H;
    [
      [lHalf, 1],
      [lA, 2],
      [lB, 3],
      [lC, 4],
      [lGlow, 2],
    ].forEach(function (p) {
      p[0].c.width = Math.max(2, W >> p[1]);
      p[0].c.height = Math.max(2, H >> p[1]);
    });
    levels.forEach(function (L) {
      L.c.width = Math.max(2, W >> L.sh);
      L.c.height = Math.max(2, H >> L.sh);
    });
    img = ctx.createImageData(W, H);
    bytes = img.data;
    u32 = new Uint32Array(bytes.buffer);
    baseScale = Math.min(W, H) * CFG.ringScale;
    cx = W * 0.5;
    cy = H * 0.5 - 21 * dpr; // ring sits 21px above true center
    if (phase !== "ring") {
      buildLandscape();
    }
    dirty = true;
  }

  // ---------- Hue -> RGB lookup (vivid) ----------
  var LUT = new Float32Array(361 * 3);
  (function () {
    var s = 1.0,
      l = 0.6;
    for (var h = 0; h <= 360; h++) {
      var a = s * Math.min(l, 1 - l);
      var f = function (n) {
        var k = (n + h / 30) % 12;
        return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      };
      LUT[h * 3] = f(0) * 255;
      LUT[h * 3 + 1] = f(8) * 255;
      LUT[h * 3 + 2] = f(4) * 255;
    }
  })();

  // light mode: deeper, more saturated versions of the same hues (drawn as ink on white)
  var LUTL = new Float32Array(361 * 3);
  (function () {
    var s = 1.0,
      l = 0.44;
    for (var h = 0; h <= 360; h++) {
      var a = s * Math.min(l, 1 - l);
      var f = function (n) {
        var k = (n + h / 30) % 12;
        return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      };
      LUTL[h * 3] = f(0) * 255;
      LUTL[h * 3 + 1] = f(8) * 255;
      LUTL[h * 3 + 2] = f(4) * 255;
    }
  })();
  function blend(i, r, g, b, a) {
    // paint one ink dot onto the transparent ink layer (no divisions)
    if (a <= 0.004) return;
    var da = bytes[i + 3];
    if (da === 0) {
      // empty pixel: just write the dot
      bytes[i] = r;
      bytes[i + 1] = g;
      bytes[i + 2] = b;
      bytes[i + 3] = a * 255;
      return;
    }
    bytes[i] += (r - bytes[i]) * a; // overlapping dots: mix toward the new color
    bytes[i + 1] += (g - bytes[i + 1]) * a;
    bytes[i + 2] += (b - bytes[i + 2]) * a;
    bytes[i + 3] = da + (255 - da) * a;
  }

  // ---------- Particles ----------
  var bandCount = CFG.layers * CFG.rows * CFG.cols;
  var N = bandCount + CFG.dust;
  var U = new Float32Array(N),
    Wd = new Float32Array(N),
    Dm = new Float32Array(N),
    Jy = new Float32Array(N),
    Ly = new Uint8Array(N),
    OX = new Float32Array(N),
    OY = new Float32Array(N),
    Rn = new Float32Array(N); // random rank per particle, used by the density slider
  (function () {
    var i = 0,
      l,
      r,
      c;
    var step = (Math.PI * 2) / CFG.cols;
    for (l = 0; l < CFG.layers; l++) {
      for (r = 0; r < CFG.rows; r++) {
        var w = -1 + (2 * r) / (CFG.rows - 1);
        for (c = 0; c < CFG.cols; c++, i++) {
          U[i] = c * step + (r % 2) * step * 0.5 + (Math.random() - 0.5) * step * 0.35;
          Wd[i] = w + (Math.random() - 0.5) * 0.02;
          Dm[i] = 0.75 + Math.random() * 0.25;
          Ly[i] = l;
        }
      }
    }
    for (var d = 0; d < CFG.dust; d++, i++) {
      U[i] = Math.random() * Math.PI * 2;
      var sgn = Math.random() < 0.5 ? -1 : 1;
      Wd[i] = sgn * (1.1 + Math.pow(Math.random(), 1.6) * 1.8);
      Dm[i] = 0.35 + Math.random() * 0.3;
      Jy[i] = (Math.random() - 0.5) * 0.25;
      Ly[i] = (Math.random() * CFG.layers) | 0;
    }
    for (var j = 0; j < N; j++) Rn[j] = Math.random() * 0.9999; // always < 1, so density 100% keeps every particle
  })();

  // morph data, filled when the ring hands over to the landscape
  var SX = new Float32Array(N),
    SY = new Float32Array(N),
    SH = new Float32Array(N),
    SI = new Float32Array(N),
    DR = new Uint8Array(N);
  var TX = new Float32Array(N),
    TY = new Float32Array(N),
    TH = new Float32Array(N);
  var DL = new Float32Array(N),
    CU = new Float32Array(N);

  // ---------- Pointer + entering ----------
  var active = false,
    pulse = 0;
  var tiltX = 0,
    tiltY = 0,
    ttx = 0,
    tty = 0;
  var leaving = false,
    leaveStart = 0;
  var holding = false,
    holdStart = 0,
    holdTimer = 0,
    holdLevel = 0;
  var dirty = true;

  var enterBtn = document.getElementById("sbEnterBtn");
  var typedEl = document.getElementById("sbTyped");
  var msgEl = document.getElementById("sbMsg");

  function setPointer(e) {
    var rect = canvas.getBoundingClientRect();
    var x = (e.clientX - rect.left) * (W / (rect.width || 1)),
      y = (e.clientY - rect.top) * (H / (rect.height || 1));
    if (!active) {
      mx = x;
      my = y;
    }
    tmx = x;
    tmy = y;
    active = true;
    dirty = true;
    ttx = ((e.clientX - rect.left) / (rect.width || 1) - 0.5) * 2;
    tty = ((e.clientY - rect.top) / (rect.height || 1) - 0.5) * 2;
  }
  function cancelHold() {
    holding = false;
    clearTimeout(holdTimer);
  }
  function pointerOut() {
    active = false;
    tmx = tmy = -9999;
    ttx = tty = 0;
    cancelHold();
    dirty = true;
  }

  // Enter the site. fromHold: the ring has already swollen while holding,
  // so the transition continues from where the hold left off.
  function enter(fromHold) {
    if (leaving || phase !== "ring") return;
    cancelHold();
    leaving = true;
    var offset = fromHold ? CFG.leaveMs * 0.6 : 0;
    leaveStart = performance.now() - offset;
    pulse = 1;
    SBL.newSeed(); // a new landscape for every visit that enters
    try {
      sessionStorage.setItem(ENTERED_KEY, "1");
    } catch (_) {}
    if (landingEl) landingEl.classList.add("leaving");
    setTimeout(buildLandscape, 0); // prepare the mesh while the ring swells
  }

  // ---- mouse / touch: click = pulse, press and hold = enter ----
  window.addEventListener("pointermove", function (e) {
    if (phase === "ring" || phase === "land") setPointer(e);
  });
  window.addEventListener("pointerdown", function (e) {
    if (phase !== "ring") return;
    if (e.target.closest && e.target.closest("#sbEnterBtn, #sbThemeBtn, .sb-dock")) return; // buttons and sliders have their own handlers
    setPointer(e);
    if (leaving) return;
    pulse = 1; // every click pulses
    cancelHold();
    holding = true;
    holdStart = performance.now();
    holdTimer = setTimeout(function () {
      enter(true);
    }, CFG.holdMs);
  });
  window.addEventListener("pointerup", cancelHold);
  window.addEventListener("pointercancel", cancelHold);
  window.addEventListener("blur", cancelHold);
  window.addEventListener("pointerleave", pointerOut);
  document.addEventListener("mouseleave", pointerOut);
  canvas.addEventListener("contextmenu", function (e) {
    if (phase === "ring") e.preventDefault();
  });

  // ---- [ enter → ] button ----
  if (enterBtn)
    enterBtn.addEventListener("click", function () {
      enterBtn.blur();
      enter(false);
    });

  // ---- type "cd suvinava" + Enter ----
  var buf = "",
    msgTimer = 0;
  function showTyped() {
    if (typedEl) typedEl.textContent = buf;
  }
  function notFound() {
    buf = "";
    showTyped();
    if (msgEl) msgEl.classList.add("show");
    clearTimeout(msgTimer);
    msgTimer = setTimeout(function () {
      if (msgEl) msgEl.classList.remove("show");
    }, 1300);
  }
  var themeBtn = document.getElementById("sbThemeBtn");
  window.addEventListener("keydown", function (e) {
    if (phase !== "ring" || !landingEl || leaving || e.ctrlKey || e.metaKey || e.altKey) return;
    var key = e.key;
    if (key === "Enter") {
      if (!buf.trim()) return; // nothing typed: leave Enter to a focused button
      e.preventDefault();
      var cmd = buf.trim().toLowerCase().replace(/\s+/g, " ");
      if (cmd === CFG.command) enter(false);
      else notFound();
      return;
    }
    if (key === "Backspace") {
      e.preventDefault();
      buf = buf.slice(0, -1);
      showTyped();
      if (msgEl) msgEl.classList.remove("show");
      return;
    }
    if (key.length === 1) {
      // printable character
      var ae = document.activeElement;
      if (ae && ae !== document.body && ae.closest && (ae === enterBtn || ae === themeBtn || ae.closest(".sb-dock"))) ae.blur();
      e.preventDefault();
      if (buf.length < 28) {
        buf += key;
        showTyped();
      }
      if (msgEl) msgEl.classList.remove("show");
    }
  });

  // ---- theme toggle: uses the site's theme (system -> light -> dark -> system) ----
  function syncTheme() {
    light = isLight();
    var pref = root.getAttribute("data-theme-setting") || "system";
    if (themeBtn) {
      themeBtn.dataset.pref = pref;
      var NEXT = { system: "light", light: "dark", dark: "system" };
      var label = "Theme: " + pref + ". Click for " + NEXT[pref];
      themeBtn.setAttribute("aria-label", label);
      themeBtn.title = label;
    }
    if (phase !== "ring") {
      buildLandscape();
    }
    dirty = true;
  }
  if (themeBtn)
    themeBtn.addEventListener("click", function (e) {
      if (typeof toggleThemeSetting === "function") toggleThemeSetting();
      if (e.detail) themeBtn.blur(); // mouse click: don't keep focus (keyboard users keep it)
    });
  new MutationObserver(syncTheme).observe(root, { attributes: true, attributeFilter: ["data-theme", "data-theme-setting"] });

  // ---- settings panels: glow + brightness (left), density + detail (right) ----
  var docks = [].slice.call(document.querySelectorAll(".sb-dock"));
  var sliders = [].slice.call(document.querySelectorAll(".sb-vs input"));
  var canHover = window.matchMedia("(hover: hover)").matches;
  var saveTimer = 0,
    settingsDirty = false; // settingsDirty = the visitor has changed something
  function saveSettings() {
    try {
      localStorage.setItem("ringSettings", JSON.stringify(S));
    } catch (_) {}
  }
  // also save when the page is closed / left / hidden, so a very recent change is never lost
  window.addEventListener("pagehide", function () {
    if (settingsDirty) saveSettings();
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && settingsDirty) saveSettings();
  });
  function showSlider(inp) {
    inp.style.setProperty("--p", inp.value + "%");
    var out = document.querySelector('.sb-val[data-v="' + inp.dataset.k + '"]');
    if (out) out.textContent = inp.value;
  }
  function applySlider(inp) {
    S[inp.dataset.k] = inp.value / 100;
    settingsDirty = true;
    showSlider(inp);
    if (inp.dataset.k === "detail") pendingResize = true; // render resolution is applied on the next frame
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveSettings, 300);
  }
  sliders.forEach(function (inp) {
    inp.value = Math.round(S[inp.dataset.k] * 100);
    showSlider(inp);
    inp.addEventListener("input", function () {
      applySlider(inp);
    });
    inp.addEventListener("dblclick", function () {
      inp.value = Math.round(DEF[inp.dataset.k] * 100);
      applySlider(inp);
    }); // double-click: back to default
    inp.addEventListener("pointerup", function (e) {
      if (e.pointerType === "mouse") inp.blur();
    }); // let the panel close when the mouse leaves
  });
  [].forEach.call(document.querySelectorAll(".sb-reset"), function (btn) {
    btn.addEventListener("click", function () {
      [].forEach.call(btn.closest(".sb-panel").querySelectorAll("input"), function (inp) {
        inp.value = Math.round(DEF[inp.dataset.k] * 100);
        applySlider(inp);
      });
      btn.blur();
    });
  });
  function closeDocks(except) {
    docks.forEach(function (d) {
      if (d !== except) d.classList.remove("open");
    });
  }
  docks.forEach(function (d) {
    var btn = d.querySelector(".sb-dockBtn");
    btn.addEventListener("click", function (e) {
      if (e.detail && canHover) {
        btn.blur();
        return;
      } // mouse on a hover device: the panel opens on hover
      closeDocks(d);
      d.classList.toggle("open"); // touch screens / keyboard: tap to open and close
    });
  });
  document.addEventListener("pointerdown", function (e) {
    if (!e.target.closest(".sb-dock")) closeDocks();
  });

  // ---- label color: slow loop through the ring's hue range (green -> purple -> green) ----
  (function labelColor() {
    function tick(ts) {
      var h = SBL.cycleHue(ts).toFixed(1);
      cycH = +h;
      if (light) {
        // slightly deeper so it reads on white
        root.style.setProperty("--c", "hsl(" + h + " 100% 38%)");
        root.style.setProperty("--cg", "hsla(" + h + ", 100%, 38%, .3)");
        root.style.setProperty("--cb", "hsla(" + h + ", 100%, 38%, .12)");
      } else {
        root.style.setProperty("--c", "hsl(" + h + " 100% 60%)");
        root.style.setProperty("--cg", "hsla(" + h + ", 100%, 60%, .55)");
        root.style.setProperty("--cb", "hsla(" + h + ", 100%, 60%, .14)");
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  // =====================================================================
  //  Landscape: mesh cache, vertex grid, hover path
  // =====================================================================
  var surf = null,
    view = null;
  var meshCv = document.createElement("canvas"),
    meshGlowCv = document.createElement("canvas"),
    glowTmp = document.createElement("canvas");
  var GRID = 72,
    VX = new Float32Array((GRID + 1) * (GRID + 1)),
    VY = new Float32Array((GRID + 1) * (GRID + 1));
  var lastMeshKey = "";

  function buildLandscape() {
    if (!W) return;
    var seed = SBL.getSeed(true);
    var key = [seed, W, H, light ? 1 : 0, S.brightness.toFixed(2), S.density.toFixed(2)].join("|");
    if (key === lastMeshKey && surf) return;
    lastMeshKey = key;
    surf = SBL.makeSurface(seed);
    view = SBL.makeView(W, H, dpr, seed);
    meshCv.width = W;
    meshCv.height = H;
    var mctx = meshCv.getContext("2d");
    mctx.clearRect(0, 0, W, H);
    var bMulL = 1 - (1 - S.brightness) * 0.6; // brightness slider -> line strength
    SBL.drawMesh(mctx, surf, view, { light: light, alpha: bMulL, nodes: 0.25 + 0.75 * S.density, n: CFG.gridLines });
    // soft colored glow = the mesh blurred by shrinking it twice
    var w4 = Math.max(2, W >> 2),
      h4 = Math.max(2, H >> 2),
      w8 = Math.max(2, W >> 3),
      h8 = Math.max(2, H >> 3);
    glowTmp.width = w8;
    glowTmp.height = h8;
    var gt = glowTmp.getContext("2d");
    gt.imageSmoothingEnabled = true;
    gt.clearRect(0, 0, w8, h8);
    gt.drawImage(meshCv, 0, 0, w8, h8);
    meshGlowCv.width = w4;
    meshGlowCv.height = h4;
    var gg = meshGlowCv.getContext("2d");
    gg.imageSmoothingEnabled = true;
    gg.clearRect(0, 0, w4, h4);
    gg.drawImage(glowTmp, 0, 0, w4, h4);
    // screen position of every vertex (for finding the surface point under the cursor)
    var p = [0, 0],
      i,
      j,
      n = 0;
    for (i = 0; i <= GRID; i++)
      for (j = 0; j <= GRID; j++, n++) {
        var x = -SBL.HALF + (2 * SBL.HALF * i) / GRID,
          y = -SBL.HALF + (2 * SBL.HALF * j) / GRID;
        view.proj(x, y, surf.f(x, y), p);
        VX[n] = p[0];
        VY[n] = p[1];
      }
    computeTargets();
    dirty = true;
  }

  // where each particle will end up: spread over the grid lines of the landscape
  function computeTargets() {
    if (!surf || !view) return;
    var G = CFG.gridLines,
      LN = 2 * (G + 1),
      p = [0, 0];
    for (var i = 0; i < N; i++) {
      var li = i % LN,
        axis = li < G + 1 ? 0 : 1,
        j = li % (G + 1);
      var t = (Math.floor(i / LN) * 0.6180339887 + li * 0.37) % 1; // spread along the line; each line is offset so the dots do not align
      var fixed = -SBL.HALF + (2 * SBL.HALF * j) / G,
        mv = -SBL.HALF + 2 * SBL.HALF * t;
      var x = axis ? fixed : mv,
        y = axis ? mv : fixed;
      view.proj(x, y, surf.f(x, y), p);
      TX[i] = p[0];
      TY[i] = p[1];
      TH[i] = SBL.hueFor(surf.h01(x, y));
    }
  }

  // ---- hover path ----
  var surfPt = null; // smoothed surface point under the cursor {x, y}
  var pathAlpha = 0,
    path = null,
    pathPts = [],
    lastPathKey = "";
  var tp = [0, 0];

  function pickSurfacePoint(px, py) {
    var best = -1,
      bd = Infinity,
      n = (GRID + 1) * (GRID + 1),
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
    var cell = (2 * SBL.HALF) / GRID;
    var x = -SBL.HALF + cell * Math.floor(best / (GRID + 1)),
      y = -SBL.HALF + cell * (best % (GRID + 1));
    var step = cell * 0.6,
      bestD = bd;
    for (var it = 0; it < 7; it++) {
      // refine between the vertices
      var improved = false;
      for (var k = 0; k < 8; k++) {
        var a = k * 0.7853982,
          nx = x + Math.cos(a) * step,
          ny = y + Math.sin(a) * step;
        if (nx < -SBL.HALF || nx > SBL.HALF || ny < -SBL.HALF || ny > SBL.HALF) continue;
        view.proj(nx, ny, surf.f(nx, ny), tp);
        var d = (tp[0] - px) * (tp[0] - px) + (tp[1] - py) * (tp[1] - py);
        if (d < bestD) {
          bestD = d;
          x = nx;
          y = ny;
          improved = true;
        }
      }
      if (!improved) step *= 0.5;
    }
    var reach = 70 * dpr; // pointer is not over the landscape: no path
    return bestD < reach * reach ? { x: x, y: y } : null;
  }

  function updatePath() {
    var want = active && phase === "land" && surf && landIn > 0.6;
    var target = want ? pickSurfacePoint(mx, my) : null;
    if (target) {
      if (!surfPt) surfPt = { x: target.x, y: target.y };
      else {
        surfPt.x += (target.x - surfPt.x) * 0.28;
        surfPt.y += (target.y - surfPt.y) * 0.28;
      } // the path follows the cursor with a little drag
      pathAlpha += (1 - pathAlpha) * 0.2;
      var key = surfPt.x.toFixed(3) + "," + surfPt.y.toFixed(3);
      if (key !== lastPathKey) {
        lastPathKey = key;
        path = SBL.tracePath(surf, surfPt.x, surfPt.y);
        projectPath();
      }
    } else {
      pathAlpha *= 0.86;
      if (pathAlpha < 0.01) {
        pathAlpha = 0;
        surfPt = null;
        path = null;
        pathPts = [];
        lastPathKey = "";
      }
    }
  }
  function projectPath() {
    pathPts.length = 0;
    var p = [0, 0];
    for (var i = 0; i < path.pts.length; i++) {
      var q = path.pts[i];
      view.proj(q[0], q[1], q[2], p);
      pathPts.push([p[0], p[1], surf.h01(q[0], q[1])]);
    }
  }
  function drawPath(ts) {
    if (!path || pathPts.length < 2 || pathAlpha <= 0.003) return;
    var n = pathPts.length,
      i,
      g = S.glow,
      a = pathAlpha;
    var hCycle = SBL.cycleHue(ts);
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // soft glow: one wide stroke with a blurred shadow (cheap: a single path)
    if (g > 0.02) {
      ctx.globalAlpha = a * (light ? 0.5 : 0.65) * Math.min(1, 0.35 + g);
      ctx.shadowColor = "hsla(" + hCycle.toFixed(0) + ",100%," + (light ? 42 : 60) + "%,0.95)";
      ctx.shadowBlur = (light ? 16 : 24) * dpr * g;
      ctx.strokeStyle = "hsla(" + hCycle.toFixed(0) + ",100%," + (light ? 42 : 62) + "%,0.9)";
      ctx.lineWidth = 3.4 * dpr;
      ctx.beginPath();
      ctx.moveTo(pathPts[0][0], pathPts[0][1]);
      for (i = 1; i < n; i++) ctx.lineTo(pathPts[i][0], pathPts[i][1]);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
    }
    // bright core, coloured by height (green low -> purple high)
    ctx.globalAlpha = a;
    ctx.lineWidth = 2.1 * dpr;
    for (i = 1; i < n; i++) {
      var h = SBL.hueFor((pathPts[i][2] + pathPts[i - 1][2]) * 0.5);
      ctx.strokeStyle = light ? "hsl(" + h.toFixed(0) + ",92%,34%)" : "hsl(" + h.toFixed(0) + ",100%,72%)";
      ctx.beginPath();
      ctx.moveTo(pathPts[i - 1][0], pathPts[i - 1][1]);
      ctx.lineTo(pathPts[i][0], pathPts[i][1]);
      ctx.stroke();
    }
    // end points + the point under the cursor
    function dot(pt, hue, r, ring) {
      ctx.fillStyle = light ? "hsl(" + hue + ",92%,36%)" : "hsl(" + hue + ",100%,70%)";
      ctx.beginPath();
      ctx.arc(pt[0], pt[1], r * dpr, 0, 6.2832);
      ctx.fill();
      if (ring) {
        ctx.strokeStyle = light ? "hsla(" + hue + ",92%,36%,.55)" : "hsla(" + hue + ",100%,75%,.6)";
        ctx.lineWidth = 1.2 * dpr;
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], (r + 4) * dpr, 0, 6.2832);
        ctx.stroke();
      }
    }
    var first = pathPts[0],
      last = pathPts[n - 1],
      mid = pathPts[path.iStart] || pathPts[0];
    dot(first, 150, 3.6, true);
    dot(last, 275, 3.6, true);
    ctx.fillStyle = light ? "#0a0e14" : "#ffffff";
    ctx.beginPath();
    ctx.arc(mid[0], mid[1], 3.2 * dpr, 0, 6.2832);
    ctx.fill();
    // tiny labels
    ctx.globalAlpha = a * 0.85;
    ctx.font = "500 " + 10.5 * dpr + "px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillStyle = light ? "rgba(25,40,58,.78)" : "rgba(210,228,248,.82)";
    ctx.textBaseline = "middle";
    ctx.fillText("min", first[0] + 11 * dpr, first[1] + 1 * dpr);
    ctx.fillText("max", last[0] + 11 * dpr, last[1] + 1 * dpr);
    ctx.restore();
  }

  // ---- touch: the path follows the finger, scrolling still works ----
  var touchTimer = 0;
  function touchPoint(e) {
    if (phase !== "land" || !e.touches || !e.touches[0]) return;
    setPointer(e.touches[0]);
    clearTimeout(touchTimer);
  }
  window.addEventListener("touchstart", touchPoint, { passive: true });
  window.addEventListener("touchmove", touchPoint, { passive: true });
  window.addEventListener(
    "touchend",
    function () {
      clearTimeout(touchTimer);
      touchTimer = setTimeout(pointerOut, 1200);
    },
    { passive: true }
  );

  // ---------- Render ----------
  var c45 = Math.SQRT1_2,
    s45 = Math.SQRT1_2;
  var CAM = 4.2;
  var landIn = 0; // 0 -> 1 fade-in of the finished landscape

  var GLOW_W = [0.5, 0.6, 0.7]; // strength of the three blur sizes (tight -> wide)
  var RAMP_AT = [-1, 0.3, 0.6]; // glow slider value above which the 2nd / 3rd blur size starts to fade in
  var ramp = function (g, at) {
    return Math.min(1, Math.max(0, (g - at) / 0.15));
  };
  function shrink(dst, src) {
    // clear, then draw src scaled to dst's size
    dst.x.clearRect(0, 0, dst.c.width, dst.c.height);
    dst.x.drawImage(src, 0, 0, dst.c.width, dst.c.height);
  }
  function renderLight(k, Rm) {
    inkCtx.putImageData(img, 0, 0);

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = BG_CSS_LIGHT;
    ctx.fillRect(0, 0, W, H);

    var gl = S.glow;
    var gk = CFG.inkGlow * (1 + pulse * 0.7 + k * 0.6) * gl; // swells with pulse / hold / exit
    var a0 = Math.min(1, GLOW_W[0] * gk);
    var a1 = Math.min(1, GLOW_W[1] * gk * ramp(gl, RAMP_AT[1]));
    var a2 = Math.min(1, GLOW_W[2] * gk * ramp(gl, RAMP_AT[2]));
    if (a0 >= 0.02) {
      shrink(lHalf, ink);
      shrink(lA, lHalf.c);
      if (a1 >= 0.02) shrink(lB, lA.c);
      if (a2 >= 0.02) shrink(lC, lB.c);
      var gw = lGlow.c.width,
        gh = lGlow.c.height,
        gx = lGlow.x;
      gx.clearRect(0, 0, gw, gh);
      gx.globalAlpha = a0;
      gx.drawImage(lA.c, 0, 0, gw, gh);
      if (a1 >= 0.02) {
        gx.globalAlpha = a1;
        gx.drawImage(lB.c, 0, 0, gw, gh);
      }
      if (a2 >= 0.02) {
        gx.globalAlpha = a2;
        gx.drawImage(lC.c, 0, 0, gw, gh);
      }
      gx.globalAlpha = 1;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(lGlow.c, 0, 0, W, H);
    }

    // soft colored glow at the cursor, in the current cycle color
    if (active && phase === "ring" && CFG.inkMouseGlow > 0 && gl > 0) {
      var gr = Rm * 1.6;
      var a = Math.min(0.5, CFG.inkMouseGlow * (1 + pulse) * gl);
      var grad = ctx.createRadialGradient(mx, my, 0, mx, my, gr);
      grad.addColorStop(0, "hsla(" + cycH + ", 100%, 55%, " + a + ")");
      grad.addColorStop(1, "hsla(" + cycH + ", 100%, 55%, 0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = grad;
      ctx.fillRect(mx - gr, my - gr, gr * 2, gr * 2);
    }

    // sharp dots on top
    ctx.globalAlpha = 1;
    ctx.drawImage(ink, 0, 0);
  }

  var ease = function (q) {
    return q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
  };
  var smooth = function (q) {
    q = Math.min(1, Math.max(0, q));
    return q * q * (3 - 2 * q);
  };

  // the heavy particle frame: the ring ('ring', 'capture') or the particles flying to the landscape ('morph')
  function frameParticles(ts) {
    var t = ts * 0.001 * CFG.speed;

    if (pendingResize && ts - lastResizeAt > 100) {
      pendingResize = false;
      lastResizeAt = ts;
      resize();
    } // detail slider
    // slider settings -> factors. Each is built so that slider = 100 gives exactly 1, i.e. the original look.
    var gl = S.glow;
    var bMul = 1 - (1 - S.brightness) * 0.75; // brightness: 100% .. 25%
    var dens = 1 - (1 - S.density) * 0.85; // density: share of particles drawn, 100% .. 15%
    var densBoost = 1 + (1 - dens) * 0.6; // a thinner ring gets slightly bolder dots

    var now = performance.now();
    // transition progress (0 -> 1) while leaving
    var k = 0,
      m = 0,
      tm = 0,
      partFade = 1,
      linesA = 0;
    if (phase === "ring" && leaving) {
      k = Math.min(1, (now - leaveStart) / CFG.leaveMs);
      if (k >= 1) phase = "capture";
    }
    if (phase === "ring") {
      var holdTarget = holding ? Math.min(1, (now - holdStart) / CFG.holdMs) * 0.6 : 0;
      holdLevel += (holdTarget - holdLevel) * 0.15; // while holding, the ring gradually swells and brightens
      if (holdLevel > k) k = holdLevel;
    } else {
      k = 1;
    }
    var morphing = phase === "morph";
    if (morphing) {
      tm = ts - morphStart;
      m = Math.min(1, tm / CFG.flyMs);
      k = 1 - smooth(tm / (CFG.flyMs * 0.9)); // the swollen, bright ring relaxes while the particles travel
      var ps = tm - CFG.flyMs * CFG.linesAt;
      linesA = smooth(ps / (CFG.flyMs * (1 - CFG.linesAt) + CFG.settleMs));
      partFade = 1 - smooth((tm - CFG.flyMs * 0.85) / (CFG.settleMs + CFG.flyMs * 0.15));
    }
    var scale = baseScale * (1 + k * k * 0.45);
    var gainNow = CFG.gain * (1 + k * 1.1) * bMul * densBoost;

    if (active) {
      mx += (tmx - mx) * 0.2;
      my += (tmy - my) * 0.2;
    } else {
      mx = tmx;
      my = tmy;
    }
    tiltX += (ttx - tiltX) * 0.05;
    tiltY += (tty - tiltY) * 0.05;
    pulse *= 0.95;

    var yaw = t * 0.1 + tiltX * 0.55;
    var pitch = 1.12 - tiltY * 0.3;
    var cyaw = Math.cos(yaw),
      syaw = Math.sin(yaw);
    var cp = Math.cos(pitch),
      sp = Math.sin(pitch);

    var Rm = Math.min(W, H) * CFG.mouseRadius * (1 + pulse * 1.6);
    var Rm2 = Rm * Rm;
    var force = Rm * CFG.mouseForce * (1 + pulse * 1.4);
    var mLight = CFG.mouseLight;
    var capture = phase === "capture";

    var bloomA = function (j) {
      return Math.min(1, BLOOM_W[j] * CFG.bloom * (1 + k * 0.6) * gl * ramp(gl, RAMP_AT[j]));
    };
    var bgNow = BG;
    if (!light && morphing) {
      // the bloom adds the background colour back several times; pre-darken it so the finished landscape matches the page
      var T = 1,
        tb = levels.length - 1;
      if (gl > 0) {
        while (tb > 0 && bloomA(tb) < 0.02) tb--;
        for (var bj = 0; bj <= tb; bj++) T += bloomA(bj);
      } else {
        T = 1;
      }
      var bf = smooth(tm / CFG.flyMs);
      var br = Math.round(4 + (4 / T - 4) * bf),
        bg2 = Math.round(6 + (6 / T - 6) * bf),
        bb = Math.round(10 + (10 / T - 10) * bf);
      bgNow = ((255 << 24) | (bb << 16) | (bg2 << 8) | br) >>> 0;
    }
    u32.fill(light ? 0 : bgNow);

    for (var i = 0; i < N; i++) {
      if (Rn[i] >= dens) {
        if (capture) DR[i] = 0;
        continue;
      } // density slider: skip this particle
      var sx, sy, hue, I, A;

      if (morphing) {
        if (!DR[i]) continue;
        var q = (tm - DL[i]) / (CFG.flyMs - 700);
        q = q < 0 ? 0 : q > 1 ? 1 : q;
        var e = ease(q);
        var dx0 = TX[i] - SX[i],
          dy0 = TY[i] - SY[i];
        var len = Math.sqrt(dx0 * dx0 + dy0 * dy0) + 1e-6;
        var bow = Math.sin(Math.PI * q) * CU[i] * len; // the particles take curved routes
        sx = SX[i] + dx0 * e - (dy0 / len) * bow;
        sy = SY[i] + dy0 * e + (dx0 / len) * bow;
        hue = (SH[i] + (TH[i] - SH[i]) * e) | 0;
        I = SI[i];
      } else {
        var u = U[i],
          w = Wd[i],
          l = Ly[i];
        var ph = l * 2.1;
        var uu = u + t * 0.05;

        var hw = 0.3 + 0.09 * Math.sin(2 * u + t * 0.35 + ph);
        var lr = 1 + (l - 1) * 0.04;
        var rad = lr * (1 + 0.14 * Math.sin(3 * u - t * 0.5 + ph) + 0.07 * Math.sin(5 * u + t * 0.7 + ph * 1.7)) + w * hw;
        var y =
          0.3 * Math.sin(3 * u + t * 0.6 + ph) +
          0.1 * Math.sin(5 * u - t * 0.8 + w * 1.5 + ph) +
          w * hw * 0.9 * Math.sin(2 * u + t * 0.4 + ph) +
          (l - 1) * 0.08 +
          Jy[i];

        var x0 = rad * Math.cos(uu),
          z0 = rad * Math.sin(uu);
        var x1 = x0 * cyaw + z0 * syaw;
        var z1 = -x0 * syaw + z0 * cyaw;
        var y2 = y * cp - z1 * sp;
        var z2 = y * sp + z1 * cp;

        var p = CAM / (CAM - z2);
        sx = cx + x1 * p * scale;
        sy = cy - y2 * p * scale;

        // color from screen direction: green top-right -> blue -> purple bottom-left
        var dxs = sx - cx,
          dys = cy - sy;
        var rr = Math.sqrt(dxs * dxs + dys * dys) + 1e-6;
        var g = ((dxs * c45 + dys * s45) / rr + 1) * 0.5;
        hue = (150 + (1 - g) * 125) | 0;

        // cursor: small void, illuminated particles around it
        var tx = 0,
          ty = 0,
          boost = 0;
        var mdx = sx - mx,
          mdy = sy - my;
        var d2 = mdx * mdx + mdy * mdy;
        if (d2 < Rm2) {
          var d = Math.sqrt(d2) + 1e-6;
          var f = 1 - d / Rm;
          var kk = f * f * force;
          tx = (mdx / d) * kk - (mdy / d) * kk * 0.3;
          ty = (mdy / d) * kk + (mdx / d) * kk * 0.3;
          boost = f * mLight;
        }
        OX[i] += (tx - OX[i]) * 0.12;
        OY[i] += (ty - OY[i]) * 0.12;
        sx += OX[i];
        sy += OY[i];

        I = (0.9 + 0.25 * z2 + 0.35 * y) * Dm[i] * (1 + boost);
        if (I < 0.25) I = 0.25;
        if (capture) {
          SX[i] = sx;
          SY[i] = sy;
          SH[i] = hue;
          SI[i] = I;
          DR[i] = 1;
        }
      }
      if (morphing) I *= partFade;
      if (!light) I *= gainNow;

      var xi = sx | 0,
        yi = sy | 0;
      if (xi < 0 || yi < 0 || xi >= W - 1 || yi >= H - 1) continue;
      var fx = sx - xi,
        fy = sy - yi;

      if (light) {
        // light mode: deeper ink dots painted over the white background
        A = Math.min(1, I * 1.25 * bMul * densBoost * (1 + k * 0.5));
        var ir = LUTL[hue * 3],
          ig = LUTL[hue * 3 + 1],
          ib = LUTL[hue * 3 + 2];
        var ix = (yi * W + xi) << 2,
          rw = W << 2;
        blend(ix, ir, ig, ib, A * Math.min(1, (1 - fx) * (1 - fy) * 2.8));
        blend(ix + 4, ir, ig, ib, A * Math.min(1, fx * (1 - fy) * 2.8));
        blend(ix + rw, ir, ig, ib, A * Math.min(1, (1 - fx) * fy * 2.8));
        blend(ix + rw + 4, ir, ig, ib, A * Math.min(1, fx * fy * 2.8));
        continue;
      }

      var hr = LUT[hue * 3] * I,
        hg = LUT[hue * 3 + 1] * I,
        hb = LUT[hue * 3 + 2] * I;
      var w00 = (1 - fx) * (1 - fy),
        w10 = fx * (1 - fy),
        w01 = (1 - fx) * fy,
        w11 = fx * fy;
      var idx = (yi * W + xi) << 2;
      var row = W << 2;

      bytes[idx] += hr * w00;
      bytes[idx + 1] += hg * w00;
      bytes[idx + 2] += hb * w00;
      bytes[idx + 4] += hr * w10;
      bytes[idx + 5] += hg * w10;
      bytes[idx + 6] += hb * w10;
      bytes[idx + row] += hr * w01;
      bytes[idx + row + 1] += hg * w01;
      bytes[idx + row + 2] += hb * w01;
      bytes[idx + row + 4] += hr * w11;
      bytes[idx + row + 5] += hg * w11;
      bytes[idx + row + 6] += hb * w11;
    }

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    if (light) renderLight(k, Rm);
    else ctx.putImageData(img, 0, 0);

    if (!light && gl > 0) {
      // dark mode: glow and cursor halo (glow slider at 0 skips all of it)
      var bAlpha = bloomA;
      var top = levels.length - 1;
      while (top > 0 && bAlpha(top) < 0.02) top--;
      var src = canvas,
        j;
      for (j = 0; j <= top; j++) {
        var L = levels[j];
        L.x.imageSmoothingEnabled = true;
        L.x.drawImage(src, 0, 0, L.c.width, L.c.height);
        src = L.c;
      }
      ctx.globalCompositeOperation = "lighter";
      ctx.imageSmoothingEnabled = true;
      for (j = 0; j <= top; j++) {
        ctx.globalAlpha = bAlpha(j);
        ctx.drawImage(levels[j].c, 0, 0, W, H);
      }

      // soft light halo at the cursor
      if (active && !morphing && CFG.mouseGlow > 0) {
        var gr = Rm * 1.5;
        var grad = ctx.createRadialGradient(mx, my, 0, mx, my, gr);
        var a = CFG.mouseGlow * (1 + pulse) * gl;
        grad.addColorStop(0, "rgba(170, 235, 255, " + a + ")");
        grad.addColorStop(1, "rgba(170, 235, 255, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.fillRect(mx - gr, my - gr, gr * 2, gr * 2);
      }
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    if (morphing && linesA > 0.002) {
      // the landscape's lines fade in underneath the settling particles
      drawLandscapeLayer(linesA, ts);
    }

    if (capture) {
      // hand over: from the next frame the particles fly
      for (var n = 0; n < N; n++) {
        DL[n] = Rn[n] * 520 + ((n * 0.37) % 1) * 180; // staggered take-off (0 .. 700 ms)
        CU[n] = (((Rn[n] * 977) % 1) - 0.5) * 0.55; // how much this particle's route curves
      }
      computeTargets();
      phase = "morph";
      morphStart = ts;
      setTimeout(
        function () {
          root.classList.add("sb-reveal");
        },
        reduceMotion ? 0 : 1500
      ); // page chrome fades in as the lines appear
    }
    if (morphing && tm >= CFG.flyMs + CFG.settleMs) {
      phase = "land";
      landIn = 1;
      dirty = true;
      if (landingEl) landingEl.style.display = "none";
      root.classList.add("sb-reveal");
      root.classList.remove("sb-landing"); // scrolling is released
      root.classList.add("sb-entered");
      pendingResize = true; // the scrollbar may have appeared: re-fit the canvas
      setTimeout(measure, 150);
    }
  }

  // the finished landscape: background, glow, mesh, hover path
  function drawLandscapeLayer(alpha, ts) {
    var gl = S.glow;
    ctx.globalAlpha = alpha * Math.min(1, 0.25 + gl) * (light ? 0.55 : 0.6);
    ctx.imageSmoothingEnabled = true;
    ctx.globalCompositeOperation = light ? "source-over" : "lighter";
    ctx.drawImage(meshGlowCv, 0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = alpha;
    ctx.drawImage(meshCv, 0, 0);
    ctx.globalAlpha = 1;
  }

  function frameLand(ts) {
    if (pendingResize && ts - lastResizeAt > 100) {
      pendingResize = false;
      lastResizeAt = ts;
      resize();
    }
    var rect = hero.getBoundingClientRect();
    if (rect.bottom < -20) return; // scrolled past the landscape: nothing to draw
    if (landIn < 1) {
      landIn = Math.min(1, landIn + 0.03);
      dirty = true;
    }
    if (active) {
      mx += (tmx - mx) * 0.35;
      my += (tmy - my) * 0.35;
    } else {
      mx = tmx;
      my = tmy;
    }
    var before = pathAlpha;
    updatePath();
    if (!dirty && pathAlpha === 0 && before === 0) return; // nothing changed: keep the last picture
    dirty = false;
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = light ? BG_CSS_LIGHT : BG_CSS_DARK;
    ctx.fillRect(0, 0, W, H);
    drawLandscapeLayer(smooth(landIn), ts);
    drawPath(ts);
    if (pathAlpha > 0.003 || surfPt) dirty = true; // the path colour cycles / fades, keep drawing
  }

  function frame(ts) {
    if (phase === "land") frameLand(ts);
    else frameParticles(ts);
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", function () {
    pendingResize = true;
  });
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) dirty = true;
  });
  window.__sbPhase = function () {
    return phase;
  };

  // ---------- boot ----------
  syncTheme();
  resize();
  if (phase === "land") {
    buildLandscape();
    landIn = 0;
  }
  requestAnimationFrame(frame);

  // =====================================================================
  //  Scrolling: the name, role line and icons dock into the page header
  // =====================================================================
  var travs = [].slice
    .call(document.querySelectorAll(".sb-trav"))
    .map(function (el) {
      return {
        el: el,
        slot: el.parentElement,
        ph: document.getElementById(el.getAttribute("data-ph")),
        kind: el.getAttribute("data-kind"),
        x0: 0,
        y0: 0,
        sx: 0,
        sy: 0,
        S0: 1,
      };
    })
    .filter(function (t) {
      return t.ph;
    });
  var fades = [].slice.call(document.querySelectorAll(".sb-fade"));
  var navName = document.querySelector(".sb-brand .sb-name");
  var scrollHint = document.querySelector(".sb-scroll");
  var header = document.getElementById("navbar");
  var A = 0,
    B = 1,
    yFinal = 0,
    docked = false,
    measured = false;

  function measure() {
    var y = window.pageYOffset || 0;
    var navH = header ? header.getBoundingClientRect().height : 60;
    travs.forEach(function (t) {
      // measure in the docked (static) state
      t.el.classList.remove("flying");
      t.el.style.cssText = "";
      t.slot.style.height = "";
    });
    travs.forEach(function (t) {
      var nat = t.el.getBoundingClientRect(),
        slotR = t.slot.getBoundingClientRect(),
        phR = t.ph.getBoundingClientRect();
      t.slot.style.height = nat.height + "px";
      t.sx = slotR.left + (window.pageXOffset || 0);
      t.sy = slotR.top + y;
      t.x0 = phR.left + (window.pageXOffset || 0);
      t.y0 = phR.top + y;
      t.S0 = t.kind === "name" ? phR.height / (nat.height || 1) : 1;
    });
    var first = travs[0];
    yFinal = navH + 26;
    A = innerHeight * 0.06;
    B = first ? Math.max(A + 80, first.sy - yFinal) : 1;
    measured = true;
    updateScroll();
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function updateScroll() {
    if (!measured) return;
    var y = window.pageYOffset || 0;
    var p = Math.min(1, Math.max(0, (y - A) / (B - A))),
      e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    var isDocked = p >= 1;
    travs.forEach(function (t) {
      var el = t.el;
      el.style.setProperty("--p", p.toFixed(4));
      // plain numbers for the CSS (the site's CSS minifier breaks var() inside calc())
      el.style.setProperty("--o-last", Math.min(1, Math.max(0, (p - 0.55) * 3)).toFixed(4));
      el.style.setProperty("--o-a", Math.min(1, Math.max(0, 1 - p * 2.4)).toFixed(4));
      el.style.setProperty("--o-b", Math.min(1, Math.max(0, (p - 0.35) * 2.2)).toFixed(4));
      if (isDocked) {
        if (el.classList.contains("flying")) {
          el.classList.remove("flying");
          el.style.transform = "";
          el.style.left = "";
          el.style.top = "";
        }
      } else {
        el.classList.add("flying");
        var yEnd = t.sy - B; // where this item's slot will be when the dock completes
        var px = lerp(t.x0, t.sx, e),
          py = lerp(t.y0, yEnd, e),
          s = lerp(t.S0, 1, e);
        el.style.left = "0px";
        el.style.top = "0px";
        el.style.transform = "translate(" + px.toFixed(2) + "px," + py.toFixed(2) + "px) scale(" + s.toFixed(4) + ")";
      }
    });
    var fo = 1 - Math.min(1, p / 0.2);
    fades.forEach(function (f) {
      f.style.opacity = fo.toFixed(3);
      f.style.visibility = fo <= 0.01 ? "hidden" : "";
    });
    if (scrollHint) scrollHint.style.setProperty("--sb-scroll-o", Math.max(0, 1 - y / 90).toFixed(3));
    if (navName) {
      var slot0 = travs[0] ? travs[0].slot.getBoundingClientRect() : null;
      var headVisible = slot0 ? slot0.bottom > (header ? header.getBoundingClientRect().height : 60) : false;
      navName.style.opacity = (headVisible ? 1 - p : 1).toFixed(3);
    }
    if (header) header.classList.toggle("sb-scrolled", y > 8);
    root.classList.toggle("sb-past-hero", y > innerHeight * 0.6);
    docked = isDocked;
  }
  var raf = 0;
  window.addEventListener(
    "scroll",
    function () {
      if (!raf)
        raf = requestAnimationFrame(function () {
          raf = 0;
          updateScroll();
        });
    },
    { passive: true }
  );
  var rt = 0;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(measure, 120);
  });
  window.addEventListener("load", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure();
})();
