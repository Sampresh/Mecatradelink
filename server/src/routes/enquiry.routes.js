import { Router } from 'express';
import * as enquiry from '../controllers/enquiry.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';
import { enquiryLimiter } from '../middleware/rateLimit.middleware.js';
import { validate, contactEnquirySchema, quoteEnquirySchema } from '../validators/index.js';

const router = Router();
router.use(enquiryLimiter, optionalAuth);

router.post('/contact', validate({ body: contactEnquirySchema }), enquiry.createContactEnquiry);
router.post('/quote', validate({ body: quoteEnquirySchema }), enquiry.createQuoteEnquiry);

export default router;
