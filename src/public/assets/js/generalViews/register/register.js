document.addEventListener('DOMContentLoaded', async () => {
    const form = document.querySelector('.register-form');
    const nameInput = document.querySelector('input[placeholder="Nombre completo"]');
    const emailInput = document.querySelector('input[placeholder="Correo electrónico"]');
    const phoneInput = document.querySelector('input[placeholder="Número de celular"]');
    const passwordInput = document.querySelector('input[placeholder="Contraseña"]');
    const confirmInput = document.querySelector('input[placeholder="Confirmar contraseña"]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const password = passwordInput.value;
        const confirm = confirmInput.value;
        const selectedRoleId = 2; // Forzado a Rol Cliente

        if (!name || !email || !phone || !password || !confirm) {
            Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
            return;
        }
        if (password !== confirm) {
            Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
            return;
        }
        if (!validateEmail(email)) {
            Swal.fire('Error', 'Correo electrónico no válido', 'error');
            return;
        }

        try {
            Swal.showLoading();
            const res = await fetch(HOST + '/mySystem/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    User_name: name,
                    User_email: email,
                    User_phone: phone,
                    User_password: password,
                    Roles_fk: parseInt(selectedRoleId)
                })
            });

            const data = await res.json();

            if (res.status === 201) {
                showOtpModal(email);
            } else {
                Swal.fire('Error', data.error || 'Error al registrar', 'error');
            }
        } catch (err) {
            Swal.fire('Error', 'Error de conexión', 'error');
        }
    });
});

function showOtpModal(email) {
    Swal.fire({
        title: 'Verifica tu cuenta',
        text: `Hemos enviado un código de 6 dígitos a ${email}. Este código verificará tu correo y celular.`,
        input: 'text',
        inputPlaceholder: 'Ingresa el código de 6 dígitos',
        showCancelButton: true,
        confirmButtonText: 'Verificar',
        cancelButtonText: 'Reenviar código',
        allowOutsideClick: false,
        preConfirm: async (otp) => {
            try {
                const res = await fetch(HOST + '/mySystem/users/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ User_email: email, otp })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Código inválido');
                return data;
            } catch (error) {
                Swal.showValidationMessage(error.message);
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire('¡Éxito!', 'Cuenta verificada correctamente (correo y celular)', 'success').then(() => {
                window.location.href = '/generalViews/login';
            });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            resendOtp(email);
        }
    });
}

async function resendOtp(email) {
    try {
        const res = await fetch(HOST + '/mySystem/users/resend-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ User_email: email })
        });
        if (res.ok) {
            Swal.fire('Enviado', 'Se ha enviado un nuevo código a tu correo.', 'success').then(() => showOtpModal(email));
        }
    } catch (err) {
        Swal.fire('Error', 'No se pudo reenviar el código', 'error');
    }
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}