export interface Product {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  stock: number;
  religion?: string;
  isFeatured?: boolean;
  discountPercent?: number;
  discountEndsAt?: string;
  averageRating?: number;
  totalReviews?: number;
  totalSold?: number;
  tags?: string[];
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  shippingAddress: string;
  notes?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface OrderTimeline {
  id: string;
  orderId: string;
  status: string;
  note?: string;
  changedBy?: string;
  createdAt: string;
}

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

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  stock?: number;
  religion?: string;
}

export interface CreateOrderInput {
  shippingAddress: string;
  items: {
    productId: string;
    quantity: number;
  }[];
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
  topProducts: any[];
  revenueByMonth: { month: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
}
