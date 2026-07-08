import { PostStatus } from '../../types/index.js';

export interface Post {
  id: string;
  authorId: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  status: PostStatus;
  tags: string[];
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  leaderResponsesCount: number;
  moderationReason?: string;
  imageUrl?: string;
  religion: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  title?: string;
  content?: string;
  isAnonymous?: boolean;
  tags?: string[];
  imageUrl?: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  status?: PostStatus;
  tags?: string[];
  imageUrl?: string;
}
