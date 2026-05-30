(function () {
    var menuButton = document.querySelector(".mobile-menu-toggle");
    var menu = document.querySelector(".mobile-menu");

    if (menuButton && menu) {
        menuButton.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll(".hero-thumb"));
    var activeSlide = 0;
    var timer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === activeSlide);
        });
        thumbs.forEach(function (thumb, thumbIndex) {
            thumb.classList.toggle("is-active", thumbIndex === activeSlide);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showHero(activeSlide + 1);
        }, 5200);
    }

    thumbs.forEach(function (thumb, index) {
        thumb.addEventListener("click", function () {
            if (timer) {
                window.clearInterval(timer);
            }
            showHero(index);
            startHero();
        });
    });

    startHero();

    var filters = Array.prototype.slice.call(document.querySelectorAll(".catalog-filter"));

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function applyFilter(input) {
        var scope = input.closest("main") || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".filter-targets [data-search]"));
        var query = normalize(input.value);

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search") + " " + card.getAttribute("data-title"));
            card.classList.toggle("is-filtered-out", query && text.indexOf(query) === -1);
        });
    }

    filters.forEach(function (input) {
        input.addEventListener("input", function () {
            applyFilter(input);
        });
    });

    var searchInput = document.querySelector(".search-page-input");
    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
            searchInput.value = q;
            applyFilter(searchInput);
        }
    }
})();

function initMoviePlayer(videoId, source) {
    var video = document.getElementById(videoId);
    if (!video) {
        return;
    }

    var shell = video.closest(".player-shell");
    var cover = shell ? shell.querySelector(".player-cover") : null;
    var attached = false;
    var hlsInstance = null;

    function attachSource() {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }

        video.setAttribute("controls", "controls");
    }

    function startPlayback() {
        attachSource();
        if (cover) {
            cover.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener("ended", function () {
        if (cover) {
            cover.classList.remove("is-hidden");
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
