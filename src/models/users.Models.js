import { connect } from '../config/db/connect.js';
import { encryptPassword, comparePassword } from '../library/appBcrypt.js';
import jwt from 'jsonwebtoken';

export class User {
	constructor({ User_id, User_name, User_email, User_password, Roles_fk, Roles_name, Updated_at }) {
		this.User_id = User_id;
		this.User_name = User_name;
		this.User_email = User_email;
		this.User_password = User_password;
		this.Roles_fk = Roles_fk;
		this.Roles_name = Roles_name;
		this.Updated_at = Updated_at;
	}

	static async findAll() {
		const sqlQuery = `
			SELECT
				U.User_id,
				U.User_name,
				U.User_email,
				U.User_password,
				U.Roles_fk,
				R.Roles_name,
				U.Updated_at
			FROM users U
			LEFT JOIN roles R ON U.Roles_fk = R.Roles_id
		`;
		const [result] = await connect.query(sqlQuery);
		return result.map(row => new User(row));
	}

	static async findById(id) {
		const sqlQuery = `
			SELECT
				U.User_id,
				U.User_name,
				U.User_email,
				U.User_password,
				U.Roles_fk,
				R.Roles_name,
				U.Updated_at
			FROM users U
			LEFT JOIN roles R ON U.Roles_fk = R.Roles_id
			WHERE U.User_id = ?
		`;
		const [result] = await connect.query(sqlQuery, [id]);
		if (result.length === 0) return null;
		return new User(result[0]);
	}

	static async create({ User_name, User_email, User_password, Roles_fk }) {
		// Validar si el correo ya existe
		const [existing] = await connect.query("SELECT User_id FROM users WHERE User_email = ?", [User_email]);
		if (existing.length > 0) {
			throw new Error('Email already exists');
		}
		const hashedPassword = await encryptPassword(User_password);
		const sqlQuery = "INSERT INTO users (User_name, User_email, User_password, Roles_fk) VALUES (?, ?, ?, ?)";
		const [result] = await connect.query(sqlQuery, [User_name, User_email, hashedPassword, Roles_fk]);
		return { id: result.insertId, User_name, User_email, Roles_fk };
	}

	static async update(id, { User_name, User_email, User_password, Roles_fk }) {
		// Validar si el correo ya existe en otro usuario
		const [existing] = await connect.query("SELECT User_id FROM users WHERE User_email = ? AND User_id != ?", [User_email, id]);
		if (existing.length > 0) {
			throw new Error('Email already exists');
		}
		const hashedPassword = await encryptPassword(User_password);
		const sqlQuery = "UPDATE users SET User_name = ?, User_email = ?, User_password = ?, Roles_fk=? WHERE User_id = ?";
		const [result] = await connect.query(sqlQuery, [User_name, User_email, hashedPassword, Roles_fk, id]);
		return result.affectedRows;
	}

	static async delete(id) {
		const sqlQuery = "DELETE FROM users WHERE User_id = ?";
		const [result] = await connect.query(sqlQuery, [id]);
		return result.affectedRows;
	}

	static async login({ User_email, User_password }) {
		// ...
		const sqlQuery = `SELECT * FROM users WHERE User_email = ?`;
		const [result] = await connect.query(sqlQuery, [User_email]);
		// ...
		   if (result.length === 0) {
			   throw new Error('Invalid email');
		   }
		const user = result[0];
		// ...
		const validPassword = await comparePassword(User_password, user.User_password);
		// ...
		   if (!validPassword) {
			   throw new Error('Invalid password');
		   }
		// Obtener el nombre del rol
		const [roleResult] = await connect.query(
			'SELECT R.Roles_id, R.Roles_name FROM roles R WHERE R.Roles_id = ?',
			[user.Roles_fk]
		);
		// ...
		const role = roleResult.length > 0 ? roleResult[0] : { Roles_id: user.Roles_fk, Roles_name: null };
		// ...
		// ...
		const token = jwt.sign({id: user.User_id, email: user.User_email, role: role.Roles_name}, process.env.JWT_SECRET, {expiresIn: '1h'});
		return {
			token,
			role: {
				id: role.Roles_id,
				name: role.Roles_name
			}
		};
	}
}
