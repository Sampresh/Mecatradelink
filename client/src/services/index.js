import { api } from './api';
import { STATIC_MODE } from '@/lib/mode';
import { buildEnquiry } from '@/lib/staticEnquiry';

const data = (res) => res.data.data;
const files = (field, list) => {
  const form = new FormData();
  for (const f of list) form.append(field, f);
  return form;
};
const page = (res) => ({ items: res.data.data, meta: res.data.meta });

// ── Auth ─────────────────────────────────────────────────────
export const authService = {
  register: (body) => api.post('/auth/register', body).then((r) => r.data),
  login: (body) => api.post('/auth/login', body).then(data),
  logout: () => api.post('/auth/logout'),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }).then((r) => r.data),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }).then((r) => r.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (body) => api.post('/auth/reset-password', body).then((r) => r.data),
};

// ── Account ──────────────────────────────────────────────────
export const userService = {
  updateProfile: (body) => api.patch('/users/me', body).then(data),
  changePassword: (body) => api.post('/users/me/password', body).then((r) => r.data),  // { data: { accessToken, user } }
  myEnquiries: (params) => api.get('/users/me/enquiries', { params }).then(page),
  myEnquiry: (id) => api.get(`/users/me/enquiries/${id}`).then(data),
};

// ── Catalogue (public) ───────────────────────────────────────
export const catalogService = {
  categories: () => api.get('/categories').then(data),
  brands: () => api.get('/brands').then(data),
  products: (params) => api.get('/products', { params }).then(page),
};

// ── Enquiries ────────────────────────────────────────────────
// In showcase mode there is no API: the enquiry becomes a WhatsApp/email message instead.
// `lines` (product names/quantities) are only needed for that message.
export const enquiryService = {
  contact: (body) =>
    STATIC_MODE ? Promise.resolve(buildEnquiry({ kind: 'contact', ...body })) : api.post('/enquiries/contact', body).then((r) => r.data),
  quote: (body, { lines } = {}) =>
    STATIC_MODE ? Promise.resolve(buildEnquiry({ kind: 'quote', ...body, lines })) : api.post('/enquiries/quote', body).then((r) => r.data),
};

// ── Admin ────────────────────────────────────────────────────
export const adminService = {
  stats: () => api.get('/admin/stats').then(data),

  createCategory: (body) => api.post('/admin/categories', body).then(data),
  updateCategory: (id, body) => api.put(`/admin/categories/${id}`, body).then(data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  products: (params) => api.get('/admin/products', { params }).then(page),
  product: (id) => api.get(`/admin/products/${id}`).then(data),
  createProduct: (body) => api.post('/admin/products', body).then(data),
  updateProduct: (id, body) => api.patch(`/admin/products/${id}`, body).then(data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  // Product photos (each call returns the updated product with its ordered images)
  addProductImages: (id, list) => api.post(`/admin/products/${id}/images`, files('images', list)).then(data),
  replaceProductImage: (id, imageId, file) => api.put(`/admin/products/${id}/images/${imageId}`, files('image', [file])).then(data),
  updateProductImage: (id, imageId, body) => api.patch(`/admin/products/${id}/images/${imageId}`, body).then(data),
  reorderProductImages: (id, ids) => api.put(`/admin/products/${id}/images/order`, { ids }).then(data),
  deleteProductImage: (id, imageId) => api.delete(`/admin/products/${id}/images/${imageId}`).then(data),

  brands: () => api.get('/admin/brands').then(data),
  createBrand: (body) => api.post('/admin/brands', body).then(data),
  updateBrand: (id, body) => api.put(`/admin/brands/${id}`, body).then(data),
  deleteBrand: (id) => api.delete(`/admin/brands/${id}`),
  uploadBrandLogo: (id, file) => api.post(`/admin/brands/${id}/logo`, files('image', [file])).then(data),
  deleteBrandLogo: (id) => api.delete(`/admin/brands/${id}/logo`).then(data),

  gallery: (params) => api.get('/admin/gallery', { params }).then(data),
  addGalleryImages: (list, { category, caption }) => {
    const form = files('images', list);
    form.append('category', category);
    if (caption) form.append('caption', caption);
    return api.post('/admin/gallery', form, { timeout: 120_000 }).then((r) => r.data);
  },
  updateGalleryImage: (id, body) => api.patch(`/admin/gallery/${id}`, body).then(data),
  replaceGalleryImage: (id, file) => api.put(`/admin/gallery/${id}/image`, files('image', [file])).then(data),
  reorderGallery: (ids) => api.put('/admin/gallery/order', { ids }).then((r) => r.data),
  deleteGalleryImage: (id) => api.delete(`/admin/gallery/${id}`),

  enquiries: (params) => api.get('/admin/enquiries', { params }).then(page),
  enquiry: (id) => api.get(`/admin/enquiries/${id}`).then(data),
  updateEnquiry: (id, body) => api.patch(`/admin/enquiries/${id}`, body).then(data),
  deleteEnquiry: (id) => api.delete(`/admin/enquiries/${id}`),
};
