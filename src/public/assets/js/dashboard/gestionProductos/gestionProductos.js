document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('token')) {
    window.location.href = '/generalViews/login';
    return;
  }

  // Fallback si constans.js no carga antes
  if (typeof HOST === 'undefined') window.HOST = 'http://localhost:3000';
  if (typeof URL_STORE_PRODUCTS === 'undefined') window.URL_STORE_PRODUCTS = '/mySystem/tiendaProductos';

  const sectionComida = document.getElementById('sectionComida');
  const refreshStoreProductsBtn = document.getElementById('refreshStoreProductsBtn');
  const storeProductsTableBody = document.querySelector('#storeProductsTable tbody');

  const storeProductModal = document.getElementById('storeProductModal');
  const storeProductModalLabel = document.getElementById('storeProductModalLabel');
  const storeProductForm = document.getElementById('storeProductForm');

  const storeProductId = document.getElementById('storeProductId');
  const storeProductName = document.getElementById('storeProductName');
  const storeProductCategory = document.getElementById('storeProductCategory');
  const storeProductPrice = document.getElementById('storeProductPrice');
  const storeProductStock = document.getElementById('storeProductStock');
  const storeProductActive = document.getElementById('storeProductActive');
  const storeProductDescription = document.getElementById('storeProductDescription');
  const storeProductImages = document.getElementById('storeProductImages');

  const flavorInput = document.getElementById('flavorInput');
  const addFlavorBtn = document.getElementById('addFlavorBtn');
  const flavorsWrap = document.getElementById('flavorsWrap');
  const imagesList = document.getElementById('imagesList');

  const FIXED_CATEGORIES = ['Alimentos', 'Bebidas', 'Postres', 'Snacks', 'Lácteos', 'Cereales', 'Frutas', 'Verduras', 'Carnes', 'Aseo', 'Limpieza', 'Higiene', 'Otros'];

  const STORE_PRODUCTS_PATH = '/mySystem/tiendaProductos';
  const PAGE_SLUGS = {
    comida_con_alma: 'comida-con-alma'
  };

  let currentFlavors = [];
  let currentProductImages = [];

  function shouldShowFlavors() {
    const cat = storeProductCategory?.value?.trim() || '';
    return ['Alimentos', 'Bebidas', 'Postres', 'Snacks', 'Lácteos', 'Cereales'].includes(cat);
  }

  function toggleFlavorsVisibility() {
    const flavorsSection = flavorInput.closest('.col-12');
    if (shouldShowFlavors()) {
      flavorsSection.style.display = '';
    } else {
      flavorsSection.style.display = 'none';
      currentFlavors = [];
      renderFlavors();
    }
  }

  function moneyCOP(value) {
    const n = Number(value);
    if (Number.isNaN(n)) return value ?? '';
    return n.toLocaleString('es-CO');
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function renderFlavors() {
    flavorsWrap.innerHTML = '';
    currentFlavors.forEach((flavor, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-sm btn-outline-secondary';
      btn.textContent = flavor;
      btn.addEventListener('click', () => {
        currentFlavors.splice(idx, 1);
        renderFlavors();
      });
      flavorsWrap.appendChild(btn);
    });
  }

  function addFlavorFromInput() {
    const value = (flavorInput.value || '').trim();
    if (!value) return;
    if (!currentFlavors.includes(value)) currentFlavors.push(value);
    flavorInput.value = '';
    renderFlavors();
  }

  addFlavorBtn.addEventListener('click', addFlavorFromInput);
  flavorInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFlavorFromInput();
    }
  });

  function renderImagesList(productId) {
    imagesList.innerHTML = '';

    if (!productId) {
      const msg = document.createElement('div');
      msg.className = 'text-muted';
      msg.textContent = 'Guarda el plato para poder subir imágenes.';
      imagesList.appendChild(msg);
      return;
    }

    if (!currentProductImages.length) {
      const msg = document.createElement('div');
      msg.className = 'text-muted';
      msg.textContent = 'Este plato aún no tiene imágenes.';
      imagesList.appendChild(msg);
    }

    currentProductImages.forEach((img) => {
      const row = document.createElement('div');
      row.className = 'd-flex align-items-center justify-content-between gap-2';

      const left = document.createElement('div');
      left.className = 'd-flex align-items-center gap-2';

      const thumb = document.createElement('img');
      thumb.src = img.url_imagen;
      thumb.alt = 'imagen';
      thumb.style.width = '56px';
      thumb.style.height = '56px';
      thumb.style.objectFit = 'cover';
      thumb.style.borderRadius = '8px';

      const meta = document.createElement('div');
      meta.innerHTML = `<div class="small">${escapeHtml(img.url_imagen)}</div>`;

      left.appendChild(thumb);
      left.appendChild(meta);

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn btn-sm btn-outline-danger';
      delBtn.innerHTML = '<i class="fas fa-trash"></i>';
      delBtn.addEventListener('click', async () => {
        if (!confirm('¿Eliminar esta imagen?')) return;
        try {
          const resp = await fetch(`${HOST}${STORE_PRODUCTS_PATH}/${productId}/imagenes/${img.imagen_id}`, { method: 'DELETE' });
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data?.error || 'Error al eliminar imagen');
          currentProductImages = Array.isArray(data.imagenes) ? data.imagenes : [];
          renderImagesList(productId);
        } catch (err) {
          alert(err.message);
        }
      });

      row.appendChild(left);
      row.appendChild(delBtn);
      imagesList.appendChild(row);
    });
  }

  async function uploadImages(productId, files) {
    if (!productId) return;
    if (!files || !files.length) return;

    const formData = new FormData();
    [...files].forEach((f) => formData.append('images', f));

    const resp = await fetch(`${HOST}${STORE_PRODUCTS_PATH}/${productId}/imagenes`, {
      method: 'POST',
      body: formData
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data?.error || 'Error al subir imágenes');

    currentProductImages = Array.isArray(data.imagenes) ? data.imagenes : [];
    renderImagesList(productId);
  }

  async function loadStoreProducts() {
    try {
      const pageSlug = 'comida-con-alma';
      const resp = await fetch(`${HOST}${STORE_PRODUCTS_PATH}?pagina=${encodeURIComponent(pageSlug)}`);
      if (!resp.ok) throw new Error('Error al listar platos');
      const rows = await resp.json();

      storeProductsTableBody.innerHTML = '';

      (rows || []).forEach((p) => {
        const tr = document.createElement('tr');

        const activeTxt = Number(p.activo) === 1 ? 'Sí' : 'No';
        const catTxt = p.categoria || '';

        tr.innerHTML = `
          <td>${escapeHtml(p.producto_id)}</td>
          <td>${escapeHtml(p.nombre)}</td>
          <td>${escapeHtml(catTxt)}</td>
          <td>$ ${escapeHtml(moneyCOP(p.precio_cop))}</td>
          <td>${escapeHtml(p.stock ?? 0)}</td>
          <td>${escapeHtml(activeTxt)}</td>
          <td class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${escapeHtml(p.producto_id)}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-secondary" data-action="images" data-id="${escapeHtml(p.producto_id)}">
              <i class="fas fa-image"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${escapeHtml(p.producto_id)}">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;

        storeProductsTableBody.appendChild(tr);
      });

      storeProductsTableBody.querySelectorAll('button[data-action]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          const id = btn.dataset.id;
          if (!id) return;
          if (action === 'edit') openEditProduct(id);
          if (action === 'images') openImagesManager(id);
          if (action === 'delete') deleteProduct(id);
        });
      });
    } catch (err) {
      alert(err.message);
    }
  }

  refreshStoreProductsBtn.addEventListener('click', loadStoreProducts);

  function resetModalForm() {
    storeProductForm.reset();
    storeProductId.value = '';
    currentFlavors = [];
    currentProductImages = [];
    renderFlavors();
    renderImagesList('');
    storeProductImages.value = '';
    storeProductActive.checked = true;
  }

  document.getElementById('openStoreProductModalBtn').addEventListener('click', () => {
    resetModalForm();
    storeProductModalLabel.textContent = 'Nuevo producto';
    toggleFlavorsVisibility();
  });

  async function openEditProduct(id) {
    try {
      resetModalForm();
      const resp = await fetch(`${HOST}${STORE_PRODUCTS_PATH}/${id}`);
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || 'Error al cargar producto');

      storeProductModalLabel.textContent = 'Editar producto';
      storeProductId.value = data.producto_id;
      storeProductName.value = data.nombre || '';
      storeProductPrice.value = data.precio_cop ?? '';
      storeProductStock.value = data.stock ?? 0;
      storeProductDescription.value = data.descripcion || '';
      storeProductActive.checked = Number(data.activo) === 1;

      const cat = data.categoria || '';
      storeProductCategory.value = FIXED_CATEGORIES.includes(cat) ? cat : '';

      currentFlavors = Array.isArray(data.sabores) ? data.sabores : [];
      renderFlavors();

      currentProductImages = Array.isArray(data.imagenes) ? data.imagenes : [];
      renderImagesList(id);

      toggleFlavorsVisibility();
      bootstrap.Modal.getOrCreateInstance(storeProductModal).show();
    } catch (err) {
      alert(err.message);
    }
  }

  async function openImagesManager(id) {
    await openEditProduct(id);
    storeProductImages.focus();
  }

  async function deleteProduct(id) {
    if (!confirm('¿Eliminar este plato?')) return;
    try {
      const resp = await fetch(`${HOST}${STORE_PRODUCTS_PATH}/${id}`, { method: 'DELETE' });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || 'Error al eliminar plato');
      loadStoreProducts();
    } catch (err) {
      alert(err.message);
    }
  }

  storeProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = storeProductId.value;
    const pageSlug = 'comida-con-alma';

    const payload = {
      nombre: (storeProductName.value || '').trim(),
      categoria: storeProductCategory.value || null,
      precio_cop: Number(storeProductPrice.value || 0),
      stock: Number(storeProductStock.value || 0),
      descripcion: (storeProductDescription.value || '').trim() || null,
      sabores: currentFlavors,
      activo: storeProductActive.checked ? 1 : 0,
      pagina: pageSlug
    };

    if (!payload.nombre || !payload.precio_cop) {
      alert('Nombre y precio son requeridos');
      return;
    }

    try {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `${HOST}${STORE_PRODUCTS_PATH}/${id}` : `${HOST}${STORE_PRODUCTS_PATH}`;

      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || 'Error al guardar plato');

      const savedId = id || data?.data?.[0]?.producto_id;

      if (savedId) {
        try {
          const files = storeProductImages.files;
          await uploadImages(savedId, files);
        } catch (err) {
          alert(err.message);
        }
      }

      bootstrap.Modal.getOrCreateInstance(storeProductModal).hide();
      loadStoreProducts();
    } catch (err) {
      alert(err.message);
    }
  });

  storeProductImages.addEventListener('change', async () => {
    const id = storeProductId.value;
    if (!id) return;

    try {
      await uploadImages(id, storeProductImages.files);
      storeProductImages.value = '';
    } catch (err) {
      alert(err.message);
    }
  });

  storeProductModal.addEventListener('hidden.bs.modal', () => {
    resetModalForm();
  });

  // Listener para mostrar/ocultar sabores al cambiar categoría
  storeProductCategory?.addEventListener('change', toggleFlavorsVisibility);

  // Cargar productos al iniciar
  loadStoreProducts();
});
