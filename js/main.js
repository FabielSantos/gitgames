/**
 * Git Games – busca na listagem de jogos (client-side)
 */
(function () {
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
