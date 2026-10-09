import { prisma } from '../config/db.js';
import { stripTags } from '../lib/sanitize.js';
import { sendEnquiryNotification, sendEnquiryAcknowledgement } from '../services/email.service.js';
import { ApiError } from '../utils/ApiError.js';
import { created } from '../utils/ApiResponse.js';

const contactFields = (body) => ({
  name: stripTags(body.name),
  email: body.email || null,
  phone: body.phone || null,
  company: body.company ? stripTags(body.company) : null,
  location: body.location ? stripTags(body.location) : null,
  message: body.message ? stripTags(body.message) : null,
});

async function finish(res, enquiry) {
  // Fire-and-forget so a slow SMTP server does not delay the response.
  Promise.allSettled([sendEnquiryNotification(enquiry), sendEnquiryAcknowledgement(enquiry)]);
  created(res, { id: enquiry.id }, 'Thank you! Our team will contact you shortly.');
}

export async function createContactEnquiry(req, res) {
  const enquiry = await prisma.enquiry.create({
    data: { type: 'CONTACT', ...contactFields(req.body), userId: req.user?.id ?? null },
  });
  await finish(res, enquiry);
}

export async function createQuoteEnquiry(req, res) {
  // Merge duplicate lines and resolve product names/units server-side.
  const quantities = new Map();
  for (const { productId, quantity } of req.body.items) {
    quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
  }
  const products = await prisma.product.findMany({
    where: { id: { in: [...quantities.keys()] }, isActive: true },
    select: { id: true, name: true, unit: true },
  });
  if (products.length !== quantities.size) throw ApiError.badRequest('One or more products are no longer available');

  const enquiry = await prisma.enquiry.create({
    data: {
      type: 'QUOTE',
      ...contactFields(req.body),
      userId: req.user?.id ?? null,
      items: {
        create: products.map((p) => ({ productId: p.id, productName: p.name, unit: p.unit, quantity: quantities.get(p.id) })),
      },
    },
    include: { items: true },
  });
  await finish(res, enquiry);
}
