import { connect } from '../config/db/connect.js';

export class Gallery {
	static async findAll() {
		const sqlQuery = `
			SELECT 
				g.gallery_id AS id,
				g.title,
				g.subtitle,
				f.Files_route AS image_url,
				f.Files_name  AS image_name,
				g.created_at,
				g.updated_at
			FROM blog_gallery g
			JOIN files f ON g.files_fk = f.Files_id
			ORDER BY g.created_at DESC
		`;
		const [rows] = await connect.query(sqlQuery);
		return rows;
	}

	static async createFile({ Files_name, Files_route, Type_file_fk }) {
		const sqlQuery = `
			INSERT INTO files (Files_name, Files_route, Type_file_fk)
			VALUES (?, ?, ?)
		`;
		const [result] = await connect.query(sqlQuery, [Files_name, Files_route, Type_file_fk]);
		return result.insertId;
	}

	static async create({ title, subtitle, files_fk, user_fk = null }) {
		const sqlQuery = `
			INSERT INTO blog_gallery (title, subtitle, files_fk, user_fk)
			VALUES (?, ?, ?, ?)
		`;
		const [result] = await connect.query(sqlQuery, [title, subtitle || null, files_fk, user_fk]);
		return { id: result.insertId, title, subtitle, files_fk, user_fk };
	}
}
