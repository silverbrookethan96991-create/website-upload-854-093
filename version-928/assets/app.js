
document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      var target = "search.html";
      if (query) {
        target += "?q=" + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var current = 0;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchPage = document.querySelector("[data-search-page]");
  if (searchPage) {
    var queryInput = searchPage.querySelector("[data-filter-query]");
    var regionSelect = searchPage.querySelector("[data-filter-region]");
    var typeSelect = searchPage.querySelector("[data-filter-type]");
    var yearSelect = searchPage.querySelector("[data-filter-year]");
    var countText = searchPage.querySelector("[data-filter-count]");
    var cards = Array.prototype.slice.call(searchPage.querySelectorAll(".movie-card"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (queryInput && initialQuery) {
      queryInput.value = initialQuery;
    }

    var normalize = function (value) {
      return String(value || "").toLowerCase();
    };

    var runFilter = function () {
      var query = normalize(queryInput ? queryInput.value : "");
      var region = normalize(regionSelect ? regionSelect.value : "");
      var type = normalize(typeSelect ? typeSelect.value : "");
      var year = normalize(yearSelect ? yearSelect.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-type")
        ].join(" "));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchRegion = !region || normalize(card.getAttribute("data-region")).indexOf(region) !== -1;
        var matchType = !type || normalize(card.getAttribute("data-type")).indexOf(type) !== -1;
        var matchYear = !year || normalize(card.getAttribute("data-year")) === year;
        var matched = matchQuery && matchRegion && matchType && matchYear;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (countText) {
        countText.textContent = "当前筛选：" + visible + " 部";
      }
    };

    [queryInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", runFilter);
        control.addEventListener("change", runFilter);
      }
    });

    runFilter();
  }

  document.querySelectorAll(".player-card").forEach(function (player) {
    var video = player.querySelector("video");
    var cover = player.querySelector(".player-cover");
    var button = player.querySelector(".play-button");
    var stream = player.getAttribute("data-stream");
    var hlsInstance = null;

    var begin = function () {
      if (!video || !stream) {
        return;
      }

      player.classList.add("is-playing");

      if (video.dataset.ready === "1") {
        video.play().catch(function () {});
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.dataset.ready = "1";
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.dataset.ready = "1";
          video.play().catch(function () {});
        });
        return;
      }

      video.src = stream;
      video.dataset.ready = "1";
      video.play().catch(function () {});
    };

    if (button) {
      button.addEventListener("click", begin);
    }

    if (cover) {
      cover.addEventListener("click", begin);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        } else {
          video.pause();
        }
      });
      video.addEventListener("ended", function () {
        if (hlsInstance && hlsInstance.destroy) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
        video.dataset.ready = "";
        player.classList.remove("is-playing");
      });
    }
  });
});
