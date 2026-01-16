
import { User } from '../models/users.Models.js';



export const showUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Error fetching users", details: error.message });
    }
};

export const showUsersId = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: "Error fetching user", details: error.message });
    }
};

export const addUsers = async (req, res) => {
    try {
        const { User_name, User_email, User_password, Roles_fk } = req.body;
        if (!User_name || !User_email || !User_password || !Roles_fk) {
            return res.status(400).json({ error: 'Missing required fields'});
        }
        try {
            const user = await User.create({ User_name, User_email, User_password, Roles_fk });
            res.status(201).json({
                data: [user],
                status: 201
            });
        } catch (err) {
            if (err.message === 'Email already exists') {
                return res.status(409).json({ error: 'Email already exists' });
            }
            throw err;
        }
    } catch (error) {
        res.status(500).json({ error: 'Error adding users', details: error.message });
    }
};

export const updateUsers = async (req, res) => {
    try {
        const { User_name, User_email, User_password, Roles_fk } = req.body;
        if (!User_name || !User_email || !User_password || !Roles_fk) {
            return res.status(400).json({ error: 'Missing required fields'});
        }
        try {
            const updated = await User.update(req.params.id, { User_name, User_email, User_password, Roles_fk });
            if (updated === 0) return res.status(404).json({ error: 'Users not found' });
            res.status(200).json({
                data: [{ id: req.params.id, User_name, User_email, Roles_fk }],
                status: 200,
                update: updated
            });
        } catch (err) {
            if (err.message === 'Email already exists') {
                return res.status(409).json({ error: 'Email already exists' });
            }
            throw err;
        }
    } catch (error) {
        res.status(500).json({ error: 'Error updating users', details: error.message });
    }
};

export const deleteUsers = async (req, res) => {
    try {
        const deleted = await User.delete(req.params.id);
        if (deleted === 0) return res.status(404).json({ error: 'Users not found' });
        res.status(200).json({
            data: [],
            status: 200,
            deleted
        });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting users', details: error.message });
    }
};

export const loginUsers = async (req, res) => {
    // ...
    try {
        const { User_email, User_password } = req.body;
        if (!User_email || !User_password) {
            console.log('Faltan campos requeridos');
            return res.status(400).json({ error: 'Missing required fields'});
        }
        try {
            const { token, role } = await User.login({ User_email, User_password });
            // ...
            res.json({ token, role });
        } catch (err) {
            console.log('Error en login:', err.message);
            if (err.message === 'Invalid email') {
                return res.status(401).json({ error: 'Invalid email' });
            }
            if (err.message === 'Invalid password') {
                return res.status(401).json({ error: 'Invalid password' });
            }
            throw err;
        }
    } catch (error) {
        console.log('Error inesperado en loginUsers:', error); res.status(500).json({ error: 'Error logging in user', details: error.message }); } };