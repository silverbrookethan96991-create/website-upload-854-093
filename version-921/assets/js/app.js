function toggleMenu() {
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    nav.classList.toggle('is-open');
  }
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function initCardFilters(root) {
  const scope = root || document;
  const keyword = scope.querySelector('[data-filter="keyword"]');
  const category = scope.querySelector('[data-filter="category"]');
  const year = scope.querySelector('[data-filter="year"]');
  const cards = Array.from(scope.querySelectorAll('[data-card]'));
  const empty = scope.querySelector('[data-empty]');

  if (!cards.length) {
    return;
  }

  function applyFilters() {
    const q = normalizeText(keyword ? keyword.value : '');
    const c = normalizeText(category ? category.value : '');
    const y = normalizeText(year ? year.value : '');
    let shown = 0;

    cards.forEach(function(card) {
      const text = normalizeText(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta'));
      const cardCategory = normalizeText(card.getAttribute('data-category'));
      const cardYear = normalizeText(card.getAttribute('data-year'));
      const matchKeyword = !q || text.indexOf(q) !== -1;
      const matchCategory = !c || cardCategory === c;
      const matchYear = !y || cardYear === y;
      const matched = matchKeyword && matchCategory && matchYear;
      card.classList.toggle('hidden-card', !matched);
      if (matched) {
        shown += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', shown === 0);
    }
  }

  [keyword, category, year].forEach(function(input) {
    if (input) {
      input.addEventListener('input', applyFilters);
      input.addEventListener('change', applyFilters);
    }
  });
}

function initHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  let current = 0;
  let timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  function start() {
    if (timer) {
      clearInterval(timer);
    }
    timer = setInterval(function() {
      show(current + 1);
    }, 5200);
  }

  dots.forEach(function(dot, index) {
    dot.addEventListener('click', function() {
      show(index);
      start();
    });
  });

  show(0);
  start();
}

function initMoviePlayer(videoId, buttonId, coverId, source) {
  const video = document.getElementById(videoId);
  const button = document.getElementById(buttonId);
  const cover = document.getElementById(coverId);
  let loaded = false;
  let hlsInstance = null;

  if (!video || !button || !cover || !source) {
    return;
  }

  function loadAndPlay() {
    if (!loaded) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        hlsInstance = new Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }

    cover.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function() {});
    }
  }

  button.addEventListener('click', loadAndPlay);
  cover.addEventListener('click', loadAndPlay);
  video.addEventListener('click', function() {
    if (video.paused) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function() {});
      }
    }
  });

  window.addEventListener('beforeunload', function() {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

window.addEventListener('DOMContentLoaded', function() {
  const menu = document.querySelector('[data-menu-button]');
  if (menu) {
    menu.addEventListener('click', toggleMenu);
  }

  initHero();
  document.querySelectorAll('[data-filter-scope]').forEach(function(scope) {
    initCardFilters(scope);
  });
});
