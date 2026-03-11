document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/generalViews/login';
        return;
    }

    // Intentar recuperar sesión desde el backend si localStorage user es null o incompleto
    let userData = localStorage.getItem('user');
    
    if (!userData || userData === 'null' || userData === 'undefined') {
        console.log('Sesión local vacía, recuperando del servidor...');
        try {
            const res = await fetch(`${HOST}/mySystem/users/profile/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('user', JSON.stringify(data));
                userData = JSON.stringify(data);
                console.log('Sesión recuperada con éxito');
            } else {
                throw new Error('Sesión expirada');
            }
        } catch (err) {
            console.error(err);
            localStorage.clear();
            window.location.href = '/generalViews/login';
            return;
        }
    }

    if (userData) {
        try {
            const user = JSON.parse(userData);
            
            // Asegurar que el ID esté presente y NORMALIZARLO
            const userId = user.User_id || user.id || user.id_user;
            const userName = user.User_name || user.name || '';
            const userEmail = user.User_email || user.email || '';
            const userPhone = user.User_phone || user.phone || '';

            // IMPORTANTE: Asegurar que el ID se guarde de forma consistente para evitar errores al guardar
            if (!user.User_id && userId) {
                user.User_id = userId;
                localStorage.setItem('user', JSON.stringify(user));
            }

            document.getElementById('profile-name').value = userName;
            document.getElementById('profile-email').value = userEmail;
            if (document.getElementById('profile-phone')) {
                document.getElementById('profile-phone').value = userPhone;
            }
            document.getElementById('user-welcome').textContent = `¡Hola, ${userName}! Bienvenido a tu espacio personal`;
            
            // Cargar pedidos y direcciones
            if (userEmail) loadOrders(userEmail);
            if (userId) {
                loadAddresses(userId);
            } else {
                console.error('ID de usuario no encontrado en localStorage:', user);
            }
        } catch (e) {
            console.error('Error parseando datos de usuario:', e);
        }
    }

    // Navegación entre secciones
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const sections = document.querySelectorAll('.section-content');

    // Lógica de edición de perfil
    const profileForm = document.getElementById('profile-form');
    const editableInputs = document.querySelectorAll('.editable-input');
    const formActions = document.querySelector('.profile-form-actions');
    const cancelEditBtn = document.getElementById('cancel-edit');
    let originalData = {};

    if (editableInputs) {
        editableInputs.forEach(input => {
            input.addEventListener('focus', () => {
                const inputId = input.id;
                
                // Guardar valor original si no existe
                if (!originalData[inputId]) {
                    originalData[inputId] = input.value;
                }

                input.classList.add('editing');
                formActions.classList.remove('d-none');
            });
        });
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            Object.keys(originalData).forEach(id => {
                const input = document.getElementById(id);
                input.value = originalData[id];
                input.classList.remove('editing');
            });
            formActions.classList.add('d-none');
            originalData = {};
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // RE-OBTENER datos de los inputs justo antes de enviar
            const name = document.getElementById('profile-name').value;
            const email = document.getElementById('profile-email').value;
            const phone = document.getElementById('profile-phone').value;
            
            console.log('--- Iniciando guardado de perfil ---');
            const userString = localStorage.getItem('user');
            console.log('userString en localStorage:', userString);

            if (!userString) {
                console.error('ERROR: No se encontró user en localStorage');
                Swal.fire('Error', 'No se encontró sesión de usuario. Por favor, inicia sesión de nuevo.', 'error').then(() => {
                    handleLogout();
                });
                return;
            }
            
            const user = JSON.parse(userString);
            const userId = user.User_id || user.id || user.id_user;
            console.log('ID detectado para guardar:', userId);

            if (!userId) {
                console.error('ERROR: ID de usuario no encontrado en el objeto:', user);
                Swal.fire('Error', 'ID de usuario no encontrado. Por favor, inicia sesión de nuevo.', 'error').then(() => {
                    handleLogout();
                });
                return;
            }

            try {
                Swal.fire({
                    title: 'Guardando...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const res = await fetch(`${HOST}/mySystem/users/${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        User_name: name,
                        User_email: email,
                        User_password: '', 
                        Roles_fk: user.Roles_fk || 2,
                        User_phone: phone
                    })
                });

                if (res.ok) {
                    const updatedUser = { 
                        ...user, 
                        User_id: userId,
                        User_name: name, 
                        User_email: email, 
                        User_phone: phone 
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    
                    await Swal.fire('¡Éxito!', 'Perfil actualizado correctamente', 'success');
                    
                    // Resetear estado de edición
                    editableInputs.forEach(i => {
                        i.classList.remove('editing');
                    });
                    formActions.classList.add('d-none');
                    originalData = {};
                } else {
                    const data = await res.json();
                    throw new Error(data.error || 'No se pudo actualizar el perfil');
                }
            } catch (error) {
                console.error('Error actualizando perfil:', error);
                Swal.fire('Error', error.message || 'Error de conexión', 'error');
            }
        });
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.getAttribute('data-section');
            
            // Actualizar botones
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Actualizar secciones
            sections.forEach(s => {
                s.classList.remove('active');
                if (s.id === targetSection) {
                    s.classList.add('active');
                }
            });

            // Actualizar URL hash sin recargar
            window.location.hash = targetSection.replace('perfil-', '');
        });
    });

    // Manejar hash en la URL al cargar
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        const targetBtn = document.querySelector(`.nav-item[data-section="perfil-${hash}"]`);
        if (targetBtn) targetBtn.click();
    }

    // Botón cerrar sesión
    const logoutBtn = document.getElementById('logout-profile');
    const handleLogout = (e) => {
        if (e) e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        window.location.href = '/generalViews/home';
    };

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Placeholder para cargar pedidos (aquí iría un fetch a la API)
    loadOrders();
    loadAddresses();

    // Formulario de edición (opcional)
    // El submit ya se maneja arriba
});

