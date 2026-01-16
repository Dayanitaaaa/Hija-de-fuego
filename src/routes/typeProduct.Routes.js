import { Router } from 'express';
import { showTypeProduct, showTypeProductId, addTypeProduct, updateTypeProduct, deleteTypeProduct} from '../controllers/typeProduct.js';

const router = Router();
const nameTypeProduct = '/typeProduct';

router.route(nameTypeProduct)
    .get(showTypeProduct)
    .post(addTypeProduct);
router.route(`${nameTypeProduct}/:id`)
    .get(showTypeProductId)
    .put(updateTypeProduct)
    .delete(deleteTypeProduct);
export default router;