import { Router } from 'express';
import { listarMensajesContacto, obtenerMensajeContacto, responderMensajeContacto } from '../controllers/mensajesContacto.Controller.js';

const router = Router();
const base = '/mensajesContacto';

router.route(base)
	.get(listarMensajesContacto);

router.route(`${base}/responder`)
	.post(responderMensajeContacto);

router.route(`${base}/:id`)
	.get(obtenerMensajeContacto);

export default router;
