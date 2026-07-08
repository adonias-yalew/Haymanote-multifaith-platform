export enum UserRole {
  USER = 'user',
  LEADER = 'leader',
  VENDOR = 'vendor',
  ADMIN = 'admin',
}

export enum Religion {
  ORTHODOX = 'orthodox',
  MUSLIM = 'muslim',
  PROTESTANT = 'protestant',
}

export enum LeaderStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum PostStatus {
  PUBLISHED = 'PUBLISHED',
  HIDDEN = 'HIDDEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

export enum ReportReason {
  HARASSMENT = 'HARASSMENT',
  HATE_SPEECH = 'HATE_SPEECH',
  MISINFORMATION = 'MISINFORMATION',
  SPAM = 'SPAM',
  SELF_HARM = 'SELF_HARM',
  OTHER = 'OTHER',
}

export enum HelpfulnessBadge {
  NONE = 'NONE',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  religion: Religion;
  isAnonymous: boolean;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

