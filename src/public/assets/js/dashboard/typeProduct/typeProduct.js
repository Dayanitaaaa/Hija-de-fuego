document.addEventListener("DOMContentLoaded", () => {
    // Protección: Redirigir si no hay token
    if (!localStorage.getItem('token')) {
        window.location.href = '/generalViews/login';
        return;
    }
    const typeProductTableBody = document.querySelector("#typeProductTable tbody");
    const typeProductModal = document.getElementById("typeProductModal");
    const typeProductForm = document.getElementById("typeProductForm");
    const typeProductIdInput = document.getElementById("typeProductId");
    const typeProductNameInput = document.getElementById("typeProductName");
    const typeProductModalLabel = document.getElementById("typeProductModalLabel");
    const openModalBtn = document.querySelector('[data-bs-target="#typeProductModal"]');

    async function loadTypeProducts() {
        try {
            const response = await fetch(`${HOST}${URL_TYPE_PRODUCTS}`);
            if (!response.ok) throw new Error("Error al obtener los tipos de producto");

            const typeProducts = await response.json();
            typeProductTableBody.innerHTML = "";
            typeProducts.forEach(typeProduct => {
                const row = `
                    <tr>
                        <td>${typeProduct.Type_product_id}</td>
                        <td>${typeProduct.Type_product_name}</td>
                        <td>${typeProduct.Updated_at || ''}</td>
                        <td>
                            <button class="btn-action btn-action-view btn-show" data-id="${typeProduct.Type_product_id}"><i class="fas fa-eye"></i></button>
                            <button class="btn-action btn-action-edit btn-edit" data-id="${typeProduct.Type_product_id}" data-bs-toggle="modal" data-bs-target="#typeProductModal"><i class="fas fa-edit"></i></button>
                            <button class="btn-action btn-action-delete btn-delete" data-id="${typeProduct.Type_product_id}"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
                typeProductTableBody.insertAdjacentHTML("beforeend", row);
            });
            document.querySelectorAll(".btn-show").forEach(btn => btn.addEventListener("click", handleShowTypeProduct));
            document.querySelectorAll(".btn-edit").forEach(btn => btn.addEventListener("click", handleEditTypeProduct));
            document.querySelectorAll(".btn-delete").forEach(btn => btn.addEventListener("click", handleDeleteTypeProduct));
        } catch (error) {
            alert("Error al cargar tipo de producto: " + error.message);
        }
    }

    async function handleShowTypeProduct(e) {
        const id = e.target.closest("button").dataset.id;
        try {
            const response = await fetch(`${HOST}${URL_TYPE_PRODUCTS}/${id}`);
            if (!response.ok) throw new Error("Error al obtener tipo de producto");
            const typeProduct = await response.json();
            alert(`ID: ${typeProduct.Type_product_id}\nNombre: ${typeProduct.Type_product_name}\nActualizado en: ${typeProduct.Updated_at}`);
        } catch (error) {
            alert("Error al mostrar tipo de producto: " + error.message);
        }
    }

    async function handleEditTypeProduct(e) {
        const id = e.target.closest("button").dataset.id;
        try {
            const response = await fetch(`${HOST}${URL_TYPE_PRODUCTS}/${id}`);
            if (!response.ok) throw new Error("Error al obtener tipo de producto");
            const typeProduct = await response.json();

            typeProductModalLabel.textContent = "Editar Tipo de Producto";
            typeProductIdInput.value = typeProduct.Type_product_id;
            typeProductNameInput.value = typeProduct.Type_product_name;
        } catch (error) {
            alert("Error al cargar tipo de producto: " + error.message);
        }
    }

    async function handleDeleteTypeProduct(e) {
        const id = e.target.closest("button").dataset.id;
        if (!confirm("¿Estás seguro de eliminar este tipo de producto?")) return;

        try {
            const response = await fetch(`${HOST}${URL_TYPE_PRODUCTS}/${id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Error al eliminar tipo de producto");
            loadTypeProducts();
        } catch (error) {
            alert("Error al eliminar tipo de producto: " + error.message);
        }
    }

    openModalBtn.addEventListener("click", () => {
        typeProductModalLabel.textContent = "Agregar Tipo de Producto";
        typeProductForm.reset();
        typeProductIdInput.value = "";
    });

    typeProductForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = typeProductIdInput.value;
        const name = typeProductNameInput.value.trim();
        const method = id ? "PUT" : "POST";
        const url = id ? `${HOST}${URL_TYPE_PRODUCTS}/${id}` : `${HOST}${URL_TYPE_PRODUCTS}`;
        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Type_product_name: name
                })
            });

            if (!response.ok) throw new Error("Error al guardar tipo de producto");
            bootstrap.Modal.getInstance(typeProductModal).hide();
            loadTypeProducts();
        } catch (error) {
            alert("Error al guardar tipo de producto: " + error.message);
        }
    });

    loadTypeProducts();
});
