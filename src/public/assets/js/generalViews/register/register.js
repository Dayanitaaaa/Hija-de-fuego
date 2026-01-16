document.addEventListener('DOMContentLoaded', () => {
	// Protección: Redirigir si ya hay token (usuario logueado)
	if (localStorage.getItem('token')) {
		window.location.href = '/dashboard/homeDashboard';
		return;
	}
	const form = document.querySelector('.register-form');
	const inputs = document.querySelectorAll('.register-input');
	const nameInput = inputs[0];
	const emailInput = inputs[1];
	const passwordInput = inputs[2];
	const confirmInput = inputs[3];

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		// Validaciones
		const name = nameInput.value.trim();
		const email = emailInput.value.trim();
		const password = passwordInput.value;
		const confirm = confirmInput.value;

		if (!name || !email || !password || !confirm) {
			showMessage('Todos los campos son obligatorios', 'error');
			return;
		}
		if (!validateEmail(email)) {
			showMessage('Correo electrónico no válido', 'error');
			return;
		}
		if (password.length < 6) {
			showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
			return;
		}
		if (password !== confirm) {
			showMessage('Las contraseñas no coinciden', 'error');
			return;
		}

		// Enviar petición al backend
		try {
			const res = await fetch(HOST + URL_USERS, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					User_name: name,
					User_email: email,
					User_password: password,
					Roles_fk: 2 // Por defecto, rol usuario normal (ajusta según tu lógica)
				})
			});
			const data = await res.json();
			if (res.status === 201) {
				showMessage('¡Registro exitoso! Redirigiendo...', 'success');
				setTimeout(() => {
					window.location.href = URL_GENERAL_VIEWS_LOGIN;
				}, 1500);
			} else if (res.status === 409) {
				showMessage('El correo ya está registrado', 'error');
			} else {
				showMessage(data.error || 'Error al registrar usuario', 'error');
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
	let msgDiv = document.querySelector('.register-message');
	if (!msgDiv) {
		msgDiv = document.createElement('div');
		msgDiv.className = 'register-message';
		document.querySelector('.register-form').prepend(msgDiv);
	}
	msgDiv.textContent = msg;
	msgDiv.style.color = type === 'error' ? 'red' : 'green';
	msgDiv.style.marginBottom = '10px';
}
