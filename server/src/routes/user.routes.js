import { Router } from 'express';
import * as user from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireOwnership } from '../middleware/ownership.middleware.js';
import { validate, updateProfileSchema, changePasswordSchema, enquiryQuerySchema, idParam } from '../validators/index.js';

const router = Router();
router.use(verifyToken);

router.patch('/me', validate({ body: updateProfileSchema }), user.updateProfile);
router.post('/me/password', validate({ body: changePasswordSchema }), user.changePassword);
router.get('/me/enquiries', validate({ query: enquiryQuerySchema }), user.myEnquiries);
router.get('/me/enquiries/:id', validate({ params: idParam }), requireOwnership('enquiry'), user.myEnquiry);

export default router;
