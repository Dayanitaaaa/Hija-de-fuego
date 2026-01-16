// Alternar sidebar en responsive
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
if (sidebarToggle && sidebar) {
  const getSidebarWidth = () => {
    if (window.innerWidth <= 600) return 160; // ancho sidebar en móvil
    if (window.innerWidth <= 900) return 200; // ancho sidebar en tablet
    return 220; // ancho sidebar en desktop
  };
  const setHamburgerPosition = () => {
    if (sidebar.classList.contains('active')) {
      sidebarToggle.style.left = `${getSidebarWidth() + 8}px`;
    } else {
      sidebarToggle.style.left = (window.innerWidth <= 600)
        ? '12px' : '18px';
    }
  };
  sidebarToggle.addEventListener('click', function() {
    sidebar.classList.toggle('active');
    setHamburgerPosition();
  });
  // Opcional: cerrar sidebar al hacer click fuera en móvil
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 900 && sidebar.classList.contains('active')) {
      if (!sidebar.contains(e.target) && e.target !== sidebarToggle && !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('active');
        setHamburgerPosition();
      }
    }
  });
  // Ajusta la posición del botón al cambiar el tamaño de la ventana
  window.addEventListener('resize', setHamburgerPosition);
  // Inicializa la posición
  setHamburgerPosition();
}
