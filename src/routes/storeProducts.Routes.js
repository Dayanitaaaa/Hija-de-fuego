import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
	listStoreProducts,
	getStoreProductById,
	createStoreProduct,
	updateStoreProduct,
	updateStoreProductStock,
	deleteStoreProduct,
	uploadStoreProductImages,
	deleteStoreProductImage,
	addInventoryMovement,
	listInventoryMovements,
	processCheckout
} from '../controllers/storeProducts.Controller.js';

const router = Router();
const name = '/tiendaProductos';

router.route(`${name}/checkout`)
	.post(verifyToken, processCheckout);

router.route(name)
	.get(listStoreProducts)
	.post(createStoreProduct);

router.route(`${name}/movimientos`)
	.get(listInventoryMovements)
	.post(addInventoryMovement);

router.route(`${name}/:id`)
	.get(getStoreProductById)
	.put(updateStoreProduct)
	.delete(deleteStoreProduct);

router.route(`${name}/:id/stock`)
	.patch(updateStoreProductStock);

router.route(`${name}/:id/imagenes`)
	.post(uploadStoreProductImages);

router.route(`${name}/:id/imagenes/:imageId`)
	.delete(deleteStoreProductImage);

export default router;
