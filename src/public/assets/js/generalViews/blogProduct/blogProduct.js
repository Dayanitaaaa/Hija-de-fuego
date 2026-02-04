document.addEventListener('DOMContentLoaded', function() {
    const dropdownBtns = document.querySelectorAll('.dropdown-btn');

    dropdownBtns.forEach(btn => {
        btn.addEventListener('click', function(event) {
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-content').forEach(content => {
                if (content !== this.nextElementSibling) {
                    content.classList.remove('show');
                }
            });

            // Toggle the clicked dropdown
            this.nextElementSibling.classList.toggle('show');
            event.stopPropagation();
        });
    });

    // Close dropdowns if clicking outside
    window.addEventListener('click', function(event) {
        if (!event.target.matches('.dropdown-btn')) {
            document.querySelectorAll('.dropdown-content').forEach(content => {
                content.classList.remove('show');
            });
        }
    });

    // Cargar galería
    loadGallery();
});

async function loadGallery() {
    const container = document.getElementById('gallery');
    const emptyState = document.getElementById('gallery-empty');
    if (!container) return;
    try {
        const res = await fetch('/api/gallery');
        const items = await res.json();
        if (!items || items.length === 0) {
            emptyState?.removeAttribute('hidden');
            container.innerHTML = '';
            return;
        }
        emptyState?.setAttribute('hidden', true);
        container.innerHTML = items.map(item => `
            <div class="gallery-card">
                <img src="${item.image_url}" alt="${item.title}">
                <div class="gallery-card-body">
                    <div class="gallery-card-title">${item.title}</div>
                    <div class="gallery-card-subtitle">${item.subtitle || ''}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error cargando galería', error);
        if (emptyState) {
            emptyState.textContent = 'No se pudo cargar la galería.';
            emptyState.removeAttribute('hidden');
        }
    }
}
