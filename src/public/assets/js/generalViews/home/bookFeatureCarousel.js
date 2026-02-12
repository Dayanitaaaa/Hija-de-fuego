(function () {
    const root = document.getElementById('book-feature');
    if (!root) return;

    const track = root.querySelector('.book-feature-track');
    const viewport = root.querySelector('.book-feature-viewport');
    const slides = Array.from(root.querySelectorAll('.book-feature-slide'));
    const dots = Array.from(root.querySelectorAll('.book-feature-dot'));
    const prevBtn = root.querySelector('[data-bf-prev]');
    const nextBtn = root.querySelector('[data-bf-next]');

    if (!track || !viewport || slides.length < 2) return;

    let current = 0;

    const setActive = (index) => {
        const nextIndex = (index + slides.length) % slides.length;
        current = nextIndex;

        const w = viewport.getBoundingClientRect().width;
        track.style.transform = `translateX(-${nextIndex * w}px)`;

        slides.forEach((s, i) => s.classList.toggle('is-active', i === nextIndex));
        dots.forEach((d, i) => d.classList.toggle('is-active', i === nextIndex));
    };

    prevBtn?.addEventListener('click', () => setActive(current - 1));
    nextBtn?.addEventListener('click', () => setActive(current + 1));

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => setActive(i));
    });

    window.addEventListener('resize', () => setActive(current));

    setActive(0);
})();
