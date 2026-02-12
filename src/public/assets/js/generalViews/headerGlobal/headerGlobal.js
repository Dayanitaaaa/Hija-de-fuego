document.addEventListener('DOMContentLoaded', function() {
fetch('/generalViews/headerGlobal')
		.then(response => response.text())
		.then(data => {
			const headerContainer = document.querySelector('header');
			if (headerContainer) {
				headerContainer.innerHTML = data;
				initHamburger();
				initGlobalProductsDropdown();
				// Ocultar botón de registro si estamos en login o register
				const path = window.location.pathname;
				if (path.includes('/login')) {
					const registerBtn = document.querySelector('.btn-group-contact a[href="/generalViews/register"]');
					if (registerBtn) {
						registerBtn.style.display = 'none';
					}
				}
			}
		});
});

function initGlobalProductsDropdown() {
	const dropdownRoot = document.getElementById('globalProductsDropdown');
	const trigger = document.getElementById('globalProductsDropdownTrigger');
	if (!dropdownRoot || !trigger) return;

	const close = () => {
		dropdownRoot.classList.remove('is-open');
		trigger.setAttribute('aria-expanded', 'false');
	};

	const toggle = () => {
		const isOpen = dropdownRoot.classList.toggle('is-open');
		trigger.setAttribute('aria-expanded', String(isOpen));
	};

	trigger.addEventListener('click', (e) => {
		e.preventDefault();
		e.stopPropagation();
		toggle();
	});

	document.addEventListener('click', (e) => {
		if (!dropdownRoot.contains(e.target)) close();
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') close();
	});
}

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
