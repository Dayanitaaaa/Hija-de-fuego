let pedidos = [];
let pedidosFiltrados = [];
let paginaActual = 1;
const pedidosPorPagina = 10;
let pedidoActual = null;

document.addEventListener('DOMContentLoaded', function() {
    cargarPedidos();
    
    // Event listeners para filtros
    document.getElementById('searchInput').addEventListener('input', aplicarFiltros);
    document.getElementById('estadoFilter').addEventListener('change', aplicarFiltros);
    document.getElementById('fechaFilter').addEventListener('change', aplicarFiltros);
});

async function cargarPedidos() {
    try {
        const response = await fetch('/mySystem/pedidos/');
        if (!response.ok) throw new Error('Error al cargar pedidos');
        pedidos = await response.json();
        pedidosFiltrados = [...pedidos];
        renderizarPedidos();
        renderizarPaginacion();
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        Swal.fire('Error', 'No se pudieron cargar los pedidos', 'error');
    }
}

function aplicarFiltros() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const estadoFilter = document.getElementById('estadoFilter').value;
    const fechaFilter = document.getElementById('fechaFilter').value;

    pedidosFiltrados = pedidos.filter(pedido => {
        // Filtro por búsqueda
        const matchBusqueda = !searchTerm || 
            pedido.cliente_nombre.toLowerCase().includes(searchTerm) ||
            pedido.cliente_email.toLowerCase().includes(searchTerm);

        // Filtro por estado
        const matchEstado = !estadoFilter || pedido.estado === estadoFilter;

        // Filtro por fecha
        let matchFecha = true;
        if (fechaFilter) {
            const pedidoFecha = new Date(pedido.fecha_pedido).toISOString().split('T')[0];
            matchFecha = pedidoFecha === fechaFilter;
        }

        return matchBusqueda && matchEstado && matchFecha;
    });

    paginaActual = 1;
    renderizarPedidos();
    renderizarPaginacion();
}

