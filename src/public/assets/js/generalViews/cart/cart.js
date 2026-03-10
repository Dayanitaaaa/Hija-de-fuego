const CART_KEY = 'cart_items_v1';

function formatCOP(value) {
  const n = Number(value || 0);
  return `COP ${n.toLocaleString('es-CO')}`;
}

function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function normalizeItem(item) {
  const qty = Math.max(1, Math.floor(safeNumber(item.qty, 1)));
  const price = safeNumber(item.price, 0);
  const stockRaw = item?.stock;
  const stock = stockRaw === undefined || stockRaw === null || stockRaw === '' ? null : Math.floor(safeNumber(stockRaw, NaN));
  const safeStock = Number.isFinite(stock) && stock >= 0 ? stock : null;
  const safeQty = safeStock === null ? qty : Math.min(qty, safeStock);
  return {
    id: String(item.id ?? ''),
    name: String(item.name ?? ''),
    price,
    qty: safeQty,
    image: String(item.image ?? ''),
    flavor: String(item.flavor ?? ''),
    type: String(item.type ?? 'item'),
    stock: safeStock
  };
}

function calcSubtotal(items) {
  return items.reduce((acc, it) => acc + safeNumber(it.price, 0) * safeNumber(it.qty, 0), 0);
}

function render() {
  const itemsRoot = document.querySelector('[data-cart-items]');
  const subtotalEl = document.querySelector('[data-cart-subtotal]');
  const totalEl = document.querySelector('[data-cart-total]');

  if (!itemsRoot || !subtotalEl || !totalEl) return;

  const items = readCart().map(normalizeItem).filter(it => it.id && it.qty > 0);
  writeCart(items);

  if (!items.length) {
    itemsRoot.innerHTML = '<div class="cart-empty">Tu carrito está vacío. Agrega productos para continuar.</div>';
    subtotalEl.textContent = formatCOP(0);
    totalEl.textContent = formatCOP(0);
    return;
  }

  itemsRoot.innerHTML = items.map((it) => {
    const img = it.image || '/assets/imgStatic/logo-circular.png';
    const line = safeNumber(it.price, 0) * safeNumber(it.qty, 0);
    const metaParts = [it.type, formatCOP(it.price)];
    if (it.flavor) metaParts.unshift(`Sabor: ${it.flavor}`);

    return `
      <article class="cart-item" data-cart-item data-id="${encodeURIComponent(it.id)}">
        <img class="cart-item__img" src="${img}" alt="${escapeHtml(it.name)}">
        <div>
          <h3 class="cart-item__name">${escapeHtml(it.name)}</h3>
          <p class="cart-item__meta">${escapeHtml(metaParts.join(' · '))}</p>
        </div>
        <div class="cart-item__actions">
          <div class="cart-item__price">${formatCOP(line)}</div>
          <div class="qty" aria-label="Cantidad">
            <button type="button" data-qty-minus aria-label="Disminuir">-</button>
            <input type="number" min="1" value="${it.qty}" data-qty-input aria-label="Cantidad">
            <button type="button" data-qty-plus aria-label="Aumentar">+</button>
          </div>
          <button type="button" class="cart-remove" data-remove>Quitar</button>
        </div>
      </article>
    `;
  }).join('');

  const subtotal = calcSubtotal(items);
  subtotalEl.textContent = formatCOP(subtotal);
  totalEl.textContent = formatCOP(subtotal);
}

