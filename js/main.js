/**
 * Git Games – busca na listagem de jogos (client-side) e tema claro/escuro
 */
(function () {
  /* ----- Tema (lua = escuro, sol = claro) ----- */
  var THEME_KEY = "gitgames-theme";
  var root = document.documentElement;

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || "dark";
    } catch (e) {
      return "dark";
    }
  }

  function setTheme(theme) {
    theme = theme === "light" ? "light" : "dark";
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  }

  function initTheme() {
    var saved = getStoredTheme();
    setTheme(saved);
  }

  /* Aplicar tema salvo em todas as páginas (não só onde existe o botão) */
  initTheme();
  // #region agent log
  fetch('http://127.0.0.1:7849/ingest/79e4474d-0c9f-4bb7-a312-9716a726436d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6bda6b'},body:JSON.stringify({sessionId:'6bda6b',location:'main.js:theme-init-done',message:'initTheme called (all pages)',data:{pathname:window.location.pathname,savedTheme:getStoredTheme(),runId:'post-fix'},hypothesisId:'H1',timestamp:Date.now()})}).catch(function(){});
  // #endregion

  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") || "dark";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  /* ----- Busca na listagem de jogos ----- */
  var searchInput = document.getElementById("busca-jogos");
  var listContainer = document.getElementById("lista-jogos");
  var noResults = document.getElementById("nenhum-resultado");

  if (!searchInput || !listContainer) return;

  var cards = listContainer.querySelectorAll(".game-card");

  searchInput.addEventListener("input", function () {
    var query = this.value.trim().toLowerCase();
    var visible = 0;

    cards.forEach(function (card) {
      var name = (card.getAttribute("data-game-name") || card.querySelector(".game-card-title")?.textContent || "").toLowerCase();
      var show = !query || name.indexOf(query) !== -1;
      card.style.display = show ? "" : "none";
      if (show) visible++;
    });

    if (noResults) noResults.style.display = visible ? "none" : "block";
  });
})();