function renderizarPedidos() {
    const tbody = document.getElementById('pedidosTableBody');
    const inicio = (paginaActual - 1) * pedidosPorPagina;
    const fin = inicio + pedidosPorPagina;
    const pedidosPagina = pedidosFiltrados.slice(inicio, fin);

    if (pedidosPagina.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No se encontraron pedidos</td></tr>';
        return;
    }

    tbody.innerHTML = pedidosPagina.map(pedido => `
        <tr>
            <td><strong>#${pedido.pedido_id}</strong></td>
            <td>${pedido.cliente_nombre}</td>
            <td>${pedido.cliente_email}</td>
            <td>$${pedido.total.toLocaleString()}</td>
            <td>${getEstadoBadge(pedido.estado)}</td>
            <td>${formatearFecha(pedido.fecha_pedido)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="verDetalle(${pedido.pedido_id})" title="Ver detalle">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderizarPaginacion() {
    const totalPaginas = Math.ceil(pedidosFiltrados.length / pedidosPorPagina);
    const pagination = document.getElementById('pagination');

    if (totalPaginas <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';

    // Botón anterior
    html += `
        <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1})">Anterior</a>
        </li>
    `;

    // Números de página
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= paginaActual - 1 && i <= paginaActual + 1)) {
            html += `
                <li class="page-item ${i === paginaActual ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="cambiarPagina(${i})">${i}</a>
                </li>
            `;
        } else if (i === paginaActual - 2 || i === paginaActual + 2) {
            html += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
        }
    }

    // Botón siguiente
    html += `
        <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1})">Siguiente</a>
        </li>
    `;

    pagination.innerHTML = html;
}

function cambiarPagina(pagina) {
    paginaActual = pagina;
    renderizarPedidos();
    renderizarPaginacion();
}

function limpiarFiltros() {
    document.getElementById('searchInput').value = '';
    document.getElementById('estadoFilter').value = '';
    document.getElementById('fechaFilter').value = '';
    aplicarFiltros();
}

function getEstadoBadge(estado) {
    const badges = {
        'PENDIENTE': '<span class="badge bg-warning">Pendiente</span>',
        'PREPARANDO': '<span class="badge bg-info">Preparando</span>',
        'ENVIADO': '<span class="badge bg-primary">Enviado</span>',
        'ENTREGADO': '<span class="badge bg-success">Entregado</span>',
        'CANCELADO': '<span class="badge bg-danger">Cancelado</span>'
    };
    return badges[estado] || estado;
}

function formatearFecha(fecha) {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function verDetalle(pedidoId) {
    try {
        const response = await fetch(`/mySystem/pedidos/${pedidoId}`);
        const pedido = await response.json();
        
        pedidoActual = pedido;
        
        // Llenar modal con datos del pedido
        document.getElementById('modalPedidoId').textContent = pedido.pedido_id;
        document.getElementById('modalClienteNombre').textContent = pedido.cliente_nombre;
        document.getElementById('modalClienteEmail').textContent = pedido.cliente_email;
        document.getElementById('modalClienteTelefono').textContent = pedido.cliente_telefono || 'No especificado';
        document.getElementById('modalDireccion').textContent = pedido.direccion;
        document.getElementById('modalCiudad').textContent = pedido.ciudad;
        document.getElementById('modalDepartamento').textContent = pedido.departamento;
        document.getElementById('modalNotas').textContent = pedido.notas || 'Sin notas';
        document.getElementById('modalTotal').textContent = pedido.total.toLocaleString();
        document.getElementById('modalEstadoBadge').innerHTML = getEstadoBadge(pedido.estado);
        
        // Establecer estado actual en el select
        const select = document.getElementById('nuevoEstadoSelect');
        select.value = pedido.estado;

        // Bloquear estados anteriores
        const estadosOrden = ['PENDIENTE', 'PREPARANDO', 'ENVIADO', 'ENTREGADO'];
        const indexActual = estadosOrden.indexOf(pedido.estado);
        const finalizados = ['ENTREGADO', 'CANCELADO'];

        Array.from(select.options).forEach(option => {
            const indexOption = estadosOrden.indexOf(option.value);
            
            // Si el pedido ya terminó, deshabilitar todo
            if (finalizados.includes(pedido.estado)) {
                option.disabled = true;
            } 
            // Si es un estado del flujo normal
            else if (indexOption !== -1) {
                // Deshabilitar si es menor o igual al actual (excepto el actual para que se vea)
                option.disabled = indexOption < indexActual;
            }
            // Regla para CANCELADO
            else if (option.value === 'CANCELADO') {
                option.disabled = !['PENDIENTE', 'PREPARANDO'].includes(pedido.estado);
            }
        });

        // Deshabilitar botón Guardar si ya está finalizado
        const btnGuardar = document.querySelector('#detallePedidoModal .btn-primary[onclick="cambiarEstado()"]');
        if (btnGuardar) {
            btnGuardar.disabled = finalizados.includes(pedido.estado);
        }
        
        // Llenar tabla de productos
        const productosBody = document.getElementById('modalProductosTableBody');
        productosBody.innerHTML = pedido.detalles.map(detalle => `
            <tr>
                <td>${detalle.nombre || 'Producto #' + detalle.producto_fk}</td>
                <td>${detalle.cantidad}</td>
                <td>$${detalle.precio_unitario.toLocaleString()}</td>
                <td>$${detalle.subtotal.toLocaleString()}</td>
            </tr>
        `).join('');
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('detallePedidoModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error al cargar detalle del pedido:', error);
        Swal.fire('Error', 'No se pudo cargar el detalle del pedido', 'error');
    }
}

async function cambiarEstado() {
    if (!pedidoActual) return;
    
    const nuevoEstado = document.getElementById('nuevoEstadoSelect').value;
    
    if (nuevoEstado === pedidoActual.estado) {
        Swal.fire('Info', 'El estado es el mismo que el actual', 'info');
        return;
    }
    
    try {
        const response = await fetch(`/mySystem/pedidos/${pedidoActual.pedido_id}/estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        
        if (response.ok) {
            Swal.fire('Éxito', 'Estado actualizado correctamente', 'success');
            
            // Actualizar datos locales
            pedidoActual.estado = nuevoEstado;
            
            // Actualizar badge en el modal
            document.getElementById('modalEstadoBadge').innerHTML = getEstadoBadge(nuevoEstado);
            
            // Recargar la lista de pedidos
            await cargarPedidos();
            
            // Cerrar modal después de 2 segundos
            setTimeout(() => {
                bootstrap.Modal.getInstance(document.getElementById('detallePedidoModal')).hide();
            }, 2000);
            
        } else {
            const error = await response.json();
            Swal.fire('Error', error.error || 'No se pudo actualizar el estado', 'error');
        }
        
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
    }
}
