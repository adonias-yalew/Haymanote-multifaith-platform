import { LeaderStatus } from '../../types/index.js';

export interface Leader {
  id: string;
  userId: string;
  licenseNumber: string;
  specialization: string;
  credentials: string;
  status: LeaderStatus;
  bio?: string;
  yearsOfExperience: number;
  verificationDocuments: string[];
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderApplication {
  licenseNumber: string;
  specialization: string;
  credentials: string;
  yearsOfExperience: number;
  bio?: string;
  verificationDocuments?: string[];
}

export interface VerifyLeaderInput {
  status: LeaderStatus;
  rejectionReason?: string;
}
