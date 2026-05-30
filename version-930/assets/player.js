(function () {
    function showStatus(element, message) {
        if (!element) {
            return;
        }
        element.textContent = message;
        element.classList.add('show');
        window.clearTimeout(element.__statusTimer);
        element.__statusTimer = window.setTimeout(function () {
            element.classList.remove('show');
        }, 4200);
    }

    function attachHls(video, source, status) {
        if (!source) {
            showStatus(status, '没有检测到播放地址。');
            return Promise.reject(new Error('Missing video source'));
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (video.__hlsInstance) {
                video.__hlsInstance.destroy();
            }
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            video.__hlsInstance = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                showStatus(status, '播放源加载完成，正在播放。');
                video.play().catch(function () {
                    showStatus(status, '浏览器阻止了自动播放，请再次点击播放按钮。');
                });
            });
            hls.on(window.Hls.Events.ERROR, function (_, data) {
                if (data && data.fatal) {
                    showStatus(status, '播放源加载异常，请刷新后重试。');
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                }
            });
            return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            showStatus(status, '使用浏览器原生 HLS 播放。');
            return video.play();
        }

        showStatus(status, '当前浏览器不支持 HLS 播放，请使用最新版浏览器访问。');
        return Promise.reject(new Error('HLS is not supported'));
    }

    function setupPlayer(card) {
        var video = card.querySelector('video[data-src]');
        var button = card.querySelector('[data-play-button]');
        var status = card.querySelector('[data-player-status]');
        if (!video || !button) {
            return;
        }
        var loaded = false;

        function play() {
            button.classList.add('is-hidden');
            if (loaded) {
                video.play().catch(function () {
                    button.classList.remove('is-hidden');
                    showStatus(status, '请再次点击播放。');
                });
                return;
            }
            loaded = true;
            showStatus(status, '正在加载 HLS 播放源。');
            attachHls(video, video.getAttribute('data-src'), status).catch(function () {
                loaded = false;
                button.classList.remove('is-hidden');
            });
        }

        button.addEventListener('click', play);
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                button.classList.remove('is-hidden');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player-card]')).forEach(setupPlayer);
    });
}());
