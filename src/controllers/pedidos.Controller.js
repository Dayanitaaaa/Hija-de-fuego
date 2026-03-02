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

		if (!['PENDIENTE', 'PREPARANDO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'].includes(estado)) {
			return res.status(400).json({ error: 'Estado no válido' });
		}

		// Obtener datos del pedido para enviar email
		const [pedidoRows] = await connection.query(
			`SELECT cliente_email, cliente_nombre FROM ${TABLE_PEDIDOS} WHERE pedido_id = ?`,
			[id]
		);

		if (pedidoRows.length === 0) {
			return res.status(404).json({ error: 'Pedido no encontrado' });
		}

		// Actualizar estado
		const [updateResult] = await connection.query(
			`UPDATE ${TABLE_PEDIDOS} SET estado = ? WHERE pedido_id = ?`,
			[estado, id]
		);

		// Enviar email al cliente
		const { cliente_email, cliente_nombre } = pedidoRows[0];
		try {
			await sendOrderStatusEmail(cliente_email, cliente_nombre, estado);
		} catch (emailError) {
			console.error('Error enviando email de estado:', emailError);
			// No bloqueamos la respuesta si solo falla el email, pero avisamos en consola
		}

		res.json({ message: 'Estado actualizado correctamente', estado });
	} catch (error) {
		console.error('DETALLE ERROR UPDATE PEDIDO:', error);
		res.status(500).json({ error: 'Error al actualizar estado', details: error.message });
	} finally {
		connection.release();
	}
};
