document.addEventListener("DOMContentLoaded", () => {
    if (typeof HOST === 'undefined') window.HOST = 'http://localhost:3000';
    if (typeof URL_FILES === 'undefined') window.URL_FILES = '/mySystem/files';
    // Protección: Redirigir si no hay token
    if (!localStorage.getItem('token')) {
        window.location.href = '/generalViews/login';
        return;
    }
    const fileTableBody = document.querySelector("#fileTable tbody");
    const fileModal = document.getElementById("fileModal");
    const fileForm = document.getElementById("fileForm");
    const fileIdInput = document.getElementById("fileId");
    const fileNameInput = document.getElementById("fileName");
    const fileTypeSelect = document.getElementById("fileType");
    const fileModalLabel = document.getElementById("fileModalLabel");
    const openModalBtn = document.querySelector('[data-bs-target="#fileModal"]');

    const FIXED_EXTENSIONS = [
        'jpg',
        'png',
        'pdf',
        'xlsx',
        'docx'
    ];

    let typeFilesIdByExtension = {};

    async function loadTypeFilesIdsByExtension() {
        try {
            const response = await fetch(`${HOST}${URL_TYPE_FILES}`);
            if (!response.ok) throw new Error("Error al cargar tipos de archivo");

            const typeFiles = await response.json();
            typeFilesIdByExtension = {};

            typeFiles.forEach(tf => {
                const ext = (tf.Type_files_extension || '').toString().trim().toLowerCase();
                if (ext) typeFilesIdByExtension[ext] = tf.Type_files_id;
            });
        } catch (error) {
            typeFilesIdByExtension = {};
        }
    }

    function getTypeFileFkFromSelector() {
        const ext = (fileTypeSelect.value || '').trim().toLowerCase();
        if (!FIXED_EXTENSIONS.includes(ext)) return '';
        return typeFilesIdByExtension[ext] ?? '';
    }

    async function loadFiles() {
        try {
            const response = await fetch(`${HOST}${URL_FILES}`);
            if (!response.ok) throw new Error("Error al obtener los archivos");

            const files = await response.json();
            fileTableBody.innerHTML = "";

            files.forEach(file => {
                const row = `
                    <tr>    
                        <td>${file.Files_id}</td>
                        <td>${file.Files_name}</td>
                        <td>${file.Files_route}</td>
                        <td>${file.Type_files_extension}</td>
                        <td>${file.Updated_at}</td>
                        <td>
                            <button class="btn-action btn-action-view btn-show" data-id="${file.Files_id}"><i class="fas fa-eye"></i></button>
                            <button class="btn-action btn-action-edit btn-edit" data-id="${file.Files_id}" data-bs-toggle="modal" data-bs-target="#fileModal"><i class="fas fa-edit"></i></button>
                            <button class="btn-action btn-action-delete btn-delete" data-id="${file.Files_id}"><i class="fas fa-trash"></i></button>
                            <button class="btn-action btn-action-download btn-download" data-id="${file.Files_id}"><i class="fas fa-download"></i></button>
                        </td>
                    </tr>
                `;
                fileTableBody.insertAdjacentHTML("beforeend", row);
            });
            document.querySelectorAll(".btn-show").forEach(btn => btn.addEventListener("click", handleShowFile));
            document.querySelectorAll(".btn-edit").forEach(btn => btn.addEventListener("click", handleEditFile));
            document.querySelectorAll(".btn-delete").forEach(btn => btn.addEventListener("click", handleDeleteFile));
            document.querySelectorAll(".btn-download").forEach(btn => btn.addEventListener("click", handleDownloadFile));
            async function handleDownloadFile(e) {
                const id = e.target.closest("button").dataset.id;
                window.open(`${HOST}${URL_FILES}/download/${id}`, "_blank");
            }
        } catch (error) {
            alert("Error al cargar usuarios: " + error.message);
        }
    }

    async function handleShowFile(e) {
        const id = e.target.closest("button").dataset.id;
        try {
            const response = await fetch(`${HOST}${URL_FILES}/${id}`);
            if (!response.ok) throw new Error("Error al obtener archivo");

            const file = await response.json();
            alert(`ID: ${file.Files_id}\nNombre: ${file.Files_name}\nRuta: ${file.Files_route}\nExtension: ${file.Type_files_extension} \nÚltima Actualización: ${file.Updated_at}`);
        } catch (error) {
            alert("Error al mostrar archivo: " + error.message);
        }
    }

    async function handleEditFile(e) {
        const id = e.target.closest("button").dataset.id;
        try {
            const response = await fetch(`${HOST}${URL_FILES}/${id}`);
            if (!response.ok) throw new Error("Error al obtener archivo");

            const file = await response.json();

            fileModalLabel.textContent = "Editar Archivo";
            fileIdInput.value = file.Files_id;
            fileNameInput.value = file.Files_name;
            fileTypeSelect.value = (file.Type_files_extension || '').toLowerCase();
        } catch (error) {
            alert("Error al cargar archivo: " + error.message);
        }
    }

    async function handleDeleteFile(e) {
        const id = e.target.closest("button").dataset.id;
        if (!confirm("¿Estás seguro de eliminar este archivo?")) return;

        try {
            const response = await fetch(`${HOST}${URL_FILES}/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Error al eliminar archivo");

            loadFiles();
        } catch (error) {
            alert("Error al eliminar archivo: " + error.message);
        }
    }

    openModalBtn.addEventListener("click", () => {
        fileModalLabel.textContent = "Agregar Archivo";
        fileForm.reset();
        fileIdInput.value = "";
    });

    fileForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = fileIdInput.value;
        const name = fileNameInput.value.trim();
        const type = getTypeFileFkFromSelector();
        const fileInput = document.getElementById("imageFile");
        const file = fileInput.files[0];

        const method = id ? "PUT" : "POST";
        const url = id ? `${HOST}${URL_FILES}/${id}` : `${HOST}${URL_FILES}`;

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("fileName", name);
            formData.append("typeFileFk", type);

            const response = await fetch(url, {
                method,
                body: formData
            });

            if (!response.ok) throw new Error("Error al guardar archivo");

            bootstrap.Modal.getInstance(fileModal).hide();
            loadFiles();
        } catch (error) {
            alert("Error al guardar archivo: " + error.message);
        }
    });
    loadTypeFilesIdsByExtension().finally(() => {
        loadFiles();
    });
});
    