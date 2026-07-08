export type NotificationType =
  | 'new_order' | 'order_update' | 'new_message' | 'new_review'
  | 'product_approved' | 'product_rejected' | 'payment_received'
  | 'stock_warning' | 'vendor_reply' | 'shipping_update' | 'refund_update';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}
