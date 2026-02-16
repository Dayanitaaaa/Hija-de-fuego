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
  return {
    id: String(item.id ?? ''),
    name: String(item.name ?? ''),
    price,
    qty,
    image: String(item.image ?? ''),
    type: String(item.type ?? 'item')
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

    return `
      <article class="cart-item" data-cart-item data-id="${encodeURIComponent(it.id)}">
        <img class="cart-item__img" src="${img}" alt="${escapeHtml(it.name)}">
        <div>
          <h3 class="cart-item__name">${escapeHtml(it.name)}</h3>
          <p class="cart-item__meta">${escapeHtml(it.type)} · ${formatCOP(it.price)}</p>
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
      items[idx].qty = Math.max(1, safeNumber(items[idx].qty, 1) + 1);
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

    items[idx].qty = Math.max(1, Math.floor(safeNumber(target.value, 1)));
    writeCart(items);
    render();
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();

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

    if (hint) hint.textContent = 'Pedido listo. (Por ahora se guarda localmente)';

    localStorage.setItem('checkout_draft_v1', JSON.stringify(payload));
    writeCart([]);
    render();
    form.reset();

    setTimeout(() => {
      if (hint) hint.textContent = '';
    }, 4000);
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
