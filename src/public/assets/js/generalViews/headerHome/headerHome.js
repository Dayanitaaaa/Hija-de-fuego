document.addEventListener('DOMContentLoaded', function() {
fetch('/generalViews/headerHome')
	.then(response => response.text())
	.then(data => {
		const headerContainer = document.querySelector('header');
		if (headerContainer) {
			headerContainer.innerHTML = data;
			updateHeaderForLogin();
			initProductsDropdown();
			initBrandLoaderNavigation(headerContainer);

			// Lógica para el menú hamburguesa (mobile) usando ids
			const menuToggleBtn = document.getElementById('menu-toggle');
			const mobileMenu = document.getElementById('mobile-menu');

			if (menuToggleBtn && mobileMenu) {
				menuToggleBtn.addEventListener('click', () => {
					mobileMenu.classList.toggle('open');
				});
			}
		}
	});

function initBrandLoaderNavigation(container) {
	if (!container) return;

	const ensureLoaderCss = () => {
		if (document.querySelector('link[href$="/assets/css/loader.css"], link[href$="assets/css/loader.css"], link[href$="assets/css/loader.css"]')) return;
		if (document.getElementById('brandLoaderCss')) return;
		const link = document.createElement('link');
		link.id = 'brandLoaderCss';
		link.rel = 'stylesheet';
		link.href = '/assets/css/loader.css';
		document.head.appendChild(link);
	};

	const ensureLoaderEl = () => {
		let el = document.getElementById('pageLoader');
		if (el) return el;
		const html = `
			<div class="page-loader hidden" id="pageLoader">
				<div class="campfire-loader">
					<div class="fire-container">
						<div class="flame flame-main"></div>
						<div class="flame flame-left"></div>
						<div class="flame flame-right"></div>
					</div>
					<div class="logs">
						<div class="log"></div>
						<div class="log"></div>
					</div>
					<div class="embers">
						<div class="ember"></div>
						<div class="ember"></div>
						<div class="ember"></div>
						<div class="ember"></div>
					</div>
					<div class="sparkles"></div>
				</div>
			</div>
		`;
		document.body.insertAdjacentHTML('afterbegin', html);
		return document.getElementById('pageLoader');
	};

	const showLoader = () => {
		ensureLoaderCss();
		const el = ensureLoaderEl();
		if (!el) return;
		el.classList.remove('hidden');
		document.body.classList.add('loading');
	};

	container.addEventListener('click', (e) => {
		const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
		if (!a) return;
		if (a.hasAttribute('download')) return;
		if (a.getAttribute('target') === '_blank') return;

		const href = a.getAttribute('href');
		if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

		let url;
		try {
			url = new URL(href, window.location.href);
		} catch {
			return;
		}
		if (url.origin !== window.location.origin) return;
		if (url.href === window.location.href) return;

		e.preventDefault();
		showLoader();
		requestAnimationFrame(() => {
			setTimeout(() => {
				window.location.href = url.href;
			}, 50);
		});
	});
}

function initProductsDropdown() {
	const dropdownRoot = document.getElementById('productsDropdown');
	const trigger = document.getElementById('productsDropdownTrigger');
	const mobileTrigger = document.getElementById('mobileProductsDropdownTrigger');
	const mobileMenu = document.getElementById('mobileProductsDropdownMenu');

	const closeDesktop = () => {
		if (!dropdownRoot || !trigger) return;
		dropdownRoot.classList.remove('is-open');
		trigger.setAttribute('aria-expanded', 'false');
	};

	const toggleDesktop = () => {
		if (!dropdownRoot || !trigger) return;
		const isOpen = dropdownRoot.classList.toggle('is-open');
		trigger.setAttribute('aria-expanded', String(isOpen));
	};

	if (trigger && dropdownRoot) {
		trigger.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			toggleDesktop();
		});

		document.addEventListener('click', (e) => {
			if (!dropdownRoot.contains(e.target)) closeDesktop();
		});

		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') closeDesktop();
		});
	}

	if (mobileTrigger && mobileMenu) {
		mobileTrigger.addEventListener('click', () => {
			const isOpen = mobileMenu.classList.toggle('open');
			mobileTrigger.setAttribute('aria-expanded', String(isOpen));
		});
	}
}

function updateHeaderForLogin() {
	// Si hay token, modificar el header
	const token = localStorage.getItem('token');
	if (token) {
		// Ocultar botón de Registrarse
		const registerBtn = document.querySelector('.btn-group-contact a[href="register.html"]');
		if (registerBtn) {
			registerBtn.style.display = 'none';
		}
		// Mover el carrito a la posición del botón de registrarse
		const cartLi = document.querySelector('.icon-li');
		const contactDiv = document.querySelector('.btn-group-contact');
		if (cartLi && contactDiv) {
			// Eliminar el carrito de su posición original
			cartLi.parentNode.removeChild(cartLi);
			// Insertar el carrito después del botón de contacto
			contactDiv.appendChild(cartLi.querySelector('a'));
			// Eliminar el <li> vacío si queda
		}
		// Crear dropdown de usuario en la posición original del carrito
		const navMenu = document.querySelector('.nav-menu');
		if (navMenu) {
			const userDropdownLi = document.createElement('li');
			userDropdownLi.className = 'user-dropdown-li';
			userDropdownLi.innerHTML = `
				<div class="dropdown user-dropdown">
					<a href="#" class="header-btn user-btn">Usuario <i class="bi bi-person-circle"></i></a>
					<ul class="dropdown-menu">
						<li><a href="/perfil">Perfil</a></li>
						<li><a href="#" id="logout-btn">Cerrar sesión</a></li>
					</ul>
				</div>
			`;
			// Insertar el dropdown en la posición original del carrito (último <li>)
			navMenu.appendChild(userDropdownLi);
			// Evento para cerrar sesión
			const logoutBtn = userDropdownLi.querySelector('#logout-btn');
			if (logoutBtn) {
				logoutBtn.addEventListener('click', function(e) {
					e.preventDefault();
					if (window.logOutUser) {
						window.logOutUser();
					} else {
						localStorage.removeItem('token');
						localStorage.removeItem('role');
						window.location.href = '/generalViews/login';
					}
				});
			}
		}
	}
}
});
