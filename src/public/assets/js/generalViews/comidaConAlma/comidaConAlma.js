document.addEventListener('DOMContentLoaded', async () => {
  // Galería de imágenes (carrusel)
  const items = Array.from(document.querySelectorAll('[data-gallery-item]'));
  const prevBtn = document.querySelector('[data-gallery-prev]');
  const nextBtn = document.querySelector('[data-gallery-next]');
  let index = 0;

  if (items.length) {
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

    items.forEach((el, i) => {
      el.addEventListener('click', () => show(i));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });

    show(0);
  }

  // Cargar productos dinámicamente desde la base de datos
  const productsContainer = document.querySelector('.comida-alma-container');
  if (!productsContainer) return;

  try {
    // Fallback si constans.js no carga antes
    if (typeof HOST === 'undefined') window.HOST = 'http://localhost:3000';
    if (typeof URL_STORE_PRODUCTS === 'undefined') window.URL_STORE_PRODUCTS = '/mySystem/tiendaProductos';

    console.log('Cargando productos desde:', `${HOST}${URL_STORE_PRODUCTS}?pagina=comida-con-alma`);
    
    const resp = await fetch(`${HOST}${URL_STORE_PRODUCTS}?pagina=comida-con-alma`);
    if (!resp.ok) throw new Error('Error al cargar productos');
    const products = await resp.json();
    
    console.log('Productos recibidos:', products);

    // Si no hay productos, mantener el HTML estático
    if (!Array.isArray(products) || !products.length) {
      console.log('No hay productos o el array no es válido');
      console.log('products:', products);
      console.log('Array.isArray(products):', Array.isArray(products));
      console.log('products.length:', products.length);
      return;
    }

    console.log('Generando HTML para', products.length, 'productos');

    // Crear HTML dinámico para cada producto
    const productsHTML = products.map((p) => {
      const images = Array.isArray(p.imagenes) ? p.imagenes : [];
      const mainImage = p.imagen_principal || (images.length > 0 ? images[0].url_imagen : '/assets/imgStatic/imagen-yogurt(2).png');
      const chips = Array.isArray(p.sabores) ? p.sabores.map(s => `<span class="product__chip" role="listitem">${s}</span>`).join('') : '';

      return `
        <section class="product" aria-label="Producto destacado">
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
              <h2 class="product__name">${escapeHtml(p.nombre)}</h2>
              <p class="product__price">$${Number(p.precio_cop || 0).toLocaleString('es-CO')} <span class="product__currency">COP</span></p>

              <p class="product__meta">${escapeHtml(p.descripcion || 'Disponible en Santa Marta. Ideal para nutrir y disfrutar.')}</p>

              ${chips ? `
                <div class="product__section">
                  <h3 class="product__subtitle">Sabores</h3>
                  <div class="product__chips" role="list">
                    ${chips}
                  </div>
                </div>
              ` : ''}

              <div class="product__actions" aria-label="Acciones de compra">
                <div class="product__qty" aria-label="Cantidad">
                  <span class="product__qtyLabel">Cantidad</span>
                  <div class="product__qtyBox">
                    <button type="button" class="product__qtyBtn" aria-label="Disminuir cantidad">-</button>
                    <input class="product__qtyInput" type="number" min="1" value="1" aria-label="Cantidad">
                    <button type="button" class="product__qtyBtn" aria-label="Aumentar cantidad">+</button>
                  </div>
                </div>
                <a class="product__buyBtn" href="cart.html" aria-label="Ir al carrito">Agregar al carrito</a>
              </div>
            </div>
          </div>
        </section>
      `;
    }).join('');

    // Insertar productos en el contenedor
    console.log('Insertando productos en el contenedor');
    productsContainer.innerHTML = productsHTML;

    // Re-inicializar carruseles para los nuevos productos
    setTimeout(() => {
      reinitializeCarousels();
    }, 100);

  } catch (err) {
    console.error('Error al cargar productos:', err);
    console.log('Respuesta del servidor:', err.message);
    // Si falla, dejar el HTML estático
  }
});

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function reinitializeCarousels() {
  // Inicializar cada carrusel de producto por separado
  document.querySelectorAll('.product').forEach(productEl => {
    const items = Array.from(productEl.querySelectorAll('[data-gallery-item]'));
    const prevBtn = productEl.querySelector('[data-gallery-prev]');
    const nextBtn = productEl.querySelector('[data-gallery-next]');
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

    items.forEach((el, i) => {
      el.addEventListener('click', () => show(i));
    });

    productEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });

    show(0);
  });
}
