export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  isAnonymous: boolean;
  isLeaderResponse?: boolean;
  parentId?: string;
  likesCount: number;
  religion: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    email: string;
    role: string;
  };
}

export interface CreateCommentInput {
  postId: string;
  content: string;
  isAnonymous?: boolean;
  isLeaderResponse?: boolean;
  parentId?: string;
}

export interface UpdateCommentInput {
  content?: string;
}
