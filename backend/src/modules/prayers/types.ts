export interface Prayer {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isPublic: boolean;
  isAnswered: boolean;
  prayedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrayerInput {
  title: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdatePrayerInput {
  title?: string;
  description?: string;
  isPublic?: boolean;
  isAnswered?: boolean;
  prayedCount?: number;
}
