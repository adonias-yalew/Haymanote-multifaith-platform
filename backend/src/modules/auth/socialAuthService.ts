import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import { UserRole } from '../../types/index.js';
import { authService } from './service.js';

interface GoogleTokenPayload {
  email: string;
  name?: string;
  picture?: string;
}

export class SocialAuthService {
  private googleClient: OAuth2Client;
  private otpStore: Map<string, { code: string; expiry: number; email: string }> = new Map();

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    this.googleClient = new OAuth2Client(clientId, clientSecret, process.env.GOOGLE_CALLBACK_URL);
  }

  // Generate verification code for phone signup
  generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Store OTP temporarily (5 minutes expiry)
  storeOTP(phone: string, email: string): string {
    const code = this.generateOTP();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    this.otpStore.set(phone, { code, expiry, email });
    return code;
  }

  // Verify OTP
  verifyOTP(phone: string, code: string): { valid: boolean; email?: string } {
    const otpData = this.otpStore.get(phone);
    
    if (!otpData) {
      return { valid: false };
    }

    if (Date.now() > otpData.expiry) {
      this.otpStore.delete(phone);
      return { valid: false };
    }

    if (otpData.code !== code) {
      return { valid: false };
    }

    const email = otpData.email;
    this.otpStore.delete(phone);
    return { valid: true, email };
  }

  // Verify Google ID token
  async verifyGoogleToken(token: string): Promise<GoogleTokenPayload | null> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) return null;

      return {
        email: payload.email || '',
        name: payload.name,
        picture: payload.picture,
      };
    } catch (error) {
      console.error('Google token verification failed:', error);
      return null;
    }
  }

  // Handle Google signup
  async handleGoogleSignup(
    googleToken: string,
    religion: string,
    isAnonymous: boolean
  ) {
    const payload = await this.verifyGoogleToken(googleToken);
    
    if (!payload) {
      throw new Error('Invalid Google token');
    }

    // Check if user already exists
    const existingUser = await authService.getUserByEmail(payload.email);
    if (existingUser) {
      // If user exists, generate token
      const token = authService.generateJWT(existingUser);
      return {
        user: existingUser,
        token,
        isNewUser: false,
      };
    }

    // Create new user from Google data
    const result = await authService.register({
      email: payload.email,
      password: crypto.randomBytes(32).toString('hex'), // Random password for OAuth users
      role: UserRole.USER,
      religion,
      isAnonymous,
    });

    return {
      ...result,
      isNewUser: true,
    };
  }

  // Generate OTP for phone signup
  async requestPhoneOTP(phoneNumber: string, email: string): Promise<{ success: boolean; message: string }> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      throw new Error('Invalid phone number format');
    }

    const code = this.storeOTP(phoneNumber, email);

    // In production, integrate with SMS provider (Twilio, Firebase, Nexmo)
    // For now, we log the OTP (remove in production)
    console.log(`[DEVELOPMENT] OTP for ${phoneNumber}: ${code}`);

    return {
      success: true,
      message: `OTP sent to ${phoneNumber}. Please check your SMS.`,
    };
  }

  // Verify OTP and signup
  async verifyPhoneOTPAndSignup(
    phoneNumber: string,
    otpCode: string,
    religion: string,
    isAnonymous: boolean
  ) {
    const verification = this.verifyOTP(phoneNumber, otpCode);
    
    if (!verification.valid || !verification.email) {
      throw new Error('Invalid or expired OTP');
    }

    // Check if user already exists
    const existingUser = await authService.getUserByEmail(verification.email);
    if (existingUser) {
      // If user exists, generate token
      const token = authService.generateJWT(existingUser);
      return {
        user: existingUser,
        token,
        isNewUser: false,
      };
    }

    // Create new user from phone signup
    const result = await authService.register({
      email: verification.email,
      password: crypto.randomBytes(32).toString('hex'), // Random password for phone auth users
      role: UserRole.USER,
      religion,
      isAnonymous,
    });

    return {
      ...result,
      isNewUser: true,
    };
  }
}

export const socialAuthService = new SocialAuthService();
