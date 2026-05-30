
(function () {
  var nav = document.querySelector('.site-nav');
  var menuToggle = document.querySelector('.menu-toggle');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeSlide = 0;
  var carouselTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  function startCarousel() {
    if (slides.length < 2) {
      return;
    }

    carouselTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      window.clearInterval(carouselTimer);
      showSlide(Number(dot.getAttribute('data-slide')) || 0);
      startCarousel();
    });
  });

  startCarousel();

  var filterInput = document.querySelector('.page-filter');
  var filterGrid = document.querySelector('.searchable-grid');

  function filterCards(value) {
    if (!filterGrid) {
      return;
    }

    var query = String(value || '').trim().toLowerCase();
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      card.classList.toggle('is-filtered-out', Boolean(query) && text.indexOf(query) === -1);
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', function () {
      filterCards(filterInput.value);
    });
  }

  var searchInput = document.querySelector('.search-input');
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  if (searchInput) {
    searchInput.value = query;
    filterCards(query);

    searchInput.addEventListener('input', function () {
      filterCards(searchInput.value);
    });
  }

  var sortButtons = Array.prototype.slice.call(document.querySelectorAll('[data-sort]'));

  sortButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      if (!filterGrid) {
        return;
      }

      var type = button.getAttribute('data-sort');
      var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));

      cards.sort(function (a, b) {
        var ta = (a.querySelector('.card-title') || {}).textContent || '';
        var tb = (b.querySelector('.card-title') || {}).textContent || '';
        var ya = Number(((a.querySelector('.card-meta') || {}).textContent || '').match(/\d{4}/));
        var yb = Number(((b.querySelector('.card-meta') || {}).textContent || '').match(/\d{4}/));

        if (type === 'year') {
          return (yb || 0) - (ya || 0);
        }

        return ta.localeCompare(tb, 'zh-Hans-CN');
      });

      cards.forEach(function (card) {
        filterGrid.appendChild(card);
      });
    });
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var streamUrl = player.getAttribute('data-stream');
    var started = false;
    var hlsInstance = null;

    function playVideo() {
      if (!video || !streamUrl) {
        return;
      }

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (!started) {
        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal && hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
              video.src = streamUrl;
              video.play().catch(function () {});
            }
          });
          return;
        }

        video.src = streamUrl;
      }

      video.play().catch(function () {});
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          playVideo();
        }
      });
    }
  });
})();
