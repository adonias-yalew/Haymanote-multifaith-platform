export interface User {
  id: string;
  email: string;
  role: 'user' | 'leader' | 'vendor' | 'admin';
  religion: 'orthodox' | 'muslim' | 'protestant';
  isAnonymous: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  viewCount: number;
  leaderResponsesCount: number;
  createdAt: string;
  userId?: string;
  religion: 'orthodox' | 'muslim' | 'protestant';
  status?: 'PUBLISHED' | 'HIDDEN' | 'UNDER_REVIEW';
  imageUrl?: string;
  author?: {
    email: string;
    role: 'user' | 'leader' | 'vendor' | 'admin';
  };
}

export interface Comment {
  id: string;
  content: string;
  isAnonymous: boolean;
  isLeader?: boolean;
  isLeaderResponse?: boolean;
  createdAt: string;
  postId: string;
  parentId?: string;
  userId?: string;
  religion: 'orthodox' | 'muslim' | 'protestant';
  likesCount?: number;
  author?: {
    email: string;
    role: 'user' | 'leader' | 'vendor' | 'admin';
  };
}

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
  religion: 'orthodox' | 'muslim' | 'protestant';
  author?: {
    email: string;
    role: string;
  };
}

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
  religion: 'orthodox' | 'muslim' | 'protestant';
}

export interface Product {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
  religion: 'orthodox' | 'muslim' | 'protestant';
}

export interface Order {
  id: string;
  buyerId: string;
  totalAmount: number;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  items?: {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    productTitle?: string;
    productImageUrl?: string;
  }[];
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'POST' | 'COMMENT' | 'USER' | 'SERMON';
  targetId: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== MARKETPLACE ENHANCEMENTS ====================

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  content?: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
  userEmail?: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product?: Product;
}

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

export interface Notification {
  id: string;
  userId: string;
  type: 'new_order' | 'order_update' | 'new_message' | 'new_review' | 'product_approved' | 'product_rejected' | 'payment_received' | 'stock_warning' | 'vendor_reply' | 'shipping_update' | 'refund_update';
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface OrderTimeline {
  id: string;
  orderId: string;
  status: string;
  note?: string;
  changedBy?: string;
  createdAt: string;
}

export interface VendorDashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalSales: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  activeListings: number;
  averageRating: number;
  totalReviews: number;
  recentOrders: any[];
  topProducts: { id: string; title: string; totalSold: number; revenue: number; stock: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
}

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalSermons: number;
  pendingReports: number;
  leaders?: number;
  vendors?: number;
  products?: number;
}

export interface Leader {
  id: string;
  userId: string;
  licenseNumber: string;
  specialization: string;
  credentials: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  bio?: string;
  yearsOfExperience: number;
  verificationDocuments: string[];
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
  };
}