function bindEvents() {
  const itemsRoot = document.querySelector('[data-cart-items]');
  const clearBtn = document.querySelector('[data-cart-clear]');
  const form = document.querySelector('[data-checkout-form]');
  const hint = document.querySelector('[data-checkout-hint]');

	const showNiceAlert = (title, text) => {
		if (window.Swal && typeof window.Swal.fire === 'function') {
			window.Swal.fire({
				icon: 'error',
				title,
				text,
				confirmButtonText: 'Entendido',
				confirmButtonColor: '#96353b',
				background: '#fffaf2'
			});
			return;
		}
		alert(`${title}\n\n${text}`);
	};

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

  const requireLoginOrRedirect = () => {
    const token = localStorage.getItem('token');
    if (token) return token;

    try {
      localStorage.setItem('post_login_redirect', window.location.pathname || '/generalViews/cart');
    } catch {
      // ignore
    }

    window.location.href = '/generalViews/login';
    return null;
  };

  clearBtn?.addEventListener('click', () => {
    writeCart([]);
    render();
  });

  itemsRoot?.addEventListener('click', (e) => {
    const target = e.target;
    const itemEl = target?.closest?.('[data-cart-item]');
    if (!itemEl) return;

    const id = decodeURIComponent(itemEl.getAttribute('data-id') || '');
    if (!id) return;

    const items = readCart().map(normalizeItem);
    const idx = items.findIndex((it) => it.id === id);
    if (idx === -1) return;

    if (target.matches('[data-remove]')) {
      items.splice(idx, 1);
      writeCart(items);
      render();
      return;
    }

    if (target.matches('[data-qty-minus]')) {
      items[idx].qty = Math.max(1, safeNumber(items[idx].qty, 1) - 1);
      writeCart(items);
      render();
      return;
    }

    if (target.matches('[data-qty-plus]')) {
      const next = Math.max(1, safeNumber(items[idx].qty, 1) + 1);
      const limit = Number.isFinite(items[idx].stock) ? items[idx].stock : null;
      items[idx].qty = limit === null ? next : Math.min(next, limit);
      writeCart(items);
      render();
    }
  });

  itemsRoot?.addEventListener('change', (e) => {
    const target = e.target;
    if (!target?.matches?.('[data-qty-input]')) return;

    const itemEl = target.closest('[data-cart-item]');
    if (!itemEl) return;

    const id = decodeURIComponent(itemEl.getAttribute('data-id') || '');
    const items = readCart().map(normalizeItem);
    const idx = items.findIndex((it) => it.id === id);
    if (idx === -1) return;

    const requested = Math.max(1, Math.floor(safeNumber(target.value, 1)));
    const limit = Number.isFinite(items[idx].stock) ? items[idx].stock : null;
    items[idx].qty = limit === null ? requested : Math.min(requested, limit);
    writeCart(items);
    render();
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();

		if (effectiveAdmin) {
			if (hint) hint.textContent = 'Tu sesión es de Administrador. Para comprar, entra como cliente.';
			showNiceAlert('Acción no permitida', 'Tu sesión es de Administrador. Para realizar compras, entra como cliente.');
			return;
		}

    const token = requireLoginOrRedirect();
    if (!token) return;

    const items = readCart().map(normalizeItem).filter((it) => it.id);
    if (!items.length) {
      if (hint) hint.textContent = 'Tu carrito está vacío.';
      return;
    }

    const fd = new FormData(form);
    const payload = {
      customer: {
        fullName: String(fd.get('fullName') || '').trim(),
        phone: String(fd.get('phone') || '').trim(),
        email: String(fd.get('email') || '').trim(),
      },
      shipping: {
        address: String(fd.get('address') || '').trim(),
        city: String(fd.get('city') || '').trim(),
        state: String(fd.get('state') || '').trim(),
        notes: String(fd.get('notes') || '').trim(),
      },
      items,
      total: calcSubtotal(items),
      createdAt: new Date().toISOString(),
    };

    const missing = [
      payload.customer.fullName,
      payload.customer.phone,
      payload.customer.email,
      payload.shipping.address,
      payload.shipping.city,
      payload.shipping.state,
    ].some((v) => !v);

    if (missing) {
      if (hint) hint.textContent = 'Completa todos los campos obligatorios.';
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Procesando...';

    if (typeof HOST === 'undefined') window.HOST = 'http://localhost:3000';

    fetch(`${HOST}/mySystem/tiendaProductos/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const contentType = res.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
          data = await res.json();
        } else {
          const text = await res.text();
          console.error('Respuesta no JSON recibida:', text);
          throw new Error('El servidor devolvió una respuesta inesperada. Por favor, intenta de nuevo.');
        }

        if (!res.ok) {
          // Si el token es inválido o expiró, redirigir al login
          if (res.status === 401) {
            showNiceAlert('Sesión expirada', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            setTimeout(() => {
              localStorage.removeItem('token');
              window.location.href = '/generalViews/login';
            }, 3000);
            return;
          }
          throw new Error(data.error || data.message || 'Error al procesar pedido');
        }

        if (hint) hint.textContent = '¡Pedido realizado con éxito! El stock ha sido actualizado.';
        writeCart([]);
        render();
        form.reset();
        localStorage.setItem('checkout_draft_v1', JSON.stringify(payload));
      })
      .catch((err) => {
        console.error('Error en checkout:', err);
        if (hint) hint.textContent = 'Error: ' + err.message;
        showNiceAlert('Error en el pedido', err.message);
      })
      .finally(() => {
        btn.disabled = false;
        btn.textContent = originalText;
        setTimeout(() => {
          if (hint) hint.textContent = '';
        }, 5000);
      });
  });
}

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  render();
  bindEvents();
});