async function loadOrders(email) {
    const ordersContainer = document.getElementById('orders-list');
    if (!ordersContainer) return;

    try {
        const res = await fetch(`${HOST}/mySystem/pedidos/usuario/${email}`);
        const orders = await res.json();

        if (!orders || orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-bag-x"></i>
                    <p>No tienes pedidos registrados aún.</p>
                </div>`;
            return;
        }

        let html = '<div class="orders-table-wrapper"><table class="elegant-table">';
        html += '<thead><tr><th>Pedido #</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead><tbody>';
        
        orders.forEach(order => {
            const date = new Date(order.fecha_pedido).toLocaleDateString();
            const total = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(order.total);
            const statusClass = `status-${order.estado.toLowerCase()}`;
            
            html += `
                <tr>
                    <td><strong>#${order.pedido_id}</strong></td>
                    <td>${date}</td>
                    <td>${total}</td>
                    <td><span class="status-badge ${statusClass}">${order.estado}</span></td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        ordersContainer.innerHTML = html;

    } catch (error) {
        console.error('Error cargando pedidos:', error);
        ordersContainer.innerHTML = '<p class="error-message">Error al cargar tus pedidos.</p>';
    }
}

async function loadAddresses(userId) {
    const addressContainer = document.getElementById('address-list');
    if (!addressContainer) return;

    try {
        const res = await fetch(`${HOST}/mySystem/addresses/user/${userId}`);
        const addresses = await res.json();

        let html = '';
        if (!addresses || addresses.length === 0) {
            html = `
                <div class="empty-state">
                    <i class="bi bi-geo"></i>
                    <p>No tienes direcciones guardadas.</p>
                </div>`;
        } else {
            html = '<div class="address-grid">';
            addresses.forEach(addr => {
                html += `
                    <div class="address-card ${addr.is_default ? 'default' : ''}">
                        <div class="address-info">
                            <h3>${addr.Address_name} ${addr.is_default ? '<span class="default-badge">Principal</span>' : ''}</h3>
                            <p class="city">${addr.Address_city}</p>
                            <p class="details">${addr.Address_details}</p>
                        </div>
                        <div class="address-actions">
                            <button onclick="deleteAddress(${addr.Address_id})" class="btn-delete" title="Eliminar"><i class="bi bi-trash"></i></button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        html += `<button class="btn-elegant small mt-4" onclick="showAddAddressModal()"><i class="bi bi-plus-lg"></i> Añadir Dirección</button>`;
        addressContainer.innerHTML = html;

    } catch (error) {
        console.error('Error cargando direcciones:', error);
        addressContainer.innerHTML = '<p class="error-message">Error al cargar tus direcciones.</p>';
    }
}

window.deleteAddress = async function(id) {
    const result = await Swal.fire({
        title: '¿Eliminar dirección?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#a97c2f',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const res = await fetch(`${HOST}/mySystem/addresses/${id}`, { method: 'DELETE' });
            if (res.ok) {
                Swal.fire('Eliminada', 'La dirección ha sido eliminada.', 'success');
                const user = JSON.parse(localStorage.getItem('user'));
                loadAddresses(user.User_id);
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo eliminar la dirección', 'error');
        }
    }
}

window.showAddAddressModal = async function() {
    const { value: formValues } = await Swal.fire({
        title: 'Nueva Dirección',
        html:
            '<input id="swal-name" class="swal2-input" placeholder="Nombre (Ej: Casa, Oficina)">' +
            '<input id="swal-city" class="swal2-input" placeholder="Ciudad">' +
            '<textarea id="swal-details" class="swal2-textarea" placeholder="Dirección completa (Calle, Apto, etc)"></textarea>' +
            '<div class="swal2-checkbox-container"><input type="checkbox" id="swal-default"> <label for="swal-default">Establecer como principal</label></div>',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        confirmButtonColor: '#a97c2f',
        preConfirm: () => {
            const name = document.getElementById('swal-name').value;
            const city = document.getElementById('swal-city').value;
            const details = document.getElementById('swal-details').value;
            const isDefault = document.getElementById('swal-default').checked;
            
            if (!name || !city || !details) {
                Swal.showValidationMessage('Por favor completa todos los campos');
                return false;
            }
            return { name, city, details, isDefault };
        }
    });

    if (formValues) {
        const user = JSON.parse(localStorage.getItem('user'));
        try {
            const res = await fetch(`${HOST}/mySystem/addresses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    User_fk: user.User_id,
                    Address_name: formValues.name,
                    Address_city: formValues.city,
                    Address_details: formValues.details,
                    is_default: formValues.isDefault
                })
            });
            if (res.ok) {
                Swal.fire('Guardada', 'Dirección agregada correctamente', 'success');
                loadAddresses(user.User_id);
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo guardar la dirección', 'error');
        }
    }
}
