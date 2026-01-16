import { connect } from '../config/db/connect.js';

export class Product {
	constructor({ Product_id, Product_name, Product_description, Product_price, Product_amount, Type_product_fk, Files_fk, Updated_at }) {
		this.Product_id = Product_id;
		this.Product_name = Product_name;
		this.Product_description = Product_description;
		this.Product_price = Product_price;
		this.Product_amount = Product_amount;
		this.Type_product_fk = Type_product_fk;
		this.Files_fk = Files_fk;
		this.Updated_at = Updated_at;
	}

	static async findAll() {
		const sqlQuery = `
			SELECT * FROM products
		`;
		const [result] = await connect.query(sqlQuery);
		return result.map(row => new Product(row));
	}

	static async findById(id) {
		const sqlQuery = `
			SELECT * FROM products WHERE Product_id = ?
		`;
		const [result] = await connect.query(sqlQuery, [id]);
		if (result.length === 0) return null;
		return new Product(result[0]);
	}

	static async create({ Product_name, Product_description, Product_price, Product_amount, Type_product_fk, Files_fk }) {
		const sqlQuery = `
			INSERT INTO products (Product_name, Product_description, Product_price, Product_amount, Type_product_fk, Files_fk)
			VALUES (?, ?, ?, ?, ?, ?)
		`;
		const [result] = await connect.query(sqlQuery, [Product_name, Product_description, Product_price, Product_amount, Type_product_fk, Files_fk]);
		return { id: result.insertId, Product_name, Product_description, Product_price, Product_amount, Type_product_fk, Files_fk };
	}

	static async update(id, { Product_name, Product_description, Product_price, Product_amount, Type_product_fk, Files_fk }) {
		const sqlQuery = `
			UPDATE products SET Product_name = ?, Product_description = ?, Product_price = ?, Product_amount = ?, Type_product_fk = ?, Files_fk = ?
			WHERE Product_id = ?
		`;
		const [result] = await connect.query(sqlQuery, [Product_name, Product_description, Product_price, Product_amount, Type_product_fk, Files_fk, id]);
		return result.affectedRows;
	}

	static async delete(id) {
		const sqlQuery = `
			DELETE FROM products WHERE Product_id = ?
		`;
		const [result] = await connect.query(sqlQuery, [id]);
		return result.affectedRows;
	}
}
