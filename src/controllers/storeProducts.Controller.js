import { connect } from '../config/db/connect.js';
import { upload } from '../services/upload.js';

const TABLE_PRODUCTS = 'tienda_productos';
const TABLE_IMAGES = 'tienda_productos_imagenes';
const MAX_IMAGES_PER_PRODUCT = 3;

export const listStoreProducts = async (_req, res) => {
	try {
		const pagina = typeof _req?.query?.pagina === 'string' && _req.query.pagina.trim() ? _req.query.pagina.trim() : null;

		const sql = `
			SELECT
				p.producto_id,
				p.nombre,
				p.precio_cop,
				p.pagina,
				p.stock,
				p.descripcion,
				p.categoria,
				p.sabores,
				p.activo,
				p.creado_en,
				p.actualizado_en,
				(
					SELECT i.url_imagen
					FROM ${TABLE_IMAGES} i
					WHERE i.producto_fk = p.producto_id
					ORDER BY i.orden ASC, i.imagen_id ASC
					LIMIT 1
				) AS imagen_principal
			FROM ${TABLE_PRODUCTS} p
			${pagina ? 'WHERE p.pagina = ?' : ''}
			ORDER BY p.producto_id DESC
		`;
		const [rows] = await connect.query(sql, pagina ? [pagina] : []);

		const data = rows.map((r) => ({
			...r,
			sabores: typeof r.sabores === 'string' ? safeJsonParse(r.sabores) : r.sabores
		}));

		res.status(200).json(data);
	} catch (error) {
		res.status(500).json({ error: 'Error al listar productos de tienda', details: error.message });
	}
};

export const getStoreProductById = async (req, res) => {
	try {
		const id = req.params.id;
		const [products] = await connect.query(`SELECT * FROM ${TABLE_PRODUCTS} WHERE producto_id = ?`, [id]);
		if (!products.length) return res.status(404).json({ error: 'Producto no encontrado' });

		const product = products[0];
		product.sabores = typeof product.sabores === 'string' ? safeJsonParse(product.sabores) : product.sabores;

		const [images] = await connect.query(
			`SELECT imagen_id, producto_fk, url_imagen, orden, creado_en FROM ${TABLE_IMAGES} WHERE producto_fk = ? ORDER BY orden ASC, imagen_id ASC`,
			[id]
		);

		res.status(200).json({
			...product,
			imagenes: images
		});
	} catch (error) {
		res.status(500).json({ error: 'Error al obtener producto', details: error.message });
	}
};

