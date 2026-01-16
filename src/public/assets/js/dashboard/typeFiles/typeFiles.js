document.addEventListener("DOMContentLoaded", () => {
    // Protección: Redirigir si no hay token
    if (!localStorage.getItem('token')) {
        window.location.href = '/generalViews/login';
        return;
    }
    const typeFilesTableBody = document.querySelector("#typeFilesTable tbody");
    const typeFilesModal = document.getElementById("typeFilesModal");
    const typeFilesForm = document.getElementById("typeFilesForm");
    const typeFilesIdInput = document.getElementById("typeFilesId");
    const typeFilesExtensionInput = document.getElementById("typeFilesExtension");
    const typeFilesNameInput = document.getElementById("typeFilesName");
    const typeFilesModalLabel = document.getElementById("typeFilesModalLabel");
    const openModalBtn = document.querySelector('[data-bs-target="#typeFilesModal"]');

    async function loadTypeFiles() {
        try {
            const response = await fetch(`${HOST}${URL_TYPE_FILES}`);
            if (!response.ok) throw new Error("Error al obtener los tipos de archivos");

            const typeFiles = await response.json();
            typeFilesTableBody.innerHTML = "";
            typeFiles.forEach(typeFile => {
                const row = `
                    <tr>
                        <td>${typeFile.Type_files_id}</td>
                        <td>${typeFile.Type_files_name}</td>
                        <td>${typeFile.Type_files_extension}</td>
                        <td>${typeFile.Updated_at}</td>
                        <td>
                            <button class="btn-action btn-action-view btn-show" data-id="${typeFile.Type_files_id}"><i class="fas fa-eye"></i></button>
                            <button class="btn-action btn-action-edit btn-edit" data-id="${typeFile.Type_files_id}" data-bs-toggle="modal" data-bs-target="#typeFilesModal"><i class="fas fa-edit"></i></button>
                            <button class="btn-action btn-action-delete btn-delete" data-id="${typeFile.Type_files_id}"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
                typeFilesTableBody.insertAdjacentHTML("beforeend", row);
            });
            document.querySelectorAll(".btn-show").forEach(btn => btn.addEventListener("click", handleShowTypeFile));
            document.querySelectorAll(".btn-edit").forEach(btn => btn.addEventListener("click", handleEditTypeFile));
            document.querySelectorAll(".btn-delete").forEach(btn => btn.addEventListener("click", handleDeleteTypeFile));
        } catch (error) {
            alert("Error al cargar tipo de archivo: " + error.message);
        }
    }

    async function handleShowTypeFile(e) {
        const id = e.target.closest("button").dataset.id;
        try {
            const response = await fetch(`${HOST}${URL_TYPE_FILES}/${id}`);
            if (!response.ok) throw new Error("Error al obtener tipo de archivo");
            const typeFile = await response.json();
            alert(`ID: ${typeFile.Type_files_id}\nExtensión: ${typeFile.Type_files_name}\nNombre: ${typeFile.Type_files_extension} \nActualizado en: ${typeFile.Updated_at}`);
        } catch (error) {
            alert("Error al mostrar tipo de archivo: " + error.message);
        }
    }

    async function handleEditTypeFile(e) {
        const id = e.target.closest("button").dataset.id;
        try {
            const response = await fetch(`${HOST}${URL_TYPE_FILES}/${id}`);
            if (!response.ok) throw new Error("Error al obtener tipo de archivo");
            const typeFile = await response.json();

            typeFilesModalLabel.textContent = "Editar Tipo de Archivo";
            typeFilesIdInput.value = typeFile.Type_files_id;
            typeFilesExtensionInput.value = typeFile.Type_files_extension;
            typeFilesNameInput.value = typeFile.Type_files_name;
           
        } catch (error) {
            alert("Error al cargar tipo de archivo: " + error.message);
        }
    }

    async function handleDeleteTypeFile(e) {
        const id = e.target.closest("button").dataset.id;
        if (!confirm("¿Estás seguro de eliminar este tipo de archivo?")) return;

        try {
            const response = await fetch(`${HOST}${URL_TYPE_FILES}/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Error al eliminar tipo de archivo");
            loadTypeFiles();
        } catch (error) {
            alert("Error al eliminar tipo de archivo: " + error.message);
        }
    }

    openModalBtn.addEventListener("click", () => {
        typeFilesModalLabel.textContent = "Agregar Tipo de Archivo";
        typeFilesForm.reset();
        typeFilesIdInput.value = "";
    });

    typeFilesForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = typeFilesIdInput.value;
        const extension = typeFilesExtensionInput.value.trim();
        const name = typeFilesNameInput.value.trim();
        const method = id ? "PUT" : "POST";
        const url = id ? `${HOST}${URL_TYPE_FILES}/${id}` : `${HOST}${URL_TYPE_FILES}`;
        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Type_files_extension: extension,
                    Type_files_name: name
                })
            });

            if (!response.ok) throw new Error("Error al guardar tipo de archivo");
            bootstrap.Modal.getInstance(typeFilesModal).hide();
            loadTypeFiles();
        } catch (error) {
            alert("Error al guardar tipo de archivo: " + error.message);
        }
    });

    loadTypeFiles();
});
