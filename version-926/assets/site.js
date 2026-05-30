(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function filterCards(input) {
    var scope = input.closest("main") || document;
    var cards = scope.querySelectorAll("[data-search-card]");
    var words = normalize(input.value).split(/\s+/).filter(Boolean);
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-search-text"));
      var matched = words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
      card.hidden = words.length > 0 && !matched;
    });
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.hidden = !menu.hidden;
      });
    }

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
      });
    });

    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
      input.addEventListener("input", function () {
        filterCards(input);
      });
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    var searchInput = document.querySelector("[data-search-page-input]");
    if (query && searchInput) {
      searchInput.value = query;
      filterCards(searchInput);
      searchInput.focus();
    }
  });

  window.setupPlayer = function (videoId, sourceUrl) {
    ready(function () {
      var video = document.getElementById(videoId);
      if (!video) {
        return;
      }

      var shell = video.closest(".player-shell");
      var playOverlay = shell.querySelector("[data-play]");
      var toggleButton = shell.querySelector("[data-toggle]");
      var muteButton = shell.querySelector("[data-mute]");
      var fullButton = shell.querySelector("[data-fullscreen]");
      var loading = shell.querySelector("[data-loading]");
      var errorBox = shell.querySelector("[data-error]");
      var reloadButton = shell.querySelector("[data-reload]");
      var hlsInstance = null;
      var loaded = false;

      function showLoading(show) {
        if (loading) {
          loading.hidden = !show;
        }
      }

      function showError() {
        showLoading(false);
        if (errorBox) {
          errorBox.hidden = false;
        }
      }

      function loadMedia() {
        if (loaded) {
          return Promise.resolve();
        }
        loaded = true;
        showLoading(true);

        return new Promise(function (resolve, reject) {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              showLoading(false);
              resolve();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (_event, data) {
              if (data && data.fatal) {
                showError();
                reject(data);
              }
            });
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            video.addEventListener("loadedmetadata", function () {
              showLoading(false);
              resolve();
            }, { once: true });
            video.addEventListener("error", function () {
              showError();
              reject(new Error("media"));
            }, { once: true });
          } else {
            showError();
            reject(new Error("unsupported"));
          }
        });
      }

      function playVideo() {
        loadMedia().then(function () {
          return video.play();
        }).then(function () {
          shell.classList.add("is-playing");
          video.controls = true;
        }).catch(function () {
          showError();
        });
      }

      function togglePlay() {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      }

      if (playOverlay) {
        playOverlay.addEventListener("click", playVideo);
      }

      if (toggleButton) {
        toggleButton.addEventListener("click", togglePlay);
      }

      video.addEventListener("click", togglePlay);
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
        if (toggleButton) {
          toggleButton.textContent = "暂停";
        }
      });
      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
        if (toggleButton) {
          toggleButton.textContent = "播放";
        }
      });

      if (muteButton) {
        muteButton.addEventListener("click", function () {
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? "静音" : "声音";
        });
      }

      if (fullButton) {
        fullButton.addEventListener("click", function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (video.requestFullscreen) {
            video.requestFullscreen();
          }
        });
      }

      if (reloadButton) {
        reloadButton.addEventListener("click", function () {
          window.location.reload();
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };
})();
