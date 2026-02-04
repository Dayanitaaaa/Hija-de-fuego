import { Router } from 'express';
import { upload } from '../services/upload.js';
import { Gallery } from '../models/gallery.model.js';

const router = Router();

// GET /api/gallery
router.get('/', async (_req, res) => {
  try {
    const rows = await Gallery.findAll();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error obteniendo galería' });
  }
});

// POST /api/gallery  (FormData: title, subtitle, image)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle } = req.body;
    if (!title || !req.file) return res.status(400).json({ message: 'Falta título o imagen' });

    // Mapea mimetype al ID de type_files (usa tus IDs: jpg=6, png=7)
    const mimeToTypeId = {
      'image/jpeg': 6,
      'image/png': 7
    };
    const typeFileId = mimeToTypeId[req.file.mimetype];
    if (!typeFileId) return res.status(400).json({ message: 'Tipo de imagen no permitido' });

    const files_fk = await Gallery.createFile({
      Files_name: req.file.filename,
      Files_route: `/uploads/${req.file.filename}`,
      Type_file_fk: typeFileId
    });

    const created = await Gallery.create({ title, subtitle, files_fk });
    res.status(201).json({ ...created, image_url: `/uploads/${req.file.filename}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creando galería' });
  }
});

export default router;