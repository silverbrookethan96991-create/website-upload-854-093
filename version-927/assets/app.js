const Site = (() => {
  function menu() {
    const button = document.querySelector("[data-menu-button]");
    const nav = document.querySelector("[data-main-nav]");
    if (!button || !nav) return;
    button.addEventListener("click", () => nav.classList.toggle("is-open"));
  }

  function hero() {
    const root = document.querySelector("[data-hero]");
    if (!root) return;
    const slides = Array.from(root.querySelectorAll(".hero-slide"));
    const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
    const thumbs = Array.from(root.querySelectorAll("[data-hero-thumb]"));
    let current = 0;
    let timer = null;
    const activate = (next) => {
      current = (next + slides.length) % slides.length;
      slides.forEach((item, index) =>
        item.classList.toggle("is-active", index === current),
      );
      dots.forEach((item, index) =>
        item.classList.toggle("is-active", index === current),
      );
      thumbs.forEach((item, index) =>
        item.classList.toggle("is-active", index === current),
      );
    };
    const play = () => {
      clearInterval(timer);
      timer = setInterval(() => activate(current + 1), 5200);
    };
    dots.forEach((dot) =>
      dot.addEventListener("click", () => {
        activate(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      }),
    );
    thumbs.forEach((thumb) =>
      thumb.addEventListener("mouseenter", () => {
        activate(Number(thumb.getAttribute("data-hero-thumb")) || 0);
        play();
      }),
    );
    activate(0);
    play();
  }

  function search() {
    const input = document.querySelector("[data-search-input]");
    const lists = Array.from(document.querySelectorAll("[data-card-list]"));
    const chips = Array.from(document.querySelectorAll("[data-filter]"));
    if (!input && chips.length === 0) return;
    let filter = "all";
    const cards = lists.flatMap((list) =>
      Array.from(list.querySelectorAll(".movie-card")),
    );
    const update = () => {
      const keyword = (input ? input.value : "").trim().toLowerCase();
      cards.forEach((card) => {
        const text = [
          card.dataset.title,
          card.dataset.genre,
          card.dataset.year,
          card.dataset.region,
          card.textContent,
        ]
          .join(" ")
          .toLowerCase();
        const matchedKeyword = !keyword || text.includes(keyword);
        const matchedFilter =
          filter === "all" || text.includes(filter.toLowerCase());
        card.classList.toggle(
          "is-hidden-card",
          !(matchedKeyword && matchedFilter),
        );
      });
    };
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        filter = chip.getAttribute("data-filter") || "all";
        chips.forEach((item) => item.classList.toggle("active", item === chip));
        update();
      });
    });
    if (input) input.addEventListener("input", update);
    update();
  }

  function player(src) {
    const video = document.getElementById("moviePlayer");
    const overlay = document.querySelector(".watch-overlay");
    if (!video || !src) return;
    let prepared = false;
    const prepare = () => {
      if (prepared) return;
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      video.load();
    };
    const start = () => {
      prepare();
      if (overlay) overlay.classList.add("is-hidden");
      const request = video.play();
      if (request && typeof request.catch === "function")
        request.catch(() => {});
    };
    if (overlay) overlay.addEventListener("click", start);
    video.addEventListener("click", () => {
      if (video.paused) start();
    });
    video.addEventListener("play", () => {
      if (overlay) overlay.classList.add("is-hidden");
    });
  }

  document.addEventListener("DOMContentLoaded", menu);

  return { hero, search, player };
})();
