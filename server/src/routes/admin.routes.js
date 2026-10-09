import { Router } from 'express';
import * as admin from '../controllers/admin.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { revalidateSiteOnChange } from '../middleware/revalidate.middleware.js';
import { uploadImage, uploadProductImages, uploadGalleryImages } from '../middleware/upload.middleware.js';
import {
  validate, idParam, imageParams, categorySchema, productSchema, productUpdateSchema, adminProductQuerySchema,
  imageOrderSchema, imageAltSchema, imageUploadQuerySchema, brandSchema, galleryQuerySchema, galleryUploadSchema, galleryUpdateSchema,
  enquiryQuerySchema, enquiryUpdateSchema,
} from '../validators/index.js';

const router = Router();
router.use(verifyToken, requireAdmin, revalidateSiteOnChange);

router.get('/stats', admin.stats);

router.post('/categories', validate({ body: categorySchema }), admin.createCategory);
router.put('/categories/:id', validate({ params: idParam, body: categorySchema }), admin.updateCategory);
router.delete('/categories/:id', validate({ params: idParam }), admin.deleteCategory);

router.get('/products', validate({ query: adminProductQuerySchema }), admin.listProducts);
router.post('/products', validate({ body: productSchema }), admin.createProduct);
router.get('/products/:id', validate({ params: idParam }), admin.getProduct);
router.patch('/products/:id', validate({ params: idParam, body: productUpdateSchema }), admin.updateProduct);
router.delete('/products/:id', validate({ params: idParam }), admin.deleteProduct);

// Product photos: add (multi), reorder (first = cover), replace, edit alt text, delete.
router.post('/products/:id/images', validate({ params: idParam, query: imageUploadQuerySchema }), uploadProductImages, admin.addProductImages);
router.put('/products/:id/images/order', validate({ params: idParam, body: imageOrderSchema }), admin.reorderProductImages);
router.put('/products/:id/images/:imageId', validate({ params: imageParams }), uploadImage, admin.replaceProductImage);
router.patch('/products/:id/images/:imageId', validate({ params: imageParams, body: imageAltSchema }), admin.updateProductImage);
router.delete('/products/:id/images/:imageId', validate({ params: imageParams }), admin.deleteProductImage);

router.get('/brands', admin.listBrands);
router.post('/brands', validate({ body: brandSchema }), admin.createBrand);
router.put('/brands/:id', validate({ params: idParam, body: brandSchema }), admin.updateBrand);
router.delete('/brands/:id', validate({ params: idParam }), admin.deleteBrand);
router.post('/brands/:id/logo', validate({ params: idParam }), uploadImage, admin.uploadBrandLogo);
router.delete('/brands/:id/logo', validate({ params: idParam }), admin.deleteBrandLogo);

router.get('/gallery', validate({ query: galleryQuerySchema }), admin.listGallery);
// multipart: body fields are parsed by multer, so validate after it.
router.post('/gallery', uploadGalleryImages, validate({ body: galleryUploadSchema }), admin.addGalleryImages);
router.put('/gallery/order', validate({ body: imageOrderSchema }), admin.reorderGallery);
router.patch('/gallery/:id', validate({ params: idParam, body: galleryUpdateSchema }), admin.updateGalleryImage);
router.put('/gallery/:id/image', validate({ params: idParam }), uploadImage, admin.replaceGalleryImage);
router.delete('/gallery/:id', validate({ params: idParam }), admin.deleteGalleryImage);

router.get('/enquiries', validate({ query: enquiryQuerySchema }), admin.listEnquiries);
router.get('/enquiries/:id', validate({ params: idParam }), admin.getEnquiry);
router.patch('/enquiries/:id', validate({ params: idParam, body: enquiryUpdateSchema }), admin.updateEnquiry);
router.delete('/enquiries/:id', validate({ params: idParam }), admin.deleteEnquiry);

export default router;
