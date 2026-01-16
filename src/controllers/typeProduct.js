import { connect } from '../config/db/connect.js';

export const showTypeProduct  = async (req, res) => {
    try {
        let sqlQuery = "SELECT * FROM type_product";
        const [results] = await connect.query(sqlQuery);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving type product', details: error.message });
    }
};

export const showTypeProductId = async (req, res) => {
    try {
        const [results] = await connect.query("SELECT Type_product_id, Type_product_name, Updated_at FROM type_product WHERE Type_product_id = ?", [req.params.id]);
        if (results.length === 0) return res.status(404).json({ error: 'Record not found' });
        res.status(200).json(results[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving type product', details: error.message });
    }
};

export const addTypeProduct = async (req, res) => {
    try {
        const { Type_product_name } = req.body;
        if (!Type_product_name) {
            return res.status(400).json({ error: 'Missing required fields'});
        }
        let sqlQuery = "INSERT INTO type_product (Type_product_name) VALUES (?)";
        const [result] = await connect.query(sqlQuery, [Type_product_name]);
        res.status(201).json({
            data: [{ id: result.insertId, Type_product_name }],
            status: 201
        })
    } catch (error) {
        res.status(500).json({ error: 'Error adding type product', details: error.message });
    }
};

export const updateTypeProduct = async (req, res) => { try {
        const { Type_product_name } = req.body;
        if (!Type_product_name) {
            return res.status(400).json({ error: 'Missing required fields'});
        }
        let sqlQuery = "UPDATE type_product SET Type_product_name = ? WHERE Type_product_id = ?";
        const [result] = await connect.query(sqlQuery, [Type_product_name, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Type product not found' });
        res.status(200).json({
            data: [{ id: req.params.id, Type_product_name }],
            status: 200,
            update: result.affectedRows 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error updating type product', details: error.message });
    }   
};

export const deleteTypeProduct = async (req, res) => {
    try {
        let sqlQuery = "DELETE FROM type_product WHERE Type_product_id = ?";
        const [result] = await connect.query(sqlQuery, [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Type product not found' });
        res.status(200).json({
            data: [],
            status: 200,
            deleted: result.affectedRows 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting type product', details: error.message });
    }
}; 