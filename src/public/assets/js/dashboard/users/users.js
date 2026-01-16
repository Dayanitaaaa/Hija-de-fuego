document.addEventListener("DOMContentLoaded", () => {
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
                const row = `
                    <tr>
                        <td>${user.User_id}</td>
                        <td>${user.User_name}</td>
                        <td>${user.User_email}</td>
                        <td>${user.User_password}</td>
                        <td>${user.Roles_name}</td>
                        <td>${user.Updated_at}</td>
                        <td>
                            <button class="btn-action btn-action-view btn-show" data-id="${user.User_id}"><i class="fas fa-eye"></i></button>
                            <button class="btn-action btn-action-edit btn-edit" data-id="${user.User_id}" data-bs-toggle="modal" data-bs-target="#userModal"><i class="fas fa-edit"></i></button>
                            <button class="btn-action btn-action-delete btn-delete" data-id="${user.User_id}"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
                userTableBody.insertAdjacentHTML("beforeend", row);
            });
            document.querySelectorAll(".btn-show").forEach(btn => btn.addEventListener("click", handleShowUser));
            document.querySelectorAll(".btn-edit").forEach(btn => btn.addEventListener("click", handleEditUser));
            document.querySelectorAll(".btn-delete").forEach(btn => btn.addEventListener("click", handleDeleteUser));
        } catch (error) {
            alert("Error al cargar usuarios: " + error.message);
        }
    }

    async function handleShowUser(e) {
        const id = e.target.closest("button").dataset.id;
        try {
            const response = await fetch(`${HOST}${URL_USERS}/${id}`);
            if (!response.ok) throw new Error("Error al obtener usuario");

            const user = await response.json();
            alert(`ID: ${user.User_id}\nNombre: ${user.User_name}\nEmail: ${user.User_email}\nContraseña: ${user.User_password}\nRol ID: ${user.Roles_name} \nÚltima Actualización: ${user.Updated_at}`);
        } catch (error) {
            alert("Error al mostrar usuario: " + error.message);
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
            alert("Error al cargar usuario: " + error.message);
        }
    }

    async function handleDeleteUser(e) {
        const id = e.target.closest("button").dataset.id;
        if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

        try {
            const response = await fetch(`${HOST}${URL_USERS}/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Error al eliminar usuario");

            loadUsers();
        } catch (error) {
            alert("Error al eliminar usuario: " + error.message);
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
                alert("El correo ingresado ya está registrado. Por favor, ingrese uno diferente.");
                return;
            }

            if (!response.ok) throw new Error("Error al guardar usuario");

            bootstrap.Modal.getInstance(userModal).hide();
            loadUsers();
        } catch (error) {
            alert("Error al guardar usuario: " + error.message);
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
            alert("Error al cargar roles: " + error.message);
        }
    }

    loadRoles();
    loadUsers();
});
