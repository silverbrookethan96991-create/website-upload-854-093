(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    document.querySelectorAll('.site-search').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            if (!value) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    var localInput = document.querySelector('[data-local-search]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    function applyLocalFilter() {
        var keyword = localInput ? localInput.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';

        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-category') || '',
                card.getAttribute('data-type') || '',
                card.getAttribute('data-tags') || ''
            ].join(' ').toLowerCase();
            var cardYear = card.getAttribute('data-year') || '';
            var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchedYear = !year || cardYear === year;
            card.style.display = matchedKeyword && matchedYear ? '' : 'none';
        });
    }

    if (localInput) {
        localInput.addEventListener('input', applyLocalFilter);
    }

    if (yearSelect) {
        yearSelect.addEventListener('change', applyLocalFilter);
    }
})();
