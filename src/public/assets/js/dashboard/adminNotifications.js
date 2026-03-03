document.addEventListener('DOMContentLoaded', () => {
	if (!localStorage.getItem('token')) return;
	if (typeof HOST === 'undefined') window.HOST = 'http://localhost:3000';

	const btn = document.getElementById('adminNotificationsBtn');
	const menu = document.getElementById('adminNotificationsMenu');
	const badge = document.getElementById('adminNotificationsBadge');
	const pedidosCountEl = document.getElementById('adminNotifPedidosCount');
	const mensajesCountEl = document.getElementById('adminNotifMensajesCount');
	const clearBtn = document.getElementById('adminNotificationsClear');
	if (!btn || !menu || !badge || !pedidosCountEl || !mensajesCountEl || !clearBtn) return;

	const KEY = 'admin_notifications_seen_v1';
	const nowIso = () => new Date().toISOString();

	const safeParse = (raw, fallback) => {
		try {
			return raw ? JSON.parse(raw) : fallback;
		} catch {
			return fallback;
		}
	};

	const getSeen = () => safeParse(localStorage.getItem(KEY), { pedidosLastSeen: null, mensajesLastSeen: null });
	const setSeen = (next) => localStorage.setItem(KEY, JSON.stringify(next));

	const parseDate = (v) => {
		const d = new Date(v);
		return Number.isFinite(d.getTime()) ? d : null;
	};

	const isAfter = (a, b) => {
		const da = parseDate(a);
		const db = parseDate(b);
		if (!da || !db) return false;
		return da.getTime() > db.getTime();
	};

	async function fetchPedidos() {
		const res = await fetch('/mySystem/pedidos/');
		if (!res.ok) throw new Error('No se pudieron cargar pedidos');
		return res.json();
	}

	async function fetchMensajes() {
		const res = await fetch(`${HOST}/mySystem/mensajesContacto`);
		if (!res.ok) throw new Error('No se pudieron cargar mensajes');
		return res.json();
	}

	function computeNewCount(items, dateField, lastSeenIso) {
		if (!Array.isArray(items) || !items.length) return 0;
		if (!lastSeenIso) return items.length;
		return items.reduce((acc, it) => {
			const d = it?.[dateField];
			if (d && isAfter(d, lastSeenIso)) return acc + 1;
			return acc;
		}, 0);
	}

	function newestIso(items, dateField) {
		if (!Array.isArray(items) || !items.length) return null;
		let best = null;
		for (const it of items) {
			const v = it?.[dateField];
			if (!v) continue;
			if (!best) {
				best = v;
				continue;
			}
			if (isAfter(v, best)) best = v;
		}
		return best;
	}

	function renderCounts(pedidosNew, mensajesNew) {
		pedidosCountEl.textContent = String(pedidosNew);
		mensajesCountEl.textContent = String(mensajesNew);
		const total = pedidosNew + mensajesNew;
		badge.textContent = String(total);
		badge.hidden = total <= 0;
	}

	async function refresh() {
		try {
			const seen = getSeen();
			const [pedidos, mensajes] = await Promise.all([fetchPedidos(), fetchMensajes()]);
			const pedidosNew = computeNewCount(pedidos, 'fecha_pedido', seen.pedidosLastSeen);
			const mensajesNew = computeNewCount(mensajes, 'fecha_envio', seen.mensajesLastSeen);
			renderCounts(pedidosNew, mensajesNew);
			menu.dataset.latestPedidos = newestIso(pedidos, 'fecha_pedido') || '';
			menu.dataset.latestMensajes = newestIso(mensajes, 'fecha_envio') || '';
		} catch (_e) {
			renderCounts(0, 0);
		}
	}

	const portalId = 'adminNotificationsPortal';
	const ensurePortalMenu = () => {
		let portal = document.getElementById(portalId);
		if (!portal) {
			portal = document.createElement('div');
			portal.id = portalId;
			document.body.appendChild(portal);
		}
		portal.style.position = 'fixed';
		portal.style.zIndex = '99999';
		portal.style.top = '0';
		portal.style.left = '0';
		portal.style.width = '0';
		portal.style.height = '0';
		portal.style.pointerEvents = 'none';

		if (menu.parentElement !== portal) {
			portal.appendChild(menu);
		}
		menu.style.pointerEvents = 'auto';
		menu.style.position = 'fixed';
		return portal;
	};

	const positionMenu = () => {
		ensurePortalMenu();
		const r = btn.getBoundingClientRect();
		const margin = 10;
		menu.style.top = `${Math.max(margin, r.bottom + margin)}px`;
		menu.style.left = 'auto';
		menu.style.right = `${Math.max(margin, window.innerWidth - r.right)}px`;
	};

	function toggleMenu(force) {
		const nextOpen = typeof force === 'boolean' ? force : menu.hidden;
		if (nextOpen) {
			positionMenu();
		}
		menu.hidden = !nextOpen;
	}

	btn.addEventListener('click', (e) => {
		e.preventDefault();
		e.stopPropagation();
		toggleMenu();
	});

	window.addEventListener('resize', () => {
		if (!menu.hidden) positionMenu();
	});

	window.addEventListener('scroll', () => {
		if (!menu.hidden) positionMenu();
	}, true);

	document.addEventListener('click', () => {
		if (!menu.hidden) toggleMenu(false);
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && !menu.hidden) toggleMenu(false);
	});

	clearBtn.addEventListener('click', () => {
		const latestPedidos = menu.dataset.latestPedidos || null;
		const latestMensajes = menu.dataset.latestMensajes || null;
		setSeen({
			pedidosLastSeen: latestPedidos || nowIso(),
			mensajesLastSeen: latestMensajes || nowIso()
		});
		renderCounts(0, 0);
		menu.hidden = true;
	});

	refresh();
	setInterval(refresh, 20000);
});
