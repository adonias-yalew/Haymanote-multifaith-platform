import { UserRole } from '../../types/index.js';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserInput {
  email?: string;
  displayName?: string;
  bio?: string;
}
