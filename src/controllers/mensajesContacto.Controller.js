import { connect } from '../config/db/connect.js';
import { enviarEmailRespuesta } from '../config/mailer.js';

export const listarMensajesContacto = async (req, res) => {
	try {
		const sql = `
			SELECT
				id,
				nombre,
				email,
				mensaje,
				fecha_envio
			FROM mensajes_contacto
			ORDER BY fecha_envio DESC
		`;
		const [rows] = await connect.query(sql);
		return res.json(rows);
	} catch (error) {
		console.error('Error al listar mensajes de contacto:', error);
		return res.status(500).json({ message: 'Error al listar mensajes de contacto' });
	}
};

export const obtenerMensajeContacto = async (req, res) => {
	try {
		const { id } = req.params;
		const sql = `
			SELECT
				id,
				nombre,
				email,
				mensaje,
				fecha_envio
			FROM mensajes_contacto
			WHERE id = ?
			LIMIT 1
		`;
		const [rows] = await connect.query(sql, [id]);
		if (!rows || rows.length === 0) {
			return res.status(404).json({ message: 'Mensaje no encontrado' });
		}
		return res.json(rows[0]);
	} catch (error) {
		console.error('Error al obtener mensaje de contacto:', error);
		return res.status(500).json({ message: 'Error al obtener mensaje de contacto' });
	}
};

export const responderMensajeContacto = async (req, res) => {
	try {
		const { id, respuesta } = req.body;
		if (!id || !respuesta) {
			return res.status(400).json({ message: 'Faltan datos para la respuesta' });
		}

		// 1. Obtener datos del mensaje original
		const [rows] = await connect.query('SELECT email, nombre FROM mensajes_contacto WHERE id = ?', [id]);
		if (!rows || rows.length === 0) {
			return res.status(404).json({ message: 'Mensaje original no encontrado' });
		}

		const { email, nombre } = rows[0];

		// 2. Enviar email
		await enviarEmailRespuesta(email, `Re: Mensaje de contacto - Hija del Fuego`, respuesta);

		return res.json({ message: 'Respuesta enviada correctamente al correo del cliente' });
	} catch (error) {
		console.error('Error al responder mensaje:', error);
		return res.status(500).json({ message: 'Error al enviar la respuesta por correo' });
	}
};
