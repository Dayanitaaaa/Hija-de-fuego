document.addEventListener('DOMContentLoaded', async () => {
    const form = document.querySelector('.register-form');
    const nameInput = document.querySelector('input[placeholder="Nombre completo"]');
    const emailInput = document.querySelector('input[placeholder="Correo electrónico"]');
    const passwordInput = document.querySelector('input[placeholder="Contraseña"]');
    const confirmInput = document.querySelector('input[placeholder="Confirmar contraseña"]');
    const roleSelect = document.getElementById('role-select');

    // --- 1. Cargar Roles Dinámicamente ---
    try {
        const response = await fetch(HOST + '/mySystem/roles');
        if (!response.ok) {
            throw new Error('No se pudieron cargar los roles.');
        }
        const roles = await response.json();
        
        roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role.Roles_id;
            option.textContent = role.Roles_name;
            roleSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error al cargar roles:', error);
        showMessage('No se pudieron cargar los roles. Inténtalo de nuevo.', 'error');
    }

    // --- 2. Manejar el Envío del Formulario ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirm = confirmInput.value;
        const selectedRoleId = roleSelect.value;

        // Validaciones
        if (!name || !email || !password || !confirm || !selectedRoleId) {
            showMessage('Todos los campos son obligatorios', 'error');
            return;
        }
        if (password !== confirm) {
            showMessage('Las contraseñas no coinciden', 'error');
            return;
        }
        if (!validateEmail(email)) {
            showMessage('Correo electrónico no válido', 'error');
            return;
        }

        // Enviar petición al backend
        try {
            const res = await fetch(HOST + '/mySystem/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    User_name: name,
                    User_email: email,
                    User_password: password,
                    Roles_fk: selectedRoleId // Enviar el rol seleccionado
                })
            });

            const data = await res.json();

            if (res.status === 201) {
                showMessage('¡Registro exitoso! Redirigiendo...', 'success');
                setTimeout(() => {
                    window.location.href = '/generalViews/login';
                }, 1500);
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