(function () {
  function attachPlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var source = player.getAttribute('data-video');
    var hlsInstance = null;

    if (!video || !overlay || !source) {
      return;
    }

    function loadSource() {
      if (video.dataset.ready === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      video.dataset.ready = '1';
      video.controls = true;
    }

    function play() {
      loadSource();
      overlay.classList.add('hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          overlay.classList.remove('hidden');
        });
      }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('hidden');
    });
    video.addEventListener('ended', function () {
      overlay.classList.remove('hidden');
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll('.player').forEach(attachPlayer);
})();
