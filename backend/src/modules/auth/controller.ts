import { Request, Response } from 'express';
import { authService } from './service.js';
import { socialAuthService } from './socialAuthService.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, role, isAnonymous, religion, organizationName } = req.body;
    const file = (req as any).file;

    const result = await authService.register({
      email,
      password,
      role,
      isAnonymous,
      religion,
      organizationName,
      documentPath: file?.path
    });
    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully.',
    });
  });
  
  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  });
  
  getMe = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId;
    const user = await authService.getUserById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }
    
    res.json({
      success: true,
      data: { user },
    });
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token, email } = req.body;

    if (!token || !email) {
      res.status(400).json({
        success: false,
        error: 'Token and email are required',
      });
      return;
    }

    const result = await authService.verifyEmail(token, email);

    if (!result) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired verification code',
      });
      return;
    }

    res.json({
      success: true,
      data: result,
      message: 'Email verified successfully',
    });
  });

  resendVerificationEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email is required',
      });
      return;
    }

    await authService.resendVerificationEmail(email);

    res.json({
      success: true,
      message: 'Verification email sent successfully',
    });
  });

  checkVerificationStatus = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Email query parameter is required',
      });
      return;
    }

    const isVerified = await authService.checkVerificationStatus(email);

    res.json({
      success: true,
      data: { isVerified },
    });
  });

  // Google OAuth signup
  googleSignup = asyncHandler(async (req: Request, res: Response) => {
    const { googleToken, religion, isAnonymous } = req.body;

    if (!googleToken || !religion) {
      res.status(400).json({
        success: false,
        error: 'Google token and religion are required',
      });
      return;
    }

    const result = await socialAuthService.handleGoogleSignup(googleToken, religion, isAnonymous || false);
    
    res.status(result.isNewUser ? 201 : 200).json({
      success: true,
      data: result,
      message: result.isNewUser 
        ? 'Google account created successfully' 
        : 'Logged in with Google',
    });
  });

  // Request phone OTP
  requestPhoneOTP = asyncHandler(async (req: Request, res: Response) => {
    const { phoneNumber, email } = req.body;

    if (!phoneNumber || !email) {
      res.status(400).json({
        success: false,
        error: 'Phone number and email are required',
      });
      return;
    }

    const result = await socialAuthService.requestPhoneOTP(phoneNumber, email);
    
    res.json({
      success: true,
      data: result,
    });
  });

  // Verify phone OTP and signup
  verifyPhoneOTPAndSignup = asyncHandler(async (req: Request, res: Response) => {
    const { phoneNumber, otpCode, religion, isAnonymous } = req.body;

    if (!phoneNumber || !otpCode || !religion) {
      res.status(400).json({
        success: false,
        error: 'Phone number, OTP code, and religion are required',
      });
      return;
    }

    const result = await socialAuthService.verifyPhoneOTPAndSignup(
      phoneNumber,
      otpCode,
      religion,
      isAnonymous || false
    );

    res.status(result.isNewUser ? 201 : 200).json({
      success: true,
      data: result,
      message: result.isNewUser 
        ? 'Phone account created successfully' 
        : 'Logged in with phone',
    });
  });
}

export const authController = new AuthController();
