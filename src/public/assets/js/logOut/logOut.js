
// Lógica de cierre de sesión reutilizable
function logOutUser() {
	localStorage.removeItem('token');
	localStorage.removeItem('role');
	window.location.href = '/generalViews/login';
}

// Permitir que otros scripts llamen a logOutUser
window.logOutUser = logOutUser;

// Asociar el botón de logout a la función logOutUser en todas las vistas
document.addEventListener('DOMContentLoaded', function() {
	const logoutBtn = document.getElementById('logoutBtn');
	if (logoutBtn) {
		logoutBtn.addEventListener('click', window.logOutUser);
	}
});
