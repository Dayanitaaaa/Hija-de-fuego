document.addEventListener('DOMContentLoaded', () => {
	if (typeof HOST === 'undefined') window.HOST = 'http://localhost:3000';
	if (typeof URL_MENSAJES_CONTACTO === 'undefined') window.URL_MENSAJES_CONTACTO = '/mySystem/mensajesContacto';

	if (!localStorage.getItem('token')) {
		window.location.href = '/generalViews/login';
		return;
	}

	const tbody = document.querySelector('#mensajesTable tbody');
	const detalle = document.getElementById('detalleMensaje');
	const containerRespuesta = document.getElementById('containerRespuesta');
	const formRespuesta = document.getElementById('formRespuesta');
	const respuestaIdInput = document.getElementById('respuestaId');
	const textoRespuesta = document.getElementById('textoRespuesta');

	function escapeHtml(str) {
		return String(str)
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#039;');
	}

	async function cargarMensajes() {
		try {
			const res = await fetch(`${HOST}${URL_MENSAJES_CONTACTO}`);
			if (!res.ok) throw new Error('No se pudieron cargar los mensajes');
			const mensajes = await res.json();
			tbody.innerHTML = '';

			mensajes.forEach((m) => {
				const row = document.createElement('tr');
				row.innerHTML = `
					<td>${m.id}</td>
					<td>${escapeHtml(m.nombre)}</td>
					<td>${escapeHtml(m.email)}</td>
					<td>${escapeHtml((m.mensaje || '').slice(0, 40))}${(m.mensaje || '').length > 40 ? '…' : ''}</td>
					<td>${m.fecha_envio ?? ''}</td>
					<td>
						<button class="btn btn-sm btn-outline-dark btn-ver" data-id="${m.id}">Ver</button>
					</td>
				`;
				tbody.appendChild(row);
			});

			document.querySelectorAll('.btn-ver').forEach((btn) => {
				btn.addEventListener('click', () => verDetalle(btn.dataset.id));
			});
		} catch (e) {
			alert(e.message);
		}
	}

	async function verDetalle(id) {
		try {
			const res = await fetch(`${HOST}${URL_MENSAJES_CONTACTO}/${id}`);
			if (!res.ok) throw new Error('No se pudo cargar el detalle');
			const m = await res.json();
			detalle.innerHTML = `
				<div><strong>Nombre:</strong> ${escapeHtml(m.nombre)}</div>
				<div><strong>Correo:</strong> ${escapeHtml(m.email)}</div>
				<div><strong>Fecha:</strong> ${m.fecha_envio ?? ''}</div>
				<hr>
				<div style="white-space: pre-wrap;">${escapeHtml(m.mensaje)}</div>
			`;
			
			// Mostrar formulario de respuesta
			respuestaIdInput.value = m.id;
			containerRespuesta.classList.remove('d-none');
			textoRespuesta.value = '';
		} catch (e) {
			alert(e.message);
		}
	}

	formRespuesta.addEventListener('submit', async (e) => {
		e.preventDefault();
		const id = respuestaIdInput.value;
		const respuesta = textoRespuesta.value.trim();

		if (!id || !respuesta) return;

		const btn = document.getElementById('btnEnviarRespuesta');
		const originalText = btn.innerHTML;
		btn.disabled = true;
		btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

		try {
			const res = await fetch(`${HOST}${URL_MENSAJES_CONTACTO}/responder`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id, respuesta })
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Error al enviar respuesta');

			alert('Respuesta enviada con éxito al correo del cliente');
			textoRespuesta.value = '';
		} catch (error) {
			alert('Error: ' + error.message);
		} finally {
			btn.disabled = false;
			btn.innerHTML = originalText;
		}
	});

	cargarMensajes();
});
