document.addEventListener("DOMContentLoaded", () => {
    if (typeof HOST === 'undefined') window.HOST = 'http://localhost:3000';
    if (typeof URL_USERS === 'undefined') window.URL_USERS = '/mySystem/users';
    // Protección: Redirigir si no hay token
    if (!localStorage.getItem('token')) {
        window.location.href = '/generalViews/login';
        return;
    }
    const userTableBody = document.querySelector("#userTable tbody");
    const userModal = document.getElementById("userModal");
    const userForm = document.getElementById("userForm");
    const userIdInput = document.getElementById("userId");
    const userNameInput = document.getElementById("userName");
    const userEmailInput = document.getElementById("userEmail");
    const userPasswordInput = document.getElementById("userPassword");
    const userRoleSelect = document.getElementById("userRole");
    const userModalLabel = document.getElementById("userModalLabel");
    const openModalBtn = document.querySelector('[data-bs-target="#userModal"]');

    async function loadUsers() {
        try {
            const response = await fetch(`${HOST}${URL_USERS}`);
            if (!response.ok) throw new Error("Error al obtener los usuarios");

            const users = await response.json();
            userTableBody.innerHTML = "";

            users.forEach(user => {
                // Crear fila manualmente para asegurar que los atributos se asignen bien
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.User_id}</td>
                    <td>${user.User_name}</td>
                    <td>${user.User_email}</td>
                    <td>${user.Roles_name}</td>
                    <td>${user.Updated_at}</td>
                    <td>
                        <button class="btn-action btn-action-view btn-show" data-id="${user.User_id}" title="Ver Detalles"><i class="fas fa-eye"></i></button>
                        <button class="btn-action btn-action-edit btn-edit" data-id="${user.User_id}" data-bs-toggle="modal" data-bs-target="#userModal" title="Editar Usuario"><i class="fas fa-edit"></i></button>
                        <button class="btn-action btn-action-delete btn-delete" data-id="${user.User_id}" title="Eliminar Usuario"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                userTableBody.appendChild(tr);
            });
            
            // Re-vincular eventos buscando los botones dentro del tbody
            userTableBody.querySelectorAll(".btn-show").forEach(btn => {
                btn.addEventListener("click", handleShowUser);
            });
            userTableBody.querySelectorAll(".btn-edit").forEach(btn => {
                btn.addEventListener("click", handleEditUser);
            });
            userTableBody.querySelectorAll(".btn-delete").forEach(btn => {
                btn.addEventListener("click", handleDeleteUser);
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "Error al cargar usuarios: " + error.message,
                confirmButtonColor: '#96353B'
            });
        }
    }

    async function handleShowUser(e) {
        const id = e.target.closest("button").dataset.id;
        try {
            const response = await fetch(`${HOST}${URL_USERS}/${id}`);
            if (!response.ok) throw new Error("Error al obtener usuario");

            const user = await response.json();
            
            Swal.fire({
                title: 'Detalles del Usuario',
                html: `
                    <div class="text-start">
                        <p><strong>ID:</strong> ${user.User_id}</p>
                        <p><strong>Nombre:</strong> ${user.User_name}</p>
                        <p><strong>Email:</strong> ${user.User_email}</p>
                        <p><strong>Rol:</strong> ${user.Roles_name}</p>
                        <p><strong>Última Actualización:</strong> ${user.Updated_at}</p>
                    </div>
                `,
                icon: 'info',
                confirmButtonColor: '#96353B'
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "Error al mostrar usuario: " + error.message,
                confirmButtonColor: '#96353B'
            });
        }
    }

    async function handleEditUser(e) {
        const id = e.target.closest("button").dataset.id;
        try {
            const response = await fetch(`${HOST}${URL_USERS}/${id}`);
            if (!response.ok) throw new Error("Error al obtener usuario");

            const user = await response.json();

            userModalLabel.textContent = "Editar Usuario";
            userIdInput.value = user.User_id;
            userNameInput.value = user.User_name;
            userEmailInput.value = user.User_email;
            userPasswordInput.value = user.User_password;
            userRoleSelect.value = user.Roles_fk;
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "Error al cargar usuario: " + error.message,
                confirmButtonColor: '#96353B'
            });
        }
    }

    async function handleDeleteUser(e) {
        // Asegurarnos de obtener el botón incluso si se hace clic en el icono i
        const btn = e.currentTarget; 
        const id = btn.getAttribute("data-id");
        
        console.log("Intentando eliminar usuario con ID:", id);
        
        if (!id) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "No se pudo obtener el ID del usuario.",
                confirmButtonColor: '#96353B'
            });
            return;
        }
        
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#96353B',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const url = `${HOST}${URL_USERS}/${id}`;
                console.log("Enviando petición DELETE a:", url);

                const response = await fetch(url, { 
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                console.log("Status de respuesta:", response.status);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error("Detalle error servidor:", errorData);
                    throw new Error(errorData.error || `Error ${response.status}: No se pudo eliminar`);
                }

                await Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El usuario ha sido eliminado correctamente.',
                    icon: 'success',
                    confirmButtonColor: '#96353B'
                });
                loadUsers();
            } catch (error) {
                console.error("Error en handleDeleteUser:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message,
                    confirmButtonColor: '#96353B'
                });
            }
        }
    }

    openModalBtn.addEventListener("click", () => {
        userModalLabel.textContent = "Agregar Usuario";
        userForm.reset();
        userIdInput.value = "";
    });

    userForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = userIdInput.value;
        const name = userNameInput.value.trim();
        const email = userEmailInput.value.trim();
        const password = userPasswordInput.value.trim();
        const role = userRoleSelect.value;
        const method = id ? "PUT" : "POST";
        const url = id ? `${HOST}${URL_USERS}/${id}` : `${HOST}${URL_USERS}`;

        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    User_name: name,
                    User_email: email,
                    User_password: password,
                    Roles_fk: role
                })
            });

            if (response.status === 409) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Correo Duplicado',
                    text: "El correo ingresado ya está registrado. Por favor, ingrese uno diferente.",
                    confirmButtonColor: '#96353B'
                });
                return;
            }

            if (!response.ok) throw new Error("Error al guardar usuario");

            Swal.fire({
                icon: 'success',
                title: '¡Guardado!',
                text: 'El usuario ha sido guardado correctamente.',
                confirmButtonColor: '#96353B'
            });

            bootstrap.Modal.getInstance(userModal).hide();
            loadUsers();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "Error al guardar usuario: " + error.message,
                confirmButtonColor: '#96353B'
            });
        }
    });

    async function loadRoles() {
        try {
            const response = await fetch(`${HOST}${URL_ROLES}`);
            if (!response.ok) throw new Error("Error al cargar roles");

            const roles = await response.json();
            userRoleSelect.innerHTML = '<option value="">Seleccione un rol</option>';

            roles.forEach(role => {
                const option = document.createElement("option");
                option.value = role.Roles_id;
                option.textContent = role.Roles_name;
                userRoleSelect.appendChild(option);
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "Error al cargar roles: " + error.message,
                confirmButtonColor: '#96353B'
            });
        }
    }

    loadRoles();
    loadUsers();
});
