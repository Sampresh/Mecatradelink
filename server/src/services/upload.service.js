import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { cloudinary, cloudinaryEnabled } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

// The declared MIME type comes from the client, so confirm it against the file's magic bytes.
const SIGNATURE = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
  'image/avif': (b) => b.toString('ascii', 4, 8) === 'ftyp' && /avi[fs]/.test(b.toString('ascii', 8, 12)),
};

const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

/**
 * Every upload is re-encoded to WebP, which strips EXIF/GPS metadata, applies camera
 * rotation and caps decoded size (decompression-bomb guard).
 *  - product: 1200×1200 square, product centred on white, so the catalogue looks uniform
 *  - logo:    fits inside 600×300, transparency kept
 *  - gallery: longest side ≤ 2000px, original aspect ratio kept
 */
const PRESETS = {
  product: (img) =>
    img.resize(1200, 1200, { fit: 'contain', background: WHITE }).flatten({ background: WHITE }).webp({ quality: 82 }),
  logo: (img) => img.resize(600, 300, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 100 }),
  gallery: (img) => img.resize(2000, 2000, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }),
};

async function processImage(file, preset) {
  if (!SIGNATURE[file.mimetype]?.(file.buffer)) throw ApiError.badRequest(`"${file.originalname}" is not a valid image`);
  try {
    const { data, info } = await PRESETS[preset](sharp(file.buffer, { limitInputPixels: 50_000_000 }).rotate())
      .toBuffer({ resolveWithObject: true });
    return { buffer: data, width: info.width, height: info.height };
  } catch {
    throw ApiError.badRequest(`"${file.originalname}" could not be processed. Try a JPEG or PNG under 10 MB.`);
  }
}

/** Processes and stores an uploaded image. Returns { url, publicId, width, height }. */
export async function saveImage(file, { folder, preset }) {
  const { buffer, width, height } = await processImage(file, preset);

  if (cloudinaryEnabled) {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: `${env.CLOUDINARY_FOLDER}/${folder}`, resource_type: 'image', format: 'webp', overwrite: false },
          (err, res) => (err ? reject(err) : resolve(res)),
        )
        .end(buffer);
    });
    return { url: result.secure_url, publicId: result.public_id, width, height };
  }

  // Local disk fallback (dev / Docker volume). Filenames are generated, never taken from the client.
  const name = `${crypto.randomUUID()}.webp`;
  const dir = path.join(UPLOAD_DIR, folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buffer);
  return { url: `${env.SERVER_PUBLIC_URL}/uploads/${folder}/${name}`, publicId: `local:${folder}/${name}`, width, height };
}

export async function deleteImage(publicId) {
  if (!publicId) return;
  if (publicId.startsWith('local:')) {
    const target = path.resolve(UPLOAD_DIR, publicId.slice(6));
    // Path-traversal guard: never touch anything outside the upload directory.
    if (!target.startsWith(UPLOAD_DIR + path.sep)) return;
    await fs.rm(target, { force: true });
    return;
  }
  if (cloudinaryEnabled) await cloudinary.uploader.destroy(publicId).catch(() => {});
}

export const deleteImages = (publicIds) => Promise.all(publicIds.map(deleteImage));
