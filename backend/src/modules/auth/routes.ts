import { Router } from 'express';
import { authController } from './controller.js';
import { authMiddleware } from '../../middleware/auth.js';
import { upload } from '../../middleware/multerConfig.js';

const router = Router();

router.post('/register', upload.single('document'), authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);

// Email verification endpoints
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);
router.get('/verification-status', authController.checkVerificationStatus);

// Social auth endpoints
router.post('/google-signup', authController.googleSignup);
router.post('/phone-otp', authController.requestPhoneOTP);
router.post('/verify-phone-otp', authController.verifyPhoneOTPAndSignup);

export default router;
