import { Router } from 'express';
import * as authController from '../../controllers/authController';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import { authLimiter, otpLimiter } from '../../middlewares/rateLimiter';
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateSecuritySettingsSchema,
} from '../../validators/auth.validator';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/verify-otp', otpLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', otpLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.get('/me', authenticate, authController.getMe);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.get('/security-settings', authenticate, authController.getSecuritySettings);
router.patch('/security-settings', authenticate, validate(updateSecuritySettingsSchema), authController.updateSecuritySettings);
router.get('/sessions', authenticate, authController.getSessions);
router.delete('/sessions/:id', authenticate, authController.revokeSession);
router.post('/sessions/revoke-others', authenticate, authController.revokeOtherSessions);
router.delete('/me', authenticate, authController.deleteMyAccount);

export default router;
