import { connect } from '../config/db/connect.js';

export const enviarContacto = async (req, res) => {
	try {
		const nombre = (req.body?.nombre || '').trim();
		const email = (req.body?.email || '').trim();
		const mensaje = (req.body?.mensaje || '').trim();

		if (!nombre || !email || !mensaje) {
			return res.status(400).send('Faltan campos requeridos');
		}

		const sql = 'INSERT INTO mensajes_contacto (nombre, email, mensaje) VALUES (?, ?, ?)';
		await connect.query(sql, [nombre, email, mensaje]);

		return res.redirect(303, '/generalViews/contact');
	} catch (error) {
		console.error('Error al guardar mensaje de contacto:', error);
		return res.status(500).send('Error al guardar el mensaje');
	}
};
