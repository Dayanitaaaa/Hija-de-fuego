document.addEventListener('DOMContentLoaded', async () => {
  const cardsContainer = document.getElementById('comida-con-alma-cards');
  if (!cardsContainer) return;

  try {
    if (typeof HOST === 'undefined') window.HOST = 'http://localhost:3000';
    if (typeof URL_STORE_PRODUCTS === 'undefined') window.URL_STORE_PRODUCTS = '/mySystem/tiendaProductos';

    const url = `${HOST}${URL_STORE_PRODUCTS}?pagina=comida-con-alma`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Error al cargar productos');
    const products = await resp.json();

    if (!Array.isArray(products) || !products.length) return;

    const cardsHTML = products.map((p) => {
      const image = p.imagen_principal || '/assets/imgStatic/logo-circular.png';
      const price = Number(p.precio_cop || 0).toLocaleString('es-CO');
      const href = `/generalViews/comida-con-alma/producto/${p.producto_id}`;

      return `
        <a class="comida-alma-card" href="${href}">
          <div class="comida-alma-card-image-container">
            <img src="${image}" alt="${escapeHtml(p.nombre)}">
          </div>
          <div class="comida-alma-card-info">
            <p class="comida-alma-card-title">${escapeHtml(p.nombre)}</p>
            <p class="comida-alma-card-price">COP ${price}$</p>
          </div>
        </a>
      `;
    }).join('');

    cardsContainer.innerHTML = cardsHTML;
  } catch (_err) {
    // Si falla, dejar la página sin cards dinámicas
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
