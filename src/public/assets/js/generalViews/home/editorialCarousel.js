(function () {
    const root = document.getElementById('editorial-carousel');
    if (!root) return;

    const track = root.querySelector('.editorial-carousel-track');
    const viewport = root.querySelector('.editorial-carousel-viewport');
    const items = Array.from(root.querySelectorAll('.editorial-item'));
    const dots = Array.from(root.querySelectorAll('.editorial-carousel-dot'));
    const prevBtn = root.querySelector('[data-ec-prev]');
    const nextBtn = root.querySelector('[data-ec-next]');

    if (!track || !viewport || !items.length) return;

    const getItemsPerPage = () => {
        const w = window.innerWidth;
        if (w <= 560) return 1;
        if (w <= 980) return 2;
        return 4;
    };

    let page = 0;

    const pagesCount = () => Math.max(1, Math.ceil(items.length / getItemsPerPage()));

    const syncDots = () => {
        const count = pagesCount();
        dots.forEach((d, i) => {
            d.style.display = i < count ? 'inline-block' : 'none';
            d.classList.toggle('is-active', i === page);
        });
    };

    const goToPage = (p) => {
        const count = pagesCount();
        page = ((p % count) + count) % count;
        const viewportWidth = viewport.getBoundingClientRect().width;
        track.style.transform = `translateX(-${page * viewportWidth}px)`;
        syncDots();
    };

    prevBtn?.addEventListener('click', () => goToPage(page - 1));
    nextBtn?.addEventListener('click', () => goToPage(page + 1));

    dots.forEach((dot, i) => dot.addEventListener('click', () => goToPage(i)));

    window.addEventListener('resize', () => goToPage(page));

    goToPage(0);
})();
