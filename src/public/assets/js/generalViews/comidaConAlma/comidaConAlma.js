document.addEventListener('DOMContentLoaded', () => {
	const items = Array.from(document.querySelectorAll('[data-gallery-item]'));
	const prevBtn = document.querySelector('[data-gallery-prev]');
	const nextBtn = document.querySelector('[data-gallery-next]');
	let index = 0;

	if (!items.length) return;

	const show = (nextIndex) => {
		index = (nextIndex + items.length) % items.length;
		items.forEach((el, i) => {
			const isActive = i === index;
			el.classList.toggle('is-active', isActive);
			el.setAttribute('aria-hidden', isActive ? 'false' : 'true');
		});
	};

	prevBtn?.addEventListener('click', () => show(index - 1));
	nextBtn?.addEventListener('click', () => show(index + 1));

	items.forEach((el, i) => {
		el.addEventListener('click', () => show(i));
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'ArrowLeft') show(index - 1);
		if (e.key === 'ArrowRight') show(index + 1);
	});

	show(0);
});
