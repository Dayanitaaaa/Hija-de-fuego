document.addEventListener('DOMContentLoaded', function() {
    // Protección: Redirigir si no hay token
    if (!localStorage.getItem('token')) {
        window.location.href = '/generalViews/login';
        return;
    }
            const moduleCards = document.querySelectorAll('.module-card');
            
            moduleCards.forEach(card => {
                card.addEventListener('click', function() {
                    const module = this.getAttribute('data-module');
                    
                    // Agregar efecto de click
                    this.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                    
                    // Navegar según el módulo
                    switch(module) {
                        case 'users':
                            window.location.href = '/dashboard/users';
                            break;
                        case 'roles':
                            window.location.href = '/dashboard/roles';
                            break;
                        case 'typeFiles':
                            window.location.href = '/dashboard/typeFiles';
                            break;  
                        case 'files':
                            window.location.href = '/dashboard/files';
                            break;
                        default:
                            // Módulo no reconocido, no hacer nada
                    }
                });
                
                // Efectos hover
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px)';
                    this.style.cursor = 'pointer';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
        });
        
