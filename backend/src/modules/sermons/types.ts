export interface Sermon {
  id: string;
  authorId: string;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  published: boolean;
  viewCount: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  religion: string;
  author?: {
    email: string;
    role: string;
  };
}

export interface CreateSermonInput {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  published?: boolean;
}

export interface UpdateSermonInput {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  published?: boolean;
}
