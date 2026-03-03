import { Router } from 'express';
import { getAddresses, addAddress, deleteAddress } from '../controllers/addresses.Controller.js';

const router = Router();

router.get('/user/:userId', getAddresses);
router.post('/', addAddress);
router.delete('/:id', deleteAddress);

export default router;
