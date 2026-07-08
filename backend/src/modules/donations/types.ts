export interface DonationRecipient {
  id: string;
  religion: string;
  name: string;
  description?: string;
  imageUrl?: string;
  bankAccount?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  id: string;
  userId: string;
  recipientId: string;
  amount: number;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDonationRecipientInput {
  name: string;
  religion: string;
  description?: string;
  imageUrl?: string;
  bankAccount?: string;
}

export interface CreateDonationInput {
  recipientId: string;
  amount: number;
  transactionId?: string;
}
