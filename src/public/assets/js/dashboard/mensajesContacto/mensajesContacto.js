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
			tbody.textContent = '';

			mensajes.forEach((m) => {
				const row = document.createElement('tr');

				const tdId = document.createElement('td');
				tdId.textContent = String(m.id ?? '');

				const tdNombre = document.createElement('td');
				tdNombre.textContent = String(m.nombre ?? '');

				const tdEmail = document.createElement('td');
				tdEmail.textContent = String(m.email ?? '');

				const tdMensaje = document.createElement('td');
				const fullMsg = String(m.mensaje ?? '');
				const preview = fullMsg.slice(0, 40) + (fullMsg.length > 40 ? '…' : '');
				tdMensaje.textContent = preview;

				const tdFecha = document.createElement('td');
				tdFecha.textContent = String(m.fecha_envio ?? '');

				const tdAcciones = document.createElement('td');
				const btn = document.createElement('button');
				btn.className = 'btn btn-sm btn-outline-dark btn-ver';
				btn.dataset.id = String(m.id ?? '');
				btn.type = 'button';
				btn.textContent = 'Ver';
				tdAcciones.appendChild(btn);

				row.appendChild(tdId);
				row.appendChild(tdNombre);
				row.appendChild(tdEmail);
				row.appendChild(tdMensaje);
				row.appendChild(tdFecha);
				row.appendChild(tdAcciones);

				tbody.appendChild(row);
			});

			document.querySelectorAll('.btn-ver').forEach((btn) => {
				btn.addEventListener('click', () => verDetalle(btn.dataset.id));
			});
		} catch (e) {
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: e.message,
				confirmButtonColor: '#96353B'
			});
		}
	}

	async function verDetalle(id) {
		try {
			const res = await fetch(`${HOST}${URL_MENSAJES_CONTACTO}/${id}`);
			if (!res.ok) throw new Error('No se pudo cargar el detalle');
			const m = await res.json();
			detalle.textContent = '';

			const nameRow = document.createElement('div');
			const nameStrong = document.createElement('strong');
			nameStrong.textContent = 'Nombre:';
			nameRow.appendChild(nameStrong);
			nameRow.append(` ${String(m.nombre ?? '')}`);

			const emailRow = document.createElement('div');
			const emailStrong = document.createElement('strong');
			emailStrong.textContent = 'Correo:';
			emailRow.appendChild(emailStrong);
			emailRow.append(` ${String(m.email ?? '')}`);

			const dateRow = document.createElement('div');
			const dateStrong = document.createElement('strong');
			dateStrong.textContent = 'Fecha:';
			dateRow.appendChild(dateStrong);
			dateRow.append(` ${String(m.fecha_envio ?? '')}`);

			const hr = document.createElement('hr');

			const msgWrap = document.createElement('div');
			msgWrap.style.whiteSpace = 'pre-wrap';
			msgWrap.textContent = String(m.mensaje ?? '');

			detalle.appendChild(nameRow);
			detalle.appendChild(emailRow);
			detalle.appendChild(dateRow);
			detalle.appendChild(hr);
			detalle.appendChild(msgWrap);
			
			// Mostrar formulario de respuesta
			respuestaIdInput.value = m.id;
			containerRespuesta.classList.remove('d-none');
			textoRespuesta.value = '';
		} catch (e) {
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: e.message,
				confirmButtonColor: '#96353B'
			});
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

			Swal.fire({
				icon: 'success',
				title: '¡Enviado!',
				text: data.message || 'Respuesta enviada correctamente. El mensaje se eliminará en 15 minutos',
				confirmButtonColor: '#96353B'
			});

			textoRespuesta.value = '';
			containerRespuesta.classList.add('d-none');
			detalle.textContent = 'Selecciona un mensaje para ver el detalle.';
			cargarMensajes();
		} catch (error) {
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: error.message,
				confirmButtonColor: '#96353B'
			});
		} finally {
			btn.disabled = false;
			btn.innerHTML = originalText;
		}
	});

	cargarMensajes();
});
