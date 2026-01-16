import { connect } from '../config/db/connect.js';

export const showRoles  = async (req, res) => {
    try {
        let sqlQuery = "SELECT * FROM roles";
        const [results] = await connect.query(sqlQuery);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving roles', details: error.message });
    }
};

export const showRolesId = async (req, res) => {
    try {
        const [results] = await connect.query("SELECT Roles_id, Roles_name, Updated_at FROM roles WHERE Roles_id = ?", [req.params.id]);
        if (results.length === 0) return res.status(404).json({ error: 'Record not found' });
        res.status(200).json(results[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving roles', details: error.message });
    }
};

export const addRoles = async (req, res) => {
    try {
        const { Roles_name } = req.body;
        if (!Roles_name) {
            return res.status(400).json({ error: 'Missing required fields'});
        }
        let sqlQuery = "INSERT INTO roles (Roles_name) VALUES (?)";
        const [result] = await connect.query(sqlQuery, [Roles_name]);
        res.status(201).json({
            data: [{ id: result.insertId, Roles_name }],
            status: 201
        })
    } catch (error) {
        res.status(500).json({ error: 'Error adding roles', details: error.message });
    }
};

export const updateRoles = async (req, res) => {
    try {
        const { Roles_name} = req.body;
        if (!Roles_name) {
            return res.status(400).json({ error: 'Missing required fields'});
        }
        let sqlQuery = "UPDATE roles SET Roles_name = ? WHERE Roles_id = ?";
        const [result] = await connect.query(sqlQuery, [Roles_name, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Roles not found' });
        res.status(200).json({
            data: [{ id: req.params.id, Roles_name }],
            status: 200,
            update: result.affectedRows 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error updating roles', details: error.message });
    }   
};

export const deleteRoles = async (req, res) => {
    try {
        let sqlQuery = "DELETE FROM roles WHERE Roles_id = ?";
        const [result] = await connect.query(sqlQuery, [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Roles not found' });
        res.status(200).json({
            data: [],
            status: 200,
            deleted: result.affectedRows 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting roles', details: error.message });
    }
}; 