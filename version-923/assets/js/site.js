(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuButton.textContent = open ? '×' : '☰';
    });
  }

  document.querySelectorAll('.site-search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"], input[type="search"]');
      var query = input ? input.value.trim() : '';
      if (!query) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
        return;
      }
      event.preventDefault();
      window.location.href = 'search.html?q=' + encodeURIComponent(query);
    });
  });

  document.querySelectorAll('.movie-filter').forEach(function (input) {
    var scope = input.closest('main') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.filterable .movie-card'));
    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        card.style.display = !value || haystack.indexOf(value) !== -1 ? '' : 'none';
      });
    });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });
})();