export const createStoreProduct = async (req, res) => {
	try {
		const { nombre, precio_cop, stock, descripcion, categoria, sabores, activo, pagina } = req.body;
		if (!nombre || !precio_cop) {
			return res.status(400).json({ error: 'Faltan campos requeridos: nombre, precio_cop' });
		}

		// Validar que precio_cop sea un número válido
		if (!isValidNumber(precio_cop)) {
			return res.status(400).json({ error: 'El precio debe ser un número válido' });
		}

		const saboresJson = normalizeFlavors(sabores);
		const activeValue = activo === undefined ? 1 : Number(Boolean(Number(activo)));
		const stockValue = stock === undefined || stock === null || stock === '' ? 0 : Number(stock);
		const pageValue = typeof pagina === 'string' && pagina.trim() ? pagina.trim() : 'comida-con-alma';

		const [result] = await connect.query(
			`INSERT INTO ${TABLE_PRODUCTS} (nombre, precio_cop, pagina, stock, descripcion, categoria, sabores, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[nombre, Number(precio_cop), pageValue, stockValue, descripcion || null, categoria || null, saboresJson, activeValue]
		);

		res.status(201).json({
			data: [{
				producto_id: result.insertId,
				nombre,
				precio_cop: Number(precio_cop),
				pagina: pageValue,
				stock: stockValue,
				descripcion: descripcion || null,
				categoria: categoria || null,
				sabores: safeJsonParse(saboresJson),
				activo: activeValue
			}],
			status: 201
		});
	} catch (error) {
		res.status(500).json({ error: 'Error al crear producto', details: error.message });
	}
};

export const updateStoreProduct = async (req, res) => {
	try {
		const id = req.params.id;
		const { nombre, precio_cop, stock, descripcion, categoria, sabores, activo, pagina } = req.body;
		if (!nombre || !precio_cop) {
			return res.status(400).json({ error: 'Faltan campos requeridos: nombre, precio_cop' });
		}

		// Validar que precio_cop sea un número válido
		if (!isValidNumber(precio_cop)) {
			return res.status(400).json({ error: 'El precio debe ser un número válido' });
		}

		const saboresJson = normalizeFlavors(sabores);
		const activeValue = activo === undefined ? 1 : Number(Boolean(Number(activo)));
		const stockValue = stock === undefined || stock === null || stock === '' ? 0 : Number(stock);
		const pageValue = typeof pagina === 'string' && pagina.trim() ? pagina.trim() : 'comida-con-alma';

		const [result] = await connect.query(
			`UPDATE ${TABLE_PRODUCTS} SET nombre = ?, precio_cop = ?, pagina = ?, stock = ?, descripcion = ?, categoria = ?, sabores = ?, activo = ? WHERE producto_id = ?`,
			[nombre, Number(precio_cop), pageValue, stockValue, descripcion || null, categoria || null, saboresJson, activeValue, id]
		);

		if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });

		res.status(200).json({
			data: [{ producto_id: Number(id), nombre, precio_cop: Number(precio_cop) }],
			status: 200,
			update: result.affectedRows
		});
	} catch (error) {
		res.status(500).json({ error: 'Error al actualizar producto', details: error.message });
	}
};

export const updateStoreProductStock = async (req, res) => {
	try {
		const id = req.params.id;
		const { stock } = req.body;
		const stockValue = stock === undefined || stock === null || stock === '' ? null : Number(stock);
		if (stockValue === null || Number.isNaN(stockValue) || !Number.isFinite(stockValue) || stockValue < 0) {
			return res.status(400).json({ error: 'El stock debe ser un número válido mayor o igual a 0' });
		}

		const [result] = await connect.query(
			`UPDATE ${TABLE_PRODUCTS} SET stock = ? WHERE producto_id = ?`,
			[stockValue, id]
		);

		if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });

		res.status(200).json({ data: [{ producto_id: Number(id), stock: stockValue }], status: 200 });
	} catch (error) {
		res.status(500).json({ error: 'Error al actualizar stock', details: error.message });
	}
};

export const deleteStoreProduct = async (req, res) => {
	try {
		const id = req.params.id;
		const [result] = await connect.query(`DELETE FROM ${TABLE_PRODUCTS} WHERE producto_id = ?`, [id]);
		if (result.affectedRows === 0) return res.status(404).json({ error: 'Producto no encontrado' });
		res.status(200).json({ data: [], status: 200, deleted: result.affectedRows });
	} catch (error) {
		res.status(500).json({ error: 'Error al eliminar producto', details: error.message });
	}
};

export const uploadStoreProductImages = [
	upload.array('images', MAX_IMAGES_PER_PRODUCT),
	async (req, res) => {
		try {
			const id = req.params.id;
			const [products] = await connect.query(`SELECT producto_id FROM ${TABLE_PRODUCTS} WHERE producto_id = ?`, [id]);
			if (!products.length) return res.status(404).json({ error: 'Producto no encontrado' });

			const [countRows] = await connect.query(
				`SELECT COUNT(*) AS total FROM ${TABLE_IMAGES} WHERE producto_fk = ?`,
				[id]
			);
			const currentCount = Number(countRows?.[0]?.total ?? 0);
			const incoming = Array.isArray(req.files) ? req.files.length : 0;

			if (incoming === 0) return res.status(400).json({ error: 'No se subió ninguna imagen' });
			if (currentCount + incoming > MAX_IMAGES_PER_PRODUCT) {
				return res.status(400).json({
					error: `Máximo ${MAX_IMAGES_PER_PRODUCT} imágenes por producto. Actualmente tienes ${currentCount} y estás intentando subir ${incoming}.`
				});
			}

			const values = req.files.map((f, idx) => {
				const url = `/uploads/${f.filename}`;
				const order = currentCount + idx;
				return [Number(id), url, order];
			});

			await connect.query(
				`INSERT INTO ${TABLE_IMAGES} (producto_fk, url_imagen, orden) VALUES ?`,
				[values]
			);

			const [images] = await connect.query(
				`SELECT imagen_id, producto_fk, url_imagen, orden, creado_en FROM ${TABLE_IMAGES} WHERE producto_fk = ? ORDER BY orden ASC, imagen_id ASC`,
				[id]
			);

			res.status(201).json({
				message: 'Imágenes subidas correctamente',
				imagenes: images
			});
		} catch (error) {
			res.status(500).json({ error: 'Error al subir imágenes', details: error.message });
		}
	}
];

export const deleteStoreProductImage = async (req, res) => {
	try {
		const { id, imageId } = req.params;
		const [rows] = await connect.query(
			`SELECT imagen_id, url_imagen FROM ${TABLE_IMAGES} WHERE imagen_id = ? AND producto_fk = ?`,
			[imageId, id]
		);
		if (!rows.length) return res.status(404).json({ error: 'Imagen no encontrada' });

		await connect.query(`DELETE FROM ${TABLE_IMAGES} WHERE imagen_id = ?`, [imageId]);

		const [images] = await connect.query(
			`SELECT imagen_id, producto_fk, url_imagen, orden, creado_en FROM ${TABLE_IMAGES} WHERE producto_fk = ? ORDER BY orden ASC, imagen_id ASC`,
			[id]
		);

		res.status(200).json({ message: 'Imagen eliminada', imagenes: images });
	} catch (error) {
		res.status(500).json({ error: 'Error al eliminar imagen', details: error.message });
	}
};

function normalizeFlavors(input) {
	if (input === undefined || input === null || input === '') return null;
	if (Array.isArray(input)) return JSON.stringify(input);
	if (typeof input === 'string') {
		const trimmed = input.trim();
		if (!trimmed) return null;
		// If it's already JSON, keep it
		if (trimmed.startsWith('[') && trimmed.endsWith(']')) return trimmed;
		// Otherwise assume comma-separated
		const arr = trimmed
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		return JSON.stringify(arr);
	}
	return JSON.stringify([]);
}

function safeJsonParse(str) {
	try {
		return JSON.parse(str);
	} catch {
		return null;
	}
}

// Helper para validar que un valor es un número válido y no NaN
function isValidNumber(value) {
	const n = Number(value);
	return !Number.isNaN(n) && Number.isFinite(n);
}
