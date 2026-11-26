/* Small UI helpers: the abstract pop-up on the publication lists. */
(function () {
  var modal = document.getElementById("sbAbsModal");
  if (!modal) return;
  var titleEl = document.getElementById("sbAbsTitle"),
    textEl = document.getElementById("sbAbsText"),
    closeBtn = modal.querySelector(".sb-modal-close"),
    lastFocus = null;

  function open(id) {
    var src = document.getElementById(id);
    if (!src) return;
    titleEl.textContent = src.getAttribute("data-title") || "";
    textEl.textContent = src.textContent.trim();
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.documentElement.classList.add("sb-modal-open");
    closeBtn.focus();
  }
  function close() {
    modal.hidden = true;
    document.documentElement.classList.remove("sb-modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".sb-abs-open") : null;
    if (btn) {
      e.preventDefault();
      open(btn.getAttribute("data-abs"));
      return;
    }
    if (!modal.hidden && (e.target === modal || e.target === closeBtn)) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) close();
  });
})();

/* Research notes: horizontal rails and the quick-summary pop-up. */
(function () {
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest(".sb-rail-btn") : null;
    if (!b) return;
    var rail = b.closest(".sb-notes-sec").querySelector(".sb-rail");
    rail.scrollBy({ left: Number(b.getAttribute("data-rail")) * Math.min(420, rail.clientWidth * 0.85), behavior: "smooth" });
  });

  var modal = document.getElementById("sbSumModal");
  if (!modal) return;
  var titleEl = document.getElementById("sbSumTitle"),
    bodyEl = document.getElementById("sbSumBody"),
    doiEl = document.getElementById("sbSumDoi"),
    noteEl = document.getElementById("sbSumNote"),
    closeBtn = modal.querySelector(".sb-modal-close"),
    lastFocus = null;

  function open(id) {
    var src = document.getElementById(id);
    if (!src) return;
    titleEl.textContent = src.getAttribute("data-title") || "";
    bodyEl.innerHTML = src.innerHTML;
    doiEl.href = src.getAttribute("data-doi") || "#";
    noteEl.href = src.getAttribute("data-note") || "#";
    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.querySelector(".sb-modal-card").scrollTop = 0;
    document.documentElement.classList.add("sb-modal-open");
    closeBtn.focus();
  }
  function close() {
    modal.hidden = true;
    document.documentElement.classList.remove("sb-modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".sb-sum-open") : null;
    if (btn) {
      e.preventDefault();
      open(btn.getAttribute("data-sum"));
      return;
    }
    if (!modal.hidden && (e.target === modal || e.target === closeBtn)) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) close();
  });
})();

/* Projects: the "View details" pop-up (one hidden dialog per project, opened by id). */
(function () {
  var openModal = null,
    lastFocus = null;

  function open(id) {
    var m = document.getElementById(id);
    if (!m) return;
    if (openModal) close();
    lastFocus = document.activeElement;
    m.hidden = false;
    var card = m.querySelector(".sb-modal-card");
    if (card) card.scrollTop = 0;
    document.documentElement.classList.add("sb-modal-open");
    var x = m.querySelector(".sb-modal-close");
    if (x) x.focus();
    openModal = m;
    if (window.MathJax && window.MathJax.typesetPromise) window.MathJax.typesetPromise([m]).catch(function () {});
  }
  function close() {
    if (!openModal) return;
    openModal.hidden = true;
    openModal = null;
    document.documentElement.classList.remove("sb-modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest(".sb-proj-open") : null;
    if (t) {
      e.preventDefault();
      open(t.getAttribute("data-proj"));
      return;
    }
    if (openModal && (e.target === openModal || (e.target.closest && e.target.closest(".sb-modal-close") && openModal.contains(e.target)))) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && openModal) close();
  });
  // a link such as /projects/#proj-3 opens that project directly
  if (/^#proj-\d+$/.test(location.hash)) document.addEventListener("DOMContentLoaded", function () {
    open(location.hash.slice(1));
  });
})();
