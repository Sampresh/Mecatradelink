// Placeholder product photos (scripts/sample-photos.js) are tagged through their alt text.
// They are removed automatically as soon as a real photo is uploaded for the product.
export const SAMPLE_SUFFIX = ' (sample image)';
export const isSample = (image) => Boolean(image.alt?.endsWith(SAMPLE_SUFFIX));
