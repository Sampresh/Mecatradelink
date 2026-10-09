import { Router } from 'express';
import * as auth from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import { requireSameOrigin } from '../middleware/origin.middleware.js';
import {
  validate, registerSchema, loginSchema, emailOnlySchema, tokenSchema, resetPasswordSchema,
} from '../validators/index.js';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), auth.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), auth.login);
router.post('/refresh', requireSameOrigin, auth.refresh);
router.post('/logout', requireSameOrigin, auth.logout);
router.post('/verify-email', authLimiter, validate({ body: tokenSchema }), auth.verifyEmail);
router.post('/resend-verification', authLimiter, validate({ body: emailOnlySchema }), auth.resendVerification);
router.post('/forgot-password', authLimiter, validate({ body: emailOnlySchema }), auth.forgotPassword);
router.post('/reset-password', authLimiter, validate({ body: resetPasswordSchema }), auth.resetPassword);
router.get('/me', verifyToken, auth.me);

export default router;
