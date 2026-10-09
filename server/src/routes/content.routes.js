import { Router } from 'express';
import * as catalog from '../controllers/catalog.controller.js';
import { validate, productQuerySchema, slugParam, galleryQuerySchema } from '../validators/index.js';

const router = Router();

router.get('/categories', catalog.listCategories);
router.get('/categories/:slug', validate({ params: slugParam }), catalog.getCategory);
router.get('/brands', catalog.listBrands);
router.get('/brands/:slug', validate({ params: slugParam }), catalog.getBrand);
router.get('/products', validate({ query: productQuerySchema }), catalog.listProducts);
router.get('/products/:slug', validate({ params: slugParam }), catalog.getProduct);
router.get('/gallery', validate({ query: galleryQuerySchema }), catalog.listGallery);
router.get('/sitemap', catalog.sitemapEntries);

export default router;
