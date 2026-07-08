export interface Conversation {
  id: string;
  productId?: string;
  buyerId: string;
  vendorId: string;
  subject?: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message;
  productTitle?: string;
  buyerEmail?: string;
  vendorEmail?: string;
  vendorOrganizationName?: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  senderEmail?: string;
}

export interface CreateConversationInput {
  productId?: string;
  vendorId: string;
  subject?: string;
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
}
