import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import contentRoutes from './content.routes.js';
import enquiryRoutes from './enquiry.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/admin', adminRoutes);
router.use('/', contentRoutes);

export default router;
