(function () {
    function queryAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var slides = queryAll('[data-hero-slide]');
        var dots = queryAll('[data-hero-dot]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
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
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupLocalFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var list = document.querySelector('[data-filter-list]');
        if (!panel || !list) {
            return;
        }
        var keywordInput = panel.querySelector('[data-filter-keyword]');
        var regionInput = panel.querySelector('[data-filter-region]');
        var typeInput = panel.querySelector('[data-filter-type]');
        var yearInput = panel.querySelector('[data-filter-year]');
        var resetButton = panel.querySelector('[data-filter-reset]');
        var count = document.querySelector('[data-filter-count]');
        var cards = queryAll('.movie-card', list);

        function apply() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var region = normalize(regionInput && regionInput.value);
            var type = normalize(typeInput && typeInput.value);
            var year = normalize(yearInput && yearInput.value);
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.tags,
                    card.textContent
                ].join(' '));
                var ok = true;
                ok = ok && (!keyword || text.indexOf(keyword) !== -1);
                ok = ok && (!region || normalize(card.dataset.region).indexOf(region) !== -1);
                ok = ok && (!type || normalize(card.dataset.type).indexOf(type) !== -1);
                ok = ok && (!year || normalize(card.dataset.year).indexOf(year) !== -1);
                card.classList.toggle('hidden-by-filter', !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = '当前显示 ' + visible + ' 部影片';
            }
        }

        [keywordInput, regionInput, typeInput, yearInput].forEach(function (input) {
            if (input) {
                input.addEventListener('input', apply);
                input.addEventListener('change', apply);
            }
        });
        if (resetButton) {
            resetButton.addEventListener('click', function () {
                [keywordInput, regionInput, typeInput, yearInput].forEach(function (input) {
                    if (input) {
                        input.value = '';
                    }
                });
                apply();
            });
        }
        apply();
    }

    function createSearchCard(movie) {
        var tags = Array.isArray(movie.tags) ? movie.tags.join(' ') : '';
        return [
            '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '" data-year="' + escapeHtml(movie.year) + '" data-tags="' + escapeHtml(tags) + '">',
            '    <a class="movie-cover-link" href="' + escapeHtml(movie.url) + '" title="' + escapeHtml(movie.title) + '">',
            '        <img class="movie-cover" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="cover-gradient"></span>',
            '        <span class="cover-meta">' + escapeHtml(movie.year) + '</span>',
            '        <span class="play-chip">立即观看</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <h3 class="movie-card-title line-clamp-2"><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <div class="movie-card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '        <p class="movie-card-desc line-clamp-2">' + escapeHtml(movie.oneLine) + '</p>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function setupSearchPage() {
        var app = document.querySelector('[data-search-app]');
        if (!app || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var keywordInput = app.querySelector('[data-search-keyword]');
        var regionInput = app.querySelector('[data-search-region]');
        var typeInput = app.querySelector('[data-search-type]');
        var yearInput = app.querySelector('[data-search-year]');
        var resetButton = app.querySelector('[data-search-reset]');
        var count = app.querySelector('[data-search-count]');
        var results = app.querySelector('[data-search-results]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        if (keywordInput) {
            keywordInput.value = initialQuery;
        }

        function apply() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var region = normalize(regionInput && regionInput.value);
            var type = normalize(typeInput && typeInput.value);
            var year = normalize(yearInput && yearInput.value);
            var data = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                var text = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' '));
                var ok = true;
                ok = ok && (!keyword || text.indexOf(keyword) !== -1);
                ok = ok && (!region || normalize(movie.region).indexOf(region) !== -1);
                ok = ok && (!type || normalize(movie.type).indexOf(type) !== -1);
                ok = ok && (!year || normalize(movie.year).indexOf(year) !== -1);
                return ok;
            });
            var limited = data.slice(0, 120);
            results.innerHTML = limited.map(createSearchCard).join('');
            count.textContent = '找到 ' + data.length + ' 部影片，当前显示前 ' + limited.length + ' 部';
        }

        [keywordInput, regionInput, typeInput, yearInput].forEach(function (input) {
            if (input) {
                input.addEventListener('input', apply);
                input.addEventListener('change', apply);
            }
        });
        if (resetButton) {
            resetButton.addEventListener('click', function () {
                [keywordInput, regionInput, typeInput, yearInput].forEach(function (input) {
                    if (input) {
                        input.value = '';
                    }
                });
                apply();
            });
        }
        apply();
    }

    function setupScrollPlayer() {
        queryAll('[data-scroll-player]').forEach(function (link) {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupLocalFilters();
        setupSearchPage();
        setupScrollPlayer();
    });
}());
