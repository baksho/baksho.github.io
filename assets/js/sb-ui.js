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
