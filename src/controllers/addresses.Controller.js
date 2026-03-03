import { connect } from '../config/db/connect.js';

export const getAddresses = async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await connect.query(
            "SELECT * FROM addresses WHERE User_fk = ? ORDER BY is_default DESC",
            [userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error fetching addresses", details: error.message });
    }
};

export const addAddress = async (req, res) => {
    try {
        const { User_fk, Address_name, Address_city, Address_details, is_default } = req.body;
        
        if (is_default) {
            await connect.query("UPDATE addresses SET is_default = FALSE WHERE User_fk = ?", [User_fk]);
        }

        const [result] = await connect.query(
            "INSERT INTO addresses (User_fk, Address_name, Address_city, Address_details, is_default) VALUES (?, ?, ?, ?, ?)",
            [User_fk, Address_name, Address_city, Address_details, is_default || false]
        );
        res.status(201).json({ id: result.insertId, message: "Dirección agregada" });
    } catch (error) {
        res.status(500).json({ error: "Error adding address", details: error.message });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        await connect.query("DELETE FROM addresses WHERE Address_id = ?", [id]);
        res.json({ message: "Dirección eliminada" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting address", details: error.message });
    }
};
