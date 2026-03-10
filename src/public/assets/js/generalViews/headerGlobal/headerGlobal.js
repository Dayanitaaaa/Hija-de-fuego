document.addEventListener('DOMContentLoaded', function() {
fetch('/generalViews/headerGlobal')
		.then(response => response.text())
		.then(data => {
			const headerContainer = document.querySelector('header');
			if (headerContainer) {
				headerContainer.innerHTML = data;
				updateHeaderGlobalForLogin();
				updateCartCountBadgeGlobal();
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

function updateCartCountBadgeGlobal() {
	let badges = document.querySelectorAll('[data-cart-count]');
	if (!badges.length) {
		const cartLink = document.querySelector('a[href="/generalViews/cart"]');
		if (cartLink) {
			const span = document.createElement('span');
			span.className = 'cart-badge';
			span.setAttribute('data-cart-count', '');
			span.hidden = true;
			span.textContent = '0';
			cartLink.appendChild(span);
			badges = document.querySelectorAll('[data-cart-count]');
		}
	}
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
	if (e.key === 'cart_items_v1') updateCartCountBadgeGlobal();
});

function updateHeaderGlobalForLogin() {
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

	const authButtonsGlobal = document.getElementById('auth-buttons-global');
	const userMenuGlobal = document.getElementById('user-menu-global');
	const authButtonsMobile = document.getElementById('auth-buttons-mobile');
	const userMenuMobile = document.getElementById('user-menu-mobile');
	const logoutGlobal = document.getElementById('logout-btn-global');
	const logoutMobile = document.getElementById('logout-btn-mobile');
	const triggerGlobal = document.getElementById('userDropdownTriggerGlobal');

	const handleLogout = (e) => {
		if (e) e.preventDefault();
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		localStorage.removeItem('role');
		window.location.href = '/generalViews/home';
	};

	if (token) {
		if (authButtonsGlobal) authButtonsGlobal.style.display = 'none';
		if (authButtonsMobile) authButtonsMobile.style.display = 'none';
		if (userMenuGlobal) userMenuGlobal.style.display = 'block';
		if (userMenuMobile) userMenuMobile.style.display = 'block';
		
		if (logoutGlobal) logoutGlobal.addEventListener('click', handleLogout);
		if (logoutMobile) logoutMobile.addEventListener('click', handleLogout);

		if (effectiveAdmin) {
			document.body.classList.add('is-admin');
			// Función para forzar la limpieza del menú de administrador
			const forceCleanupAdminMenu = () => {
				// Ocultar elementos de cliente en desktop y mobile con !important
				const contactLinks = document.querySelectorAll('a[href*="/contact"]');
				contactLinks.forEach(l => l.style.setProperty('display', 'none', 'important'));
				
				const cartIcons = document.querySelectorAll('.cart-icon');
				cartIcons.forEach(i => i.style.setProperty('display', 'none', 'important'));

				if (userMenuGlobal) {
					const menu = userMenuGlobal.querySelector('.header-dropdown__menu, .nav-dropdown__menu');
					if (menu) {
						const links = menu.querySelectorAll('a');
						links.forEach((a) => {
							const href = a.getAttribute('href') || '';
							// Si es link de cliente, ocultar
							if (href.includes('/perfil') || href.includes('/pedidos') || href.includes('/direcciones')) {
								a.style.setProperty('display', 'none', 'important');
							}
						});

						// Asegurar que el link del dashboard exista
						if (!menu.querySelector('[data-admin-link]')) {
							const a = document.createElement('a');
							a.className = 'nav-dropdown__item';
							a.href = '/dashboard/homeDashboard';
							a.setAttribute('role', 'menuitem');
							a.setAttribute('data-admin-link', '1');
							a.innerHTML = '<i class="bi bi-speedometer2"></i> Ir al Dashboard';
							menu.insertBefore(a, menu.firstChild);
						}
					}
				}
				
				if (userMenuMobile) {
					const mobileLinks = userMenuMobile.querySelectorAll('a');
					mobileLinks.forEach((a) => {
						const href = a.getAttribute('href') || '';
						if (href.includes('/perfil') || href.includes('/pedidos') || href.includes('/direcciones')) {
							a.style.setProperty('display', 'none', 'important');
						}
					});
					
					if (!userMenuMobile.querySelector('[data-admin-link]')) {
						const a = document.createElement('a');
						a.className = 'mobile-link';
						a.href = '/dashboard/homeDashboard';
						a.setAttribute('data-admin-link', '1');
						a.innerHTML = '<i class="bi bi-speedometer2"></i> Ir al Dashboard';
						userMenuMobile.insertBefore(a, userMenuMobile.firstChild);
					}
				}
			};

			// Ejecutar limpieza inmediata
			forceCleanupAdminMenu();

			// Observar cambios por si el header se re-renderiza
			const observer = new MutationObserver(forceCleanupAdminMenu);
			if (userMenuGlobal) observer.observe(userMenuGlobal, { childList: true, subtree: true });
			if (userMenuMobile) observer.observe(userMenuMobile, { childList: true, subtree: true });
		}

		const userData = localStorage.getItem('user');
		if (userData && triggerGlobal) {
			try {
				const user = JSON.parse(userData);
				if (user && user.User_name) {
					const adminTag = effectiveAdmin ? ' <span style="font-weight:700; opacity:.85;">(Admin)</span>' : '';
					triggerGlobal.innerHTML = `<i class="bi bi-person-circle"></i> Hola, ${user.User_name.split(' ')[0]}${adminTag}`;
                    
                    const mobileUserMenu = document.getElementById('user-menu-mobile');
                    if (mobileUserMenu) {
                        const welcomeMsg = mobileUserMenu.querySelector('.mobile-welcome-msg');
                        if (!welcomeMsg) {
                            const div = document.createElement('div');
                            div.className = 'mobile-link mobile-welcome-msg';
                            div.style.color = '#d6b36a';
                            div.style.fontWeight = 'bold';
                            div.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
                            div.innerHTML = `<i class="bi bi-person-circle"></i> Hola, ${user.User_name.split(' ')[0]}${adminTag}`;
                            mobileUserMenu.insertBefore(div, mobileUserMenu.firstChild);
                        }
                    }
				}
			} catch (e) {
				console.error('Error parsing user data', e);
			}
		}
	} else {
		if (authButtonsGlobal) authButtonsGlobal.style.display = 'flex';
		if (authButtonsMobile) authButtonsMobile.style.display = 'flex';
		if (userMenuGlobal) userMenuGlobal.style.display = 'none';
		if (userMenuMobile) userMenuMobile.style.display = 'none';
	}
}

function initHamburger() {
	const toggle = document.getElementById('menu-toggle');
	const menu = document.getElementById('mobile-menu');
	if (!toggle || !menu) return;

	toggle.addEventListener('click', () => {
		menu.classList.toggle('open');
		toggle.classList.toggle('active');
	});

	// Cerrar al hacer clic fuera
	document.addEventListener('click', (e) => {
		if (!menu.contains(e.target) && !toggle.contains(e.target) && menu.classList.contains('open')) {
			menu.classList.remove('open');
			toggle.classList.remove('active');
		}
	});
}

function initMobileDropdowns() {
	const trigger = document.getElementById('mobileProductsDropdownTrigger');
	const menu = document.getElementById('mobileProductsDropdownMenu');
	if (!trigger || !menu) return;

	trigger.addEventListener('click', () => {
		menu.classList.toggle('open');
		const isOpen = menu.classList.contains('open');
		trigger.setAttribute('aria-expanded', String(isOpen));
	});
}

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
