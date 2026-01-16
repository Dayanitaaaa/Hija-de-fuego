import { Product } from '../models/products.Models.js';

export const showProduct = async (req, res) => {
	try {
		const products = await Product.findAll();
		res.status(200).json(products);
	} catch (error) {
		res.status(500).json({ error: 'Error fetching products', details: error.message });
	}
};

export const showProductId = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		if (!product) return res.status(404).json({ error: 'Product not found' });
		res.status(200).json(product);
	} catch (error) {
		res.status(500).json({ error: 'Error fetching product', details: error.message });
	}
};

export const addProduct = async (req, res) => {
	try {
		const { Product_name, Product_description, Product_price, Product_amount, Type_product_fk, Files_fk } = req.body;
		if (!Product_name || !Product_price || !Product_amount || !Type_product_fk || !Files_fk) {
			return res.status(400).json({ error: 'Missing required fields' });
		}
		const product = await Product.create({ Product_name, Product_description, Product_price, Product_amount, Type_product_fk, Files_fk });
		res.status(201).json({ data: [product], status: 201 });
	} catch (error) {
		res.status(500).json({ error: 'Error adding product', details: error.message });
	}
};

export const updateProduct = async (req, res) => {
	try {
		const { Product_name, Product_description, Product_price, Product_amount, Type_product_fk, Files_fk } = req.body;
		if (!Product_name || !Product_price || !Product_amount || !Type_product_fk || !Files_fk) {
			return res.status(400).json({ error: 'Missing required fields' });
		}
		const updated = await Product.update(req.params.id, { Product_name, Product_description, Product_price, Product_amount, Type_product_fk, Files_fk });
		if (updated === 0) return res.status(404).json({ error: 'Product not found' });
		res.status(200).json({ data: [{ id: req.params.id, Product_name, Product_description, Product_price, Product_amount, Type_product_fk, Files_fk }], status: 200, update: updated });
	} catch (error) {
		res.status(500).json({ error: 'Error updating product', details: error.message });
	}
};

export const deleteProduct = async (req, res) => {
	try {
		const deleted = await Product.delete(req.params.id);
		if (deleted === 0) return res.status(404).json({ error: 'Product not found' });
		res.status(200).json({ data: [], status: 200, deleted });
	} catch (error) {
		res.status(500).json({ error: 'Error deleting product', details: error.message });
	}
};
