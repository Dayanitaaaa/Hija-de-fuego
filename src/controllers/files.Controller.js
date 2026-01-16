import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { connect } from '../config/db/connect.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta absoluta al directorio de imágenes
const pathImage = path.join(__dirname, '../public/assets/img');


if (!fs.existsSync(pathImage)) {
  fs.mkdirSync(pathImage, { recursive: true });
}

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const publicPath = path.join(__dirname, '../public/assets/documents');
    const officeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (officeTypes.includes(file.mimetype)) {
      if (!fs.existsSync(publicPath)) {
        fs.mkdirSync(publicPath, { recursive: true });
      }
      cb(null, publicPath);
    } else {
      cb(null, pathImage);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', // .jpeg
    'image/jpg', // .jpg
    'image/png', // .png
    'application/pdf', // .pdf
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 5 MB
});

// ✅ POST - Subir archivo
export const addFiles = [
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No se subió ningún archivo' });
      }



      const customName = req.body.fileName || req.file.originalname;
      const fileUrl = `/assets/img/${req.file.filename}`;
      const typeFileFk = req.body.typeFileFk || null;

      await connect.query(
        'INSERT INTO files (Files_name, Files_route, Type_file_fk) VALUES (?, ?, ?)',
        [customName, fileUrl, typeFileFk]
      );

      res.status(200).json({
        message: 'Archivo subido y registrado en la base de datos',
        file: { name: customName, url: fileUrl }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
];

// ✅ GET - Todos los archivos
export const showFiles = async (req, res) => {
  try {
    const sqlQuery = `
      SELECT 
        F.Files_id,
        F.Files_name,
        F.Files_route,
        F.Type_file_fk,
        T.Type_files_extension,
        F.Updated_at
      FROM files F 
      LEFT JOIN type_files T ON F.Type_file_fk = T.Type_files_id
    `;
    const [rows] = await connect.query(sqlQuery);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los archivos' });
  }
};

// ✅ GET - Archivo por ID
export const showFilesById = async (req, res) => {
  try {
    const sqlQuery = `
      SELECT 
        F.Files_id,
        F.Files_name,
        F.Files_route,
        F.Type_file_fk,
        T.Type_files_extension,
        F.Updated_at
      FROM files F 
      LEFT JOIN type_files T ON F.Type_file_fk = T.Type_files_id
      WHERE F.Files_id = ?
    `;
    const [result] = await connect.query(sqlQuery, [req.params.id]);
    if (result.length === 0) return res.status(404).json({ error: "Archivo no encontrado" });
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el archivo", details: error.message });
  }
};

// ✅ PUT - Actualizar archivo
export const updateFiles = [
  upload.single('file'),
  async (req, res) => {
    try {

  const { fileName, typeFileFk } = req.body;
      const fileId = req.params.id;

      const [result] = await connect.query('SELECT * FROM files WHERE Files_id = ?', [fileId]);
      if (result.length === 0) return res.status(404).json({ error: "Archivo no encontrado" });

      const prevFile = result[0];
      let fileUrl = prevFile.Files_route;

      // Si hay nuevo archivo, eliminar el anterior
      if (req.file) {
        const fullPath = path.join(__dirname, '../../public', prevFile.Files_route);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        fileUrl = `/assets/img/${req.file.filename}`;
      }

      const newName = fileName || prevFile.Files_name;
      const newTypeFileFk = typeFileFk !== undefined ? typeFileFk : prevFile.Type_file_fk;

      await connect.query(
        'UPDATE files SET Files_name = ?, Files_route = ?, Type_file_fk = ? WHERE Files_id = ?',
        [newName, fileUrl, newTypeFileFk, fileId]
      );

      res.status(200).json({ message: 'Archivo actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar archivo", details: error.message });
    }
  }
];

// ✅ DELETE - Eliminar archivo
export const deleteFiles = async (req, res) => {
  try {
    const filesId = req.params.id;

    const [result] = await connect.query('SELECT * FROM files WHERE Files_id = ?', [filesId]);
    if (result.length === 0) return res.status(404).json({ error: "Archivo no encontrado" });

    const file = result[0];

    const fullPath = path.join(__dirname, '../../public', file.Files_route);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    await connect.query('DELETE FROM files WHERE Files_id = ?', [filesId]);

    res.status(200).json({ message: 'Archivo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar archivo", details: error.message });
  }
};

// ✅ GET - Descargar archivo por ID
export const downloadFiles = async (req, res) => {
  try {
    const fileId = req.params.id;
    const [result] = await connect.query('SELECT * FROM files WHERE Files_id = ?', [fileId]);
    if (result.length === 0) return res.status(404).json({ error: "Archivo no encontrado" });

    const file = result[0];
    // Determina la ruta física según el tipo de archivo
    let filePath;
    const officeTypes = ['.pdf', '.xlsx', '.docx'];
    if (officeTypes.includes(path.extname(file.Files_route))) {
      filePath = path.join(__dirname, '../public/assets/documents', path.basename(file.Files_route));
    } else {
      filePath = path.join(__dirname, '../public/assets/img', path.basename(file.Files_route));
    }

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Archivo no encontrado en el servidor" });

    res.download(filePath, file.Files_name + path.extname(file.Files_route));
  } catch (error) {
    res.status(500).json({ error: "Error al descargar archivo", details: error.message });
  }
};