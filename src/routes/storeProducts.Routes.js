import { Router } from 'express';
import {
	listStoreProducts,
	getStoreProductById,
	createStoreProduct,
	updateStoreProduct,
	deleteStoreProduct,
	uploadStoreProductImages,
	deleteStoreProductImage
} from '../controllers/storeProducts.Controller.js';

const router = Router();
const name = '/tiendaProductos';

router.route(name)
	.get(listStoreProducts)
	.post(createStoreProduct);

router.route(`${name}/:id`)
	.get(getStoreProductById)
	.put(updateStoreProduct)
	.delete(deleteStoreProduct);

router.route(`${name}/:id/imagenes`)
	.post(uploadStoreProductImages);

router.route(`${name}/:id/imagenes/:imageId`)
	.delete(deleteStoreProductImage);

export default router;
