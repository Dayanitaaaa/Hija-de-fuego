console.log('LOG: El script login.js se ha cargado correctamente.');

document.addEventListener('DOMContentLoaded', () => {
	// Limpiar cualquier sesión anterior al cargar la página de login
	localStorage.removeItem('token');
	localStorage.removeItem('role');

	// El código original de protección ya no es necesario aquí, 
	// pero lo dejamos comentado por si se necesita en el futuro.
	// if (localStorage.getItem('token')) {
	// 	window.location.href = '/dashboard/homeDashboard';
	// 	return;
	// }
	const form = document.querySelector('.login-form');
	const inputs = document.querySelectorAll('.login-input');
	const emailInput = inputs[0];
	const passwordInput = inputs[1];

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		const email = emailInput.value.trim();
		const password = passwordInput.value;

		if (!email || !password) {
			showMessage('Todos los campos son obligatorios', 'error');
			return;
		}
		if (!validateEmail(email)) {
			showMessage('Correo electrónico no válido', 'error');
			return;
		}

		try {
			// Depuración: mostrar la URL y los datos enviados
			const loginUrl = HOST + URL_USERS + '/login';
			console.log('URL de login:', loginUrl);
			console.log('Datos enviados:', { User_email: email, User_password: password });
			const res = await fetch(loginUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					User_email: email,
					User_password: password
				})
			});
			console.log('Status respuesta:', res.status);
			const data = await res.json();
			console.log('Respuesta backend:', data);
			if (res.ok && data.token) {
				localStorage.setItem('token', data.token);
				localStorage.setItem('role', JSON.stringify(data.role));
				showMessage('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
				setTimeout(() => {
					if (data.role && (data.role.id === 1 || data.role.name === 'Administrador')) {
						window.location.href = URL_DASHBOARD_HOME;
					} else if (data.role && (data.role.id === 2 || data.role.name === 'Cliente')) {
						window.location.href = '/generalViews/home';
					} else {
						showMessage('Rol no permitido', 'error');
					}
				}, 1200);
			} else {
				showMessage(data.error || 'Credenciales incorrectas', 'error');
			}
		} catch (err) {
			showMessage('Error de conexión con el servidor', 'error');
		}
	});
});

function validateEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showMessage(msg, type) {
	let msgDiv = document.querySelector('.login-message');
	if (!msgDiv) {
		msgDiv = document.createElement('div');
		msgDiv.className = 'login-message';
		document.querySelector('.login-form').prepend(msgDiv);
	}
	msgDiv.textContent = msg;
	msgDiv.style.color = type === 'error' ? 'red' : 'green';
	msgDiv.style.marginBottom = '10px';
}
