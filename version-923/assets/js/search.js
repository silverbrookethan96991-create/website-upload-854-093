(function () {
  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var title = document.getElementById('searchTitle');
  var data = window.SEARCH_INDEX || [];

  if (input && query) {
    input.value = query;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function card(item) {
    return [
      '<a class="movie-card" href="' + escapeHtml(item.file) + '">',
      '  <div class="poster-wrap">',
      '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="year-badge">' + escapeHtml(item.year) + '</span>',
      '    <span class="play-chip">▶</span>',
      '  </div>',
      '  <div class="movie-info">',
      '    <h2>' + escapeHtml(item.title) + '</h2>',
      '    <p>' + escapeHtml(item.one_line) + '</p>',
      '    <div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
      '    <div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>',
      '  </div>',
      '</a>'
    ].join('\n');
  }

  function render() {
    if (!results || !query) {
      return;
    }

    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = data.filter(function (item) {
      var haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.one_line].join(' ').toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 120);

    if (title) {
      title.textContent = '“' + query + '” 的搜索结果';
    }

    if (!matched.length) {
      results.innerHTML = '<div class="empty-result">未找到匹配内容</div>';
      return;
    }

    results.innerHTML = matched.map(card).join('\n');
  }

  render();
})();
