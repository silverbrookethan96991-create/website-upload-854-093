(function () {
    var player = document.querySelector('.movie-player');
    if (!player) {
        return;
    }

    var video = player.querySelector('video');
    var cover = player.querySelector('.play-cover');
    var button = player.querySelector('.play-toggle');
    var source = video ? video.querySelector('source') : null;
    var stream = source ? source.getAttribute('src') : '';

    function start() {
        if (!video || !stream) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.getAttribute('src')) {
                video.setAttribute('src', stream);
            }
            video.play().catch(function () {});
        } else if (window.Hls && window.Hls.isSupported()) {
            if (!video.hlsPlayer) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                video.hlsPlayer = hls;
            }
            video.play().catch(function () {});
        } else {
            if (!video.getAttribute('src')) {
                video.setAttribute('src', stream);
            }
            video.play().catch(function () {});
        }

        if (cover) {
            cover.classList.add('is-hidden');
        }
    }

    if (cover) {
        cover.addEventListener('click', start);
    }

    if (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            start();
        });
    }

    if (video) {
        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });
    }
})();
