document.addEventListener('DOMContentLoaded', function() {
    // Función para inicializar la funcionalidad del blog
    function initBlog() {
        // 1. Ajustar el espaciado del contenido debajo del header
        adjustContentSpacing();
        
        // 2. Inicializar efecto hover en las tarjetas
        initCardHoverEffect();
        
        // 3. Manejar el redimensionamiento de la ventana
        window.addEventListener('resize', handleResize);
    }

    // Ajustar el espaciado del contenido
    function adjustContentSpacing() {
        const header = document.querySelector('header');
        const blogHero = document.querySelector('.blog-hero');
        
        if (header && blogHero) {
            const headerHeight = header.offsetHeight;
            blogHero.style.paddingTop = `${headerHeight + 20}px`;
        }
    }

    // Efecto hover en las tarjetas
    function initCardHoverEffect() {
        const cards = document.querySelectorAll('.blog-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px)';
                this.style.transition = 'transform 0.3s ease';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }

    // Manejar el redimensionamiento de la ventana
    function handleResize() {
        adjustContentSpacing();
    }

    // Inicializar todo cuando el DOM esté listo
    initBlog();
});