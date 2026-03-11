import { connect } from '../config/db/connect.js';
import { sendOrderStatusEmail } from '../config/mailer.js';

const TABLE_PEDIDOS = 'tienda_pedidos';
const TABLE_PEDIDOS_DETALLES = 'tienda_pedido_detalles';
const TABLE_PRODUCTS = 'tienda_productos';

export const getPedidos = async (req, res) => {
	const connection = await connect.getConnection();
	try {
		const [rows] = await connection.query(
			`SELECT pedido_id, cliente_nombre, cliente_email, total, estado, fecha_pedido 
			 FROM ${TABLE_PEDIDOS} 
			 ORDER BY fecha_pedido DESC`
		);
		res.json(rows);
	} catch (error) {
		console.error('Error al obtener pedidos:', error);
		res.status(500).json({ error: 'Error al obtener pedidos' });
	} finally {
		connection.release();
	}
};

export const getPedidosByUser = async (req, res) => {
	const connection = await connect.getConnection();
	try {
		const { email } = req.params;
		const [rows] = await connection.query(
			`SELECT pedido_id, total, estado, fecha_pedido 
			 FROM ${TABLE_PEDIDOS} 
			 WHERE cliente_email = ?
			 ORDER BY fecha_pedido DESC`,
			[email]
		);
		res.json(rows);
	} catch (error) {
		console.error('Error al obtener pedidos del usuario:', error);
		res.status(500).json({ error: 'Error al obtener tus pedidos' });
	} finally {
		connection.release();
	}
};

export const getPedidoById = async (req, res) => {
	const connection = await connect.getConnection();
	try {
		const { id } = req.params;
		const [pedidoRows] = await connection.query(
			`SELECT * FROM ${TABLE_PEDIDOS} WHERE pedido_id = ?`,
			[id]
		);

		if (pedidoRows.length === 0) {
			return res.status(404).json({ error: 'Pedido no encontrado' });
		}

		const [detallesRows] = await connection.query(
			`SELECT d.*, p.nombre 
			 FROM ${TABLE_PEDIDOS_DETALLES} d
			 LEFT JOIN ${TABLE_PRODUCTS} p ON d.producto_fk = p.producto_id
			 WHERE d.pedido_fk = ?`,
			[id]
		);

		const pedido = pedidoRows[0];
		pedido.detalles = detallesRows;

		res.json(pedido);
	} catch (error) {
		console.error('Error al obtener pedido:', error);
		res.status(500).json({ error: 'Error al obtener pedido' });
	} finally {
		connection.release();
	}
};

export const updatePedidoEstado = async (req, res) => {
	const connection = await connect.getConnection();
	try {
		const { id } = req.params;
		const { estado } = req.body;

		const estadosOrden = ['PENDIENTE', 'PREPARANDO', 'ENVIADO', 'ENTREGADO'];
		const finalizados = ['ENTREGADO', 'CANCELADO'];

		if (![...estadosOrden, 'CANCELADO'].includes(estado)) {
			return res.status(400).json({ error: 'Estado no válido' });
		}

		// Obtener datos del pedido actual
		const [pedidoRows] = await connection.query(
			`SELECT cliente_email, cliente_nombre, estado FROM ${TABLE_PEDIDOS} WHERE pedido_id = ?`,
			[id]
		);

		if (pedidoRows.length === 0) {
			return res.status(404).json({ error: 'Pedido no encontrado' });
		}

		const estadoActual = pedidoRows[0].estado;

		// 1. Si ya está finalizado, no permitir cambios (a menos que sea admin forzando, pero según regla general bloqueamos)
		if (finalizados.includes(estadoActual)) {
			return res.status(400).json({ error: `El pedido ya está en estado ${estadoActual} y no puede ser modificado.` });
		}

		// 2. Validar flujo secuencial para estados normales
		if (estadosOrden.includes(estadoActual) && estadosOrden.includes(estado)) {
			const indexActual = estadosOrden.indexOf(estadoActual);
			const indexNuevo = estadosOrden.indexOf(estado);

			if (indexNuevo <= indexActual) {
				return res.status(400).json({ error: 'No se puede retroceder a un estado anterior.' });
			}
		}

		// 3. Validación especial para CANCELADO
		if (estado === 'CANCELADO') {
			// Solo permitir cancelar si está en PENDIENTE o PREPARANDO
			if (!['PENDIENTE', 'PREPARANDO'].includes(estadoActual)) {
				return res.status(400).json({ error: 'No se puede cancelar un pedido que ya ha sido enviado.' });
			}
		}

		// Actualizar estado
		await connection.query(
			`UPDATE ${TABLE_PEDIDOS} SET estado = ? WHERE pedido_id = ?`,
			[estado, id]
		);

		// Enviar email al cliente
		const { cliente_email, cliente_nombre } = pedidoRows[0];
		try {
			await sendOrderStatusEmail(cliente_email, cliente_nombre, estado);
		} catch (emailError) {
			console.error('Error enviando email de estado:', emailError);
		}

		res.json({ message: 'Estado actualizado correctamente', estado });
	} catch (error) {
		console.error('DETALLE ERROR UPDATE PEDIDO:', error);
		res.status(500).json({ error: 'Error al actualizar estado', details: error.message });
	} finally {
		connection.release();
	}
};
