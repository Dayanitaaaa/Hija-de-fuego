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
	const logoutGlobal = document.getElementById('logout-btn-global');
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
		if (userMenuGlobal) userMenuGlobal.style.display = 'block';
		if (logoutGlobal) logoutGlobal.addEventListener('click', handleLogout);

		if (effectiveAdmin && userMenuGlobal) {
			const menu = userMenuGlobal.querySelector('.header-dropdown__menu');
			if (menu) {
				const customerLinks = menu.querySelectorAll('a[href^="/generalViews/perfil"]');
				customerLinks.forEach((a) => {
					a.style.display = 'none';
				});

				const contactLink = document.querySelector('.btn-group-contact a[href="/generalViews/contact"]');
				if (contactLink) contactLink.style.display = 'none';
				const cartIcon = document.querySelector('a[href="/generalViews/cart"]');
				if (cartIcon) cartIcon.style.display = 'none';

				const existing = menu.querySelector('[data-admin-link]');
				if (!existing) {
					const a = document.createElement('a');
					a.className = 'header-dropdown__item';
					a.href = '/dashboard/homeDashboard';
					a.setAttribute('role', 'menuitem');
					a.setAttribute('data-admin-link', '1');
					a.innerHTML = '<i class="bi bi-speedometer2"></i> Ir al Dashboard';
					menu.insertBefore(a, menu.firstChild);
				}
			}
		}

		const userData = localStorage.getItem('user');
		if (userData && triggerGlobal) {
			try {
				const user = JSON.parse(userData);
				if (user && user.User_name) {
					const adminTag = effectiveAdmin ? ' <span style="font-weight:700; opacity:.85;">(Admin)</span>' : '';
					triggerGlobal.innerHTML = `<i class="bi bi-person-circle"></i> Hola, ${user.User_name.split(' ')[0]}${adminTag}`;
				}
			} catch (e) {
				console.error('Error parsing user data', e);
			}
		}
	} else {
		if (authButtonsGlobal) authButtonsGlobal.style.display = 'flex';
		if (userMenuGlobal) userMenuGlobal.style.display = 'none';
	}
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
