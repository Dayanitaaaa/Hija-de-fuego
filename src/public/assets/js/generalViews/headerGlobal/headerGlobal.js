document.addEventListener('DOMContentLoaded', function() {
fetch('/generalViews/headerGlobal')
		.then(response => response.text())
		.then(data => {
			const headerContainer = document.querySelector('header');
			if (headerContainer) {
				headerContainer.innerHTML = data;
				// Ocultar botón de registro si estamos en login o register
				const path = window.location.pathname;
				if (path.includes('/login') || path.includes('/register')) {
					const registerBtn = document.querySelector('.btn-group-contact a[href="/generalViews/register"]');
					if (registerBtn) {
						registerBtn.style.display = 'none';
					}
				}
			}
		});
});
