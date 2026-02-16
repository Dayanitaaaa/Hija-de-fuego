document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('comida-alma-detail');
  if (!root) return;

  const id = (() => {
    const parts = window.location.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  })();

  if (!id) return;

  try {
    if (typeof HOST === 'undefined') window.HOST = 'http://localhost:3000';
    if (typeof URL_STORE_PRODUCTS === 'undefined') window.URL_STORE_PRODUCTS = '/mySystem/tiendaProductos';

    const resp = await fetch(`${HOST}${URL_STORE_PRODUCTS}/${encodeURIComponent(id)}`);
    if (!resp.ok) throw new Error('Error al cargar el producto');
    const p = await resp.json();

    const images = Array.isArray(p.imagenes) ? p.imagenes : [];
    const mainImage = p.imagen_principal || (images[0]?.url_imagen) || '/assets/imgStatic/logo-circular.png';
    const chips = Array.isArray(p.sabores) ? p.sabores.map(s => `<span class="product__chip" role="listitem">${escapeHtml(s)}</span>`).join('') : '';

    root.innerHTML = `
      <div class="shop-header">
        <div class="shop-breadcrumb"><a href="/generalViews/comida-con-alma">← Volver</a></div>
      </div>

      <section class="product" aria-label="Detalle de producto">
        <div class="product__grid">
          <div class="product__gallery" aria-label="Galería del producto">
            <div class="product__mainImage">
              <div class="product__carousel" aria-label="Carrusel de imágenes">
                ${images.length > 1 ? `
                  <button type="button" class="product__nav product__nav--prev" data-gallery-prev aria-label="Imagen anterior">‹</button>
                  ${images.map((img, i) => `
                    <img class="product__img ${i === 0 ? 'is-active' : ''}" data-gallery-item src="${img.url_imagen}" alt="${escapeHtml(p.nombre)} - Imagen ${i + 1}" aria-hidden="${i !== 0 ? 'true' : 'false'}">
                  `).join('')}
                  <button type="button" class="product__nav product__nav--next" data-gallery-next aria-label="Siguiente imagen">›</button>
                ` : `
                  <img class="product__img is-active" src="${mainImage}" alt="${escapeHtml(p.nombre)}" aria-hidden="false">
                `}
              </div>
            </div>
          </div>

          <div class="product__info">
            <div class="product__badge">Producto artesanal</div>
            <h1 class="product__name">${escapeHtml(p.nombre)}</h1>
            <p class="product__price">$${Number(p.precio_cop || 0).toLocaleString('es-CO')} <span class="product__currency">COP</span></p>
            <p class="product__meta">${escapeHtml(p.descripcion || 'Disponible en Santa Marta. Ideal para nutrir y disfrutar.')}</p>

            ${chips ? `
              <div class="product__section">
                <h2 class="product__subtitle">Sabores</h2>
                <div class="product__chips" role="list">
                  ${chips}
                </div>
              </div>
            ` : ''}

            <div class="product__actions" aria-label="Acciones de compra">
              <div class="product__qty" aria-label="Cantidad">
                <span class="product__qtyLabel">Cantidad</span>
                <div class="product__qtyBox">
                  <button type="button" class="product__qtyBtn" data-qty-minus aria-label="Disminuir cantidad">-</button>
                  <input class="product__qtyInput" type="number" min="1" value="1" aria-label="Cantidad">
                  <button type="button" class="product__qtyBtn" data-qty-plus aria-label="Aumentar cantidad">+</button>
                </div>
              </div>
              <button class="product__buyBtn" type="button" data-add-to-cart aria-label="Agregar al carrito">Agregar al carrito</button>
            </div>
          </div>
        </div>
      </section>
    `;

    initCarousel(root);
    initQty(root);
    initAddToCart(root, p);
  } catch (_err) {
    // silencioso
  }
});

function initAddToCart(scope, product) {
  const btn = scope.querySelector('[data-add-to-cart]');
  const qtyInput = scope.querySelector('.product__qtyInput');
  if (!btn || !qtyInput) return;

  btn.addEventListener('click', () => {
    const qty = Math.max(1, Math.floor(Number(qtyInput.value) || 1));
    const item = {
      id: String(product?.producto_id ?? ''),
      name: String(product?.nombre ?? 'Producto'),
      price: Number(product?.precio_cop ?? 0),
      qty,
      image: String(product?.imagen_principal ?? ''),
      type: 'comida-con-alma'
    };

    if (!item.id) {
      window.location.href = '/generalViews/cart';
      return;
    }

    const key = 'cart_items_v1';
    let cart = [];
    try {
      const raw = localStorage.getItem(key);
      cart = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(cart)) cart = [];
    } catch {
      cart = [];
    }

    const idx = cart.findIndex((x) => String(x?.id) === item.id);
    if (idx >= 0) {
      cart[idx].qty = Math.max(1, Number(cart[idx].qty || 1) + item.qty);
    } else {
      cart.push(item);
    }

    localStorage.setItem(key, JSON.stringify(cart));
    window.location.href = '/generalViews/cart';
  });
}

function initCarousel(scope) {
  const items = Array.from(scope.querySelectorAll('[data-gallery-item]'));
  const prevBtn = scope.querySelector('[data-gallery-prev]');
  const nextBtn = scope.querySelector('[data-gallery-next]');
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

  show(0);
}

function initQty(scope) {
  const input = scope.querySelector('.product__qtyInput');
  const minus = scope.querySelector('[data-qty-minus]');
  const plus = scope.querySelector('[data-qty-plus]');

  if (!input) return;

  const get = () => {
    const n = Number(input.value);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  };

  minus?.addEventListener('click', () => {
    input.value = String(Math.max(1, get() - 1));
  });

  plus?.addEventListener('click', () => {
    input.value = String(get() + 1);
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
