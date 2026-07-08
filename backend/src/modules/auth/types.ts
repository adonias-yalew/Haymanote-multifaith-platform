import { UserRole } from '../../types/index.js';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  religion: string;
  isAnonymous: boolean;
  emailVerified?: boolean;
  verificationToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  role?: UserRole;
  isAnonymous?: boolean;
  religion?: string;
  organizationName?: string;
  documentPath?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  isAnonymous: boolean;
}
