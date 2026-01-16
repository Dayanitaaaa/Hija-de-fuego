import { Router } from 'express';
import { showProduct, showProductId, addProduct, updateProduct, deleteProduct} from '../controllers/products.Controller.js';

const router = Router();
const nameProduct = '/product';

router.route(nameProduct)
    .get(showProduct)
    .post(addProduct);
router.route(`${nameProduct}/:id`)
    .get(showProductId)
    .put(updateProduct)
    .delete(deleteProduct);
export default router;