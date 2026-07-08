import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { JwtPayload, UserRole, Religion } from '../types/index.js';

export const generateToken = (
  userId: string,
  email: string,
  role: UserRole,
  religion: Religion,
  isAnonymous: boolean = false
): string => {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    userId,
    email,
    role,
    religion,
    isAnonymous,
  };
  
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
};
