import { connect } from '../config/db/connect.js';

export const showTypeFiles  = async (req, res) => {
    try {
        let sqlQuery = "SELECT * FROM type_files";
        const [results] = await connect.query(sqlQuery);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving type files', details: error.message });
    }
};

export const showTypeFilesId = async (req, res) => {
    try {
        const [results] = await connect.query("SELECT Type_files_id, Type_files_extension, Type_files_name, Updated_at FROM type_files WHERE Type_files_id = ?", [req.params.id]);
        if (results.length === 0) return res.status(404).json({ error: 'Record not found' });
        res.status(200).json(results[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving type files', details: error.message });
    }
};

export const addTypeFiles = async (req, res) => {
    try {
        const { Type_files_extension, Type_files_name } = req.body;
        if (!Type_files_extension || !Type_files_name) {
            return res.status(400).json({ error: 'Missing required fields'});
        }
        let sqlQuery = "INSERT INTO type_files (Type_files_extension, Type_files_name) VALUES (?, ?)";
        const [result] = await connect.query(sqlQuery, [Type_files_extension, Type_files_name]);
        res.status(201).json({
            data: [{ id: result.insertId, Type_files_extension, Type_files_name }],
            status: 201
        })
    } catch (error) {
        res.status(500).json({ error: 'Error adding type files', details: error.message });
    }
};

export const updateTypeFiles = async (req, res) => { try {
        const { Type_files_extension, Type_files_name } = req.body;
        if (!Type_files_extension || !Type_files_name) {
            return res.status(400).json({ error: 'Missing required fields'});
        }
        let sqlQuery = "UPDATE type_files SET Type_files_extension = ?, Type_files_name = ? WHERE Type_files_id = ?";
        const [result] = await connect.query(sqlQuery, [Type_files_extension, Type_files_name, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Type files not found' });
        res.status(200).json({
            data: [{ id: req.params.id, Type_files_extension, Type_files_name }],
            status: 200,
            update: result.affectedRows 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error updating type files', details: error.message });
    }   
};

export const deleteTypeFiles = async (req, res) => {
    try {
        let sqlQuery = "DELETE FROM type_files WHERE Type_files_id = ?";
        const [result] = await connect.query(sqlQuery, [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Type files not found' });
        res.status(200).json({
            data: [],
            status: 200,
            deleted: result.affectedRows 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting type files', details: error.message });
    }
}; 