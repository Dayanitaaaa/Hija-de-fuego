document.addEventListener('DOMContentLoaded', function() {
fetch('/generalViews/headerGlobal')
		.then(response => response.text())
		.then(data => {
			const headerContainer = document.querySelector('header');
			if (headerContainer) {
				headerContainer.innerHTML = data;
				initHamburger();
				// Ocultar botón de registro si estamos en login o register
				const path = window.location.pathname;
				if (path.includes('/login') || path.includes('/register')) {
					const registerBtn = document.querySelector('.btn-group-contact a[href="/generalViews/register"]');
					if (registerBtn) {
						registerBtn.style.display = 'none';
					}
				}
			}
		});
});

function initHamburger() {
	const toggle = document.querySelector('.menu-toggle');
	const nav = document.getElementById('nav-menu');
	if (!toggle || !nav) return;

	const closeMenu = () => {
		toggle.classList.remove('active');
		nav.classList.remove('open');
		toggle.setAttribute('aria-expanded', 'false');
	};

	toggle.addEventListener('click', () => {
		const isOpen = nav.classList.toggle('open');
		toggle.classList.toggle('active', isOpen);
		toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
	});

	window.addEventListener('resize', () => {
		if (window.innerWidth > 1250) {
			closeMenu();
		}
	});
}
