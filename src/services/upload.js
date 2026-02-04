import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../public/uploads');

// Asegura que la carpeta de uploads exista
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

function fileFilter(_req, file, cb) {
  if (allowedMimes.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Formato de archivo no permitido. Usa JPG, PNG o WEBP.'));
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});
