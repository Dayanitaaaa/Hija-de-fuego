import { connect } from '../config/db/connect.js';
import { encryptPassword, comparePassword } from '../library/appBcrypt.js';
import jwt from 'jsonwebtoken';

export class User {
	constructor({ User_id, User_name, User_email, User_password, Roles_fk, Roles_name, Updated_at }) {
		this.User_id = User_id;
		this.User_name = User_name;
		this.User_email = User_email;
		this.User_password = User_password;
		this.User_phone = null;
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

    static async create({ User_name, User_email, User_password, User_phone, Roles_fk, verification_token, verification_expires }) {
        // Validar si el correo ya existe
        const [existing] = await connect.query("SELECT User_id FROM users WHERE User_email = ?", [User_email]);
        if (existing.length > 0) {
            throw new Error('Email already exists');
        }
        const hashedPassword = await encryptPassword(User_password);
        const sqlQuery = "INSERT INTO users (User_name, User_email, User_password, User_phone, Roles_fk, verification_token, verification_expires, is_verified, phone_verified) VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, FALSE)";
        const [result] = await connect.query(sqlQuery, [User_name, User_email, hashedPassword, User_phone, Roles_fk, verification_token, verification_expires]);
        return { id: result.insertId, User_name, User_email, Roles_fk };
    }

    static async verifyOTP(email, otp) {
        const [result] = await connect.query(
            "SELECT * FROM users WHERE User_email = ? AND verification_token = ? AND verification_expires > NOW()",
            [email, otp]
        );
        if (result.length === 0) return false;

        await connect.query(
            "UPDATE users SET is_verified = TRUE, phone_verified = TRUE, verification_token = NULL, verification_expires = NULL WHERE User_id = ?",
            [result[0].User_id]
        );
        return true;
    }

    static async updateOTP(email, otp, expires) {
        await connect.query(
            "UPDATE users SET verification_token = ?, verification_expires = ? WHERE User_email = ?",
            [otp, expires, email]
        );
    }

	static async verifyPhoneOTP(email, otp) {
		const [result] = await connect.query(
			"SELECT * FROM users WHERE User_email = ? AND phone_token = ? AND phone_expires > NOW()",
			[email, otp]
		);
		if (result.length === 0) return false;

		await connect.query(
			"UPDATE users SET phone_verified = TRUE, phone_token = NULL, phone_expires = NULL WHERE User_id = ?",
			[result[0].User_id]
		);
		return true;
	}

	static async updatePhoneOTP(email, otp, expires) {
		await connect.query(
			"UPDATE users SET phone_token = ?, phone_expires = ? WHERE User_email = ?",
			[otp, expires, email]
		);
	}

	static async update(id, { User_name, User_email, User_password, User_phone, Roles_fk }) {
		// Validar si el correo ya existe en otro usuario
		const [existing] = await connect.query("SELECT User_id FROM users WHERE User_email = ? AND User_id != ?", [User_email, id]);
		if (existing.length > 0) {
			throw new Error('Email already exists');
		}

		let sqlQuery;
		let params;

		if (User_password) {
			const hashedPassword = await encryptPassword(User_password);
			sqlQuery = "UPDATE users SET User_name = ?, User_email = ?, User_password = ?, User_phone = ?, Roles_fk = ? WHERE User_id = ?";
			params = [User_name, User_email, hashedPassword, User_phone, Roles_fk, id];
		} else {
			sqlQuery = "UPDATE users SET User_name = ?, User_email = ?, User_phone = ?, Roles_fk = ? WHERE User_id = ?";
			params = [User_name, User_email, User_phone, Roles_fk, id];
		}

		const [result] = await connect.query(sqlQuery, params);
		return result.affectedRows;
	}

	static async delete(id) {
		const sqlQuery = "DELETE FROM users WHERE User_id = ?";
		const [result] = await connect.query(sqlQuery, [id]);
		return result.affectedRows;
	}

	static async findByEmail(email) {
		const [result] = await connect.query("SELECT * FROM users WHERE User_email = ?", [email]);
		return result[0] || null;
	}

	static async updateResetToken(id, token, expires) {
		await connect.query(
			"UPDATE users SET reset_token = ?, reset_expires = ? WHERE User_id = ?",
			[token, expires, id]
		);
	}

	static async findByResetToken(token) {
		const [result] = await connect.query(
			"SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()",
			[token]
		);
		return result[0] || null;
	}

	static async updatePassword(id, newPassword) {
		const hashedPassword = await encryptPassword(newPassword);
		await connect.query(
			"UPDATE users SET User_password = ?, reset_token = NULL, reset_expires = NULL WHERE User_id = ?",
			[hashedPassword, id]
		);
	}

	static async login({ User_email, User_password }) {
		const sqlQuery = `SELECT * FROM users WHERE User_email = ?`;
		const [result] = await connect.query(sqlQuery, [User_email]);
		if (result.length === 0) {
			throw new Error('Invalid email');
		}
		const user = result[0];

        if (!user.is_verified) {
            throw new Error('Email not verified');
        }

		if (!user.phone_verified) {
			throw new Error('Phone not verified');
		}

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
			},
			user: {
				User_id: user.User_id,
				User_name: user.User_name,
				User_email: user.User_email,
				User_phone: user.User_phone
			}
		};
	}
}
