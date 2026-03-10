document.addEventListener('DOMContentLoaded', function() {
fetch('/generalViews/headerHome')
	.then(response => response.text())
	.then(data => {
		const headerContainer = document.querySelector('header');
		if (headerContainer) {
			headerContainer.innerHTML = data;
			updateHeaderForLogin();
			updateCartCountBadge();
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

function updateCartCountBadge() {
	const badges = document.querySelectorAll('[data-cart-count]');
	if (!badges.length) return;

	let roleRaw = null;
	try {
		roleRaw = JSON.parse(localStorage.getItem('role'));
	} catch {
		roleRaw = localStorage.getItem('role');
	}
	const roleName = (roleRaw && (roleRaw.name || roleRaw.Roles_name || roleRaw.role)) || String(roleRaw || '');
	const isAdmin = /admin/i.test(roleName) || (roleRaw && Number(roleRaw.id) === 1);
	const viewAs = (localStorage.getItem('view_as') || '').toLowerCase();
	const effectiveAdmin = isAdmin && viewAs !== 'cliente';
	if (effectiveAdmin) {
		badges.forEach((b) => {
			b.hidden = true;
		});
		return;
	}

	let items = [];
	try {
		const raw = localStorage.getItem('cart_items_v1');
		items = raw ? JSON.parse(raw) : [];
		if (!Array.isArray(items)) items = [];
	} catch {
		items = [];
	}
	const count = items.reduce((acc, it) => acc + Math.max(0, Number(it?.qty || 0)), 0);
	badges.forEach((b) => {
		b.textContent = String(count);
		b.hidden = count <= 0;
	});
}

window.addEventListener('storage', (e) => {
	if (e.key === 'cart_items_v1') updateCartCountBadge();
});
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
	const token = localStorage.getItem('token');
	let roleRaw = null;
	try {
		roleRaw = JSON.parse(localStorage.getItem('role'));
	} catch {
		roleRaw = localStorage.getItem('role');
	}
	const roleName = (roleRaw && (roleRaw.name || roleRaw.Roles_name || roleRaw.role)) || String(roleRaw || '');
	const isAdmin = /admin/i.test(roleName) || (roleRaw && Number(roleRaw.id) === 1);
	const viewAs = (localStorage.getItem('view_as') || '').toLowerCase();
	const effectiveAdmin = isAdmin && viewAs !== 'cliente';
	
	// Elementos Header Home
	const authButtonsDesktop = document.getElementById('auth-buttons-desktop');
	const userMenuDesktop = document.getElementById('user-menu-desktop');
	const authButtonsMobile = document.getElementById('auth-buttons-mobile');
	const userMenuMobile = document.getElementById('user-menu-mobile');

	// Elementos Header Global
	const authButtonsGlobal = document.getElementById('auth-buttons-global');
	const userMenuGlobal = document.getElementById('user-menu-global');

	const handleLogout = (e) => {
		if (e) e.preventDefault();
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		localStorage.removeItem('role');
		window.location.href = '/generalViews/home';
	};

	if (token) {
		// Mostrar menús de usuario, ocultar botones de auth
		if (authButtonsDesktop) authButtonsDesktop.style.display = 'none';
		if (userMenuDesktop) userMenuDesktop.style.display = 'block';
		if (authButtonsMobile) authButtonsMobile.style.display = 'none';
		if (userMenuMobile) userMenuMobile.style.display = 'block';
		if (authButtonsGlobal) authButtonsGlobal.style.display = 'none';
		if (userMenuGlobal) userMenuGlobal.style.display = 'block';

		if (effectiveAdmin) {
			document.body.classList.add('is-admin');
			const forceCleanupAdminMenu = () => {
				const desktopMenu = userMenuDesktop?.querySelector?.('.nav-dropdown__menu, .header-dropdown__menu');
				const globalMenu = userMenuGlobal?.querySelector?.('.header-dropdown__menu, .nav-dropdown__menu');
				const mobileMenuLinks = document.querySelectorAll('#user-menu-mobile a[href*="/perfil"], #user-menu-mobile a[href*="/pedidos"], #user-menu-mobile a[href*="/direcciones"]');
				
				mobileMenuLinks.forEach((a) => {
					a.style.setProperty('display', 'none', 'important');
				});

				const contactDesktop = document.querySelector('.desktop-nav a[href*="/contact"]');
				if (contactDesktop) contactDesktop.style.setProperty('display', 'none', 'important');
				const contactMobile = document.querySelector('#mobile-menu a[href*="/contact"]');
				if (contactMobile) contactMobile.style.setProperty('display', 'none', 'important');
				
				const cartDesktop = document.querySelector('.desktop-nav a[href*="/cart"]');
				if (cartDesktop) cartDesktop.style.setProperty('display', 'none', 'important');
				const cartMobile = document.querySelector('.mobile-nav a[href*="/cart"]');
				if (cartMobile) cartMobile.style.setProperty('display', 'none', 'important');
				const cartGlobal = document.querySelector('a[href*="/cart"]');
				if (cartGlobal) cartGlobal.style.setProperty('display', 'none', 'important');

				[desktopMenu, globalMenu].forEach((menu) => {
					if (!menu) return;
					
					// Ocultar links de cliente para administrador
					const customerLinks = menu.querySelectorAll('a');
					customerLinks.forEach((a) => {
						const href = a.getAttribute('href') || '';
						if (href.includes('/perfil') || href.includes('/pedidos') || href.includes('/direcciones')) {
							a.style.setProperty('display', 'none', 'important');
						}
					});

					const existing = menu.querySelector('[data-admin-link]');
					if (existing) return;
					const a = document.createElement('a');
					a.className = menu.classList.contains('nav-dropdown__menu') ? 'nav-dropdown__item' : 'header-dropdown__item';
					a.href = '/dashboard/homeDashboard';
					a.setAttribute('role', 'menuitem');
					a.setAttribute('data-admin-link', '1');
					a.innerHTML = '<i class="bi bi-speedometer2"></i> Ir al Dashboard';
					menu.insertBefore(a, menu.firstChild);
				});
			};

			// Ejecutar limpieza inmediata
			forceCleanupAdminMenu();

			// Observador para mantener los cambios si el DOM se actualiza
			const observer = new MutationObserver(forceCleanupAdminMenu);
			if (userMenuDesktop) observer.observe(userMenuDesktop, { childList: true, subtree: true });
			if (userMenuGlobal) observer.observe(userMenuGlobal, { childList: true, subtree: true });
			if (userMenuMobile) observer.observe(userMenuMobile, { childList: true, subtree: true });
		}

		// Configurar logout
		const logoutDesktop = document.getElementById('logout-btn-desktop');
		const logoutMobile = document.getElementById('logout-btn-mobile');
		const logoutGlobal = document.getElementById('logout-btn-global');

		if (logoutDesktop) logoutDesktop.addEventListener('click', handleLogout);
		if (logoutMobile) logoutMobile.addEventListener('click', handleLogout);
		if (logoutGlobal) logoutGlobal.addEventListener('click', handleLogout);

		// Mostrar nombre de usuario
		const userData = localStorage.getItem('user');
		if (userData) {
			try {
				const user = JSON.parse(userData);
				const triggerDesktop = document.getElementById('userDropdownTrigger');
				const triggerGlobal = document.getElementById('userDropdownTriggerGlobal');
				const adminTag = effectiveAdmin ? ' <span style="font-weight:700; opacity:.85;">(Admin)</span>' : '';
				
				if (triggerDesktop && user.User_name) {
					triggerDesktop.innerHTML = `<i class="bi bi-person-circle"></i> Hola, ${user.User_name.split(' ')[0]}${adminTag}`;
				}
				if (triggerGlobal && user.User_name) {
					triggerGlobal.innerHTML = `<i class="bi bi-person-circle"></i> Hola, ${user.User_name.split(' ')[0]}${adminTag}`;
				}
			} catch (e) {
				console.error("Error parsing user data", e);
			}
		}
	} else {
		// Mostrar botones de auth, ocultar menús de usuario
		if (authButtonsDesktop) authButtonsDesktop.style.display = 'flex';
		if (userMenuDesktop) userMenuDesktop.style.display = 'none';
		if (authButtonsMobile) authButtonsMobile.style.display = 'block';
		if (userMenuMobile) userMenuMobile.style.display = 'none';
		if (authButtonsGlobal) authButtonsGlobal.style.display = 'flex';
		if (userMenuGlobal) userMenuGlobal.style.display = 'none';
	}
}
});
