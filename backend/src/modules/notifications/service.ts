import { getSupabase } from '../../db/supabaseClient.js';
import { Notification, CreateNotificationInput } from './types.js';

export class NotificationService {
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapNotification);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const supabase = getSupabase();
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw new Error(error.message);
    return count || 0;
  }

  async createNotification(input: CreateNotificationInput): Promise<Notification> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data,
      })
      .select('*')
      .single();

    if (error || !data) throw new Error(error?.message || 'Failed to create notification');
    return this.mapNotification(data);
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const supabase = getSupabase();
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    const supabase = getSupabase();
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);
  }

  async createOrderNotifications(vendorId: string, orderId: string, buyerEmail: string): Promise<void> {
    await this.createNotification({
      userId: vendorId,
      type: 'new_order',
      title: 'New Order Received',
      body: `You have received a new order #${orderId.slice(0, 8)} from ${buyerEmail}`,
      data: { orderId },
    });
  }

  async createOrderUpdateNotification(userId: string, orderId: string, status: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'order_update',
      title: 'Order Update',
      body: `Order #${orderId.slice(0, 8)} is now ${status}`,
      data: { orderId, status },
    });
  }

  async createNewMessageNotification(conversationId: string, recipientId: string, senderEmail: string): Promise<void> {
    await this.createNotification({
      userId: recipientId,
      type: 'new_message',
      title: 'New Message',
      body: `New message from ${senderEmail}`,
      data: { conversationId },
    });
  }

  async createNewReviewNotification(vendorId: string, productTitle: string): Promise<void> {
    await this.createNotification({
      userId: vendorId,
      type: 'new_review',
      title: 'New Product Review',
      body: `Someone reviewed your product "${productTitle}"`,
      data: {},
    });
  }

  async createStockWarningNotification(vendorId: string, productTitle: string, stock: number): Promise<void> {
    await this.createNotification({
      userId: vendorId,
      type: 'stock_warning',
      title: 'Low Stock Warning',
      body: `"${productTitle}" is running low (${stock} left)`,
      data: {},
    });
  }

  private mapNotification(data: Record<string, unknown>): Notification {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      type: data.type as Notification['type'],
      title: data.title as string,
      body: data.body as string | undefined,
      data: data.data as Record<string, unknown> | undefined,
      isRead: data.is_read as boolean,
      readAt: data.read_at as string | undefined,
      createdAt: data.created_at as string,
    };
  }
}

export const notificationService = new NotificationService();
