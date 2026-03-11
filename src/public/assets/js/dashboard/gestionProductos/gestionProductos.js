document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('token')) {
    window.location.href = '/generalViews/login';
    return;
  }

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
  const storeProductPage = document.getElementById('storeProductPage');
  const storeProductImages = document.getElementById('storeProductImages');

  const flavorInput = document.getElementById('flavorInput');
  const addFlavorBtn = document.getElementById('addFlavorBtn');
  const flavorsWrap = document.getElementById('flavorsWrap');
  const imagesList = document.getElementById('imagesList');

  const FIXED_CATEGORIES = ['Alimentos', 'Bebidas', 'Postres', 'Snacks', 'Lácteos', 'Cereales', 'Frutas', 'Verduras', 'Carnes', 'Aseo', 'Limpieza', 'Higiene', 'Otros', 'libros'];

  const STORE_PRODUCTS_PATH = '/mySystem/tiendaProductos';
  const filterPageSelect = document.getElementById('filterPageSelect');

  let currentFlavors = [];
  let currentProductImages = [];
  let allInventoryMovements = [];

  function parseCopToNumber(raw) {
    const digits = String(raw ?? '').replace(/[^0-9]/g, '');
    return digits ? Number(digits) : 0;
  }

  function formatCopInput(value) {
    const n = parseCopToNumber(value);
    return n ? n.toLocaleString('es-CO') : '';
  }

  function setPriceInputFormatted(n) {
    if (!storeProductPrice) return;
    const num = Number(n);
    storeProductPrice.value = Number.isFinite(num) && num > 0 ? num.toLocaleString('es-CO') : '';
  }

  storeProductPrice?.addEventListener('input', () => {
    const formatted = formatCopInput(storeProductPrice.value);
    storeProductPrice.value = formatted;
  });

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

  addFlavorBtn?.addEventListener('click', addFlavorFromInput);
  flavorInput?.addEventListener('keydown', (e) => {
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

  async function loadInventoryMovements() {
    try {
      const resp = await fetch(`${HOST}${STORE_PRODUCTS_PATH}/movimientos`);
      if (!resp.ok) throw new Error('Error al listar movimientos');
      allInventoryMovements = await resp.json();
      renderInventoryMovements();
    } catch (err) {
      console.error('Error cargando movimientos:', err);
    }
  }

  function renderInventoryMovements() {
    const tbody = document.querySelector('#inventoryMovementsTable tbody');
    if (!tbody) return;
    const quinceDiasAtras = new Date();
    quinceDiasAtras.setDate(quinceDiasAtras.getDate() - 15);
    let filtered = allInventoryMovements.filter(m => {
      const fechaMov = new Date(m.fecha);
      return fechaMov >= quinceDiasAtras;
    });
    const typeFilter = document.getElementById('reportTypeFilter')?.value || 'TODOS';
    const dateFilter = document.getElementById('reportDateFilter')?.value;
    if (typeFilter !== 'TODOS') {
      filtered = filtered.filter(m => m.tipo_movimiento === typeFilter);
    }
    if (dateFilter) {
      filtered = filtered.filter(m => m.fecha.startsWith(dateFilter));
    }
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-3 text-muted">No hay movimientos en los últimos 15 días con estos filtros.</td></tr>';
      return;
    }
    tbody.innerHTML = filtered.map(m => {
      const dateStr = formatearFechaLegible(m.fecha);
      const badgeClass = m.tipo_movimiento === 'ENTRADA' ? 'bg-success' : 'bg-danger';
      return `
        <tr>
          <td>${escapeHtml(dateStr)}</td>
          <td>${escapeHtml(m.producto_nombre)}</td>
          <td><span class="badge ${badgeClass}">${m.tipo_movimiento}</span></td>
          <td>${m.cantidad}</td>
          <td class="small">${escapeHtml(m.motivo || '-')}</td>
        </tr>
      `;
    }).join('');
  }

  document.getElementById('reportTypeFilter')?.addEventListener('change', renderInventoryMovements);
  document.getElementById('reportDateFilter')?.addEventListener('change', renderInventoryMovements);

  function formatearFechaLegible(fecha) {
    if (!fecha) return '-';
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return fecha;
    const opciones = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    return date.toLocaleString('es-CO', opciones).replace(',', '');
  }

  async function loadStoreProducts() {
    try {
      const page = filterPageSelect?.value || 'comida-con-alma';
      const resp = await fetch(`${HOST}${STORE_PRODUCTS_PATH}?pagina=${page}`);
      if (!resp.ok) throw new Error('Error al listar productos');
      const rows = await resp.json();
      storeProductsTableBody.innerHTML = '';
      (rows || []).forEach((p) => {
        const tr = document.createElement('tr');
        const activeTxt = Number(p.activo) === 1 ? 'Sí' : 'No';
        const catTxt = p.categoria || '';
        tr.innerHTML = `
          <td class="text-center">${escapeHtml(p.producto_id)}</td>
          <td>${escapeHtml(p.nombre)}</td>
          <td class="text-center">${escapeHtml(catTxt)}</td>
          <td class="text-center">$ ${escapeHtml(moneyCOP(p.precio_cop))}</td>
          <td class="text-center fw-bold">${escapeHtml(p.stock ?? 0)}</td>
          <td class="text-center">${escapeHtml(activeTxt)}</td>
          <td class="text-center">
            <div class="d-flex justify-content-center gap-2">
              <button class="btn btn-sm btn-outline-info" data-action="inventory" data-id="${escapeHtml(p.producto_id)}" data-name="${escapeHtml(p.nombre)}" title="Añadir Stock">
                <i class="fas fa-boxes-stacked"></i>
              </button>
              <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${escapeHtml(p.producto_id)}" title="Editar Producto">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-outline-secondary" data-action="images" data-id="${escapeHtml(p.producto_id)}" title="Gestionar Imágenes">
                <i class="fas fa-image"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${escapeHtml(p.producto_id)}" title="Eliminar Producto">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        `;
        storeProductsTableBody.appendChild(tr);
      });
      storeProductsTableBody.querySelectorAll('button[data-action]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          const id = btn.dataset.id;
          const name = btn.dataset.name;
          if (!id) return;
          if (action === 'inventory') openInventoryMovement(id, name);
          if (action === 'edit') openEditProduct(id);
          if (action === 'images') openImagesManager(id);
          if (action === 'delete') deleteProduct(id);
        });
      });
      loadInventoryMovements();
    } catch (err) {
      alert(err.message);
    }
  }

  refreshStoreProductsBtn?.addEventListener('click', loadStoreProducts);

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

  document.getElementById('openStoreProductModalBtn')?.addEventListener('click', () => {
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
      setPriceInputFormatted(data.precio_cop);
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

  function openInventoryMovement(id, name) {
    document.getElementById('invProductId').value = id;
    const nameDisplay = document.getElementById('invProductNameDisplay');
    if (nameDisplay) nameDisplay.textContent = name;
    document.getElementById('inventoryMovementForm').reset();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('inventoryMovementModal')).show();
  }

  function getCurrentAdminName() {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    const decodeJWTPayload = (jwtToken) => {
      if (!jwtToken || typeof jwtToken !== 'string') return null;
      const parts = jwtToken.split('.');
      if (parts.length !== 3) return null;
      try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
        const json = decodeURIComponent(
          atob(padded)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(json);
      } catch (_) {
        return null;
      }
    };

    const tokenPayload = decodeJWTPayload(token);

    try {
      const user = userStr ? JSON.parse(userStr) : null;
      
      // Depuración para ver qué campos trae exactamente el usuario
      console.log('User data in localStorage:', user);
      console.log('Token data:', tokenPayload);

      // Prioridad absoluta: 
      // 1. User_username (Campo específico de la base de datos para el nombre de usuario de login)
      // 2. username
      // 3. User_name (Nombre real)
      // 4. nombre
      let name = (user && (user.User_username || user.username || user.User_name || user.nombre)) || 
                 (tokenPayload && (tokenPayload.User_username || tokenPayload.username || tokenPayload.User_name || tokenPayload.nombre)) || 
                 (user && (user.User_email || user.email)) ||
                 'Administrador';
      
      if (typeof name === 'string' && name.includes('@')) {
        name = name.split('@')[0];
      }
                   
      console.log('FINAL ADMIN NAME FOR PDF:', name);
      return name;
    } catch (e) {
      return 'Administrador';
    }
  }

  document.getElementById('inventoryMovementForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('invProductId').value;
    const type = document.getElementById('invType').value;
    const qty = document.getElementById('invQuantity').value;
    const adminName = getCurrentAdminName();
    const reason = `Reposición Manual - Agregado por: ${adminName}`;
    
    try {
      const resp = await fetch(`${HOST}${STORE_PRODUCTS_PATH}/movimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producto_id: id,
          tipo_movimiento: type,
          cantidad: qty,
          motivo: reason
        })
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || 'Error al registrar movimiento');
      }
      bootstrap.Modal.getOrCreateInstance(document.getElementById('inventoryMovementModal')).hide();
      loadStoreProducts();
      alert('Movimiento registrado con éxito');
    } catch (err) {
      alert(err.message);
    }
  });

  storeProductForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = storeProductId.value;

    const priceNumber = parseCopToNumber(storeProductPrice.value);
    const payload = {
      nombre: (storeProductName.value || '').trim(),
      categoria: storeProductCategory.value || null,
      precio_cop: priceNumber,
      stock: Number(storeProductStock.value || 0),
      descripcion: (storeProductDescription.value || '').trim() || null,
      sabores: currentFlavors,
      activo: storeProductActive.checked ? 1 : 0
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

  storeProductImages?.addEventListener('change', async () => {
    const id = storeProductId.value;
    if (!id) return;
    try {
      await uploadImages(id, storeProductImages.files);
      storeProductImages.value = '';
    } catch (err) {
      alert(err.message);
    }
  });

  storeProductModal?.addEventListener('hidden.bs.modal', () => {
    resetModalForm();
  });

  storeProductCategory?.addEventListener('change', toggleFlavorsVisibility);

  if (filterPageSelect) {
    filterPageSelect.addEventListener('change', loadStoreProducts);
  }

  // --- Lógica de Reportes PDF ---
  const reportBtn = document.getElementById('openInventoryReportBtn');
  if (reportBtn) {
    reportBtn.addEventListener('click', async () => {
      try {
        const typeFilter = document.getElementById('reportTypeFilter')?.value || 'TODOS';
        const dateFilter = document.getElementById('reportDateFilter')?.value;
        const quinceDiasAtras = new Date();
        quinceDiasAtras.setDate(quinceDiasAtras.getDate() - 15);

        let movimientosParaPdf = allInventoryMovements.filter(m => {
          const fechaMov = new Date(m.fecha);
          return fechaMov >= quinceDiasAtras;
        });

        if (typeFilter !== 'TODOS') {
          movimientosParaPdf = movimientosParaPdf.filter(m => m.tipo_movimiento === typeFilter);
        }
        if (dateFilter) {
          movimientosParaPdf = movimientosParaPdf.filter(m => m.fecha.startsWith(dateFilter));
        }

        if (movimientosParaPdf.length === 0) {
          alert('No hay movimientos para exportar con los filtros seleccionados en los últimos 15 días.');
          return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Cargar Logo
        try {
          const logoPath = '/assets/imgStatic/logo-circular.png';
          const img = new Image();
          img.src = logoPath;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          const logoSize = 30;
          doc.addImage(img, 'PNG', (pageWidth - logoSize) / 2, 10, logoSize, logoSize);
        } catch (imgError) {
          console.error('No se pudo cargar el logo para el PDF:', imgError);
        }

        // Título centrado
        doc.setFontSize(22);
        doc.setTextColor(150, 53, 59); // Color #96353B
        doc.text('Hija del Fuego', pageWidth / 2, 50, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text('Reporte de Movimientos de Inventario', pageWidth / 2, 60, { align: 'center' });

        // Información de generación
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50); // Color más oscuro para máxima legibilidad
        const fechaGen = new Date().toLocaleString('es-CO');
        const adminName = getCurrentAdminName();
        
        // Dibujar etiquetas y valores con mejor espaciado
        doc.setFont('helvetica', 'bold');
        doc.text('Generado el:', 14, 75);
        doc.setFont('helvetica', 'normal');
        doc.text(fechaGen, 45, 75);

        doc.setFont('helvetica', 'bold');
        doc.text('Generado por:', 14, 82);
        doc.setFont('helvetica', 'normal');
        doc.text(String(adminName), 45, 82); // Asegurar que sea string
        
        doc.setFont('helvetica', 'bold');
        doc.text('Filtros:', 14, 89);
        doc.setFont('helvetica', 'normal');
        let subfiltro = `Tipo: ${typeFilter}`;
        if (dateFilter) subfiltro += ` | Fecha: ${dateFilter}`;
        doc.text(`${subfiltro} (Últimos 15 días)`, 35, 89);

        const tableData = movimientosParaPdf.map(m => [
          formatearFechaLegible(m.fecha),
          m.producto_nombre,
          m.tipo_movimiento,
          m.cantidad,
          m.motivo || '-'
        ]);

        doc.autoTable({
          startY: 100,
          head: [['Fecha', 'Producto', 'Tipo', 'Cant.', 'Motivo']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [150, 53, 59], textColor: [255, 255, 255], halign: 'center' },
          columnStyles: { 2: { halign: 'center' }, 3: { halign: 'center' } },
          styles: { fontSize: 9, cellPadding: 3 }
        });

        const totalPaginas = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPaginas; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(180, 180, 180);
          doc.text(`Página ${i} de ${totalPaginas} - Hija del Fuego Tienda Online`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        }
        doc.save(`reporte_${typeFilter.toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (err) {
        alert('Error al generar PDF: ' + err.message);
      }
    });
  }

  loadStoreProducts();
});