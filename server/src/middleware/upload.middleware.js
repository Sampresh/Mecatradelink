import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

export const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_BYTES = 10 * 1024 * 1024; // phone photos are often 5–10 MB; they are resized on upload
export const MAX_PRODUCT_IMAGES = 10;
const MAX_GALLERY_BATCH = 20;

// Files stay in memory; upload.service processes them and picks Cloudinary or local disk.
const imageUpload = (maxFiles) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_BYTES, files: maxFiles },
    fileFilter: (req, file, cb) => {
      if (!IMAGE_MIME.includes(file.mimetype)) {
        return cb(ApiError.badRequest('Only JPEG, PNG, WebP or AVIF images are allowed'));
      }
      cb(null, true);
    },
  });

export const uploadImage = imageUpload(1).single('image');
export const uploadProductImages = imageUpload(MAX_PRODUCT_IMAGES).array('images', MAX_PRODUCT_IMAGES);
export const uploadGalleryImages = imageUpload(MAX_GALLERY_BATCH).array('images', MAX_GALLERY_BATCH);
