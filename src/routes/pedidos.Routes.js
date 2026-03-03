import { Router } from 'express';
import {
	getPedidos,
	getPedidoById,
	updatePedidoEstado,
	getPedidosByUser
} from '../controllers/pedidos.Controller.js';

const router = Router();

router.get('/', getPedidos);
router.get('/usuario/:email', getPedidosByUser);
router.get('/:id', getPedidoById);
router.patch('/:id/estado', updatePedidoEstado);

export default router;
