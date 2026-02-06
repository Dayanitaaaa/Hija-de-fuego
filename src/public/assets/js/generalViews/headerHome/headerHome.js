document.addEventListener('DOMContentLoaded', function() {
fetch('/generalViews/headerHome')
	.then(response => response.text())
	.then(data => {
		const headerContainer = document.querySelector('header');
		if (headerContainer) {
			headerContainer.innerHTML = data;
			updateHeaderForLogin();

			// Lógica para el menú hamburguesa (mobile) usando ids
			const menuToggleBtn = document.getElementById('menu-toggle');
			const mobileMenu = document.getElementById('mobile-menu');

			if (menuToggleBtn && mobileMenu) {
				menuToggleBtn.addEventListener('click', () => {
					mobileMenu.classList.toggle('open');
				});
			}
		}
	});

function updateHeaderForLogin() {
	// Si hay token, modificar el header
	const token = localStorage.getItem('token');
	if (token) {
		// Ocultar botón de Registrarse
		const registerBtn = document.querySelector('.btn-group-contact a[href="register.html"]');
		if (registerBtn) {
			registerBtn.style.display = 'none';
		}
		// Mover el carrito a la posición del botón de registrarse
		const cartLi = document.querySelector('.icon-li');
		const contactDiv = document.querySelector('.btn-group-contact');
		if (cartLi && contactDiv) {
			// Eliminar el carrito de su posición original
			cartLi.parentNode.removeChild(cartLi);
			// Insertar el carrito después del botón de contacto
			contactDiv.appendChild(cartLi.querySelector('a'));
			// Eliminar el <li> vacío si queda
		}
		// Crear dropdown de usuario en la posición original del carrito
		const navMenu = document.querySelector('.nav-menu');
		if (navMenu) {
			const userDropdownLi = document.createElement('li');
			userDropdownLi.className = 'user-dropdown-li';
			userDropdownLi.innerHTML = `
				<div class="dropdown user-dropdown">
					<a href="#" class="header-btn user-btn">Usuario <i class="bi bi-person-circle"></i></a>
					<ul class="dropdown-menu">
						<li><a href="/perfil">Perfil</a></li>
						<li><a href="#" id="logout-btn">Cerrar sesión</a></li>
					</ul>
				</div>
			`;
			// Insertar el dropdown en la posición original del carrito (último <li>)
			navMenu.appendChild(userDropdownLi);
			// Evento para cerrar sesión
			const logoutBtn = userDropdownLi.querySelector('#logout-btn');
			if (logoutBtn) {
				logoutBtn.addEventListener('click', function(e) {
					e.preventDefault();
					if (window.logOutUser) {
						window.logOutUser();
					} else {
						localStorage.removeItem('token');
						localStorage.removeItem('role');
						window.location.href = '/generalViews/login';
					}
				});
			}
		}
	}
}
});
