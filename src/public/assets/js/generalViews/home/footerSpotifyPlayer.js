(function () {
    const card = document.getElementById('home-spotify');
    if (!card) return;

    const audio = card.querySelector('[data-audio]');
    const playBtn = card.querySelector('[data-audio-play]');
    const progress = card.querySelector('[data-audio-progress]');
    const fill = card.querySelector('[data-audio-progress-fill]');
    const currentEl = card.querySelector('[data-audio-current]');
    const durationEl = card.querySelector('[data-audio-duration]');

    if (!audio || !playBtn || !progress || !fill || !currentEl || !durationEl) return;

    const fmt = (secs) => {
        if (!Number.isFinite(secs) || secs < 0) return '0:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    const update = () => {
        const d = audio.duration || 0;
        const t = audio.currentTime || 0;

        durationEl.textContent = fmt(d);
        currentEl.textContent = fmt(t);

        const pct = d ? (t / d) * 100 : 0;
        fill.style.width = `${pct}%`;
        progress.setAttribute('aria-valuenow', String(Math.round(pct)));
    };

    const togglePlay = async () => {
        try {
            if (audio.paused) {
                await audio.play();
            } else {
                audio.pause();
            }
        } catch (e) {
            // ignore
        }
    };

    const seekFromEvent = (evt) => {
        const rect = progress.getBoundingClientRect();
        const x = Math.min(Math.max(0, evt.clientX - rect.left), rect.width);
        const pct = rect.width ? x / rect.width : 0;
        if (audio.duration) audio.currentTime = pct * audio.duration;
    };

    playBtn.addEventListener('click', togglePlay);

    audio.addEventListener('play', () => card.classList.add('is-playing'));
    audio.addEventListener('pause', () => card.classList.remove('is-playing'));
    audio.addEventListener('timeupdate', update);
    audio.addEventListener('loadedmetadata', update);
    audio.addEventListener('durationchange', update);
    audio.addEventListener('ended', () => {
        card.classList.remove('is-playing');
        update();
    });

    progress.addEventListener('click', seekFromEvent);

    progress.addEventListener('keydown', (e) => {
        if (!audio.duration) return;
        const step = 5;
        if (e.key === 'ArrowLeft') {
            audio.currentTime = Math.max(0, audio.currentTime - step);
            e.preventDefault();
        }
        if (e.key === 'ArrowRight') {
            audio.currentTime = Math.min(audio.duration, audio.currentTime + step);
            e.preventDefault();
        }
        if (e.key === ' ' || e.key === 'Enter') {
            togglePlay();
            e.preventDefault();
        }
    });

    update();
})();
