import { Router } from 'express';
import { createLimiter } from '../lib/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { registerSchema, loginSchema, profileSchema, changePasswordSchema, googleSignInSchema } from '../validators/auth.schema.js';
import * as auth from '../controllers/auth.controller.js';

// Chống dò mật khẩu: tối đa 10 lần / 15 phút / IP cho đăng nhập & đăng ký
const authLimiter = createLimiter({
  name: 'auth',
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: 'Bạn thao tác quá nhiều lần. Vui lòng thử lại sau 15 phút.',
});

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), auth.register);
router.post('/login', authLimiter, validate(loginSchema), auth.login);
router.get('/providers', auth.providers);
router.post('/google', authLimiter, validate(googleSignInSchema), auth.googleSignIn);
router.post('/refresh', auth.refresh);
router.post('/logout', auth.logout);
router.get('/me', requireAuth, auth.me);
router.patch('/me', requireAuth, validate(profileSchema), auth.updateMe);
router.post('/change-password', authLimiter, requireAuth, validate(changePasswordSchema), auth.changeMyPassword);

export default router;
