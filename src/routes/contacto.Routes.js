import { Router } from 'express';
import { enviarContacto } from '../controllers/contacto.Controller.js';

const router = Router();

router.post('/contacto/enviar', enviarContacto);

export default router;
