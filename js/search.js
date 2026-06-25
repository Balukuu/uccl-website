/* ============================================================
   UCCL — search.js
   Live product-table filter (name + active ingredient),
   category/group filter pills, live result count
   ============================================================ */
(function () {
  "use strict";

  document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
    var input = scope.querySelector(".product-search");
    var pills = Array.prototype.slice.call(scope.querySelectorAll(".filter-pill"));
    var countEl = scope.querySelector(".result-count");
    var tables = Array.prototype.slice.call(scope.querySelectorAll("table.products"));

    var allRows = [];
    tables.forEach(function (t) {
      Array.prototype.slice.call(t.querySelectorAll("tbody tr"))
        .forEach(function (r) { if (!r.classList.contains("no-results")) allRows.push(r); });
    });

    var activeGroup = "all";
    var query = "";

    function apply() {
      var visible = 0;
      allRows.forEach(function (row) {
        var name = (row.getAttribute("data-name") || "").toLowerCase();
        var ai = (row.getAttribute("data-ai") || "").toLowerCase();
        var group = (row.getAttribute("data-group") || "").toLowerCase();

        var matchText = !query || name.indexOf(query) > -1 || ai.indexOf(query) > -1;
        var matchGroup = activeGroup === "all" || group === activeGroup;
        var show = matchText && matchGroup;

        row.style.display = show ? "" : "none";
        if (show) visible++;
      });

      // No-results rows (per table)
      tables.forEach(function (t) {
        var body = t.querySelector("tbody");
        var nr = body.querySelector(".no-results");
        var anyVisible = Array.prototype.slice.call(body.querySelectorAll("tr"))
          .some(function (r) { return !r.classList.contains("no-results") && r.style.display !== "none"; });
        if (nr) nr.style.display = anyVisible ? "none" : "";
      });

      if (countEl) {
        countEl.innerHTML = "Showing <strong>" + visible + "</strong> of " + allRows.length + " products";
      }
    }

    if (input) {
      input.addEventListener("input", function () {
        query = input.value.trim().toLowerCase();
        apply();
      });
    }

    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        pills.forEach(function (p) {
          p.classList.remove("active");
          p.setAttribute("aria-pressed", "false");
        });
        pill.classList.add("active");
        pill.setAttribute("aria-pressed", "true");
        activeGroup = (pill.getAttribute("data-group") || "all").toLowerCase();
        apply();
      });
    });

    apply();
  });
})();
