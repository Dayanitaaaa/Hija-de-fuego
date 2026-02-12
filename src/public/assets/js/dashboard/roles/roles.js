document.addEventListener("DOMContentLoaded", () => {
    if (typeof HOST === 'undefined') window.HOST = 'http://localhost:3000';
    if (typeof URL_ROLES === 'undefined') window.URL_ROLES = '/mySystem/roles';
    // Protección: Redirigir si no hay token
    if (!localStorage.getItem('token')) {
        window.location.href = '/generalViews/login';
        return;
    }
    const roleTableBody = document.querySelector("#roleTable tbody");
    const roleModal = document.getElementById("roleModal");
    const roleForm = document.getElementById("roleForm");
    const roleIdInput = document.getElementById("roleId");
    const roleNameInput = document.getElementById("roleName");
    const roleModalLabel = document.getElementById("roleModalLabel");
    const openModalBtn = document.querySelector('[data-bs-target="#roleModal"]');

    async function loadRoles() {
        try {
            const response = await fetch(`${HOST}${URL_ROLES}`);
            if (!response.ok) throw new Error("Error al obtener los roles");

            const roles = await response.json();
            roleTableBody.innerHTML = "";

            roles.forEach(role => {
                const row = `
                    <tr>
                        <td>${role.Roles_id}</td>
                        <td>${role.Roles_name}</td>
                        <td>${role.Updated_at}</td>
                        <td>
                            <button class="btn-action btn-action-view btn-show" data-id="${role.Roles_id}"><i class="fas fa-eye"></i></button>
                            <button class="btn-action btn-action-edit btn-edit" data-id="${role.Roles_id}" data-bs-toggle="modal" data-bs-target="#roleModal"><i class="fas fa-edit"></i></button>
                            <button class="btn-action btn-action-delete btn-delete" data-id="${role.Roles_id}"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
                roleTableBody.insertAdjacentHTML("beforeend", row);
            });
            document.querySelectorAll(".btn-show").forEach(btn => btn.addEventListener("click", handleShowRole));
            document.querySelectorAll(".btn-edit").forEach(btn => btn.addEventListener("click", handleEditRole));
            document.querySelectorAll(".btn-delete").forEach(btn => btn.addEventListener("click", handleDeleteRole));
        } catch (error) {
            alert("Error al cargar roles: " + error.message);
        }
    }

    async function handleShowRole(e) {
        const id = e.target.closest("button").dataset.id;
        try {
            const response = await fetch(`${HOST}${URL_ROLES}/${id}`);
            if (!response.ok) throw new Error("Error al obtener rol");
            const role = await response.json();
            alert(`ID: ${role.Roles_id}\nNombre: ${role.Roles_name} \nÚltima Actualización: ${role.Updated_at}`);
        } catch (error) {
            alert("Error al mostrar rol: " + error.message);
        }
    }

    async function handleEditRole(e) {
        const id = e.target.closest("button").dataset.id;
        try {
            const response = await fetch(`${HOST}${URL_ROLES}/${id}`);
            if (!response.ok) throw new Error("Error al obtener rol");

            const role = await response.json();

            roleModalLabel.textContent = "Editar Rol";
            roleIdInput.value = role.Roles_id;
            roleNameInput.value = role.Roles_name;
           
        } catch (error) {
            alert("Error al cargar rol: " + error.message);
        }
    }

    async function handleDeleteRole(e) {
        const id = e.target.closest("button").dataset.id;
        if (!confirm("¿Estás seguro de eliminar este rol?")) return;

        try {
            const response = await fetch(`${HOST}${URL_ROLES}/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Error al eliminar rol");
            loadRoles();
        } catch (error) {
            alert("Error al eliminar rol: " + error.message);
        }
    }

    openModalBtn.addEventListener("click", () => {
        roleModalLabel.textContent = "Agregar Rol";
        roleForm.reset();
        roleIdInput.value = "";
    });

    roleForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = roleIdInput.value;
        const name = roleNameInput.value.trim();

        const method = id ? "PUT" : "POST";
        const url = id ? `${HOST}${URL_ROLES}/${id}` : `${HOST}${URL_ROLES}`;

        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Roles_name: name,
                })
            });

            if (!response.ok) throw new Error("Error al guardar rol");
            bootstrap.Modal.getInstance(roleModal).hide();
            loadRoles();
        } catch (error) {
            alert("Error al guardar rol: " + error.message);
        }
    });

    loadRoles();
});
